import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import AirportSelect from './AirportSelect';

export default function InvoiceForm({ initialData, onSubmit, submitLabel = 'Save Invoice', isEdit = false }) {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerMobile: '',
    sourceLocation: '',
    destinationLocation: '',
    tourPackage: '',
    travelDate: '',
    returnDate: '',
    numberOfPassengers: 1,
    baseAmount: '',
    gstRate: 18,
    status: 'Pending',
    notes: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [totals, setTotals] = useState({ baseTotal: 0, gstAmount: 0, total: 0 });

  useEffect(() => {
    const num = parseInt(form.numberOfPassengers) || 1;
    const base = parseFloat(form.baseAmount) || 0;
    const gst = parseFloat(form.gstRate) || 0;
    const baseTotal = base * num;
    const gstAmount = (baseTotal * gst) / 100;
    setTotals({ baseTotal, gstAmount, total: baseTotal + gstAmount });
  }, [form.baseAmount, form.gstRate, form.numberOfPassengers]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = 'Valid email required';
    if (!form.customerMobile.trim() || !/^\d{10}$/.test(form.customerMobile)) e.customerMobile = '10-digit mobile required';
    if (!form.sourceLocation) e.sourceLocation = 'Required';
    if (!form.destinationLocation) e.destinationLocation = 'Required';
    if (!form.tourPackage.trim()) e.tourPackage = 'Required';
    if (!form.travelDate) e.travelDate = 'Required';
    if (!form.baseAmount || parseFloat(form.baseAmount) <= 0) e.baseAmount = 'Must be > 0';
    if (parseInt(form.numberOfPassengers) < 1) e.numberOfPassengers = 'Min 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="card md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input type="text" className="input" value={form.customerName} onChange={e => handleChange('customerName', e.target.value)} />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input type="email" className="input" value={form.customerEmail} onChange={e => handleChange('customerEmail', e.target.value)} />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>
            <div>
              <label className="label">Mobile <span className="text-red-500">*</span></label>
              <input type="tel" className="input" maxLength={10} value={form.customerMobile} onChange={e => handleChange('customerMobile', e.target.value.replace(/\D/g, ''))} />
              {errors.customerMobile && <p className="text-red-500 text-xs mt-1">{errors.customerMobile}</p>}
            </div>
          </div>
        </div>

        {/* Travel Info */}
        <div className="card md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Travel Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AirportSelect
              label="Source Airport"
              value={form.sourceLocation}
              onChange={v => handleChange('sourceLocation', v)}
              placeholder="Search by code or name..."
              required
            />
            {errors.sourceLocation && <p className="text-red-500 text-xs -mt-3">{errors.sourceLocation}</p>}

            <AirportSelect
              label="Destination Airport"
              value={form.destinationLocation}
              onChange={v => handleChange('destinationLocation', v)}
              placeholder="Search by code or name..."
              required
            />
            {errors.destinationLocation && <p className="text-red-500 text-xs -mt-3">{errors.destinationLocation}</p>}

            <div>
              <label className="label">Tour Package <span className="text-red-500">*</span></label>
              <input type="text" className="input" value={form.tourPackage} onChange={e => handleChange('tourPackage', e.target.value)} placeholder="e.g. Golden Triangle Tour" />
              {errors.tourPackage && <p className="text-red-500 text-xs mt-1">{errors.tourPackage}</p>}
            </div>
            <div>
              <label className="label">Travel Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.travelDate} onChange={e => handleChange('travelDate', e.target.value)} />
              {errors.travelDate && <p className="text-red-500 text-xs mt-1">{errors.travelDate}</p>}
            </div>
            <div>
              <label className="label">Return Date</label>
              <input type="date" className="input" value={form.returnDate || ''} onChange={e => handleChange('returnDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Passengers <span className="text-red-500">*</span></label>
              <input type="number" min={1} className="input" value={form.numberOfPassengers} onChange={e => handleChange('numberOfPassengers', e.target.value)} />
              {errors.numberOfPassengers && <p className="text-red-500 text-xs mt-1">{errors.numberOfPassengers}</p>}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Base Amount (per person) <span className="text-red-500">*</span></label>
              <input type="number" min={0} step={0.01} className="input" value={form.baseAmount} onChange={e => handleChange('baseAmount', e.target.value)} />
              {errors.baseAmount && <p className="text-red-500 text-xs mt-1">{errors.baseAmount}</p>}
            </div>
            <div>
              <label className="label">GST Rate (%)</label>
              <input type="number" min={0} className="input" value={form.gstRate} onChange={e => handleChange('gstRate', e.target.value)} />
            </div>
            {isEdit && (
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-6 bg-slate-50 rounded-lg p-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <div className="text-sm space-x-4">
              <span>Base Total: <strong className="text-slate-900">₹{totals.baseTotal.toFixed(2)}</strong></span>
              <span>GST: <strong className="text-slate-900">₹{totals.gstAmount.toFixed(2)}</strong></span>
              <span>Grand Total: <strong className="text-blue-700 text-lg">₹{totals.total.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card md:col-span-2">
          <label className="label">Notes</label>
          <textarea className="input min-h-[80px]" rows={3} value={form.notes || ''} onChange={e => handleChange('notes', e.target.value)} placeholder="Additional notes..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
