const path = require('path');
const { GeneratedResult } = require("./../model/dataModels");

function generateCxx(env, param) {
  let result = [];

  result.push(generateCompSource(env, param));
  result.push(generateRTCHeader(env, param ));
  result.push(generateRTCSource(env, param ));

  result.push(generateScript1604(env, param ));
  result.push(generateScript1804(env, param ));
  result.push(generateAppVeyorTemplate(env, param ));

  const rtcParam = param['rtcParam'];
  for(const idl of rtcParam.providerIdlPathes) {
    param['idlFileParam'] = idl;
    result.push(generateSVCHeader(env, param));
    result.push(generateSVCSource(env, param));
  }

  result.push(generateTestCompSource(env, param ));
  result.push(generateTestHeader(env, param ));
  result.push(generateTestSource(env, param ));

  for(const idl of rtcParam.consumerIdlPathes) {
    if(idl.isDataPort) continue;
    param['idlFileParam'] = idl;
    result.push(generateTestSVCHeader(env, param));
    result.push(generateTestSVCSource(env, param));
  }

  return result;
}
//////
function generateCompSource(env, param) {
  let infile = path.join('cpp', 'CXX_Comp.cpp.njk');
  let outfile = path.join('src', param.rtcParam.name + 'Comp.cpp');
  return generateCode(env, param, infile, outfile, true);
}

function generateRTCHeader(env, param) {
  let infile = path.join('cpp', 'CXX_RTC.h.njk');
  let outfile = path.join('include', param.rtcParam.name, param.rtcParam.name + '.h');
  return generateCode(env, param, infile, outfile, true);
}

function generateRTCSource(env, param) {
  let infile = path.join('cpp', 'CXX_RTC.cpp.njk');
  let outfile = path.join('src', param.rtcParam.name + '.cpp');
  return generateCode(env, param, infile, outfile, true);
}

function generateSVCHeader(env, param) {
  const rtcParam = param['rtcParam'];
	const idlParam = param['idlFileParam'];

  let infile = path.join('cpp', 'CXX_SVC.h.njk');
  let outfile = path.join('include',
                           param.rtcParam.name,
                           getBasename(idlParam.getIdlFileNoExt()) + 'SVC_impl.h');
  return generateCode(env, param, infile, outfile);
}

function generateSVCSource(env, param) {
  const rtcParam = param['rtcParam'];
	const idlParam = param['idlFileParam'];

  let infile = path.join('cpp', 'CXX_SVC.cpp.njk');
  let outfile = path.join('src',
                           getBasename(idlParam.getIdlFileNoExt()) + 'SVC_impl.cpp');
  return generateCode(env, param, infile, outfile);
}

function generateScript1604(env, param) {
  let infile = path.join('cpp', 'scripts', 'Dockerfile_ubuntu_1604.njk');
  let outfile = path.join('scripts', 'ubuntu_1604', 'Dockerfile');
  return generateCode(env, param, infile, outfile);
}

function generateScript1804(env, param) {
  let infile = path.join('cpp', 'scripts', 'Dockerfile_ubuntu_1804.njk');
  let outfile = path.join('scripts', 'ubuntu_1804', 'Dockerfile');
  return generateCode(env, param, infile, outfile);
}

function generateAppVeyorTemplate(env, param) {
  let infile = path.join('cpp', 'appveyor.njk');
  let outfile = '.appveyor.yml';
  return generateCode(env, param, infile, outfile);
}

function generateTestCompSource(env, param) {
  let infile = path.join('cpp', 'test', 'CXX_Test_Comp.cpp.njk');
  let outfile = path.join('test', 'src', param.rtcParam.name + 'TestComp.cpp');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestHeader(env, param) {
  let infile = path.join('cpp', 'test', 'CXX_Test_RTC.h.njk');
  let outfile = path.join('test', 'include', param.rtcParam.name + 'Test', param.rtcParam.name + 'Test.h');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestSource(env, param) {
  let infile = path.join('cpp', 'test', 'CXX_Test_RTC.cpp.njk');
  let outfile = path.join('test', 'src', param.rtcParam.name + 'Test.cpp');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestSVCHeader(env, param) {
  const rtcParam = param['rtcParam'];
	const idlParam = param['idlFileParam'];

  let infile = path.join('cpp', 'test', 'CXX_Test_SVC.h.njk');
  let outfile = path.join('test',
                          'include',
                           param.rtcParam.name + 'Test',
                           getBasename(idlParam.getIdlFileNoExt()) + 'SVC_impl.h');
  return generateCode(env, param, infile, outfile);
}

function generateTestSVCSource(env, param) {
  const rtcParam = param['rtcParam'];
	const idlParam = param['idlFileParam'];

  let infile = path.join('cpp', 'test', 'CXX_Test_SVC.cpp.njk');
  let outfile = path.join('test',
                          'src',
                           getBasename(idlParam.getIdlFileNoExt()) + 'SVC_impl.cpp');
  return generateCode(env, param, infile, outfile);
}
/////
function generateCode(env, param, infile, outfile, canMerge=false, isNotBom=false) {
  const code = env.render(infile, param);

  let result = new GeneratedResult();
  result.name = outfile;
  result.code = code;
  result.isNotBom = isNotBom;
  result.canMerge = canMerge;

  return result;
}

function getBasename(fullName) {
    const split = fullName.split("::");
    return split[split.length - 1];
}

module.exports = {
  generateCxx
};
