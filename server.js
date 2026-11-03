import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Official Google Sheets CSV published URL (GID 1673594557)
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNvnBL8JmRnslsqopUX2KNx4uIgf887KyudrbCqwCXhCMyctxMH8phe0ZitiT2en6e4Rw5jSIySdVK/pub?gid=1673594557&single=true&output=csv";
const LOCAL_CSV_PATH = path.join(__dirname, "data.csv");

let cachedCsvData = null;
let lastSyncTimestamp = new Date().toISOString();
let syncStatus = {
  connected: true,
  lastSync: lastSyncTimestamp,
  rowCount: 181299,
  url: GOOGLE_SHEETS_CSV_URL,
  gid: "1673594557",
  source: "Google Sheets (Oficial)"
};

// Enable gzip/deflate compression
app.use(compression({
  threshold: 1024,
  level: 6
}));

// Enable CORS and disable cache
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  next();
});

// Helper: fetch latest CSV from Google Sheets with fallback
async function fetchGoogleSheetsData(force = false) {
  if (!force && cachedCsvData) {
    return cachedCsvData;
  }

  try {
    console.log(`[Google Sheets] Sincronizando con GID 1673594557...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(GOOGLE_SHEETS_CSV_URL + `&_ts=${Date.now()}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FonasaAnalyticsBot/1.0)"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Google Sheets respondió con código HTTP ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim().startsWith("<") || text.length < 1000) {
      throw new Error("La respuesta de Google Sheets no contiene formato CSV válido");
    }

    const lines = text.split("\n");
    const validRows = lines.length > 1 ? lines.length - 1 : 0;

    cachedCsvData = text;
    lastSyncTimestamp = new Date().toISOString();
    syncStatus = {
      connected: true,
      lastSync: lastSyncTimestamp,
      rowCount: validRows,
      url: GOOGLE_SHEETS_CSV_URL,
      gid: "1673594557",
      source: "Google Sheets (En Vivo)"
    };

    fs.writeFile(LOCAL_CSV_PATH, text, "utf-8", (err) => {
      if (err) console.error("[Backup Error]", err);
    });

    console.log(`[Google Sheets] Sincronización exitosa: ${validRows} registros leídos.`);
    return text;
  } catch (err) {
    console.warn(`[Google Sheets Error]`, err.message);
    if (!cachedCsvData && fs.existsSync(LOCAL_CSV_PATH)) {
      console.log(`[Fallback] Leyendo datos locales desde data.csv...`);
      cachedCsvData = fs.readFileSync(LOCAL_CSV_PATH, "utf-8");
    }
    syncStatus.connected = false;
    syncStatus.error = err.message;
    return cachedCsvData;
  }
}

// API endpoint: Status of data connection
app.get("/api/status", (req, res) => {
  res.json({
    ...syncStatus,
    serverTime: new Date().toISOString()
  });
});

// API endpoint: Force sync from Google Sheets
app.post("/api/sync", async (req, res) => {
  try {
    await fetchGoogleSheetsData(true);
    res.json({
      success: true,
      message: "Sincronización con Google Sheets completada exitosamente.",
      ...syncStatus
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      ...syncStatus
    });
  }
});

// API endpoint: Stream or serve the full CSV
app.get("/api/data", async (req, res) => {
  const force = req.query.force === "true";
  const csv = await fetchGoogleSheetsData(force);
  if (!csv) {
    return res.status(503).send("Datos no disponibles temporalmente");
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("X-Data-Source", syncStatus.source);
  res.setHeader("X-Data-Rows", syncStatus.rowCount);
  res.send(csv);
});

// Serve static assets from the current directory
app.use(express.static(__dirname, {
  etag: false,
  maxAge: 0
}));

// Fallback to index.html for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Observatorio FONASA Lampa activo en http://0.0.0.0:${PORT}`);
  console.log(`📊 Enlace oficial Google Sheets: GID=1673594557`);
  fetchGoogleSheetsData(false);
});
