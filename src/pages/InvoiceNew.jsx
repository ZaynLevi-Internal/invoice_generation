import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, computeTotals, formatINR } from "../lib/api";

export default function InvoiceNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    customerName: "", mobile: "", email: "",
    packageName: "", sourceLocation: "", destinationLocation: "",
    travelDate: "", travelersCount: 1,
    packageCost: 0, gstPercentage: 18, additionalCharges: 0,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const totals = computeTotals(form);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const inv = await api.createInvoice(form);
      navigate(`/invoices/${inv.id}`);
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Invoice</h2>
        <p className="text-slate-500 text-sm">Fill in customer and tour details</p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Customer Details">
            <Field label="Customer Name *"><input required className={inp} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} /></Field>
            <Field label="Mobile Number *"><input required className={inp} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
            <Field label="Email"><input type="email" className={inp} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          </Section>

          <Section title="Tour Details">
            <Field label="Tour Package Name *"><input required className={inp} value={form.packageName} onChange={(e) => set("packageName", e.target.value)} /></Field>
            <Field label="Number of Travelers *"><input type="number" min="1" required className={inp} value={form.travelersCount} onChange={(e) => set("travelersCount", Math.max(1, +e.target.value || 1))} /></Field>
            <Field label="Source Location *"><input required className={inp} value={form.sourceLocation} onChange={(e) => set("sourceLocation", e.target.value)} /></Field>
            <Field label="Destination Location *"><input required className={inp} value={form.destinationLocation} onChange={(e) => set("destinationLocation", e.target.value)} /></Field>
            <Field label="Travel Date *"><input type="date" required className={inp} value={form.travelDate} onChange={(e) => set("travelDate", e.target.value)} /></Field>
          </Section>

          <Section title="Pricing" cols={3}>
            <Field label="Package Cost (per traveler)"><input type="number" min="0" step="0.01" className={inp} value={form.packageCost} onChange={(e) => set("packageCost", +e.target.value || 0)} /></Field>
            <Field label="GST Percentage (%)"><input type="number" min="0" step="0.01" className={inp} value={form.gstPercentage} onChange={(e) => set("gstPercentage", +e.target.value || 0)} /></Field>
            <Field label="Additional Charges"><input type="number" min="0" step="0.01" className={inp} value={form.additionalCharges} onChange={(e) => set("additionalCharges", +e.target.value || 0)} /></Field>
          </Section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-5 sticky top-20 space-y-3 text-sm">
            <h3 className="font-semibold mb-2">Summary</h3>
            <Row label="Package × Travelers" value={formatINR((form.packageCost || 0) * (form.travelersCount || 1))} />
            <Row label="Additional Charges" value={formatINR(form.additionalCharges)} />
            <div className="border-t pt-3"><Row label="Subtotal" value={formatINR(totals.subtotal)} /></div>
            <Row label={`GST (${form.gstPercentage}%)`} value={formatINR(totals.gstAmount)} />
            <div className="border-t pt-3 flex justify-between font-bold text-base">
              <span>Grand Total</span><span>{formatINR(totals.grandTotal)}</span>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button type="submit" disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg mt-2 disabled:opacity-60">
              {saving ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const inp = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm";

function Section({ title, children, cols = 2 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className={`grid sm:grid-cols-${cols} gap-4`}>{children}</div>
    </div>
  );
}
function Field({ label, children }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label>{children}</div>;
}
function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span>{value}</span></div>;
}
