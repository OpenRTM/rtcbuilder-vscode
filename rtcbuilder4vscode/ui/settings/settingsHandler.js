const vscode = require('vscode');

function getSettings() {
  const config = vscode.workspace.getConfiguration('rtcbuilder4vscode');

  const settings = {
    project_dir: config.get('project_dir'),

    max_backup_num: config.get('max_backup_num'),

    basic_name: config.get('basic_name'),
    basic_description: config.get('basic_description'),
    basic_version: config.get('basic_version'),
    basic_vendor: config.get('basic_vendor'),
    basic_category: config.get('basic_category'),
    basic_comp_type: config.get('basic_comp_type'),
    basic_activity_type: config.get('basic_activity_type'),
    basic_max_inst: config.get('basic_max_inst'),
    basic_exec_type: config.get('basic_exec_type'),
    basic_exec_period: config.get('basic_exec_period'),
    basic_prefix: config.get('basic_prefix'),
    basic_suffix: config.get('basic_suffix'),
    // 
    activity_aborting: config.get('activity_aborting'),
    activity_finalize: config.get('activity_finalize'),
    activity_error: config.get('activity_error'),
    activity_startup: config.get('activity_startup'),
    activity_reset: config.get('activity_reset'),
    activity_shutdown: config.get('activity_shutdown'),
    activity_execute: config.get('activity_execute'),
    activity_activated: config.get('activity_activated'),
    activity_stateupdate: config.get('activity_stateupdate'),
    activity_deactivated: config.get('activity_deactivated'),
    activity_ratechanged: config.get('activity_ratechanged'),

    doc_author: config.get('doc_author'),
    doc_licanse: config.get('doc_licanse'),
    // 
    config_name: config.get('config_name'),
    config_type: config.get('config_type'),
    config_var_name: config.get('config_var_name'),
    config_default: config.get('config_default'),
    config_constraint: config.get('config_constraint'),
    config_unit: config.get('config_unit'),
    config_prefix: config.get('config_prefix'),
    config_suffix: config.get('config_suffix'),
    // 
    dataport_name: config.get('dataport_name'),
    dataport_type: config.get('dataport_type'),
    dataport_var_name: config.get('dataport_var_name'),
    dataport_prefix: config.get('dataport_prefix'),
    dataport_suffix: config.get('dataport_suffix'),
    // 
    serviceport_name: config.get('serviceport_name'),
    serviceport_prefix: config.get('serviceport_prefix'),
    serviceport_suffix: config.get('serviceport_suffix'),

    serviceif_name: config.get('serviceif_name'),
    serviceif_instance: config.get('serviceif_instance'),
    serviceif_var_name: config.get('serviceif_var_name'),
    serviceif_prefix: config.get('serviceif_prefix'),
    serviceif_suffix: config.get('serviceif_suffix'),
  };

  return settings;
}

async function saveSettings(param) {
  // console.log(param);
  const config = vscode.workspace.getConfiguration('rtcbuilder4vscode');

  await config.update('max_backup_num', param['max_backup_num'], vscode.ConfigurationTarget.Global);

  await config.update('basic_name', param['basic_name'], vscode.ConfigurationTarget.Global);
  await config.update('basic_description', param['basic_description'], vscode.ConfigurationTarget.Global);
  await config.update('basic_version', param['basic_version'], vscode.ConfigurationTarget.Global);
  await config.update('basic_vendor', param['basic_vendor'], vscode.ConfigurationTarget.Global);
  await config.update('basic_category', param['basic_category'], vscode.ConfigurationTarget.Global);
  await config.update('basic_comp_type', param['basic_comp_type'], vscode.ConfigurationTarget.Global);
  await config.update('basic_activity_type', param['basic_activity_type'], vscode.ConfigurationTarget.Global);
  await config.update('basic_max_inst', param['basic_max_inst'], vscode.ConfigurationTarget.Global);
  await config.update('basic_exec_type', param['basic_exec_type'], vscode.ConfigurationTarget.Global);
  await config.update('basic_exec_period', param['basic_exec_period'], vscode.ConfigurationTarget.Global);
  await config.update('basic_prefix', param['basic_prefix'], vscode.ConfigurationTarget.Global);
  await config.update('basic_suffix', param['basic_suffix'], vscode.ConfigurationTarget.Global);
  // 
  await config.update('activity_aborting', param['activity_aborting'], vscode.ConfigurationTarget.Global);
  await config.update('activity_finalize', param['activity_finalize'], vscode.ConfigurationTarget.Global);
  await config.update('activity_error', param['activity_error'], vscode.ConfigurationTarget.Global);
  await config.update('activity_startup', param['activity_startup'], vscode.ConfigurationTarget.Global);
  await config.update('activity_reset', param['activity_reset'], vscode.ConfigurationTarget.Global);
  await config.update('activity_shutdown', param['activity_shutdown'], vscode.ConfigurationTarget.Global);
  await config.update('activity_execute', param['activity_execute'], vscode.ConfigurationTarget.Global);
  await config.update('activity_activated', param['activity_activated'], vscode.ConfigurationTarget.Global);
  await config.update('activity_stateupdate', param['activity_stateupdate'], vscode.ConfigurationTarget.Global);
  await config.update('activity_deactivated', param['activity_deactivated'], vscode.ConfigurationTarget.Global);
  await config.update('activity_ratechanged', param['activity_ratechanged'], vscode.ConfigurationTarget.Global);

  await config.update('doc_author', param['doc_author'], vscode.ConfigurationTarget.Global);
  await config.update('doc_licanse', param['doc_licanse'], vscode.ConfigurationTarget.Global);
  // 
  await config.update('config_name', param['config_name'], vscode.ConfigurationTarget.Global);
  await config.update('config_type', param['config_type'], vscode.ConfigurationTarget.Global);
  await config.update('config_var_name', param['config_var_name'], vscode.ConfigurationTarget.Global);
  await config.update('config_default', param['config_default'], vscode.ConfigurationTarget.Global);
  await config.update('config_constraint', param['config_constraint'], vscode.ConfigurationTarget.Global);
  await config.update('config_unit', param['config_unit'], vscode.ConfigurationTarget.Global);
  await config.update('config_prefix', param['config_prefix'], vscode.ConfigurationTarget.Global);
  await config.update('config_suffix', param['config_suffix'], vscode.ConfigurationTarget.Global);
  // 
  await config.update('dataport_name', param['dataport_name'], vscode.ConfigurationTarget.Global);
  await config.update('dataport_type', param['dataport_type'], vscode.ConfigurationTarget.Global);
  await config.update('dataport_var_name', param['dataport_var_name'], vscode.ConfigurationTarget.Global);
  await config.update('dataport_prefix', param['dataport_prefix'], vscode.ConfigurationTarget.Global);
  await config.update('dataport_suffix', param['dataport_suffix'], vscode.ConfigurationTarget.Global);
  // 
  await config.update('serviceport_name', param['serviceport_name'], vscode.ConfigurationTarget.Global);
  await config.update('serviceport_prefix', param['serviceport_prefix'], vscode.ConfigurationTarget.Global);
  await config.update('serviceport_suffix', param['serviceport_suffix'], vscode.ConfigurationTarget.Global);

  await config.update('serviceif_name', param['serviceif_name'], vscode.ConfigurationTarget.Global);
  await config.update('serviceif_instance', param['serviceif_instance'], vscode.ConfigurationTarget.Global);
  await config.update('serviceif_var_name', param['serviceif_var_name'], vscode.ConfigurationTarget.Global);
  await config.update('serviceif_prefix', param['serviceif_prefix'], vscode.ConfigurationTarget.Global);
  await config.update('serviceif_suffix', param['serviceif_suffix'], vscode.ConfigurationTarget.Global);
}

module.exports = {
  getSettings,
  saveSettings
};
