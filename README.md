# ABS Tours and Travels — Invoice Generation System

Full-stack invoice system. Frontend (React + Vite + Tailwind), Backend (Node + Express), Database (SQLite).

## Folder Structure

```
abs-invoice-app/
├── backend/
│   ├── src/
│   │   ├── db.js          # SQLite connection + auto-migration
│   │   └── server.js      # Express API (auth, invoices, stats, export)
│   ├── package.json
│   └── abs.db             # auto-created on first run
├── database/
│   └── schema.sql         # SQLite schema (incl. status column)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InvoiceForm.jsx    # shared form for create + edit
│   │   │   ├── Layout.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InvoiceEdit.jsx    # NEW
│   │   │   ├── InvoiceList.jsx
│   │   │   ├── InvoiceNew.jsx
│   │   │   ├── InvoiceView.jsx
│   │   │   └── Login.jsx
│   │   ├── lib/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Database Schema (updated)

```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoiceNumber TEXT NOT NULL UNIQUE,   -- ABS-YYYY-####
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
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending | Paid | Cancelled
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```
Existing DBs are auto-migrated (adds `status` column on startup).

## Backend API Endpoints

| Method | Path                              | Purpose                                   |
| ------ | --------------------------------- | ----------------------------------------- |
| POST   | `/api/login`                      | Static admin login                        |
| GET    | `/api/stats`                      | Totals + popular package                  |
| GET    | `/api/invoices?search=`           | List/search (invoice #, customer, mobile) |
| GET    | `/api/invoices/:id`               | Get one invoice                           |
| POST   | `/api/invoices`                   | Create invoice (auto # `ABS-YYYY-####`)   |
| PUT    | `/api/invoices/:id`               | **NEW** — Update full invoice             |
| PATCH  | `/api/invoices/:id/status`        | **NEW** — Quick status update             |
| DELETE | `/api/invoices/:id`               | Delete invoice                            |
| GET    | `/api/invoices/export/excel`      | **NEW** — Download all as `.xlsx`         |

All POST/PUT requests are validated server-side (mobile = 10 digits, email format, travelers > 0, package cost > 0, required fields).

## Frontend Pages Modified

- **Dashboard.jsx** — added "Popular Package" stat card.
- **InvoiceList.jsx** — search by mobile, status badge column, Edit button, Export to Excel button.
- **InvoiceView.jsx** — Edit button, status badge in header.
- **InvoiceNew.jsx** — now thin wrapper around shared `InvoiceForm`.
- **App.jsx** — added `/invoices/:id/edit` route.
- **NEW** `InvoiceEdit.jsx`, `components/InvoiceForm.jsx`, `components/StatusBadge.jsx`.
- **lib/api.js** — `updateInvoice`, `updateStatus`, `exportExcelUrl`, `validateInvoiceForm`, `STATUSES`.

## Run It

### Backend
```bash
cd backend
npm install
npm start          # http://localhost:5000
```

### Frontend (separate terminal)
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Vite proxies `/api/*` to the backend. Open http://localhost:5173.

### Credentials
- Username: `admin`
- Password: `admin123`

## Notes

- Invoice numbers reset by year: `ABS-2026-0001`, `ABS-2026-0002`, …
- "Download PDF" uses the browser's print dialog → Save as PDF.
- Excel export covers **all** invoices, currency formatted in ₹.
- SQLite file lives at `backend/abs.db` (gitignored).
