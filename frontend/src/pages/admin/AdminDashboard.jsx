import { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

function StatCard({ icon: Icon, label, value, color = "green" }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-stone-100">
      <div className={`mb-3 grid size-10 place-items-center rounded-lg ${colors[color] || colors.green}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs uppercase font-semibold text-stone-500">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [prodRes, orderRes, userRes] = await Promise.all([
        supabase.from("products").select("id, stock_quantity, stock"),
        supabase.from("orders").select("total, created_at, id, status, delivery_status, profiles(email)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      let orders = orderRes.data ?? [];
      if (orderRes.error) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch("http://localhost:4000/api/admin/orders", {
            headers: { Authorization: `Bearer ${session?.access_token || ""}` },
          });
          if (res.ok) {
            orders = await res.json();
          }
        } catch (e) {
          console.warn("[dashboard] backend fallback error:", e);
        }
      }

      const revenue = (orders || []).reduce((s, o) => s + Number(o.total || 0), 0);
      const pendingOrders = (orders || []).filter((o) => (o.status || "").toLowerCase() === "pending").length;
      const deliveredOrders = (orders || []).filter((o) => (o.status || "").toLowerCase() === "delivered" || (o.delivery_status || "").toLowerCase() === "delivered").length;
      const lowStock = (prodRes.data || []).filter((p) => p.stock === "out" || (p.stock_quantity != null && p.stock_quantity <= 5)).length;

      setStats({
        products: prodRes.data?.length ?? 0,
        orders: (orders || []).length,
        users: userRes.count ?? 0,
        revenue,
        pendingOrders,
        deliveredOrders,
        lowStock,
      });

      setRecentOrders((orders || []).slice(0, 8));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-sm text-stone-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Store overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats.products} color="green" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders} color="blue" />
        <StatCard icon={Users} label="Total Users" value={stats.users} color="purple" />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          color="yellow"
        />
        <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} color="yellow" />
        <StatCard icon={CheckCircle2} label="Delivered Orders" value={stats.deliveredOrders} color="green" />
        <StatCard icon={AlertTriangle} label="Low Stock Products" value={stats.lowStock} color="red" />
      </div>

      <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-stone-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-stone-500">
                  <th className="py-2">Order</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">#{o.id}</td>
                    <td className="py-3 text-stone-500">{o.profiles?.email || "—"}</td>
                    <td className="py-3">
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold uppercase text-green-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold">
                      ${Number(o.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}