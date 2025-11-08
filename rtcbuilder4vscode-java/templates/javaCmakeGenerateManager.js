const path = require('path');
const { GeneratedResult } = require("../dataModels");

function generateCMake(env, param) {
  let result = [];

  result.push(generateCMakeLists(env, param));
  result.push(generateIdlCMakeLists(env, param));
  result.push(generateCmakeCPackOption(env, param));
  result.push(generateModulesJavaCompile(env, param));

  result.push(generateTestCMakeLists(env, param));
  result.push(generateTestSrcCMakeLists(env, param));

  return result;
}
/////
function generateCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'CMakeLists.txt.njk');
  let outfile = 'CMakeLists.txt';
  return generateCode(env, param, infile, outfile);
}

function generateIdlCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'idl', 'IdlCMakeLists.txt.njk');
  let outfile = path.join('idl', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateCmakeCPackOption(env, param) {
  let infile = path.join('templates', 'cmake', 'cpack_options_cmake.in.njk');
  let outfile = path.join('cmake', 'cpack_options.cmake.in');
  return generateCode(env, param, infile, outfile, true);
}

function generateModulesJavaCompile(env, param) {
  let infile = path.join('templates', 'cmake', 'cmake_javacompile.cmake.in.njk');
  let outfile = path.join('cmake_modules', 'cmake_javacompile.cmake.in');
  return generateCode(env, param, infile, outfile);
}

function generateTestCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'test', 'CMakeLists.txt.njk');
  let outfile = path.join('test', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestSrcCMakeLists(env, param) {
  let infile = path.join('templates','cmake', 'test', 'SrcCMakeLists.txt.njk');
  let outfile = path.join('test', 'src', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
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
