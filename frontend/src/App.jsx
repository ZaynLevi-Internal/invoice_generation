import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceNew from './pages/InvoiceNew';
import InvoiceView from './pages/InvoiceView';
import InvoiceEdit from './pages/InvoiceEdit';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/invoices" element={<PrivateRoute><AppLayout><InvoiceList /></AppLayout></PrivateRoute>} />
      <Route path="/invoices/new" element={<PrivateRoute><AppLayout><InvoiceNew /></AppLayout></PrivateRoute>} />
      <Route path="/invoices/:id" element={<PrivateRoute><AppLayout><InvoiceView /></AppLayout></PrivateRoute>} />
      <Route path="/invoices/:id/edit" element={<PrivateRoute><AppLayout><InvoiceEdit /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
