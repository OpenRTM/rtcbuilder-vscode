const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { handleMessage } = require('./messageHandler');

const { RtcParam } = require("./model/dataModels");

async function activate(context) {
  const extensions = await getOptionExtensions();
  const languageNames = extensions.map(ext => ext.languageInfo);
  languageNames.unshift('C++');
  //
  context.subscriptions.push(
    vscode.commands.registerCommand('rtcbuilder.openPanel', () => {
      const panel = vscode.window.createWebviewPanel(
        'RTCBuilder',
        'RTCBuilder',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'ui')),
            vscode.Uri.file(path.join(context.extensionPath, 'model')),
            vscode.Uri.file(path.join(context.extensionPath, 'parser')),
            vscode.Uri.file(path.join(context.extensionPath, 'figs')),
          ]
        }
      );

      const htmlPath = path.join(context.extensionPath, 'ui', 'main.html');
      let html = fs.readFileSync(htmlPath, 'utf8');

      const baseUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'ui'))
      );
      html = html.replace(/{{baseUri}}/g, baseUri.toString());

      const basicScriptUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'basic.js'))
        );
      const activityScriptUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'activity.js'))
        );
      const dataPortScriptUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'dataport.js'))
        );
      const servicePortScriptUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'serviceport.js'))
        );
      const configSetScriptUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'configuration.js'))
        );
      const scriptUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'scripts.js'))
        );
        
      const modelUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'model', 'dataModels.js'))
        );

      const locale = vscode.env.language;
      // const locale = 'en';
      const translations = getTranslations(locale);

      const cssUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'style.css'))
        );
      const portIconUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'figs', 'SrvPort.png'))
        );
      const reqIconUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'figs', 'ReqIF.png'))
        );
      const proIconUri = panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'figs', 'ProIF.png'))
        );

      let config_types = ["short", "int", "long", "float", "double", "string"];

      html = html.replace('<!--STYLE-->', `<link href="${cssUri}" rel="stylesheet">`)
          .replace('<!--SCRIPT_MODEL-->', `<script src="${modelUri}"></script>
            <script>
              window.translations = ${JSON.stringify(translations)};
            </script>`)
          .replace('<!--SCRIPT-->', `<script src="${basicScriptUri}"></script>
                                     <script src="${activityScriptUri}"></script>
                                     <script src="${dataPortScriptUri}"></script>
                                     <script src="${servicePortScriptUri}"></script>
                                     <script src="${configSetScriptUri}"></script>
                                     <script src="${scriptUri}"></script>
                                     <script>
                                        const PORT_ICON_URI = "${portIconUri}";
                                        const REQ_ICON_URI = "${reqIconUri}";
                                        const PROV_ICON_URI = "${proIconUri}";
                                      </script>`);

      panel.webview.html = html;

	    // メッセージ受信
      panel.webview.onDidReceiveMessage(
        async message => {
          handleMessage(panel, context, extensions, message, translations);
        },
        undefined,
        context.subscriptions
      );
      panel.webview.postMessage({
        command: 'sendExtension',
        language_mames: languageNames,
        config_types: config_types
      });
    })
  );

  return {
    RtcParam
  };
}

function deactivate() {}

async function getOptionExtensions() {
  const extensions = vscode.extensions.all;
  const result = [];

  for (const ext of extensions) {
    if(ext.id == 'aist.rtcbuilder4vscode') continue;
    if(ext.id.includes('rtcbuilder') == false) continue;

    if (!ext.isActive) {
      await ext.activate();
    }
    const exportsObj = ext.exports;
    if (exportsObj 
          && typeof exportsObj.getLanguageInfo === 'function'
          && typeof exportsObj.generateTemplateCode === 'function') {
      result.push({
        id: ext.id,
        displayName: ext.packageJSON.displayName || ext.id,
        languageInfo: exportsObj.getLanguageInfo(),
        generateTemplateCode: exportsObj.generateTemplateCode
      });
    }
  }

  return result;
}

function getTranslations(locale) {
    const fallbackLocale = 'en';
    const filePath = path.join(__dirname, 'locales', `${locale}.json`);
    const fallbackPath = path.join(__dirname, 'locales', `${fallbackLocale}.json`);

    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
    } catch (e) {
        vscode.window.showErrorMessage('Failed to load translation');
        return { title: 'Error', message: 'Translation failed.' };
    }
}

module.exports = {
  activate,
  deactivate
};
