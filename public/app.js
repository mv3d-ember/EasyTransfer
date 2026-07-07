const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const progressList = document.getElementById('upload-progress');
const filesBody = document.getElementById('files-body');
const filesTable = document.getElementById('files-table');
const emptyState = document.getElementById('empty-state');
const fileCount = document.getElementById('file-count');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadFiles() {
  const res = await fetch('/api/files');
  const files = await res.json();
  renderFiles(files);
}

function renderFiles(files) {
  filesBody.innerHTML = '';
  fileCount.textContent = files.length ? `${files.length} file${files.length === 1 ? '' : 's'}` : '';

  if (files.length === 0) {
    filesTable.hidden = true;
    emptyState.hidden = false;
    return;
  }
  filesTable.hidden = false;
  emptyState.hidden = true;

  for (const file of files) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="file-name" title="${escapeHtml(file.originalName)}">${escapeHtml(file.originalName)}</div></td>
      <td>${formatBytes(file.size)}</td>
      <td>${formatDate(file.uploadedAt)}</td>
      <td>
        <div class="file-actions">
          <a class="btn btn-download" href="/api/files/${file.id}/download">Download</a>
          <button class="btn btn-delete" data-id="${file.id}">Delete</button>
        </div>
      </td>
    `;
    filesBody.appendChild(tr);
  }

  filesBody.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteFile(btn.dataset.id));
  });
}

async function deleteFile(id) {
  if (!confirm('Delete this file? This cannot be undone.')) return;
  const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
  if (res.ok) {
    loadFiles();
  } else {
    alert('Failed to delete file.');
  }
}

function uploadFiles(fileList) {
  const files = Array.from(fileList);
  if (files.length === 0) return;

  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const item = document.createElement('li');
  const names = files.map((f) => f.name).join(', ');
  item.innerHTML = `
    <div class="row">
      <span class="name">${escapeHtml(names)}</span>
      <span class="status">0%</span>
    </div>
    <div class="bar"><div class="bar-fill"></div></div>
  `;
  progressList.appendChild(item);
  const statusEl = item.querySelector('.status');
  const barFill = item.querySelector('.bar-fill');

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/upload');

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const pct = Math.round((e.loaded / e.total) * 100);
      barFill.style.width = pct + '%';
      statusEl.textContent = pct + '%';
    }
  });

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      statusEl.textContent = 'Done';
      barFill.style.width = '100%';
      loadFiles();
      setTimeout(() => item.remove(), 1500);
    } else {
      let message = 'Upload failed';
      try {
        message = JSON.parse(xhr.responseText).error || message;
      } catch {}
      item.classList.add('error');
      statusEl.textContent = message;
    }
  });

  xhr.addEventListener('error', () => {
    item.classList.add('error');
    statusEl.textContent = 'Upload failed';
  });

  xhr.send(formData);
}

dropzone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  uploadFiles(fileInput.files);
  fileInput.value = '';
});

['dragenter', 'dragover'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  uploadFiles(files);
});

loadFiles();
