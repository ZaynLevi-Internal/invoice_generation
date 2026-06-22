import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import Layout from '../components/Layout';
import InvoiceForm from '../components/InvoiceForm';

export default function InvoiceEdit() {
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

  const handleSubmit = async (form) => {
    try {
      await api.updateInvoice(id, form);
      navigate(`/invoices/${id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-20 text-slate-500">Loading...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Edit Invoice</h2>
          <span className="text-sm text-slate-500 ml-2">{invoice?.invoiceNumber}</span>
        </div>
        <InvoiceForm
          initialData={invoice}
          onSubmit={handleSubmit}
          submitLabel="Update Invoice"
          isEdit
        />
      </div>
    </Layout>
  );
}
