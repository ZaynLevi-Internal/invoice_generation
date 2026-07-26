// ============================================
// Frontend-only version — no backend needed
// All data persisted in localStorage
// Demo credentials: admin / admin123
// ============================================

const STORAGE_KEY = "boss_invoices";
const AUTH_KEY = "boss_admin_auth";

// --- Demo credentials (hardcoded for demo) ---
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

// --- localStorage helpers ---
function getInvoices() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function nextInvoiceNumber() {
  const invoices = getInvoices();
  const n = invoices.length + 1;
  return "INV-" + String(n).padStart(4, "0");
}

// --- API-compatible interface (all local) ---
export const api = {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
          resolve({ success: true, token: "admin-session" });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 300);
    });
  },

  stats: () => {
    const invoices = getInvoices();
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const totalTravelers = invoices.reduce((sum, inv) => sum + (Number(inv.travelersCount) || 0), 0);
    return Promise.resolve({ totalInvoices, totalRevenue, totalTravelers });
  },

  listInvoices: (search = "") => {
    let invoices = getInvoices();
    if (search) {
      const q = search.toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q)
      );
    }
    return Promise.resolve(
      invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  },

  getInvoice: (id) => {
    const invoices = getInvoices();
    const invoice = invoices.find((inv) => inv.id === Number(id));
    if (!invoice) return Promise.reject(new Error("Not found"));
    return Promise.resolve(invoice);
  },

  createInvoice: (data) => {
    const invoices = getInvoices();
    const totals = computeTotals(data);
    const newInvoice = {
      id: Date.now(),
      invoiceNumber: nextInvoiceNumber(),
      customerName: data.customerName,
      mobile: data.mobile,
      email: data.email || "",
      packageName: data.packageName,
      sourceLocation: data.sourceLocation,
      destinationLocation: data.destinationLocation,
      travelDate: data.travelDate,
      travelersCount: Number(data.travelersCount) || 1,
      packageCost: Number(data.packageCost) || 0,
      gstPercentage: Number(data.gstPercentage) || 0,
      additionalCharges: Number(data.additionalCharges) || 0,
      ...totals,
      createdAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    saveInvoices(invoices);
    return Promise.resolve(newInvoice);
  },

  deleteInvoice: (id) => {
    let invoices = getInvoices();
    const idx = invoices.findIndex((inv) => inv.id === Number(id));
    if (idx === -1) return Promise.reject(new Error("Not found"));
    invoices.splice(idx, 1);
    saveInvoices(invoices);
    return Promise.resolve({ success: true });
  },
};

export function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

export function computeTotals({ packageCost, travelersCount, additionalCharges, gstPercentage }) {
  const subtotal =
    (Number(packageCost) || 0) * (Number(travelersCount) || 1) +
    (Number(additionalCharges) || 0);
  const gstAmount = +(subtotal * ((Number(gstPercentage) || 0) / 100)).toFixed(2);
  const grandTotal = +(subtotal + gstAmount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), gstAmount, grandTotal };
}

export const auth = {
  isAuthed: () => localStorage.getItem(AUTH_KEY) === "1",
  setAuthed: () => localStorage.setItem(AUTH_KEY, "1"),
  logout: () => localStorage.removeItem(AUTH_KEY),
};
