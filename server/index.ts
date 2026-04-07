import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const DATA_ROOT = path.resolve(__dirname, "../data");
const IMPORT_DIR = path.join(DATA_ROOT, "import");
const EXPORT_DIR = path.join(DATA_ROOT, "export");

for (const dir of [IMPORT_DIR, EXPORT_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.0.8"],
}));
app.use(express.json());

function makeStorage(dir: string): multer.StorageEngine {
  return multer.diskStorage({
    destination: dir,
    filename: (_req, file, cb) => cb(null, path.basename(file.originalname)),
  });
}

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

const importUpload = multer({ storage: makeStorage(IMPORT_DIR), limits: { fileSize: FILE_SIZE_LIMIT } });
const exportUpload = multer({ storage: makeStorage(EXPORT_DIR), limits: { fileSize: FILE_SIZE_LIMIT } });

function assertWithinDir(dir: string, name: string): string {
  const resolved = path.resolve(dir, name);
  if (!resolved.startsWith(dir + path.sep) && resolved !== dir) {
    throw new Error("Invalid file path");
  }
  return resolved;
}

function listCsvFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".csv"))
    .sort();
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ── Import ────────────────────────────────────────────────────────────────────
app.post("/api/import/upload", importUpload.array("files"), (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  res.json({ ok: true, count: files?.length ?? 0 });
});

app.get("/api/import/list", (_req, res) => {
  res.json(listCsvFiles(IMPORT_DIR));
});

app.get("/api/import/file/:name", (req, res) => {
  try {
    const filePath = assertWithinDir(IMPORT_DIR, path.basename(req.params.name ?? ""));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(filePath);
  } catch {
    res.status(400).json({ error: "Invalid file name" });
  }
});

app.delete("/api/import/clear", (_req, res) => {
  for (const f of fs.readdirSync(IMPORT_DIR)) {
    try {
      fs.unlinkSync(path.join(IMPORT_DIR, f));
    } catch {
      // File already gone or locked — continue clearing the rest
    }
  }
  res.json({ ok: true });
});

// ── Export ────────────────────────────────────────────────────────────────────
app.post("/api/export/upload", exportUpload.array("files"), (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  res.json({ ok: true, count: files?.length ?? 0 });
});

app.get("/api/export/list", (_req, res) => {
  res.json(listCsvFiles(EXPORT_DIR));
});

app.get("/api/export/file/:name", (req, res) => {
  try {
    const filePath = assertWithinDir(EXPORT_DIR, path.basename(req.params.name ?? ""));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(filePath);
  } catch {
    res.status(400).json({ error: "Invalid file name" });
  }
});

app.delete("/api/export/clear", (_req, res) => {
  for (const f of fs.readdirSync(EXPORT_DIR)) {
    try {
      fs.unlinkSync(path.join(EXPORT_DIR, f));
    } catch {
      // File already gone or locked — continue clearing the rest
    }
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Windfall backend running on http://localhost:${PORT}`);
});
