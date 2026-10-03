import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-200">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col bg-neutral-900 text-white lg:flex">
        <div className="border-b border-neutral-700 p-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-green-600 font-bold">
              R
            </span>
            <span className="font-bold uppercase">Rovado Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-neutral-300 hover:bg-neutral-800"
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-neutral-700 p-3">
          <div className="mb-3 px-3 text-xs">
            <p className="text-neutral-400">Signed in as</p>
            <p className="truncate font-bold">
              {profile?.full_name || profile?.email}
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-red-900/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-4 py-3 lg:hidden">
          <span className="font-bold uppercase">Admin</span>
          <Link to="/" className="text-xs text-green-600">
            ← Store
          </Link>
        </header>

        {/* Mobile nav row */}
        <nav className="flex gap-1 overflow-x-auto bg-white p-2 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    isActive ? "bg-green-600 text-white" : "bg-neutral-100"
                  }`
                }
              >
                <Icon size={14} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}