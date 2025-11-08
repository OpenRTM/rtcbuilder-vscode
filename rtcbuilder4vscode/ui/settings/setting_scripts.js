function defaultSettings() {
  settings_.max_backup_num = 3;

  settings_.basic_name = 'ModuleName';
  settings_.basic_description = "ModuleDescription";
  settings_.basic_version = "1.0.0";
  settings_.basic_vendor = "VenderName";
  settings_.basic_category = "Category";
  settings_.basic_comp_type = "STATIC";
  settings_.basic_activity_type = "PERIODIC";
  settings_.basic_max_inst = 1;
  settings_.basic_exec_type = "PeriodicExecutionContext";
  settings_.basic_exec_period = 1000.0;
  settings_.basic_prefix = "m_";
  settings_.basic_suffix = "";
  // 
  settings_.activity_aborting = false;
  settings_.activity_finalize = false;
  settings_.activity_error = false;
  settings_.activity_startup = false;
  settings_.activity_reset = false;
  settings_.activity_shutdown = false;
  settings_.activity_execute = false;
  settings_.activity_activated = false;
  settings_.activity_stateupdate = false;
  settings_.activity_deactivated = false;
  settings_.activity_ratechanged = false;

  settings_.doc_author = "";
  settings_.doc_licanse = "";
  // 
  settings_.config_name = "conf_name";
  settings_.config_type = "";
  settings_.config_var_name = "";
  settings_.config_default = "";
  settings_.config_constraint = "";
  settings_.config_unit = "";
  settings_.config_prefix = "";
  settings_.config_suffix = "";
  // 
  settings_.dataport_name = "dp_name";
  settings_.dataport_type = "";
  settings_.dataport_var_name = "";
  settings_.dataport_prefix = "";
  settings_.dataport_suffix = "";
  // 
  settings_.serviceport_name = "sv_name";
  settings_.serviceport_prefix = "";
  settings_.serviceport_suffix = "";

  settings_.serviceif_name = "if_name";
  settings_.serviceif_instance = "";
  settings_.serviceif_var_name = "";
  settings_.serviceif_prefix = "";
  settings_.serviceif_suffix = "";

  load_setting(prev_setting_tab, settings_);
}

function cancelSettings() {
  vscode.postMessage({ 
    command: 'closeSettings',
    param: undefined
    });
}

function okSettings() {
  store_setting(prev_setting_tab, settings_);
  // console.log(settings_);

  vscode.postMessage({ 
    command: 'closeSettings',
    param: settings_
    });
}

function load_setting(target, settings) {
  // console.log(settings);
  switch (target) {
    case 'common_setting.html':
      conv_lang_setting(parent.window.translations, 'setting.common');
      loadCommonInfo(settings);
      break;
    case 'basic_setting.html':
      conv_lang_setting(parent.window.translations, 'setting.basic');
      loadBasicInfo(settings);
      break;
    case 'activity_setting.html':
      conv_lang_setting(parent.window.translations, 'setting.document');
      loadActivityInfo(settings);
      break;
    case 'configuration_setting.html':
      conv_lang_setting(parent.window.translations, 'setting.config');
      loadConfigInfo(settings);
      break;
    case 'dataport_setting.html':
      conv_lang_setting(parent.window.translations, 'setting.dataport');
      loadDataPortInfo(settings);
      break;
    case 'serviceport_setting.html':
      conv_lang_setting(parent.window.translations, 'setting.serviceport');
      loadServicePortInfo(settings);
      break;
  }
}

function store_setting(target, settings) {
  switch (target) {
    case 'common_setting.html':
      storeCommonInfo(settings);
      break;
    case 'basic_setting.html':
      storeBasicInfo(settings);
      break;
    case 'activity_setting.html':
      storeActivityInfo(settings);
      break;
    case 'configuration_setting.html':
      storeConfigInfo(settings);
      break;
    case 'dataport_setting.html':
      storeDataPortInfo(settings);
      break;
    case 'serviceport_setting.html':
      storeServicePortInfo(settings);
      break;
  }
}

function loadCommonInfo(settings) {
  document.getElementById('max_backup_num_txt').value = Number(jsonVal(settings, 'max_backup_num'));
}
function storeCommonInfo(settings) {
  settings['max_backup_num'] = document.getElementById('max_backup_num_txt').value;
}

function loadBasicInfo(settings) {
  // console.log(settings);
  document.getElementById('basic_name').value = jsonVal(settings, 'basic_name');
  document.getElementById('basic_description').value = jsonVal(settings,'basic_description');
  document.getElementById('basic_version').value = jsonVal(settings, 'basic_version');
  document.getElementById('basic_vendor').value = jsonVal(settings, 'basic_vendor');
  document.getElementById('basic_category').value = jsonVal(settings, 'basic_category');
  document.getElementById('basic_comp_type').value = jsonVal(settings, 'basic_comp_type');
  document.getElementById('basic_activity_type').value = jsonVal(settings, 'basic_activity_type');
  document.getElementById('basic_max_inst').value = Number(jsonVal(settings,'basic_max_inst'));
  document.getElementById('basic_exec_type').value = jsonVal(settings, 'basic_exec_type');
  document.getElementById('basic_exec_period').value = Number(jsonVal(settings, 'basic_exec_period'));
  document.getElementById('basic_prefix').value = jsonVal(settings, 'basic_prefix');
  document.getElementById('basic_suffix').value = jsonVal(settings, 'basic_suffix');
}

function storeBasicInfo(settings) {
  // console.log(settings);
  settings['basic_name'] = document.getElementById('basic_name').value;
  settings['basic_description'] = document.getElementById('basic_description').value;
  settings['basic_version'] = document.getElementById('basic_version').value;
  settings['basic_vendor'] = document.getElementById('basic_vendor').value;
  settings['basic_category'] = document.getElementById('basic_category').value;
  settings['basic_comp_type'] = document.getElementById('basic_comp_type').value;
  settings['basic_activity_type'] = document.getElementById('basic_activity_type').value;
  settings['basic_max_inst'] = document.getElementById('basic_max_inst').value;
  settings['basic_exec_type'] = document.getElementById('basic_exec_type').value;
  settings['basic_exec_period'] = document.getElementById('basic_exec_period').value;
  settings['basic_prefix'] = document.getElementById('basic_prefix').value;
  settings['basic_suffix'] = document.getElementById('basic_suffix').value;
}

function loadActivityInfo(settings) {
    // console.log(settings);
  settings['activity_aborting'] ? document.getElementById('aborting_on').checked = true
                                : document.getElementById('aborting_off').checked = true;
  settings['activity_finalize'] ? document.getElementById('finalize_on').checked = true
                                : document.getElementById('finalize_off').checked = true;
  settings['activity_error'] ? document.getElementById('error_on').checked = true
                             : document.getElementById('error_off').checked = true;
  settings['activity_startup'] ? document.getElementById('startup_on').checked = true
                               : document.getElementById('startup_off').checked = true;
  settings['activity_reset'] ? document.getElementById('reset_on').checked = true
                             : document.getElementById('reset_off').checked = true;
  settings['activity_shutdown'] ? document.getElementById('shutdown_on').checked = true
                                : document.getElementById('shutdown_off').checked = true;
  settings['activity_execute'] ? document.getElementById('execute_on').checked = true
                               : document.getElementById('execute_off').checked = true;
  settings['activity_activated'] ? document.getElementById('activated_on').checked = true
                                 : document.getElementById('activated_off').checked = true;
  settings['activity_stateupdate'] ? document.getElementById('stateupdate_on').checked = true
                                   : document.getElementById('stateupdate_off').checked = true;
  settings['activity_deactivated'] ? document.getElementById('deactivated_on').checked = true
                                   : document.getElementById('deactivated_off').checked = true;
  settings['activity_ratechanged'] ? document.getElementById('ratechanged_on').checked = true
                                   : document.getElementById('ratechanged_off').checked = true;

  document.getElementById('doc_creator').value = getDisplayDocText(settings['doc_author']);
  document.getElementById('doc_license').value = getDisplayDocText(settings['doc_licanse']);
}

function storeActivityInfo(settings) {
    // console.log(settings);
  settings['activity_aborting'] = document.getElementById('aborting_on').checked;
  settings['activity_finalize'] = document.getElementById('finalize_on').checked;
  settings['activity_error'] = document.getElementById('error_on').checked;
  settings['activity_startup'] = document.getElementById('startup_on').checked;
  settings['activity_reset'] = document.getElementById('reset_on').checked;
  settings['activity_shutdown'] = document.getElementById('shutdown_on').checked;
  settings['activity_execute'] = document.getElementById('execute_on').checked;
  settings['activity_activated'] = document.getElementById('activated_on').checked;
  settings['activity_stateupdate'] = document.getElementById('stateupdate_on').checked;
  settings['activity_deactivated'] = document.getElementById('deactivated_on').checked;
  settings['activity_ratechanged'] = document.getElementById('ratechanged_on').checked;

  settings['doc_author'] = getDocText(document.getElementById('doc_creator').value);
  settings['doc_licanse'] = getDocText(document.getElementById('doc_license').value);
}

function loadConfigInfo(settings) {
  // console.log(settings);
  document.getElementById('config_name').value = jsonVal(settings, 'config_name');
  document.getElementById('config_type').value = jsonVal(settings, 'config_type');
  document.getElementById('config_var_name').value = jsonVal(settings, 'config_var_name');
  document.getElementById('config_default').value = jsonVal(settings, 'config_default');
  document.getElementById('config_constraint').value = jsonVal(settings, 'config_constraint');
  document.getElementById('config_unit').value = jsonVal(settings, 'config_unit');
  document.getElementById('config_prefix').value = jsonVal(settings, 'config_prefix');
  document.getElementById('config_suffix').value = jsonVal(settings, 'config_suffix');
}

function storeConfigInfo(settings) {
  // console.log(settings);
  settings['config_name'] = document.getElementById('config_name').value;
  settings['config_type'] = document.getElementById('config_type').value;
  settings['config_var_name'] = document.getElementById('config_var_name').value;
  settings['config_default'] = document.getElementById('config_default').value;
  settings['config_constraint'] = document.getElementById('config_constraint').value;
  settings['config_unit'] = document.getElementById('config_unit').value;
  settings['config_prefix'] = document.getElementById('config_prefix').value;
  settings['config_suffix'] = document.getElementById('config_suffix').value;
}

function loadDataPortInfo(settings) {
  // console.log(settings);
  document.getElementById('dataport_name').value = jsonVal(settings, 'dataport_name');
  document.getElementById('dataport_type').value = jsonVal(settings, 'dataport_type');
  document.getElementById('dataport_var_name').value = jsonVal(settings, 'dataport_var_name');
  document.getElementById('dataport_prefix').value = jsonVal(settings, 'dataport_prefix');
  document.getElementById('dataport_suffix').value = jsonVal(settings, 'dataport_suffix');
}

function storeDataPortInfo(settings) {
  // console.log(settings);
  settings['dataport_name'] = document.getElementById('dataport_name').value;
  settings['dataport_type'] = document.getElementById('dataport_type').value;
  settings['dataport_var_name'] = document.getElementById('dataport_var_name').value;
  settings['dataport_prefix'] = document.getElementById('dataport_prefix').value;
  settings['dataport_suffix'] = document.getElementById('dataport_suffix').value;
}

function loadServicePortInfo(settings) {
  // console.log(settings);
  document.getElementById('serviceport_name').value = jsonVal(settings, 'serviceport_name');
  document.getElementById('serviceport_prefix').value = jsonVal(settings, 'serviceport_prefix');
  document.getElementById('serviceport_suffix').value = jsonVal(settings, 'serviceport_suffix');

  document.getElementById('serviceif_name').value = jsonVal(settings, 'serviceif_name');
  document.getElementById('serviceif_instance').value = jsonVal(settings, 'serviceif_instance');
  document.getElementById('serviceif_var_name').value = jsonVal(settings, 'serviceif_var_name');
  document.getElementById('serviceif_prefix').value = jsonVal(settings, 'serviceif_prefix');
  document.getElementById('serviceif_suffix').value = jsonVal(settings, 'serviceif_suffix');
}

function storeServicePortInfo(settings) {
  // console.log(settings);
  settings['serviceport_name'] = document.getElementById('serviceport_name').value;
  settings['serviceport_prefix'] = document.getElementById('serviceport_prefix').value;
  settings['serviceport_suffix'] = document.getElementById('serviceport_suffix').value;

  settings['serviceif_name'] = document.getElementById('serviceif_name').value;
  settings['serviceif_instance'] = document.getElementById('serviceif_instance').value;
  settings['serviceif_var_name'] = document.getElementById('serviceif_var_name').value;
  settings['serviceif_prefix'] = document.getElementById('serviceif_prefix').value;
  settings['serviceif_suffix'] = document.getElementById('serviceif_suffix').value;
}

const NEWLINE_CODE = "<br/>";

function getDisplayDocText(text) {
  if (text == null || text === "") {
    return "";
  }

  const sep = (typeof process !== 'undefined' && process.platform === 'win32') ? '\r\n' : '\n';
  const lines = text.split(NEWLINE_CODE);
  let result = '';

  for (let index = 0; index < lines.length; index++) {
    result += lines[index];
    if (index < lines.length - 1) {
      result += sep;
    }
  }

  return result;
}

function getDocText(text) {
  if (text === "") {
    return "";
  }

  const lines = text.split(/\r\n|\r|\n/);

  return lines.join(NEWLINE_CODE);
}

function jsonVal(source, key) {
  return source[key] ?? "";
}

function conv_lang_setting(translations, pageKey) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith(pageKey));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
