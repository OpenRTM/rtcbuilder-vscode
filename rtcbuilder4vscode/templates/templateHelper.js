const path = require('path');

const { IdlFileParam, ConfigSetParam } = require("./../model/dataModels");

function checkNotWidget(rtcParam) {
  for (const config of rtcParam.configParams) {
    Object.setPrototypeOf(config, ConfigSetParam.prototype);
    if (config.getWidget() != null && config.getWidget().length > 0) {
      return false;
    }
  }
  return true;
}

function getWidget(config) {
  Object.setPrototypeOf(config, ConfigSetParam.prototype);
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
  Object.setPrototypeOf(config, ConfigSetParam.prototype);
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


function checkNotConstraint(rtcParam) {
  for (const config of rtcParam.configParams) {
    if (config.constraint != null && config.constraint.length > 0) {
      return false;
    }
  }
  return true;
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

function getBasename(fullName) {
  return fullName.replace(/::/g, "_");
}

function convertDelimiter(fullName) {
  return fullName.replace(/\./g, '::');
}

function checkDefault(target, typeList) {
  return typeList.some(type => {
    return type.isDefault && target.trim() === type.fullPath.trim();
  });
}

function getIncludedIdlPathes(rtcParam) {
  const result = [];

  for (const s of rtcParam.includedIdls) {
    result.push(new IdlFileParam({ idlPath : s,
                                   parent: rtcParam}));
  }
  return result;

}

function getIncludeIdlParams(idlFileParam) {
  const result = [];

  for (const s of idlFileParam.includeIdlPathes) {
    result.push(new IdlFileParam({ idlPath: s,
                                   parent: idlFileParam.parent }));
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

function checkWithoutDefaultPathes(rtcParam) {
  const result = rtcParam.providerIdlPathes?.some(e => !e.isDefault) ||
                 rtcParam.consumerIdlPathes?.some(e => !e.isDefault) || false;
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

function convConfigSetType(typeDef) {
  const type = typeDef.trim();
  if (type === "short") {
    return "short int";
  } else if (type === "long") {
    return "long int";
  } else if (type === "string") {
    return "std::string";
  }
  return type;
}

function checkComment(actionId, param) {
  if (param.actions[actionId].implemented) {
      return "";
  } else {
      return "//";
  }
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

const mapType_ = {};
mapType_['longlong'] = '::CORBA::LongLong';
mapType_['long'] = '::CORBA::Long';
mapType_['unsignedlong'] = '::CORBA::ULong';
mapType_['unsignedlonglong'] = '::CORBA::ULongLong';
mapType_['short'] = '::CORBA::Short';
mapType_['unsignedshort'] = '::CORBA::UShort';
mapType_['float'] = '::CORBA::Float';
mapType_['double'] = '::CORBA::Double';
mapType_['longdouble'] = '::CORBA::LongDouble';
mapType_['char'] = '::CORBA::Char';
mapType_['wchar'] = '::CORBA::WChar';
mapType_['octet'] = '::CORBA::Octet';
mapType_['boolean'] = '::CORBA::Boolean';
mapType_['string'] = 'char*';
mapType_['wstring'] = '::CORBA::WChar*';
mapType_['any'] = '::CORBA::Any*';
mapType_['void'] = 'void';

function convCpp2CORBA(typeDef, dataDefParams) {
  let isArray = false;
  let isSequence = false;
  let isStruct = false;
  let isUnbounded = false;

  let result = mapType_[typeDef.type];
  if (result == undefined) {
    result = typeDef.type;
    const checkResult = checkTypeInfo(typeDef, dataDefParams);
    isArray = checkResult.isArray;
    isStruct = checkResult.isStruct;
    isUnbounded = checkResult.isUnbounded;
    isSequence = checkResult.isSequence;

    if (isArray) {
      result = result + "_slice*";

    } else if (isSequence) {
      result = result + "*";

    } else if (isStruct) {
      if (isUnbounded) {
        result = result + "*";
      }
    }

    const module = typeDef.module;
    if (module != null && module.length > 0 && !result.startsWith("RTC")) {
      result = module + result;
    }
  }

  return result;
}

function convCpp2CORBAforArg(typeDef, dataDefParams) {
  let isArray = false;
  let isStruct = false;
  let isUnbounded = false;
  let isSequence = false;

  let result = mapType_[typeDef.type];
  if (result == undefined) {
    result = typeDef.type;
    const checkResult = checkTypeInfo(typeDef, dataDefParams);
    isArray = checkResult.isArray;
    isStruct = checkResult.isStruct;
    isUnbounded = checkResult.isUnbounded;
    isSequence = checkResult.isSequence;
  }

  const type = typeDef.type;
  const direction = typeDef.direction;
  const originalType = typeDef.originalType;
  const module = typeDef.module || "";

  if (type === "string") {
    if (direction === "in") {
      result = "const char*";
    } else if (direction === "out") {
      result = isUnbounded ? originalType + "_out" : "::CORBA::String_out";
    } else if (direction === "inout") {
      result = "char*&";
    }

  } else if (type === "wstring") {
    if (direction === "in") {
      result = "const ::CORBA::WChar*";
    } else if (direction === "out") {
      result = isUnbounded ? originalType + "_out" : "::CORBA::WString_out";
    } else if (direction === "inout") {
      result = "::CORBA::WChar*&";
    }

  } else if (type === "any") {
    if (direction === "in") {
      result = "const ::CORBA::Any&";
    } else if (direction === "out") {
      result = "::CORBA::Any_OUT_arg";
    } else if (direction === "inout") {
      result = "::CORBA::Any&";
    }

  } else if (isArray) {
    if (module !== "") {
      result = module + result;
    }
    if (isUnbounded || originalType === "string" || originalType === "wstring" || originalType === "any") {
      if (direction === "in") {
        result = "const " + result;
      } else if (direction === "out") {
        result = result + "_out";
      }
    } else {
      if (direction === "in") {
        result = "const " + result;
      }
    }

  } else if (isStruct) {
    if (module !== "") {
      result = module + result;
    }

    if (direction === "in") {
      result = "const " + result + "&";
    } else if (direction === "out") {
      result = isUnbounded ? result + "_out" : result + "&";
    } else if (direction === "inout") {
      result = result + "&";
    }

  } else if (isSequence) {
    if (module !== "") {
      result = module + result;
    }

    if (direction === "in") {
      result = "const " + result + "&";
    } else if (direction === "out") {
      result = result + "_out";
    } else if (direction === "inout") {
      result = result + "&";
    }

  } else if (originalType === "wstring") {
    if (direction === "in") {
      result = "const ::CORBA::WChar*";
    } else if (direction === "out") {
      result = result + "_out";
    } else if (direction === "inout") {
      result = "::CORBA::WChar*&";
    }

  } else if (originalType === "any") {
    if (direction === "in") {
      result = "const " + result + "&";
    } else if (direction === "out") {
      result = "::CORBA::Any_OUT_arg";
    } else if (direction === "inout") {
      result = result + "&";
    }

  } else {
    if (module !== "" && !result.includes("::")) {
      result = module + result;
    }

    if (direction === "out" || direction === "inout") {
      result += "&";
    }
  }

  return result;
}

function checkMethodRet(target, dataDefParams) {
  const result = checkTypeInfo(target, dataDefParams);
  return result.isStruct && !result.isSequence && !result.isString && !result.isArray;
}

function checkTypeInfo(typeDef, dataDefParams) {
  let isArray = false;
  let isStruct = false;
  let isUnbounded = false;
  let isSequence = false;
  let isString = false;

  let result = mapType_[typeDef.type];
  if(result) {
    if(result === 'char*' || result === '::CORBA::WChar*') {
      isString = true;
    }

  } else  {
    const targetType = dataDefParams.find(item => item.name === typeDef.module + typeDef.type);
    if(targetType) {
      isStruct = targetType.isStruct;
      isArray = targetType.isArray;
      isSequence = targetType.isSequence;
      if(!targetType.isStruct) {
        if(targetType.isSequence) {
          isUnbounded = true;
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

      } else {
        const childType = { module: typeDef.module,
                            type: targetType.type};
        const childRet = checkTypeInfo(childType, dataDefParams);
        if(childRet.isArray) isArray = true;
        if(childRet.isStruct) isStruct = true;
        if(childRet.isUnbounded) isUnbounded = true;
        if(childRet.isSequence) isSequence = true;
      }
    }
  }
  return { isArray: isArray,
           isStruct: isStruct,
           isUnbounded: isUnbounded,
           isSequence: isSequence,
           isString: isString,
  };
}

module.exports = {
  checkNotWidget,
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
  checkMethodRet
};
