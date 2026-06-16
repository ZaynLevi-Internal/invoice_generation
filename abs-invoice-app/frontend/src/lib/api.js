const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  login: (username, password) =>
    request("/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  stats: () => request("/stats"),
  listInvoices: (search = "") =>
    request("/invoices" + (search ? `?search=${encodeURIComponent(search)}` : "")),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) =>
    request("/invoices", { method: "POST", body: JSON.stringify(data) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: "DELETE" }),
};

export function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

export function computeTotals({ packageCost, travelersCount, additionalCharges, gstPercentage }) {
  const subtotal = (Number(packageCost) || 0) * (Number(travelersCount) || 1) + (Number(additionalCharges) || 0);
  const gstAmount = +(subtotal * ((Number(gstPercentage) || 0) / 100)).toFixed(2);
  const grandTotal = +(subtotal + gstAmount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), gstAmount, grandTotal };
}

const AUTH_KEY = "abs_admin_auth";
export const auth = {
  isAuthed: () => localStorage.getItem(AUTH_KEY) === "1",
  setAuthed: () => localStorage.setItem(AUTH_KEY, "1"),
  logout: () => localStorage.removeItem(AUTH_KEY),
};
