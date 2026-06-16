import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, IndianRupee, Users, PlusCircle, Eye } from "lucide-react";
import { api, formatINR } from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, list] = await Promise.all([api.stats(), api.listInvoices()]);
        setStats(s);
        setRecent(list.slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-slate-500 text-sm">Overview of your travel invoices</p>
        </div>
        <Link to="/invoices/new" className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <PlusCircle className="w-4 h-4 mr-2" /> Quick Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Total Invoices" value={loading ? "—" : stats?.totalInvoices ?? 0} icon={<FileText />} />
        <Stat label="Total Revenue" value={loading ? "—" : formatINR(stats?.totalRevenue)} icon={<IndianRupee />} />
        <Stat label="Travelers Served" value={loading ? "—" : stats?.totalTravelers ?? 0} icon={<Users />} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold">Recent Invoices</h3>
          <Link to="/invoices" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="p-5">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : recent.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4">No invoices yet</p>
              <Link to="/invoices/new" className="inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b">
                  <tr>
                    <th className="py-2 pr-4">Invoice #</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Package</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4 text-right">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="py-3 pr-4">{inv.customerName}</td>
                      <td className="py-3 pr-4">{inv.packageName}</td>
                      <td className="py-3 pr-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 text-right font-medium">{formatINR(inv.grandTotal)}</td>
                      <td className="py-3 text-right">
                        <Link to={`/invoices/${inv.id}`} className="text-brand-600 hover:underline inline-flex"><Eye className="w-4 h-4" /></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </div>
      <div className="w-11 h-11 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
