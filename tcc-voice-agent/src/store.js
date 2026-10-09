// Tiny JSON-file store. Zero external deps so it runs anywhere (incl. your Hostinger box).
// For production scale, swap these functions for the Postgres/Supabase schema in db/schema.sql.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// DATA_DIR is overridable (Docker volume, or an isolated dir for tests).
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

// NOTE ON CONCURRENCY: append()/writeJSON() are fully synchronous (readFileSync +
// writeFileSync with tmp+rename). Node runs them to completion without yielding, so
// two overlapping webhook handlers cannot interleave a read-modify-write here — the
// store is race-safe within a single process. Move to db/schema.sql (Postgres) before
// running multiple instances.

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function file(name) { return path.join(DATA_DIR, `${name}.json`); }

export function readJSON(name, fallback) {
  ensureDir();
  try {
    if (!fs.existsSync(file(name))) return fallback;
    return JSON.parse(fs.readFileSync(file(name), 'utf8'));
  } catch (e) {
    console.error(`[store] read ${name} failed:`, e.message);
    return fallback;
  }
}

export function writeJSON(name, data) {
  ensureDir();
  const tmp = file(name) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file(name)); // near-atomic replace
}

// Append one record to an array-backed collection.
export function append(name, record) {
  const arr = readJSON(name, []);
  arr.push(record);
  writeJSON(name, arr);
  return record;
}
