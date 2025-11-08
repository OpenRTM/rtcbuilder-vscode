// アクティビティタブ
const observer = new MutationObserver(() => {
  const table = document.getElementById('activity_table');
  if (table) {
    setupTableClickEvents(table);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

function setupTableClickEvents(table) {
  function selectActivity(cell) {
    setPrevActivityInfo();

    cell.classList.add('highlight_activity');
    const selectedText = cell.textContent.trim();

    let target_act = rtc_param_.actions[selectedText];
    document.getElementById('activity_name').value = selectedText;

    let act_radio = document.getElementById('activity_name');
    const radios = document.querySelectorAll('input[name="activity_enable"]');
    const valueToCheck = target_act.implemented ? 'ON' : 'OFF';
    radios.forEach(radio => {
      radio.checked = (radio.value === valueToCheck);
      if (selectedText == 'onInitialize') {
        radio.disabled = true;
      } else {
        radio.disabled = false;
      }
    });

    document.getElementById('activity_desc').value = getDisplayDocText(target_act.overview);
    document.getElementById('activity_pre_cond').value = getDisplayDocText(target_act.pre_condition);
    document.getElementById('activity_post_cond').value = getDisplayDocText(target_act.post_condition);

    if (target_act.implemented) {
      cell.classList.add('activated_activity');
    } else {
      cell.classList.remove('activated_activity');
    }
  }

  const selectableCells = table.querySelectorAll('td.selectable');
  if (0 < selectableCells.length) {
    selectActivity(selectableCells[0]);
  }

  table.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() === 'td') {
      selectActivity(event.target);
    }
  });
}

function setPrevActivityInfo() {
  const table = document.getElementById('activity_table');
  if (!table) return;

  const prev = table.querySelector('td.highlight_activity');
  if (!prev) return;

  prev.classList.remove('highlight_activity');
  const prevText = prev.textContent.trim();

  let prev_act = rtc_param_.actions[prevText];
  let on_radio = document.getElementById('radio_on');
  prev_act.implemented = on_radio.checked;
  prev_act.overview = getDocText(document.getElementById('activity_desc').value);
  prev_act.pre_condition = getDocText(document.getElementById('activity_pre_cond').value);
  prev_act.post_condition = getDocText(document.getElementById('activity_post_cond').value);
}

function change_activated() {
  const table = document.getElementById('activity_table');
  if (!table) return;

  const cell = table.querySelector('td.highlight_activity');
  if (!cell) return;

  let on_radio = document.getElementById('radio_on');
  if (on_radio.checked) {
    cell.classList.add('activated_activity');
  } else {
    cell.classList.remove('activated_activity');
  }
}

function load_activity() {
  const table = document.getElementById('activity_table');
  const selectableCells = table.querySelectorAll('td.selectable');
  for(const cell of selectableCells) {
    const selectedText = cell.textContent.trim();
    let target_act = rtc_param_.actions[selectedText];
    if (target_act.implemented) {
      cell.classList.add('activated_activity');
    } else {
      cell.classList.remove('activated_activity');
    }
  }
}

function conv_lang_activity(translations) {
  const activityEntries = Object.entries(translations).filter(([key, _]) => key.startsWith("activity."));
  for (const [key, value] of activityEntries) {
    const targetTag = document.getElementById(key);
    if(targetTag == undefined) continue;

    targetTag.innerHTML = translations[key];
  }
}
