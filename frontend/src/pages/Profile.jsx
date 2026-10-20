import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Camera,
  Trash2,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Heart,
  ShoppingCart,
  Plus,
  Edit2,
  ArrowLeft,
  X,
} from "lucide-react";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useLoading, RovadoLoadingScreen } from "../context/LoadingContext";
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
export default function Profile({ defaultTab }) {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    if (orderId || location.pathname.includes("/orders")) return "My order";
    if (location.pathname.includes("/address")) return "My address";
    if (location.state?.tab) return location.state.tab;
    if (location.state?.orderSuccess) return "My order";
    return "Account info";
  };

  const [active, setActive] = useState(getInitialTab);

  useEffect(() => {
    if (orderId || location.pathname.includes("/orders")) {
      setActive("My order");
    } else if (location.pathname.includes("/address")) {
      setActive("My address");
    } else if (defaultTab) {
      setActive(defaultTab);
    }
  }, [location.pathname, defaultTab, orderId]);

  // Protect route: Redirect to login if unauthenticated once auth finishes loading
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: location.pathname }, replace: true });
    }
  }, [authLoading, user, location.pathname, navigate]);

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
  const [ordersError, setOrdersError] = useState(null);

  // Address book state
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    is_default: false,
  });
  const [addressMsg, setAddressMsg] = useState({ type: "", text: "" });

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
  // Load orders (resilient query with relational + 2-step fallback)
  // ---------------------------------------------------------
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      // Step 1: Try direct relational join
      const { data: relationalData, error: relationalErr } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!relationalErr && Array.isArray(relationalData)) {
        setOrders(relationalData);
        setOrdersLoading(false);
        return;
      }

      console.warn("[profile] Relational order query failed, using two-step query:", relationalErr?.message);

      // Step 2: Reliable two-step query
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersErr) {
        console.error("[profile] orders query error:", ordersErr);
        setOrdersError(ordersErr.message || "Failed to load orders from database.");
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsErr) {
        console.warn("[profile] order_items fetch warning:", itemsErr);
      }

      const itemsByOrderId = {};
      (itemsData || []).forEach((item) => {
        if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
        itemsByOrderId[item.order_id].push(item);
      });

      const assembled = ordersData.map((order) => ({
        ...order,
        order_items: itemsByOrderId[order.id] || [],
      }));

      setOrders(assembled);
    } catch (err) {
      console.error("[profile] order fetch exception:", err);
      setOrdersError(err.message || "An unexpected error occurred while loading orders.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (active === "My order" && user?.id) {
      fetchOrders();
    }
  }, [active, user?.id, fetchOrders]);

  // ---------------------------------------------------------
  // Load addresses
  // ---------------------------------------------------------
  const fetchAddresses = async () => {
    if (!user) return;
    setAddressLoading(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[profile] addresses fetch:", error.message);
        setAddresses([]);
      } else {
        setAddresses(data ?? []);
      }
    } catch (err) {
      console.warn("[profile] addresses exception:", err);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (active === "My address" && user) {
      fetchAddresses();
    }
  }, [active, user]);

  // ---------------------------------------------------------
  // Navigation Handler
  // ---------------------------------------------------------
  const handleNavSelect = (item) => {
    setActive(item);
    if (item === "My order") {
      navigate("/profile/orders");
    } else if (item === "My address") {
      navigate("/profile/address");
    } else if (item === "Account info") {
      navigate("/profile");
    }
  };

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
  // Avatar Upload
  // ---------------------------------------------------------
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadErr) {
      setAvatarUploading(false);
      setAvatarMsg({ type: "error", text: uploadErr.message });
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
  // Address Book Handlers
  // ---------------------------------------------------------
  const handleSaveAddress = async (e) => {
    e?.preventDefault();
    if (!user) return;

    if (!addressForm.full_name.trim() || !addressForm.address_line.trim() || !addressForm.city.trim() || !addressForm.postal_code.trim()) {
      setAddressMsg({ type: "error", text: "Please fill in all required fields (Name, Address, City, Postal Code)." });
      return;
    }

    setAddressSaving(true);
    setAddressMsg({ type: "", text: "" });

    try {
      if (addressForm.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingAddressId) {
        const { error } = await supabase
          .from("addresses")
          .update({
            full_name: addressForm.full_name.trim(),
            phone: addressForm.phone.trim(),
            address_line: addressForm.address_line.trim(),
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            postal_code: addressForm.postal_code.trim(),
            country: addressForm.country.trim() || "United States",
            is_default: addressForm.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAddressId)
          .eq("user_id", user.id);

        if (error) throw error;
        setAddressMsg({ type: "success", text: "Address updated successfully ✓" });
      } else {
        const isFirst = addresses.length === 0;
        const { error } = await supabase.from("addresses").insert({
          user_id: user.id,
          full_name: addressForm.full_name.trim(),
          phone: addressForm.phone.trim(),
          address_line: addressForm.address_line.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          postal_code: addressForm.postal_code.trim(),
          country: addressForm.country.trim() || "United States",
          is_default: isFirst ? true : addressForm.is_default,
        });

        if (error) throw error;
        setAddressMsg({ type: "success", text: "Address saved successfully ✓" });
      }

      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        full_name: "",
        phone: "",
        address_line: "",
        city: "",
        state: "",
        postal_code: "",
        country: "United States",
        is_default: false,
      });
      await fetchAddresses();
      setTimeout(() => setAddressMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setAddressMsg({ type: "error", text: err.message || "Failed to save address." });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone || "",
      address_line: addr.address_line,
      city: addr.city,
      state: addr.state || "",
      postal_code: addr.postal_code,
      country: addr.country || "United States",
      is_default: addr.is_default || false,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addrId)
      .eq("user_id", user.id);

    if (!error) {
      setAddresses((prev) => prev.filter((a) => a.id !== addrId));
      setAddressMsg({ type: "success", text: "Address deleted ✓" });
      setTimeout(() => setAddressMsg({ type: "", text: "" }), 3000);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", addrId).eq("user_id", user.id);
    await fetchAddresses();
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

  // Filter single order if orderId param is present
  const focusedOrder = orderId ? orders.find((o) => String(o.id) === String(orderId)) : null;

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
                  onClick={() => handleNavSelect(item)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition ${
                    active === item
                      ? "bg-green-600 text-white font-medium"
                      : "bg-white text-black hover:bg-stone-100"
                  }`}
                >
                  {item}
                  <ChevronRight size={12} />
                </button>
              ))}
              <button
                onClick={signOut}
                className="flex w-full items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 hover:bg-red-100 transition"
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
                  className="rounded-xl bg-green-600 px-8 py-4 text-xs font-medium uppercase text-white hover:bg-green-700 transition disabled:opacity-60"
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

                {orderId && (
                  <div className="flex items-center justify-between rounded-xl bg-neutral-100 p-3 text-xs">
                    <span className="font-bold">Focusing on Order #{orderId}</span>
                    <Link
                      to="/profile/orders"
                      className="flex items-center gap-1 font-bold text-green-700 hover:underline"
                    >
                      <ArrowLeft size={12} /> View all orders
                    </Link>
                  </div>
                )}

                {ordersLoading && (
                  <RovadoLoadingScreen message="Loading your orders..." fullScreen={false} />
                )}

                {ordersError && !ordersLoading && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
                    <p className="font-bold text-sm text-red-800 mb-1">Failed to load orders</p>
                    <p className="mb-4">{ordersError}</p>
                    <button
                      type="button"
                      onClick={fetchOrders}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="rounded-xl bg-neutral-50 p-8 text-center text-sm text-stone-500">
                    <Package size={36} className="mx-auto mb-2 text-stone-300" />
                    <p className="font-medium text-black">You have no orders yet.</p>
                    <p className="mt-1 text-xs text-stone-400">
                      When you place an order, it will appear here with live tracking and receipts.
                    </p>
                    <Link
                      to="/cellphones"
                      className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-green-700"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}

                {/* Render Orders list or focused order */}
                {(focusedOrder ? [focusedOrder] : orders).map((o) => (
                  <div
                    key={o.id}
                    className={`rounded-xl border transition p-5 space-y-4 ${
                      String(o.id) === String(orderId)
                        ? "border-green-600 shadow-md ring-1 ring-green-600/30"
                        : "border-stone-200"
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/profile/orders/${o.id}`}
                            className="text-sm font-bold hover:text-green-600 transition"
                          >
                            Order #{o.id}
                          </Link>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              o.payment_status === "paid" || o.status === "paid"
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

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="text-xs uppercase text-stone-500">Order Total</p>
                          <p className="text-lg font-bold text-green-600">
                            ${Number(o.total).toFixed(2)}
                          </p>
                        </div>
                        <Link
                          to={`/profile/orders/${o.id}`}
                          className="hidden sm:inline-block rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold uppercase hover:bg-stone-50 transition"
                        >
                          Details
                        </Link>
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
                            <p className="font-medium text-stone-800">
                              {[o.billing.first_name, o.billing.last_name].filter(Boolean).join(" ")}
                            </p>
                            <p>
                              {[o.billing.address || o.billing.street, o.billing.city, o.billing.postcode || o.billing.zip, o.billing.country].filter(Boolean).join(", ")}
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
                                <span>Item Total: <b className="text-black">${(Number(it.price) * Number(it.qty)).toFixed(2)}</b></span>
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
                          ${Number(o.subtotal || (Number(o.total) - Number(o.shipping || o.shipping_fee || 0) - Number(o.tax || 0))).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Shipping Fee:</span>
                        <span className="font-medium text-black">
                          {Number(o.shipping || o.shipping_fee || 0) === 0 ? "Free" : `$${Number(o.shipping || o.shipping_fee).toFixed(2)}`}
                        </span>
                      </div>
                      {Number(o.tax || 0) > 0 && (
                        <div className="flex justify-between py-0.5">
                          <span>Estimated Tax:</span>
                          <span className="font-medium text-black">${Number(o.tax).toFixed(2)}</span>
                        </div>
                      )}
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
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase text-stone-800 flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />
                      Saved Delivery Addresses ({addresses.length})
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Manage your delivery destinations for quick 1-click checkout.
                    </p>
                  </div>
                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({
                          full_name: `${form.first_name} ${form.last_name}`.trim(),
                          phone: form.phone || "",
                          address_line: "",
                          city: "",
                          state: "",
                          postal_code: "",
                          country: "United States",
                          is_default: addresses.length === 0,
                        });
                        setShowAddressForm(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-bold uppercase text-white hover:bg-green-700 transition"
                    >
                      <Plus size={14} /> Add Address
                    </button>
                  )}
                </div>

                {addressMsg.text && (
                  <p
                    className={`rounded-md px-3 py-2 text-xs ${
                      addressMsg.type === "error"
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {addressMsg.text}
                  </p>
                )}

                {/* Add / Edit Address Form */}
                {showAddressForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="rounded-xl border border-green-300 bg-green-50/40 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-green-200/60 pb-2">
                      <h3 className="text-sm font-bold text-stone-900">
                        {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="text-stone-400 hover:text-black"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.full_name}
                          onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="e.g. +1 206-555-0199"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-700">
                        Address Line / Street <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.address_line}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
                        placeholder="House / Street / Apartment / Suite"
                        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700">
                          City <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="e.g. Seattle"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="e.g. Washington"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700">
                          Postal Code <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                          placeholder="e.g. 98101"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-700">
                        Country <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={addressForm.is_default}
                        onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                        className="size-4 rounded text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="is_default" className="text-xs text-stone-700 cursor-pointer">
                        Set as primary / default shipping address
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={addressSaving}
                        className="rounded-lg bg-green-600 px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-green-700 transition disabled:opacity-60"
                      >
                        {addressSaving ? "Saving…" : editingAddressId ? "Update Address" : "Save Address"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="rounded-lg border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addressLoading && (
                  <RovadoLoadingScreen message="Loading saved addresses..." fullScreen={false} />
                )}

                {/* Addresses list */}
                {!addressLoading && addresses.length === 0 && !showAddressForm && (
                  <div className="rounded-xl bg-neutral-50 p-8 text-center text-stone-500">
                    <MapPin size={32} className="mx-auto text-stone-300 mb-2" />
                    <p className="font-medium text-sm text-black">No saved addresses yet.</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Save your shipping address now to speed up future checkout orders.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({
                          full_name: `${form.first_name} ${form.last_name}`.trim(),
                          phone: form.phone || "",
                          address_line: "",
                          city: "",
                          state: "",
                          postal_code: "",
                          country: "United States",
                          is_default: true,
                        });
                        setShowAddressForm(true);
                      }}
                      className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-green-700"
                    >
                      Add Address
                    </button>
                  </div>
                )}

                {!addressLoading && addresses.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`rounded-xl border p-5 transition ${
                          addr.is_default
                            ? "border-green-600 bg-green-50/20 shadow-sm"
                            : "border-stone-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-black">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!addr.is_default && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[11px] font-semibold text-stone-500 hover:text-green-600"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEditAddress(addr)}
                              className="flex items-center gap-1 rounded border border-stone-200 px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-black"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="flex items-center gap-1 rounded border border-stone-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-stone-700">{addr.address_line}</p>
                        <p className="text-sm text-stone-700">
                          {[addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(", ")}
                        </p>
                        {addr.phone && (
                          <p className="mt-1 text-xs text-stone-400">Phone: {addr.phone}</p>
                        )}
                      </div>
                    ))}
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
                  className="rounded-xl bg-green-600 px-8 py-4 text-xs font-medium uppercase text-white hover:bg-green-700 transition disabled:opacity-60"
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