CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoiceNumber TEXT NOT NULL UNIQUE,
  customerName TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  packageName TEXT NOT NULL,
  sourceLocation TEXT NOT NULL,
  destinationLocation TEXT NOT NULL,
  travelDate TEXT NOT NULL,
  travelersCount INTEGER NOT NULL DEFAULT 1,
  packageCost REAL NOT NULL DEFAULT 0,
  gstPercentage REAL NOT NULL DEFAULT 0,
  additionalCharges REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL DEFAULT 0,
  gstAmount REAL NOT NULL DEFAULT 0,
  grandTotal REAL NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoiceNumber);
CREATE INDEX IF NOT EXISTS idx_invoices_createdAt ON invoices(createdAt DESC);
