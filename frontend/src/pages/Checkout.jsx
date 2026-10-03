import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

function Field({ label, required, placeholder, type = "text", optional, value, onChange, name }) {
  return (
    <div>
      <label className="mb-2 block text-sm">
        {label} {required && <span className="text-red-600">*</span>}
        {optional && <span className="text-neutral-400">(Optional)</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
      />
    </div>
  );
}

function Select({ label, required, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex items-center justify-between rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300">
        {value}
        <ChevronDown size={12} />
      </div>
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payment, setPayment] = useState("bank");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState({
    first_name: "", last_name: "", company: "", country: "United States (US)",
    street: "", apartment: "", city: "", state: "Washington",
    zip: "", phone: "", email: user?.email ?? "", notes: "",
  });

  const shipping = subtotal * 0.01;
  const tax = subtotal * 0.02; 
  const total = subtotal + shipping + tax;

  const handleChange = (e) =>
    setBilling((b) => ({ ...b, [e.target.name]: e.target.value }));

  const placeOrder = async () => {
    setError("");
    if (!user) { navigate("/login", { state: { from: "/checkout" } }); return; }
    if (items.length === 0) { setError("Your cart is empty."); return; }

    setLoading(true);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal, shipping, tax, total,
        status: "pending",
        payment_method: payment,
        billing,
        notes: billing.notes,
      })
      .select()
      .single();

    if (orderErr) { setLoading(false); setError(orderErr.message); return; }

    const lineItems = items.map((i) => ({
      order_id: order.id,
      product_id: typeof i.id === "number" ? i.id : null,
      title: i.title,
      price: i.price,
      qty: i.qty,
      image: i.image,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(lineItems);
    setLoading(false);

    if (itemsErr) { setError(itemsErr.message); return; }

    clearCart();
    navigate("/", { replace: true });
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pages", href: "/" }, { label: "Checkout" }]} />

      <section className="rounded-xl bg-white p-4 sm:p-6">
        <h1 className="mb-6 text-lg font-bold uppercase">Checkout</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-stone-200 p-4">
            <span className="text-2xl">🔑</span>
            <p className="text-sm">
              Returning customer? <a href="/login" className="text-red-600 underline">Click here to log in</a>
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-stone-200 p-4">
            <span className="text-2xl">🏷️</span>
            <p className="text-sm">
              Have a coupon? <a href="#" className="text-red-600 underline">Click here to enter your code</a>
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-base font-bold">Billing Detail</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="First Name" name="first_name" value={billing.first_name} onChange={handleChange} required />
              <Field label="Last Name" name="last_name" value={billing.last_name} onChange={handleChange} required />
            </div>
            <div className="mt-6">
              <Field label="Company Name" name="company" value={billing.company} onChange={handleChange} optional />
            </div>
            <div className="mt-6">
              <Select label="Country / Region" required value="United States (US)" />
            </div>
            <div className="mt-6">
              <Field label="Street Address" name="street" value={billing.street} onChange={handleChange}
                placeholder="House number and street name ..." />
            </div>
            <div className="mt-4">
              <input
                name="apartment"
                value={billing.apartment}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, etc (Optional)"
                className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
              />
            </div>
            <div className="mt-6">
              <Field label="Town / City" name="city" value={billing.city} onChange={handleChange} required />
            </div>
            <div className="mt-6">
              <Select label="State / County" required value="Washington" />
            </div>
            <div className="mt-6">
              <Field label="Zip Code" name="zip" value={billing.zip} onChange={handleChange} required />
            </div>
            <div className="mt-6">
              <Field label="Phone Number" name="phone" value={billing.phone} onChange={handleChange} required />
            </div>
            <div className="mt-6">
              <Field label="Email Address" name="email" value={billing.email} onChange={handleChange} required type="email" />
            </div>
            <label className="mt-6 flex items-center gap-3 text-sm">
              <input type="checkbox" className="size-3.5 rounded-sm border-black/25" />
              Create an account?
            </label>

            <h2 className="mb-4 mt-10 text-base font-bold">Additional Information</h2>
            <label className="mb-2 block text-sm">
              Order Notes <span className="text-neutral-400">(Optional)</span>
            </label>
            <textarea
              name="notes"
              value={billing.notes}
              onChange={handleChange}
              placeholder="Note about your order, e.g. special note for delivery"
              rows={4}
              className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
            />
          </div>

          <div>
            <h2 className="mb-6 text-base font-bold">Your Order</h2>

            <div className="mb-6 rounded-xl bg-gray-100 p-6">
              <div className="flex justify-between border-b border-zinc-200 pb-3 text-xs font-medium uppercase text-stone-500">
                <span>Product</span>
                <span>Sub total</span>
              </div>

              {items.length === 0 && (
                <p className="py-6 text-center text-sm text-stone-500">Your cart is empty.</p>
              )}

              {items.map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-4 border-b border-zinc-200 py-4">
                  <div className="flex gap-3">
                    <img src={i.image} alt={i.title} className="size-14 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium">{i.title}</p>
                      <p className="text-sm text-stone-500">x {i.qty}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">${(i.price * i.qty).toFixed(2)}</p>
                </div>
              ))}

              <div className="flex items-center justify-between py-3 text-sm">
                <span>Shipping</span>
                <span className="text-red-600">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span>Tax</span>
                <span className="text-red-600">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span>Order Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 rounded-xl bg-zinc-200 p-6">
              {[
                { key: "bank", title: "Direct Bank Transfer",
                  desc: "Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account." },
                { key: "cod", title: "Cash on Delivery" },
                { key: "paypal", title: "Paypal" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === opt.key}
                    onChange={() => setPayment(opt.key)}
                    className="mt-1 size-4 accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-bold">{opt.title}</p>
                    {opt.desc && <p className="mt-1 text-xs text-stone-500">{opt.desc}</p>}
                  </div>
                </label>
              ))}
              <button
                onClick={placeOrder}
                disabled={loading || items.length === 0}
                className="w-full rounded-xl bg-green-600 py-4 text-xs font-medium uppercase text-white disabled:opacity-60"
              >
                {loading ? "Placing Order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}