let compare_last_index_ = -1;

function showCodeTable() {
  let table = document.getElementById('compare_table');
  table.innerHTML = "";

  // console.log(table);

  for(let index=0; index<generatedCodes_.length; index++) {
    const target = generatedCodes_[index];
    if(target.mode === 'same' || target.mode === 'generated_new') continue;

    let row = table.insertRow(-1);
    row.classList.add('compare_row');
    row.id = index;
    row.onclick = function () {
        select_compare_table(row);
    };

    let cell = row.insertCell(-1);
    cell.innerHTML = '<td>' + target.name + '</td>';
    cell = row.insertCell(-1);
    cell.innerHTML = '<td>' + target.mode + '</td>';
  }
  let rows = document.querySelectorAll('.compare_row');
  if (0 < rows.length) {
    rows[0].classList.add('selected');
    select_compare_table(rows[0]);
  }
}

function select_compare_table(source) {
  const targetIndex = source.id;
  compare_last_index_ = targetIndex;
  // console.log(source);

  const rows = document.querySelectorAll('.compare_row');
  rows.forEach(r => r.classList.remove('selected'));
  source.classList.add('selected');

  const target = generatedCodes_[targetIndex];

  let btnMerge = document.getElementById('btnMerge');
  if(target.canMerge) {
    btnMerge.disabled = false;
  } else {
    btnMerge.disabled = true;
  }

  if(diffEditor_) {
    const originalModel = monaco.editor.createModel(target.original, "plaintext");
    const modifiedModel = monaco.editor.createModel(target.code, "plaintext");
    diffEditor_.setModel({ original: originalModel, modified: modifiedModel });

    setTimeout(() => {
      changes_ = diffEditor_.getLineChanges();
      // console.log(changes_);
      let btnPrev = document.getElementById('btnPrev');
      let btnNext = document.getElementById('btnNext');
      if(changes_.length <= 1) {
        btnPrev.disabled = true;
        btnNext.disabled = true;
      } else {
        btnPrev.disabled = false;
        btnNext.disabled = false;
      }
    }, 200);
  }
}

function selectOriginal() {
  changeMode('Original');
}

function selectMerge() {
  changeMode('Merge');
}

function selectGenerated() {
  changeMode('Generated');
}

function changeMode(mode) {
  const target = generatedCodes_[compare_last_index_];
  target.mode = mode;

  const row = document.getElementById(compare_last_index_);
  if(row) {
    row.cells[1].innerText = mode;
  }
}

function cancelCompare() {
  vscode.postMessage({ 
    command: 'writeGenerateCode',
    param: undefined,
    project_dir: project_dir_
  });
}

function okCompare() {
  vscode.postMessage({ 
    command: 'writeGenerateCode',
    param: generatedCodes_,
    project_dir: project_dir_
  });
}
