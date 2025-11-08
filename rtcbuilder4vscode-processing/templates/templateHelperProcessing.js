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

function getFileName(fullPath) {
  if (!fullPath) return '';

  return path.basename(fullPath);
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

function getPortTypes(param) {
  const portTypes = [];

  for (const dataPort of param.inports) {
    if (!portTypes.includes(dataPort.type)) {
      portTypes.push(dataPort.type);
    }
  }

  for (const dataPort of param.outports) {
    if (!portTypes.includes(dataPort.type)) {
      portTypes.push(dataPort.type);
    }
  }

  return portTypes;
}

function getDataportPackageName(rtcType) {
  // "::" を含まない場合は空文字を返す（import文を生成しない）
  if (!/::/.test(rtcType)) {
    return "";
  }

  // "::" を "." に置換して Java の import 文のような形式にする
  const importDef = "import " + rtcType.replace(/::/g, ".") + ";";
  return importDef;
}

function useReturnCode(rtcParam) {
  if (rtcParam.inports.length > 0 ||
      rtcParam.outports.length > 0 ||
      rtcParam.serviceports.length > 0) {
    return true;
  }

  if (rtcParam.configParams.length > 0) {
    return true;
  }

  for (const key in rtcParam.actions ) {
    if (rtcParam.actions[key].implemented) {
      return true;
    }
  }

  return false;
}

function notNullRTMRoot() {
  const defaultPath = process.env.RTM_ROOT;
  return defaultPath !== undefined && defaultPath !== null;
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

function getDataTypeName(rtcType) {
    // '::' が含まれていない場合、そのまま返す
    if (!rtcType.includes("::")) return rtcType;

    const dataTypeNames = rtcType.split("::");
    return dataTypeNames[1];
}

const mapParamHolder_ = {};
mapParamHolder_['short'] = 'ShortHolder';
mapParamHolder_['int'] = 'IntegerHolder';
mapParamHolder_['long'] = 'LongHolder';
mapParamHolder_['float'] = 'FloatHolder';
mapParamHolder_['double'] = 'DoubleHolder';
mapParamHolder_['byte'] = 'ByteHolder';
mapParamHolder_['String'] = 'StringHolder';
mapParamHolder_['string'] = 'StringHolder';

function convJava2ParamHolder(strJava, isNullAdd) {
    let result = mapParamHolder_[strJava];
    if (isNullAdd && result === undefined) {
        result = strJava + "Holder";
    }
    return result;
}

function getParamTypes(param) {
    const paramTypes = [];

    for (const config of param.configParams) {
        const paramType = convJava2ParamHolder(config.type, false);
        if (paramType !== null && !paramTypes.includes(paramType)) {
            paramTypes.push(paramType);
        }
    }

    return paramTypes;
}

function getInterfaceBasename(fullName) {
  const split = fullName.split('::');
  return split[split.length - 1];
}

function isModule(source) {
  return source.includes("::");
}

function convFormat(source) {
  return source.replace(/::/g, ".");
}

function getInterfaceRawType(source) {
  if(source.interfacetype.includes("::")) {
    const elem = source.interfacetype.split("::");
    return elem[elem.length-1];
  }
  return source.interfacetype;
}

function getTypeDefs(target, scp) {
    let result = null;

    // scp.name + "::" を削除
    const prefix = scp.name + "::";
    if (target.startsWith(prefix)) {
        target = target.replace(prefix, "");
    }

    const source = scp.typeDefs[target];

    if (
        !source ||
        !source.getOriginalDef() ||
        source.getOriginalDef().length === 0
    ) {
        return target;
    } else {
        result = getTypeDefs(source.getOriginalDef(), scp);

        if (source.isSequence()) {
            result += "[]";
        } else if (source.isArray()) {
            for (let i = 0; i < source.getArrayDim(); i++) {
                result += "[]";
            }
        }
    }

    return result;
}

const mapType_ = {};
mapType_['longlong'] = 'long';
mapType_['long'] = 'int';
mapType_['unsignedlong'] = 'int';
mapType_['unsignedlonglong'] = 'long';
mapType_['short'] = 'short';
mapType_['unsignedshort'] = 'short';
mapType_['float'] = 'float';
mapType_['double'] = 'double';
mapType_['longdouble'] = 'double';
mapType_['char'] = 'char';
mapType_['wchar'] = 'char';
mapType_['octet'] = 'byte';
mapType_['boolean'] = 'boolean';
mapType_['string'] = 'String';
mapType_['wstring'] = 'String';
mapType_['any'] = 'org.omg.CORBA.Any';
mapType_['void'] = 'void';

const mapTypeHolder_ = {};
mapTypeHolder_['longlong'] = 'org.omg.CORBA.LongHolder';
mapTypeHolder_['long'] = 'org.omg.CORBA.IntHolder';
mapTypeHolder_['unsignedlong'] = 'org.omg.CORBA.IntHolder';
mapTypeHolder_['unsignedlonglong'] = 'org.omg.CORBA.LongHolder';
mapTypeHolder_['short'] = 'org.omg.CORBA.ShortHolder';
mapTypeHolder_['unsignedshort'] = 'org.omg.CORBA.ShortHolder';
mapTypeHolder_['float'] = 'org.omg.CORBA.FloatHolder';
mapTypeHolder_['double'] = 'org.omg.CORBA.DoubleHolder';
mapTypeHolder_['char'] = 'org.omg.CORBA.CharHolder';
mapTypeHolder_['wchar'] = 'org.omg.CORBA.CharHolder';
mapTypeHolder_['octet'] = 'org.omg.CORBA.ByteHolder';
mapTypeHolder_['boolean'] = 'org.omg.CORBA.BooleanHolder';
mapTypeHolder_['string'] = 'org.omg.CORBA.StringHolder';
mapTypeHolder_['wstring'] = 'org.omg.CORBA.StringHolder';
mapTypeHolder_['any'] = 'org.omg.CORBA.AnyHolder';
mapTypeHolder_['longdouble'] = 'org.omg.CORBA.DoubleHolder';

function convCORBA2Java(typeDef, scp, dataDefParams) {
    let strType = getTypeDefs(typeDef.type, scp);

    if (strType == null) {
        strType = typeDef.type;
    } else {
        strType = strType.replace(/::/g, ".");
    }

    const rawType = strType.replace(/\[\]/g, "");
    let convType = mapType_[rawType];
    let isAlias = false;
    let arrayDim = 0;
    let isPrimitive = false;

    let result;

    if (convType == null) {
      const checkResult = checkTypeInfo(typeDef, dataDefParams);
      arrayDim = checkResult.arrayDim;
      convType = checkResult.convType;
      if(checkResult.isStruct) {
        result = typeDef.type;

      } else if (checkResult.isSequence) {
        let convedType = mapType_[convType];
        if(convedType != null) {
          return convedType + '[]';
        }
        result = convType + '[]';

      } else if (checkResult.isArray) {
        let convedType = mapType_[convType];
        if(convedType != null) {
        for (let i = 0; i < arrayDim; i++) {
            convedType += "[]";
        }
          return convedType;
        }
        result = convType;
        for (let i = 0; i < arrayDim; i++) {
            result += "[]";
        }

        const targetType = dataDefParams.find(item => item.name === typeDef.module + convType);
        if(targetType == null) {
          isPrimitive = true;
        }

      } else if(checkResult.isEnum) {
        result = typeDef.type;

      } else if (isAlias || checkResult.isString) {
        result = typeDef.type;
      } else {
        result = convType;
      }

      if(isPrimitive == false) {
        const mdl = typeDef.module;
        if (mdl.length > 0) {
            result = mdl + result;
        }
      }

        result = result.replace(/::/g, ".");
    } else {
        result = strType.replace(rawType, convType);
    }

    return result;
}

function checkTypeInfo(typeDef, dataDefParams) {
  let isArray = false;
  let isEnum = false;
  let isStruct = false;
  let isUnbounded = false;
  let isSequence = false;
  let isString = false;
  let arrayDim = 0;
  let convType = '';
  let subType = '';

  let result = mapType_[typeDef.type];
  if(result) {
    convType = result;
    if(result === 'char*' || result === '::CORBA::WChar*') {
      isString = true;
    }

  } else  {
    const targetType = dataDefParams.find(item => item.name === typeDef.module + typeDef.type);
    if(targetType) {
      isStruct = targetType.isStruct;
      isArray = targetType.isArray;
      isEnum = targetType.isEnum;
      isSequence = targetType.isSequence;
      if(targetType.type == null) {
        let a = 0;
      }
      if(targetType.isEnum) {

      } else if(!targetType.isStruct) {
        if(targetType.isSequence) {
          isUnbounded = true;
          arrayDim++;
          convType = targetType.originalDef;

        } else if(targetType.type.includes('<')) {
          // isSequence = true;
          arrayDim++;
          convType = targetType.type;

          const match = targetType.type.match(/^([^\s<]+)\s*<\s*(.+?)\s*>$/);
          subType = match[1];
          const elemNum = match[2];
        }
        if(subType === 'string' || subType === 'wstring') {
          isString = true;
        }
      }
      if(targetType.isStruct) {
        for(const menber of targetType.members) {
          const childType = { module: typeDef.module,
                              type: menber.type};
          const childRet = checkTypeInfo(childType, dataDefParams);
          if(childRet.isStruct) isStruct = true;
          if(childRet.isUnbounded) isUnbounded = true;
          if(childRet.isSequence) isSequence = true;
        }

      } else if(targetType.isEnum) {

      } else {
        if(targetType.isArray) {
          if(isString==false) {
            arrayDim++;
            convType = targetType.type;
          }
        }
        const childType = { module: typeDef.module,
                            type: convType};
        const childRet = checkTypeInfo(childType, dataDefParams);
        arrayDim += childRet.arrayDim;
        if(childRet.convType != null && 0<childRet.convType.length) {
          convType = childRet.convType;
        }
      }
    }
  }
  return { isArray: isArray,
           isStruct: isStruct,
           isEnum: isEnum,
           isUnbounded: isUnbounded,
           isSequence: isSequence,
           isString: isString,
           arrayDim: arrayDim,
           convType: convType
  };
}

function convCORBA2JavaforArg(typeDef, strDirection, scp, dataDefParams) {
  let result = "";
  let rawType = getTypeDefs(typeDef.type, scp);
  rawType = rawType.replace(/::/g, ".");
  let isPrimitive = false;

  if (mapType_[rawType]) {
    if (strDirection === 'in') {
      result = mapType_[rawType];
    } else {
      result = mapTypeHolder_[rawType];
    }
    return result;
  }

  const checkResult = checkTypeInfo(typeDef, dataDefParams);
  const arrayDim = checkResult.arrayDim;
  let strType = checkResult.convType;
  if(strType.length == 0) {
    if (strDirection !== 'in') {
      rawType = rawType + "Holder";
    }

    if (typeDef.module.length === 0) {
        rawType = rawType.replace(/::/g, "Package.");
    } else {
        rawType = typeDef.module + rawType;
        rawType = rawType.replace(/::/g, ".");
    }
    return rawType;
  }

  if (checkResult.isStruct) {
    if (strDirection !== 'in') {
      result = typeDef.type + "Holder";
    } else {
      result = typeDef.type;
    }

  } else if(checkResult.isSequence) {
    if (strDirection !== 'in') {
      result = typeDef.type + "Holder";
    } else {
      const rawType = strType.replace(/\[\]/g, "");
      const convType = mapType_[rawType];

      if (convType != null) {
          return convType + '[]';
      } else {
          result = strType + '[]';
      }
    }

  } else if(checkResult.isArray) {
    if (strDirection !== 'in') {
      result = typeDef.type + "Holder";
    } else {
      const rawType = strType.replace(/\[\]/g, "");
      let convType = mapType_[rawType];

      if (convType != null) {
        for (let i = 0; i < arrayDim; i++) {
            convType += "[]";
        }
        return convType;
      } else {
        for (let i = 0; i < arrayDim; i++) {
            strType += "[]";
        }
        result = strType;
        const targetType = dataDefParams.find(item => item.name === typeDef.module + rawType);
        if(targetType == null) {
          isPrimitive = true;
        }
      }
    }

  } else if (checkResult.isEnum) {
    if (strDirection !== 'in') {
      result = typeDef.type + "Holder";
    } else {
      result = typeDef.type;
    }

  } else {
    result = strType;

    if (strDirection !== 'in') {
      if (typeDef.isUnbounded) {
        result = typeDef.type + "Holder";
      } else {
        result += "Holder";
      }
    }
  }

  if(isPrimitive == false) {
    if (typeDef.module.length === 0) {
        result = result.replace(/::/g, "Package.");
    } else {
        result = typeDef.module + result;
        result = result.replace(/::/g, ".");
    }
  }

  return result;
}

function convCORBA2JavaNoDef(strCorba) {
    let result = mapType_[strCorba];
    if (result == null) result = strCorba;
    return result;
}

function convCORBA2JavaforArgCmt(strCorba, strDirection) {
    let result = "";

    if (strDirection === 'in') {
        result = mapType_[strCorba];
    } else {
        result = mapTypeHolder_[strCorba];
    }

    if (result == null) result = strCorba;

    return result;
}

function isRetNumber(srvMethod, scp) {
  const sType = getTypeDefs(srvMethod.type, scp);
  const strType = mapType_[sType];

  if (strType == null) {
      return false;
  } else {
      if (
          strType === "boolean" ||
          strType === "string" ||
          strType === "String" ||
          strType === "org.omg.CORBA.Any" ||
          strType === "void"
      ) {
          return false;
      }
  }

  return true;
}

function isRetBoolean(srvMethod, scp, dataDefParams) {
  const checkResult = checkTypeInfo(srvMethod.type, dataDefParams);

    if (checkResult.isArray || checkResult.isSequence) {
        return false;
    }

    let sType = getTypeDefs(srvMethod.type, scp);
    let strType = mapType_[sType];

    if (strType != null && strType === "boolean") {
        return true;
    }

    return false;
}

function getUserDefinedModule(param) {
  let targetIDL = null;

  for (const target of param.providerIdlPathes) {
      if (checkDefault(target.idlPath, param)) {
          continue;
      }
      targetIDL = target;
      break;
  }

  if (targetIDL === null) {
      for (const target of param.consumerIdlPathes) {
          if (checkDefault(target.idlPath, param)) {
              continue;
          }
          targetIDL = target;
          break;
      }
  }

  if (!targetIDL || targetIDL.targetTypes.length === 0) {
      return "";
  }

  const targetType = targetIDL.targetTypes[0];
  const elems = targetType.split("::");
  return elems[0];
}

function getServiceName(param) {
    const services = param.serviceClassParams;

    if (services && services.length > 0) {
        let target;
        for(const each of services) {
          if( checkDefault(each.idlPath, param) ) continue;
          target = each;
          break;
        }
        if(target) {
          const moduleName = target.module;
          if (moduleName) {
              return moduleName;
          }
        }
    }

    return getUserDefinedModule(param);
}

function getServiceNamePath(param) {
    const result = getServiceName(param);
    if (result.length > 0) {
        return "/" + result;
    }
    return "";
}

module.exports = {
  getWidget,
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
  getServiceNamePath
};
