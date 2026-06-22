-- ABS Tours and Travels Invoice Generation System - Database Schema

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceNumber TEXT NOT NULL UNIQUE,
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    customerMobile TEXT NOT NULL,
    sourceLocation TEXT NOT NULL,
    destinationLocation TEXT NOT NULL,
    tourPackage TEXT NOT NULL,
    travelDate TEXT NOT NULL,
    returnDate TEXT,
    numberOfPassengers INTEGER NOT NULL DEFAULT 1,
    baseAmount REAL NOT NULL,
    gstRate REAL NOT NULL DEFAULT 18,
    gstAmount REAL NOT NULL,
    totalAmount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Paid', 'Cancelled')),
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoiceNumber);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_mobile ON invoices(customerMobile);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(createdAt DESC);
