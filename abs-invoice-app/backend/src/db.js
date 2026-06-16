const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "abs.db");
const schemaPath = path.join(__dirname, "..", "..", "database", "schema.sql");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

module.exports = db;
