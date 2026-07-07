const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const METADATA_FILE = path.join(DATA_DIR, 'files.json');
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB per file
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

for (const dir of [UPLOAD_DIR, DATA_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}
if (!fs.existsSync(METADATA_FILE)) {
  fs.writeFileSync(METADATA_FILE, '[]');
}

function readMetadata() {
  try {
    return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeMetadata(records) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(records, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname).slice(0, 20);
    file.generatedId = id;
    cb(null, id + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/files', (req, res) => {
  const records = readMetadata()
    .slice()
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(records);
});

app.post('/api/upload', (req, res) => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
          : err.message || 'Upload failed';
      return res.status(400).json({ error: message });
    }
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const records = readMetadata();
    const uploadedAt = new Date().toISOString();
    const newRecords = files.map((file) => ({
      id: file.generatedId,
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt,
    }));
    records.push(...newRecords);
    writeMetadata(records);
    res.status(201).json(newRecords);
  });
});

app.get('/api/files/:id/download', (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }
  const records = readMetadata();
  const record = records.find((r) => r.id === id);
  if (!record) {
    return res.status(404).json({ error: 'File not found' });
  }
  const filePath = path.join(UPLOAD_DIR, record.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File missing from storage' });
  }
  res.download(filePath, record.originalName);
});

app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }
  const records = readMetadata();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  const [record] = records.splice(index, 1);
  const filePath = path.join(UPLOAD_DIR, record.storedName);
  fs.rm(filePath, { force: true }, () => {});
  writeMetadata(records);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`EasyTransfer running at http://localhost:${PORT}`);
});
