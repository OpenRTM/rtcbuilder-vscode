let service_defs_;

let selectedNode = null;

function load_serviceport() {
  getCORBAService();
  for(const sp of rtc_param_.serviceports) {
    selectedNode = add_service_port_node(sp, true);
    for(const si of sp.serviceinterfaces) {
      add_service_interface_node(si);
    }
    selectedNode = null;
  }
}

function getCORBAService() {
  const project_path = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'getCORBAService',
    param: project_path
  });
}

function updateServiceDef(pathes, services) {
  service_defs_ = services;
  let ifCombo = document.getElementById('service_if_type');
  ifCombo.innerHTML = '';
  document.getElementById('service_if_idl_file').value = '';
  for(const each of services) {
    const option = document.createElement('option');
    option.value = each.name;
    option.text = each.name;
    ifCombo.appendChild(option);
  }
  service_if_combo_changed();
}

function service_if_combo_changed() {
  let ifCombo = document.getElementById('service_if_type');
  let selected = ifCombo.selectedIndex;
  document.getElementById('service_if_idl_file').value = service_defs_[selected].idlDispFile;
}

function direction_combo_changed() {
  if (!selectedNode || isInterfaceNode(selectedNode) === false) return;
  const iconElem = selectedNode.querySelector('img.if-node-icon');
  if (!iconElem) return;

  let dirCombo = document.getElementById('service_if_direction');
  let selected = dirCombo.selectedIndex;

  if (selected === 0) {
    iconElem.src = PROV_ICON_URI;
  } else if (selected === 1) {
    iconElem.src = REQ_ICON_URI;
  }
}
/////
function isInterfaceNode(labelElement) {
  // 親LIの親ULの親LI が存在すれば「子ノード」（＝ネストされてる）
  const li = labelElement.closest('li');
  const parentUl = li?.parentElement;
  const parentLi = parentUl?.closest('li');
  return !!parentLi;
}

function selectNode(el) {
  if (selectedNode) {
    selectedNode.classList.remove('selected');
  }
  update_serviceinfo(el);
  selectedNode = el;
  selectedNode.classList.add('selected');
  // console.log(selectedNode.parentElement.parentElement);
  const portTable = document.getElementById('service_port_area');
  const portDocTable = document.getElementById('service_port_doc_area');
  const interfaceTable = document.getElementById('service_interface_area');
  const interfaceDocTable = document.getElementById('service_interface_doc_area');
  const servicePortBtn = document.getElementById('service_port_btn');
  const serviceInterfaceBtn = document.getElementById('service_interface_btn');
  if(isInterfaceNode(el)) {
    serviceInterfaceBtn.disabled = true;
    portTable.style.display = 'none';
    portDocTable.style.display = 'none';
    interfaceTable.style.display = 'table';
    interfaceDocTable.style.display = 'table';
  } else {
    serviceInterfaceBtn.disabled = false;
    interfaceTable.style.display = 'none';
    interfaceDocTable.style.display = 'none';
    portTable.style.display = 'table';
    portDocTable.style.display = 'table';
  }
  // let elem = selectedNode._elem;
  // console.log('Selected Node ID:' + elem.name);
}

function add_service_port() {
  let sp = new ServicePortParam();
  sp.name = settings_.serviceport_name;
  rtc_param_.serviceports.push(sp);

  add_service_port_node(sp);
}

function add_service_port_node(source, isOpen = false) {
  const tree = document.getElementById('tree-root');
  const rootLi = document.createElement('li');

  const label = document.createElement('span');
  label.className = 'collapsible tree-label';
  label._elem = source;

  const toggleIcon = document.createElement('span');
  toggleIcon.textContent = isOpen ? '▼' : '▶';
  toggleIcon.className = 'toggle-icon';

  const icon = document.createElement('img');
  icon.src = PORT_ICON_URI;
  icon.className = 'node-icon';

  const text = document.createElement('span');
  text.className = 'port-name';
  text.textContent = source.name;

  label.appendChild(toggleIcon);
  label.appendChild(icon);
  label.appendChild(text);

  label.onclick = function(e) {
    e.stopPropagation();
    selectNode(label);
  };
  toggleIcon.onclick = function(e) {
    e.stopPropagation();
    toggleNested(label);
    selectNode(label);
  };

  const childUl = document.createElement('ul');
  childUl.className = 'nested';

  rootLi.appendChild(label);
  rootLi.appendChild(childUl);
  tree.appendChild(rootLi);

  return label;
}

function toggleNested(el) {
  const nested = el.nextElementSibling;
  if (nested) {
    nested.classList.toggle('active');
    const toggleIcon = el.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.textContent = nested.classList.contains('active') ? '▼' : '▶';
    }
  }
}

function add_service_interface() {
  if (!selectedNode) return;

  let sp = selectedNode._elem;
  let si = new ServicePortInterfaceParam();
  si.direction = 'Provided';
  si.name = settings_.serviceif_name;
  si.instancename = settings_.serviceif_instance;
  si.varname = settings_.serviceif_var_name;
  // si.parent = sp;
  sp.serviceinterfaces.push(si);

  add_service_interface_node(si);
}

function add_service_interface_node(source) {
  const parentLi = selectedNode.closest('li');
  let nestedUl = parentLi.querySelector('ul');

  // ulがなければ作成
  if (!nestedUl) {
    nestedUl = document.createElement('ul');
    nestedUl.className = 'nested active'; // 自動で開く
    parentLi.appendChild(nestedUl);
  } else {
    nestedUl.classList.add('active'); // 開いた状態にする
  }

  // 子ノード作成
  const childLi = document.createElement('li');
  const childLabel = document.createElement('span');
  childLabel.className = 'tree-label';
  childLabel._elem = source;

  const icon = document.createElement('img');
  console.log(source.direction);
  if(source.direction === "Provided") {
    icon.src = PROV_ICON_URI;
  } else if(source.direction === "Required") {
    icon.src = REQ_ICON_URI;
  }
  icon.className = 'if-node-icon';

  const text = document.createElement('span');
  text.className = 'if-name';
  text.textContent = source.name;

  childLabel.appendChild(icon);
  childLabel.appendChild(text);

  childLabel.onclick = function(e) {
    e.stopPropagation();
    selectNode(this);
  };

  childLi.appendChild(childLabel);
  nestedUl.appendChild(childLi);
}

function delete_service() {
  if (!selectedNode) return;

  if(isInterfaceNode(selectedNode)) {
      let target_interface = selectedNode._elem;
      let target_port = null;
      for(const sp of rtc_param_.serviceports) {
        if(sp.serviceinterfaces.includes(target_interface)) {
          target_port = sp;
          break;
        }
      }

      if(target_port) {
        const index = target_port.serviceinterfaces.indexOf(target_interface);
        if (index !== -1) {
          target_port.serviceinterfaces.splice(index, 1);
        }
      }
  } else {
      let target_port = selectedNode._elem;
      const index = rtc_param_.serviceports.indexOf(target_port);
      if (index !== -1) {
        rtc_param_.serviceports.splice(index, 1);
      }
  }

  const li = selectedNode.closest('li');
  if (li) {
    li.remove();
    selectedNode = null;
  }
}

function update_serviceinfo(source) {
  store_serviceinfo();
  if(isInterfaceNode(source)) {
    let target_interface = source._elem;
    document.getElementById('service_if_name').value = target_interface.name;
    if(target_interface.direction) {
      document.getElementById('service_if_direction').value = target_interface.direction;
    } else {
      document.getElementById('service_if_direction').selectedIndex = 0;
    }
    document.getElementById('service_if_inst').value = target_interface.instancename;
    document.getElementById('service_if_var').value = target_interface.varname;
    if(target_interface.interfacetype) {
      document.getElementById('service_if_type').value = target_interface.interfacetype;
      document.getElementById('service_if_idl_file').value = target_interface.idlDispfile;
    } else {
      document.getElementById('service_if_type').selectedIndex = 0;
    }

    document.getElementById('service_if_doc_abst').value = getDisplayDocText(target_interface.doc_description);
    document.getElementById('service_if_doc_arg').value = getDisplayDocText(target_interface.doc_argument);
    document.getElementById('service_if_doc_ret').value = getDisplayDocText(target_interface.doc_return);
    document.getElementById('service_if_doc_exception').value = getDisplayDocText(target_interface.doc_exception);
    document.getElementById('service_if_doc_pre_cond').value = getDisplayDocText(target_interface.doc_pre_condition);
    document.getElementById('service_if_doc_post_cond').value = getDisplayDocText(target_interface.doc_post_condition);

  } else {
    let target_port = source._elem;
    document.getElementById('service_port_name').value = target_port.name;

    document.getElementById('service_port_doc_abst').value = getDisplayDocText(target_port.doc_description);
    document.getElementById('service_port_doc_if_abst').value = getDisplayDocText(target_port.doc_if_description);
  }
}

function store_serviceinfo() {
  if(selectedNode) {
    if(isInterfaceNode(selectedNode)) {
      let target_interface = selectedNode._elem;
      target_interface.name = document.getElementById('service_if_name').value;
      target_interface.direction = document.getElementById('service_if_direction').value;
      target_interface.instancename = document.getElementById('service_if_inst').value;
      target_interface.varname = document.getElementById('service_if_var').value;
      target_interface.interfacetype = document.getElementById('service_if_type').value;
      target_interface.idlDispfile = document.getElementById('service_if_idl_file').value;

      let ifCombo = document.getElementById('service_if_type');
      let selected = ifCombo.selectedIndex;
      // console.log(selected);
      if(0<=selectNode) {
        target_interface.idlfile = service_defs_[selected].idlFile;
      }
      /////
      target_interface.doc_description = getDocText(document.getElementById('service_if_doc_abst').value);
      target_interface.doc_argument = getDocText(document.getElementById('service_if_doc_arg').value);
      target_interface.doc_return = getDocText(document.getElementById('service_if_doc_ret').value);
      target_interface.doc_exception = getDocText(document.getElementById('service_if_doc_exception').value);
      target_interface.doc_pre_condition = getDocText(document.getElementById('service_if_doc_pre_cond').value);
      target_interface.doc_post_condition = getDocText(document.getElementById('service_if_doc_post_cond').value);

      const ifText = selectedNode.querySelector('.if-name');
      ifText.textContent = target_interface.name;

    } else {
      let target_port = selectedNode._elem;
      target_port.name = document.getElementById('service_port_name').value;

      target_port.doc_description = getDocText(document.getElementById('service_port_doc_abst').value);
      target_port.doc_if_description = getDocText(document.getElementById('service_port_doc_if_abst').value);

      const portText = selectedNode.querySelector('.port-name');
      portText.textContent = target_port.name;
    }
  }
}

function conv_lang_serviceport(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("serviceport."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
