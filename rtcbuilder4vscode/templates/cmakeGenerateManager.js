const path = require('path');
const { GeneratedResult } = require("./../model/dataModels");

function generateCMake(env, param) {
  let result = [];

  result.push(generateCMakeLists(env, param));
  result.push(generateCmakeCPackOption(env, param));

  result.push(generateIdlCMakeLists(env, param));

  result.push(generateIncludeCMakeLists(env, param));
  result.push(generateIncModuleCMakeLists(env, param));

  result.push(generateSrcCMakeLists(env, param));

  result.push(generateTestCMakeLists(env, param));
  result.push(generateTestIncludeCMakeLists(env, param));
  result.push(generateTestIncModuleCMakeLists(env, param));
  result.push(generateTestSrcCMakeLists(env, param));

  result.push(generateDocCMakeLists(env, param));
  result.push(generateDocConfPy(env, param));
  result.push(generateDoxyfile(env, param));

  return result;
}
/////

function generateCMakeLists(env, param) {
  let infile = path.join('cmake', 'CMakeLists.txt.njk');
  let outfile = 'CMakeLists.txt';
  return generateCode(env, param, infile, outfile, true);
}

function generateCmakeCPackOption(env, param) {
  let infile = path.join('cmake', 'cmake', 'cpack_options_cmake.in.njk');
  let outfile = path.join('cmake', 'cpack_options.cmake.in');
  return generateCode(env, param, infile, outfile, true);
}


function generateIdlCMakeLists(env, param) {
  let infile = path.join('cmake', 'idl', 'IdlCMakeLists.txt.njk');
  let outfile = path.join('idl', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateIncludeCMakeLists(env, param) {
  let infile = path.join('cmake', 'include', 'IncludeCMakeLists.txt.njk');
  let outfile = path.join('include', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateIncModuleCMakeLists(env, param) {
  let infile = path.join('cmake', 'include', 'IncModuleCMakeLists.txt.njk');
  let outfile = path.join('include', param.rtcParam.name, 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateSrcCMakeLists(env, param) {
  let infile = path.join('cmake', 'src', 'SrcCMakeLists.txt.njk');
  let outfile = path.join('src', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestCMakeLists(env, param) {
  let infile = path.join('cmake', 'test', 'CMakeLists.txt.njk');
  let outfile = path.join('test', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestIncludeCMakeLists(env, param) {
  let infile = path.join('cmake', 'test', 'include', 'IncludeCMakeLists.txt.njk');
  let outfile = path.join('test', 'include', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestIncModuleCMakeLists(env, param) {
  let infile = path.join('cmake', 'test', 'include', 'IncModuleCMakeLists.txt.njk');
  let outfile = path.join('test', 'include', param.rtcParam.name + 'Test', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestSrcCMakeLists(env, param) {
  let infile = path.join('cmake', 'test', 'src', 'SrcCMakeLists.txt.njk');
  let outfile = path.join('test', 'src', 'CMakeLists.txt');
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
  generateCMake
};
