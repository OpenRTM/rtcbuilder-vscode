const path = require('path');
const { GeneratedResult } = require("../dataModels");
const { getInterfaceBasename } = require('./templateHelperJava')

function generateJava(env, param) {
  let result = [];

  result.push(generateCompSource(env, param ));
  result.push(generateRTCSource(env, param ));
  result.push(generateRTCImplSource(env, param ));

  result.push(generateClassPath(env, param ));
  result.push(generateRunBat(env, param ));
  result.push(generateRunSh(env, param ));
  result.push(generateRunXML(env, param ));

  result.push(generateBuildXML(env, param ));

  const rtcParam = param['rtcParam'];
  for(const idl of rtcParam.providerIdlPathes) {
    param['idlFileParam'] = idl;
    for(const svc of idl.serviceClass) {
      param['serviceClassParam'] = svc;
      result.push(generateSVCSource(env, param ));

    }
  }
  /////
  result.push(generateTestCompSource(env, param ));
  result.push(generateTestRTCSource(env, param ));
  result.push(generateTestRTCImplSource(env, param ));
  for (const  idl of rtcParam.consumerIdlPathes) {
    if(idl.isDataPort) continue;
    param['idlFileParam'] = idl;
    for (const svc of idl.testServiceClass) {
      param['serviceClassParam'] = svc;
      result.push(generateTestSVCSource(env, param ));
    }
  }

  return result;
}
//////
function generateCompSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'Java_Comp.java.njk');
  let outfile = path.join('src',  rtcParam.name + 'Comp.java');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateRTCSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'Java_RTC.java.njk');
  let outfile = path.join('src',  rtcParam.name + '.java');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateRTCImplSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'Java_RTC_Impl.java.njk');
  let outfile = path.join('src',  rtcParam.name + 'Impl.java');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateSVCSource(env, param) {
  const svc = param['serviceClassParam'];

  let infile = path.join('templates', 'java', 'Java_SVC.java.njk');
  let outfile = path.join('src',  getInterfaceBasename(svc.name) + 'SVC_impl.java');
  return generateCode(env, param, infile, outfile, true, true);
}

//
function generateClassPath(env, param) {
  let infile = path.join('templates', 'java', 'classpath.njk');
  let outfile = '.classpath';
  return generateCode(env, param, infile, outfile);
}

function generateRunBat(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'run.bat.njk');
  let outfile = rtcParam.name + '.bat';
  return generateCode(env, param, infile, outfile, false, true);
}

function generateRunSh(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'run.sh.njk');
  let outfile = rtcParam.name + '.sh';
  const result = generateCode(env, param, infile, outfile);
  result.code = result.code.replace(/\r\n/g, '\n');
  result.isNotBom = true;
  return result;
}

function generateRunXML(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'runRTC.xml.njk');
  let outfile = 'run_' + rtcParam.name + '.xml';
  const result = generateCode(env, param, infile, outfile);
  result.isNotBom = true;
  return result;
}

function generateBuildXML(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'build.xml.njk');
  let outfile = 'build_' + rtcParam.name + '.xml';
  const result = generateCode(env, param, infile, outfile);
  return result;
}
///
function generateTestCompSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'test', 'Java_Test_Comp.java.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'TestComp.java');
  const result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestRTCSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'test', 'Java_Test_RTC.java.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'Test.java');
  const result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestRTCImplSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'java', 'test', 'Java_Test_RTC_Impl.java.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'TestImpl.java');
  const result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestSVCSource(env, param) {
  const svc = param['serviceClassParam'];

  let infile = path.join('templates', 'java', 'Java_SVC.java.njk');
  let outfile = path.join('test', 'src',  getInterfaceBasename(svc.name) + 'SVC_impl.java');
  return generateCode(env, param, infile, outfile, true, true);
}
/////
function generateCode(env, param, infile, outfile, canMerge=false, isNotBom=false, encode='utf-8') {
  const code = env.render(infile, param);

  let result = new GeneratedResult();
  result.name = outfile;
  result.code = code;
  result.isNotBom = isNotBom;
  result.canMerge = canMerge;
  result.encode = encode;

  return result;
}

function getBasename(fullName) {
    const split = fullName.split("::");
    return split[split.length - 1];
}

module.exports = {
  generateJava
};
