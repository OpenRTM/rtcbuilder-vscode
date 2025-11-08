const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const js2xmlparser = require('js2xmlparser');
const { XMLParser } = require('fast-xml-parser');

const {
  RtcParam, ActionParam, PropertyParam,
  DataPortParam,
  ServicePortInterfaceParam, ServicePortParam,
  ConfigSetParam
} = require("./../model/dataModels");

const {
  RtcProfile, BasicInfo, Doc, Actions, ActionStatus,
  Constraint, And, Or,
  ConstraintHashType, ConstraintListType, ConstraintUnitType,
  Configuration, ConfigurationSet,
  DataPorts, ServiceInterface, ServicePorts, Language
} = require("./../model/rtcProfileModel");

function createXML(param) {
  let currentDate = formatDateWithTimezoneOffset();

  const rtc = new RtcProfile();
  rtc["@"]["rtc:id"] = "RTC:" + param.vendor + ":" + param.category + ":" + param.name + ":" + param.version;
  rtc.BasicInfo.setAttribute("xsi:type", "rtcExt:basic_info_ext");

  // rtc.BasicInfo.setAttribute("rtcExt:saveProject", "Output Project");
  rtc.BasicInfo.setAttribute("rtc:name", param.name);
  rtc.BasicInfo.setAttribute("rtc:componentType", param.componentType);
  rtc.BasicInfo.setAttribute("rtc:activityType", param.activityType);
  rtc.BasicInfo.setAttribute("rtc:componentKind", param.componentKind);
  rtc.BasicInfo.setAttribute("rtc:rtcType", param.rtcType);
  rtc.BasicInfo.setAttribute("rtc:category", param.category);
  rtc.BasicInfo.setAttribute("rtc:description", param.description);
  rtc.BasicInfo.setAttribute("rtc:executionRate", formatNumber(param.executionRate));
  rtc.BasicInfo.setAttribute("rtc:executionType", param.executionType);
  rtc.BasicInfo.setAttribute("rtc:maxInstances", param.maxInstance.toString());
  rtc.BasicInfo.setAttribute("rtc:vendor", param.vendor);
  rtc.BasicInfo.setAttribute("rtc:version", param.version);
  rtc.BasicInfo.setAttribute("rtc:abstract", param.abstractDesc);
  rtc.BasicInfo.setAttribute("rtc:hardwareProfile", param.hardwareProfile);
  rtc.BasicInfo.setAttribute("rtc:updateDate", currentDate);
  rtc.BasicInfo.setAttribute("rtc:creationDate", currentDate);
  //
  const doc = new Doc();
  doc.setAttribute("rtcDoc:algorithm", param.doc_algorithm);
  doc.setAttribute("rtcDoc:description", param.doc_description);
  doc.setAttribute("rtcDoc:inout", param.doc_in_out);
  doc.setAttribute("rtcDoc:creator", param.doc_creator);
  doc.setAttribute("rtcDoc:license", param.doc_license);
  doc.setAttribute("rtcDoc:reference", param.doc_reference);
  rtc.BasicInfo.setDoc(doc);
  ///////
  setActivityInfo(param, rtc, 'onInitialize');
  setActivityInfo(param, rtc, 'onFinalize');
  setActivityInfo(param, rtc, 'onStartup');
  setActivityInfo(param, rtc, 'onShutdown');
  setActivityInfo(param, rtc, 'onActivated');
  setActivityInfo(param, rtc, 'onDeactivated');
  setActivityInfo(param, rtc, 'onAborting');
  setActivityInfo(param, rtc, 'onError');
  setActivityInfo(param, rtc, 'onReset');
  setActivityInfo(param, rtc, 'onExecute');
  setActivityInfo(param, rtc, 'onStateUpdate');
  setActivityInfo(param, rtc, 'onRateChanged');
  ///////
  for(const dp of param.inports) {
    const dataPort = new DataPorts();
    dataPort.setAttribute("xsi:type", "rtcExt:dataport_ext");
    dataPort.setAttribute("rtc:portType", "DataInPort");
    dataPort.setAttribute("rtc:name", dp.name);
    dataPort.setAttribute("rtc:type", dp.type);
    dataPort.setAttribute("rtc:idlFile", dp.dispIdlFile);
    dataPort.setAttribute("rtc:interfaceType", dp.interfaceType);
    dataPort.setAttribute("rtc:dataflowType", dp.dataFlowType);
    dataPort.setAttribute("rtc:subscriptionType", dp.subscriptionType);
    dataPort.setAttribute("rtc:unit", dp.unit);
    dataPort.setAttribute("rtcExt:variableName", dp.varname);

    const dp_doc = new Doc();
    dp_doc.setAttribute("rtcDoc:description", dp.doc_description);
    dp_doc.setAttribute("rtcDoc:type", dp.doc_type);
    dp_doc.setAttribute("rtcDoc:number", dp.doc_num);
    dp_doc.setAttribute("rtcDoc:semantics", dp.doc_semantics);
    dp_doc.setAttribute("rtcDoc:unit", dp.doc_unit);
    dp_doc.setAttribute("rtcDoc:occerrence", dp.doc_occerrence);
    dp_doc.setAttribute("rtcDoc:operation", dp.doc_operation);
    dataPort.setDoc(dp_doc);

    rtc.addDataPort(dataPort);
  }
  for(const dp of param.outports) {
    const dataPort = new DataPorts();
    dataPort.setAttribute("xsi:type", "rtcExt:dataport_ext");
    dataPort.setAttribute("rtc:portType", "DataOutPort");
    dataPort.setAttribute("rtc:name", dp.name);
    dataPort.setAttribute("rtc:type", dp.type);
    dataPort.setAttribute("rtc:idlFile", dp.dispIdlFile);
    dataPort.setAttribute("rtc:interfaceType", dp.interfaceType);
    dataPort.setAttribute("rtc:dataflowType", dp.dataFlowType);
    dataPort.setAttribute("rtc:subscriptionType", dp.subscriptionType);
    dataPort.setAttribute("rtc:unit", dp.unit);
    dataPort.setAttribute("rtcExt:variableName", dp.varname);

    const dp_doc = new Doc();
    dp_doc.setAttribute("rtcDoc:description", dp.doc_description);
    dp_doc.setAttribute("rtcDoc:type", dp.doc_type);
    dp_doc.setAttribute("rtcDoc:number", dp.doc_num);
    dp_doc.setAttribute("rtcDoc:semantics", dp.doc_semantics);
    dp_doc.setAttribute("rtcDoc:unit", dp.doc_unit);
    dp_doc.setAttribute("rtcDoc:occerrence", dp.doc_occerrence);
    dp_doc.setAttribute("rtcDoc:operation", dp.doc_operation);
    dataPort.setDoc(dp_doc);

    rtc.addDataPort(dataPort);
  }
  ///////
  for(const sp of param.serviceports) {
    const servicePort = new ServicePorts();
    servicePort.setAttribute("xsi:type", "rtcExt:serviceport_ext");
    servicePort.setAttribute("rtc:name", sp.name);

    const sp_doc = new Doc();
    sp_doc.setAttribute("rtcDoc:description", sp.doc_description);
    sp_doc.setAttribute("rtcDoc:ifdescription", sp.doc_if_description);
    servicePort.setDoc(sp_doc);
    //
    for(const si of sp.serviceinterfaces) {
      const serviceIf = new ServiceInterface();
      serviceIf.setAttribute("xsi:type", "rtcExt:serviceinterface_ext");
      serviceIf.setAttribute("rtc:name", si.name);
      serviceIf.setAttribute("rtc:type", si.interfacetype);
      serviceIf.setAttribute("rtc:direction", si.direction);
      serviceIf.setAttribute("rtc:instanceName", si.instancename);
      serviceIf.setAttribute("rtc:idlFile", si.idlDispfile);
      serviceIf.setAttribute("rtcExt:variableName", si.varname);

      const s1_doc = new Doc();
      s1_doc.setAttribute("rtcDoc:description", si.doc_description);
      s1_doc.setAttribute("rtcDoc:docArgument", si.doc_argument);
      s1_doc.setAttribute("rtcDoc:docReturn", si.doc_return);
      s1_doc.setAttribute("rtcDoc:docException", si.doc_exception);
      s1_doc.setAttribute("rtcDoc:docPreCondition", si.doc_pre_condition);
      s1_doc.setAttribute("rtcDoc:docPostCondition", si.doc_post_condition);
      serviceIf.setDoc(s1_doc);

      servicePort.addServiceInterface(serviceIf);
    }
    rtc.addServicePort(servicePort);
  }
  ///////
  for(const config of param.configParams) {
    const conf = new Configuration();
    conf.setAttribute("xsi:type", "rtcExt:configuration_ext");
    conf.setAttribute("rtc:name", config.name);
    conf.setAttribute("rtc:type", config.type);
    conf.setAttribute("rtc:defaultValue", config.defaultValue);
    conf.setAttribute("rtc:unit", config.unit);
    // conf.setAttribute("rtc:constraint", config.constraint);
    conf.setAttribute("rtcExt:variableName", config.varname);
    conf.setConstraint(convertToXmlConstraint(config.constraint));

    const conf_doc = new Doc();
    conf_doc.setAttribute("rtcDoc:description", config.doc_description);
    conf_doc.setAttribute("rtcDoc:dataname", config.doc_dataname);
    conf_doc.setAttribute("rtcDoc:defaultValue", config.doc_default);
    conf_doc.setAttribute("rtcDoc:unit", config.doc_unit);
    conf_doc.setAttribute("rtcDoc:range", config.doc_range);
    conf_doc.setAttribute("rtcDoc:constraint", config.doc_constraint);
    conf.setDoc(conf_doc);

    for(const prop of config.properties) {
      conf.addProperty(prop.name, prop.value);
    }

    rtc.ConfigurationSet.addConfiguration(conf);
  }

  const lang = new Language();
  lang.setAttribute("xsi:type", "rtcExt:language_ext");
  lang.setAttribute("rtc:kind", param.language);
  rtc.setLanguage(lang);

  const xmlObj = rtc.toXmlObject();

  const options = {
    declaration: {
        include: true,
        encoding: "UTF-8",
        standalone: "yes"
    },
    format: {
        pretty: true
    }
  };
  const xml = js2xmlparser.parse("rtc:RtcProfile", xmlObj, options);
  return xml;
}

function formatNumber(num) {
  if (Number.isInteger(num)) {
    return num.toFixed(1);
  } else {
    return num.toString();
  }
}

function capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setActivityInfo(param, rtc, source) {
  const aStatus = new ActionStatus();
  aStatus.setAttribute("xsi:type", "rtcDoc:action_status_doc");
  aStatus.setAttribute("rtc:implemented", param.actions[source].implemented);

  const docInfo = new Doc();
  docInfo.setAttribute("rtcDoc:description", param.actions[source].overview);
  docInfo.setAttribute("rtcDoc:preCondition", param.actions[source].pre_condition);
  docInfo.setAttribute("rtcDoc:postCondition", param.actions[source].post_condition);
  aStatus.setDoc(docInfo);
  rtc.Actions.setAction(capitalizeFirst(source), aStatus);
}

function convertToXmlConstraint(source) {
  const result = new Constraint();
  if (!source || source.trim().length === 0) return result;

  source = source.replace(/\s+/g, '');
  source = source.trim();

  const unit = new ConstraintUnitType();

  if (source.startsWith('(') || source.endsWith(')')) {
    if ((source.startsWith('(') && source.endsWith(')')) == false) throw new Error("OR条件の構文エラー (" + source + ")");
    const body = source.slice(1, -1);
    const elems = body.split(',');

    if (elems.length === 0) throw new Error("OR条件の構文エラー (" + source + ")");

    const values = source.substring(1, source.length - 1).split(',')
                          .map(v => v.trim()).filter(v => v.length > 0);
    if (values.length === 0) throw new Error("OR条件の構文エラー (" + source + ")");

    const or = new Or();
    for(const each of values) {
      or.addPropertyIsEqualTo(each);
    }
    unit.setOr(or.toXmlObject()["rtc:Or"]); 

  } else if (source.startsWith('{') || source.endsWith('}')) {
    if ((source.startsWith('{') && source.endsWith('}')) == false) throw new Error("ハッシュ条件の構文エラー(" + source + ")");
    const body = source.slice(1, -1);
    const elems = body.split(',');

    if (elems.length === 0) throw new Error("ハッシュ条件の構文エラー (" + source + ")");

    const list = new ConstraintHashType();
    for(const each of elems) {
      const parts = each.split(':');
      if (parts.length !== 2) throw new Error("ハッシュ条件の構文エラー (" + source + ")");
      if (!parts[0]) throw new Error("ハッシュ条件の構文エラー キーが設定されていません(" + source + ")");
      if (!parts[1]) throw new Error("ハッシュ条件の構文エラー 値が設定されていません(" + source + ")");

      list.addPropertyIsEqualTo(parts[0], parts[1]);
    }
    result.setListType(list);
    return result;
  
  } else if (source.includes(',')) {
    const elems = source.split(',');
    if (elems.length === 0) throw new Error("リスト条件の構文エラー (" + source + ")");

    const list = new ConstraintListType();
    for(const each of elems) {
      if(each.length == 0) throw new Error("制約条件が指定されていません (" + source + ")");
      list.addPropertyIsEqualTo(each);
    }
    result.setListType(list);
    return result;

  } else if (/[x><=]/.test(source)) {
    const isNumber = s => /^[-+]?[\d.]+$/.test(s);

    if (source.startsWith('x>=') || source.endsWith("<=x")) {
      let val;
      if (source.startsWith('x>=')) {
        val = source.substring(3);
      } else if(source.endsWith("<=x")) {
        val = source.substring(0, source.length - "x>=".length);
      }
      if(val.length == 0) throw new Error("制約条件が指定されていません (" + source + ")");
      if (!isNumber(val)) throw new Error("制約条件が数値ではありません (" + source + ")");
      unit.setPropertyIsGreaterThanOrEqualTo(val);

    } else if (source.startsWith('x>') || source.endsWith("<x")) {
      let val;
      if (source.startsWith('x>')) {
        val = source.substring(2);
      } else if (source.endsWith("<x")) {
        val = source.substring(0,source.length-"<x".length);
      }
      if(val.length == 0) throw new Error("制約条件が指定されていません (" + source + ")");
      if (!isNumber(val)) throw new Error("制約条件が数値ではありません (" + source + ")");
      unit.setPropertyIsGreaterThan(val);

    } else if (source.startsWith('x<=') || source.endsWith("=>x")) {
      let val;
      if (source.startsWith('x<=')) {
        val = source.substring(3);
      } else if (source.endsWith("=>x")) {
        val = source.substring(0,source.length-"=>x".length);
      }
      if(val.length == 0) throw new Error("制約条件が指定されていません (" + source + ")");
      if (!isNumber(val)) throw new Error("制約条件が数値ではありません (" + source + ")");
      unit.setPropertyIsLessThanOrEqualTo(val);

    } else if (source.startsWith('x<') || source.endsWith(">x") ) {
      let val;
      if (source.startsWith('x<')) {
        val = source.substring(2);
      } else if (source.endsWith(">x") ) {
        val = source.substring(0,source.length-">x".length);
      }
      if(val.length == 0) throw new Error("制約条件が指定されていません (" + source + ")");
      if (!isNumber(val)) throw new Error("制約条件が数値ではありません (" + source + ")");
      unit.setPropertyIsLessThan(val);

    } else if (source.includes('<=x<=') || source.includes("=>x=>") ) {
      let lower, upper;
      if (source.includes('<=x<=')) {
        [lower, upper] = source.split('<=x<=');
      } else if (source.includes("=>x=>") ) {
        [upper, lower] = source.split('=>x=>');
      }
      if(lower.length == 0 || upper.length == 0) throw new Error("制約条件が指定されていません (" + source + ")");
      if (!isNumber(lower) || !isNumber(upper)) throw new Error("制約条件が数値ではありません (" + source + ")");
      if (parseFloat(lower) > parseFloat(upper)) throw new Error("制約条件が矛盾しています (" + source + ")");

      unit.setPropertyIsBetween(lower, upper);

    } else if (source.includes('x')) {
      const idx = source.indexOf('x');
      const former = source.substring(0, idx + 1);
      const latter = source.substring(idx);
      if(former === 'x' || latter === 'x') throw new Error("制約条件が不正です (" + source + ")");

      const and = new And();
      and.constraints.push(convertToXmlConstraint(former));
      and.constraints.push(convertToXmlConstraint(latter));
  
      unit.setAnd(and.toXmlObject()["rtc:And"]); 

    } else {
      throw new Error("比較演算子の構文エラー");
    }

  } else {
    unit.setPropertyIsEqualTo(source);
  }
  result.setUnitType(unit);

  return result;
}

function validateXML(param) {
  let errorList = [];

  const xmlData = param;
  const parser = new XMLParser({ignoreAttributes: false,
                                attributeNamePrefix: ''});
  const jsObj = parser.parse(xmlData);

  if(checkProfileElement(jsObj, 'rtc:RtcProfile',
                         vscode.l10n.t('The specified content is invalid.'),
                         errorList) == false) {
    return errorList;
  }

  const rtcObj = jsObj['rtc:RtcProfile'];
  checkProfileAttribute(rtcObj, 'rtc:id', '', errorList);
  checkProfileAttribute(rtcObj, 'rtc:version', '', errorList);

  if( checkProfileElement(rtcObj, 'rtc:BasicInfo', 'rtc:BasicInfo does NOT EXIST.', errorList) ) {
    const basicObj = rtcObj['rtc:BasicInfo'];
    const basicCheckList = [ 'rtc:name', 'rtc:componentType', 'rtc:activityType',
                             'rtc:componentKind', 'rtc:category', 'rtc:executionType',
                             'rtc:vendor', 'rtc:version',
                             'rtc:creationDate', 'rtc:updateDate'];
    for(const each of basicCheckList) {
      checkProfileAttribute(basicObj, each, ' (BasicInfo)', errorList);
    }
    if('rtc:componentType' in basicObj) {
      const componentType = basicObj['rtc:componentType'];
      if (['STATIC', 'UNIQUE', 'COMMUTATIVE'].includes(componentType.toUpperCase()) == false) {
        errorList.push('The value of componentType is invalid. (BasicInfo)');
      }
    }
    if('rtc:activityType' in basicObj) {
      const activityType = basicObj['rtc:activityType'];
      if (['PERIODIC', 'SPORADIC', 'EVENTDRIVEN'].includes(activityType.toUpperCase()) == false) {
        errorList.push('The value of activityType is invalid. (BasicInfo)');
      }
    }
    if('rtc:executionRate' in basicObj) {
      const executionRate = basicObj['rtc:executionRate'];
      if(isNumeric(executionRate) == false) {
        errorList.push('The value of executionRate is NOT NUMBER. (BasicInfo)');
      }
    }
    if('rtc:maxInstances' in basicObj) {
      const maxInstances = basicObj['rtc:maxInstances'];
      if(isNumeric(maxInstances) == false) {
        errorList.push('The value of maxInstances is NOT NUMBER. (BasicInfo)');
      }
    }

  }
  /////
  if( checkProfileElement(rtcObj, 'rtc:Actions', 'rtc:Actions does NOT EXIST.', errorList) ) {
    const actionsObj = rtcObj['rtc:Actions'];
    const actionList = [ 'OnInitialize', 'OnFinalize', 'OnStartup',
                         'OnShutdown', 'OnActivated', 'OnDeactivated',
                         'OnAborting', 'OnError', 'OnReset',
                         'OnExecute', 'OnStateUpdate', 'OnRateChanged',
                         'OnAction', 'OnModeChanged' ];
    for(const each of actionList) {
      checkActionElement(actionsObj, each, errorList);
    }
  }
  /////
  if('rtc:ConfigurationSet' in rtcObj) {
    const configSetObj = rtcObj['rtc:ConfigurationSet'];
    if('rtc:Configuration' in configSetObj) {
      const configObj = configSetObj['rtc:Configuration'];
      const configList = Array.isArray(configObj) ? configObj : [configObj]; 
      for(const each of configList) {
        let name = '';
        if('rtc:name' in each) {
          name = '[' + each['rtc:name'] + '] ';
        }
        checkProfileAttribute(each, 'rtc:name', ' ( Configuration )', errorList);
        checkProfileAttribute(each, 'rtc:type', ' ( Configuration ' + name + ')', errorList);
        checkProfileAttribute(each, 'rtc:defaultValue', ' (Configuration ' + name + ')', errorList);
      }
    }
  }
  /////
  if('rtc:DataPorts' in rtcObj) {
    const dataPortObj = rtcObj['rtc:DataPorts'];
    const dataPortList = Array.isArray(dataPortObj) ? dataPortObj : [dataPortObj]; 
    for(const each of dataPortList) {
      let name = '';
      if('rtc:name' in each) {
        name = '[' + each['rtc:name'] + '] ';
      }
      checkProfileAttribute(each, 'rtc:portType', ' ( DataPort ' + name + ')', errorList);
      checkProfileAttribute(each, 'rtc:name', ' ( DataPort )', errorList);
      checkProfileAttribute(each, 'rtc:type', ' ( DataPort ' + name + ')', errorList);
      if('rtc:portType' in each) {
        const portType = each['rtc:portType'];
        if (['datainport', 'dataoutport', 'eventport'].includes(portType.toLowerCase()) == false) {
          errorList.push('The value of portType is invalid. ( DataPort ' + name + ')');
        }
      }
    }
  }
  /////
  if('rtc:ServicePorts' in rtcObj) {
    const servicePortObj = rtcObj['rtc:ServicePorts'];
    const servicePortList = Array.isArray(servicePortObj) ? servicePortObj : [servicePortObj]; 
    for(const each of servicePortList) {
      checkProfileAttribute(each, 'rtc:name', ' ( ServicePort )', errorList);
      if('rtc:ServiceInterface' in each) {
        const serviceIFObj = each['rtc:ServiceInterface'];
        const serviceIFList = Array.isArray(serviceIFObj) ? serviceIFObj : [serviceIFObj]; 
        for(const eachIF of serviceIFList) {
          let name = '';
          if('rtc:name' in eachIF) {
            name = '[' + eachIF['rtc:name'] + '] ';
          }
          checkProfileAttribute(eachIF, 'rtc:direction', ' ( ServiceInterface ' + name + ')', errorList);
          checkProfileAttribute(eachIF, 'rtc:name', ' ( ServiceInterface )', errorList);
          checkProfileAttribute(eachIF, 'rtc:type', ' ( ServiceInterface ' + name + ')', errorList);
          if('rtc:direction' in eachIF) {
            const direction = eachIF['rtc:direction'];
            if (['provided', 'required'].includes(direction.toLowerCase()) == false) {
              errorList.push('The value of direction is invalid. ( ServiceInterface ' + name + ')');
            }
          }
        }
      }
    }
  }
  /////
  if('rtc:Language' in rtcObj) {
    const languageObj = rtcObj['rtc:Language'];
    checkProfileAttribute(languageObj, 'rtc:kind', ' ( Language )', errorList);
  }

  return errorList;
}

function checkActionElement(source, target, errorList) {
  const targetTag = 'rtc:' + target;
  if(targetTag in source) {
    const actionElem = source[targetTag];
    if('rtc:implemented' in actionElem == false) {
      errorList.push('Attribute rtc:implemented does NOT EXIST.. (' + target + ')');
    } else {
      const implemented = actionElem['rtc:implemented'];
      if(isBoolean(implemented) == false) {
        errorList.push('The value of implemented is NOT BOOL. (' + target + ')');
      }
    }
  }
}

function checkProfileElement(source, target, errMsg, errorList) {
  if(target in source == false) {
    errorList.push(errMsg);
    return false;
  }
  return true;
}

function checkProfileAttribute(source, target, msg, errorList) {
  if(target in source == false) {
    errorList.push('Attribute ' + target + ' does NOT EXIST.' + msg);
    return false;
  } else {
    const value = source[target];
    if(value.trim().length == 0) {
      errorList.push('Attribute ' + target + ' is EMPTY.' + msg);
      return false;
    }
  }
  return true;
}

function isNumeric(str) {
  if (typeof str !== "string") return false;
  if (str.trim() === "") return false;
  
  return !isNaN(str) && isFinite(str);
}

function isBoolean(str) {
  return ["true","false"].includes(str.toLowerCase());
}

function parseXML(param, typeList, serviceList) {
  // const xmlData = fs.readFileSync(param, 'utf-8');
  const xmlData = param;
  const parser = new XMLParser({ignoreAttributes: false,
                                attributeNamePrefix: ''});
  const jsObj = parser.parse(xmlData);
  // console.log(jsObj);

  let rtc_param = new RtcParam();
  const rtcObj = jsObj['rtc:RtcProfile'];

  const basicObj = rtcObj['rtc:BasicInfo'];
  rtc_param.name = jsonVal(basicObj, 'rtc:name');
  rtc_param.componentType = jsonVal(basicObj, 'rtc:componentType');
  rtc_param.activityType = jsonVal(basicObj, 'rtc:activityType');
  rtc_param.componentKind = jsonVal(basicObj, 'rtc:componentKind');
  rtc_param.rtcType = jsonVal(basicObj, 'rtc:rtcType');
  rtc_param.category = jsonVal(basicObj, 'rtc:category');
  rtc_param.description = jsonVal(basicObj, 'rtc:description');
  rtc_param.executionRate = Number(jsonVal(basicObj, 'rtc:executionRate'));
  rtc_param.executionType = jsonVal(basicObj, 'rtc:executionType');
  rtc_param.maxInstance = Number(jsonVal(basicObj, 'rtc:maxInstances'));
  rtc_param.vendor = jsonVal(basicObj, 'rtc:vendor');
  rtc_param.version = jsonVal(basicObj, 'rtc:version');
  rtc_param.abstractDesc = jsonVal(basicObj, 'rtc:abstract');
  rtc_param.hardwareProfile = jsonVal(basicObj, 'rtc:hardwareProfile');

  const basicDocObj = basicObj['rtcDoc:Doc'];
  if(basicDocObj) {
    rtc_param.doc_algorithm = jsonVal(basicDocObj, 'rtcDoc:algorithm');
    rtc_param.doc_description = jsonVal(basicDocObj, 'rtcDoc:description');
    rtc_param.doc_in_out = jsonVal(basicDocObj, 'rtcDoc:inout');
    rtc_param.doc_creator = jsonVal(basicDocObj, 'rtcDoc:creator');
    rtc_param.doc_license = jsonVal(basicDocObj, 'rtcDoc:license');
    rtc_param.doc_reference = jsonVal(basicDocObj, 'rtcDoc:reference');
  }
  // 
  const actionsObj = rtcObj['rtc:Actions'];
  parseActivityInfo(rtc_param, 'onInitialize', actionsObj, 'rtc:OnInitialize');
  parseActivityInfo(rtc_param, 'onFinalize', actionsObj, 'rtc:OnFinalize');
  parseActivityInfo(rtc_param, 'onStartup', actionsObj, 'rtc:OnStartup');
  parseActivityInfo(rtc_param, 'onShutdown', actionsObj, 'rtc:OnShutdown');
  parseActivityInfo(rtc_param, 'onActivated', actionsObj, 'rtc:OnActivated');
  parseActivityInfo(rtc_param, 'onDeactivated', actionsObj, 'rtc:OnDeactivated');
  parseActivityInfo(rtc_param, 'onAborting', actionsObj, 'rtc:OnAborting');
  parseActivityInfo(rtc_param, 'onError', actionsObj, 'rtc:OnError');
  parseActivityInfo(rtc_param, 'onReset', actionsObj, 'rtc:OnReset');
  parseActivityInfo(rtc_param, 'onExecute', actionsObj, 'rtc:OnExecute');
  parseActivityInfo(rtc_param, 'onStateUpdate', actionsObj, 'rtc:OnStateUpdate');
  parseActivityInfo(rtc_param, 'onRateChanged', actionsObj, 'rtc:OnRateChanged');
  //
  const dataPortsObj = rtcObj['rtc:DataPorts'];
  if(dataPortsObj) {
    if(isIterable(dataPortsObj)) {
      for(const dp of dataPortsObj) {
        parseDataPortInfo(rtc_param, dp, typeList);
      }
    } else {
        parseDataPortInfo(rtc_param, dataPortsOb, typeListj);
    }
  }
  //
  const servicePortsObj = rtcObj['rtc:ServicePorts'];
  if(servicePortsObj) {
    if(isIterable(servicePortsObj)) {
      for(const sp of servicePortsObj) {
        parseServicePortInfo(rtc_param, sp, serviceList);
      }
    } else {
        parseServicePortInfo(rtc_param, servicePortsObj, serviceList);
    }
  }
  //
  const configsObj = rtcObj['rtc:ConfigurationSet'];
  if(configsObj) {
    const configObj = configsObj['rtc:Configuration'];
    if(configObj) {
      if(isIterable(configObj)) {
        for(const config of configObj) {
          parseConfigurationInfo(rtc_param, config);
        }
      } else {
          parseConfigurationInfo(rtc_param, configObj);
      }
    }
  }
  //
  const langObj = rtcObj['rtc:Language'];
  if(langObj) {
    rtc_param.language = jsonVal(langObj, 'rtc:kind');
  }
  return rtc_param;
}

function parseConfigurationInfo(rtc_param, sourceObj) {
  let config = new ConfigSetParam();
  config.name = jsonVal(sourceObj, 'rtc:name');
  config.type = jsonVal(sourceObj, 'rtc:type');
  config.defaultValue = jsonVal(sourceObj, 'rtc:defaultValue');
  config.unit = jsonVal(sourceObj, 'rtc:unit');
  config.constraint = parseXmlConstraint(sourceObj['rtc:Constraint']);
  config.varname = jsonVal(sourceObj, 'rtcExt:variableName');
  rtc_param.configParams.push(config);

  const configDocObj = sourceObj['rtcDoc:Doc'];
  if(configDocObj) {
    config.doc_description = jsonVal(configDocObj, 'rtcDoc:description');
    config.doc_dataname = jsonVal(configDocObj, 'rtcDoc:dataname');
    config.doc_default = jsonVal(configDocObj, 'rtcDoc:defaultValue');
    config.doc_unit = jsonVal(configDocObj, 'rtcDoc:unit');
    config.doc_range = jsonVal(configDocObj, 'rtcDoc:range');
    config.doc_constraint = jsonVal(configDocObj, 'rtcDoc:constraint');
  }

  const proprtyObj = sourceObj['rtcExt:Properties'];
  if(proprtyObj) {
    if(isIterable(proprtyObj)) {
      for(const prop of proprtyObj) {
        let prop = new PropertyParam({
                      name: jsonVal(prop, 'rtcExt:name'),
                      value: jsonVal(prop, 'rtcExt:value')
                    });
        config.properties.push(prop);
      }
    } else {
      let prop = new PropertyParam({
                      name: jsonVal(proprtyObj, 'rtcExt:name'),
                      value: jsonVal(proprtyObj, 'rtcExt:value')
                    });
      config.properties.push(prop);
    }
  }
}

function parseXmlConstraint(sourceObj) {
  let result = [];

  const hashObj = sourceObj['rtc:ConstraintHashType'];
  if(hashObj) {
    result.push('{');

    for(const elem of hashObj['rtc:Constraint']) {
      const unitElem = elem['rtc:ConstraintUnitType'];
      const key = unitElem['rtc:key'];
      result.push(key);
      result.push(':');
      result.push(parseXmlConstraint(elem));
      result.push(',');
    }
    if(0<result.length) result.pop();

    result.push('}');
    return result.join(""); 
  }
  /////
  const listObj = sourceObj['rtc:ConstraintListType'];
  if(listObj) {
    for(const elem of listObj['rtc:Constraint']) {
      result.push(parseXmlConstraint(elem));
      result.push(',');
    }
    if(0<result.length) result.pop();
    return result.join(""); 
  }
  /////
	const unitObj = sourceObj['rtc:ConstraintUnitType'];
  if(!unitObj) throw new Error("Contents do not exist [Unit].");

  const equalObj = unitObj['rtc:propertyIsEqualTo'];
  if(equalObj) {
    const literalObj = equalObj['rtc:Literal'];
    if(!literalObj) throw new Error("Contents do not exist [EqualTo].");
    result.push(literalObj);
  }
  //
  const greaterEqObj = unitObj['rtc:propertyIsGreaterThanOrEqualTo'];
  if(greaterEqObj) {
    const literalObj = greaterEqObj['rtc:Literal'];
    if(!literalObj) throw new Error("Contents do not exist [GreaterThanOrEqualTo].");
    result.push('x>=' + literalObj);
  }
  //
  const lessEqObj = unitObj['rtc:propertyIsLessThanOrEqualTo'];
  if(lessEqObj) {
    const literalObj = lessEqObj['rtc:Literal'];
    if(!literalObj) throw new Error("Contents do not exist [LessThanOrEqualTo].");
    result.push('x<=' + literalObj);
  }
  //
  const greaterObj = unitObj['rtc:propertyIsGreaterThan'];
  if(greaterObj) {
    const literalObj = greaterObj['rtc:Literal'];
    if(!literalObj) throw new Error("Contents do not exist [GreaterThan].");
    result.push('x>' + literalObj);
  }
  //
  const lessObj = unitObj['rtc:propertyIsLessThan'];
  if(lessObj) {
    const literalObj = lessObj['rtc:Literal'];
    if(!literalObj) throw new Error("Contents do not exist [LessThan].");
    result.push('x<' + literalObj);
  }
  //
  const betweenObj = unitObj['rtc:propertyIsBetween'];
  if(betweenObj) {
    const lowerBoundaryObj = betweenObj['rtc:LowerBoundary'];
    if(!lowerBoundaryObj) throw new Error("Contents do not exist [Between(Lower)].");
    const upperBoundaryObj = betweenObj['rtc:UpperBoundary'];
    if(!upperBoundaryObj) throw new Error("Contents do not exist [Between(Upper)].");
    result.push(lowerBoundaryObj + '<=x<=' + upperBoundaryObj);
  }
  //
  const orObj = unitObj['rtc:Or'];
  if(orObj) {
    result.push('(');
    for(const elem of orObj['rtc:Constraint']) {
      result.push(parseXmlConstraint(elem));
      result.push(',');
    }
    if(0<result.length) result.pop();
    result.push(')');
  }
  //
  const andObj = unitObj['rtc:And'];
  if(andObj) {
    const elems = andObj['rtc:Constraint'];
    if(2 < elems.length)throw new Error("Wrong Constraint [And].");

    const former = elems[0]['rtc:ConstraintUnitType'];
    const latter = elems[1]['rtc:ConstraintUnitType'];

    if(former['rtc:propertyIsGreaterThan'] != undefined || former['rtc:propertyIsGreaterThanOrEqualTo'] != undefined) {
      if(former['rtc:propertyIsGreaterThan'] != undefined) {
        const formerObj = former['rtc:propertyIsGreaterThan'];
        const literalObj = formerObj['rtc:Literal'];
        result.push(literalObj + '<x');
      } else {
        const formerObj = former['rtc:propertyIsGreaterThanOrEqualTo'];
        const literalObj = formerObj['rtc:Literal'];
        result.push(literalObj + '<=x');
      }
      //
      if(latter['rtc:propertyIsLessThan'] != undefined) {
        const latterObj = latter['rtc:propertyIsLessThan'];
        const literalObj = latterObj['rtc:Literal'];
        result.push('<' + literalObj);
      } else if(latter['rtc:propertyIsLessThanOrEqualTo'] != undefined) {
        const latterObj = latter['rtc:propertyIsGreaterThanOrEqualTo'];
        const literalObj = latterObj['rtc:Literal'];
        result.push('<=' + literalObj);
      }

    } else if(latter['rtc:propertyIsGreaterThan'] != undefined || latter['rtc:propertyIsGreaterThanOrEqualTo'] != undefined) {
      if(latter['rtc:propertyIsGreaterThan'] != undefined) {
        const latterObj = latter['rtc:propertyIsGreaterThan'];
        const literalObj = latterObj['rtc:Literal'];
        result.push(literalObj + '<x');
      } else {
        const latterObj = latter['rtc:propertyIsGreaterThanOrEqualTo'];
        const literalObj = latterObj['rtc:Literal'];
        result.push(literalObj + '<=x');
      }
      //
      if(former['rtc:propertyIsLessThan'] != undefined) {
        const formerObj = former['rtc:propertyIsLessThan'];
        const literalObj = formerObj['rtc:Literal'];
        result.push('<' + literalObj);
      } else if(former['rtc:propertyIsLessThanOrEqualTo'] != undefined) {
        const formerObj = former['rtc:propertyIsGreaterThanOrEqualTo'];
        const literalObj = formerObj['rtc:Literal'];
        result.push('<=' + literalObj);
      }
    }
  }

  return result.join(""); 
}

function parseServicePortInfo(rtc_param, sourceObj, serviceList) {
  let sp = new ServicePortParam();
  sp.name = jsonVal(sourceObj, 'rtc:name');
  rtc_param.serviceports.push(sp);

  const servicePortDocObj = sourceObj['rtcDoc:Doc'];
  if(servicePortDocObj) {
    sp.doc_description = jsonVal(servicePortDocObj, 'rtcDoc:description');
    sp.doc_if_description = jsonVal(servicePortDocObj, 'rtcDoc:ifdescription');
  }

  const serviceIFObj = sourceObj['rtc:ServiceInterface'];
  if(serviceIFObj) {
    if(isIterable(serviceIFObj)) {
      for(const si of serviceIFObj) {
        parseServiceIFInfo(rtc_param, sp, si, serviceList);
      }
    } else {
        parseServiceIFInfo(rtc_param, sp, serviceIFObj, serviceList);
    }
  }
}

function parseServiceIFInfo(rtc_param, sPort, sourceObj, serviceList) {
  let si = new ServicePortInterfaceParam();
  si.name = jsonVal(sourceObj, 'rtc:name');
  si.interfacetype = jsonVal(sourceObj, 'rtc:type');
  si.direction = jsonVal(sourceObj, 'rtc:direction');
  si.instancename = jsonVal(sourceObj, 'rtc:instanceName');
  si.idlDispfile = jsonVal(sourceObj, 'rtc:idlFile');
  const targetIDL = serviceList.find(p => p.idlDispFile === si.idlDispfile);
  if(targetIDL) {
    si.idlfile = targetIDL.idlFile;
  }

  si.varname = jsonVal(sourceObj, 'rtcExt:variableName');
  sPort.serviceinterfaces.push(si);

  const serviceIFDocObj = sourceObj['rtcDoc:Doc'];
  if(serviceIFDocObj) {
    si.doc_description = jsonVal(serviceIFDocObj, 'rtcDoc:description');
    si.doc_argument = jsonVal(serviceIFDocObj, 'rtcDoc:docArgument');
    si.doc_return = jsonVal(serviceIFDocObj, 'rtcDoc:docReturn');
    si.doc_exception = jsonVal(serviceIFDocObj, 'rtcDoc:docException');
    si.doc_pre_condition = jsonVal(serviceIFDocObj, 'rtcDoc:docPreCondition');
    si.doc_post_condition = jsonVal(serviceIFDocObj, 'rtcDoc:docPostCondition');
  }
}

function parseDataPortInfo(rtc_param, sourceObj, typeList) {
  let dp = new DataPortParam();
  dp.name = jsonVal(sourceObj, 'rtc:name');
  dp.type = jsonVal(sourceObj, 'rtc:type');
  dp.dispIdlFile = jsonVal(sourceObj, 'rtc:idlFile');
  const targetIDL = typeList.find(p => p.dispPath === dp.dispIdlFile);
  if(targetIDL) {
    dp.idlFile = targetIDL.fullPath;
  }

  dp.interfaceType = jsonVal(sourceObj, 'rtc:interfaceType');
  dp.dataFlowType = jsonVal(sourceObj, 'rtc:dataflowType');
  dp.subscriptionType = jsonVal(sourceObj, 'rtc:subscriptionType');
  dp.unit = jsonVal(sourceObj, 'rtc:unit');
  dp.varname = jsonVal(sourceObj, 'rtcExt:variableName');
  if(jsonVal(sourceObj, 'rtc:portType') == 'DataInPort') {
    rtc_param.inports.push(dp);
  } else if(jsonVal(sourceObj, 'rtc:portType') == 'DataOutPort') {
    rtc_param.outports.push(dp);
  }

  const dataPortDocObj = sourceObj['rtcDoc:Doc'];
  if(dataPortDocObj) {
    dp.doc_description = jsonVal(dataPortDocObj, 'rtcDoc:description');
    dp.doc_type = jsonVal(dataPortDocObj, 'rtcDoc:type');
    dp.doc_num = jsonVal(dataPortDocObj, 'rtcDoc:number');
    dp.doc_semantics = jsonVal(dataPortDocObj, 'rtcDoc:semantics');
    dp.doc_unit = jsonVal(dataPortDocObj, 'rtcDoc:unit');
    dp.doc_occerrence = jsonVal(dataPortDocObj, 'rtcDoc:occerrence');
    dp.doc_operation = jsonVal(dataPortDocObj, 'rtcDoc:operation');
  }
}

function parseActivityInfo(rtc_param, key, actionsObj, obj_key) {
  const actionObj = actionsObj[obj_key];
  if(actionObj) {
    rtc_param.actions[key].implemented = (jsonVal(actionObj, 'rtc:implemented').toLowerCase() === 'true');
    const actionDocObj = actionObj['rtcDoc:Doc'];
    if(actionDocObj) {
      rtc_param.actions[key].overview = jsonVal(actionDocObj, 'rtcDoc:description');
      rtc_param.actions[key].pre_condition = jsonVal(actionDocObj, 'rtcDoc:preCondition');
      rtc_param.actions[key].post_condition = jsonVal(actionDocObj, 'rtcDoc:postCondition');
    }
  }
}

function jsonVal(source, key) {
  return source[key] ?? "";
}

function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === 'function';
}

function formatDateWithTimezoneOffset(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());
    const millisecond = String(date.getMilliseconds()).padStart(3, '0');

    const offsetMinutes = date.getTimezoneOffset(); // 例: -540 (日本)
    const sign = offsetMinutes > 0 ? "-" : "+";
    const absOffset = Math.abs(offsetMinutes);
    const offsetHour = pad(Math.floor(absOffset / 60));
    const offsetMin = pad(absOffset % 60);

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${sign}${offsetHour}:${offsetMin}`;
}

module.exports = {
  createXML,
  parseXML,
  validateXML
};
