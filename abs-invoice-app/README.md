# ABS Tours and Travels — Invoice Generation System

Full-stack app with **React + Vite** frontend, **Node.js + Express** backend, and **SQLite** database. Designed to run locally in VS Code.

## Folder Structure

```
abs-invoice-app/
├── backend/        # Express API + SQLite
├── frontend/       # React + Vite + Tailwind UI
├── database/       # SQL schema
└── README.md
```

## Prerequisites
- Node.js 18+ and npm
- VS Code (recommended)

## 1. Backend — `backend/`

```bash
cd backend
npm install
npm start
```
Server runs at **http://localhost:5000**. SQLite file `abs.db` is created automatically on first run using `database/schema.sql`.

### Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/api/login` | Login (`admin` / `admin123`) |
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/:id` | Get one invoice |
| POST | `/api/invoices` | Create invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| GET | `/api/stats` | Dashboard stats |

## 2. Frontend — `frontend/`

```bash
cd frontend
npm install
npm run dev
```
App opens at **http://localhost:5173**. It proxies `/api` to the backend.

## 3. Login
- Username: `admin`
- Password: `admin123`

## Features
- Admin login (static credentials)
- Dashboard with totals, revenue, recent invoices
- Create invoice with live GST/total calculation
- Auto invoice numbers (`INV-0001`, `INV-0002`, …)
- Invoice list with search + delete
- Printable invoice view + Download PDF (browser print → save as PDF)
- Sidebar navigation, blue-and-white travel theme, responsive

## Running in VS Code
1. Open the `abs-invoice-app` folder in VS Code.
2. Open two terminals (`` Ctrl+` ``) — run `npm start` in one for `backend/`, and `npm run dev` in another for `frontend/`.
3. Visit http://localhost:5173.
