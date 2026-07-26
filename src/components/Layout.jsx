import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, FileText, PlusCircle, LogOut, Plane, Menu, X } from "lucide-react";
import { auth } from "../lib/api";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/invoices/new", label: "New Invoice", icon: PlusCircle },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (item) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-brand-900 text-white transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">ABS Tours</div>
              <div className="text-xs opacity-70">& Travels</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                isActive(item)
                  ? "bg-brand-500 text-white"
                  : "hover:bg-white/10 text-white/90"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="no-print h-14 bg-white border-b flex items-center px-4 lg:px-6 sticky top-0 z-20">
          <button className="lg:hidden mr-2" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Invoice Generation System</h1>
          <div className="ml-auto text-sm text-slate-500 hidden sm:block">Admin</div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
