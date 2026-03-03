const path = require("path");
const js2xmlparser = require('js2xmlparser');

const { ELEM_DELIMITOR,
		ISO_PREFIX,
		INOUT_SUFFIX_IN,
		INOUT_SUFFIX_OUT,
		CONTAINER_PREFIX,
		SIMParam, 
		VariableParam,
		ServiceProfileParam, ServiceMethodParam, ArgSpecParam,
		PropertyParam, CompilerTypeParam, LibrariesParam,
		NVListParam, NameValue, 
		ModuleIDParam,
		InfraTypeParam, CommunicationParam, DataBusParam,
		SafetyFunctionParam, CyberSecurityParam,
		RangeStringParam, 
		ModelCaseParam,
		ExeFormParam,
		ExecutionTypeParam,
		LibraryParam} = require('./isoDataModels');

function convertRtc2Iso(param) {
	let result = new SIMParam();
	let simNv = result.additionalInfo;

	createISONameValue('profileVersion', param.profile_version, simNv);
	createNameValue("SIM_Version", "iso22166-202:2025", "", simNv);

	result.moduleName = param.name;
	result.description = param.description;
	result.manufacturer = param.vendor;

  	result.idnType.informationModelVersion = param.version;

	createISONameValue("componentKind", param.componentKind, simNv);
	createISONameValue("rtcType", param.rtcType, simNv);
	createISONameValue("category", param.category, simNv);
	createISONameValue("executionType", param.executionType, simNv);
	if (param.maxInstance != null && 0 < param.maxInstance) {
		createISONameValue("maxInstances", String(param.maxInstance), simNv);
	}
	createISONameValue("abstract", param.abstractDesc, simNv);
	createISONameValue("hardwareProfile", param.hardwareProfile, simNv);
	if(param.creation_date != null) {
		createISONameValue("creationDate", param.creation_date, simNv);
	}
	if(param.update_date != null) {
		createISONameValue("updateDate", param.update_date, simNv);
	}
		
	createISONameValue("docAlgorithm", param.doc_algorithm, simNv);
	createISONameValue("docDescription", param.doc_description, simNv);
	createISONameValue("docInout", param.doc_in_out, simNv);
	createISONameValue("docCreator", param.doc_creator, simNv);
	createISONameValue("docLicense", param.doc_license, simNv);
	createISONameValue("docReference", param.doc_reference, simNv);

	createISONameValue("extComment", param.comment, simNv);
	createISONameValue("extSaveProject", param.save_project, simNv);
	createISONameValue("extVersionUpLog", param.version_up_log, simNv);
		
	let exeType = new ExecutionTypeParam();
	result.properties.exeType.push(exeType); 
	exeType.opType = convertActivityType(param.activityType);
	exeType.instanceType = convertComponentType(param.componentType);
	exeType.timeConstraint = param.executionRate;

	const propList = param.properties;
	// propList.sort(Comparator.comparing(Property::getName));
	parseBasicProperties(result, propList);
	//////////
	let skipNames = []; 
	convertDataPort(result, 'IN', param.inports, skipNames, param.outports);
	convertDataPort(result, 'OUT', param.outports, skipNames, param.inports);
	//////////
	result.services.noOfBasicService = param.serviceports.length;
	result.services.noOfOptionalService = 0;
	for(const sport of param.serviceports) {
		let prof = new ServiceProfileParam();
		result.services.serviceProfile.push(prof);
		let serviceNv = prof.additionalInfo;

		prof.id = sport.name;
		createISONameValue("description", sport.doc_description, serviceNv);
		createISONameValue("ifdescription", sport.doc_if_description, serviceNv);
		createISONameValue("comment", sport.comment, serviceNv);
		createISONameValue("position", sport.position, serviceNv);

		for(const prop of sport.properties) {
			let  key = prop.name;
			
			if(equalsKey(key, "ifurl")) {
				prof.ifURL = prop.value;
			} else if(equalsKey(key, "pvtype")) {
				prof.pvType = prop.value;
			} else if(equalsKey(key, "motype")) {
				prof.moType = prop.value;
			} else {
				createISONameValue(prop.name, prop.value, serviceNv);
			}
		}
		if(serviceNv.nv.length == 0) {
			prof.additionalInfo = null;
		}
			
		// 	for(TransmissionMethod trans : port.getTransMethods() ) {
		// 		createNameValue(factory, "kind", trans.getKind(), serviceNv);
		// 	}
			
		for(const sif of sport.serviceinterfaces) {
			let method = new ServiceMethodParam();
			prof.methodList.push(method);
			let sifNv = method.additionalInfo;

			method.methodName = sif.name;
			method.retType = sif.interfacetype;
			method.reqProvType = sif.direction;
			method.moType = getTargetPropertyValue(sif.properties, "motype");
			createISONameValue("instanceName", sif.instancename, sifNv);
			if(sif.idlfile != null && isValidFileName(sif.idlfile)) {
				createISONameValue("idlFile", path.basename(sif.idlfile), sifNv);
				let dir = path.dirname(sif.idlfile);
				if(dir !== ".") {
					createISONameValue("path", path.dirname(sif.idlfile), sifNv);
				}
			}
			if(sif.idlDispfile != null && isValidDispFileName(sif.idlDispfile)) {
				createISONameValue("idlDispFile", path.basename(sif.idlDispfile), sifNv);
				createISONameValue("DispPath", path.dirname(sif.idlDispfile), sifNv);
			}
			createISONameValue("description", sif.doc_description, sifNv);
			createISONameValue("docArgument", sif.doc_argument, sifNv);
			createISONameValue("docReturn", sif.doc_return, sifNv);
			createISONameValue("docException", sif.doc_exception, sifNv);
			createISONameValue("docPreCondition", sif.doc_pre_condition, sifNv);
			createISONameValue("docPostCondition", sif.doc_post_condition, sifNv);

			createISONameValue("comment", sif.comment, sifNv);
			createISONameValue("variableName", sif.varname, sifNv);
			parseInterfaceProperties(sif.properties, method, sifNv);
			if(sifNv.nv.length == 0) {
				method.additionalInfo = null;
			}
		}
	}
	//////////
	for(const conf of param.configParams ) {
		let prop = new PropertyParam();
		result.properties.property.push(prop);
		let propNv = prop.additionalInfo;

		prop.name = conf.name;
		prop.type = conf.type;
		prop.value = conf.defaultValue;
		prop.unit = conf.unit;
		createISONameValue("constraint", conf.constraint, propNv);
		prop.description = conf.doc_description;
		createISONameValue("docDataname", conf.doc_dataname, propNv);
		createISONameValue("docDefaultValue", conf.doc_default, propNv);
		createISONameValue("docUnit", conf.doc_unit, propNv);
		createISONameValue("docRange", conf.doc_range, propNv);
		createISONameValue("docConstraint", conf.doc_constraint, propNv);
		createISONameValue("comment", conf.comment, propNv);
		createISONameValue( "variableName", conf.varname, propNv);
		for(const confprop of conf.properties) {
			let key = confprop.name;
			let value = confprop.value;
			
			if(equalsKey(key, "immutable")) {
				prop.immutable = value;
			} else {
				createISONameValue(key, value, propNv);
			}
		}
		if(propNv.nv.length == 0) {
			prop.additionalInfo = null;
		}
	}
	//////////
	let compiler = new CompilerTypeParam();
	result.properties.compiler = compiler;
	compiler.compilerName = param.language;

	const lang = param.lang;
	if(lang!=null) {
		for(const env of lang.targets) {
			let langVer = env.langVersion;
			if(langVer.startsWith(CONTAINER_PREFIX) == false) {
				compiler.osName = env.os;
				const cpus = env.CPUs;
				if(0<cpus.length) {
					compiler.bitnCPUarch = cpus[0];
				}

				const strVersion = env.langVersion;
				if(strVersion.includes(ELEM_DELIMITOR)) {
					let elems = strVersion.split(ELEM_DELIMITOR);
					if(0<elems.length) {
						let range = new RangeStringParam();
						compiler.verRangeCompiler = range;
						range.min = elems[0];
						if(1<elems.length) {
							range.max = elems[1];
						}
					}
				}
				if(0<env.libraries.length) {
					for(const each of env.libraries ) {
						let lib = new LibraryParam();
						lib.name = each.name;
						lib.version = each.version;
						result.properties.libs.libraries.push(lib);
					}
				}
			}
		}
	}
	//////////
	let containerNum = 0;
	for(const each of param.containerSettings) {
		let langVer = each.language;
		let middleware = each.middleware;
		let mdlVersion = each.mdlVersion;
		let osVersion = each.osVersion;
		let workSpace = each.workspace;
		let config = each.configuration;
		//
		const elems = osVersion.split(" ");
		const osPart = (elems.length > 0 ? elems[0] : "") +	"-" + (elems.length > 1 ? elems[1] : "");
		const mwName = middleware.replace(/ /g, "");
		const fileURL = `${CONTAINER_PREFIX}${param.name}__${osPart}__${mwName}-${mdlVersion.toLowerCase()}__${config}.Dockerfile`;
		
		containerNum = containerNum + 1;
		let exeForm = new ExeFormParam();
		result.exeForm.exeForm.push(exeForm);
		let exeNv = exeForm.additionalInfo;

		exeForm.exeFileURL = fileURL;
		createNameValue(CONTAINER_PREFIX + "Middleware", middleware, "", exeNv);
		createNameValue(CONTAINER_PREFIX + "MiddlewareVersion", mdlVersion, "", exeNv);
		createNameValue(CONTAINER_PREFIX + "TargetOSVersion", osVersion, "", exeNv);
		createNameValue(CONTAINER_PREFIX + "Workspace", workSpace, "", exeNv);
		createNameValue(CONTAINER_PREFIX + "Language", CONTAINER_PREFIX + langVer, "", exeNv);
		createNameValue(CONTAINER_PREFIX + "Configuration", config, "", exeNv);

		const libraryList = getTargetStartPropertyRaw(lang.properties, CONTAINER_PREFIX + "lib_" + containerNum);
		for(const lib of libraryList) {
			createNameValue(CONTAINER_PREFIX + "Libraries", lib.value, "", exeNv);
		}
		for(const rep of each.repositories) {
			createNameValue(CONTAINER_PREFIX + "GitURL", rep.URL + " " + rep.Branch, "", exeNv);			
		}
		const presetList = getTargetStartPropertyRaw(lang.properties, CONTAINER_PREFIX + "category_" + containerNum);
		for(const lib of presetList) {
			createNameValue(CONTAINER_PREFIX + "category", lib.value, "", exeNv);
		}
	}
	//////////
	for(const each in param.actions ) {
		let action = param.actions[each];
		createActionInfo(action, each, simNv);
	}

	return result;
}

function convertDataPort(result, inout, portList, skipNames, oppPortList) {
	for(const port of portList ) {
		let portName = port.name;
		if(skipNames.includes(portName)) continue;

		let isInOut = false;
		let oppBaseName = undefined;

		if(portName.endsWith(INOUT_SUFFIX_IN) || portName.endsWith(INOUT_SUFFIX_OUT)) {
			let oppPortName = undefined;
			if(portName.endsWith(INOUT_SUFFIX_IN)) {
				oppBaseName = portName.substring(0, portName.length - INOUT_SUFFIX_IN.length);
				oppPortName = oppBaseName + INOUT_SUFFIX_OUT;
			} else if(portName.endsWith(INOUT_SUFFIX_OUT)) {
				oppBaseName = portName.substring(0, portName.length - INOUT_SUFFIX_OUT.length);
				oppPortName = oppBaseName + INOUT_SUFFIX_IN;
			}
			let oppPortOpt = oppPortList.find(u => u.name === oppPortName);
			if(oppPortOpt != null) {
				if(compareDataPort(port, oppPortOpt)) {
					skipNames.push(oppPortName);
					isInOut = true;
				}
			}
		}
		/////
		let ioVar = new VariableParam();
		result.ioVariables.variable.push(ioVar);
		let iovarNv = ioVar.additionalInfo;

		if(isInOut) {
			ioVar.name = oppBaseName;
			ioVar.ioType = 'INOUT';
		} else {
			ioVar.name = port.name;
			ioVar.ioType = inout;
		}

		ioVar.type = port.type;
		ioVar.unit = port.unit;
		ioVar.description = port.doc_description;
		createISONameValue("idlFile", port.dispIdlFile, iovarNv);
		createISONameValue("interfaceType", port.interfaceType, iovarNv);
		createISONameValue("dataflowType", port.dataFlowType, iovarNv);
		createISONameValue("subscriptionType", port.subscriptionType, iovarNv);
		createISONameValue("type", port.doc_type, iovarNv);
		createISONameValue("number", port.doc_num, iovarNv);
		createISONameValue("semantics", port.doc_semantics, iovarNv);
		createISONameValue("unit", port.doc_unit, iovarNv);
		createISONameValue("occurrence", port.doc_occerrence, iovarNv);
		createISONameValue("operation", port.doc_operation, iovarNv);
		createISONameValue("comment", port.comment, iovarNv);
		createISONameValue("variableName", port.varname, iovarNv);
		createISONameValue("position", port.position, iovarNv);

		for(const prop of port.properties) {
			let key = prop.name;
				
			if(equalsKey(key, "value")) {
				ioVar.value = prop.value;
			} else {
				createISONameValue(prop.name, prop.value, iovarNv);
			}
		}
		if(iovarNv.nv.length == 0) {
			ioVar.additionalInfo = null;
		}
	}
}

function compareDataPort(port01, port02) {
	if(port01.type !== port02.type) return false;
	if(port01.idlfile !== port02.idlfile) return false;
	if(port01.interfacetype !== port02.interfacetype) return false;
	if(port01.dataFlowType !== port02.dataFlowType) return false;
	if(port01.subscriptionType !== port02.subscriptionType) return false;
	if(port01.unit !== port02.unit) return false;
		
	if(port01.doc_description !== port02.doc_description) return false;
	if(port01.doc_type !== port02.doc_type) return false;
	if(port01.doc_num !== port02.doc_num) return false;
	if(port01.doc_semantics !== port02.doc_semantics) return false;
	if(port01.doc_unit !== port02.doc_unit) return false;
	if(port01.doc_occerrence !== port02.doc_occerrence) return false;
	if(port01.doc_operation !== port02.doc_operation) return false;

	if(port01.comment !== port02.comment) return false;
	if(port01.varname !== port02.varname) return false;

	let props01 = port01.properties;
	let props02 = port02.properties;
	if(props01.length != props02.length) return false;
	for(let index=0; index<props01.length; index++) {
		let prop01 = props01[index];
		let prop02 = props02[index];
		if(prop01.name !== prop02.name) return false;
		if(prop01.value !== prop02.value) return false;
	}
	return true;
}

function parseInterfaceProperties(propList, method, sifNv) {
	for(const prop of propList) {
		const key = prop.name;
		const value = prop.value;
		if(!value || value.length == 0) continue;
			
		if(startsWithKey(key, "argtype_valuename")) {
			if(equalsKey(key, "argtype_valuename") ==false) continue;
				
			let arg = new ArgSpecParam();
			method.argType.push(arg);
			arg.valueName = value;
			const argNv = arg.additionalInfo;
			arg.type= getTargetPropertyValue(propList, "argtype_" + value.toLowerCase() + "_type");
				
			arg.inout = getTargetPropertyValue(propList, "argtype_" + value.toLowerCase() + "_inout");
			
			const otherList = getTargetStartProperty(propList, "argtype_" + value.toLowerCase() + "_add_");
			for(const each of otherList) {
				const orgKey = each.name.replace("argType_" + value + "_add_", "");
				createISONameValue(orgKey, each.value, argNv);
			}
			if(argNv.nv.length == 0) {
				arg.additionalInfo = null;
			}
		} else {
			if(equalsKey(key, "motype")) continue;
			if(startsWithKey(key, "argtype_")) continue;

			createISONameValue(key, value, sifNv);
		}
	}
}

function parseBasicProperties(result, propList) {
	const status = result.status;
	const simNv = result.additionalInfo;
		
	result.examples = getTargetPropertyValue(propList, "examples");

	const exeTypeList = getTargetStartProperty(propList, "exeType_");
	if(0<exeTypeList.length) {
		buildExeType(result, exeTypeList);
	}
	const infraList = getTargetStartProperty(propList, "infra_");
	if(0<infraList.length) {
		buildInfrastructure(result, infraList);
	}
	const safesList = getTargetStartProperty(propList, "safesecure_");
	if(0<safesList.length) {
		buildSafeSecure(result, safesList);
	}
	const modelList = getTargetStartProperty(propList, "modelling_");
	if(0<modelList.length) {
		buildModelling(result, modelList);
	}
	const exeflList = getTargetStartProperty(propList, "exeForm_");
	if(0<exeflList.length) {
		buildExeForm(result, exeflList);
	}
		
	for(const prop of propList) {
		const key = prop.name;
		const value = prop.value;
		
		if(!value || value.length == 0) continue;

		if(equalsKey(key, "examples")
			|| equalsKey(key, "profileVersion")
			|| startsWithKey(key, "exeType_")
			|| startsWithKey(key, "infra_")
			|| startsWithKey(key, "safesecure_")
			|| startsWithKey(key, "modelling_")
			|| startsWithKey(key, "exeform_")) continue;
			
		if(equalsKey(key, "swaspects")) {
			if(value.includes(ELEM_DELIMITOR) == false) continue;
			let elems = value.split(ELEM_DELIMITOR);
			if(0 < elems.length) {
				let mid = new ModuleIDParam();
				result.idnType.swAspects.push(mid);
				mid.mID = elems[0];
				if(1 < elems.length) {
					mid.iID = elems[1];
				}
			}

		} else if(equalsKey(key, "mID")) {
			result.idnType.moduleID.mID = value;
		} else if(equalsKey(key, "iID")) {
			result.idnType.moduleID.iID = value;

		} else if(equalsKey(key, "osType_type")){
			result.properties.osType.type = value;
		} else if(equalsKey(key, "osType_bit")){
			result.properties.osType.bit = value;
		} else if(equalsKey(key, "osType_version")){
			result.properties.osType.version = value;

		} else if(equalsKey(key, "executionstatus")) {
			status.executionStatus = value;
		} else if(equalsKey(key, "errortype")) {
			status.errorType = value;
		} else {
			createISONameValue(key, value, simNv);
		}
	}
}
	
function buildExeType(result, propList) {
	const exeTypes = result.properties.exeType;
	let exeType = exeTypes[0];

	const hardRtStr = getTargetPropertyValue(propList, "exeType_hardRT");
	if(0 < hardRtStr.length) {
		exeType.hardRT = hardRtStr.toLowerCase() === "true";
	}
	const priorityStr = getTargetPropertyValue(propList, "exeType_priority");
	if(0 < priorityStr.length) {
		exeType.priority = hexStringToBytes(priorityStr);
	}
	
	for(const each of propList) {
		const eachKey = each.name.replace(ISO_PREFIX, "");
		const eachValue = each.value;
		
		if(equalsKey(eachKey, "exeType_hardRT")
				|| equalsKey(eachKey, "exeType_priority")) continue;

		const elems = eachKey.split("_");
		if(elems.length < 3) continue;
		
		const funcNoStr = elems[1];
		let func;
		const funcNo = Number(funcNoStr);

		if(exeTypes.length < funcNo + 1) {
			func = new ExecutionTypeParam();
			result.properties.exeType.push(func);
			
		} else {
			func = exeTypes[funcNo]; 
		}

		if(eachKey.endsWith("_opType")) {
			func.opType = eachValue;
		} else if(eachKey.endsWith("_hardRT")) {
			func.hardRT = eachValue.toLowerCase() === "true";
		} else if(eachKey.endsWith("_timeConstraint")) {
			func.timeConstraint = parseFloat(eachValue);
		} else if(eachKey.endsWith("_priority")) {
			func.priority = hexStringToBytes(eachValue);
		} else if(eachKey.endsWith("_instanceType")) {
			func.instanceType = eachValue;
		}
	}
}

function buildExeForm(result, propList) {
	const exeFrom = result.exeForm;
		
	const libList = getTargetStartProperty(propList, "exeForm_LibraryURL");
	for(const each of libList) {
		exeFrom.libraryURL.push(each.value);
	}
		
	for(const each of propList) {
		const eachKey = each.name.replace(ISO_PREFIX, "");
		const eachValue = each.value;
			
		if(eachKey === "exeForm_LibraryURL") continue;
			
		const elems = eachKey.split("_");
		if(elems.length < 3) continue;
			
		const funcNoStr = elems[2];
		let func;
		const funcNo = Number(funcNoStr);
		if(exeFrom.exeForm.length < funcNo) {
			func = new ExeFormParam();
			exeFrom.exeForm.push(func);
					
			const otherList = getTargetStartProperty(propList, "exeForm_" + funcNo + "_add_");
			const mcNv = func.additionalInfo;
			for(const eachP of otherList) {
				const orgKey = eachP.name.replace("exeForm_" + funcNo + "_add_", "");
				createISONameValue(orgKey, eachP.value, mcNv);
			}
			if(mcNv.nv.length == 0) {
				func.additionalInfo = null;
			}
		} else {
			func = exeFrom.exeForm[funcNo-1]; 
		}
			
		if(eachKey.endsWith("_exeFileURL")) {
			func.exeFileURL = eachValue;
		} else if(eachKey.endsWith("_shellCmd")) {
			func.shellCmd = eachValue;
		}
	}
	const exeNum = exeFrom.exeForm.length;
	for(let index=0; index<exeNum; index++) {
		const ef = exeFrom.exeForm[index];
		const efIdx = index + 1;
		const efNv = ef.additionalInfo;
			
		const exePropList = getTargetStartProperty(propList, "exeform_" + efIdx + "_property_");
		for(const each of exePropList) {
			const eachKey = each.name;
			const eachValue = each.value;
				
			const elems = eachKey.split("_");
			if(elems.length < 5) continue;
				
			const propNoStr = elems[4];
			let targetProp;
			const propNo = Number(propNoStr);
			if(ef.properties.length < propNo) {
				targetProp = new PropertyParam();
				ef.properties.push(targetProp);
			} else {
				targetProp = ef.properties[propNo-1]; 
			}
				
			if(eachKey.endsWith("_value")) {
				targetProp.value = eachValue;
			} else if(eachKey.endsWith("_immutable")) {
				targetProp.immutable = eachValue;
			} else if(eachKey.endsWith("_description")) {
				targetProp.description = eachValue;
			} else if(eachKey.endsWith("_name")) {
				targetProp.name = eachValue;
			} else if(eachKey.endsWith("_type")) {
				targetProp.type = eachValue;
			} else if(eachKey.endsWith("_unit")) {
				targetProp.unit = eachValue;
			}
		}
	}
}
	
function buildModelling(result, modelList) {
	const modelling = result.modelling;
		
	for(const each of modelList) {
		const eachKey = each.name.replace(ISO_PREFIX, "");
		const eachValue = each.value;

		if(!eachValue) continue;
		const elems = eachKey.split("_");
		if(elems.length < 2) continue;
			
		const funcNoStr = elems[1];
		let func;
		const modelNo = Number(funcNoStr);
		if(modelling.simulationModel.length < modelNo) {
			func = new ModelCaseParam();
			modelling.simulationModel.push(func);
					
			const modelPropList = getTargetStartProperty(modelList, "modelling_" + modelNo + "_add_");
			const mcNv = func.additionalInfo;
			for(const eachP of modelPropList) {
				const orgKey = eachP.name.replace("modelling_" + modelNo + "_add_", "");
				createISONameValue(orgKey, eachP.value, mcNv);
			}
			if(mcNv.nv.length == 0) {
				func.additionalInfo = null;
			}
		} else {
			func = modelling.simulationModel[modelNo-1]; 
		}
		if(eachKey.endsWith("_simulator")) {
			func.simulator = eachValue;
		} else if(eachKey.endsWith("_mdf")) {
			const elems = eachValue.split(',');
			func.mdf.push(elems);
		} else if(eachKey.endsWith("_lib")) {
			func.libraries.push(eachValue);
		}
	}
		
	const mcNum = modelling.simulationModel.length;
	for(let index=0; index<mcNum; index++) {
		const mc = modelling.simulationModel[index];
		const mcIdx = index + 1;
		const mcNv = mc.additionalInfo;

		const dynamicList = getTargetStartProperty(modelList, "modelling_" + mcIdx + "_dynamicsw_");
		for(const  each of dynamicList) {
			const eachKey = each.name.replace(ISO_PREFIX, "");
			const eachValue = each.value;
				
			const elems = eachKey.split("_");
			if(elems.length < 4) continue;
				
			const dynamicNoStr = elems[3];
			let targetDyn;
			const dynamicNo = Number(dynamicNoStr);
			if(mc.dynamicSW.length < dynamicNo) {
				targetDyn = new ExeFormParam();
				mc.dynamicSW.push(targetDyn);
				const dynPropList = getTargetStartProperty(modelList, "modelling_" + mcIdx + "_dynamicsw_" + dynamicNo + "_add_");
				const dynNv = targetDyn.additionalInfo;
				for(const eachP of dynPropList) {
					const orgKey = eachP.name.replace("modelling_" + mcIdx + "_dynamicsw_" + dynamicNo + "_add_", "");
					createISONameValue(orgKey, eachP.value, dynNv);
				}
				if(dynNv.nv.length == 0) {
					targetDyn.additionalInfo = null;
				}

			} else {
				targetDyn = mc.dynamicSW[dynamicNo-1]; 
			}
			if(eachKey.endsWith("_exeFileURL")) {
				targetDyn.exeFileURL = eachValue;
			} else if(eachKey.endsWith("_shellCmd")) {
				targetDyn.shellCmd = eachValue;
			}
		}
			
		const dynamicNum = mc.dynamicSW.length;
		for(let idxDyn=0; idxDyn<dynamicNum; idxDyn++) {
			const targetDyn = mc.dynamicSW[idxDyn];
			const dynIdx = idxDyn + 1;
				
			const propertyList = getTargetStartProperty(modelList, "modelling_" + mcIdx + "_dynamicsw_" + dynIdx + "_property_");
			for(const each of propertyList) {
				const eachKey = each.name;
				const eachValue = each.value;
					
				const elems = eachKey.split("_");
				if(elems.length < 6) continue;
					
				const propNoStr = elems[5];
				let targetProp;
				const propNo = Number(propNoStr);
				if(targetDyn.properties.length < propNo) {
					targetProp = new PropertyParam();
					targetDyn.properties.push(targetProp);
				} else {
					targetProp = targetDyn.properties[propNo-1]; 
				}

				if(eachKey.endsWith("_value")) {
					targetProp.value = eachValue;
				} else if(eachKey.endsWith("_immutable")) {
					targetProp.immutable = eachValue;
				} else if(eachKey.endsWith("_description")) {
					targetProp.description = eachValue;
				} else if(eachKey.endsWith("_name")) {
					targetProp.name = eachValue;
				} else if(eachKey.endsWith("_type")) {
					targetProp.type = eachValue;
				} else if(eachKey.endsWith("_unit")) {
					targetProp.unit = eachValue;
				}
			}
		}
	}
}
	
function buildSafeSecure(result, propList) {
	const safes = result.safeSecure;
	const safesNv = safes.additionalInfo;

	const otherList = getTargetStartProperty(propList, "safesecure_add_");
	for(const each of otherList) {
		const orgKey = each.name.replace("safeSecure_add_", "");
		createISONameValue(orgKey, each.value, safesNv);
	}
	if(safesNv.nv.length == 0) {
		safes.additionalInfo = null;
	}
	///////
	safes.overallValidSafetyLevelType = getTargetPropertyValue(propList, "safesecure_overallValidsafetyleveltype");
	safes.overallSafetyLevelPL = getTargetPropertyValue(propList, "safesecure_overallsafetylevelpl");
	safes.overallSafetyLevelSIL = getTargetPropertyValue(propList, "safesecure_overallsafetylevelsil");
	safes.overallPhySecurityLevel = getTargetPropertyValue(propList, "safesecure_overallphysecuritylevel");
	safes.overallCybSecurityLevel = getTargetPropertyValue(propList, "safesecure_overallcybsecuritylevel");
	///////
	const inSafeList = getTargetStartProperty(propList, "safesecure_insafetylevel_");
	for(const each of inSafeList) {
		const eachKey = each.name.replace(ISO_PREFIX, "");
		const eachValue = each.value;
			
		const elems = eachKey.split("_");
		if(elems.length < 3) continue;
			
		const funcNoStr = elems[2];
		let func;
		const insafeNo = Number(funcNoStr);
		if(safes.inSafetyLevel.length < insafeNo) {
			func = new SafetyFunctionParam();
			safes.inSafetyLevel.push(func);
		} else {
			func = safes.inSafetyLevel[insafeNo-1]; 
		}
			
		if(eachKey.endsWith("_safetyFunctionType")) {
			func.safetyFunctionType = eachValue;
		} else if(eachKey.endsWith("_validSafetyLevelType")) {
			func.validSafetyLevelType = eachValue;
		} else if(eachKey.endsWith("_eachSafetyLevelPL")) {
			func.eachSafetyLevelPL = eachValue;
		} else if(eachKey.endsWith("_eachSafetyLevelSIL")) {
			func.eachSafetyLevelSIL = eachValue;
		}
	}
		
	const inCyberList = getTargetStartProperty(propList, "safesecure_incybsecuritylevel_");
	for(const each of inCyberList) {
		const eachKey = each.name.replace(ISO_PREFIX, "");
		const eachValue = each.value;
			
		const elems = eachKey.split("_");
		if(elems.length < 3) continue;
			
		const inCyberNoStr = elems[2];
		let func;
		const inCyberNo = Number(inCyberNoStr);
		if(safes.inCybSecurityLevel.length < inCyberNo) {
			func = new  CyberSecurityParam();
			safes.inCybSecurityLevel.push(func);
		} else {
			func = safes.inCybSecurityLevel[inCyberNo-1]; 
		}
		if(eachKey.endsWith("_securityType")) {
			func.securityType = eachValue;
		} else if(eachKey.endsWith("_eachSecurityLevel")) {
			func.eachSecurityLevel = eachValue;
		}
	}
}
	
function buildInfrastructure(result, propList) {
	let infra = result.infra;
	let infraNv = new NVListParam();
	const otherList = getTargetProperty(propList, "infra_add_");
	for(const each of otherList) {
		let orgKey = each.name.replace(ISO_PREFIX + "infra_add_", "");
		createISONameValue(orgKey, each.value, infraNv);
	}
	if(infraNv.nv.length == 0) {
		infra.additionalInfo = null;
	}
	///////				
	const dbList = getTargetProperty(propList, "infra_database");
	for(const each of dbList) {
		const eachValue = each.value;
		if(eachValue.includes(ELEM_DELIMITOR) == false) continue;
		let elems = eachValue.split(ELEM_DELIMITOR);
			
		if(0 < elems.length) {
			let itype = new InfraTypeParam();
			infra.database.push(itype);
			itype.name = elems[0];
			if(1 < elems.length) {
				let range = new RangeStringParam();
				itype.version = range;
				range.min = elems[1];
				if(2 < elems.length) {
					range.max = elems[2];
				}
			}
		}
	}
	//			
	const mtpList = getTargetStartProperty(propList, "infra_comms_mosttop");
	for(const each of mtpList) {
		const eachKey = each.name;
		const eachValue = each.value;
			
		const commsNoStr = eachKey.replace(ISO_PREFIX + "infra_comms_mostTop_", "");
		const commsNo = Number(commsNoStr);
		let comms;
		if(infra.comms.length < commsNo) {
			comms = new CommunicationParam();
			infra.comms.push(comms);
		} else {
			comms = infra.comms[commsNo-1]; 
		}

		if(eachValue.includes(ELEM_DELIMITOR) == false) continue;
		let elems = eachValue.split(ELEM_DELIMITOR);
		if(0 < elems.length) {
			let itype = new InfraTypeParam();
			comms.mostTopProtocol.push(itype);
			itype.name = elems[0];
			if(1 < elems.length) {
				let range = new RangeStringParam();
				itype.version = range;
				range.min = elems[1];
				if(2 < elems.length) {
					range.max = elems[2];
				}
			}
		}
	}

	const commNum = infra.comms.length;
	for(let index=0; index<commNum; index++) {
		const comIdx = index + 1;
		const upList = getTargetStartProperty(propList, "infra_comms_underlaying_" + comIdx);
		if(0<upList.length) {
			const targetCom =infra.comms[index]; 
			const  dBus = new DataBusParam();
			targetCom.underlyingProtocol = dBus;
			const dbNv = dBus.additionalInfo;
			for(const each of upList) {
				const eachName = each.name;
				const eachValue = each.value;
				if(startsWithKey(eachName, "infra_comms_underlaying_" + comIdx + "_connectionType")) {
					dBus.connectionType = eachValue;
				} else if(startsWithKey(eachName, "infra_comms_underlaying_" + comIdx + "_typePhyMac")) {
					dBus.typePhyMac = eachValue;
				} else if(startsWithKey(eachName, "infra_comms_underlaying_" + comIdx + "_typeNetTrans")) {
					dBus.typeNetTrans.push(eachValue.split(","));
				} else if(startsWithKey(eachName, "infra_comms_underlaying_" + comIdx + "_typeApp")) {
					dBus.typeApp.push(eachValue.split(","));
				} else if(startsWithKey(eachName, "infra_comms_underlaying_" + comIdx + "_speed")) {
					dBus.speed = eachValue;
				} else if(startsWithKey(eachName, "infra_comms_underlaying_" + comIdx + "_add_")) {
					const orgKey = each.name.replace("infra_comms_underlaying_" + comIdx + "_add_", "");
					createISONameValue(orgKey, eachValue, dbNv);
				}
			}
			if(dbNv.nv.length == 0) {
				dBus.additionalInfo = null;
			}
		}
	}
	///////				
	const mwList = getTargetStartProperty(propList, "infra_middleware");
	for(const each of mwList) {
		const eachValue = each.value;
		if(!eachValue) continue;
		if(eachValue.includes(ELEM_DELIMITOR) == false) continue;
		const elems = eachValue.split(ELEM_DELIMITOR);
		
		if(0 < elems.length) {
			const itype = new InfraTypeParam();
			infra.middleware.push(itype);
			itype.name = elems[0];
			if(1 < elems.length) {
				const range = new RangeStringParam();
				itype.version = range;
				range.min = elems[1];
				if(2 < elems.length) {
					range.max = elems[2];
				}
			}
		}
	}
}
	
function convertActivityType(source) {
	if(source.toUpperCase() === "PERIODIC") {
		return "PERIODIC";
	} else if(source.toUpperCase() === "EVENTDRIVEN") {
		return "EVENTDRIVEN";
	} else if(source.toUpperCase() === "SPORADIC") {
		return "NONRT";
	}
	return "";
}

function convertComponentType(source) {
	if(source.toUpperCase() === "STATIC") {
		return "Singleton";
	} else if(source.toUpperCase() === "UNIQUE") {
		return "MultitonStatic";
	} else if(source.toUpperCase() === "COMMUTATIVE") {
		return "MultitonComm";
	}
	return "";
}

function isValidFileName(name) {
  return !/[*?"<>|]/.test(name);
}

function isValidDispFileName(name) {
	if(name === '\\') return false;
  	return !/[*?"|]/.test(name);
}

function hexStringToBytes(hex) {
    if (hex.length % 2 !== 0) return null;

    let hex_str = '';

    for (let i = 0; i < hex.length; i += 2) {
        let num = parseInt(hex.substr(i, 2), 16);
		hex_str += num.toString().padStart(2, '0');
    }

    return hex_str;
}

function equalsKey(key, target) {
	if(key.toLowerCase() === ISO_PREFIX.toLowerCase() + target.toLowerCase()) {
		return true;
	}
	return false;
}

function startsWithKey(key, target) {
	if(key.toLowerCase().startsWith(ISO_PREFIX.toLowerCase() + target.toLowerCase())) {
		return true;
	}
	return false;
}

function getTargetStartProperty(propList, key) {
  return propList.filter(p => p.name.toLowerCase().startsWith(ISO_PREFIX.toLocaleLowerCase() + key.toLowerCase()));
}

function getTargetStartPropertyRaw(propList, key) {
  return propList.filter(p => p.name.toLowerCase().startsWith(key.toLowerCase()));
}

function getTargetProperty(propList, key) {
  return propList.filter(p => p.name.toLowerCase() === ISO_PREFIX.toLocaleLowerCase() + key.toLowerCase());
}

function getTargetPropertyValue(propList, key) {
  const filtered = getTargetProperty(propList, key);
  if (filtered.length === 1) {
    return filtered[0].value;
  }
  return "";
}

function createActionInfo(action, actionName, nvList) {
	if(action != null) {
		createISONameValue(actionName, action.implemented, nvList);
		createISONameValue(actionName + "DocDescription", action.overview, nvList);
		createISONameValue(actionName + "DocPreCondition", action.pre_condition, nvList);
		createISONameValue(actionName + "DocPostCondition", action.post_condition, nvList);
	}
}

function createISONameValue(key, value, nvList) {
  createNameValue(key, value, ISO_PREFIX, nvList);
}

function createNameValue(key, value, prefix, nvList) {
  if (value == null || value.length === 0) return;

  let elem = new NameValue();
  if(key.toLowerCase().startsWith(prefix.toLowerCase())) {
	elem.name = key.substring(prefix.length);
  } else {
	elem.name = prefix + key;
  }
  elem.value = value;
  nvList.nv.push(elem);
}

function createIsoXML(param) {
	const cleanedObject = removeEmpty(param);

	const options = {
		declaration: {
			include: true,
			encoding: "UTF-8",
			standalone: "yes",
			skipEmptyNodes: true
		},
		format: {
			pretty: true
		}
	};
	const xml = js2xmlparser.parse("SIM", cleanedObject, options);
	return xml;
}

function removeEmpty(obj) {
	if (Array.isArray(obj)) {
		return obj
		    	.map(removeEmpty)
      			.filter(v => v !== null && v !== undefined);
  	}
  	if (typeof obj === "object" && obj !== null) {
    	const newObj = {};
    	for (const [key, value] of Object.entries(obj)) {
      		const cleaned = removeEmpty(value);
		    if (cleaned !== null && cleaned !== undefined) {
				newObj[key] = cleaned;
      		}
		}
    	return Object.keys(newObj).length ? newObj : null;
  	}
  	if (obj === "" || obj === undefined) return null;
	return obj;
}

module.exports = {
  convertRtc2Iso,
  createIsoXML
};
