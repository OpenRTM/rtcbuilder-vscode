const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const nunjucks = require('nunjucks');

const { getWidget,
        getStep,
        checkUserDefined,
        getIDLFilesForIDLCMake,
        getPortTypes,
        getDataportPackageName,
        useReturnCode,
        notNullRTMRoot,
        getConnectorString,
        getFilenameNoExt,
        getFileName,
        getTmplVarName,
        getTmplVarNameSI,
        getDataTypeName,
        getParamTypes,
        convJava2ParamHolder,
        getInterfaceBasename,
        isModule,
        convFormat,
        getInterfaceRawType,
        convCORBA2Java,
        convCORBA2JavaforArg,
        convCORBA2JavaNoDef,
        convCORBA2JavaforArgCmt,
        isRetNumber,
        isRetBoolean,
        getServiceName,
        getServiceNamePath } = require("./templates/templateHelperProcessing");

const { generateProcessing } = require("./templates/processingGenerateManager");
const { generateCMake } = require("./templates/processingCmakeGenerateManager");

async function generateCode(param) {
  const templateDir = path.join(__dirname, '');
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(templateDir),
    { autoescape: false }
  );

  try {
    const rootPath = path.join(process.env.RTM_JAVA_ROOT || "", "jar");
    const targetFiles = fs.existsSync(rootPath) ? fs.readdirSync(rootPath) : null;

    let lastDate = 0;
    let targetJar = null;

    if (!targetFiles) {
      param.rtm_java_version = '1.1.0';
    } else {
      for (const fileName of targetFiles) {
        if (fileName.startsWith("OpenRTM-aist")) {
          const filePath = path.join(rootPath, fileName);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs > lastDate) {
            lastDate = stats.mtimeMs;
            targetJar = fileName;
          }
        }
      }

      if (targetJar) {
        const javaVersion = targetJar.substring(13, 18);  // "OpenRTM-aist" は13文字
        param.rtm_java_version = javaVersion;
      } else {
        param.rtm_java_version = '1.1.0';
      }
    }
  } catch (err) {
    param.rtm_java_version = '1.1.0';
  }

  setHelperFunction(env);

  const genParam = { rtcParam: param,
                   };

  let defaultPath = process.env.RTM_ROOT;
  if(defaultPath !== undefined) {
    defaultPath = defaultPath.replaceAll("\\", "/");
    genParam['javaRoot'] = defaultPath;
  }

  let result = [];
  result.push(...generateCMake(env, genParam));
  result.push(...generateProcessing(env, genParam));

  return result;
}

function setHelperFunction(env) {
  env.addGlobal('getWidget', getWidget);
  env.addGlobal('getStep', getStep);
  env.addGlobal('checkUserDefined', checkUserDefined);
  env.addGlobal('getIDLFilesForIDLCMake', getIDLFilesForIDLCMake);
  env.addGlobal('getPortTypes', getPortTypes);
  env.addGlobal('getDataportPackageName', getDataportPackageName);
  env.addGlobal('useReturnCode', useReturnCode);
  env.addGlobal('notNullRTMRoot', notNullRTMRoot);
  env.addGlobal('getConnectorString', getConnectorString);
  env.addGlobal('getFilenameNoExt', getFilenameNoExt);
  env.addGlobal('getFileName', getFileName);
  env.addGlobal('getTmplVarName', getTmplVarName);
  env.addGlobal('getTmplVarNameSI', getTmplVarNameSI);
  env.addGlobal('getDataTypeName', getDataTypeName);
  env.addGlobal('getParamTypes', getParamTypes);
  env.addGlobal('convJava2ParamHolder', convJava2ParamHolder);
  env.addGlobal('getInterfaceBasename', getInterfaceBasename);
  env.addGlobal('isModule', isModule);
  env.addGlobal('convFormat', convFormat);
  env.addGlobal('getInterfaceRawType', getInterfaceRawType);
  env.addGlobal('convCORBA2Java', convCORBA2Java);
  env.addGlobal('convCORBA2JavaforArg', convCORBA2JavaforArg);
  env.addGlobal('convCORBA2JavaNoDef', convCORBA2JavaNoDef);
  env.addGlobal('convCORBA2JavaforArgCmt', convCORBA2JavaforArgCmt);
  env.addGlobal('isRetNumber', isRetNumber);
  env.addGlobal('isRetBoolean', isRetBoolean);
  env.addGlobal('getServiceName', getServiceName);
  env.addGlobal('getServiceNamePath', getServiceNamePath);
}

module.exports = {
  generateCode
};
