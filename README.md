# EasyTransfer

A simple self-hosted file storage app — upload files, keep them on the server, and download them later. Like a minimal Google Drive.

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## How it works

- **Backend**: Express + Multer. Uploaded files are stored on disk in `uploads/` under a generated UUID-based filename (to avoid collisions/path traversal), while the original filename, size, MIME type, and upload timestamp are recorded in `data/files.json`.
- **Frontend**: Static HTML/CSS/JS (`public/`) with drag-and-drop upload, per-file progress bars, and a table of stored files with download/delete actions.

## API

- `GET /api/files` — list stored files
- `POST /api/upload` — upload one or more files (multipart field `files`)
- `GET /api/files/:id/download` — download a file by id
- `DELETE /api/files/:id` — delete a file by id

## Configuration

- `PORT` — server port (default `3000`)
- Max upload size is 500MB per file (edit `MAX_FILE_SIZE` in `server.js` to change).
