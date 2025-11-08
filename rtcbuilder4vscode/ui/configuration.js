// コンフィギュレーションタブ
let current_config_index_ = -1;
let current_config_;

function load_configuration() {
  let config_table = document.getElementById('config_table');
  config_table.innerHTML = "";
  for (let index = 0; index < rtc_param_.configParams.length; index++) {
    let row = config_table.insertRow(-1);
    row.classList.add("result_row");
    row.id = index;
    if (0 <= current_config_index_) {
      if (current_config_index_ == index) {
        row.classList.add('selected');
      }
    }
    let cell = row.insertCell(-1);
    row.onclick = function () {
      select_config_table_cell(row, cell);
    };
    Object.setPrototypeOf(rtc_param_.configParams[index], ConfigSetParam.prototype);
    cell.innerHTML = rtc_param_.configParams[index].name;

    const configType = rtc_param_.configParams[index].type;
    if(config_types_.includes(configType.trim()) == false) {
      config_types_.push(configType.trim());
    }
  }
  current_config_ = null;
  if (0 <= current_config_index_) {
    update_detail_config(rtc_param_.configParams[current_config_index_]);
  }
  config_widget_changed();
  /////
  const input = document.getElementById('config_type');
  const options = document.getElementById('type-options');
  const items = options.getElementsByTagName('li');
  
  createTypeCombo();

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
    setTimeout(() => options.classList.add('hidden'), 150);

    const value = input.value;
    if(value != null && 0<value.length) {
      if(config_types_.includes(value.trim()) == false) {
        config_types_.push(value.trim());
        createTypeCombo();
      }
    }
  });
}

function createTypeCombo() {
  const options = document.getElementById('type-options');
  options.innerHTML = '';

  config_types_.forEach(type => {
    const li = document.createElement('li');
    li.textContent = type;

    li.addEventListener('click', () => {
      document.getElementById('config_type').value = type;
      options.classList.add('hidden');
    });
    options.appendChild(li);
  });
}

function add_config() {
  let conf = new ConfigSetParam();
  conf.name = settings_.config_name + (rtc_param_.configParams.length + 1).toString();
  conf.type = settings_.config_type;
  conf.varname = settings_.config_var_name;
  conf.defaultValue = settings_.config_default;
  conf.constraint = settings_.config_constraint;
  conf.unit = settings_.config_unit;
  rtc_param_.configParams.push(conf);
  current_config_index_ = rtc_param_.configParams.length - 1;
  load_configuration();
}

function delete_config() {
  rtc_param_.configParams.splice(current_config_index_, 1);
  load_configuration();
}

function select_config_table_cell(row, cell) {
  if(cell.textContent.length == 0) return;

  const rows = document.querySelectorAll('.result_row');
  rows.forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');

  // console.log('select_table_cell');
  current_config_index_ = Number(row.id);
  let target_config = rtc_param_.configParams[current_config_index_];
  update_detail_config(target_config);
  //
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
  config_widget_changed();

  input.addEventListener('blur', () => {
    const newValue = input.value;
    if(newValue == null || newValue.length == 0) {
      return;
    }
    rtc_param_.configParams[editIndex].name = newValue;
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

function update_detail_config(config) {
  if(current_config_) {
    store_configuration();
  }
  // console.log(config);

  document.getElementById('config_name').value = config.name;
  document.getElementById('config_type').value = config.type;
  document.getElementById('config_default').value = config.defaultValue;
  document.getElementById('config_var_name').value = config.varname;
  document.getElementById('config_unit').value = config.unit;
  document.getElementById('config_constraint').value = config.constraint;
  document.getElementById('config_widget').value = config.getWidget();
  document.getElementById('config_step').value = config.getStep();

  document.getElementById('config_doc_name').value = config.doc_dataname;
  document.getElementById('config_doc_default').value = config.doc_default;
  document.getElementById('config_doc_abst').value = getDisplayDocText(config.doc_description);
  document.getElementById('config_doc_unit').value = config.doc_unit;
  document.getElementById('config_doc_range').value = config.doc_range;
  document.getElementById('config_doc_constraint').value = getDisplayDocText(config.doc_constraint);

  current_config_ = config;
}

function store_configuration() {
  if(current_config_) {
    current_config_.type = document.getElementById('config_type').value;
    current_config_.defaultValue = document.getElementById('config_default').value;
    current_config_.varname = document.getElementById('config_var_name').value;
    current_config_.unit = document.getElementById('config_unit').value;
    current_config_.constraint = document.getElementById('config_constraint').value;
    current_config_.setWidget(document.getElementById('config_widget').value);
    current_config_.setStep(document.getElementById('config_step').value);

    current_config_.doc_dataname = document.getElementById('config_doc_name').value;
    current_config_.doc_default = document.getElementById('config_doc_default').value;
    current_config_.doc_description = getDocText(document.getElementById('config_doc_abst').value);
    current_config_.doc_unit = document.getElementById('config_doc_unit').value;
    current_config_.doc_range = document.getElementById('config_doc_range').value;
    current_config_.doc_constraint = getDocText(document.getElementById('config_doc_constraint').value);
  }
}

function config_widget_changed() {
  let widgetCombo = document.getElementById('config_widget');
  let selected = widgetCombo.selectedIndex;
  let textStep = document.getElementById('config_step');
  if(selected == 1 || selected == 2 ) {
    textStep.disabled = false;
  } else {
    textStep.disabled = true;
  }
}

function conv_lang_config(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("config."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
