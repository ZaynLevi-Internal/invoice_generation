const API_BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  };
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0] || 'Request failed');
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getInvoices: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/invoices?${qs}`);
  },

  getInvoice: (id) => request(`/api/invoices/${id}`),

  createInvoice: (data) =>
    request('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),

  updateInvoice: (id, data) =>
    request(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteInvoice: (id) =>
    request(`/api/invoices/${id}`, { method: 'DELETE' }),

  updateStatus: (id, status) =>
    request(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getStats: () => request('/api/stats'),

  exportExcel: () => {
    window.open(`${API_BASE}/api/invoices/export/excel?token=${getToken()}`, '_blank');
  }
};
