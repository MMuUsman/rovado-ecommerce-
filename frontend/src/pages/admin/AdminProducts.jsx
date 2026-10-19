import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

const CATEGORIES = [
  "cellphones-tablets",
  "laptops-computers",
];

const emptyForm = {
  title: "",
  name: "",
  slug: "",
  description: "",
  short_description: "",
  image: "",
  price: "",
  old_price: "",
  sale_price: "",
  badge: "",
  is_new: false,
  is_best_seller: false,
  is_popular: false,
  is_deal: false,
  is_featured: false,
  rating: "",
  reviews: "",
  shipping: "Free shipping",
  stock_quantity: 25,
  stock: "in",
  category: "cellphones-tablets",
  brand: "",
  sku: "",
  processor: "",
  ram: "",
  storage: "",
  display: "",
  operating_system: "",
  gpu: "",
  camera: "",
  is_active: true,
};

function ProductFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const resolvedName = form.title || form.name || "Product";
    const resolvedSlug = form.slug || resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload = {
      ...form,
      title: resolvedName,
      name: resolvedName,
      slug: resolvedSlug,
      price: form.price === "" ? 0 : Number(form.price),
      old_price: form.old_price === "" ? null : Number(form.old_price),
      sale_price: form.sale_price === "" ? null : Number(form.sale_price),
      stock_quantity: form.stock_quantity === "" ? 0 : Number(form.stock_quantity),
      rating: form.rating === "" ? null : Number(form.rating),
      reviews: form.reviews === "" ? null : Number(form.reviews),
      badge: form.badge || null,
      description: form.description || null,
      short_description: form.short_description || null,
      sku: form.sku || null,
      brand: form.brand || null,
      image: form.image || null,
      processor: form.processor || null,
      ram: form.ram || null,
      storage: form.storage || null,
      display: form.display || null,
      operating_system: form.operating_system || null,
      gpu: form.gpu || null,
      camera: form.camera || null,
    };

    const op = initial?.id
      ? supabase.from("products").update(payload).eq("id", initial.id)
      : supabase.from("products").insert(payload);

    let { error: err } = await op;

    if (err) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const url = initial?.id
          ? `http://localhost:4000/api/admin/products/${initial.id}`
          : "http://localhost:4000/api/admin/products";
        const method = initial?.id ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          err = null;
        }
      } catch (e) {
        console.warn("[admin-products] backend fallback error:", e);
      }
    }

    setSaving(false);

    if (err) {
      setError(err.message || "Failed to save product.");
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {initial?.id ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-neutral-100">
            <X size={16} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Image URL</label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Price *</label>
              <input
                required
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Old Price</label>
              <input
                type="number"
                step="0.01"
                name="old_price"
                value={form.old_price}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Sale Price</label>
              <input
                type="number"
                step="0.01"
                name="sale_price"
                value={form.sale_price}
                onChange={handleChange}
                placeholder="Optional discounted price"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="cellphones-tablets">Cellphones &amp; Tablets</option>
                <option value="laptops-computers">Laptops &amp; Computers</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Brand</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Apple, Samsung, Dell, Asus..."
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Stock Status</label>
              <select
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Processor / Chip</label>
              <input
                name="processor"
                value={form.processor}
                onChange={handleChange}
                placeholder="e.g. Apple M4 Pro / Snapdragon 8 Elite"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">RAM</label>
              <input
                name="ram"
                value={form.ram}
                onChange={handleChange}
                placeholder="e.g. 16GB Unified / 24GB LPDDR5X"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Storage</label>
              <input
                name="storage"
                value={form.storage}
                onChange={handleChange}
                placeholder="e.g. 512GB PCIe 4.0 SSD"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Display</label>
              <input
                name="display"
                value={form.display}
                onChange={handleChange}
                placeholder="e.g. 16.2-inch Liquid Retina XDR / 6.8-inch AMOLED"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Operating System</label>
              <input
                name="operating_system"
                value={form.operating_system}
                onChange={handleChange}
                placeholder="e.g. macOS Sequoia / Android 15 / Windows 11 Pro"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {form.category?.includes("laptop") ? "Graphics (GPU)" : "Camera Specifications"}
              </label>
              {form.category?.includes("laptop") ? (
                <input
                  name="gpu"
                  value={form.gpu}
                  onChange={handleChange}
                  placeholder="e.g. NVIDIA GeForce RTX 4080 12GB"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                />
              ) : (
                <input
                  name="camera"
                  value={form.camera}
                  onChange={handleChange}
                  placeholder="e.g. 48MP Main + 48MP Ultra-Wide + 12MP 5x Telephoto"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t pt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_best_seller"
                checked={form.is_best_seller}
                onChange={handleChange}
                className="size-4 accent-green-600"
              />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_new"
                checked={form.is_new}
                onChange={handleChange}
                className="size-4 accent-green-600"
              />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_popular"
                checked={form.is_popular}
                onChange={handleChange}
                className="size-4 accent-green-600"
              />
              Popular
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_deal"
                checked={form.is_deal}
                onChange={handleChange}
                className="size-4 accent-green-600"
              />
              Deal of the Day
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                className="size-4 accent-green-600"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="size-4 accent-green-600"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-6 py-3 text-xs font-bold uppercase text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : initial?.id ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;

    let { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        });
        if (res.ok) {
          error = null;
        }
      } catch (e) {
        console.warn("[admin-products] backend delete fallback error:", e);
      }
    }

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    load();
  };

  const handleEdit = (p) => {
    setEditing(p);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  const filtered = products.filter((p) => {
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-stone-500">
            {products.length} total · {filtered.length} showing
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-xs font-bold uppercase text-white"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white">
        {loading ? (
          <p className="p-6 text-sm text-stone-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">
            No products found. Click "Add Product" to create one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="size-10 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.title}</p>
                        <p className="text-xs text-stone-500">#{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="rounded bg-neutral-100 px-2 py-1">{p.category}</span>
                  </td>
                  <td className="p-3 font-medium">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold uppercase ${
                        p.stock === "in"
                          ? "bg-green-100 text-green-700"
                          : p.stock === "out"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.stock || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="grid size-8 place-items-center rounded bg-blue-50 text-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="grid size-8 place-items-center rounded bg-red-50 text-red-600"
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

      {showForm && (
        <ProductFormModal
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}