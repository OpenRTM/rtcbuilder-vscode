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

function load_basic_info() {
  const container = document.getElementById("language-row");
  container.innerHTML = "";

  language_mames_.forEach(lang => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "group_language";
    input.id = lang;
    input.value = lang;
    input.style.marginLeft = "5px";

    const label = document.createElement("label");
    label.htmlFor = lang;
    label.textContent = lang;
    label.style.marginLeft = "2px";

    container.appendChild(input);
    container.appendChild(label);
  });
  /////
  document.getElementById('basic_name').value = rtc_param_.name;
  document.getElementById('basic_description').value = rtc_param_.description;
  document.getElementById('basic_version').value = rtc_param_.version;
  document.getElementById('basic_vendor').value = rtc_param_.vendor;
  document.getElementById('basic_category').value = rtc_param_.category;
  document.getElementById('basic_comp_type').value = rtc_param_.componentType;
  document.getElementById('basic_activity_type').value = rtc_param_.activityType;
  document.getElementById('basic_max_inst').value = rtc_param_.maxInstance;
  document.getElementById('basic_exec_type').value = rtc_param_.executionType;
  document.getElementById('basic_exec_period').value = rtc_param_.executionRate;
  document.getElementById('basic_detail').value = getDisplayDocText(rtc_param_.abstractDesc);
  document.getElementById('basic_rtc_type').value = rtc_param_.rtcType;

  const radio = document.querySelector(`input[name="group_language"][value="${rtc_param_.language}"]`);
  if (radio) radio.checked = true;
  /////
  const input = document.getElementById('basic_category');
  const options = document.getElementById('category-options');
  const items = options.getElementsByTagName('li');
  
  if(basic_categories_.includes(rtc_param_.category.trim()) == false) {
    basic_categories_.push(rtc_param_.category.trim());
  }

  createCategoryCombo();

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
      if(basic_categories_.includes(value.trim()) == false) {
        basic_categories_.push(value.trim());
        createCategoryCombo();
      }
    }
  });
}

function createCategoryCombo() {
  const options = document.getElementById('category-options');
  options.innerHTML = '';

  basic_categories_.forEach(type => {
    const li = document.createElement('li');
    li.textContent = type;

    li.addEventListener('click', () => {
      document.getElementById('basic_category').value = type;
      options.classList.add('hidden');
    });
    options.appendChild(li);
  });
}

function store_basic_info() {
  rtc_param_.name = document.getElementById('basic_name').value;
  rtc_param_.description = document.getElementById('basic_description').value;
  rtc_param_.version = document.getElementById('basic_version').value;
  rtc_param_.vendor = document.getElementById('basic_vendor').value;
  rtc_param_.category = document.getElementById('basic_category').value;
  rtc_param_.componentType = document.getElementById('basic_comp_type').value;
  rtc_param_.activityType = document.getElementById('basic_activity_type').value;
  rtc_param_.maxInstance = Number(document.getElementById('basic_max_inst').value);
  rtc_param_.executionType = document.getElementById('basic_exec_type').value;
  rtc_param_.executionRate = Number(document.getElementById('basic_exec_period').value);
  rtc_param_.abstractDesc = getDocText(document.getElementById('basic_detail').value);
  rtc_param_.rtcType = document.getElementById('basic_rtc_type').value;

  rtc_param_.language = document.querySelector('input[name="group_language"]:checked')?.value;
}

function load_doc_info() {
  document.getElementById('doc_desc').value = getDisplayDocText(rtc_param_.doc_description);
  document.getElementById('doc_inout').value = getDisplayDocText(rtc_param_.doc_in_out);
  document.getElementById('doc_algorithm').value = getDisplayDocText(rtc_param_.doc_algorithm);
  document.getElementById('doc_ref').value = getDisplayDocText(rtc_param_.doc_reference);
  document.getElementById('doc_author').value = getDisplayDocText(rtc_param_.doc_creator);
  document.getElementById('doc_licanse').value = getDisplayDocText(rtc_param_.doc_license);
}

function store_doc_info() {
  rtc_param_.doc_description = getDocText(document.getElementById('doc_desc').value);
  rtc_param_.doc_in_out = getDocText(document.getElementById('doc_inout').value);
  rtc_param_.doc_algorithm = getDocText(document.getElementById('doc_algorithm').value);
  rtc_param_.doc_reference = getDocText(document.getElementById('doc_ref').value);
  rtc_param_.doc_creator = getDocText(document.getElementById('doc_author').value);
  rtc_param_.doc_license = getDocText(document.getElementById('doc_licanse').value);
}

function conv_lang_basic(translations) {
  const basicEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("basic."));
  for (const [key, value] of basicEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}