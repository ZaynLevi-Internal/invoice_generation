import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download, Trash2, Plane } from "lucide-react";
import { api, formatINR } from "../lib/api";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setInvoice(await api.getInvoice(id)); }
      catch { setInvoice(null); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!invoice) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-4">Invoice not found</p>
      <Link to="/invoices" className="bg-brand-600 text-white px-4 py-2 rounded-lg">Back to invoices</Link>
    </div>
  );

  const onDelete = async () => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    await api.deleteInvoice(invoice.id);
    navigate("/invoices");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Link to="/invoices" className="inline-flex items-center px-3 py-2 text-sm hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>
        <div className="ml-auto flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-slate-50">
            <Printer className="w-4 h-4 mr-2" /> Print
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center px-3 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </button>
          <button onClick={onDelete} className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-8 sm:p-12 print:shadow-none print:border-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b">
          <div className="flex gap-3 items-center">
            <div className="w-14 h-14 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ABS Tours and Travels</h1>
              <p className="text-sm text-slate-500">Crafting memorable journeys</p>
              <p className="text-xs text-slate-500 mt-1">123 Travel Street, Bengaluru, India · +91 98765 43210 · contact@abstours.com</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase text-slate-500 tracking-wide">Invoice</div>
            <div className="font-mono text-lg font-bold">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-500 mt-1">Date: {new Date(invoice.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-xs uppercase text-slate-500 font-semibold mb-2">Billed To</h3>
            <p className="font-medium">{invoice.customerName}</p>
            <p className="text-sm text-slate-500">{invoice.mobile}</p>
            {invoice.email && <p className="text-sm text-slate-500">{invoice.email}</p>}
          </div>
          <div>
            <h3 className="text-xs uppercase text-slate-500 font-semibold mb-2">Tour Details</h3>
            <p className="font-medium">{invoice.packageName}</p>
            <p className="text-sm text-slate-500">{invoice.sourceLocation} → {invoice.destinationLocation}</p>
            <p className="text-sm text-slate-500">Travel: {new Date(invoice.travelDate).toLocaleDateString()} · {invoice.travelersCount} traveler(s)</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3">Cost Breakdown</h3>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">{invoice.packageName}</td>
                <td className="py-3 text-right">{invoice.travelersCount}</td>
                <td className="py-3 text-right">{formatINR(invoice.packageCost)}</td>
                <td className="py-3 text-right">{formatINR(invoice.packageCost * invoice.travelersCount)}</td>
              </tr>
              {Number(invoice.additionalCharges) > 0 && (
                <tr className="border-b">
                  <td className="py-3" colSpan="3">Additional Charges</td>
                  <td className="py-3 text-right">{formatINR(invoice.additionalCharges)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
            <Row label={`GST (${invoice.gstPercentage}%)`} value={formatINR(invoice.gstAmount)} />
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Grand Total</span><span>{formatINR(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-xs text-slate-500">
          Thank you for choosing ABS Tours and Travels. Have a wonderful journey!
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span>{value}</span></div>;
}
