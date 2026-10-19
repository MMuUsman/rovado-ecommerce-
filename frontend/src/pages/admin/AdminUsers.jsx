import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "customer" : "admin";
    if (!confirm(`Change ${u.email} to ${newRole}?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", u.id);

    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    load();
  };

  const handleDelete = async (u) => {
    if (u.id === user.id) {
      alert("You can't delete yourself.");
      return;
    }
    if (!confirm(`Delete user ${u.email}? This action cannot be undone.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`http://localhost:4000/api/admin/users/${u.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      if (res.ok) {
        alert("User deleted successfully.");
        load();
      } else {
        const { error: directErr } = await supabase.from("profiles").delete().eq("id", u.id);
        if (directErr) {
          alert("Delete failed: " + directErr.message);
        } else {
          load();
        }
      }
    } catch {
      const { error: directErr } = await supabase.from("profiles").delete().eq("id", u.id);
      if (directErr) {
        alert("Delete failed: " + directErr.message);
      } else {
        load();
      }
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-stone-500">{users.length} total</p>
      </div>

      <div className="rounded-xl bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white">
        {loading ? (
          <p className="p-6 text-sm text-stone-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-neutral-100">
                  <td className="p-3">
                    <p className="font-medium">{u.full_name || "—"}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                  </td>
                  <td className="p-3 text-stone-500">{u.phone || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold uppercase ${
                        u.role === "admin"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-stone-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleRole(u)}
                        className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
                      >
                        {u.role === "admin" ? "Make Customer" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="grid size-8 place-items-center rounded bg-red-50 text-red-600"
                        disabled={u.id === user.id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}