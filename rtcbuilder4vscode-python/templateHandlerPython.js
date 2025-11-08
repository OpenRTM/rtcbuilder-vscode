const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const nunjucks = require('nunjucks');

const { getWidget,
        getStep,
        checkUserDefined,
        getIDLFiles,
        getConnectorString,
        getFileName,
        getFilenameNoExt,
        hasDataPortType,
        convModuleName,
        convModuleNameAll,
        getTmplVarName,
        getTmplVarNameSI,
        getDataportInitMethodName,
        getInterfaceBasename,
        getBasename,
        convFormat,
        convFullName,
        convDefaultVal,
        checkDefault,
        getDataPortTypes,
        getIncludedIdlPathes,
        getIdlFileNoExt,
        getModuleName,
        convCORBA2PythonArg,
        selectInParamName,
        selectOutParamName } = require("./templates/templateHelperPy");

const { generatePython } = require("./templates/pythonGenerateManager");
const { generateCMake } = require("./templates/pythonCmakeGenerateManager");

async function generateCode(param) {
  const templateDir = path.join(__dirname, '');
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(templateDir),
    { autoescape: false }
  );

  const allIdlFileParams = [];
  for(const target of param.providerIdlPathes) {
    if(checkDefault(target.idlPath, param)) continue;
    allIdlFileParams.push(target);
  }
  for(const target of param.consumerIdlPathes) {
    if(checkDefault(target.idlPath, param)) continue;
    allIdlFileParams.push(target);
  }

  const allIdlFileParamsForBuild = [];
  allIdlFileParamsForBuild.push(...allIdlFileParams);
  for(const target of getIncludedIdlPathes(param)) {
    if(checkDefault(target.idlPath, param)) continue;
    allIdlFileParamsForBuild.push(target);
  }

  // IDLファイル内に記述されているServiceClassParamを設定する
  for (const idlFileParam of allIdlFileParams) {
    for (const serviceClassParam of param.serviceClassParams) {
      if (idlFileParam.idlPath === serviceClassParam.idlPath){
        if (idlFileParam.serviceClass.includes(serviceClassParam) == false){
          idlFileParam.serviceClass.push(serviceClassParam);
        }
      }
    }
  }

  const allFileParams = [];
  allFileParams.push(...param.providerIdlPathes);
  allFileParams.push(...param.consumerIdlPathes);
  const moduleList = checkDefaultModule(allFileParams, true, param);
  const testModuleList = checkDefaultModule(allFileParams, false, param);

  setHelperFunction(env);

  const genParam = { rtcParam: param,
                     allIdlFileParam: allIdlFileParams,
                     allIdlFileParamBuild: allIdlFileParamsForBuild,
                     defaultModule: moduleList,
                     defaultTestModule: testModuleList
                   };

  let result = [];
  result.push(...generateCMake(env, genParam));
  result.push(...generatePython(env, genParam));

  return result;
}

function setHelperFunction(env) {
  env.addGlobal('getWidget', getWidget);
  env.addGlobal('getStep', getStep);
  env.addGlobal('checkUserDefined', checkUserDefined);
  env.addGlobal('getIDLFiles', getIDLFiles);
  env.addGlobal('getConnectorString', getConnectorString);
  env.addGlobal('getFileName', getFileName);
  env.addGlobal('getFilenameNoExt', getFilenameNoExt);
  env.addGlobal('hasDataPortType', hasDataPortType);
  env.addGlobal('convModuleName', convModuleName);
  env.addGlobal('convModuleNameAll', convModuleNameAll);
  env.addGlobal('getTmplVarName', getTmplVarName);
  env.addGlobal('getTmplVarNameSI', getTmplVarNameSI);
  env.addGlobal('getDataportInitMethodName', getDataportInitMethodName);
  env.addGlobal('getInterfaceBasename', getInterfaceBasename);
  env.addGlobal('getBasename', getBasename);
  env.addGlobal('convFormat', convFormat);
  env.addGlobal('convFullName', convFullName);
  env.addGlobal('convDefaultVal', convDefaultVal);
  env.addGlobal('getDataPortTypes', getDataPortTypes);
  env.addGlobal('getIdlFileNoExt', getIdlFileNoExt);
  env.addGlobal('getModuleName', getModuleName);
  env.addGlobal('convCORBA2PythonArg', convCORBA2PythonArg);
  env.addGlobal('selectInParamName', selectInParamName);
  env.addGlobal('selectOutParamName', selectOutParamName);
}

function checkDefaultModule(targetFiles, isProvided, param) {
  const result = [];
  const check = ['RTC', 'OpenRTM_aist'];
  const typeList = param.dataTypeParams;

  for (const target of targetFiles) {
    if (checkDefault(target.idlPath, param) == false) continue;

    if (target.isDataPort) {
      for (const targetTypeStr of target.targetTypes) {
        if (targetTypeStr.includes('::')) {
          const parts = targetTypeStr.split('::');
          const targetType = parts[0];
          if (!check.includes(targetType)) {
            check.push(targetType);
            result.push(targetType);
          }
        }
      }
    } else {
      const serviceClasses = isProvided
        ? target.testServiceClass
        : target.serviceClass;

      for (const targetService of serviceClasses) {
        let targetType = targetService.module.replace(/::/g, '');
        if (!check.includes(targetType)) {
          check.push(targetType);
          result.push(targetType);
        }
      }
    }
  }

  return result;
}

module.exports = {
  generateCode
};
