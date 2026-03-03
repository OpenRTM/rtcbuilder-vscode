const { XMLParser } = require('fast-xml-parser');

const { ELEM_DELIMITOR,ISO_PREFIX,
		SIMParam, ModuleIDParam, LibraryParam, ExecutionTypeParam,
		PropertyParam, VariableParam,
		ServiceProfileParam, ServiceMethodParam, ArgSpecParam,
		InfraTypeParam, CommunicationParam,
		SafetyFunctionParam, CyberSecurityParam,
		ModelCaseParam, ExeFormParam,
		NameValue,
        isIterable } = require("./isoDataModels");

function parseIsoXML(source) {
	const xmlData = source;
	const parser = new XMLParser({ignoreAttributes: false,
    	                            attributeNamePrefix: ''});
	const jsObj = parser.parse(xmlData);

	let iso_param = new SIMParam();

	const simObj = jsObj['SIM'];
	iso_param.moduleName = jsonVal(simObj, 'moduleName');
	iso_param.description = jsonVal(simObj, 'description');
	iso_param.manufacturer = jsonVal(simObj, 'manufacturer');
	iso_param.examples = jsonVal(simObj, 'examples');

	const idnTypeObj = simObj['idnType'];
	if(idnTypeObj) {
		let idnType = iso_param.idnType;
		idnType.informationModelVersion = jsonVal(idnTypeObj, 'informationModelVersion');
		let swAspects = jsonVal(idnTypeObj, 'swAspects');
		for(const each of swAspects) {
			let swParam = new ModuleIDParam();
			parseModuleId(swParam, each);
			idnType.swAspects.push(swParam);
		}
		parseModuleId(idnType.moduleID, idnTypeObj['moduleID']);
	}

	const propertiesObj = simObj['properties'];
	if(propertiesObj) {
		let properties = iso_param.properties;
		parseOsType(properties.osType, propertiesObj['osType']);

		const libsObj = propertiesObj['libs'];
		if(libsObj) {
			let libs = properties.libs;
			if (Array.isArray(libsObj.libraries)) {
				for(const each of libsObj.libraries) {
					parseLibrary(libs, each);
				}
			} else {
				parseLibrary(libs, libsObj.libraries);
			}
		}

		const compilerObj = propertiesObj['compiler'];
		if(compilerObj) {
			let compiler = properties.compiler;
			compiler.osName = compilerObj['osName'];
			parseRangeString(compiler.verRangeOS, compilerObj['verRangeOS'])
			compiler.compilerName = compilerObj['compilerName'];
			parseRangeString(compiler.verRangeCompiler, compilerObj['verRangeCompiler'])
			compiler.bitnCPUarch = compilerObj['bitnCPUarch'];
		}

		const exeTypeObj = propertiesObj['exeType'];
		if(exeTypeObj) {
			let exeType = properties.exeType;
			if(isIterable(exeTypeObj)) {
				for(const each of exeTypeObj) {
					parseExecutionType(exeType, each);
				}
			} else {
				parseExecutionType(exeType, exeTypeObj);
			}
		}

		const propertyObj = propertiesObj['property'];
		if(propertyObj) {
			let property = properties.property;
			if(isIterable(propertyObj)) {
				for(const each of propertyObj) {
					parseProperty(property, each);
				}
			} else {
				parseProperty(property, propertyObj);
			}
		}
	}

	const ioVariablesObj = simObj['ioVariables'];
	if(ioVariablesObj) {
		let ioVariables = iso_param.ioVariables;
		const variablesObj = ioVariablesObj['variable'];
		if(variablesObj) {
			if(isIterable(variablesObj)) {
				for(const each of variablesObj) {
					parseVariable(ioVariables, each);
				}
			} else {
				parseVariable(ioVariables, variablesObj);
			}
		}
	}

	const statusObj = simObj['status'];
	if(statusObj) {
		let status = iso_param.status;
		status.executionStatus = jsonVal(statusObj, 'executionStatus');
		status.errorType = jsonVal(statusObj, 'errorType');
	}

	const servicesObj = simObj['services'];
	if(servicesObj) {
		let services = iso_param.services;
		services.noOfBasicService = jsonVal(servicesObj, 'noOfBasicService');
		services.noOfOptionalService = jsonVal(servicesObj, 'noOfOptionalService');
		const serviceProfileObj = servicesObj['serviceProfile'];
		if(serviceProfileObj) {
			if(isIterable(serviceProfileObj)) {
				for(const each of serviceProfileObj) {
					parseServiceProfile(services, each);
				}
			} else {
				parseServiceProfile(services, serviceProfileObj);
			}
		}
	}

	const infraObj = simObj['infra'];
	if(infraObj) {
		let infra = iso_param.infra;
		const databaseObj = infraObj['database'];
		if(isIterable(databaseObj)) {
			for(const each of databaseObj) {
				parseInfraType(infra.database, each);
			}
		} else {
			parseInfraType(infra.database, databaseObj);
		}

		const commsObj = infraObj['comms'];
		if(isIterable(commsObj)) {
			for(const each of commsObj) {
				parseCommunication(infra.comms, each);
			}
		} else {
			parseCommunication(infra.comms, commsObj);
		}

		const middlewareObj = infraObj['middleware'];
		if(isIterable(middlewareObj)) {
			for(const each of middlewareObj) {
				parseInfraType(infra.middleware, each);
			}
		} else {
			parseInfraType(infra.middleware, middlewareObj);
		}
		parseNvList(infra.additionalInfo, infraObj['additionalInfo']);
	}

  	const safeSecureObj = simObj['safeSecure'];
	if(safeSecureObj) {
		let safeSecure = iso_param.safeSecure;
		safeSecure.overallValidSafetyLevelType = jsonVal(safeSecureObj, 'overallValidSafetyLevelType');
		safeSecure.overallSafetyLevelPL = jsonVal(safeSecureObj, 'overallSafetyLevelPL');
		safeSecure.overallSafetyLevelSIL = jsonVal(safeSecureObj, 'overallSafetyLevelSIL');
		safeSecure.overallPhySecurityLevel = jsonVal(safeSecureObj, 'overallPhySecurityLevel');
		safeSecure.overallCybSecurityLevel = jsonVal(safeSecureObj, 'overallCybSecurityLevel');
		const inSafetyLevelObj = safeSecureObj['inSafetyLevel'];
		if(inSafetyLevelObj) {
			if(isIterable(inSafetyLevelObj)) {
				for(const each of inSafetyLevelObj) {
					parseSafetyFunction(safeSecure, each);
				}
			} else {
				parseSafetyFunction(safeSecure, inSafetyLevelObj);
			}
		}
		const inCybSecurityLevelObj = safeSecureObj['inCybSecurityLevel'];
		if(inCybSecurityLevelObj) {
			if(isIterable(inCybSecurityLevelObj)) {
				for(const each of inCybSecurityLevelObj) {
					parseCyberSecurity(safeSecure, each);
				}
			} else {
				parseCyberSecurity(safeSecure, inCybSecurityLevelObj);
			}
		}
		parseNvList(safeSecure.additionalInfo, safeSecureObj['additionalInfo']);
	}

  	const modellingObj = simObj['modelling'];
	if(modellingObj) {
		let modellingParam = iso_param.modelling;
		const simulationModelObj = modellingObj['simulationModel'];
		if(simulationModelObj) {
			if(isIterable(simulationModelObj)) {
				for(const each of simulationModelObj) {
					parseModelCase(modellingParam, each);
				}
			} else {
				parseModelCase(modellingParam, simulationModelObj);
			}
		}
	}

  	const exeFormsObj = simObj['exeForm'];
	if(exeFormsObj) {
		let exeFormParam = iso_param.exeForm;
		const libraryObj = jsonVal(exeFormsObj, 'libraryURL')
		if (Array.isArray(libraryObj)) {
			for(const each of libraryObj) {
				exeFormParam.libraryURL.push(each);
			}
		} else {
			exeFormParam.libraryURL.push(libraryObj);
		}
	  	const exeFormObj = exeFormsObj['exeForm'];
		if(exeFormObj) {
			if(isIterable(exeFormObj)) {
				for(const each of exeFormObj) {
					parseExeForm(exeFormParam.exeForm, each);
				}
			} else {
				parseExeForm(exeFormParam.exeForm, exeFormObj);
			}
		}
	}

	parseNvList(iso_param.additionalInfo, simObj['additionalInfo']);

	return iso_param;
}

function parseExeForm(param, obj) {
	if(obj) {
		let exeForm = new ExeFormParam();
		exeForm.exeFileURL = jsonVal(obj, 'exeFileURL');
		exeForm.shellCmd.push(...(jsonVal(obj, 'shellCmd') ? jsonVal(obj, 'shellCmd').split(",") : []));
		const propertiesObj = obj['properties'];
		if(propertiesObj) {
			if(isIterable(propertiesObj)) {
				for(const each of propertiesObj) {
					parseProperty(exeForm.properties, each);
				}
			} else {
				parseProperty(exeForm.properties, propertiesObj);
			}
		}
		parseNvList(exeForm.additionalInfo, obj['additionalInfo']);
		param.push(exeForm);
	}
}

function parseModelCase(param, obj) {
	if(obj) {
		let modelCase = new ModelCaseParam();
		modelCase.simulator = jsonVal(obj, 'simulator');
		modelCase.mdf.push(jsonVal(obj, 'mdf') ? jsonVal(obj, 'mdf') : []);
		let objLibs = jsonVal(obj, 'libraries');
		if (Array.isArray(objLibs)) {
			for(const each of objLibs) {
				modelCase.libraries.push(each);
			}
		} else {
			modelCase.libraries.push(objLibs);
		}
		const dynamicSWObj = obj['dynamicSW'];
		if(dynamicSWObj) {
			if(isIterable(dynamicSWObj)) {
				for(const each of dynamicSWObj) {
					parseExeForm(modelCase.dynamicSW, each);
				}
			} else {
				parseExeForm(modelCase.dynamicSW, dynamicSWObj);
			}
		}
		parseNvList(modelCase.additionalInfo, obj['additionalInfo']);
		param.simulationModel.push(modelCase);
	}
}

function parseCyberSecurity(param, obj) {
	if(obj) {
		let cyberSecurity = new CyberSecurityParam();
		cyberSecurity.securityType = jsonVal(obj, 'securityType');
		cyberSecurity.eachSecurityLevel = jsonVal(obj, 'eachSecurityLevel');
		param.inCybSecurityLevel.push(cyberSecurity);
	}
}

function parseSafetyFunction(param, obj) {
	if(obj) {
		let safetyFunction = new SafetyFunctionParam();
		safetyFunction.safetyFunctionType = jsonVal(obj, 'safetyFunctionType');
		safetyFunction.validSafetyLevelType = jsonVal(obj, 'validSafetyLevelType');
		safetyFunction.eachSafetyLevelPL = jsonVal(obj, 'eachSafetyLevelPL');
		safetyFunction.eachSafetyLevelSIL = jsonVal(obj, 'eachSafetyLevelSIL');
		param.inSafetyLevel.push(safetyFunction);
	}
}

function parseCommunication(param, obj) {
	if(obj) {
		let commParam = new CommunicationParam();
		param.push(commParam);
		let objMostTopProtocol = obj['mostTopProtocol'];
		if(objMostTopProtocol) {
			if(isIterable(objMostTopProtocol)) {
				for(const each of objMostTopProtocol) {
					let mostTopProtocol = new InfraTypeParam();
					mostTopProtocol.name = jsonVal(each, 'name');
					parseRangeString(mostTopProtocol.version, each['version']);
					commParam.mostTopProtocol.push(mostTopProtocol);
				}
			} else {
				let mostTopProtocol = new InfraTypeParam();
				mostTopProtocol.name = jsonVal(objMostTopProtocol, 'name');
				parseRangeString(mostTopProtocol.version, objMostTopProtocol['version']);
				commParam.mostTopProtocol.push(mostTopProtocol);
			}
		}

		let objUnderlyingProtocol = obj['underlyingProtocol'];
		if(objUnderlyingProtocol) {
			commParam.underlyingProtocol.connectionType = jsonVal(objUnderlyingProtocol, 'connectionType');
			commParam.underlyingProtocol.typePhyMac = jsonVal(objUnderlyingProtocol, 'typePhyMac');
			commParam.underlyingProtocol.typeNetTrans.push(jsonVal(objUnderlyingProtocol, 'typeNetTrans'));
			commParam.underlyingProtocol.typeApp.push(jsonVal(objUnderlyingProtocol, 'typeApp'));
			commParam.underlyingProtocol.speed = jsonVal(objUnderlyingProtocol, 'speed');
			parseNvList(commParam.underlyingProtocol.additionalInfo, objUnderlyingProtocol['additionalInfo']);
		}
	}
}

function parseInfraType(param, obj) {
	if(obj) {
		let infraParam = new InfraTypeParam();
		infraParam.name = jsonVal(obj, 'name');
		parseRangeString(infraParam.version, obj['version']);
		param.push(infraParam);
	}
}

function parseArgSpec(method, obj) {
	if(obj) {
		let argParam = new ArgSpecParam();
		argParam.valueName = jsonVal(obj, 'valueName');
		argParam.type = jsonVal(obj, 'type');
		argParam.inout = jsonVal(obj, 'inout');
		parseNvList(argParam.additionalInfo, obj['additionalInfo']);
		method.argType.push(argParam);
	}
}

function parseServiceMethod(profile, obj) {
	if(obj) {
		let methodParam = new ServiceMethodParam();
		methodParam.methodName = jsonVal(obj, 'methodName');
		methodParam.retType = jsonVal(obj, 'retType');
		methodParam.moType = jsonVal(obj, 'moType');
		methodParam.reqProvType = jsonVal(obj, 'reqProvType');
		parseNvList(methodParam.additionalInfo, obj['additionalInfo']);
		const argTypeObj = obj['argType'];
		if(argTypeObj) {
			if(isIterable(argTypeObj)) {
				for(const each of argTypeObj) {
					parseArgSpec(methodParam, each);
				}
			} else {
				parseArgSpec(methodParam, argTypeObj);
			}
		}
		profile.methodList.push(methodParam);
	}
}

function parseServiceProfile(services, obj) {
	if(obj) {
		let profileParam = new ServiceProfileParam();
		profileParam.id = jsonVal(obj, 'id');
		profileParam.ifURL = jsonVal(obj, 'ifURL');
		profileParam.pvType = jsonVal(obj, 'pvType');
		profileParam.moType = jsonVal(obj, 'moType');
		parseNvList(profileParam.additionalInfo, obj['additionalInfo']);
		const serviceMethodObj = obj['methodList'];
		if(serviceMethodObj) {
			if(isIterable(serviceMethodObj)) {
				for(const each of serviceMethodObj) {
					parseServiceMethod(profileParam, each);
				}
			} else {
				parseServiceMethod(profileParam, serviceMethodObj);
			}
		}
		services.serviceProfile.push(profileParam);
	}
}

function parseVariable(ioVariables, obj) {
	if(obj) {
		let param = new VariableParam();
		param.name = jsonVal(obj, 'name');
		param.type = jsonVal(obj, 'type');
		param.unit = jsonVal(obj, 'unit');
		param.description = jsonVal(obj, 'description');
		param.ioType = jsonVal(obj, 'ioType');
		param.value = jsonVal(obj, 'value');
		parseModuleId(param.moduleID, obj['moduleID']);
		parseNvList(param.additionalInfo, obj['additionalInfo']);
		ioVariables.variable.push(param);
	}
}

function parseProperty(property, obj) {
	if(obj) {
		let param = new PropertyParam();
		param.name = jsonVal(obj, 'name');
		param.type = jsonVal(obj, 'type');
		param.unit = jsonVal(obj, 'unit');
		param.description = jsonVal(obj, 'description');
		param.value = jsonVal(obj, 'value');
		param.immutable = jsonVal(obj, 'immutable');
		parseNvList(param.additionalInfo, obj['additionalInfo']);
		property.push(param);
	}
}

function parseExecutionType(exeType, obj) {
	if(obj) {
		let exeParam = new ExecutionTypeParam();
		exeParam.opType = obj['opType'];
		exeParam.hardRT = obj['hardRT'];
		exeParam.timeConstraint = obj['timeConstraint'];
		exeParam.priority = obj['priority'];
		exeParam.instanceType = obj['instanceType'];
		exeType.push(exeParam);
	}
}

function parseLibrary(libs, obj) {
	if(obj) {
		let library = new LibraryParam();
		library.name = obj['name'];
		library.type = obj['type'];
		library.version = obj['version'];
		libs.libraries.push(library);
	}
}

function parseNvList(param, obj) {
	if(obj) {
		if(obj['nv']) {
			for(const each of obj['nv']) {
				let nvParam = new NameValue();
				nvParam.name = jsonVal(each, 'name');
				nvParam.value = jsonVal(each, 'value');
				param.nv.push(nvParam);
			}
		}
	}
}

function parseRangeString(param, obj) {
	if(obj) {
		param.min = jsonVal(obj, 'min');
		param.max = jsonVal(obj, 'max');
	}
}

function parseOsType(param, obj) {
	if(obj) {
		param.type = jsonVal(obj, 'type');
		param.bit = jsonVal(obj, 'bit');
		param.version = jsonVal(obj, 'version');
	}
}

function parseModuleId(param, obj) {
	if(obj) {
		param.mID = jsonVal(obj, 'mID');
		param.iID = jsonVal(obj, 'iID');
	}
}

function jsonVal(source, key) {
  return source[key] ?? "";
}

module.exports = {
	parseIsoXML
  	// convertIso2Rtc
};
