import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");           // 👈 YE ZAROORI HAI
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Orders fetch (dashboard same pattern)
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("[admin-orders] orders:", ordersData?.length, "error:", ordersErr?.message);

      if (ordersErr) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          const backendRes = await fetch("http://localhost:4000/api/admin/orders", {
            headers: { Authorization: `Bearer ${token || ""}` }
          });
          if (backendRes.ok) {
            const bOrders = await backendRes.json();
            setOrders(bOrders ?? []);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("[admin-orders] backend fallback error:", e);
        }
        setError("Orders fetch failed: " + ordersErr.message);
        setOrders([]);
        setLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // 2. Profiles fetch
      const userIds = [
        ...new Set(ordersData.map((o) => o.user_id).filter(Boolean)),
      ];

      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: pData, error: pErr } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        console.log("[admin-orders] profiles:", pData?.length, "error:", pErr?.message);

        if (!pErr && pData) {
          profilesMap = pData.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // 3. Order items fetch
      const orderIds = ordersData.map((o) => o.id);
      let itemsMap = {};

      if (orderIds.length > 0) {
        const { data: iData, error: iErr } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        console.log("[admin-orders] items:", iData?.length, "error:", iErr?.message);

        if (!iErr && iData) {
          itemsMap = iData.reduce((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push(item);
            return acc;
          }, {});
        }
      }

      // 4. Merge
      const merged = ordersData.map((o) => ({
        ...o,
        profiles: profilesMap[o.user_id] || null,
        order_items: itemsMap[o.id] || [],
      }));

      console.log("[admin-orders] merged:", merged.length);
      setOrders(merged);
    } catch (err) {
      console.error("[admin-orders] exception:", err);
      setError("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    let { data, error } = await supabase.rpc("update_order_status_admin", {
      p_order_id: id,
      p_status: status,
      p_delivery_status: status,
    });

    if (error || !data?.success) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch(`http://localhost:4000/api/admin/orders/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ status, delivery_status: status }),
        });
        if (res.ok) {
          load();
          return;
        }
      } catch (e) {
        console.warn("[admin-orders] backend status update error:", e);
      }
      alert("Update failed: " + (error?.message || data?.error || "Unknown error"));
      return;
    }
    load();
  };

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-stone-500">{orders.length} total</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Error:</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl bg-white p-4">
        <button
          onClick={() => setFilter("")}
          className={`rounded-lg px-4 py-2 text-xs font-medium uppercase ${
            filter === "" ? "bg-green-600 text-white" : "bg-neutral-100"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-xs font-medium uppercase ${
              filter === s ? "bg-green-600 text-white" : "bg-neutral-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-stone-500">
          No orders found.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-xl bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">Order #{o.id}</p>
                    {o.payment_method === "stripe" && (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-800">
                        Stripe Sandbox
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {new Date(o.created_at).toLocaleString()} ·{" "}
                    {o.profiles?.email || o.billing?.email || "Customer"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-3 py-1 text-xs font-bold uppercase ${
                      statusColors[o.status] || "bg-neutral-100"
                    }`}
                  >
                    {o.status}
                  </span>
                  <p className="text-lg font-bold text-green-600">
                    ${Number(o.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-xs uppercase text-stone-500">
                  Update status:
                </label>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="rounded border border-stone-300 px-3 py-1 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setExpanded(expanded === o.id ? null : o.id)
                  }
                  className="text-xs text-green-600 underline"
                >
                  {expanded === o.id ? "Hide items" : "View items"}
                </button>
              </div>

              {expanded === o.id && o.order_items?.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  {o.order_items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.title}
                          className="size-12 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{it.title}</p>
                        <p className="text-xs text-stone-500">
                          x {it.qty} · ${Number(it.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}