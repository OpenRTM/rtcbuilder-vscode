// データポートタブ
class DataParam {
    constructor({ typeName = '', dispPath='', idlPath = ''} = {}) {
        this.typeName = typeName;
        this.dispPath = dispPath;
        this.idlPath = idlPath;
    }
}

let data_types_;
let current_inport_index_ = -1;
let current_outport_index_ = -1;
let current_port_;
let typeList_ = [];

function load_dataport(isParse = false) {
  let currentRow = null;
  let currentCell = null;
  let currentDirection = -1;

  if(isParse) {
    getCORBADataType();
  }
  
  let inport_table = document.getElementById('inport_table');
  inport_table.innerHTML = "";
  for (let index = 0; index < rtc_param_.inports.length; index++) {
    let row = inport_table.insertRow(-1);
    row.classList.add("result_row");
    row.id = index;
    if (0 <= current_inport_index_) {
      if (current_inport_index_ == index) {
        row.classList.add('selected');
      }
    }
    let cell = row.insertCell(-1);
    if (current_inport_index_ == index) {
      currentRow = row;
      currentCell = cell;
      currentDirection = 1;
    }
    row.onclick = function () {
      select_table_cell(row, cell, 1);
    };
    cell.innerHTML = rtc_param_.inports[index].name;
  }
  //
  let outport_table = document.getElementById('outport_table');
  outport_table.innerHTML = "";
  for (let index = 0; index < rtc_param_.outports.length; index++) {
    let row = outport_table.insertRow(-1);
    row.classList.add("result_row");
    row.id = index;
    if (0 <= current_outport_index_) {
      if (current_outport_index_ == index) {
        row.classList.add('selected');
      }
    }
    let cell = row.insertCell(-1);
    if (current_outport_index_ == index) {
      currentRow = row;
      currentCell = cell;
      currentDirection = 2;
    }
    row.onclick = function () {
      select_table_cell(row, cell, 2);
    };
    cell.innerHTML = rtc_param_.outports[index].name;
  }
  current_port_ = null;
  if(currentRow!=null && currentCell!=null) {
      select_table_cell(currentRow, currentCell, currentDirection);
  }
  /////
  const input = document.getElementById('dataport_type');
  const options = document.getElementById('dataport_options');
  const items = options.getElementsByTagName('li');
  
  for(const each of typeList_) {
    const li = document.createElement('li');
    li.textContent = each.typeName;

    li.addEventListener('click', () => {
      document.getElementById('dataport_type').value = each.typeName;
      options.classList.add('hidden');
      dataport_combo_changed();
    });
    options.appendChild(li);
  }

  input.addEventListener('focus', () => {
    options.classList.remove('hidden');
  });

  input.addEventListener('input', () => {
    const filter = input.value.toLowerCase();

    for (let item of items) {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(filter) ? '' : 'none';
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => options.classList.add('hidden'), 150); // 選択のクリックを拾う余裕を持たせる
  });
}

function add_port(inout) {
  let dp = new DataPortParam();
  // console.log(settings_);
  dp.name = settings_.dataport_name;
  dp.type = settings_.dataport_type;
  dp.varname = settings_.dataport_var_name;
  if (inout == 1) {
    rtc_param_.inports.push(dp);
    current_inport_index_ = rtc_param_.inports.length - 1;
  } else if (inout == 2) {
    rtc_param_.outports.push(dp);
    current_outport_index_ = rtc_param_.inports.length - 1;
  }
  load_dataport();
  update_detail_dataport(dp);
}

function delete_port(inout) {
  if (inout == 1) {
    rtc_param_.inports.splice(current_inport_index_, 1);
  } else if (inout == 2) {
    rtc_param_.outports.splice(current_inport_index_, 1);
  }
  load_dataport();
}

function select_table_cell(row, cell, inout) {
  if(cell.textContent.length == 0) return;

  const rows = document.querySelectorAll('.result_row');
  rows.forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');

  // console.log('select_table_cell');
  let target_port;
  if (inout == 1) {
    current_inport_index_ = Number(row.id);
    current_outport_index_ = -1;
    target_port = rtc_param_.inports[current_inport_index_];
  } else if (inout == 2) {
    current_outport_index_ = Number(row.id);
    current_inport_index_ = -1;
    target_port = rtc_param_.outports[current_outport_index_];
  }
  update_detail_dataport(target_port);
  //
  const editIndex = Number(row.id);
  const inoutIndex = inout;

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
    if (inoutIndex == 1) {
      rtc_param_.inports[editIndex].name = newValue;
    } else if (inoutIndex == 2) {
      rtc_param_.outports[editIndex].name = newValue;
    }
    cell.textContent = newValue;
    if (inoutIndex == 1) {
      update_detail_dataport(rtc_param_.inports[editIndex]);
    } else if (inoutIndex == 2) {
      update_detail_dataport(rtc_param_.outports[editIndex]);
    }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      input.blur(); // Enterで確定
    } else if (e.key === 'Escape') {
      cell.textContent = originalText; // Escでキャンセル
    }
  });
}

function update_detail_dataport(port) {
  if(current_port_) {
    store_dataport();
  }

  document.getElementById('dataport_name').value = port.name;
  document.getElementById('dataport_type').value = port.type;
  document.getElementById('dataport_idl_file').value = port.dispIdlFile;
  document.getElementById('dataport_var_name').value = port.varname;

  document.getElementById('dataport_doc_abst').value = getDisplayDocText(port.doc_description);
  document.getElementById('dataport_doc_detail').value = getDisplayDocText(port.doc_semantics);
  document.getElementById('dataport_doc_type').value = port.doc_type;
  document.getElementById('dataport_doc_num').value = port.doc_num;
  document.getElementById('dataport_doc_unit').value = port.doc_unit;
  document.getElementById('dataport_doc_freq').value = getDisplayDocText(port.doc_occerrence);
  document.getElementById('dataport_doc_ope').value = getDisplayDocText(port.doc_operation);

  current_port_ = port;
  // console.log(current_port_);
}

function store_dataport() {
  if(current_port_) {
    current_port_.type = document.getElementById('dataport_type').value;
    current_port_.dispIdlFile = document.getElementById('dataport_idl_file').value;
    current_port_.varname = document.getElementById('dataport_var_name').value;

    let selected = document.getElementById('dataport_type').selectedIndex;
    if( 0 <= selected) {
      current_port_.idlFile = typeList_[selected].idlPath;
    }

    current_port_.doc_description = getDocText(document.getElementById('dataport_doc_abst').value);
    current_port_.doc_semantics = getDocText(document.getElementById('dataport_doc_detail').value);
    current_port_.doc_type = document.getElementById('dataport_doc_type').value;
    current_port_.doc_num = document.getElementById('dataport_doc_num').value;
    current_port_.doc_unit = document.getElementById('dataport_doc_unit').value;
    current_port_.doc_occerrence = getDocText(document.getElementById('dataport_doc_freq').value);
    current_port_.doc_operation = getDocText(document.getElementById('dataport_doc_ope').value);
  }
}

function getCORBADataType() {
  const project_path = document.getElementById('project-name').textContent;
  vscode.postMessage({
    command: 'getCORBADataType',
    param: project_path
  });
}

function updateDataType(pathes, types) {
  rtc_param_.idlSearchPathList = pathes;
  // console.log(types);

  typeList_.length = 0;
  let typeCombo = document.getElementById('dataport_type');
  typeCombo.innerHTML = '';
  document.getElementById('dataport_idl_file').value = '';
  for(const each of types) {
    for(const eachType of each.definedTypes) {
      let dataType = new DataParam({
                          typeName: eachType,
                          dispPath: each.dispPath,
                          idlPath: each.fullPath });
      typeList_.push(dataType);
    }
  }
  typeList_.sort((a, b) => a.typeName.localeCompare(b.typeName));
  // 
  const options = document.getElementById('dataport_options');

  for(const each of typeList_) {
    const li = document.createElement('li');
    li.textContent = each.typeName;

    li.addEventListener('click', () => {
      document.getElementById('dataport_type').value = each.typeName;
      options.classList.add('hidden');
      dataport_combo_changed();
    });
    options.appendChild(li);
  }
  dataport_combo_changed();
}

function dataport_combo_changed() {
  let typeCombo = document.getElementById('dataport_type') ;
  const selected = typeList_.findIndex(type => type.typeName === typeCombo.value);
  // console.log(selected);
  if(0<=selected) {
    document.getElementById('dataport_idl_file').value = typeList_[selected].dispPath;
  }
}

function conv_lang_dataport(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("dataport."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
