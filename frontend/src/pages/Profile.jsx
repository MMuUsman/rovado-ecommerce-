import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, Camera, Trash2, Package, Truck, MapPin, CheckCircle, Heart, ShoppingCart } from "lucide-react";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabaseClient";

const navItems = ["Account info", "My order", "My wishlist", "My address", "Change password"];

/* ---------------------------------------------------------
   Avatar Component — shows photo, initials, or placeholder
--------------------------------------------------------- */
function Avatar({ src, name, size = "lg" }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || "User")
    .trim()
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = size === "lg" ? "w-full aspect-square" : "size-10";

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || "User"}
        onError={() => setImgError(true)}
        className={`${sizeClass} object-cover`}
      />
    );
  }

  // Fallback: initials on green background
  return (
    <div
      className={`${sizeClass} flex items-center justify-center bg-green-600 text-white font-bold`}
    >
      <span className={size === "lg" ? "text-5xl" : "text-sm"}>{initials}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   Main Profile Component
--------------------------------------------------------- */
export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const location = useLocation();
  const [active, setActive] = useState(
    location.state?.tab || (location.state?.orderSuccess ? "My order" : "Account info")
  );
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: "", text: "" });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Password change state
  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState({ type: "", text: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  // ---------------------------------------------------------
  // Load profile data
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user && !profile) return;

    const fullName = profile?.full_name || "";
    const parts = fullName.trim().split(" ");
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";

    setForm({
      first_name,
      last_name,
      email: profile?.email || user?.email || "",
      phone: profile?.phone || "",
    });

    setAvatarUrl(profile?.avatar_url || "");
  }, [user, profile]);

  // ---------------------------------------------------------
  // Load orders
  // ---------------------------------------------------------
  useEffect(() => {
    if (active !== "My order" || !user) return;

    setOrdersLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[profile] orders fetch:", error.message);
        setOrders([]);
      } else {
        setOrders(data ?? []);
      }
      setOrdersLoading(false);
    })();
  }, [active, user]);

  // ---------------------------------------------------------
  // Account form
  // ---------------------------------------------------------
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    setSaving(true);
    setMessage({ type: "", text: "" });

    const full_name = `${form.first_name} ${form.last_name}`.trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone: form.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    await refreshProfile();
    setMessage({ type: "success", text: "Profile updated successfully ✓" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ---------------------------------------------------------
  // Avatar Upload (optional)
  // ---------------------------------------------------------
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setAvatarMsg({ type: "error", text: "Please select an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg({ type: "error", text: "Image must be under 5 MB." });
      return;
    }

    setAvatarUploading(true);
    setAvatarMsg({ type: "", text: "" });

    // Path: avatars/{user_id}/avatar-{timestamp}.{ext}
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    // Upload
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadErr) {
      setAvatarUploading(false);
      setAvatarMsg({ type: "error", text: uploadErr.message });
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // Update profile row
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setAvatarUploading(false);

    if (updateErr) {
      setAvatarMsg({ type: "error", text: updateErr.message });
      return;
    }

    setAvatarUrl(publicUrl);
    await refreshProfile();
    setAvatarMsg({ type: "success", text: "Photo updated ✓" });
    setTimeout(() => setAvatarMsg({ type: "", text: "" }), 3000);

    // Clear input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------------------------------------------------
  // Remove Avatar (optional)
  // ---------------------------------------------------------
  const handleRemoveAvatar = async () => {
    if (!user) return;
    setAvatarUploading(true);
    setAvatarMsg({ type: "", text: "" });

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    setAvatarUploading(false);

    if (error) {
      setAvatarMsg({ type: "error", text: error.message });
      return;
    }

    setAvatarUrl("");
    await refreshProfile();
    setAvatarMsg({ type: "success", text: "Photo removed ✓" });
    setTimeout(() => setAvatarMsg({ type: "", text: "" }), 3000);
  };

  // ---------------------------------------------------------
  // Change Password
  // ---------------------------------------------------------
  const handleChangePassword = async () => {
    setPwdMsg({ type: "", text: "" });

    if (pwd.new.length < 6) {
      setPwdMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (pwd.new !== pwd.confirm) {
      setPwdMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.new });
    setPwdLoading(false);

    if (error) {
      setPwdMsg({ type: "error", text: error.message });
      return;
    }

    setPwd({ current: "", new: "", confirm: "" });
    setPwdMsg({ type: "success", text: "Password updated successfully ✓" });
    setTimeout(() => setPwdMsg({ type: "", text: "" }), 3000);
  };

  // Display name
  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "Guest User";

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Profile" },
        ]}
      />

      <section className="rounded-xl bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          {/* ---------------- SIDEBAR ---------------- */}
          <aside className="rounded-xl bg-neutral-50 p-5">
            {/* Avatar */}
            <div className="mb-4">
              <div className="mb-3 overflow-hidden rounded-xl">
                <Avatar src={avatarUrl} name={displayName} size="lg" />
              </div>

              {/* Upload / Remove buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-2 text-[11px] font-medium uppercase text-white disabled:opacity-60"
                >
                  <Camera size={12} />
                  {avatarUploading ? "…" : "Upload"}
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                    className="flex items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium uppercase text-red-600 disabled:opacity-60"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {avatarMsg.text && (
                <p
                  className={`mt-2 rounded-md px-2 py-1 text-[10px] ${
                    avatarMsg.type === "error"
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {avatarMsg.text}
                </p>
              )}
            </div>

            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="mt-2 text-sm text-stone-500">
              {profile?.email || user?.email || ""}
            </p>
            {profile?.role === "admin" && (
              <span className="mt-2 inline-block rounded-md bg-green-600 px-2 py-1 text-[10px] font-bold uppercase text-white">
                Admin
              </span>
            )}

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActive(item)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm ${
                    active === item
                      ? "bg-green-600 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {item}
                  <ChevronRight size={12} />
                </button>
              ))}
              <button
                onClick={signOut}
                className="flex w-full items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                Logout
                <ChevronRight size={12} />
              </button>
            </nav>
          </aside>

          {/* ---------------- MAIN PANEL ---------------- */}
          <div>
            <h1 className="mb-6 text-2xl font-bold capitalize">{active}</h1>

            {/* ACCOUNT INFO */}
            {active === "Account info" && (
              <div className="max-w-2xl space-y-6">
                {message.text && (
                  <p
                    className={`rounded-md px-3 py-2 text-xs ${
                      message.type === "error"
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    value={form.email}
                    disabled
                    className="w-full rounded-md bg-neutral-100 px-3 py-3 text-sm outline outline-1 outline-stone-300"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm">
                    Phone Number{" "}
                    <span className="text-neutral-400">(Optional)</span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300"
                  />
                </div>

                <button
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="rounded-xl bg-green-600 px-8 py-4 text-xs font-medium uppercase text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}

            {/* MY ORDER */}
            {active === "My order" && (
              <div className="space-y-4">
                {location.state?.orderSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800">
                    ✓ Your order was placed successfully! Thank you for your purchase.
                  </div>
                )}
                {ordersLoading && (
                  <p className="text-sm text-stone-500">Loading orders…</p>
                )}

                {!ordersLoading && orders.length === 0 && (
                  <p className="rounded-xl bg-neutral-50 p-6 text-sm text-stone-500">
                    You have no orders yet.
                  </p>
                )}

                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-stone-200 p-5 space-y-4"
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold">Order #{o.id}</p>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              (o.payment_status === "paid" || o.status === "paid")
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Payment: {o.payment_status || (o.status === "paid" ? "Paid" : "Pending")}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              o.delivery_status === "delivered" || o.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : o.delivery_status === "shipped" || o.status === "shipped"
                                ? "bg-purple-100 text-purple-800"
                                : o.delivery_status === "cancelled" || o.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            Delivery: {o.delivery_status || o.status || "processing"}
                          </span>
                          {o.payment_method === "stripe" && (
                            <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-800">
                              Stripe Sandbox {o.billing?.transaction?.card_last4 ? `(*${o.billing.transaction.card_last4})` : ""}
                            </span>
                          )}
                          {o.payment_method && o.payment_method !== "stripe" && (
                            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-700">
                              {o.payment_method}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Placed on: {new Date(o.created_at).toLocaleDateString()} at {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {o.billing?.transaction?.payment_intent_id && (
                            <span className="ml-1 text-[11px] font-mono text-stone-400">
                              · Ref: {o.billing.transaction.payment_intent_id.slice(0, 16)}…
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase text-stone-500">Order Total</p>
                        <p className="text-lg font-bold text-green-600">
                          ${Number(o.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Address & Expected Delivery */}
                    {o.billing && (
                      <div className="rounded-lg bg-neutral-50 p-3 text-xs text-stone-600">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-bold uppercase text-black text-[11px] mb-1">
                              Shipping Address:
                            </p>
                            <p>
                              {[o.billing.first_name, o.billing.last_name].filter(Boolean).join(" ")}
                            </p>
                            <p>
                              {[o.billing.address, o.billing.city, o.billing.postcode, o.billing.country].filter(Boolean).join(", ")}
                            </p>
                            {(o.billing.phone || o.billing.email) && (
                              <p className="text-stone-400 mt-0.5">
                                {[o.billing.phone, o.billing.email].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold uppercase text-black text-[11px] mb-1">
                              Estimated Delivery:
                            </p>
                            <p className="text-green-700 font-medium">
                              {o.delivery_status === "delivered" || o.status === "delivered"
                                ? "Delivered ✓"
                                : "3 – 5 business days"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items with Snapshot Details */}
                    {o.order_items?.length > 0 && (
                      <div className="space-y-3 pt-1">
                        <p className="text-xs font-bold uppercase text-stone-500">Items Ordered:</p>
                        {o.order_items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center gap-3 rounded-lg border border-neutral-100 p-2 text-sm"
                          >
                            <img
                              src={it.image}
                              alt={it.title}
                              className="size-14 rounded object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&q=80";
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-black">{it.title}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                                <span>Quantity: <b>{it.qty}</b></span>
                                <span>Unit Price: <b>${Number(it.price).toFixed(2)}</b></span>
                                <span>Subtotal: <b className="text-black">${(Number(it.price) * Number(it.qty)).toFixed(2)}</b></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cost Summary Breakdown */}
                    <div className="border-t border-stone-200 pt-3 text-xs text-stone-600">
                      <div className="flex justify-between py-0.5">
                        <span>Items Subtotal:</span>
                        <span className="font-medium text-black">
                          ${Number(o.subtotal || (Number(o.total) - Number(o.shipping_fee || 0))).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Shipping Fee:</span>
                        <span className="font-medium text-black">
                          {Number(o.shipping_fee || 0) === 0 ? "Free" : `$${Number(o.shipping_fee).toFixed(2)}`}
                        </span>
                      </div>
                      {Number(o.discount || 0) > 0 && (
                        <div className="flex justify-between py-0.5 text-green-600">
                          <span>Discount:</span>
                          <span className="font-medium">-${Number(o.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-stone-200 mt-1.5 pt-1.5 text-sm font-bold text-black">
                        <span>Grand Total:</span>
                        <span className="text-green-600">${Number(o.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MY WISHLIST */}
            {active === "My wishlist" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h2 className="text-sm font-bold uppercase text-stone-800 flex items-center gap-2">
                    <Heart size={16} className="fill-red-500 text-red-500" />
                    My Saved Items ({wishlistItems.length})
                  </h2>
                  {wishlistItems.length > 0 && (
                    <button
                      onClick={() => {
                        wishlistItems.forEach((it) => {
                          addToCart({
                            id: it.id,
                            title: it.title || it.name,
                            price: typeof it.price === "number" ? it.price : parseFloat(String(it.price || 0).replace(/[^0-9.]/g, "")),
                            image: it.image,
                            category: it.category,
                            brand: it.brand,
                          });
                        });
                      }}
                      className="rounded bg-green-600 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-green-700 transition"
                    >
                      Add All to Cart
                    </button>
                  )}
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="rounded-xl bg-neutral-50 p-8 text-center text-stone-500">
                    <Heart size={32} className="mx-auto text-stone-300 mb-2" />
                    <p className="font-medium text-sm">Your wishlist is currently empty.</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Browse our store and tap the heart icon to save products for later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-stone-200 p-3 bg-white"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="size-20 rounded-lg object-cover border border-stone-100"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-stone-900 truncate">
                            {item.title || item.name}
                          </p>
                          <p className="text-sm font-semibold text-green-600 mt-0.5">
                            {item.price}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                addToCart({
                                  id: item.id,
                                  title: item.title || item.name,
                                  price: typeof item.price === "number" ? item.price : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, "")),
                                  image: item.image,
                                  category: item.category,
                                  brand: item.brand,
                                });
                              }}
                              className="flex items-center gap-1 rounded bg-green-600 px-2.5 py-1 text-[11px] font-bold uppercase text-white hover:bg-green-700 transition"
                            >
                              <ShoppingCart size={12} /> Add to Cart
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="flex items-center gap-1 rounded border border-stone-300 px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-red-600 hover:border-red-300 transition"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY ADDRESS */}
            {active === "My address" && (
              <div className="max-w-2xl space-y-4 text-sm text-stone-600">
                {orders.length > 0 && orders[0]?.billing?.address ? (
                  <div className="rounded-xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} className="text-green-600" />
                      <h3 className="font-bold text-black">Default Shipping Address</h3>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                        From Latest Order
                      </span>
                    </div>
                    <p className="font-semibold text-black">
                      {[orders[0].billing.first_name, orders[0].billing.last_name].filter(Boolean).join(" ")}
                    </p>
                    <p className="mt-1">{orders[0].billing.address}</p>
                    <p>{[orders[0].billing.city, orders[0].billing.postcode, orders[0].billing.country].filter(Boolean).join(", ")}</p>
                    {orders[0].billing.phone && <p className="mt-2 text-xs text-stone-500">Phone: {orders[0].billing.phone}</p>}
                    {orders[0].billing.email && <p className="text-xs text-stone-500">Email: {orders[0].billing.email}</p>}
                  </div>
                ) : (
                  <div className="rounded-xl bg-neutral-50 p-6 text-stone-500">
                    <p>No saved shipping address yet.</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Your shipping address is automatically saved when you place an order.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CHANGE PASSWORD */}
            {active === "Change password" && (
              <div className="max-w-md space-y-6">
                {pwdMsg.text && (
                  <p
                    className={`rounded-md px-3 py-2 text-xs ${
                      pwdMsg.type === "error"
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {pwdMsg.text}
                  </p>
                )}

                <div>
                  <label className="mb-2 block text-sm">New Password</label>
                  <input
                    type="password"
                    value={pwd.new}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, new: e.target.value }))
                    }
                    className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm">Confirm Password</label>
                  <input
                    type="password"
                    value={pwd.confirm}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={pwdLoading}
                  className="rounded-xl bg-green-600 px-8 py-4 text-xs font-medium uppercase text-white disabled:opacity-60"
                >
                  {pwdLoading ? "Updating…" : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}