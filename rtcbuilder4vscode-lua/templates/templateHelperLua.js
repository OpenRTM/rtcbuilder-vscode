const path = require('path');

const { IdlFileParam } = require("../dataModels");

function getWidget(config) {
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

function getFileName(fullPath) {
  if (!fullPath) return '';

  return path.basename(fullPath);
}

function getFilenameNoExt(fullPath) {
  const ext = path.extname(fullPath);
  const base = path.basename(fullPath, ext);
  return base;
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

function getFilenameNoExt(fullPath) {
  const ext = path.extname(fullPath);
  const base = path.basename(fullPath, ext);
  return base;
}

function getIncludedIdlPathes(rtcParam) {
  const result = [];

  for (const s of rtcParam.includedIdls) {
    result.push(new IdlFileParam({ idlPath : s,
                                   parent: rtcParam}));
  }
  return result;

}

function checkDefault(target, rtcParam) {
  for( const type of rtcParam.dataTypeParams) {
    if( type.isDefault) {
      if(target.trim() === type.fullPath.trim()) return true;
    }
  }
  return false;
}

function getIDLFilesForIDLCMake(rtcParam) {
  const result = [];

  const allIdlPathes = [
    ...rtcParam.providerIdlPathes,
    ...rtcParam.consumerIdlPathes,
    ...getIncludedIdlPathes(rtcParam)
  ];

  for (const target of allIdlPathes) {
    const isDefault = checkDefault(target.idlPath, rtcParam);
    if (isDefault) continue;

    const filename = getFilenameNoExt(target.getIdlFile());
    result.push(`\${CMAKE_CURRENT_SOURCE_DIR}/${filename}.idl`);
  }

  return result.join(' ');
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
  // "::" を含まない場合は、関数呼び出し形式で返す
  if (!/.*::.*/.test(rtcType)) {
    return rtcType + "()";
  }

  let methodName = "::" + rtcType;

  // RTC:: で始まる場合だけ RTC.Time を使う
  // if (rtcType.startsWith("RTC::")) {
  //   methodName += "(RTC.Time(0,0)";
  // } else {
  //   methodName += "()";
  // }

  return methodName;
}

function convConfigSetType(typeDef) {
  const trimmedType = typeDef.trim();

  if (trimmedType === "short") {
    return "int";
  } else if (trimmedType === "long") {
    return "int";
  } else if (trimmedType === "string") {
    return "str";
  } else if (trimmedType === "float") {
    return "real";
  } else if (trimmedType === "double") {
    return "real";
  }

  return trimmedType;
}

function isString(type) {
    return type.toLowerCase() === 'str';
}

function convDefaultVal(config) {
  const defVal = config.defaultValue;

  if (config.name.startsWith("vector")) {
    const eachVal = defVal.split(",");
    const result = "[" + eachVal.map(val => val.trim()).join(", ") + "]";
    return result;
  } else if (isString(config.type)) {
    return `'${defVal}'`;
  } else {
    return defVal;
  }
}

function getInterfaceBasename(fullName) {
  const split = fullName.split('::');
  return split[split.length - 1];
}

function convertServiceInterfaceName(source) {
  return "IDL:" + source.replace(/::/g, "/") + ":1.0";
}

function convFormat(source) {
    return source.replace(/::/g, ".");
}

const mapTypeArgs = {};
mapTypeArgs['short'] = 'int';
mapTypeArgs['long'] = 'int';
mapTypeArgs['longlong'] = 'int';
mapTypeArgs['unsignedshort'] = 'int';
mapTypeArgs['unsignedlong'] = 'int';
mapTypeArgs['unsignedlonglong'] = 'int';
mapTypeArgs['float'] = 'real';
mapTypeArgs['double'] = 'real';
mapTypeArgs['longdouble'] = 'real';
mapTypeArgs['boolean'] = 'bool';
mapTypeArgs['char'] = 'str';
mapTypeArgs['wchar'] = 'str';
mapTypeArgs['octet'] = 'str';
mapTypeArgs['string'] = 'str';
mapTypeArgs['wstring'] = 'str';
mapTypeArgs['void'] = 'nil';

function convCORBA2LuaArg(strCorba) {
  let result = mapTypeArgs[strCorba];
  if (result == null) result = strCorba;
  return result;
}

function selectInParamName(smp) {
  let result = "";
  let count = 0;

  for (const arg of smp.params) {
    if (arg.direction === 'in' || arg.direction === 'inout') {
      if (count === 0) {
        result = arg.name;
      } else {
        result += ", " + arg.name;
      }
      count++;
    }
  }

  return result;
}

function selectOutParamName(smp) {
    let result = "";
    let blnHit = false;

    if (smp.type !== 'void') {
        result = " result";
    }

    for (const arg of smp.params) {
        if (arg.direction === 'out' || arg.direction === 'inout') {
            if (result.length > 0) result += ",";
            result += " " + arg.name;
            blnHit = true;
        }
    }

    if (smp.type === 'void' && !blnHit) {
        result = " None";
    }

    return result;
}

module.exports = {
  getWidget,
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
  selectOutParamName
};
