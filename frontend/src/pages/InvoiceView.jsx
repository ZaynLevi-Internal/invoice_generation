import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Printer, Download, Pencil, Trash2, MapPin,
  Calendar, Users, Package, Mail, Phone, Receipt, Calculator
} from 'lucide-react';
import { api } from '../lib/api';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInvoice(id)
      .then(setInvoice)
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.deleteInvoice(id);
      navigate('/invoices');
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // Trigger print to PDF
    window.print();
  };

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.updateStatus(id, status);
      setInvoice(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-20 text-slate-500">Loading...</div>
    </Layout>
  );

  if (!invoice) return null;

  const numPassengers = invoice.numberOfPassengers || 1;
  const baseTotal = invoice.baseAmount * numPassengers;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={invoice.status} />
                <span className="text-sm text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {invoice.status !== 'Paid' && (
              <button onClick={() => handleStatusChange('Paid')} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                Mark Paid
              </button>
            )}
            {invoice.status !== 'Cancelled' && (
              <button onClick={() => handleStatusChange('Cancelled')} className="btn-secondary text-red-600 ring-red-300 hover:bg-red-50">
                Cancel
              </button>
            )}
            <button onClick={handlePrint} className="btn-secondary">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <Link to={`/invoices/${id}/edit`} className="btn-secondary">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-danger">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="card print:shadow-none print:ring-0" id="invoice-print">
          <div className="border-b border-slate-200 pb-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">ABS Tours & Travels</h1>
            </div>
            <p className="text-sm text-slate-500">Invoice Generation System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Customer */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Bill To</h4>
              <p className="text-lg font-medium text-slate-900">{invoice.customerName}</p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {invoice.customerEmail}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {invoice.customerMobile}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="md:text-right">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Invoice Details</h4>
              <p className="text-sm text-slate-600"><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
              <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Status:</span> {invoice.status}</p>
            </div>
          </div>

          {/* Travel Details */}
          <div className="bg-slate-50 rounded-lg p-4 mb-8">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Travel Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-slate-500">Source</p>
                  <p className="font-medium text-slate-900">{invoice.sourceLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-slate-500">Destination</p>
                  <p className="font-medium text-slate-900">{invoice.destinationLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-violet-600 mt-0.5" />
                <div>
                  <p className="text-slate-500">Package</p>
                  <p className="font-medium text-slate-900">{invoice.tourPackage}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-slate-500">Travel Date</p>
                  <p className="font-medium text-slate-900">{invoice.travelDate}</p>
                  {invoice.returnDate && <p className="text-slate-500 text-xs">Return: {invoice.returnDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Rate</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 text-slate-900">{invoice.tourPackage}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{numPassengers}</td>
                  <td className="px-4 py-3 text-right text-slate-700">₹{invoice.baseAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-900 font-medium">₹{baseTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">₹{baseTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST ({invoice.gstRate}%)</span>
                  <span className="font-medium text-slate-900">₹{invoice.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-base font-semibold text-slate-900">Grand Total</span>
                  <span className="text-lg font-bold text-blue-700">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">Notes</p>
              <p className="text-amber-700">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
