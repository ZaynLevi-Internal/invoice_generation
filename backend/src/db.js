const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "abs.db");
const schemaPath = path.join(__dirname, "..", "..", "database", "schema.sql");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

// Lightweight migration: add `status` column on legacy DBs that pre-date it
const cols = db.prepare("PRAGMA table_info(invoices)").all();
if (!cols.some((c) => c.name === "status")) {
  db.exec("ALTER TABLE invoices ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'");
  db.exec("CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)");
}

module.exports = db;
