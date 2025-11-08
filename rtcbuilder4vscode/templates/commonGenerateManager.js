const path = require('path');
const { GeneratedResult } = require("./../model/dataModels");

function generateCommon(env, param) {
  let result = [];

  result.push(generateREADME(env, param));
  result.push(generateRTCConf(env, param));
  result.push(generateComponentConf(env, param));
  /////
  result.push(generateCOPYING(env, param));
  result.push(generateCOPYING_LESSER(env, param));

  result.push(generateCmakeCMakeLists(env, param));
  result.push(generateResourceLicenseRTF(env, param));
  result.push(generateCmakeConfigVersion(env, param));
  result.push(generateCmakeConfig(env, param));
  result.push(generateCmakePcIn(env, param));
  result.push(generateModulesUninstall(env, param));
  result.push(generateUtilIn(env, param));

  return result;
}
//////
function generateREADME(env, param) {
  let infile = path.join('common', 'README.njk');
  let outfile = 'README.md';
  return generateCode(env, param, infile, outfile);
}

function generateRTCConf(env, param) {
  let infile = path.join('common', 'rtc.conf.njk');
  let outfile = 'rtc.conf';
  return generateCode(env, param, infile, outfile, true);
}

function generateComponentConf(env, param) {
  let infile = path.join('common', 'Component.conf.njk');
  let outfile = param.rtcParam.name + '.conf';
  return generateCode(env, param, infile, outfile, true);
}
//
function generateCOPYING(env, param) {
  let infile = path.join('cmake', 'COPYING.njk');
  let outfile = 'COPYING';
  return generateCode(env, param, infile, outfile);
}

function generateCOPYING_LESSER(env, param) {
  let infile = path.join('cmake', 'COPYING.LESSER.njk');
  let outfile = 'COPYING.LESSER';
  return generateCode(env, param, infile, outfile);
}

function generateCmakeCMakeLists(env, param) {
  let infile = path.join('cmake', 'cmake', 'CMakeCMakeLists.txt.njk');
  let outfile = path.join('cmake', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateResourceLicenseRTF(env, param) {
  let infile = path.join('cmake', 'cmake', 'License.rtf.njk');
  let outfile = path.join('cmake', 'License.rtf');
  return generateCode(env, param, infile, outfile);
}

function generateCmakeConfigVersion(env, param) {
  let infile = path.join('cmake', 'cmake', 'config_version.cmake.in.njk');
  let outfile = path.join('cmake', param.rtcParam.name.toLowerCase() + '-config-version.cmake.in');
  return generateCode(env, param, infile, outfile, true);
}

function generateCmakeConfig(env, param) {
  let infile = path.join('cmake', 'cmake', 'config.cmake.in.njk');
  let outfile = path.join('cmake', param.rtcParam.name.toLowerCase() + '-config.cmake.in');
  return generateCode(env, param, infile, outfile, true);
}

function generateCmakePcIn(env, param) {
  let infile = path.join('cmake', 'cmake', 'pc.in.njk');
  let outfile = path.join('cmake', param.rtcParam.name.toLowerCase() + '.pc.in');
  return generateCode(env, param, infile, outfile);
}

function generateModulesUninstall(env, param) {
  let infile = path.join('cmake', 'cmake', 'cmake_uninstall.cmake.in.njk');
  let outfile = path.join('cmake', 'uninstall_target.cmake.in');
  return generateCode(env, param, infile, outfile, true);
}

function generateUtilIn(env, param) {
  let infile = path.join('cmake', 'cmake', 'utils.in.njk');
  let outfile = path.join('cmake', 'utils.cmake');
  return generateCode(env, param, infile, outfile, true);
}

function generateDocCMakeLists(env, param) {
  let infile = path.join('cmake', 'doc', 'DocCMakeLists.txt.njk');
  let outfile = path.join('doc', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateDocConfPy(env, param) {
  let infile = path.join('cmake', 'doc', 'conf.py.in.njk');
  let outfile = path.join('doc', 'conf.py.in');
  return generateCode(env, param, infile, outfile);
}

function generateDoxyfile(env, param) {
  let infile = path.join('cmake', 'doc', 'Doxyfile.in.njk');
  let outfile = path.join('doc', 'doxyfile.in');
  return generateCode(env, param, infile, outfile);
}
/////
function generateCode(env, param, infile, outfile, isNotBom=false) {
  const code = env.render(infile, param);

  let result = new GeneratedResult();
  result.name = outfile;
  result.code = code;
  result.isNotBom = isNotBom;

  return result;
}

module.exports = {
  generateCommon
};
