// コンテナタブ
let current_container_index_ = -1;
let current_container_;
let current_lib_index_ = -1;
let current_repository_index_ = -1;
let container_config_;
let preset_checkboxws_ = [];

function load_container_info(settings) {
  container_config_ = settings['container_config'];
  try {
    container_config_ = JSON.parse(settings['container_config']);
  } catch (e) {
    container_config_ = null;
  }
  
  showConfigWarning(container_config_);
  update_enable(container_config_);

  document.getElementById('container_mod_name').innerText = getDisplayDocText(rtc_param_.name);
  document.getElementById('container_mod_desc').innerText = getDisplayDocText(rtc_param_.description);

  update_target_table();

  let middleware_combo = document.getElementById('container_middleware');
  remove_all_items(middleware_combo);
  if(container_config_) {
    for(let each of container_config_['middlewares']) {
      const option = document.createElement("option");
      option.value = each['name'];
      option.text = each['name'];
      middleware_combo.appendChild(option);
    }
    selected_middleware_changed(false);
  }

  if(0<rtc_param_.containerSettings.length) {
    current_container_index_ = 0;
    rtc_param_.lang.properties = [];
  }

  let container_table = document.getElementById('target_table');

  if (0 <= current_container_index_) {
    select_target_table(container_table.rows[0], false);
  }
}

function update_target_table() {
  let container_table = document.getElementById('target_table');
  container_table.innerHTML = "";
  for (let index = 0; index < rtc_param_.containerSettings.length; index++) {
    let row = container_table.insertRow(-1);
    row.classList.add("result_row");
    row.id = index;
    if (0 <= current_container_index_) {
      if (current_container_index_ == index) {
        row.classList.add('selected');
      }
    }
    row.onclick = function () {
      select_target_table(row, true);
    };
    Object.setPrototypeOf(rtc_param_.containerSettings[index], ContainerParam.prototype);
    let cellMdl = row.insertCell(-1);
    cellMdl.innerHTML = rtc_param_.containerSettings[index].middleware;
    let cellMdlVersion = row.insertCell(-1);
    cellMdlVersion.innerHTML = rtc_param_.containerSettings[index].mdlVersion;
    let cellOSVersion = row.insertCell(-1);
    cellOSVersion.innerHTML = rtc_param_.containerSettings[index].osVersion;
  }
}

function select_target_table(row, do_store) {
  if(!container_config_) return;

  if(do_store) {
    store_container_info();
  }

  const rows = document.querySelectorAll('.result_row');
  let rowIndex = -1; 
  rows.forEach((r, index) => {
    r.classList.remove('selected')
    if (r === row) {
      rowIndex = index;
    }
  });
  row.classList.add('selected');
  //////
  current_container_index_ = rowIndex;
  current_container_ = rtc_param_.containerSettings[rowIndex];

  let middleware_combo = document.getElementById('container_middleware')
  const selected_middleware = [...middleware_combo.options].find(o => o.text === current_container_.middleware);
  if (selected_middleware) {
    selected_middleware.selected = true;
    selected_middleware_changed(false);
  }

  let middleware_version_combo = document.getElementById('container_middleware_version')
  const selected_middleware_version = [...middleware_version_combo.options].find(o => o.text === current_container_.mdlVersion);
  if (selected_middleware_version) {
    selected_middleware_version.selected = true;
    middleware_version_selected();
  }

  let os_combo = document.getElementById('container_os_version')
  const selected_os_version = [...os_combo.options].find(o => o.text === current_container_.osVersion);
  if (selected_os_version) {
    selected_os_version.selected = true;
    os_version_selected();
  }

  let workspace_txt = document.getElementById('container_workspace')
  workspace_txt.value = current_container_.workspace;

  let lang_combo = document.getElementById('container_language')
  const selected_lang = [...lang_combo.options].find(o => o.text === current_container_.language);
  if (selected_lang) {
    selected_lang.selected = true;
  }

  let config_combo = document.getElementById('container_configuration')
  const selected_config = [...config_combo.options].find(o => o.text === current_container_.configuration);
  if (selected_config) {
    selected_config.selected = true;
  }
  //////
  const middleware = container_config_['middlewares'].find(item => item.name === current_container_.middleware);
  for(let each of middleware['default_libs']) {
    const exists = current_container_.libraries.some(item => item === each);
    if (exists) continue; 
    current_container_.libraries.push(each);
  }
  update_library_table();
  update_repository_table();
}

function store_container_info() {
  if(!current_container_) return;

  let mdl_cmb = document.getElementById('container_middleware')
  current_container_.middleware = mdl_cmb.options[mdl_cmb.selectedIndex].text;

  let mdl_ver_cmb = document.getElementById('container_middleware_version')
  current_container_.mdlVersion = mdl_ver_cmb.options[mdl_ver_cmb.selectedIndex].text;

  let os_ver_cmb = document.getElementById('container_os_version')
  current_container_.osVersion = os_ver_cmb.options[os_ver_cmb.selectedIndex].text;

  let workspace_txt = document.getElementById('container_workspace')
  current_container_.workspace = workspace_txt.value;

  let lang_combo = document.getElementById('container_language')
  current_container_.language = lang_combo.options[lang_combo.selectedIndex].text;

  let config_combo = document.getElementById('container_configuration')
  current_container_.configuration = config_combo.options[config_combo.selectedIndex].text;
}

function showConfigWarning(enable) {
  if(enable) {
    document.getElementById('container.SETTING_CAUTION').style.display = "none";
  } else {
    document.getElementById('container.SETTING_CAUTION').style.display = "";
  }
}

function update_enable(enable) {
  document.getElementById('add_target_btn').disabled = !enable;
  document.getElementById('delete_target_btn').disabled = !enable;
  
  document.getElementById('container_middleware').disabled = !enable;
  document.getElementById('container_middleware_version').disabled = !enable;
  document.getElementById('container_os_version').disabled = !enable;
  document.getElementById('container_workspace').disabled = !enable;
  document.getElementById('container_language').disabled = !enable;
  document.getElementById('container_configuration').disabled = !enable;

  document.getElementById('add_library_btn').disabled = !enable;
  document.getElementById('delete_library_btn').disabled = !enable;

  document.getElementById('add_repository_btn').disabled = !enable;
  document.getElementById('delete_repository_btn').disabled = !enable;

  for(let each of preset_checkboxws_) {
    each.disabled = !enable;
  }
}

function middleware_selected() {
  selected_middleware_changed(true);
}

function selected_middleware_changed(updateLibs) {
  let middleware_combo = document.getElementById('container_middleware')
  const selected = middleware_combo.options[middleware_combo.selectedIndex].text;

  let version_combo = document.getElementById('container_middleware_version')
  remove_all_items(version_combo);
  if(!selected) return;

  const middleware = container_config_['middlewares'].find(item => item.name === selected);
  const versions = middleware['versions'];
  for(let each of versions) {
    const option = document.createElement("option");
    option.value = each['id'];
    option.text = each['id'];
    version_combo.appendChild(option);
  }
  /////
  let os_combo = document.getElementById('container_os_version')
  remove_all_items(os_combo);
  if(middleware['type'] === 'free') {
    const supported_os = middleware['supported_os'];
    for(let each of supported_os) {
      const option = document.createElement("option");
      option.value = each;
      option.text = each;
      os_combo.appendChild(option);
    }
    os_combo.disabled = false;
  } else {
    for(let each of versions) {
      const option = document.createElement("option");
      option.value = each['os'];
      option.text = each['os'];
      os_combo.appendChild(option);
    }
    os_combo.disabled = true;
  }
  /////
  let lang_combo = document.getElementById('container_language')
  remove_all_items(lang_combo);
  if(middleware['has_language_selection']) {
    for(let each of ['C++', 'Python']) {
      const option = document.createElement("option");
      option.value = each;
      option.text = each;
      lang_combo.appendChild(option);
    }
    lang_combo.disabled = false;

  } else {
    const option = document.createElement("option");
    option.value = 'C++';
    option.text = 'C++';
    lang_combo.appendChild(option);
    lang_combo.disabled = true;
  }
  /////
  let config_combo = document.getElementById('container_configuration')
  remove_all_items(config_combo);
  if(middleware['type'] === 'free') {
    const option = document.createElement("option");
    option.value = 'Std';
    option.text = 'Std';
    config_combo.appendChild(option);
    config_combo.disabled = true;
  } else {
    for(let each of ['Min', 'Full']) {
      const option = document.createElement("option");
      option.value = each;
      option.text = each;
      config_combo.appendChild(option);
    }
    config_combo.disabled = false;
  }
  /////
  if(!current_container_) return;

  let container_table = document.getElementById('target_table');
  const cellMdl = container_table.rows[current_container_index_].cells[0];
  cellMdl.textContent = middleware['name'];
  const cellMdlVer = container_table.rows[current_container_index_].cells[1];
  cellMdlVer.textContent = versions[0]['id'];
  const cellOSVer = container_table.rows[current_container_index_].cells[2];
  if(middleware['type'] === 'free') {
    cellOSVer.textContent = middleware['supported_os'][0];
  } else {
    cellOSVer.textContent = versions[0]['os'];
  }

  let preset_div = document.getElementById('container_library_list')
  preset_div.innerHTML = "";
  preset_checkboxws_ = [];
  for(let each in middleware['functional_presets']) {
    const div = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = each + "_checkbox";
    checkbox.addEventListener("change", function () {
      preset_checked(each, checkbox.checked);
    });
    if(current_container_.preSets.includes(each)) {
      checkbox.checked = true;
    }
    preset_checkboxws_.push(checkbox);

    const label = document.createElement("label");
    label.htmlFor = each + "_checkbox";
    label.textContent = each;

    var hintStr = '';
    for(let elem of middleware['functional_presets'][each]) {
      if(0 < hintStr.length) {
        hintStr = hintStr + '\n';
      }
      hintStr = hintStr + elem;
    }

    const img = document.createElement("img");
    img.id = "hintIcon";
    img.className = "library-icon";
    img.alt = "hint";
    img.title = hintStr;
    img.src = HINT_ICON_URI;

    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(img);

    preset_div.appendChild(div);
  }
  current_lib_index_ = -1;
  current_repository_index_ = -1;

  if(updateLibs) {
    current_container_.preSets = [];
    current_container_.libraries = [...middleware['default_libs']];
    update_library_table();
  }
  console.log(current_container_);
  console.log(rtc_param_);
}

function middleware_version_selected() {
  let middleware_combo = document.getElementById('container_middleware')
  const selected = middleware_combo.options[middleware_combo.selectedIndex].text;
  const middleware = container_config_['middlewares'].find(item => item.name === selected);

  let version_combo = document.getElementById('container_middleware_version')
  const selected_version = version_combo.options[version_combo.selectedIndex].text;
  const version = middleware['versions'].find(item => item.id === selected_version);

  let os_combo = document.getElementById('container_os_version')
  const option = [...os_combo.options].find(o => o.text === version['os']);
  if (option) option.selected = true;

  let container_table = document.getElementById('target_table');
  const cell = container_table.rows[current_container_index_].cells[1];
  cell.textContent = version['id'];
}

function os_version_selected() {
  let os_ver_cmb = document.getElementById('container_os_version')
  let container_table = document.getElementById('target_table');
  const cell = container_table.rows[current_container_index_].cells[2];
  cell.textContent = os_ver_cmb.options[os_ver_cmb.selectedIndex].text;
}

function add_target() {
  if(!container_config_) return;

  const newMid = container_config_['middlewares'][0];
  const newVersion = newMid['versions'][0];

  let new_param = new ContainerParam();
  new_param.middleware = newMid.name;
  new_param.mdlVersion = newVersion.id;
  new_param.osVersion = newVersion.os;
  rtc_param_.containerSettings.push(new_param);
  update_enable(true);
  update_target_table();
  current_container_index_ = rtc_param_.containerSettings.length - 1;
  current_container_ = new_param;
  let container_table = document.getElementById('target_table');
  select_target_table(container_table.rows[current_container_index_], false);
}

function delete_target() {
  if(!current_container_) return;
  
  rtc_param_.containerSettings.splice(current_container_index_, 1);

  let workspace_txt = document.getElementById('container_workspace')
  workspace_txt.value = "";
  let library_table = document.getElementById('library_table');
  library_table.innerHTML = "";
  let preset_div = document.getElementById('container_library_list')
  preset_div.innerHTML = "";
  preset_checkboxws_ = [];
  let repository_table = document.getElementById('repository_table');
  repository_table.innerHTML = "";
  update_target_table();

  if(rtc_param_.containerSettings.length == 0) {
    current_container_index_ = -1;
    update_enable(false);
    document.getElementById('add_target_btn').disabled = false;
  } else {
    if (0 <= current_container_index_) {
      let container_table = document.getElementById('target_table');
      if(rtc_param_.containerSettings.length -1 < current_container_index_) {
        current_container_index_ = current_container_index_ - 1;
      }
      select_target_table(container_table.rows[current_container_index_], false);
    }
  }
}

function update_library_table() {
  let library_table = document.getElementById('library_table');
  library_table.innerHTML = "";
  for (let index = 0; index < current_container_.libraries.length; index++) {
    let row = library_table.insertRow(-1);
    row.classList.add("result_row_lib");
    row.id = index;
    if(0 <= current_lib_index_) {
      if (current_lib_index_ == index) {
        row.classList.add('selected');
      }
    }

    let cell = row.insertCell(-1);
    cell.innerHTML = current_container_.libraries[index];
    row.onclick = function () {
      select_library_table(row, cell);
    };
  }
}

function add_library() {
  if(!current_container_) return;

  current_container_.libraries.push('new_lib');
  update_library_table();
}

function delete_library() {
  if(!current_container_) return;

  current_container_.libraries.splice(current_lib_index_, 1);
  if(current_container_.libraries.length <= current_lib_index_) {
    current_lib_index_ = -1;
  }
  update_library_table();
}

function select_library_table(row, cell) {
  if(!container_config_) return;
  if(cell.textContent.length == 0) return;

  const rows = document.querySelectorAll('.result_row_lib');
  rows.forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');

  current_lib_index_ = Number(row.id);

  const editIndex = Number(row.id);

  const originalText = cell.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.style.width = '99%';
  input.style.height = '100%';
  input.style.margin = 0;
  input.style.backgroundColor = 'var(--vscode-input-background)';
  input.style.color = 'var(--vscode-input-foreground)';
  input.style.border = 'none';
  input.style.outline = 'none';

  cell.textContent = '';
  cell.appendChild(input);
  input.focus();
  input.select();

  input.addEventListener('blur', () => {
    const newValue = input.value;
    if(newValue == null || newValue.length == 0) {
      return;
    }
    current_container_.libraries[editIndex] = newValue;
    cell.textContent = newValue;
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      input.blur(); // Enterで確定
    } else if (e.key === 'Escape') {
      cell.textContent = originalText; // Escでキャンセル
    }
  });
}

function preset_checked(source, checked) {
  if(!container_config_) return;

  let middleware_combo = document.getElementById('container_middleware')
  const selected = middleware_combo.options[middleware_combo.selectedIndex].text;
  const middleware = container_config_['middlewares'].find(item => item.name === selected);

  if(checked) {
    if(current_container_.preSets.includes(source)==false) {
      current_container_.preSets.push(source);
    }
  } else {
    const index = current_container_.preSets.indexOf(source);
    if (index !== -1) {
      current_container_.preSets.splice(index, 1);
    }
  }

  const presets = middleware['functional_presets'];
  const elems = presets[source];
  for(let each of elems) {
    if(current_container_.libraries.includes(each)) {
      if(checked == false) {
        const index = current_container_.libraries.indexOf(each);
        if (index !== -1) {
          current_container_.libraries.splice(index, 1);
        }
      }
    } else {
      current_container_.libraries.push(each);
    }
  }
  update_library_table();
}

//////////
function update_repository_table() {
  let repository_table = document.getElementById('repository_table');
  repository_table.innerHTML = "";
  for (let index = 0; index < current_container_.repositories.length; index++) {
    let row = repository_table.insertRow(-1);
    row.classList.add("result_row_repository");
    row.id = index;
    if(0 <= current_repository_index_) {
      if (current_repository_index_ == index) {
        row.classList.add('selected');
      }
    }
    row.onclick = function () {
      select_repository_table(row);
    };

    Object.setPrototypeOf(current_container_.repositories[index], RepositoryParam.prototype);
    let cellURL = row.insertCell(-1);
    cellURL.innerHTML = current_container_.repositories[index].URL;
    let cellBranch = row.insertCell(-1);
    cellBranch.innerHTML = current_container_.repositories[index].Branch;
  }
}

function select_repository_table(row) {
  if(!container_config_) return;
  const rows = document.querySelectorAll('.result_row_repository');
  rows.forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');

  current_repository_index_ = Number(row.id);
}

function add_repository() {
  if(!current_container_) return;

  let url_text = document.getElementById('container_url');
  if(url_text.value==null || url_text.value.trim().length==0) {
    vscode.postMessage({command: 'showMessage',
                        param: translations["container.repository.URL_NOT_SELECTED"],
                        type: 'warning'});
    return;
  }
  let branch_text = document.getElementById('container_branch');
  if(branch_text.value==null || branch_text.value.trim().length==0) {
    vscode.postMessage({command: 'showMessage',
                        param: translations["container.repository.BRANCH_NOT_SELECTED"],
                        type: 'warning'});
    return;
  }

  let rep = new RepositoryParam();
  rep.URL = url_text.value.trim();
  rep.Branch = branch_text.value.trim();
  current_container_.repositories.push(rep);

  update_repository_table();

  url_text.value = "";
  branch_text.value = "";
}

function delete_repository() {
  if(!current_container_) return;

  current_container_.repositories.splice(current_repository_index_, 1);
  if(current_container_.repositories.length <= current_repository_index_) {
    current_repository_index_ = -1;
  }
  update_repository_table();
}
//////////
function loadConfigClick() {
  document.getElementById("fileInput").click();
}

function loadConfig() {
  const input = document.getElementById("fileInput");
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      settings_['container_config'] = reader.result;
      load_container_info(settings_);
      vscode.postMessage({
        command: 'updateContainerConfig',
        settings: settings_
      });
    };
    reader.readAsText(file);
  });
}

function remove_all_items(source) {
  while (source.options.length > 0) {
    source.remove(0);
  }
}

function conv_lang_container(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("container."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
