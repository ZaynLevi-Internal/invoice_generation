const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// --- Auth ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: "admin-session" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// --- Helpers ---
function nextInvoiceNumber() {
  const row = db.prepare("SELECT COUNT(*) AS c FROM invoices").get();
  const n = (row.c || 0) + 1;
  return "INV-" + String(n).padStart(4, "0");
}

function computeTotals({ packageCost, travelersCount, additionalCharges, gstPercentage }) {
  const subtotal = (Number(packageCost) || 0) * (Number(travelersCount) || 1) + (Number(additionalCharges) || 0);
  const gstAmount = +(subtotal * ((Number(gstPercentage) || 0) / 100)).toFixed(2);
  const grandTotal = +(subtotal + gstAmount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), gstAmount, grandTotal };
}

// --- Stats ---
app.get("/api/stats", (_req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS c FROM invoices").get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(grandTotal), 0) AS s FROM invoices").get().s;
  const travelers = db.prepare("SELECT COALESCE(SUM(travelersCount), 0) AS s FROM invoices").get().s;
  res.json({ totalInvoices: total, totalRevenue: revenue, totalTravelers: travelers });
});

// --- Invoices CRUD ---
app.get("/api/invoices", (req, res) => {
  const search = (req.query.search || "").toString().trim();
  let rows;
  if (search) {
    rows = db
      .prepare(
        "SELECT * FROM invoices WHERE invoiceNumber LIKE ? OR customerName LIKE ? ORDER BY createdAt DESC"
      )
      .all(`%${search}%`, `%${search}%`);
  } else {
    rows = db.prepare("SELECT * FROM invoices ORDER BY createdAt DESC").all();
  }
  res.json(rows);
});

app.get("/api/invoices/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM invoices WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

app.post("/api/invoices", (req, res) => {
  const b = req.body || {};
  const required = ["customerName", "mobile", "packageName", "sourceLocation", "destinationLocation", "travelDate"];
  for (const f of required) {
    if (!b[f]) return res.status(400).json({ message: `Missing ${f}` });
  }
  const totals = computeTotals(b);
  const invoiceNumber = nextInvoiceNumber();
  const stmt = db.prepare(`
    INSERT INTO invoices (invoiceNumber, customerName, mobile, email, packageName,
      sourceLocation, destinationLocation, travelDate, travelersCount, packageCost,
      gstPercentage, additionalCharges, subtotal, gstAmount, grandTotal)
    VALUES (@invoiceNumber, @customerName, @mobile, @email, @packageName,
      @sourceLocation, @destinationLocation, @travelDate, @travelersCount, @packageCost,
      @gstPercentage, @additionalCharges, @subtotal, @gstAmount, @grandTotal)
  `);
  const info = stmt.run({
    invoiceNumber,
    customerName: b.customerName,
    mobile: b.mobile,
    email: b.email || null,
    packageName: b.packageName,
    sourceLocation: b.sourceLocation,
    destinationLocation: b.destinationLocation,
    travelDate: b.travelDate,
    travelersCount: Number(b.travelersCount) || 1,
    packageCost: Number(b.packageCost) || 0,
    gstPercentage: Number(b.gstPercentage) || 0,
    additionalCharges: Number(b.additionalCharges) || 0,
    ...totals,
  });
  const row = db.prepare("SELECT * FROM invoices WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.delete("/api/invoices/:id", (req, res) => {
  const info = db.prepare("DELETE FROM invoices WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ABS backend running on http://localhost:${PORT}`);
});
