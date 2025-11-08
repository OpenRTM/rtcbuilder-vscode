const path = require('path');
const { GeneratedResult } = require("../dataModels");
const { getInterfaceBasename } = require('./templateHelperProcessing')

function generateProcessing(env, param) {
  let result = [];

  result.push(generateMainSource(env, param ));
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
  result.push(generateTestMainSource(env, param ));
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
function generateMainSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'Processing_Main.pde.njk');
  let outfile = path.join(rtcParam.name + 'Main', rtcParam.name + 'Main.pde');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateCompSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'Processing_Comp.pde.njk');
  let outfile = path.join(rtcParam.name + 'Main',  rtcParam.name + 'Comp.pde');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateRTCSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'Processing_RTC.pde.njk');
  let outfile = path.join(rtcParam.name + 'Main',  rtcParam.name + '.pde');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateRTCImplSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'Processing_RTC_Impl.pde.njk');
  let outfile = path.join(rtcParam.name + 'Main',  rtcParam.name + 'Impl.pde');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateSVCSource(env, param) {
  const rtcParam = param['rtcParam'];
  const svc = param['serviceClassParam'];

  let infile = path.join('templates', 'processing', 'Processing_SVC.pde.njk');
  let outfile = path.join(rtcParam.name + 'Main', getInterfaceBasename(svc.name) + 'SVC_impl.pde');
  return generateCode(env, param, infile, outfile, true, true);
}

//
function generateClassPath(env, param) {
  let infile = path.join('templates', 'processing', 'classpath.njk');
  let outfile = '.classpath';
  return generateCode(env, param, infile, outfile);
}

function generateRunBat(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'run.bat.njk');
  let outfile = rtcParam.name + '.bat';
  return generateCode(env, param, infile, outfile, false, true);
}

function generateRunSh(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'run.sh.njk');
  let outfile = rtcParam.name + '.sh';
  const result = generateCode(env, param, infile, outfile);
  result.code = result.code.replace(/\r\n/g, '\n');
  result.isNotBom = true;
  return result;
}

function generateRunXML(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'runRTC.xml.njk');
  let outfile = 'run_' + rtcParam.name + '.xml';
  const result = generateCode(env, param, infile, outfile);
  result.isNotBom = true;
  return result;
}

function generateBuildXML(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'build.xml.njk');
  let outfile = 'build_' + rtcParam.name + '.xml';
  const result = generateCode(env, param, infile, outfile);
  return result;
}
///
function generateTestMainSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'test', 'Processing_Test_Main.pde.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'TestMain', rtcParam.name + 'TestMain.pde');
  let result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestCompSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'test', 'Processing_Test_Comp.pde.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'TestMain', rtcParam.name + 'TestComp.pde');
  const result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestRTCSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'test', 'Processing_Test_RTC.pde.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'TestMain', rtcParam.name + 'Test.pde');
  const result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestRTCImplSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'processing', 'test', 'processing_Test_RTC_Impl.pde.njk');
  let outfile = path.join('test', 'src', rtcParam.name + 'TestMain', rtcParam.name + 'TestImpl.pde');
  const result = generateCode(env, param, infile, outfile);
  result.canMerge = true;
  result.isNotBom = true;
  return result;
}

function generateTestSVCSource(env, param) {
  const rtcParam = param['rtcParam'];
  const svc = param['serviceClassParam'];

  let infile = path.join('templates', 'processing', 'Processing_SVC.pde.njk');
  let outfile = path.join('test', 'src',  rtcParam.name + 'TestMain',getInterfaceBasename(svc.name) + 'SVC_impl.pde');
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

module.exports = {
  generateProcessing
};
