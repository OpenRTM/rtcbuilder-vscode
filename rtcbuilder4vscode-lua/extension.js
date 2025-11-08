const vscode = require('vscode');
const { generateCode } = require('./templateHandlerLua');

let rtcParam_;

async function activate(context) {
  return {
    getLanguageInfo,
    generateTemplateCode
  };
}

function deactivate() {}

function getLanguageInfo() {
  return "Lua";
}

function generateTemplateCode(param, proto) {
  Object.setPrototypeOf(param, proto);
  return generateCode(param);
}

module.exports = {
	activate,
	deactivate
}
