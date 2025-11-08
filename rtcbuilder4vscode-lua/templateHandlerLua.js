const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const nunjucks = require('nunjucks');

const { getWidget,
        getStep,
        getIDLFilesForIDLCMake,
        checkDefault,
        getIncludedIdlPathes,
        getIdlFileNoExt,
        getFileName,
        getFilenameNoExt,
        getTmplVarName,
        getTmplVarNameSI,
        getDataportInitMethodName,
        convConfigSetType,
        convDefaultVal,
        getInterfaceBasename,
        convertServiceInterfaceName,
        convFormat,
        convCORBA2LuaArg,
        selectInParamName,
        selectOutParamName } = require("./templates/templateHelperLua");

const { generateLua } = require("./templates/luaGenerateManager");
const { generateCMake } = require("./templates/luaCmakeGenerateManager");

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

  setHelperFunction(env);

  const genParam = { rtcParam: param,
                     allIdlFileParam: allIdlFileParams,
                   };

  let result = [];
  result.push(...generateCMake(env, genParam));
  result.push(...generateLua(env, genParam));

  return result;
}

function setHelperFunction(env) {
  env.addGlobal('getWidget', getWidget);
  env.addGlobal('getStep', getStep);
  env.addGlobal('getIDLFilesForIDLCMake', getIDLFilesForIDLCMake);
  env.addGlobal('getIdlFileNoExt', getIdlFileNoExt);
  env.addGlobal('getFileName', getFileName);
  env.addGlobal('getFilenameNoExt', getFilenameNoExt);
  env.addGlobal('getTmplVarName', getTmplVarName);
  env.addGlobal('getTmplVarNameSI', getTmplVarNameSI);
  env.addGlobal('getDataportInitMethodName', getDataportInitMethodName);
  env.addGlobal('convConfigSetType', convConfigSetType);
  env.addGlobal('convDefaultVal', convDefaultVal);
  env.addGlobal('getInterfaceBasename', getInterfaceBasename);
  env.addGlobal('convertServiceInterfaceName', convertServiceInterfaceName);
  env.addGlobal('convFormat', convFormat);
  env.addGlobal('convCORBA2LuaArg', convCORBA2LuaArg);
  env.addGlobal('selectInParamName', selectInParamName);
  env.addGlobal('selectOutParamName', selectOutParamName);
}

module.exports = {
  generateCode
};
