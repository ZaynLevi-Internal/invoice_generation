const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'abs.db');
const db = new Database(dbPath);

// Initialize schema
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Migration: add status column if missing
try {
  db.prepare("SELECT status FROM invoices LIMIT 1").get();
} catch {
  db.prepare("ALTER TABLE invoices ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Paid', 'Cancelled'))").run();
}

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || token !== 'Bearer admin-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Helper: compute totals
function computeTotals(baseAmount, gstRate, numPassengers) {
  const totalBase = parseFloat(baseAmount) * parseInt(numPassengers || 1);
  const gstAmount = (totalBase * parseFloat(gstRate)) / 100;
  const totalAmount = totalBase + gstAmount;
  return { totalBase, gstAmount, totalAmount };
}

// Helper: next invoice number
function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `ABS-${year}-`;
  const row = db.prepare("SELECT invoiceNumber FROM invoices WHERE invoiceNumber LIKE ? ORDER BY invoiceNumber DESC LIMIT 1").get(prefix + '%');
  let next = 1;
  if (row) {
    const match = row.invoiceNumber.match(/-(\d+)$/);
    if (match) next = parseInt(match[1]) + 1;
  }
  return `${prefix}${String(next).padStart(4, '0')}`;
}

// Validate invoice
function validateInvoice(data) {
  const errors = [];
  if (!data.customerName?.trim()) errors.push('Customer name is required');
  if (!data.customerEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) errors.push('Valid email is required');
  if (!data.customerMobile?.trim() || !/^\d{10}$/.test(data.customerMobile)) errors.push('Valid 10-digit mobile number is required');
  if (!data.sourceLocation?.trim()) errors.push('Source location is required');
  if (!data.destinationLocation?.trim()) errors.push('Destination location is required');
  if (!data.tourPackage?.trim()) errors.push('Tour package is required');
  if (!data.travelDate) errors.push('Travel date is required');
  if (!data.baseAmount || parseFloat(data.baseAmount) <= 0) errors.push('Base amount must be greater than 0');
  if (!data.numberOfPassengers || parseInt(data.numberOfPassengers) < 1) errors.push('Passengers must be at least 1');
  return errors;
}

// ============ AUTH ============
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'admin-token', user: { username: 'admin', role: 'admin' } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// ============ INVOICES ============

// List invoices
app.get('/api/invoices', requireAuth, (req, res) => {
  const { search, status } = req.query;
  let sql = 'SELECT * FROM invoices WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (invoiceNumber LIKE ? OR customerName LIKE ? OR customerMobile LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (status && ['Pending', 'Paid', 'Cancelled'].includes(status)) {
    sql += ' AND status = ?';
    params.push(status);
  }
  sql += ' ORDER BY createdAt DESC';

  const invoices = db.prepare(sql).all(...params);
  res.json(invoices);
});

// Get single invoice
app.get('/api/invoices/:id', requireAuth, (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

// Create invoice
app.post('/api/invoices', requireAuth, (req, res) => {
  const data = req.body;
  const errors = validateInvoice(data);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { gstAmount, totalAmount } = computeTotals(data.baseAmount, data.gstRate, data.numberOfPassengers);
  const invoiceNumber = data.invoiceNumber || nextInvoiceNumber();

  const stmt = db.prepare(`
    INSERT INTO invoices (
      invoiceNumber, customerName, customerEmail, customerMobile,
      sourceLocation, destinationLocation, tourPackage, travelDate, returnDate,
      numberOfPassengers, baseAmount, gstRate, gstAmount, totalAmount,
      status, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const result = stmt.run(
    invoiceNumber, data.customerName, data.customerEmail, data.customerMobile,
    data.sourceLocation, data.destinationLocation, data.tourPackage,
    data.travelDate, data.returnDate || null,
    parseInt(data.numberOfPassengers), parseFloat(data.baseAmount),
    parseFloat(data.gstRate), gstAmount, totalAmount,
    data.status || 'Pending', data.notes || null
  );

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(invoice);
});

// Update invoice
app.put('/api/invoices/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Invoice not found' });

  const data = req.body;
  const errors = validateInvoice(data);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { gstAmount, totalAmount } = computeTotals(data.baseAmount, data.gstRate, data.numberOfPassengers);

  db.prepare(`
    UPDATE invoices SET
      customerName = ?, customerEmail = ?, customerMobile = ?,
      sourceLocation = ?, destinationLocation = ?, tourPackage = ?,
      travelDate = ?, returnDate = ?, numberOfPassengers = ?,
      baseAmount = ?, gstRate = ?, gstAmount = ?, totalAmount = ?,
      status = ?, notes = ?, updatedAt = datetime('now')
    WHERE id = ?
  `).run(
    data.customerName, data.customerEmail, data.customerMobile,
    data.sourceLocation, data.destinationLocation, data.tourPackage,
    data.travelDate, data.returnDate || null, parseInt(data.numberOfPassengers),
    parseFloat(data.baseAmount), parseFloat(data.gstRate), gstAmount, totalAmount,
    data.status || 'Pending', data.notes || null, req.params.id
  );

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  res.json(invoice);
});

// Update status
app.patch('/api/invoices/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Paid', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE invoices SET status = ?, updatedAt = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  res.json(invoice);
});

// Delete invoice
app.delete('/api/invoices/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ message: 'Invoice deleted successfully' });
});

// Export to Excel
app.get('/api/invoices/export/excel', requireAuth, async (req, res) => {
  const invoices = db.prepare('SELECT * FROM invoices ORDER BY createdAt DESC').all();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoices');

  worksheet.columns = [
    { header: 'Invoice #', key: 'invoiceNumber', width: 18 },
    { header: 'Customer', key: 'customerName', width: 22 },
    { header: 'Email', key: 'customerEmail', width: 25 },
    { header: 'Mobile', key: 'customerMobile', width: 14 },
    { header: 'Source', key: 'sourceLocation', width: 32 },
    { header: 'Destination', key: 'destinationLocation', width: 32 },
    { header: 'Package', key: 'tourPackage', width: 20 },
    { header: 'Travel Date', key: 'travelDate', width: 14 },
    { header: 'Passengers', key: 'numberOfPassengers', width: 12 },
    { header: 'Base Amount', key: 'baseAmount', width: 14 },
    { header: 'GST %', key: 'gstRate', width: 10 },
    { header: 'GST Amount', key: 'gstAmount', width: 14 },
    { header: 'Total', key: 'totalAmount', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created', key: 'createdAt', width: 20 }
  ];

  invoices.forEach(inv => worksheet.addRow(inv));

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=ABS_Invoices.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// Dashboard stats
app.get('/api/stats', requireAuth, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'Pending'").get().count;
  const paid = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'Paid'").get().count;
  const revenue = db.prepare("SELECT COALESCE(SUM(totalAmount), 0) as total FROM invoices WHERE status = 'Paid'").get().total;

  const recent = db.prepare('SELECT * FROM invoices ORDER BY createdAt DESC LIMIT 5').all();
  const popular = db.prepare(`
    SELECT tourPackage, COUNT(*) as count FROM invoices GROUP BY tourPackage ORDER BY count DESC LIMIT 5
  `).all();

  res.json({ total, pending, paid, revenue, recent, popularPackages: popular });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ABS Invoice Backend running on port ${PORT}`);
});
