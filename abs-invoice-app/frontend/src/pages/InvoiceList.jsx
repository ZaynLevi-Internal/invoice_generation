import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Trash2, PlusCircle } from "lucide-react";
import { api, formatINR } from "../lib/api";

export default function InvoiceList() {
  const [q, setQ] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setInvoices(await api.listInvoices());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = invoices.filter(
    (i) => i.invoiceNumber.toLowerCase().includes(q.toLowerCase()) ||
           i.customerName.toLowerCase().includes(q.toLowerCase())
  );

  const onDelete = async (id, num) => {
    if (!confirm(`Delete invoice ${num}?`)) return;
    await api.deleteInvoice(id);
    await load();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-slate-500 text-sm">{invoices.length} total</p>
        </div>
        <Link to="/invoices/new" className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <PlusCircle className="w-4 h-4 mr-2" /> New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="relative mb-4 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by invoice # or customer..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No invoices found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Invoice #</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Package</th>
                  <th className="py-2 pr-4">Travel Date</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="py-3 pr-4">{inv.customerName}</td>
                    <td className="py-3 pr-4">{inv.packageName}</td>
                    <td className="py-3 pr-4">{new Date(inv.travelDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-right font-medium">{formatINR(inv.grandTotal)}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <Link to={`/invoices/${inv.id}`} className="inline-flex items-center px-2 py-1 text-brand-600 hover:bg-brand-50 rounded">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => onDelete(inv.id, inv.invoiceNumber)} className="inline-flex items-center px-2 py-1 text-red-600 hover:bg-red-50 rounded ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
