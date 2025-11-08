class Doc {
  constructor() {
    this["@"] = {};
  }
  setAttribute(key, value) {
    if (value != null && 0 < value.length) this["@"][key] = value;
    else delete this["@"][key];
  }
  toXmlObject() {
    return Object.keys(this["@"]).length > 0 ? { "@": this["@"] } : {};
  }
}

class BasicInfo {
  constructor() {
    this["@"] = {};
    this.children = {};
    this.versionUpLogs = [];
  }
  setAttribute(key, value) {
    if (value != null && 0 < value.length) this["@"][key] = value;
    else delete this["@"][key];
  }
  setDoc(doc) {
    if (doc) {
      const xmlObj = doc.toXmlObject();
      if (xmlObj && Object.keys(xmlObj).length > 0) {
        this.children["rtcDoc:Doc"] = xmlObj;
      } else {
        delete this.children["rtcDoc:Doc"];
      }
    } else {
      delete this.children["rtcDoc:Doc"];
    }
  }
  addVersionUpLog(log) {
    if (log) this.versionUpLogs.push(log);
  }
  toXmlObject() {
    const obj = {};
    if (Object.keys(this["@"]).length) obj["@"] = this["@"];

    Object.assign(obj, this.children);

    if (this.versionUpLogs.length > 0) {
      obj["rtcExt:VersionUpLogs"] = this.versionUpLogs;
    }
    return obj;
  }
}

class ActionStatus {
  constructor() {
    this["@"] = {};
    this.doc = null;
  }
  setAttribute(key, value) {
    if (value != null) this["@"][key] = value;
    else delete this["@"][key];
  }
  setDoc(doc) {
    this.doc = doc ? doc.toXmlObject() : null;
  }
  toXmlObject() {
    const obj = {};
    if (Object.keys(this["@"]).length) obj["@"] = this["@"];

    if (this.doc && 0 < Object.keys(this.doc).length) {
      obj["rtcDoc:Doc"] = this.doc;
    } 

    return obj;
  }
}

class Actions {
  constructor() {
    this.actions = {};
  }
  setAction(name, actionStatus) {
    if (actionStatus instanceof ActionStatus) {
      this.actions[`rtc:${name}`] = actionStatus.toXmlObject();
    } else {
      delete this.actions[`rtc:${name}`];
    }
  }
  toXmlObject() {
    return this.actions;
  }
}

class Or {
  constructor() {
    this.constraints = [];
  }
  addPropertyIsEqualTo(value, matchCase = false) {
    const unit = new ConstraintUnitType();
    unit.setPropertyIsEqualTo(value, matchCase);

    const constraint = new Constraint();
    constraint.setUnitType(unit);

    this.constraints.push(constraint);
  }
  toXmlObject() {
    return {
      "rtc:Or": {
        "rtc:Constraint": this.constraints.map(c => c.toXmlObject())
      }
    };
  }
}

class And {
  constructor() {
    this.constraints = [];
  }
  addPropertyIsEqualTo(value, matchCase = false) {
    const unit = new ConstraintUnitType();
    unit.setPropertyIsEqualTo(value, matchCase);

    const constraint = new Constraint();
    constraint.setUnitType(unit);

    this.constraints.push(constraint);
  }
  toXmlObject() {
    return {
      "rtc:And": {
        "rtc:Constraint": this.constraints.map(c => c.toXmlObject())
      }
    };
  }
}

class ConstraintHashType {
  constructor() {
    this.constraints = [];
  }

  addPropertyIsEqualTo(key, value, matchCase = false) {
    const unit = new ConstraintUnitType();
    unit.setPropertyIsEqualToWithKey(value, key, matchCase);

    const constraint = new Constraint();
    constraint.setUnitType(unit);

    this.constraints.push(constraint);
  }

  toXmlObject() {
    return {
      "rtc:ConstraintHashType": {
        "rtc:Constraint": this.constraints.map(c => c.toXmlObject())
      }
    };
  }
}

class ConstraintListType {
  constructor() {
    this.constraints = [];
  }

  addPropertyIsEqualTo(value, matchCase = false) {
    const unit = new ConstraintUnitType();
    unit.setPropertyIsEqualTo(value, matchCase);

    const constraint = new Constraint();
    constraint.setUnitType(unit);

    this.constraints.push(constraint);
  }

  toXmlObject() {
    return {
      "rtc:ConstraintListType": {
        "rtc:Constraint": this.constraints.map(c => c.toXmlObject())
      }
    };
  }
}

class ConstraintUnitType {
  constructor() {
    this.constraint = {};
  }
  setPropertyIsEqualTo(value, matchCase = false) {
    this.constraint = {
      "rtc:propertyIsEqualTo": {
        "@": { "rtc:matchCase": matchCase.toString() },
        "rtc:Literal": value
      }
    };
  }
  setPropertyIsEqualToWithKey(value, key, matchCase = false) {
    this.constraint = {
      "@": { "rtc:key": key },
      "rtc:propertyIsEqualTo": {
        "@": { "rtc:matchCase": matchCase.toString() },
        "rtc:Literal": value
      }
    };
  }
  setPropertyIsLessThan(value, matchCase = false) {
    this.constraint = {
      "rtc:propertyIsLessThan": {
        "@": { "rtc:matchCase": matchCase.toString() },
        "rtc:Literal": value
      }
    };
  }
  setPropertyIsLessThanOrEqualTo(value, matchCase = false) {
    this.constraint = {
      "rtc:propertyIsLessThanOrEqualTo": {
        "@": { "rtc:matchCase": matchCase.toString() },
        "rtc:Literal": value
      }
    };
  }
  setPropertyIsGreaterThan(value, matchCase = false) {
    this.constraint = {
      "rtc:propertyIsGreaterThan": {
        "@": { "rtc:matchCase": matchCase.toString() },
        "rtc:Literal": value
      }
    };
  }
  setPropertyIsGreaterThanOrEqualTo(value, matchCase = false) {
    this.constraint = {
      "rtc:propertyIsGreaterThanOrEqualTo": {
        "@": { "rtc:matchCase": matchCase.toString() },
        "rtc:Literal": value
      }
    };
  }
  setAnd(constraintsArray) {
    this.constraint = {
      "rtc:And": constraintsArray
    };
  }
  setOr(constraintsArray) {
    this.constraint = {
      "rtc:Or": constraintsArray
    };
  }
  setPropertyIsBetween(lower, upper) {
    this.constraint = {
      "rtc:propertyIsBetween": {
        "rtc:LowerBoundary": lower,
        "rtc:UpperBoundary": upper
      }
    };
  }
  toXmlObject() {
    return this.constraint;
  }
}

class Constraint {
  constructor() {
    this.unitType = null;
    this.listType = null;
  }
  setUnitType(constraint) {
    this.unitType = constraint;
  }
  setListType(constraint) {
    this.listType = constraint;
  }
  toXmlObject() {
    if (this.unitType) {
      return {
        "rtc:ConstraintUnitType": this.unitType.toXmlObject()
      };
    } else if (this.listType) {
      return this.listType.toXmlObject();
    } else {
      return {};
    }
  }
}

class Configuration {
  constructor() {
    this["@"] = {};
    this.constraintXmlObj = null;
    this.properties = [];
  }
  setAttribute(key, value) {
    if (value != null) this["@"][key] = value;
    else delete this["@"][key];
  }
  setConstraint(constraint) {
    this.constraintXmlObj = constraint ? constraint.toXmlObject() : null;
  }
  addProperty(name, value) {
    this.properties.push({ "@": { "rtcExt:name": name, "rtcExt:value": value } });
  }
  setDoc(doc) {
    this.doc = doc;
  }
  toXmlObject() {
    const obj = { "@": this["@"] };
    // Doc
    if (this.doc) {
      const docObj = this.doc.toXmlObject();
      if (Object.keys(docObj).length > 0) {
        obj["rtcDoc:Doc"] = docObj;
      }
    }

    // Constraint
    if (this.constraintXmlObj && Object.keys(this.constraintXmlObj).length > 0) {
      obj["rtc:Constraint"] = this.constraintXmlObj;
    }
    // Properties
    if (this.properties.length > 0) {
      obj["rtcExt:Properties"] = this.properties;
    }

    return obj;
  }
}

class ConfigurationSet {
  constructor() {
    this.configurations = [];
  }
  addConfiguration(config) {
    this.configurations.push(config.toXmlObject());
  }
  toXmlObject() {
    return {
      "rtc:Configuration": this.configurations
    };
  }
}

class DataPorts {
  constructor() {
    this["@"] = {};
    this.children = {};
  }
  setAttribute(key, value) {
    if (value != null) this["@"][key] = value;
    else delete this["@"][key];
  }
  setConstraint(constraint) {
    if (constraint) this.children["rtc:Constraint"] = constraint.toXmlObject();
    else delete this.children["rtc:Constraint"];
  }
  setDoc(doc) {
    if (doc) {
      const xmlObj = doc.toXmlObject();
      if (xmlObj && Object.keys(xmlObj).length > 0) {
        this.children["rtcDoc:Doc"] = xmlObj;
      } else {
        delete this.children["rtcDoc:Doc"];
      }
    } else {
      delete this.children["rtcDoc:Doc"];
    }
  }

  toXmlObject() {
    const obj = {};
    if (Object.keys(this["@"]).length) obj["@"] = this["@"];
    Object.assign(obj, this.children);
    return obj;
  }
}

class ServiceInterface {
  constructor() {
    this["@"] = {};
    this.children = {};
  }
  setAttribute(key, value) {
    if (value != null) this["@"][key] = value;
    else delete this["@"][key];
  }
  setDoc(doc) {
    if (doc) {
      const xmlObj = doc.toXmlObject();
      if (xmlObj && Object.keys(xmlObj).length > 0) {
        this.children["rtcDoc:Doc"] = xmlObj;
      } else {
        delete this.children["rtcDoc:Doc"];
      }
    } else {
      delete this.children["rtcDoc:Doc"];
    }
  }
  toXmlObject() {
    const obj = {};
    if (Object.keys(this["@"]).length) obj["@"] = this["@"];

    Object.assign(obj, this.children);
    return obj;
  }
}

class ServicePorts {
  constructor() {
    this["@"] = {};
    this.serviceInterfaces = [];
    this.transMethods = null;
    this.doc = null;
  }
  setAttribute(key, value) {
    if (value != null) this["@"][key] = value;
    else delete this["@"][key];
  }
  addServiceInterface(si) {
    this.serviceInterfaces.push(si.toXmlObject());
  }
  setTransMethods(kind) {
    if (kind) {
      this.transMethods = { "@": { "rtc:kind": kind } };
    } else {
      this.transMethods = null;
    }
  }
  setDoc(doc) {
    this.doc = doc ? doc.toXmlObject() : null;
  }
  toXmlObject() {
    const obj = {};
    if (Object.keys(this["@"]).length) obj["@"] = this["@"];

    if (this.serviceInterfaces.length) obj["rtc:ServiceInterface"] = this.serviceInterfaces;
    if (this.transMethods) obj["rtc:TransMethods"] = this.transMethods;
    if (this.doc && 0 < Object.keys(this.doc).length) {
      obj["rtcDoc:Doc"] = this.doc;
    } 

    return obj;
  }
}

class Language {
  constructor() {
    this["@"] = {};
    this.targets = [];
  }
  setAttribute(key, value) {
    if (value != null) this["@"][key] = value;
    else delete this["@"][key];
  }
  addTarget(target) {
    this.targets.push(target);
  }
  toXmlObject() {
    const obj = {};
    if (Object.keys(this["@"]).length) obj["@"] = this["@"];
    if (this.targets.length > 0) obj["rtcExt:targets"] = this.targets;
    return obj;
  }
}

class RtcProfile {
  constructor() {
    this["@"] = {
      "rtc:version": "0.3",
      "rtc:id": "RTC:SampleVender:SampleCategory:SampleComponent:1.0.0",
      "xmlns:rtc": "http://www.openrtp.org/namespaces/rtc",
      "xmlns:rtcExt": "http://www.openrtp.org/namespaces/rtc_ext",
      "xmlns:rtcDoc": "http://www.openrtp.org/namespaces/rtc_doc",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
    };

    this.BasicInfo = new BasicInfo();
    this.Actions = new Actions();
    this.ConfigurationSet = new ConfigurationSet();
    this.DataPorts = [];
    this.ServicePorts = [];
    this.Language = null;
  }

  addDataPort(dataPort) {
    this.DataPorts.push(dataPort);
  }
  addServicePort(servicePort) {
    this.ServicePorts.push(servicePort);
  }
  setLanguage(lang) {
    this.Language = lang;
  }

  toXmlObject() {
    const obj = { "@": this["@"] };

    obj["rtc:BasicInfo"] = this.BasicInfo.toXmlObject();
    obj["rtc:Actions"] = this.Actions.toXmlObject();
    if (this.ConfigurationSet.configurations.length > 0) {
      obj["rtc:ConfigurationSet"] = this.ConfigurationSet.toXmlObject();
    }

    if (this.DataPorts.length > 0) obj["rtc:DataPorts"] = this.DataPorts.map(d => d.toXmlObject());
    if (this.ServicePorts.length > 0) obj["rtc:ServicePorts"] = this.ServicePorts.map(s => s.toXmlObject());
    if (this.Language) obj["rtc:Language"] = this.Language.toXmlObject();

    return obj;
  }
}

module.exports = {
  RtcProfile,
  BasicInfo,
  Doc,
  Actions,
  ActionStatus,
  ConstraintHashType,
  ConstraintListType,
  ConstraintUnitType,
  And,
  Or,
  Constraint,
  Configuration,
  ConfigurationSet,
  DataPorts,
  ServiceInterface,
  ServicePorts,
  Language
};
