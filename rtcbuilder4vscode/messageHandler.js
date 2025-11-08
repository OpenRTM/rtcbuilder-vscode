const vscode = require('vscode');

const fs = require('fs');
const path = require('path');
const os = require("os");
const iconv = require('iconv-lite');

const { createXML, parseXML, validateXML } = require('./xml/xmlHandler');
const { generateCode } = require('./templates/templateHandler');
const { parseServices, parseDataTypes, praseIDL } = require('./parser/IDLHandler');
const { getSettings, saveSettings } = require('./ui/settings/settingsHandler');

const { RtcParam } = require("./model/dataModels");
const BlockParser = require("./blockParser.js")

let rtc_param_;
let settingPanel_;
let comparePanel_;

async function handleMessage(mainPanel, context, extensions, message, translations) {
  console.log(message);
  if (message.command === 'selectProject') {
    let project = message.project;
    if(project) {
      project = vscode.Uri.file(project);
    }
    const options = {
              title: vscode.l10n.t('Select project folder'),
              defaultUri: project, 
              canSelectMany: false,
              canSelectFiles: false,
              canSelectFolders: true,
              openLabel: vscode.l10n.t('Select'),
            };

    const folderUri = await vscode.window.showOpenDialog(options);
    if (folderUri && folderUri.length > 0) {
      const project_dir = folderUri[0].fsPath
      mainPanel.webview.postMessage({
        command: 'sendProject',
        project: project_dir
      });
      const config = vscode.workspace.getConfiguration('rtcbuilder4vscode');
      await config.update('project_dir', project_dir, vscode.ConfigurationTarget.Global);
    }

  } else if (message.command === 'initializeProject') {
      const project_dir = message.project_dir;

      try {
        const idlPath = path.join(project_dir, 'IDL');
        if (!fs.existsSync(idlPath)) {
          fs.mkdirSync(idlPath);
        }
      } catch (e) {
        vscode.window.showErrorMessage(vscode.l10n.t('Initialization failed.') + `\n\n` + e.message,{ modal: true });
        return;
      }

      const typeResult = parseDataTypes(project_dir);
      let typeList;
      if(typeResult != undefined) {
        typeList = typeResult.dateTypeList;
      }
      const serviceResult = parseServices(project_dir);
      const serviceList = serviceResult.serviceList;

      const profilePath = path.join(project_dir, 'RTC.xml');
      if (fs.existsSync(profilePath)) {
        try {
          const xmlData = fs.readFileSync(profilePath, 'utf-8');
          const errList = validateXML(xmlData);
          if(0 < errList.length) {
            errList.unshift(vscode.l10n.t('The target RtcProfile content is invalid.') + os.EOL);
            vscode.window.showErrorMessage(errList.join(os.EOL),{ modal: true });
            return;
          }

          rtc_param_ = parseXML(xmlData, typeList, serviceList);

          const settings = getSettings();
          loadSettings2RtcParamPreSuf(settings, rtc_param_);

          mainPanel.webview.postMessage({
            command: 'sendProfile',
            profile: rtc_param_,
            showMessage: false
          });
        } catch (e) {
        }

      } else {
        try {
          rtc_param_ = new RtcParam();
          const settings = getSettings();
          const fileName = path.join(project_dir, 'RTC.xml');
          loadSettings2RtcParam(settings, rtc_param_);
          const result = createXML(rtc_param_);
          fs.writeFileSync(fileName, result, 'utf-8');
          mainPanel.webview.postMessage({
            command: 'sendProfile',
            profile: rtc_param_,
            showMessage: false
          });
        } catch (e) {
        }
      }

  } else if (message.command === 'saveProfile') {
      const param = message.param;
      const project_dir = message.project_dir;

      const result = createXML(param);
      const fileName = path.join(project_dir, 'RTC.xml');
      fs.writeFileSync(fileName, result, 'utf-8');

  } else if (message.command === 'createXML') {
    let result;
    try {
      const param = message.param;
      result = createXML(param);
    } catch (e) {
      vscode.window.showErrorMessage(vscode.l10n.t('Conversion to RtcProfile failed.') + `\n\n` + e.message,{ modal: true });
      return;
    }

    mainPanel.webview.postMessage({
      command: 'sendXML',
      xml: result
    });

  } else if (message.command === 'generateCode') {
    const project_dir = message.project_dir;
    const param = message.param;
    rtc_param_ = param;

    // const destPath = path.join(project_dir, 'RTC.xml');
    // const originalProfile = fs.readFileSync(destPath, 'utf-8');
    // const generatedProfile = createXML(param);
    // if(compareXmlIgnoringDates(originalProfile, generatedProfile) == false) {
    //   fs.writeFileSync(destPath, generatedProfile, 'utf-8');
    // }

    let generatedCodes;
    try {
      generatedCodes = await generateCode(project_dir, param, context, extensions);
    } catch (e) {
      vscode.window.showWarningMessage(e.message,{ modal: true });
      return;
    }

    //基ファイルの読み込み
    for(const each of generatedCodes) {
      const filePath = path.join(project_dir, each.name);
      try {
        const originalData = fs.readFileSync(filePath, 'utf-8');
        each.original = originalData;
        if(isEqualIgnoreWhitespace(each.code, each.original)) {
          each.mode = 'same';
        } else {
          if(each.canMerge) {
            each.mode = 'Merge';
          } else {
            each.mode = 'Generated';
          }
        }
      } catch (e) {
        each.mode = 'generated_new';
      }
    }

    const existNotSame = generatedCodes.find(c => c.mode !== 'same');
    if(existNotSame == undefined) {
        // vscode.window.showInformationMessage('Generate success');
        vscode.window.showInformationMessage('Generate success',{ modal: true });
        return;
    }
    // writeResults(context, project_dir, generatedCodes);
    // return;
    const existNotGeneratedNew = generatedCodes.find(c => c.mode !== 'generated_new');
    if(existNotGeneratedNew == undefined) {
        writeResults(context, project_dir, generatedCodes);
        return;
    }

    // 比較画面の表示
    if(settingPanel_) {
      comparePanel_.reveal(vscode.ViewColumn.One);
      return;
    }
    comparePanel_ = vscode.window.createWebviewPanel(
          'modalView',
          'Compare generated Code',
          vscode.ViewColumn.Active,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.file(path.join(context.extensionPath, 'ui', 'compare')),
              vscode.Uri.file(path.join(context.extensionPath, 'ui', 'compare', 'vs'))
            ]
          }
      );
      const htmlPath = path.join(context.extensionPath, 'ui', 'compare', 'compare.html');
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const baseUri = comparePanel_.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'ui', 'compare'))
      );
      htmlContent = htmlContent.replace(/{{baseUri}}/g, baseUri.toString());

      const scriptUri = comparePanel_.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'ui', 'compare', 'compare_scripts.js'))
      );
      htmlContent = htmlContent.replace('<!--SCRIPT-->',
                                        `<script src="${scriptUri}"></script>
                                         <script>
                                           window.translations = ${JSON.stringify(translations)};
                                         </script>`);

      comparePanel_.webview.html = htmlContent;

      comparePanel_.webview.onDidReceiveMessage(
          async message => {
            handleMessage(comparePanel_, context, extensions, message);
          },
          undefined,
          context.subscriptions
        );
      comparePanel_.onDidDispose(() => {
          comparePanel_ = undefined;
        },
        null,
        context.subscriptions
      );
      comparePanel_.webview.postMessage({
        command: 'initData',
        param: generatedCodes,
        project_dir: project_dir
      });

  } else if (message.command === 'writeGenerateCode') {
    if(comparePanel_) {
    const param = message.param;
      const project_dir = message.project_dir;
      if(param) {
        writeResults(context, project_dir, param);
      } else {
        writeProfile(project_dir);
      }

      comparePanel_.dispose();
      comparePanel_ = null;
    }

  } else if (message.command === 'getCORBADataType') {
    const param = message.param;
    const result = parseDataTypes(param);

    mainPanel.webview.postMessage({
      command: 'sendDataTypes',
      pathes: result.idlSearchPathList,
      types : result.dateTypeList
    });

  } else if (message.command === 'getCORBAService') {
    const param = message.param;
    const result = parseServices(param);

    mainPanel.webview.postMessage({
      command: 'sendServices',
      pathes: result.idlSearchPathList,
      services : result.serviceList
    });

  } else if (message.command === 'importProfile') {
    const project_dir = message.project_dir;
    const uris = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: vscode.l10n.t('Select File'),
        filters: {
          'XML Files': ['xml'],
          'All Files': ['*']
        },
        defaultUri: vscode.Uri.file(
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/'
        )
      });
    if (uris && uris.length > 0) {
      try {
        const fileUri = uris[0];
        const sourcePath = fileUri.fsPath;
        const xmlData = fs.readFileSync(sourcePath, 'utf-8');
        const errList = validateXML(xmlData);
        if(0 < errList.length) {
          errList.unshift(vscode.l10n.t('The target RtcProfile content is invalid.') + os.EOL);
          vscode.window.showErrorMessage(errList.join(os.EOL),{ modal: true });
          return;
        }

        const typeResult = parseDataTypes(project_dir);
        const typeList = typeResult.dateTypeList;
        const serviceResult = parseServices(project_dir);
        const serviceList = serviceResult.serviceList;

        rtc_param_ = parseXML(xmlData, typeList, serviceList);
        mainPanel.webview.postMessage({
          command: 'sendProfile',
          profile: rtc_param_,
          showMessage: true
        });

        const destPath = path.join(project_dir, 'RTC.xml');
        fs.copyFileSync(sourcePath, destPath);
      } catch (e) {
        vscode.window.showErrorMessage(vscode.l10n.t('Profile Import failed.') + `\n\n` + e.message,{ modal: true });
      }
    }

  } else if (message.command === 'exportProfile') {
    const uri = await vscode.window.showSaveDialog({
        saveLabel: vscode.l10n.t('Save'),
        title: vscode.l10n.t('Please select a save location.'),
        filters: {
          'XML Files': ['xml'],
          'All Files': ['*']
        },
        defaultUri: vscode.Uri.file(
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/'
        )
      });

      if (uri) {
        const param = message.param;
        const result = createXML(param);
        fs.writeFileSync(uri.fsPath, result, 'utf-8');
        vscode.window.showInformationMessage(
          vscode.l10n.t('Profile Export completed.'),
          { modal: true }
        );
      }

  } else if (message.command === 'validateProfile') {
      try {
        const xmlData = message.contents;
        project_dir = message.project;

        const errList = validateXML(xmlData);
        if(0 < errList.length) {
          errList.unshift(vscode.l10n.t('The target RtcProfile content is invalid.') + os.EOL);
          vscode.window.showErrorMessage(errList.join(os.EOL),{ modal: true });
          return;
        }

        const typeResult = parseDataTypes(project_dir);
        const typeList = typeResult.dateTypeList;
        const serviceResult = parseServices(project_dir);
        const serviceList = serviceResult.serviceList;

        rtc_param_ = parseXML(xmlData, typeList, serviceList);
        mainPanel.webview.postMessage({
          command: 'sendProfile',
          profile: rtc_param_,
          showMessage: true
        });
      } catch (e) {
        vscode.window.showErrorMessage(vscode.l10n.t('Profile Validation') + `\n\n` + e.message,{ modal: true });
      }

  } else if (message.command === 'openSettings') {
    if(settingPanel_) {
      settingPanel.reveal(vscode.ViewColumn.One);
      return;
    }
    settingPanel_ = vscode.window.createWebviewPanel(
        'modalView',
        'Preferences',
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'ui', 'settings'))
          ]
        }
    );
    const htmlPath = path.join(context.extensionPath, 'ui', 'settings', 'settings.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const baseUri = settingPanel_.webview.asWebviewUri(
      vscode.Uri.file(path.join(context.extensionPath, 'ui', 'settings'))
    );
    htmlContent = htmlContent.replace(/{{baseUri}}/g, baseUri.toString());

    const scriptUri = settingPanel_.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'ui', 'settings', 'setting_scripts.js'))
    );

    htmlContent = htmlContent.replace('<!--SCRIPT-->', `<script src="${scriptUri}"></script>
                  <script>
                    window.translations = ${JSON.stringify(translations)};
                  </script>`);

    settingPanel_.webview.html = htmlContent;

    settingPanel_.webview.onDidReceiveMessage(
        async message => {
          handleMessage(settingPanel_, context, extensions, message);
        },
        undefined,
        context.subscriptions
      );
    settingPanel_.onDidDispose(() => {
        settingPanel_ = undefined;
      },
      null,
      context.subscriptions
    );

  } else if (message.command === 'getSettingsMain') {
    const settings = getSettings();

    mainPanel.webview.postMessage({
      command: 'sendSettings',
      settings: settings
    });

  } else if (message.command === 'getSettings') {
    const settings = getSettings();

    settingPanel_.webview.postMessage({
      command: 'sendSettings',
      settings: settings
    });

  } else if (message.command === 'closeSettings') {
    if(settingPanel_) {
      const param = message.param;
      if(param) {
        await saveSettings(param);
      }

      settingPanel_.dispose();
      settingPanel_ = null;
    }

  } else if (message.command === 'showMessage') {
    const type = message.type;
    if(type == 'warning') {
      vscode.window.showWarningMessage(message.param,{ modal: true });
    } else {
      vscode.window.showInformationMessage(message.param,{ modal: true });
    }
  }
}

function loadSettings2RtcParam(settings, param) {
  param.name = settings['basic_name'];
  param.description = settings['basic_description'];
  param.version = settings['basic_version'];
  param.vendor = settings['basic_vendor'];
  param.category = settings['basic_category'];
  param.componentType = settings['basic_comp_type'];
  param.activityType = settings['basic_activity_type'];
  param.maxInstance = settings['basic_max_inst'];
  param.executionType = settings['basic_exec_type'];
  param.executionRate = settings['basic_exec_period'];
  
  param.actions['onFinalize'].implemented = settings['activity_finalize'];
  param.actions['onStartup'].implemented = settings['activity_startup'];
  param.actions['onShutdown'].implemented = settings['activity_shutdown'];
  param.actions['onActivated'].implemented = settings['activity_activated'];
  param.actions['onDeactivated'].implemented = settings['activity_deactivated'];
  param.actions['onAborting'].implemented = settings['activity_aborting'];
  param.actions['onError'].implemented = settings['activity_error'];
  param.actions['onReset'].implemented = settings['activity_reset'];
  param.actions['onExecute'].implemented = settings['activity_execute'];
  param.actions['onStateUpdate'].implemented = settings['activity_stateupdate'];
  param.actions['onRateChanged'].implemented = settings['activity_ratechanged'];

  param.doc_creator = settings['doc_author'];
  param.doc_license = settings['doc_licanse'];

  param.commonPrefix = settings['basic_prefix'];
  param.commonSuffix = settings['basic_suffix'];
  param.dataPortPrefix = settings['dataport_prefix'];
  param.dataPortSuffix = settings['dataport_suffix'];
  param.servicePortPrefix = settings['serviceport_prefix'];
  param.servicePortPrefix = settings['serviceport_suffix'];
  param.serviceIFPrefix = settings['serviceif_prefix'];
  param.serviceIFSuffix = settings['serviceif_suffix'];
  param.configurationPrefix = settings['config_prefix'];
  param.configurationSuffix = settings['config_suffix'];
}

function loadSettings2RtcParamPreSuf(settings, param) {
  param.commonPrefix = settings['basic_prefix'];
  param.commonSuffix = settings['basic_suffix'];
  param.dataPortPrefix = settings['dataport_prefix'];
  param.dataPortSuffix = settings['dataport_suffix'];
  param.servicePortPrefix = settings['serviceport_prefix'];
  param.servicePortPrefix = settings['serviceport_suffix'];
  param.serviceIFPrefix = settings['serviceif_prefix'];
  param.serviceIFSuffix = settings['serviceif_suffix'];
  param.configurationPrefix = settings['config_prefix'];
  param.configurationSuffix = settings['config_suffix'];
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

function copyFigure(context, project_dir, infile, outfile) {
  const extensionPath = context.extensionPath;
  const sourcePath = path.join(extensionPath, 'figs', infile);

  const targetPath = path.join(project_dir, outfile);
  
  fs.copyFile(sourcePath, targetPath, err => {});
}

function isEqualIgnoreWhitespace(str1, str2) {
  const normalize = str => str.replace(/\s+/g, '');
  return normalize(str1) === normalize(str2);
}

function compareXmlIgnoringDates(xml1, xml2) {
  const normalize = str => str.replace(/\s+/g, '');
  const clean = (xml) => xml
    .replace(/rtc:updateDate="[^"]*"/, '')
    .replace(/rtc:creationDate="[^"]*"/, '');

  return clean(normalize(xml1)) === clean(normalize(xml2));
}

function writeProfile(project_dir) {
  const destPath = path.join(project_dir, 'RTC.xml');
  const generatedProfile = createXML(rtc_param_);
  fs.writeFileSync(destPath, generatedProfile, 'utf-8');
}

function writeResults(context, project_dir, param) {
  const bomBuffer = Buffer.from([0xEF, 0xBB, 0xBF]);

  const now = new Date();
  const genTime =  now.getFullYear().toString()
                     + String(now.getMonth() + 1).padStart(2, '0')
                     + String(now.getDate()).padStart(2, '0')
                     + String(now.getHours()).padStart(2, '0')
                     + String(now.getMinutes()).padStart(2, '0')
                     + String(now.getSeconds()).padStart(2, '0');

  const destPath = path.join(project_dir, 'RTC.xml');
  const originalProfile = fs.readFileSync(destPath, 'utf-8');
  const generatedProfile = createXML(rtc_param_);
  if(compareXmlIgnoringDates(originalProfile, generatedProfile) == false) {
    if(fs.existsSync(destPath)) {
      fs.renameSync(destPath, destPath + genTime);
    }
    removeBackupFiles(project_dir, 'RTC.xml');
    fs.writeFileSync(destPath, generatedProfile, 'utf-8');
  }

  for(const each of param) {
    if(each.mode.toLowerCase() === 'original'
        || each.mode.toLowerCase() === 'same') continue;
    else if(each.mode.toLowerCase() === 'merge') {
      const parser = new BlockParser("rtc-template", "block");
      const parsed = parser.parse(each.code);
      const merged = parser.merge(each.original, parsed, true);
      each.code = merged;
    }

    const filePath = path.join(project_dir, each.name);
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if(fs.existsSync(filePath)) {
      fs.renameSync(filePath, filePath + genTime);
    }
    removeBackupFiles(project_dir, each.name);

    if(each.isNotBom) {
      if(each.encode === 'EUC_JP') {
        const encoded = iconv.encode(each.code, 'EUC-JP');
        fs.writeFileSync(filePath, encoded);
      } else {
        fs.writeFileSync(filePath, each.code, param.encode);
      }
    } else {
      const contentBuffer = Buffer.from(each.code, param.encode);
      const finalBuffer = Buffer.concat([bomBuffer, contentBuffer]);
      fs.writeFileSync(filePath, finalBuffer);
    }
  }

  copyFigure(context, project_dir, 'rt_middleware_banner.bmp', path.join('cmake', 'rt_middleware_banner.bmp'));
  copyFigure(context, project_dir, 'rt_middleware_dlg.bmp', path.join('cmake', 'rt_middleware_dlg.bmp'));
  copyFigure(context, project_dir, 'rt_middleware_logo.ico', path.join('cmake', 'rt_middleware_logo.ico'));

  // vscode.window.showInformationMessage('Generate success');
  vscode.window.showInformationMessage('Generate success',{ modal: true });

}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function removeBackupFiles(targetPath, targetFile) {
  let targetRealFile = targetPath;

  const config = vscode.workspace.getConfiguration('rtcbuilder4vscode');
  let backUpNum = config.get('max_backup_num');

  if (targetFile.includes('\\') || targetFile.includes('/')) {
    // ファイル名にパスが含まれる場合
    const paths = targetFile.split(/[/\\]/);

    for (let i = 0; i < paths.length; i++) {
      targetRealFile = path.join(targetRealFile, paths[i]);
      if (i < paths.length - 1) {
        targetPath = path.join(targetPath, paths[i]);
      }
    }

    if (!fs.existsSync(targetPath)) return;

    const files = fs.readdirSync(targetPath).map(f => path.join(targetPath, f));
    const targets = files.filter(file => file.startsWith(targetRealFile));

    if (targets.length > backUpNum) {
      targets.sort(); // ソートして古い順に削除
      const excess = targets.length - backUpNum;
      for (let i = 0; i < excess; i++) {
        fs.unlinkSync(targets[i]);
      }
    }

  } else {
    // ファイル名のみの場合
    if (!fs.existsSync(targetPath)) return;

    const files = fs.readdirSync(targetPath);
    const targets = files.filter(file => file.startsWith(targetFile));

    if (targets.length > backUpNum) {
      targets.sort();
      const excess = targets.length - backUpNum;
      for (let i = 0; i < excess; i++) {
        const fullPath = path.join(targetPath, targets[i]);
        fs.unlinkSync(fullPath);
      }
    }
  }
}

function fileCompare(filePathA, filePathB) {
  try {
    const statA = fs.statSync(filePathA);
    const statB = fs.statSync(filePathB);

    if (statA.size !== statB.size) return false;

    const bufferA = fs.readFileSync(filePathA);
    const bufferB = fs.readFileSync(filePathB);

    return bufferA.equals(bufferB);
  } catch (e) {
    return false;
  }
}

module.exports = {
  handleMessage
};
