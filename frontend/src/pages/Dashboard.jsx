import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, IndianRupee, Plus, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;

  const cards = [
    { label: 'Total Invoices', value: stats?.total || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'bg-amber-500' },
    { label: 'Paid', value: stats?.paid || 0, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-violet-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <Link to="/invoices/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-white`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
            <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
          </div>
          {stats?.recent?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Invoice #</th>
                    <th className="text-left px-3 py-2 font-medium">Customer</th>
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Total</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-900">
                        <Link to={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{inv.customerName}</td>
                      <td className="px-3 py-2 text-slate-500">{inv.travelDate}</td>
                      <td className="px-3 py-2 text-slate-900 font-medium">₹{inv.totalAmount.toFixed(2)}</td>
                      <td className="px-3 py-2"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No invoices yet.</p>
          )}
        </div>

        {/* Popular Packages */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Popular Packages</h3>
          </div>
          {stats?.popularPackages?.length > 0 ? (
            <div className="space-y-3">
              {stats.popularPackages.map((pkg, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 truncate max-w-[200px]">{pkg.tourPackage}</span>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{pkg.count} bookings</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
