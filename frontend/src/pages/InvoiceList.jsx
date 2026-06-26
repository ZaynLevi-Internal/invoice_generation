import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileDown, Eye, Pencil, Trash2, Filter } from 'lucide-react';
import { api } from '../lib/api';
import StatusBadge from '../components/StatusBadge';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    setLoading(true);
    api.getInvoices({
  search: search || undefined,
  status: statusFilter || undefined
})
.then(data => {
  console.log("FULL RESPONSE:", data);
  alert(JSON.stringify(data));
  setInvoices(data.invoices || data.data || data);
  setTimeout(() => {
  alert("Invoices state: " + data.length);
}, 1000);
})
.catch(err => {
  console.error("ERROR:", err);
})
.finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.deleteInvoice(id);
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
        <div className="flex gap-3">
          <button onClick={() => api.exportExcel()} className="btn-secondary">
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </button>
          <Link to="/invoices/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by invoice #, name, or mobile..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FileDown className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Mobile</th>
                  <th className="text-left px-4 py-3 font-medium">Travel Date</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link to={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{inv.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.customerMobile}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.travelDate}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">₹{inv.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/invoices/${inv.id}`} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/invoices/${inv.id}/edit`} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-600" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
