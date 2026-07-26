import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./lib/api";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InvoiceList from "./pages/InvoiceList.jsx";
import InvoiceNew from "./pages/InvoiceNew.jsx";
import InvoiceView from "./pages/InvoiceView.jsx";
import Layout from "./components/Layout.jsx";

function Private({ children }) {
  return auth.isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<Private><Layout><Dashboard /></Layout></Private>}
      />
      <Route
        path="/invoices"
        element={<Private><Layout><InvoiceList /></Layout></Private>}
      />
      <Route
        path="/invoices/new"
        element={<Private><Layout><InvoiceNew /></Layout></Private>}
      />
      <Route
        path="/invoices/:id"
        element={<Private><Layout><InvoiceView /></Layout></Private>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
