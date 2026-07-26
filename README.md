# ABS Tours and Travels — Invoice System

A frontend-only invoice generation demo app for **ABS Tours and Travels**. Built with React + Vite + Tailwind CSS and deployed on GitHub Pages.

All data is stored in the browser's `localStorage` — no backend or database required.

## Demo Credentials

```
Username: admin
Password: admin123
```

## Features

- Login with hardcoded demo credentials
- Dashboard with stats (total invoices, revenue, travelers)
- Create new invoices with auto-calculated GST and totals
- View, search, and delete invoices
- Print / Download PDF (via browser print dialog)
- Fully responsive and mobile-friendly

## Tech Stack

- **React 18** with React Router (HashRouter for GitHub Pages compatibility)
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **localStorage** for data persistence

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder.

## Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`.

To enable:
1. Go to your repo → Settings → Pages
2. Set Source to **GitHub Actions**
3. Push to `main` — the site will be live at `https://<username>.github.io/<repo-name>/`
