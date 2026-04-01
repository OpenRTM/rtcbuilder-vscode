const path = require("path");
const js2xmlparser = require('js2xmlparser');

const { ELEM_DELIMITOR,
		ISO_PREFIX,
		INOUT_SUFFIX_IN,
		INOUT_SUFFIX_OUT,
		CONTAINER_PREFIX,
		isIterable } = require("./isoDataModels");

const { RtcParam, 
		PropertyParam : RtcPropertyParam,
		DataPortParam,
		ServicePortInterfaceParam, ServicePortParam,
		ConfigSetParam,
		TargetEnvironmentParam, EnvLibraryParam } = require("./../model/dataModels");

function convertIso2Rtc(source) {
	let result = new RtcParam();

	result.profile_version = "0.3";
	result.name = source.moduleName;
	result.description = source.description;
	result.vendor = source.manufacturer;
	createISOProperty("examples", source.examples, result.properties);
	createProperty("SIM_Version", "iso22166-202:2025", "", result.properties);

	convertIDnType(source, result);
	convertProperties(source, result);
	convertIOVariables(source, result);

	convertStatus(source, result);
	convertServices(source, result);
	convertInfrastructure(source, result.properties);
	convertSafeSecure(source, result.properties);
	convertModelling(source, result.properties);
	convertExecutableForm(source, result);
	convertNVList(source, result);
	
	result.id =  "RTC:" + result.vendor + ":" + result.category + ":" + result.name + ":" + result.version; 

	return result;
}
		
function convertIDnType(source, basic) {
	let basicProp = basic.properties;

	const idnType = source.idnType;
	if(!idnType) return;

	createISOProperty("mID", bytesListToHexString(idnType.moduleID.mID), basicProp);
	createISOProperty("iID", bytesToHexString(idnType.moduleID.iID), basicProp);

	basic.version= idnType.informationModelVersion;

	if(!idnType.swAspects) return;
		
	for(const each of idnType.swAspects) {
		let mId = bytesListToHexString(each.mID);
		let iId = bytesToHexString(each.iID);
		createISOProperty("swAspects", mId + ELEM_DELIMITOR + iId, basicProp);
	}
}

function convertProperties(source, result) {
	let lang = result.lang;
	let env = new TargetEnvironmentParam();
	lang.targets.push(env);
	const properties = source.properties;
	if(!properties) return;
	
	let osType = properties.osType;
	if(osType) {
		createISOProperty("osType_type", osType.type, result.properties);
		createISOProperty("osType_bit", osType.bit, result.properties);
		createISOProperty("osType_version", osType.version, result.properties);
	}

	let libs = properties.libs;
	if(libs) {
		for(const each of libs.libraries) {
			let newLib = new EnvLibraryParam();
			newLib.name = each.name;
			newLib.version = each.version;
			const libNv =  each.additionalInfo;
			if(libNv!=null) {
				newLib.other = getTargetNVValue("other", libNv.nv);
			}
			env.libraries.push(newLib);
		}
	}
		
	const compiler = properties.compiler;
	if(compiler) {
		result.language = compiler.compilerName;
		lang.kind = compiler.compilerName;

		env.os = compiler.osName;
		const verRangeOS = compiler.verRangeOS;
		if(verRangeOS!=null 
			&& (0 < verRangeOS.min.length || 0 < verRangeOS.max.length)) {
			env.osVersions = verRangeOS.min + ELEM_DELIMITOR + verRangeOS.max;
		}

		const verRangeCompiler = compiler.verRangeCompiler;
		if(verRangeCompiler!=null 
			&& (0 < verRangeCompiler.min.length || 0 < verRangeCompiler.max.length)) {
			env.langVersion = verRangeCompiler.min + ELEM_DELIMITOR + verRangeCompiler.max;
		}

		env.CPUs.push(compiler.bitnCPUarch);

		const compilerNv =  compiler.additionalInfo;
		if(compilerNv!=null) {
			env.other = getTargetNVValue("targetOther", compilerNv.nv);
		}
	}
		
	const exeTypes = properties.exeType;
	if(0<exeTypes.length) {
		const exeType = exeTypes[0];
		result.activityType = convertActivityType(exeType.opType);
		result.executionRate = exeType.timeConstraint;
		result.componentType  = convertComponentType(exeType.instanceType);
		createISOProperty("exeType_hardRT", String(exeType.hardRT), result.properties);
		createISOProperty("exeType_priority", bytesToHexString(exeType.priority), result.properties);
		if(1<exeTypes.length) {
			for(let index=1; index<exeTypes.length; index++) {
				const each = exeTypes[index];
				const ketPre = "exeType_" + String(index) + "_";
				createISOProperty(ketPre + "opType", each.opType, result.properties);
				createISOProperty(ketPre + "hardRT", String(each.hardRT), result.properties);
				createISOProperty(ketPre + "timeConstraint", each.timeConstraint, result.properties);
				createISOProperty(ketPre + "priority", bytesToHexString(each.priority), result.properties);
				createISOProperty(ketPre + "instanceType", each.instanceType, result.properties);
			}
		}
	}
		
	const propList = properties.property;
	if(propList && 0 < propList.length) {
		const definedList = [ "constraint",
							  "docDataname", "docDefaultValue", "docUnit", "docRange", "docConstraint",
							  "comment", "variableName" ];
		for(const each of properties.property ) {
			let config = new ConfigSetParam();
			result.configParams.push(config);
				
			config.defaultValue = each.value;
			createISOProperty("immutable", String(each.immutable), config.properties);
			config.doc_description = each.description;
			config.name = each.name;
			config.type = each.type;
			config.unit = each.unit;
				
			const nvList = each.additionalInfo;
			if(nvList) {
				const nvs = nvList.nv;
				config.constraint = getTargetNVValue("constraint", nvs);

				config.doc_dataname = getTargetNVValue("docDataname", nvs);
				config.doc_default = getTargetNVValue("docDefaultValue", nvs);
				config.doc_unit = getTargetNVValue("docUnit", nvs);
				config.doc_range = getTargetNVValue("docRange", nvs);
				config.doc_constraint = getTargetNVValue("docConstraint", nvs);

				config.comment = getTargetNVValue("comment", nvs);
				config.varname = getTargetNVValue("variableName", nvs);

				for (const nv of nvs) {
					if( checkNVName(nv.name, definedList)) continue;
					createISOProperty(nv.name, nv.value, config.properties);
				}
			}
		}
	}
}

function convertIOVariables(source,  result) {
	const iOVariables = source.ioVariables;
	if(!iOVariables) return;
	
	let varList = iOVariables.variable;
	if(varList && 0<varList.length) {
		const definedList = [ "idlFile", "interfaceType", "dataflowType", "subscriptionType",
							  "type", "number", "semantics", "unit",
							  "occurrence", "operation",
							  "comment", "variableName", "position" ]; 
		for(const each of varList) {
			if (each.ioType) {
				let port_type = each.ioType;
				if (port_type === "OUT") {
					let dataPort = createDataPort(each, result, definedList);
					result.outports.push(dataPort);
				} else if (port_type === "IN") {
					let dataPort = createDataPort(each, result, definedList);
					result.inports.push(dataPort);
				} else if (port_type === "INOUT") {
					const inPortName = each.name + INOUT_SUFFIX_IN; 
					const outPortName = each.name + INOUT_SUFFIX_OUT; 

					let dataPortIn = createDataPort(each, result, definedList);
					dataPortIn.name = inPortName;
					result.inports.push(dataPortIn);

					let dataPortOut = createDataPort(each, result, definedList);
					dataPortOut.name = outPortName;
					result.outports.push(dataPortOut);
				}
			}
		}
	}
}

function createDataPort(each, result, definedList) {
	let dataPort = new DataPortParam();

	createISOProperty("value", each.value, dataPort.properties);
	dataPort.doc_description = each.description;
	dataPort.name = each.name;
	dataPort.type = each.type;
	dataPort.unit = each.unit;

	const nvList = each.additionalInfo;
	if (nvList) {
		const nvs = nvList.nv;

		dataPort.dispIdlFile = getTargetNVValue("idlFile", nvs);
		dataPort.interfaceType = getTargetNVValue("interfaceType", nvs);
		dataPort.dataFlowType = getTargetNVValue("dataflowType", nvs);
		dataPort.subscriptionType = getTargetNVValue("subscriptionType", nvs);

		dataPort.doc_type = getTargetNVValue("type", nvs);
		dataPort.doc_num = getTargetNVValue("number", nvs);
		dataPort.doc_semantics = getTargetNVValue("semantics", nvs);
		dataPort.doc_unit = getTargetNVValue("unit", nvs);
		dataPort.doc_occerrence = getTargetNVValue("occurrence", nvs);
		dataPort.doc_operation = getTargetNVValue("operation", nvs);

		dataPort.comment = getTargetNVValue("comment", nvs);
		dataPort.varname = getTargetNVValue("variableName", nvs);
		dataPort.position = getTargetNVValue("position", nvs);

		for (const nv of nvs) {
			if (checkNVName(nv.name, definedList)) continue;
			createISOProperty(nv.name, nv.value, dataPort.properties);
		}
	}
	return dataPort;
}

function convertStatus(source, result) {
	const status = source.status;
	if(!status) return;
	
	if(status.executionStatus) {
		createISOProperty("executionStatus", status.executionStatus, result.properties);
	}
	if(status.errorType) {
		createISOProperty("errorType", status.errorType, result.properties);
	}
}
	
function convertServices(source, result) {
	const services = source.services;
	if(!services) return;
		
	for(const each of services.serviceProfile) {
		let servicePort = new ServicePortParam();
		result.serviceports.push(servicePort);
			
		servicePort.name = each.id;
		createISOProperty("ifURL", each.ifURL, servicePort.properties);
		if(each.pvType) {
			createISOProperty("pvType", each.pvType, servicePort.properties);
		}
		if(each.moType) {
			createISOProperty("moType", each.moType, servicePort.properties);
		}
			
		const nvList = each.additionalInfo;
		if(nvList) {
			const nvs = nvList.nv;
			const definedList = [ "description", "ifdescription",
								  "comment", "position",
								  "kind" ]; 

			servicePort.doc_description = getTargetNVValue("description", nvs);
			servicePort.doc_if_description = getTargetNVValue("ifdescription", nvs);
				
			servicePort.comment = getTargetNVValue("comment", nvs);
			servicePort.position = getTargetNVValue("position", nvs);

	// 			List<NameValue> kinds = getTargetNV("kind", nvs);
	// 			for(NameValue elem : kinds) {
	// 				TransmissionMethod tm = factory.createTransmissionMethod();
	// 				tm.setKind(elem.getValue());
	// 				servicePort.getTransMethods().add(tm);
	// 			}
				
			for(const nv of nvs) {
				if( checkNVName(nv.name, definedList)) continue;
				createISOProperty(nv.name, nv.value, servicePort.properties);
			}
		}
			
		for(const eachIf of each.methodList) {
			let serviceIf = new ServicePortInterfaceParam;
			servicePort.serviceinterfaces.push(serviceIf);
				
			serviceIf.name = eachIf.methodName;
			serviceIf.interfacetype = eachIf.retType;
			if(eachIf.moType) {
				createISOProperty("moType", eachIf.moType, serviceIf.properties);
			}
			serviceIf.direction = eachIf.reqProvType;
				
			const nvListIf = eachIf.additionalInfo;
			if(nvListIf!=null) {
				const nvs = nvListIf.nv;
				const definedListIf = [ "instanceName", "idlFile", "path",
										"idlDispFile", "DispPath",
										"description", "docArgument", "docReturn", "docException",
										"docPreCondition", "docPostCondition",
										"comment", "variableName" ]; 

				serviceIf.instancename = getTargetNVValue("instanceName", nvs);
				const fileName = getTargetNVValue("idlFile", nvs);
				const pathName = getTargetNVValue("path", nvs);
				serviceIf.idlfile =  pathName + path.sep + fileName;
				const dispFileName = getTargetNVValue("idlDispFile", nvs);
				const dispPathName = getTargetNVValue("DispPath", nvs);
				serviceIf.idlDispfile =  dispPathName + path.sep + dispFileName;
					
				serviceIf.doc_description = getTargetNVValue("description", nvs);
				serviceIf.doc_argument = getTargetNVValue("docArgument", nvs);
				serviceIf.doc_return = getTargetNVValue("docReturn", nvs);
				serviceIf.doc_exception = getTargetNVValue("docException", nvs);
				serviceIf.doc_pre_condition = getTargetNVValue("docPreCondition", nvs);
				serviceIf.doc_post_condition = getTargetNVValue("docPostCondition", nvs);

				serviceIf.comment = getTargetNVValue("comment", nvs);
				serviceIf.varname = getTargetNVValue("variableName", nvs);

				for(const nv of nvs) {
					if( checkNVName(nv.name, definedListIf)) continue;
					createISOProperty(nv.name, nv.value, serviceIf.properties);
				}
			}
				
			for(const eachArg of eachIf.argType) {
				const argName = eachArg.valueName;
				createISOProperty("argType_valueName", argName, serviceIf.properties);
				createISOProperty("argType_" + argName + "_type", eachArg.type, serviceIf.properties);
				if(eachArg.inout) {
					createISOProperty("argType_" + argName + "_inout", eachArg.inout, serviceIf.properties);
				}

				const nvListArg = eachArg.additionalInfo;
				if(nvListArg) {
					for(const nv of nvListArg.nv) {
						createISOProperty("argType_" + argName + "_add_" + nv.name,
										nv.value,
										serviceIf.properties);
					}
				}
			}
		}
	}
}

function convertInfrastructure(source, properties) {
	const infra = source.infra;
	if(!infra) return;
		
	const nvList = infra.additionalInfo;
	if(nvList) {
		for(const nv of nvList.nv) {
			createISOProperty("infra_add_" + nv.name, nv.value, properties);
		}
	}
		
	for(const each of infra.database) {
		const name = each.name;
		let min = "";
		let max = "";
		if(each.version) {
			min = each.version.min;
			max = each.version.max;
		}
		createISOProperty("infra_database", name + ELEM_DELIMITOR + min + ELEM_DELIMITOR + max, properties);
	}
		
	const commsPre = "infra_comms_";
	for (let index = 0; index < infra.comms.length; index++) {
		const comm = infra.comms[index];
		const strIndex = String(index + 1);
		for(const each of comm.mostTopProtocol) {
			let name = each.name;
			let min = "";
			let max = "";
			if(each.version) {
				min = each.version.min;
				max = each.version.max;
			}
			createISOProperty(commsPre + "mostTop_" + strIndex,
							name + ELEM_DELIMITOR + min + ELEM_DELIMITOR + max,
							properties);
		}
		const underlyingProtocol = comm.underlyingProtocol;
		if(underlyingProtocol) {
			const underlayingPre = commsPre + "underlaying_" + strIndex;

			createISOProperty(underlayingPre + "_connectionType", underlyingProtocol.connectionType, properties);
			createISOProperty(underlayingPre + "_typePhyMac", underlyingProtocol.typePhyMac, properties);
				
			const typeNetTrans = underlyingProtocol.typeNetTrans.join(",");
			createISOProperty(underlayingPre + "_typeNetTrans", typeNetTrans, properties);
				
			const typeApp = underlyingProtocol.typeApp.join(",");
			createISOProperty(underlayingPre + "_typeApp", typeApp, properties);

			createISOProperty(underlayingPre + "_speed", underlyingProtocol.speed, properties);
				
			const nvListCom = underlyingProtocol.additionalInfo;
			if(nvListCom) {
				for(const nv of nvListCom.nv) {
					createISOProperty(underlayingPre + "_add_" + nv.name, nv.value, properties);
				}
			}
		}
	}
		
	for(const each of infra.middleware) {
		let name = each.name;
		let min = "";
		let max = "";
		if(each.version) {
			min = each.version.min;
			max = each.version.max;
		}
		createISOProperty("infra_middleware", name + ELEM_DELIMITOR + min + ELEM_DELIMITOR + max, properties);
	}
}
	
function convertSafeSecure(source, properties) {
	const safeSecure = source.safeSecure;
	if(!safeSecure) return;

	createISOProperty("safeSecure_overallValidSafetyLevelType", safeSecure.overallValidSafetyLevelType, properties);
	createISOProperty("safeSecure_overallSafetyLevelPL", safeSecure.overallSafetyLevelPL, properties);
	createISOProperty("safeSecure_overallSafetyLevelSIL", safeSecure.overallSafetyLevelSIL, properties);
	createISOProperty("safeSecure_overallPhySecurityLevel", safeSecure.overallPhySecurityLevel, properties);
	createISOProperty("safeSecure_overallCybSecurityLevel", safeSecure.overallCybSecurityLevel, properties);
		
	const inSafetyLevel = safeSecure.inSafetyLevel;
	for(let index=0;index<inSafetyLevel.length; index++) {
		const each = inSafetyLevel[index];
		const strIndex = String(index + 1);
		const inSafetyLevelPre = "safeSecure_inSafetyLevel_" + strIndex;

		createISOProperty(inSafetyLevelPre + "_safetyFunctionType", each.safetyFunctionType, properties);
		createISOProperty(inSafetyLevelPre + "_validSafetyLevelType", each.validSafetyLevelType, properties);
		createISOProperty(inSafetyLevelPre + "_eachSafetyLevelPL", each.eachSafetyLevelPL, properties);
		createISOProperty(inSafetyLevelPre + "_eachSafetyLevelSIL", each.eachSafetyLevelSIL, properties);
	}

	const inCybSecurityLevel = safeSecure.inCybSecurityLevel;
	for(let index=0;index<inCybSecurityLevel.length; index++) {
		const each = inCybSecurityLevel[index];
		const strIndex = String(index + 1);
		const inCybSecurityLevelPre = "safeSecure_inCybSecurityLevel_" + strIndex;

		createISOProperty(inCybSecurityLevelPre + "_securityType", each.securityType, properties);
		createISOProperty(inCybSecurityLevelPre + "_eachSecurityLevel", each.eachSecurityLevel, properties);
	}

	const nvList = safeSecure.additionalInfo;
	if(nvList) {
		for(const nv of nvList.nv) {
			createISOProperty("safeSecure_add_" + nv.name, nv.value, properties);
		}
	}
}

function convertModelling(source, properties) {
	const modelling = source.modelling;
	if(!modelling) return;

	let simulationModel = modelling.simulationModel;
	for(let index=0;index<simulationModel.length; index++) {
		const each = simulationModel[index];
		const strIndex = String(index + 1);
		const modellingPre = "modelling_" + strIndex;

		createISOProperty(modellingPre + "_simulator", each.simulator, properties);
		let mdfs = each.mdf.join(",");
		createISOProperty(modellingPre + "_mdf", mdfs, properties);
				
		for(const eachLib of each.libraries ) {
			createISOProperty(modellingPre + "_lib", eachLib, properties);
		}
				
		const dynamicSW = each.dynamicSW;
		for(let idxDyn=0;idxDyn<dynamicSW.length; idxDyn++) {
			const eachExe = dynamicSW[idxDyn];
			const strIdxExe = String(idxDyn + 1);
			const dynamicSWPre = modellingPre + "_dynamicSW_" + strIdxExe;

			createISOProperty(dynamicSWPre + "_exeFileURL", eachExe.exeFileURL, properties);
			createISOProperty(dynamicSWPre + "_shellCmd", eachExe.shellCmd, properties);
					
			const exePros = eachExe.properties;
			for(let idxProp=0; idxProp<exePros.length;idxProp++) {
				const eachProp = exePros[idxProp];
				const strIdxProp = String(idxProp + 1);
				const propertyPre = dynamicSWPre + "_property_" + strIdxProp;

				createISOProperty(propertyPre + "_value", eachProp.value, properties);
				createISOProperty(propertyPre + "_immutable", eachProp.immutable, properties);
				createISOProperty(propertyPre + "_description", eachProp.description, properties);
				createISOProperty(propertyPre + "_name", eachProp.name, properties);
				createISOProperty(propertyPre + "_type", eachProp.type, properties);
				createISOProperty(propertyPre + "_unit", eachProp.unit, properties);
			}
					
			const nvList = eachExe.additionalInfo;
			if(nvList) {
				for(const nv of nvList.nv) {
					createISOProperty(dynamicSWPre + "_add_" + nv.name, nv.value, properties);
				}
			}
		}
		const nvListMod = each.additionalInfo;
		if(nvListMod) {
			for(const nv of nvListMod.nv) {
				createISOProperty(modellingPre + "_add_" + nv.name, nv.value, properties);
			}
		}
	}
}
	
function convertExecutableForm(source, result) {
	const exeForms = source.exeForm;
	if(!exeForms) return;

	for(const each of exeForms.libraryURL) {
		createISOProperty("exeForm_LibraryURL", each, result.properties);
	}
	const exeForm = exeForms.exeForm;
	let containerNum = 0;
	let lang = result.lang;
	lang.targets = [];

	for(let index=0;index<exeForm.length; index++) {
		const eachExe = exeForm[index];
		if(eachExe.exeFileURL.startsWith(CONTAINER_PREFIX)) {
			const nv = eachExe.additionalInfo.nv;
			const middleware = getTargetNVValueRaw(CONTAINER_PREFIX + "Middleware", nv);
			const mdlVersion  = getTargetNVValueRaw(CONTAINER_PREFIX + "MiddlewareVersion", nv);
			const osVersion  = getTargetNVValueRaw(CONTAINER_PREFIX + "TargetOSVersion", nv);
			const workSpace  = getTargetNVValueRaw(CONTAINER_PREFIX + "Workspace", nv);
			const language  = getTargetNVValueRaw(CONTAINER_PREFIX + "Language", nv);
			const config  = getTargetNVValueRaw(CONTAINER_PREFIX + "Configuration", nv);
			
			let env = new TargetEnvironmentParam();
			lang.targets.push(env);
			containerNum++;
			
			env.os = middleware;
			env.cpuOther = mdlVersion;
			env.OSversions = osVersion;
			env.other = workSpace;
			env.langVersion = language;
			env.CPUs.push(config);
			
			const libraries = getTargetStartNVRaw(CONTAINER_PREFIX + "Libraries", nv);
			for(const each of libraries) {
				createProperty(CONTAINER_PREFIX + "lib_" + containerNum, each.value, "", lang.properties);
			}
			
			const repositories = getTargetStartNVRaw(CONTAINER_PREFIX + "GitURL", nv);
			for(const each of repositories) {
				const val = each.value;
				const elems = val.split(" ");
				if(elems.length < 2) continue;
				let lib = new EnvLibraryParam();
				lib.name = elems[0];
				lib.version = elems[1];
				env.libraries.push(lib);
			}

			const preSets = getTargetStartNVRaw(CONTAINER_PREFIX + "category", nv);
			for(const each of preSets) {
				createProperty(CONTAINER_PREFIX + "category_" + containerNum, each.value, "", lang.properties);
			}

		} else {
			const strIndex = String(index + 1);
			const exeFormPre = "exeForm_exeForm_" + strIndex;

			createISOProperty(exeFormPre + "_exeFileURL", eachExe.exeFileURL, properties);
			createISOProperty(exeFormPre + "_shellCmd", eachExe.shellCmd, properties);
					
			const exePros = eachExe.properties;
			for(let idxProp=0; idxProp<exePros.length;idxProp++) {
				const eachProp = exePros[idxProp];
				const strIdxProp = String(idxProp + 1);
				const propertyPre = exeFormPre + "_property_" + strIdxProp;

				createISOProperty(propertyPre + "_value", eachProp.value, properties);
				createISOProperty(propertyPre + "_immutable", eachProp.immutable, properties);
				createISOProperty(propertyPre + "_description", eachProp.description(), properties);
				createISOProperty(propertyPre + "_name", eachProp.name, properties);
				createISOProperty(propertyPre + "_type", eachProp.type, properties);
				createISOProperty(propertyPre + "_unit", eachProp.unit, properties);
			}
					
			const nvList = eachExe.additionalInfo;
			if(!nvList) {
				for(const nv of nvList.nv) {
					createISOProperty(exeFormPre + "_add_" + nv.name, nv.value, properties);
				}
			}
		}
	}
}

function convertNVList(source, result) {
	if(!source.additionalInfo) return;
		
	const definedList = [ "profileVersion", "SIM_Version",
							"activityType", "rtcType", "category", "maxInstances",
							"abstract", "creationDate", "updateDate", "componentKind", "executionType",
							"docAlgorithm", "docDescription", "docInout", "docCreator", "docLicense",
							"docReference",
							"extComment", "extSaveProject", "extVersionUpLog",
							"onInitialize", "onInitializeDocDescription", "onInitializeDocPreCondition", "onInitializeDocPostCondition",
							"onFinalize", "onFinalizeDocDescription", "onFinalizeDocPreCondition", "onFinalizeDocPostCondition",
							"onStartup", "onStartupDocDescription", "onStartupDocPreCondition", "onStartupDocPostCondition",
							"onShutdown", "onShutdownDocDescription", "onShutdownDocPreCondition", "onShutdownDocPostCondition",
							"onActivated", "onActivatedDocDescription", "onActivatedDocPreCondition", "onActivatedDocPostCondition",
							"onDeactivated", "onDeactivatedDocDescription", "onDeactivatedDocPreCondition", "onDeactivatedDocPostCondition",
							"onAborting", "onAbortingDocDescription", "onAbortingDocPreCondition", "onAbortingDocPostCondition",
							"onError", "onErrorDocDescription", "onErrorDocPreCondition", "onErrorDocPostCondition",
							"onReset", "onResetDocDescription", "onResetDocPreCondition", "onResetDocPostCondition",
							"onExecute", "onExecuteDocDescription", "onExecuteDocPreCondition", "onExecuteDocPostCondition",
							"onStateUpdate", "onStateUpdateDocDescription", "onStateUpdateDocPreCondition", "onStateUpdateDocPostCondition",
							"onRateChanged", "onRateChangedDocDescription", "onRateChangedDocPreCondition", "onRateChangedDocPostCondition",
							"onAction", "onActionDocDescription", "onActionDocPreCondition", "onActionDocPostCondition",
							"onModeChanged", "onModeChangedDocDescription", "onModeChangedDocPreCondition", "onModeChangedDocPostCondition" ]; 
		
	let nvList = source.additionalInfo.nv;
	result.profile_version = getTargetNVValue("profileVersion", nvList);
		
	result.rtcType = getTargetNVValue("rtcType", nvList);
	result.category = getTargetNVValue("category", nvList);
	result.maxInstance = getTargetNVValue("maxInstances", nvList);
	result.componentKind = getTargetNVValue("componentKind", nvList);
	result.abstractDesc = getTargetNVValue("abstract", nvList);
	result.hardwareProfile = getTargetNVValue("hardwareProfile", nvList);
	result.executionType = getTargetNVValue("executionType", nvList);
	result.creation_date = getTargetNVValue("creationDate", nvList);
	result.update_date = getTargetNVValue("updateDate", nvList);
		
	result.doc_algorithm = getTargetNVValue("docAlgorithm", nvList);
	result.doc_description = getTargetNVValue("docDescription", nvList);
	result.doc_in_out = getTargetNVValue("docInout", nvList);
	result.doc_creator = getTargetNVValue("docCreator", nvList);
	result.doc_license = getTargetNVValue("docLicense", nvList);
	result.doc_reference = getTargetNVValue("docReference", nvList);
		
	result.comment = getTargetNVValue("extComment", nvList);
	result.save_project = getTargetNVValue("extSaveProject", nvList);
	result.version_up_log = getTargetNVValue("extVersionUpLog", nvList);
	/////
	const onInitializes = getTargetStartNV("onInitialize", nvList);
	if(0 < onInitializes.length) {
		let onInitialize = result.actions['onInitialize'];
		onInitialize.implemented = getTargetNVValue("onInitialize", nvList);
		onInitialize.overview = getTargetNVValue("onInitializeDocDescription", nvList);
		onInitialize.pre_condition = getTargetNVValue("onInitializeDocPreCondition", nvList);
		onInitialize.post_condition = getTargetNVValue("onInitializeDocPostCondition", nvList);
	}
	//
	const onFinalizes = getTargetStartNV("onFinalize", nvList);
	if(0 < onFinalizes.length) {
		let onFinalize = result.actions['onFinalize'];
		onFinalize.implemented = getTargetNVValue("onFinalize", nvList);
		onFinalize.overview = getTargetNVValue("onFinalizeDocDescription", nvList);
		onFinalize.pre_condition = getTargetNVValue("onFinalizeDocPreCondition", nvList);
		onFinalize.post_condition = getTargetNVValue("onFinalizeDocPostCondition", nvList);
	}
	//
	const onStartups = getTargetStartNV("onStartup", nvList);
	if(0 < onStartups.length) {
		let onStartup = result.actions['onStartup'];
		onStartup.implemented = getTargetNVValue("onStartup", nvList);
		onStartup.overview = getTargetNVValue("onStartupDocDescription", nvList);
		onStartup.pre_condition = getTargetNVValue("onStartupDocPreCondition", nvList);
		onStartup.post_condition = getTargetNVValue("onStartupDocPostCondition", nvList);
	}
	//
	const onShutdowns = getTargetStartNV("onShutdown", nvList);
	if(0 < onShutdowns.length) {
		let onShutdown = result.actions['onShutdown'];
		onShutdown.implemented = getTargetNVValue("onShutdown", nvList);
		onShutdown.overview = getTargetNVValue("onShutdownDocDescription", nvList);
		onShutdown.pre_condition = getTargetNVValue("onShutdownDocPreCondition", nvList);
		onShutdown.post_condition = getTargetNVValue("onShutdownDocPostCondition", nvList);
	}
	//
	const onActivateds = getTargetStartNV("onActivated", nvList);
	if(0 < onActivateds.length) {
		let onActivated = result.actions['onActivated'];
		onActivated.implemented = getTargetNVValue("onActivated", nvList);
		onActivated.overview = getTargetNVValue("onActivatedDocDescription", nvList);
		onActivated.pre_condition = getTargetNVValue("onActivatedDocPreCondition", nvList);
		onActivated.post_condition = getTargetNVValue("onActivatedDocPostCondition", nvList);
	}
	//
	const onDeactivateds = getTargetStartNV("onDeactivated", nvList);
	if(0 < onDeactivateds.length) {
		let onDeactivated = result.actions['onDeactivated'];
		onDeactivated.implemented = getTargetNVValue("onDeactivated", nvList);
		onDeactivated.overview = getTargetNVValue("onDeactivatedDocDescription", nvList);
		onDeactivated.pre_condition = getTargetNVValue("onDeactivatedDocPreCondition", nvList);
		onDeactivated.post_condition = getTargetNVValue("onDeactivatedDocPostCondition", nvList);
	}
	//
	const onAbortings = getTargetStartNV("onAborting", nvList);
	if(0 < onAbortings.length) {
		let onAborting = result.actions['onAborting'];
		onAborting.implemented = getTargetNVValue("onAborting", nvList);
		onAborting.overview = getTargetNVValue("onAbortingDocDescription", nvList);
		onAborting.pre_condition = getTargetNVValue("onAbortingDocPreCondition", nvList);
		onAborting.post_condition = getTargetNVValue("onAbortingDocPostCondition", nvList);
	}
	//
	const onErrors = getTargetStartNV("onError", nvList);
	if(0 < onErrors.length) {
		let onError = result.actions['onError'];
		onError.implemented = getTargetNVValue("onError", nvList);
		onError.overview = getTargetNVValue("onErrorDocDescription", nvList);
		onError.pre_condition = getTargetNVValue("onErrorDocPreCondition", nvList);
		onError.post_condition = getTargetNVValue("onErrorDocPostCondition", nvList);
	}
	//
	const onResets = getTargetStartNV("onReset", nvList);
	if(0 < onResets.length) {
		let onReset = result.actions['onReset'];
		onReset.implemented = getTargetNVValue("onReset", nvList);
		onReset.overview = getTargetNVValue("onResetDocDescription", nvList);
		onReset.pre_condition = getTargetNVValue("onResetDocPreCondition", nvList);
		onReset.post_condition = getTargetNVValue("onResetDocPostCondition", nvList);
	}
	//
	const onExecutes = getTargetStartNV("onStateUpdate", nvList);
	if(0 < onExecutes.length) {
		let onExecute = result.actions['onExecute'];
		onExecute.implemented = getTargetNVValue("onExecute", nvList);
		onExecute.overview = getTargetNVValue("onExecuteDocDescription", nvList);
		onExecute.pre_condition = getTargetNVValue("onExecuteDocPreCondition", nvList);
		onExecute.post_condition = getTargetNVValue("onExecuteDocPostCondition", nvList);
	}
	//
	const onStateUpdates = getTargetStartNV("onStateUpdate", nvList);
	if(0 < onStateUpdates.length) {
		let onStateUpdate = result.actions['onStateUpdate'];
		onStateUpdate.implemented = getTargetNVValue("onStateUpdate", nvList);
		onStateUpdate.overview = getTargetNVValue("onStateUpdateDocDescription", nvList);
		onStateUpdate.pre_condition = getTargetNVValue("onStateUpdateDocPreCondition", nvList);
		onStateUpdate.post_condition = getTargetNVValue("onStateUpdateDocPostCondition", nvList);
	}
	//
	const onRateChangeds = getTargetStartNV("onRateChanged", nvList);
	if(0 < onRateChangeds.length) {
		let onRateChanged = result.actions['onRateChanged'];
		onRateChanged.implemented = getTargetNVValue("onRateChanged", nvList);
		onRateChanged.overview = getTargetNVValue("onRateChangedDocDescription", nvList);
		onRateChanged.pre_condition = getTargetNVValue("onRateChangedDocPreCondition", nvList);
		onRateChanged.post_condition = getTargetNVValue("onRateChangedDocPostCondition", nvList);
	}
	//
	const onActions = getTargetStartNV("onAction", nvList);
	if(0 < onActions.length) {
		let onAction = result.actions['onAction'];
		onAction.implemented = getTargetNVValue("onAction", nvList);
		onAction.overview = getTargetNVValue("onActionDocDescription", nvList);
		onAction.pre_condition = getTargetNVValue("onActionDocPreCondition", nvList);
		onAction.post_condition = getTargetNVValue("onActionDocPostCondition", nvList);
	}
	//
	const onModeChangeds = getTargetStartNV("onModeChanged", nvList);
	if(0 < onModeChangeds.length) {
		let onModeChanged = result.actions['onModeChanged'];
		onModeChanged.implemented = getTargetNVValue("onModeChanged", nvList);
		onModeChanged.overview = getTargetNVValue("onModeChangedDocDescription", nvList);
		onModeChanged.pre_condition = getTargetNVValue("onModeChangedDocPreCondition", nvList);
		onModeChanged.post_condition = getTargetNVValue("onModeChangedDocPostCondition", nvList);
	}
		
	for(const nv of nvList) {
		if( checkNVName(nv.name, definedList)) continue;
		createISOProperty(nv.name, nv.value, result.properties);
	}
}
//////////
function convertActivityType(source) {
	if(source.toUpperCase() === "PERIODIC") {
		return "PERIODIC";
	} else if(source.toUpperCase() === "EVENTDRIVEN") {
		return "EVENTDRIVEN";
	}else if(source.toUpperCase() === "NONRT") {
		return "SPORADIC";
	}
	return "";
}

function convertComponentType(source) {
	if(source.toUpperCase() === "SINGLETON") {
		return "STATIC";
	} else if(source.toUpperCase() === "MULTITON_STATIC") {
		return "UNIQUE";
	} else if(source.toUpperCase() === "MULTITON_COMM") {
		return "COMMUTATIVE";
	}
	return "";
}

function checkNVName(name, definedList) {
	if(name.startsWith(ISO_PREFIX)) {
		if(definedList.includes(name.substring(ISO_PREFIX.length))) return true;
	} else {
		if(definedList.includes(name)) return true;
	}
	return false;
}

function getTargetNVValue(key, nvList) {
  const filtered = nvList.filter(p => p.name === ISO_PREFIX + key);

  if (filtered && filtered.length > 0) {
    return filtered[0].value;
  }
  return "";
}

function getTargetNVValueRaw(key, nvList) {
  const filtered = nvList.filter(p => p.name === key);

  if (filtered && filtered.length > 0) {
    return filtered[0].value;
  }
  return "";
}

function getTargetStartNV(key, nvList) {
  return nvList.filter(p => p.name.startsWith(ISO_PREFIX + key));
}

function getTargetStartNVRaw(key, nvList) {
  return nvList.filter(p => p.name.startsWith(key));
}

function createISOProperty(name, value, propList) {
	createProperty(name, value, ISO_PREFIX, propList);
}
	
function createProperty(name, value, prefix, propList) {
	if (!value) return;

	let prop = new RtcPropertyParam();
	if(name.startsWith(prefix)) {
		prop.name = name.substring(prefix.length);
	} else {
		prop.name = prefix + name;
	}
	prop.value = value;
	propList.push(prop);
}
	
function bytesToHexString(bytes) {
    if (bytes == null) return null;

    let hex = '';
	if( isIterable(bytes)) {
		for (const b of bytes) {
			hex += (b & 0xFF).toString(16).padStart(2, '0');
		}
	} else {
		hex += (bytes & 0xFF).toString(16).padStart(2, '0');
	}
    return hex;
}

function bytesListToHexString(list) {
    if (list == null) return null;

    let hex = '';

	let str = String(list);
	if (str.length % 2 !== 0) {
		str = '0' + str;
	}
	for (let i = 0; i < str.length; i += 2) {
		const num = Number(str.slice(i, i + 2));
		hex += num.toString().padStart(2, '0');
	}
    return hex;
}

module.exports = {
	// parseIsoXML,
  	convertIso2Rtc
};
