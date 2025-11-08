const path = require('path');

const { IdlFileParam } = require("../dataModels");

function getWidget(config) {
  // Object.setPrototypeOf(config, ConfigSetParam.prototype);
  const result = config.properties.find(c => c.name === '__widget__');
  if(result) {
      let value = result.value;
      if(value.includes('.')) {
          const index = value.indexOf(".");
          return value.substring(0, index);
      }
      return value;
  }
  return '';
}
function getStep(config) {
  // Object.setPrototypeOf(config, ConfigSetParam.prototype);
  const widget = config.properties.find(c => c.name === '__widget__');
  if(widget) {
      let widget_type = widget.value;
      if(widget_type.includes('.')) {
          const index = widget_type.indexOf(".");
          return widget_type.substring(index + 1);
      }
  }
  return '';
}

function checkDefault(target, rtcParam) {
  for (const type of rtcParam.dataTypeParams) {
    if (type.isDefault) {
      if (target.trim() === type.fullPath.trim()){
         return true;
      }
    }
  }
  return false;
}

function checkUserDefined(rtcParam) {
  let result = false;

  // Provider側をチェック
  for (const target of rtcParam.providerIdlPathes) {
    if (checkDefault(target.idlPath, rtcParam)) {
      continue;
    }
    result = true;
    break;
  }

  // Providerで見つからなければ、Consumer側をチェック
  if (!result) {
    for (const target of rtcParam.consumerIdlPathes) {
      if (checkDefault(target.idlPath, rtcParam)) {
        continue;
      }
      result = true;
      break;
    }
  }

  return result;
}

function getIncludedIdlPathes(rtcParam) {
  const result = [];

  for (const s of rtcParam.includedIdls) {
    result.push(new IdlFileParam({ idlPath : s,
                                   parent: rtcParam}));
  }
  return result;

}

function getFileName(fullPath) {
  if (!fullPath) return '';

  return path.basename(fullPath);
}

function getFilenameNoExt(fullPath) {
  const ext = path.extname(fullPath);
  const base = path.basename(fullPath, ext);
  return base;
}

function getIDLFiles(rtcParam) {
  let result = '';

  const allIdlPaths = [
    ...rtcParam.providerIdlPathes,
    ...rtcParam.consumerIdlPathes,
    ...getIncludedIdlPathes(rtcParam)
  ];

  for (const target of allIdlPaths) {
    const idlPath = target.idlPath;

    if (checkDefault(idlPath, rtcParam)) continue;

    const filenameNoExt = getFilenameNoExt(target.idlPath);
    result += `${filenameNoExt}.idl `;
  }

  return result;
}

function getConnectorString(rtcParam) {
  const parts = [];

  // InPorts
  for (const port of rtcParam.inports) {
    if (!port.type || port.type.length === 0) continue;
      parts.push(
        `\${PROJECT_NAME}0.${port.name}?port=\${PROJECT_NAME}Test0.${port.name}`
    );
  }

  // OutPorts
  for (const port of rtcParam.outports) {
    if (!port.type || port.type.length === 0) continue;
    parts.push(
      `\${PROJECT_NAME}0.${port.name}?port=\${PROJECT_NAME}Test0.${port.name}`
    );
  }

  // ServicePorts
  for (const port of rtcParam.serviceports) {
    parts.push(
      `\${PROJECT_NAME}0.${port.name}?port=\${PROJECT_NAME}Test0.${port.name}`
    );
  }

  return parts.join(",");
}

function hasDataPortType(targetFiles) {
  for (const target of targetFiles) {
    if (target.isDataPort) {
      return true;
    }
  }
  return false;
}

function convModuleName(source) {
  const addedList = [];
  let result = '';
  let existGlobal = false;

  const serviceClasses = source.serviceClass;

  for (const target of serviceClasses) {
    let strWork = '';

    const name = target.name;
    if (name.includes('::')) {
      const index = name.lastIndexOf('::');
      const moduleName = name.substring(0, index);
      strWork = `import ${moduleName}, ${moduleName}__POA`;
    } else {
      if (!existGlobal) {
        strWork = 'import _GlobalIDL, _GlobalIDL__POA';
        existGlobal = true;
      }
    }

    if (!addedList.includes(strWork)) {
      result += strWork + '\n'; // 改行は \n を使用（Windows用なら \r\n）
      addedList.push(strWork);
    }
  }

  return result;
}

function convModuleNameAll(sourceList) {
  const addedList = [];
  let result = '';
  let existGlobal = false;

  for (const source of sourceList) {
    for (const target of source.serviceClass) {
      let strWork = '';

      const name = target.name;

      if (name.includes('::')) {
        const index = name.lastIndexOf('::');
        const moduleName = name.substring(0, index);
        strWork = `import ${moduleName}, ${moduleName}__POA`;
      } else {
        if (!existGlobal) {
          strWork = 'import _GlobalIDL, _GlobalIDL__POA';
          existGlobal = true;
        }
      }

      if (!addedList.includes(strWork)) {
        result += strWork + '\n'; // 改行（System.lineSeparator() 相当）
        addedList.push(strWork);
      }
    }
  }

  return result;
}

function getTmplVarName(source) {
  if( source.varname == null || source.varname.length == 0) {
      return source.name;
  }
  return source.varname;
}

function getTmplVarNameSI(source) {
  if(0 < source.varname.length) {
      return source.varname;
  }
  if(0 < source.instancename.length) {
      return source.instancename;
  }
  return source.name;
}

function getDataportInitMethodName(rtcType) {
  // module名が付いていないデータ型（::が付いていない）の場合
  if (!/::/.test(rtcType)) {
    return `_GlobalIDL.${rtcType}`;
  }

  // "::" を "." に置換
  let methodName = rtcType.replace(/::/g, ".");

  // module名が「RTC::」のときは、RTC.Time(0,0) を引数に入れる
  // if (rtcType.startsWith("RTC::")) {
  //   methodName = `${methodName}(RTC.Time(0,0))`;
  // } else {
  //   // デフォルトコンストラクタ呼び出し
  //   methodName = `${methodName}()`;
  // }

  return methodName;
}

function getInterfaceBasename(fullName) {
  if( fullName == null) return;
  const split = fullName.split('::');
  return split[split.length - 1];
}

function getBasename(fullName) {
  return fullName.replace(/::/g, "_");
}

function convFormat(source) {
  return source.replace(/::/g, ".");
}

function convFullName(source) {
  if (source.includes("::")) {
    return source.replace(/::/g, ".");
  }
  return `_GlobalIDL.${source}`;
}

function isString(type) {
  return type.toLowerCase() === "string";
}

function convDefaultVal(config) {
  const defVal = config.defaultValue;

  if (config.name.startsWith("vector")) {
    const eachVal = defVal.split(",");
    const result = `[${eachVal.map(val => val.trim()).join(", ")}]`;
    return result;
  } else if (isString(config.type)) {
    return `'${defVal}'`;
  } else {
    return defVal;
  }
}

function getDataPortTypes(targetFiles) {
  const result = [];
  const check = new Set(["RTC", "OpenRTM_aist"]);

  for (const target of targetFiles) {
    if (!target.isDataPort) continue;

    for (const targetTypeFull of target.targetTypes) {
      let targetType;
      if (targetTypeFull.includes("::")) {
        targetType = targetTypeFull.split("::")[0];
      } else {
        targetType = "_GlobalIDL";
      }

      if (!check.has(targetType)) {
        check.add(targetType);
        result.push(targetType);
      }
    }
  }

  return result;
}

function getIncludedIdlPathes(rtcParam) {
  const result = [];

  for (const s of rtcParam.includedIdls) {
    result.push(new IdlFileParam({ idlPath : s,
                                   parent: rtcParam}));
  }
  return result;
}

function getIdlFileNoExt(idlPath) {
    const parts = getFileName(idlPath).split(/[\\/]/);
    const fileName = parts[parts.length - 1];
    const index = fileName.lastIndexOf('.');

    if (index > 0 && index < fileName.length - 1) {
      const result = fileName.substring(0, index);
        return result;
    }

    return "";
}

function getModuleName(source) {
  if (source.includes('::')) {
    const index = source.lastIndexOf('::');
    return source.substring(0, index);
  }
  return '_GlobalIDL';
}

const mapType_ = {};
mapType_['longlong'] = 'longlong';
mapType_['unsignedlong'] = 'ulong';
mapType_['unsignedlonglong'] = 'ulonglong';
mapType_['unsignedshort'] = 'ushort';

const mapTypeArgs_ = {};
mapTypeArgs_['longlong'] = 'long long';
mapTypeArgs_['unsignedlong'] = 'unsigned long';
mapTypeArgs_['unsignedlonglong'] = 'unsigned long long';
mapTypeArgs_['unsignedshort'] = 'unsigned short';

function convCORBA2PythonArg(strCorba, mapTypeArgs) {
  const result = mapTypeArgs_[strCorba];
  return result != null ? result : strCorba;
}

function selectInParamName(smp) {
  let result = '';

  for (const arg of smp.params) {
    if (arg.direction === 'in' || arg.direction === 'inout') {
      result += ', ' + arg.name;
    }
  }

  return result;
}

function selectOutParamName(smp) {
  let result = '';
  let hit = false;

  if (smp.type !== 'void') {
    result = ' result';
  }

  for (const arg of smp.params) {
    const dir = arg.direction;
    if (dir === 'out' || dir === 'inout') {
      if (result.length > 0) result += ',';
      result += ' ' + arg.name;
      hit = true;
    }
  }

  if (smp.type === 'void' && !hit) {
    result = ' None';
  }

  return result;
}

module.exports = {
  getWidget,
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
  selectOutParamName
};
