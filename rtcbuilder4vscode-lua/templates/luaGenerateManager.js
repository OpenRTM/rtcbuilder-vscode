const path = require('path');
const { GeneratedResult } = require("../dataModels");
const { getIdlFileNoExt,
        checkDefault } = require("./templateHelperLua");

function generateLua(env, param) {
  let result = [];

  result.push(generateLuaSource(env, param));
  result.push(generateMoonSource(env, param));
  result.push(generateLnsSource(env, param));

  result.push(generateRocksFile(env, param));

  const rtcParam = param['rtcParam'];
  for(const idl of rtcParam.providerIdlPathes) {
		param['idlFileParam'] = idl;
    result.push(generateSVCIDLExampleSource(env, param));
    result.push(generateMoonSVCIDLExampleSource(env, param));
    result.push(generateLnsSVCIDLExampleSource(env, param));
  }
  ////////
  result.push(generateLuaTestSource(env, param));
  for(const idl of rtcParam.consumerIdlPathes) {
    if(idl.isDataPort) continue;
    if(checkDefault(idl.idlPath, rtcParam)) continue;
		param['idlFileParam'] = idl;
    result.push(generateTestSVCIDLExampleSource(env, param));
  }

    return result;
}
//////
function generateLuaSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'lua', 'Lua_RTC.lua.njk');
  let outfile = rtcParam.name + '.lua';
  return generateCode(env, param, infile, outfile, true, true);
}

function generateMoonSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'lua', 'Moon_RTC.moon.njk');
  let outfile = rtcParam.name + '.moon';
  return generateCode(env, param, infile, outfile, true, true);
}

function generateLnsSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'lua', 'Lns_RTC.lns.njk');
  let outfile = rtcParam.name + '.lns';
  return generateCode(env, param, infile, outfile, true, true);
}

function generateSVCIDLExampleSource(env, param) {
	const idlParam = param['idlFileParam'];

  let infile = path.join('templates', 'lua', 'Lua_SVC_idl_example.lua.njk');
  let outfile = getIdlFileNoExt(idlParam.idlPath) + '_idl_example.lua';
  return generateCode(env, param, infile, outfile, false, true);
}

function generateMoonSVCIDLExampleSource(env, param) {
	const idlParam = param['idlFileParam'];

  let infile = path.join('templates', 'lua', 'Moon_SVC_idl_example.moon.njk');
  let outfile = getIdlFileNoExt(idlParam.idlPath) + '_idl_example.moon';
  return generateCode(env, param, infile, outfile, false, true);
}

function generateLnsSVCIDLExampleSource(env, param) {
	const idlParam = param['idlFileParam'];

  let infile = path.join('templates', 'lua', 'Lns_SVC_idl_example.lns.njk');
  let outfile = getIdlFileNoExt(idlParam.idlPath) + '_idl_example.lns';
  return generateCode(env, param, infile, outfile, false, true);
}

function generateRocksFile(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'lua', 'Lua_RTC.rockspec.njk');
  let outfile = rtcParam.name.toLowerCase() + '-' + rtcParam.version + '-1' + '.rockspec';
  return generateCode(env, param, infile, outfile, false, true);
}

function generateLuaTestSource(env, param) {
  const rtcParam = param['rtcParam'];

  let infile = path.join('templates', 'lua', 'test', 'Lua_Test_RTC.lua.njk');
  let outfile = path.join('test', rtcParam.name + 'Test.lua');
  return generateCode(env, param, infile, outfile, true, true);
}

function generateTestSVCIDLExampleSource(env, param) {
	const idlParam = param['idlFileParam'];

  let infile = path.join('templates', 'lua', 'Lns_SVC_idl_example.lns.njk');
  let outfile = path.join('test', getIdlFileNoExt(idlParam.idlPath) + '_idl_example.lns');
  return generateCode(env, param, infile, outfile, false, true);
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
  generateLua
};
