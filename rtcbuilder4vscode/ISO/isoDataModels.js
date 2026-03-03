const ELEM_DELIMITOR = ":";
const ISO_PREFIX = "__iso__";
const CONTAINER_PREFIX = "__container__";

const INOUT_SUFFIX_IN = "_In";
const INOUT_SUFFIX_OUT = "_Out";

class ModuleIDParam {
    constructor() {
        this.iID = '';
        this.mID = '';
    }
}

class IDnTypeParam {
    constructor() {
        this.moduleID = new ModuleIDParam();
        this.informationModelVersion = '';
        this.swAspects = [];
    }
}

class OSTypeParam {
    constructor() {
        this.type = '';
        this.bit = '';
        this.version = '';
    }
}

class LibraryParam {
    constructor() {
        this.name = '';
        this.type = '';
        this.version = '';
    }
}

class LibrariesParam {
    constructor() {
        this.libraries = [];
    }
}

class RangeStringParam {
    constructor() {
        this.min = '';
        this.max = '';
    }
}

class CompilerTypeParam {
    constructor() {
        this.osName = '';
        this.verRangeOS = new RangeStringParam();
        this.compilerName = '';
        this.verRangeCompiler = new RangeStringParam();
        this.bitnCPUarch = '';
    }
}

class ExecutionTypeParam {
    constructor() {
        this.opType = '';
        this.hardRT = false;
        this.timeConstraint = -1.0;
        this.priority = null;
        this.instanceType = '';
    }
}

class PropertyParam {
    constructor() {
        this.name = '';
        this.type = '';
        this.unit = '';
        this.description = '';
        this.value = '';
        this.immutable = false;
        this.additionalInfo = new NVListParam();
    }
}

class PropertiesParam {
    constructor() {
        this.osType = new OSTypeParam();
        this.libs = new LibrariesParam();
        this.compiler = new CompilerTypeParam();
        this.exeType = [];
        this.property = [];
    }
}

class VariableParam {
    constructor() {
        this.name = '';
        this.type = '';
        this.unit = '';
        this.description = '';
        this.ioType = '';
        this.value = '';
        this.moduleID = new ModuleIDParam();
        this.additionalInfo = new NVListParam();
    }
}

class IOVariablesParam {
    constructor() {
        this.variable = [];
    }
}

class StatusParam {
    constructor() {
        this.executionStatus = '';
        this.errorType = 0;
    }
}

class ArgSpecParam {
    constructor() {
        this.valueName = '';
        this.type = '';
        this.inout = '';
        this.additionalInfo = new NVListParam();
    }
}

class ServiceMethodParam {
    constructor() {
        this.methodName = '';
        this.retType = '';
        this.moType = '';
        this.reqProvType = '';
        this.argType = [];
        this.additionalInfo = new NVListParam();
    }
}

class ServiceProfileParam {
    constructor() {
        this.id = '';
        this.ifURL = '';
        this.pvType = '';
        this.moType = '';
        this.methodList = [];
        this.additionalInfo = new NVListParam();
    }
}

class ServicesParam {
    constructor() {
        this.noOfBasicService = 0;
        this.noOfOptionalService = 0;
        this.serviceProfile = [];
    }
}

class InfraTypeParam {
    constructor() {
        this.name = '';
        this.version = new RangeStringParam();
    }
}

class DataBusParam {
    constructor() {
        this.connectionType = '';
        this.typePhyMac = '';
        this.typeNetTrans = [];
        this.typeApp = [];
        this.speed = -1.0;
        this.additionalInfo = new NVListParam();
    }
}

class CommunicationParam {
    constructor() {
        this.mostTopProtocol = [];
        this.underlyingProtocol = new DataBusParam();
    }
}

class InfrastructureParam {
    constructor() {
        this.database = [];
        this.comms = [];
        this.middleware = [];
        this.additionalInfo = new NVListParam();
    }
}

class SafetyFunctionParam {
    constructor() {
        this.safetyFunctionType = '';
        this.validSafetyLevelType = '';
        this.eachSafetyLevelPL = '';
        this.eachSafetyLevelSIL = '';
    }
}

class CyberSecurityParam {
    constructor() {
        this.securityType = '';
        this.eachSecurityLevel = '';
    }
}

class SafeSecureParam {
    constructor() {
        this.overallValidSafetyLevelType = '';
        this.overallSafetyLevelPL = '';
        this.overallSafetyLevelSIL = '';
        this.overallPhySecurityLevel = '';
        this.overallCybSecurityLevel = '';
        this.inSafetyLevel = [];
        this.inCybSecurityLevel = [];
        this.additionalInfo = new NVListParam();
    }
}

class ModelCaseParam {
    constructor() {
        this.simulator = '';
        this.mdf = [];
        this.libraries = [];
        this.dynamicSW = [];
        this.additionalInfo = new NVListParam();
    }
}

class ModellingParam {
    constructor() {
        this.simulationModel = [];
    }
}

class ExeFormParam {
    constructor() {
        this.exeFileURL = '';
        this.shellCmd = [];
        this.properties = [];
        this.additionalInfo = new NVListParam();
    }
}

class ExecutableFormParam {
    constructor() {
        this.exeForm = [];
        this.libraryURL = [];
    }
}

class NameValue {
    constructor() {
        this.name = '';
        this.value = '';
    }
}

class NVListParam {
    constructor() {
        this.nv = [];
    }
}

class SIMParam {
    constructor() {
        this.moduleName = '';
        this.description = '';
        this.manufacturer = '';
        this.examples = '';
        this.idnType = new IDnTypeParam();
        this.properties = new PropertiesParam();
        this.ioVariables = new IOVariablesParam();
        this.status = new StatusParam();
        this.services = new ServicesParam();
        this.infra = new InfrastructureParam();
        this.safeSecure = new SafeSecureParam();
        this.modelling = new ModellingParam();
        this.exeForm = new ExecutableFormParam();
        this.additionalInfo = new NVListParam();
    }
}

function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === 'function';
}

module.exports = {
  ELEM_DELIMITOR,
  ISO_PREFIX,
  INOUT_SUFFIX_IN,
  INOUT_SUFFIX_OUT,
  CONTAINER_PREFIX,
  SIMParam,
  ModuleIDParam,
  VariableParam,
  ServiceProfileParam,
  ServiceMethodParam,
  ArgSpecParam,
  PropertyParam,
  LibrariesParam,
  LibraryParam,
  CompilerTypeParam,
  ExecutionTypeParam,
  InfraTypeParam,
  CommunicationParam,
  DataBusParam,
  SafetyFunctionParam,
  CyberSecurityParam,
  ModelCaseParam,
  ExeFormParam,
  NVListParam,
  NameValue,
  RangeStringParam,
  isIterable
};
