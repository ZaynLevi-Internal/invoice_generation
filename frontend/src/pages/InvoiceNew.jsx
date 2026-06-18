import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import Layout from '../components/Layout';
import InvoiceForm from '../components/InvoiceForm';

export default function InvoiceNew() {
  const navigate = useNavigate();

  const handleSubmit = async (form) => {
    try {
      await api.createInvoice(form);
      navigate('/invoices');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Create Invoice</h2>
        </div>
        <InvoiceForm onSubmit={handleSubmit} submitLabel="Create Invoice" />
      </div>
    </Layout>
  );
}
