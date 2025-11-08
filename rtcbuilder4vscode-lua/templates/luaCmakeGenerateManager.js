const path = require('path');
const { GeneratedResult } = require("../dataModels");

function generateCMake(env, param) {
  let result = [];

  result.push(generateCMakeLists(env, param));
  result.push(generateCmakeCPackOption(env, param));
  result.push(generateIdlCMakeLists(env, param));

  const rtcParam = param['rtcParam'];
  if(rtcParam.serviceports.length>0) {
    result.push(generatePostinstIin(env, param));
    result.push(generatePrermIn(env, param));
    result.push(generateCMakeWixPatchXmlIn(env, param));
  }

  return result;
}
/////
function generateCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'CMakeLists.txt.njk');
  let outfile = 'CMakeLists.txt';
  return generateCode(env, param, infile, outfile);
}

function generateCmakeCPackOption(env, param) {
  let infile = path.join('templates', 'cmake', 'cpack_options_cmake.in.njk');
  let outfile = path.join('cmake', 'cpack_options.cmake.in');
  return generateCode(env, param, infile, outfile);
}

function generateIdlCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'IdlCMakeLists.txt.njk');
  let outfile = path.join('idl', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generatePostinstIin(env, param) {
  let infile = path.join('templates', 'cmake', 'postinst.in.njk');
  let outfile = 'postinst.in';
  return generateCode(env, param, infile, outfile);
}

function generatePrermIn(env, param) {
  let infile = path.join('templates', 'cmake', 'prerm.in.njk');
  let outfile = 'prerm.in';
  return generateCode(env, param, infile, outfile);
}

function generateCMakeWixPatchXmlIn(env, param) {
  let infile = path.join('templates', 'cmake', 'wix_patch.xml.in.njk');
  let outfile = path.join('cmake', 'wix_patch.xml.in');
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
  generateCMake
};
