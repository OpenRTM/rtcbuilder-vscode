const vscode = require('vscode');
const path = require('path');
const { GeneratedResult } = require("./../model/dataModels");

function generateContainer(env, param) {
  let result = [];
  const config = vscode.workspace.getConfiguration('rtcbuilder4vscode');
  let settings = config['container_config'];
  try {
    settings = JSON.parse(config['container_config']);
    param.rtcParam.containerConfig = settings;
  } catch (e) {
    return result;
  }

  for(const container of param.rtcParam.containerSettings) {
    const osInfo = container.osVersion;

    const elems = osInfo.split(" ");
    const osPart = (elems.length > 0 ? elems[0] : "") + "-" + (elems.length > 1 ? elems[1] : "");

    const mwName = container.middleware.replace(/ /g, "");

    const outfile = `scripts/${param.rtcParam.name}__${osPart}__${mwName}-${container.mdlVersion.toLowerCase()}__${convLanguage(container.language)}_${container.configuration}.Dockerfile`;

    param['containerParam'] = container;

    if(container.middleware.includes("ROS")) {
      result.push(generateROSContainer(env, param, outfile));
    } else {
      if(container.language.includes("Python")) {
        result.push(generateOpenRTMPythonContainer(env, param, outfile));
      } else {
        result.push(generateOpenRTMCppContainer(env, param, outfile));
      }
    }
  }
  return result;
}
function convLanguage(source) {
  return source.replace(/\+/g, "p").toLowerCase();
}
/////
function generateROSContainer(env, param, outfile) {
  let infile = path.join('container', 'ROS_Container.njk');
  return generateCode(env, param, infile, outfile, true);
}

function generateOpenRTMPythonContainer(env, param, outfile) {
  let infile = path.join('container', 'OpenRTM_Python_Container.njk');
  return generateCode(env, param, infile, outfile, true);
}

function generateOpenRTMCppContainer(env, param, outfile) {
  let infile = path.join('container', 'OpenRTM_Cpp_Container.njk');
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
  generateContainer
};
