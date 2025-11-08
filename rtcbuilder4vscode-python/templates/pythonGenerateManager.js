const path = require('path');
const { GeneratedResult } = require("../dataModels");

function generatePython(env, param) {
  let result = [];

  result.push(generatePythonSource(env, param ));
  result.push(generateTestSource(env, param ));

  result.push(generateScript1604(env, param ));
  result.push(generateScript1804(env, param ));
  result.push(generateAppVeyorTemplate(env, param ));

  const allIdlFileParams = param['allIdlFileParam'];
  if( 0 < allIdlFileParams.length) {
    result.push(generateIDLCompileBat(env, param ));
    result.push(generateIDLCompileSh(env, param ));
    result.push(generateDeleteBat(env, param ));
  }

  const rtcParam = param['rtcParam'];
  for(const idl of rtcParam.providerIdlPathes) {
    param['idlFileParam'] = idl;
    result.push(generateSVCIDLExampleSource(env, param));
  }

  for(const idl of rtcParam.consumerIdlPathes) {
    if(idl.isDataPort) continue;
    param['idlFileParam'] = idl;
    result.push(generateTestSVCIDLExampleSource(env, param));
  }

  return result;
}
//////
function generatePythonSource(env, param) {
  let infile = path.join('templates', 'python', 'Py_RTC.py.njk');
  let outfile = param.rtcParam.name + '.py';
  return generateCode(env, param, infile, outfile);
}

function generateSVCIDLExampleSource(env, param) {
	const idlParam = param['idlFileParam'];

  let infile = path.join('templates', 'python', 'Py_SVC_idl_example.py.njk');
  let outfile = getBasename(idlParam.getIdlFileNoExt()) + '_idl_example.py';
  return generateCode(env, param, infile, outfile);
}
///
function generateScript1604(env, param) {
  let infile = path.join('templates', 'python', 'scripts', 'Dockerfile_ubuntu_1604.njk');
  let outfile = path.join('scripts', 'ubuntu_1604', 'Dockerfile');
  return generateCode(env, param, infile, outfile);
}

function generateScript1804(env, param) {
  let infile = path.join('templates', 'python', 'scripts', 'Dockerfile_ubuntu_1804.njk');
  let outfile = path.join('scripts', 'ubuntu_1804', 'Dockerfile');
  return generateCode(env, param, infile, outfile);
}

function generateAppVeyorTemplate(env, param) {
  let infile = path.join('templates', 'python', 'appveyor.njk');
  let outfile = '.appveyor.yml';
  return generateCode(env, param, infile, outfile);
}

function generateTestSource(env, param) {
  let infile = path.join('templates', 'python', 'test', 'Py_Test_RTC.py.njk');
  let outfile = path.join('test', param.rtcParam.name + 'Test.py');
  return generateCode(env, param, infile, outfile, true);
}

function generateTestSVCIDLExampleSource(env, param) {
	const idlParam = param['idlFileParam'];
  idlParam.serviceClass.length = 0;
  idlParam.serviceClass.push(...idlParam.testServiceClass);

  let infile = path.join('templates', 'python', 'Py_SVC_idl_example.py.njk');
  let outfile = path.join('test', getBasename(idlParam.getIdlFileNoExt()) + '_idl_example.py');
  return generateCode(env, param, infile, outfile, true);
}

function generateIDLCompileBat(env, param) {
  let infile = path.join('templates', 'python', 'idlcompile.bat.njk');
  let outfile = 'idlcompile.bat';
  const result = generateCode(env, param, infile, outfile);
  result.isNotBom = true;
  result.encode = 'Shift_JIS';
  return result;
}

function generateIDLCompileSh(env, param) {
  let infile = path.join('templates', 'python', 'idlcompile.sh.njk');
  let outfile = 'idlcompile.sh';
  const result = generateCode(env, param, infile, outfile);
  result.code = result.code.replace(/\r\n/g, '\n');
  result.isNotBom = true;
  result.encode = 'EUC_JP';
  return result;
}

function generateDeleteBat(env, param) {
  let infile = path.join('templates', 'python', 'delete.bat.njk');
  let outfile = 'delete.bat';
  const result = generateCode(env, param, infile, outfile);
  result.isNotBom = true;
  result.encode = 'Shift_JIS';
  return result;
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
  generatePython
};
