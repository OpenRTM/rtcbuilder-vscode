class IdlPathParam {
    constructor({ path = '', dispPath = '', isDefault = false } = {}) {
        this.path = path;
        this.dispPath = dispPath;
        this.isDefault = isDefault;
    }
}

class IdlFileParam {
    constructor({ idlPath = '', parent = ''} = {}) {
        this.idlPath = idlPath;
        this.parent = parent;
        this.targetTypes = [];
        this.isDataPort = false;
        this.includeIdlPathes = [];
        this.idlSearchPathes = [];
        this.serviceClass = [];
        this.testServiceClass = [];
    }
    getIdlFile() {
        if (!this.idlPath || this.idlPath.trim() === '') {
            return '';
        }

        const parts = this.idlPath.split(/[\\/]/);
        return parts[parts.length - 1];
    }

    checkDefault() {
        const defaultPath = process.env.RTM_ROOT;
        return this.idlPath.startsWith(defaultPath);
    }

    getIdlFileNoExt() {
        const parts = this.idlPath.split(/[\\/]/);
        const fileName = parts[parts.length - 1];
        const index = fileName.lastIndexOf('.');

        if (index > 0 && index < fileName.length - 1) {
            return fileName.substring(0, index);
        }

        return "";
    }

    getIncludeIdlParamsWithoutDefault() {
        const result = [];
        const defaultPath = process.env.RTM_ROOT;

        for (const s of this.includeIdlPathes) {
            if (s.startsWith(defaultPath)) continue;
            result.push(new IdlFileParam(s, this.parent));
        }

          return result;
    }

}

class DataTypeParam {
    constructor({ fullPath = '', dispPath = '', isDefault = false } = {}) {
        this.fullPath = fullPath;
        this.dispPath = dispPath;
        this.isDefault = isDefault;
        this.definedTypes = [];
    }
}

class ServiceClassParam {
    constructor({ name = '', idlPath = '', idlFile = '', idlDispFile = '' } = {}) {
        this.name = name;
        this.idlPath = idlPath;
        this.idlFile = idlFile;
        this.idlDispFile = idlDispFile;
        this.module = '';
        this.methods = [];
        this.superInterfaceList = [];
        this.parent = undefined;
        this.includes = [];
        this.typeDefs = [];
    }
}

class GeneratedResult {
    constructor() {
        this.name = '';
        this.mode = '';
        this.code = '';
        this.isNotBom = false;
        this.canMerge = false;
        this.original = '';
        this.encode = 'utf-8';
    }
}

class ActionParam {
    constructor() {
        this.implemented = false;
        this.pre_condition = '';
        this.overview = '';
        this.post_condition = '';
    }
}

class PropertyParam {
    constructor({ name = '', value = '' } = {}) {
        this.name = name;
        this.value = value;
    }
}

class DataPortParam {
    constructor() {
        this.name = '';
        this.type = '';
        this.varname = '';
        this.idlFile = '';
        this.dispIdlFile = '';
        this.dataFlowType = '';
        this.interfaceType = '';
        this.subscriptionType = '';
        this.unit = '';
        this.constraint = '';

        this.doc_description = '';
        this.doc_type = '';
        this.doc_num = '';
        this.doc_semantics = '';
        this.doc_unit = '';
        this.doc_occerrence = '';
        this.doc_operation = '';
    }
}

class ServicePortInterfaceParam {
    constructor() {
        this.name = '';
        this.direction = '';
        this.instancename = '';
        this.varname = '';
        this.idlfile = '';
        this.idlDispfile = '';
        this.interfacetype = '';

        this.doc_description = '';
        this.doc_argument = '';
        this.doc_return = '';
        this.doc_exception = '';
        this.doc_pre_condition = '';
        this.doc_post_condition = '';
    }

    getTmplVarName() {
        if(0 < this.varname.length) {
            return this.varname;
        }
        if(0 < this.instancename.length) {
            return this.instancename;
        }
        return this.name;
    }
}

class ServicePortParam {
    constructor() {
        this.name = '';
        this.serviceinterfaces = [];

        this.doc_description = '';
        this.doc_if_description = '';
    }
}

class ConfigSetParam {
    constructor() {
        this.name = '';
        this.type = '';
        this.varname = '';
        this.defaultValue = '';
        this.constraint = '';
        this.unit = '';
        this.idlFile = '';

        this.doc_dataname = '';
        this.doc_default = '';
        this.doc_description = '';
        this.doc_unit = '';
        this.doc_range = '';
        this.doc_constraint = '';

        this.properties = [];
    }

    getWidget() {
        const result = this.properties.find(c => c.name === '__widget__');
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
    setWidget(widget) {
        const result = this.properties.find(c => c.name === '__widget__');
        if(result) {
            result.value = widget;
            return;
        }
        let prop = new PropertyParam({name: '__widget__', value: widget});
        this.properties.push(prop);
    }

    getStep() {
        const widget = this.properties.find(c => c.name === '__widget__');
        if(widget) {
            let widget_type = widget.value;
            if(widget_type.includes('.')) {
                const index = widget_type.indexOf(".");
                return widget_type.substring(index + 1);
            }
        }
        return '';
    }
    setStep(step) {
        const widget = this.properties.find(c => c.name === '__widget__');
        if(widget) {
            let widget_type = widget.value;
            if(widget_type.startsWith('slider')) {
                widget.value = 'slider.' + step;
            } else if(widget_type.startsWith('spin')) {
                widget.value = 'spin.' + step;
            }
        }
        // console.log(this);
    }
}

class RtcParam {
    constructor() {
        this.name = '';
        this.vendor = '';
        this.category = '';
        this.version = '';
        this.description = '';
        this.componentType = '';
        this.activityType = '';
        this.componentKind = "DataFlowComponent";
        this.maxInstance = 0;
        this.executionType = '';
        this.executionRate = 0.0;
        this.rtcType = '';
        this.abstractDesc = '';
        this.hardwareProfile = '';
        /////
        this.actions = {};
        let ap = new ActionParam();
        ap.implemented = true;
        this.actions['onInitialize'] = ap;
        this.actions['onFinalize'] = new ActionParam();
        this.actions['onStartup'] = new ActionParam();
        this.actions['onShutdown'] = new ActionParam();
        this.actions['onActivated'] = new ActionParam();
        this.actions['onDeactivated'] = new ActionParam();
        this.actions['onAborting'] = new ActionParam();
        this.actions['onError'] = new ActionParam();
        this.actions['onReset'] = new ActionParam();
        this.actions['onExecute'] = new ActionParam();
        this.actions['onStateUpdate'] = new ActionParam();
        this.actions['onRateChanged'] = new ActionParam();

        this.inports = [];
        this.outports = [];
        this.serviceports = [];
        this.serviceClassParams = [];
        this.configParams = [];
        this.language = '';
        //
        this.doc_description = '';
        this.doc_in_out = '';
        this.doc_algorithm = '';
        this.doc_creator = '';
        this.doc_license = '';
        this.doc_reference = '';
        // 
        this.providerIdlPathes = [];
        this.consumerIdlPathes = [];
        this.originalProviderIdls = [];
        this.originalConsumerIdls = [];

        this.includedIdls = [];
        this.idlPathes = [];
        this.serviceClassParams = [];
        //
        this.commonPrefix = '';
	    this.commonSuffix = '';
        this.dataPortPrefix = '';
        this.dataPortSuffix = '';
        this.servicePortPrefix = '';
        this.servicePortSuffix = '';
        this.serviceIFPrefix = '';
        this.serviceIFSuffix = '';
        this.configurationPrefix = '';
        this.configurationSuffix = '';
        // 
        this.idlSearchPathList = [];
        this.dataTypeParams = [];
        this.dataDefParams = [];

        this.rtm_java_version = '';
        this.libraryPath = [];
    }

    validateBasicInfo() {
        if(this.name.length == 0) {
            return { ret: false, msg: translations["script.basic.VALIDATE_NAME1"] };
        }
        if(checkDigitAlphabet(this.name) == false) {
            return { ret: false, msg: translations["script.basic.VALIDATE_NAME2"] };
        }

        if(this.category.length == 0) {
            return { ret: false, msg: translations["script.basic.VALIDATE_CATEGORY"] };
        }

        if(this.version.length == 0) {
            return { ret: false, msg: translations["script.basic.VALIDATE_VERSION"] };
        }

        if(isIntegerString(this.maxInstance) == false) {
            return { ret: false, msg: translations["script.basic.VALIDATE_MAXINST1"] };
        }
        let maxNum = Number(this.maxInstance);
        if(maxNum <= 0) {
            return { ret: false, msg: translations["script.basic.VALIDATE_MAXINST2"] };
        }

        if(isDoubleString(this.executionRate) == false) {
            return { ret: false, msg: translations["script.basic.VALIDATE_ECRATE1"] };
        }
        let rateNum = Number(this.executionRate);
        if(rateNum <= 0) {
            return { ret: false, msg: translations["script.basic.VALIDATE_ECRATE2"] };
        }
        return { ret: true, msg: '' };
    }

    validateDataPortInfo() {
        const existed = new Set();
        const existedVarName = new Set();

        for(const dp of this.inports) {
            if(dp.name.length == 0) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTNAME1"] + ' DataInPort' };
            }
            if(checkDigitAlphabet(dp.name) == false) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTNAME2"]  + ' DataInPort : ' + dp.name };
            }

            if(dp.type.length == 0) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTTYPE"] + ' DataInPort : ' + dp.name };
            }

            if(checkDigitAlphabet(dp.varname) == false) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTVARNAME"] + ' DataInPort : ' + dp.name };
            }

            if(existed.has(dp.name)) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_DUPLICATE"] + ' DataInPort : ' + dp.name };
            }
            existed.add(dp.name);

            if(existedVarName.has(dp.varname)) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_VAR_DUPLICATE"] + ' DataInPort : ' + dp.name };
            }
            existedVarName.add(dp.varname);
        }

        for(const dp of this.outports) {
            if(dp.name.length == 0) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTNAME1"] + ' DataOutPort'};
            }
            if(checkDigitAlphabet(dp.name) == false) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTNAME2"] + ' DataOutPort : ' + dp.name };
            }

            if(dp.type.length == 0) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_PORTTYPE"] + ' DataOutPort : ' + dp.name };
            }
            
            if(checkDigitAlphabet(dp.varname) == false) {
                return { ret: false, msg: translations["script.bdataportasic.VALIDATE_PORTVARNAME"] + ' DataOutPort : ' + dp.name };
            }

            if(existed.has(dp.name)) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_DUPLICATE"] + ' DataOutPort : ' + dp.name };
            }
            existed.add(dp.name);

            if(existedVarName.has(dp.varname)) {
                return { ret: false, msg: translations["script.dataport.VALIDATE_VAR_DUPLICATE"] + ' DataOutPort : ' + dp.name };
            }
            existedVarName.add(dp.varname);
        }

        return { ret: true, msg: '' };
    }

    validateServicePortInfo() {
        const existed = new Set();
        const existedVarName = new Set();

        for(const sp of this.serviceports) {
            if(sp.name.length == 0) {
                return { ret: false, msg: translations["script.serviceport.VALIDATE_PORTNAME1"] };
            }
            if(checkDigitAlphabet(sp.name) == false) {
                return { ret: false, msg: translations["script.serviceport.VALIDATE_PORTNAME2"] + ' ' + sp.name};
            }

            if(existed.has(sp.name)) {
                return { ret: false, msg: translations["script.serviceport.VALIDATE_DUPLICATE"] + ' ' + sp.name};
            }
            existed.add(sp.name);

            for(const si of sp.serviceinterfaces) {
                if(si.name.length == 0) {
                    return { ret: false, msg: translations["script.serviceport.VALIDATE_IFNAME1"] + ' PortName : ' + sp.name};
                }
                if(checkDigitAlphabet(si.name) == false) {
                    return { ret: false, msg: translations["script.serviceport.VALIDATE_IFNAME2"] + ' PortName : ' + sp.name + ', IFName : ' + si.name};
                }
                if(checkDigitAlphabet(si.instancename) == false) {
                    return { ret: false, msg: translations["script.serviceport.VALIDATE_INSTNAME2"] + ' PortName : ' + sp.name + ', IFName : ' + si.name};
                }
                if(checkDigitAlphabet(si.varname) == false) {
                    return { ret: false, msg: translations["script.serviceport.VALIDATE_VARNAME"] + ' PortName : ' + sp.name + ', IFName : ' + si.name};
                }

                if(si.interfacetype.length == 0) {
                    return { ret: false, msg: translations["script.serviceport.VALIDATE_IFTYPE1"] + ' PortName : ' + sp.name + ', IFName : ' + si.name};
                }

                let varName;
                if(0 < si.varname.length) {
                    varName = si.varname;
                } else if(0 < si.instancename.length) {
                    varName = si.instancename;
                } else {
                    varName = si.name;
                }

                if(existedVarName.has(varName)) {
                    return { ret: false, msg: translations["script.serviceport.VALIDATE_VAR_DUPLICATE"] + ' PortName : ' + sp.name + ', IFName : ' + si.name};
                }
                existedVarName.add(varName);
            }
        }
        return { ret: true, msg: '' };
    }

    validateConfigurationInfo() {
        const existed = new Set();
        const existedVarName = new Set();

        for(const config of this.configParams) {
            if(config.name.length == 0) {
                return { ret: false, msg: translations["script.config.VALIDATE_NAME1"] };
            }
            if(checkDigitAlphabet(config.name) == false) {
                return { ret: false, msg: translations["script.config.VALIDATE_NAME2"] + ' ' + config.name};
            }

            if(config.type.length == 0) {
                return { ret: false, msg: translations["script.config.VALIDATE_TYPE"] + ' ' + config.name};
            }

            if(config.defaultValue.length == 0) {
                return { ret: false, msg: translations["script.config.VALIDATE_TYPE"] + ' ' + config.name};
            }

            if(checkDigitAlphabet(config.varname) == false) {
                return { ret: false, msg: translations["script.config.VALIDATE_VARIABLE"] + ' ' + config.name};
            }

            if(existed.has(config.name)) {
                return { ret: false, msg: translations["script.config.VALIDATE_DUPLICATE"] + ' ' + config.name};
            }
            existed.add(config.name);

            if(existedVarName.has(config.varname)) {
                return { ret: false, msg: translations["script.config.VALIDATE_VAR_DUPLICATE"] + ' ' + config.name};
            }
            existedVarName.add(config.varname);
        }
        return { ret: true, msg: '' };
    }

    getServiceInterfaceList() {
        const result = [];
        for (const servicePort of this.serviceports) {
            result.push(...servicePort.serviceinterfaces);
        }
        return result;
    }
    
    checkAndAddIDLPath(targetType, idlPathes, consumerIdlStrings, consumerIdlParams) {
        for (const dataTypes of this.dataTypeParams) {
            if (dataTypes.definedTypes.includes(targetType)) {
                const targetIDL = dataTypes.fullPath;

                if (targetIDL != null && !idlPathes.includes(targetIDL.trim())) {
                    idlPathes.push(targetIDL.trim());
                    consumerIdlStrings.push(targetIDL);
                }

                let isHit = false;

                for (const file of consumerIdlParams) {
                    if (file.idlPath === targetIDL) {
                        if (!file.targetTypes.includes(targetType)) {
                            file.targetTypes.push(targetType);
                        }
                        isHit = true;
                        break;
                    }
                }

                if (!isHit) {
                    const target = new IdlFileParam( { idlPath: targetIDL, parent: this} );
                    target.isDataPort = true;
                    target.targetTypes.push(targetType);
                    consumerIdlParams.push(target);
                }

                break;
            }
        }
    }
    
    checkExistIDL(providerIdlParams, consumerIdlParams, target) {
        for (const param of consumerIdlParams) {
            if (param.getIdlFile() === target.idlFile) {
                return true;
            }
        }

        for (const param of providerIdlParams) {
            if (param.getIdlFile() === target.idlFile) {
                return true;
            }
        }

        return false;
    }

    checkAndSetParameter() {
        const providerIdlStrings = [];
        const consumerIdlStrings = [];
        const idlPathes = [];
        const providerIdlParams = [];
        const consumerIdlParams = [];
        const originalConsumerIdlPathList = [];

        const serviceIFs = this.getServiceInterfaceList();

        // IDLパス，IDLサーチパスの確認
        for (const serviceInterface of serviceIFs) {
            if (serviceInterface.direction.toLowerCase() === 'provided') {
                if (!providerIdlStrings.includes(serviceInterface.idlfile)) {
                    const path = serviceInterface.idlfile.trim();
                    idlPathes.push(path);
                    providerIdlStrings.push(serviceInterface.idlfile);
                    providerIdlParams.push(new IdlFileParam( { idlPath: serviceInterface.idlfile,
                                                               parent: this}));
                }
            }
        }

        for (const serviceInterface of serviceIFs) {
            if (serviceInterface.direction.toLowerCase() === 'required') {
                originalConsumerIdlPathList.push(serviceInterface.idlFile);
                const path = serviceInterface.idlfile.trim();
                if (!idlPathes.includes(path)) {
                    idlPathes.push(path);
                    consumerIdlStrings.push(serviceInterface.idlfile);
                    consumerIdlParams.push(new IdlFileParam( { idlPath: serviceInterface.idlfile,
                                                               parent: this }));
                }
            }
        }

        // Inports
        for (const target of this.inports) {
            const localIdlPathes = [];
            this.checkAndAddIDLPath(target.type, localIdlPathes, consumerIdlStrings, consumerIdlParams);
            if (localIdlPathes.length > 0) {
                idlPathes.push(...localIdlPathes);
                target.idlFile = localIdlPathes[0];
            }
        }

        // Outports
        for (const target of this.outports) {
            if (this.checkExistIDL(providerIdlParams, consumerIdlParams, target)) continue;
            const localIdlPathes = [];
            this.checkAndAddIDLPath(target.type, localIdlPathes, consumerIdlStrings, consumerIdlParams);
            if (localIdlPathes.length > 0) {
                idlPathes.push(...localIdlPathes);
                target.idlFile = localIdlPathes[0];
            }
        }

        // Configs
        for (const target of this.configParams) {
            const localIdlPathes = [];
            this.checkAndAddIDLPath(target.type, localIdlPathes, consumerIdlStrings, consumerIdlParams);
            if (localIdlPathes.length > 0) {
                idlPathes.push(...localIdlPathes);
                target.idlFile = localIdlPathes[0];
            }
        }

        // IDL Search Pathの追加
        for (const serviceInterface of serviceIFs) {
            for (const idlParam of providerIdlParams) {
                if (serviceInterface.idlfile.trim() === idlParam.idlPath.trim()) {
                    for (const path of this.idlSearchPathList) {
                        if (path.isDefault) continue;
                        if (!idlParam.idlSearchPathes.includes(path.path)) {
                            idlParam.idlSearchPathes.push(path.path);
                        }
                    }
                    break;
                }
            }
            for (const idlParam of consumerIdlParams) {
                if (serviceInterface.idlfile.trim() === idlParam.idlPath.trim()) {
                    for (const path of this.idlSearchPathList) {
                        if (path.isDefault) continue;
                        if (!idlParam.idlSearchPathes.includes(path.path)) {
                            idlParam.idlSearchPathes.push(path.path);
                        }
                    }
                    break;
                }
            }
        }

        // 結果の反映
        this.providerIdlPathes.length = 0;
        this.providerIdlPathes.push(...providerIdlParams);
        this.consumerIdlPathes.length = 0;
        this.consumerIdlPathes.push(...consumerIdlParams);
        this.originalProviderIdls.length = 0;
        this.originalProviderIdls.push(...providerIdlStrings);
        this.originalConsumerIdls.length = 0;
        this.originalConsumerIdls.push(...originalConsumerIdlPathList);
    }

    getConsumerIdlPathesAdded() {
        const result = [];
        for (const target of this.consumerIdlPathes) {
            if(target.checkDefault()) continue;
            result.push(target);
        }
        return result;
    }

    resetIDLServiceClass() {
		for (const idl of this.providerIdlPathes) {
			for (const svc of this.serviceClassParams) {
				if (idl.idlPath === svc.idlPath) {
                    for(const ssvc of svc.superInterfaceList) {
                        const targetParam = this.serviceClassParams.find(item => item.name === ssvc);
                        if(targetParam) {
    						idl.serviceClass.push(targetParam);
                        }
                    }
					if (idl.serviceClass.includes(svc) == false) {
						idl.serviceClass.push(svc);
                        idl.includeIdlPathes = svc.includes;
					}
				}
			}
		}
		for (const idl of this.consumerIdlPathes) {
			for (const svc of this.serviceClassParams) {
				if (idl.idlPath === svc.idlPath) {
					if (idl.testServiceClass.includes(svc) == false) {
						idl.testServiceClass.push(svc);
					}
				}
			}
		}
    }

    checkWithoutDefaultPathes() {
        if (this.providerIdlPathes.length > 0) {
            for (const e of this.providerIdlPathes) {
            if (!e.checkDefault()) return true;
            }
        }

        if (this.consumerIdlPathes.length > 0) {
            for (const e of this.consumerIdlPathes) {
            if (!e.checkDefault()) return true;
            }
        }

        return false;
    }

}   


function checkDigitAlphabet(source) {
  if (source == null) return true;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const code = char.charCodeAt(0);

    if (
      (code < 48 || code > 57) &&    // '0'〜'9'
      (code < 97 || code > 122) &&   // 'a'〜'z'
      (code < 65 || code > 90) &&    // 'A'〜'Z'
      char !== '_' &&
      char !== '-' &&
      char !== ':'
    ) {
      return false;
    }
  }

  return true;
}

function isIntegerString(str) {
  const num = Number(str);
  return Number.isInteger(num);
}

function isDoubleString(str) {
  const num = Number(str);
  return Number.isFinite(num);
}

module.exports = {
  IdlPathParam,
  IdlFileParam,
  DataTypeParam,
  ServiceClassParam,
  RtcParam,
  ActionParam,
  PropertyParam,
  DataPortParam,
  ServicePortInterfaceParam,
  ServicePortParam,
  ConfigSetParam,
  GeneratedResult
};
