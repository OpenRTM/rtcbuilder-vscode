function selectProject() {
  const project = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'selectProject',
    project: project
  });
}

function setProjectLocation(project) {
  // console.log(project);
  document.getElementById('project-name').textContent = project;

  vscode.postMessage({
    command: 'initializeProject',
    project_dir: project
  });
}

function exportISOProfile() {
  const project_dir = document.getElementById('project-name').textContent;
  store_profile(prev_tab);
  vscode.postMessage({
    command: 'exportISOProfile',
    param: rtc_param_,
    project_dir: project_dir
  });
}

function importProfile() {
  const project_dir = document.getElementById('project-name').textContent;
  const textarea = document.getElementById("import_file");
  const file_name = textarea.value;
  let type = '';
  if(document.getElementById('import_rtc').checked) {
    type = 'RTC'
  } else if(document.getElementById('import_iso').checked) {
    type = 'ISO'
  }

  if(type.length == 0) {
    vscode.postMessage({command: 'showMessage',
                        param: translations["script.import.TARGET_NOT_SELECTED"],
                        type: 'warning'});
    return;
  }
  if(file_name.length == 0) {
    vscode.postMessage({command: 'showMessage',
                        param: translations["script.import.FILE_NOT_SELECTED"],
                        type: 'warning'});
    return;
  }

  vscode.postMessage({
    command: 'importProfile',
    project_dir: project_dir,
    type: type,
    file_name: file_name,
  });
}

function exportProfile() {
  const selected_rtc = document.getElementById('export_rtc').checked;
  const text_rtc = document.getElementById("export_file_rtc");
  const file_name_rtc = text_rtc.value;

  const selected_iso = document.getElementById('export_iso').checked;
  const text_iso = document.getElementById("export_file_iso");
  const file_name_iso = text_iso.value;

  if(!selected_rtc && !selected_iso) {
    vscode.postMessage({command: 'showMessage',
                        param: translations["script.export.TARGET_NOT_SELECTED"],
                        type: 'warning'});
    return;
  }

  if(selected_rtc) {
    if(file_name_rtc.length == 0) {
      vscode.postMessage({command: 'showMessage',
                          param: translations["script.export.RTC_FILE_NOT_SELECTED"],
                          type: 'warning'});
      return;
    }
  }

  if(selected_iso) {
    if(file_name_iso.length == 0) {
      vscode.postMessage({command: 'showMessage',
                          param: translations["script.export.ISO_FILE_NOT_SELECTED"],
                          type: 'warning'});
      return;
    }
  }

  store_profile(prev_tab);
  vscode.postMessage({
    command: 'exportProfile',
    param: rtc_param_,
    selected_rtc: selected_rtc,
    file_name_rtc: file_name_rtc,
    selected_iso: selected_iso,
    file_name_iso: file_name_iso
  });
}

function testProfile() {
  const project_dir = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'testProfile',
    project_dir: project_dir
  });
}



function generateCode() {
  store_profile(prev_tab);
  ///
  Object.setPrototypeOf(rtc_param_, RtcParam.prototype);
  {
    const { ret, msg } = rtc_param_.validateBasicInfo();
    if(!ret) {
      vscode.postMessage({command: 'showMessage', param: msg, type: 'warning'});
      return;
    }
  }
  {
    const { ret, msg } = rtc_param_.validateDataPortInfo();
    if(!ret) {
      vscode.postMessage({command: 'showMessage', param: msg, type: 'warning'});
      loadTab('dataport.html');
      tabs.forEach(t => t.classList.remove('active'));
      tabs[2].classList.add('active');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
  }
  {
    const { ret, msg } = rtc_param_.validateServicePortInfo();
    if(!ret) {
      vscode.postMessage({command: 'showMessage', param: msg, type: 'warning'});
      loadTab('serviceport.html');
      tabs.forEach(t => t.classList.remove('active'));
      tabs[3].classList.add('active');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
  }
  {
    const { ret, msg } = rtc_param_.validateConfigurationInfo();
    if(!ret) {
      vscode.postMessage({command: 'showMessage', param: msg, type: 'warning'});
      loadTab('configuration.html');
      tabs.forEach(t => t.classList.remove('active'));
      tabs[4].classList.add('active');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
  }
  {
    const { ret, msg } = rtc_param_.validateContainerInfo();
    if(!ret) {
      vscode.postMessage({command: 'showMessage', param: msg, type: 'warning'});
      loadTab('container.html');
      tabs.forEach(t => t.classList.remove('active'));
      tabs[4].classList.add('active');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
  }

  const project = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'generateCode',
    param: rtc_param_,
    project_dir: project
  });
}

function clearBkFiles() {
  const project = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'confirmBkClear',
    project_dir: project
  });
}

function openSettings() {
  store_profile(prev_tab);
  const project = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'saveProfile',
    param: rtc_param_,
    project_dir: project
  });
  vscode.postMessage({
    command: 'openSettings',
  });
}

function store_profile(target) {
  // console.log('store_profile:' + target);
  switch (target) {
    case 'basic.html':
      store_basic_info();
      break;
    case 'activity.html':
      setPrevActivityInfo();
      break;
    case 'dataport.html':
      store_dataport();
      break;
    case 'serviceport.html':
      store_serviceinfo();
      break;
    case 'configuration.html':
      store_configuration();
      break;
    case 'document.html':
      store_doc_info();
      break;
    case 'container.html':
      store_container_info();
      break;
  }
}

function load_profile(target) {
  // console.log('load_profile:' + target);
  switch (target) {
    case 'basic.html':
      conv_lang_basic(window.translations)
      load_basic_info();
      break;
    case 'activity.html':
      conv_lang_activity(window.translations)
      load_activity();
      break;
    case 'dataport.html':
      conv_lang_dataport(window.translations)
      load_dataport(true);
      break;
    case 'serviceport.html':
      conv_lang_serviceport(window.translations)
      load_serviceport(true);
      break;
    case 'configuration.html':
      conv_lang_config(window.translations)
      load_configuration();
      break;
    case 'document.html':
      conv_lang_doc(window.translations)
      load_doc_info();
      break;
    case 'container.html':
      conv_lang_container(window.translations)
      load_container_info(settings_);
      break;
    case 'rtc_xml.html':
      conv_lang_rtcxml(window.translations)
      load_rtc_xml();
      break;
  }
}

function updateLineNumbers() {
  const textarea = document.getElementById("rtc_text_area");
  const lineNumbers = document.getElementById("lineNumbers");

  const lines = textarea.value.split('\n').length + 50;
  lineNumbers.innerHTML = '';
  for (let i = 1; i <= lines; i++) {
    const lineElem = document.createElement('span');
    lineElem.textContent = i;
    lineNumbers.appendChild(lineElem);
  }
}

function load_rtc_xml() {
  const textarea = document.getElementById("rtc_text_area");
  const lineNumbers = document.getElementById("lineNumbers");

  textarea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });

  textarea.addEventListener('input', updateLineNumbers);
  updateLineNumbers();
  //
  vscode.postMessage({
    command: 'createXML',
    param: rtc_param_
  });
}

function updateXMLProfile(result) {
  const textarea = document.getElementById("rtc_text_area");
  textarea.textContent = result + '\n';
  updateLineNumbers();
}

function updateRefResult(source, file_name) {
  if(source === "import") {
    const textarea = document.getElementById("import_file");
    textarea.value = file_name;
  } else if(source === "export_rtc") {
    const textarea = document.getElementById("export_file_rtc");
    textarea.value = file_name;
  } else if(source === "export_iso") {
    const textarea = document.getElementById("export_file_iso");
    textarea.value = file_name;
  }
}

function update_rtc_xml() {
  const textarea = document.getElementById("rtc_text_area");
  let contents = textarea.value;
  const project_dir = document.getElementById('project-name').textContent;
  // console.log(contents);
  vscode.postMessage({
    command: 'validateProfile',
    contents: contents,
    project: project_dir
  });
}

function conv_lang_doc(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("document."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}

function conv_lang_rtcxml(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("rtcxml."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
