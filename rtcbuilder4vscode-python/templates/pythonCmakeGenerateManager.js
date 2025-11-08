const path = require('path');
const { GeneratedResult } = require("../dataModels");

const { checkDefault } = require("./templateHelperPy");

function generateCMake(env, param) {
  let result = [];

  result.push(generateCMakeLists(env, param));
  result.push(generateCmakeCPackOption(env, param));
  result.push(generateIdlCMakeLists(env, param));
  result.push(generateTestCMakeLists(env, param));

  result.push(generateDocCMakeLists(env, param));
  result.push(generateDocConfPy(env, param));
  result.push(generateDoxyfile(env, param));

  const rtcParam = param['rtcParam'];
  let isExist = false;
  for(const target of rtcParam.providerIdlPathes) {
    if(checkDefault(target.idlPath, rtcParam)) continue;
    isExist = true;
    break;
  }
  if(isExist == false) {
    for(const target of rtcParam.consumerIdlPathes) {
      if(checkDefault(target.idlPath, rtcParam)) continue;
      isExist = true;
      break;
    }
  }
  if(isExist) {
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
  return generateCode(env, param, infile, outfile, true);
}

function generateCmakeCPackOption(env, param) {
  let infile = path.join('templates', 'cmake', 'cpack_options_cmake.in.njk');
  let outfile = path.join('cmake', 'cpack_options.cmake.in');
  return generateCode(env, param, infile, outfile, true);
}

function generateIdlCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'idl', 'IdlCMakeLists.txt.njk');
  let outfile = path.join('idl', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'test', 'CMakeLists.txt.njk');
  let outfile = path.join('test', 'CMakeLists.txt');
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

function generateDocCMakeLists(env, param) {
  let infile = path.join('templates', 'cmake', 'doc', 'DocCMakeLists.txt.njk');
  let outfile = path.join('doc', 'CMakeLists.txt');
  return generateCode(env, param, infile, outfile, true);
}

function generateDocConfPy(env, param) {
  let infile = path.join('templates','cmake', 'doc', 'conf.py.in.njk');
  let outfile = path.join('doc', 'conf.py.in');
  return generateCode(env, param, infile, outfile);
}

function generateDoxyfile(env, param) {
  let infile = path.join('templates','cmake', 'doc', 'Doxyfile.in.njk');
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
