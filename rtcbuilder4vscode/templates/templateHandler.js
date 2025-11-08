const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const nunjucks = require('nunjucks');

const { RtcParam, ServiceClassParam } = require("./../model/dataModels");
const { GeneratedResult } = require("./../model/dataModels");
const { parseDataTypes, parseServices, parse, getDataTypesDef } = require('./../parser/IDLHandler');

const { checkNotWidget,
        getWidget,
        getStep,
        checkNotConstraint, 
        getFileName,
        getFilenameNoExt,
        getIdlFileNoExt,
        getBasename,
        convertDelimiter,
        getIDLFilesForIDLCMake,
        getIncludeIdlParams,
        checkComment,
        checkWithoutDefaultPathes,
        getConnectorString,
        convConfigSetType,
        getTmplVarName,
        getTmplVarNameSI,
        convCpp2CORBA,
        convCpp2CORBAforArg,
        checkMethodRet } = require("./templateHelper");

const { generateCommon } = require("./commonGenerateManager");
const { generateCxx } = require("./cxxGenerateManager");
const { generateCMake } = require("./cmakeGenerateManager");

async function generateCode(project_dir, param, context, extensions) {
  const templateDir = path.join(__dirname, '');
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(templateDir),
    { autoescape: false }
  );
  setHelperFunction(env);

  let rtcParam = param;
  Object.setPrototypeOf(rtcParam, RtcParam.prototype);
  const dataTypes = parseDataTypes(project_dir);
  rtcParam.dataTypeParams = dataTypes.dateTypeList;
  rtcParam.idlSearchPathList = dataTypes.idlSearchPathList;

  const serviceList = parseServices(project_dir);
  rtcParam.serviceClassParams = serviceList.serviceList;

  const dataDefList = getDataTypesDef(project_dir);
  rtcParam.dataDefParams = dataDefList.dateTypeList;

  const { ret, msg } = validateDataPortType(rtcParam);
  if(!ret) {
    throw new Error(msg);
  }

  setPrefixSuffix(rtcParam);
  /////
  try {
    validateIDLDef(rtcParam)
  } catch (e) {
    const msgs = [];
    msgs.push(vscode.l10n.t('Warning: Included IDL [') + e.message + vscode.l10n.t('] not found.'));
    msgs.push(vscode.l10n.t('The generated file might be incomplete.'));
    msgs.push(vscode.l10n.t('It can be solved by adding the include directives.'));
    msgs.push(vscode.l10n.t('Continue? (OK/Cancel)'));

    const selection = await vscode.window.showInformationMessage(
      msgs.join('\n'),
      { modal: true },
      'OK'
    );

    if(selection != 'OK') return;
  }

  /////
  rtcParam.checkAndSetParameter();
  rtcParam.resetIDLServiceClass();
  const checkTarget = [];
  for (const idl of rtcParam.providerIdlPathes) {
    checkTarget.push(...idl.serviceClass);
  }

  checkSuperInterface(checkTarget, rtcParam);
  rtcParam.idlPathes.length = 0;
  rtcParam.idlPathes.push(...rtcParam.idlSearchPathList);
  /////
  let result = [];
  result.push(...generateCommon(env, { rtcParam: rtcParam }));
  if(rtcParam.language === 'C++') {
    result.push(...generateCxx(env, { rtcParam: rtcParam }));
    result.push(...generateCMake(env, { rtcParam: rtcParam }));
  } else {
    const targetExt = extensions.filter(item => item.languageInfo === rtcParam.language);
    if(targetExt.length === 0) {
      throw new Error('The target language extension is NOT installed.');
    }
    const resultEach = await targetExt[0].generateTemplateCode(rtcParam, RtcParam.prototype);
    result.push(...resultEach);
  }
  return result;
}

function validateDataPortType(rtcParam) {
    for(const dp of rtcParam.inports) {
        if( rtcParam.dataTypeParams.some(dt => dt.definedTypes.includes(dp.type)) == false) {
            return { ret: false, msg: vscode.l10n.t('The specified data type is invalid.') + '\nDataInPort : ' + dp.name + ' [' + dp.type + ']'};
        }
    }

    for(const dp of rtcParam.outports) {
        if( rtcParam.dataTypeParams.some(dt => dt.definedTypes.includes(dp.type)) == false) {
            return { ret: false, msg: vscode.l10n.t('The specified data type is invalid.') + '\nDataOutPort : ' + dp.name + ' [' + dp.type + ']'};
        }
    }

    return { ret: true, msg: '' };
}


function setHelperFunction(env) {
  env.addGlobal('checkNotWidget', checkNotWidget);
  env.addGlobal('getWidget', getWidget);
  env.addGlobal('getStep', getStep);
  env.addGlobal('checkNotConstraint', checkNotConstraint);
  env.addGlobal('getFileName', getFileName);
  env.addGlobal('getFilenameNoExt', getFilenameNoExt);
  env.addGlobal('getIdlFileNoExt', getIdlFileNoExt);
  env.addGlobal('getBasename', getBasename);
  env.addGlobal('convertDelimiter', convertDelimiter);
  env.addGlobal('getIDLFilesForIDLCMake', getIDLFilesForIDLCMake);
  env.addGlobal('getIncludeIdlParams', getIncludeIdlParams);
  env.addGlobal('chkCmnt', checkComment);
  env.addGlobal('checkWithoutDefaultPathes', checkWithoutDefaultPathes);
  env.addGlobal('getConnectorString', getConnectorString);
  env.addGlobal('convConfigSetType', convConfigSetType);
  env.addGlobal('getTmplVarName', getTmplVarName);
  env.addGlobal('getTmplVarNameSI', getTmplVarNameSI);
  env.addGlobal('convCpp2CORBA', convCpp2CORBA);
  env.addGlobal('convCpp2CORBAforArg', convCpp2CORBAforArg);
  env.addGlobal('checkMethodRet', checkMethodRet);
}

function setPrefixSuffix(rtcParam) {
  const config = vscode.workspace.getConfiguration('rtcbuilder4vscode');

  rtcParam.commonPrefix = config.get('basic_prefix');
  rtcParam.commonSuffix = config.get('basic_suffix');
  rtcParam.dataPortPrefix = config.get('dataport_prefix');
  rtcParam.dataPortSuffix = config.get('dataport_suffix');
  rtcParam.servicePortPrefix = config.get('serviceport_prefix');
  rtcParam.servicePortSuffix = config.get('serviceport_suffix');
  rtcParam.serviceIFPrefix = config.get('serviceif_prefix');
  rtcParam.serviceIFSuffix = config.get('serviceif_suffix');
  rtcParam.configurationPrefix = config.get('config_prefix');
  rtcParam.configurationSuffix = config.get('config_suffix');
}

function validateIDLDef(rtcParam) {
  const idlDirs = rtcParam.idlSearchPathList;

  const checkedIDL = [];
  const dummy = [];

  for(const sp of rtcParam.serviceports) {
    for(const si of sp.serviceinterfaces) {
      const targetIDL = si.idlfile;
      if(checkedIDL.includes(targetIDL)) continue;
      checkedIDL.push(targetIDL);

      if (fs.existsSync(targetIDL) == false) throw new Error("Target IDL File [" + targetIDL + "] NOT EXists.");
      let idlContent = fs.readFileSync(targetIDL, 'utf-8');
      if( idlContent == undefined || idlContent.length == 0) continue;

      const idlSearchDirs = [];
      for (const path of rtcParam.idlSearchPathList) {
        idlSearchDirs.push(path.path);
      }

      if (idlDirs != null) {
        for (const each of idlDirs) {
          idlSearchDirs.push(each.path);
        }
      }
      parse(idlContent, idlSearchDirs, dummy, true);
    }
  }
}

function checkSuperInterface(targetList, rtcParam) {
  for (const target of targetList) {
    if (!target.superInterfaceList || target.superInterfaceList.length === 0) continue;

    for (const targetIF of target.superInterfaceList) {
      let isHit = false;

      for (const source of rtcParam.serviceClassParams) {
        if (targetIF === source.name) {
          if (source.methods) {
            target.methods = (target.methods || []).concat(source.methods);
          }
          target.typeDefs = source.typeDefs || [];
          if(rtcParam.includedIdls.includes(source.idlFile) == false) {
            rtcParam.includedIdls.push(source.idlFile);
          }
          isHit = true;
          break;
        }
      }

      if (!isHit) {
        return false;
      }
    }
  }
  return true;
}

module.exports = {
  generateCode
};
