import { useState, useEffect } from "react";
import {
  ChevronDown,
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import {
  executeStripeSandboxCheckout,
  formatCardNumber,
  formatExpiry,
  detectCardBrand,
  validateCardInput,
  STANDARD_STRIPE_TEST_CARD,
} from "../services/stripeService";

function Field({
  label,
  required,
  placeholder,
  type = "text",
  optional,
  value,
  onChange,
  name,
  autocomplete,
  inputmode,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-red-600">*</span>}
        {optional && <span className="text-neutral-400 font-normal"> (Optional)</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autocomplete}
        inputMode={inputmode}
        className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
      />
    </div>
  );
}

function Select({ label, required, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex items-center justify-between rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300">
        <span>{value}</span>
        <ChevronDown size={14} className="text-stone-500" />
      </div>
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Payment method selection - default to Stripe Sandbox for testing
  const [payment, setPayment] = useState("stripe");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Placing Order…");
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  // Billing address state
  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    company: "",
    country: "United States (US)",
    street: "",
    apartment: "",
    city: "",
    state: "Washington",
    zip: "",
    phone: "",
    email: user?.email ?? "",
    notes: "",
  });

  // Stripe Sandbox Card state
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    zip: "",
  });
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    if (user?.email && !billing.email) {
      setBilling((b) => ({ ...b, email: user.email }));
    }
  }, [user]);

  const shipping = subtotal * 0.01;
  const tax = subtotal * 0.02;
  const total = subtotal + shipping + tax;

  const handleChange = (e) =>
    setBilling((b) => ({ ...b, [e.target.name]: e.target.value }));

  // Handle card number formatting
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCard((c) => ({ ...c, number: formatted }));
    setCardError("");
  };

  // Handle expiry formatting
  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setCard((c) => ({ ...c, expiry: formatted }));
    setCardError("");
  };

  // Auto-fill standard public Stripe Sandbox test credentials
  const fillStripeTestCard = () => {
    const buyerName = `${billing.first_name || ""} ${billing.last_name || ""}`.trim() || "Stripe Test Buyer";
    setCard({
      number: STANDARD_STRIPE_TEST_CARD,
      expiry: "12 / 28",
      cvc: "123",
      name: buyerName,
      zip: billing.zip || "98101",
    });
    setCardError("");
  };

  const detectedBrand = detectCardBrand(card.number);

  // Quick Demo Guest Fill
  const fillDemoCustomer = () => {
    setBilling((b) => ({
      ...b,
      first_name: "Alex",
      last_name: "Morgan",
      company: "Rovado Tech Labs",
      street: "1201 3rd Avenue",
      apartment: "Suite 400",
      city: "Seattle",
      state: "Washington",
      zip: "98101",
      phone: "+1 206-555-0199",
      email: user?.email || "alex.morgan@example.com",
      notes: "Please deliver to tech reception during business hours.",
    }));
    fillStripeTestCard();
  };

  // Place Order handler
  const placeOrder = async () => {
    setError("");
    setCardError("");

    if (items.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!billing.first_name || !billing.last_name) {
      setError("Please provide your first and last name in the billing details.");
      return;
    }

    if (!billing.street || !billing.city || !billing.zip) {
      setError("Please provide a street address, town/city, and ZIP code.");
      return;
    }

    if (!billing.email) {
      setError("Please provide a valid email address for your order confirmation.");
      return;
    }

    setLoading(true);

    try {
      if (payment === "stripe") {
        // --- 1. Stripe Sandbox Payment Flow ---
        setLoadingMessage("Validating card with Stripe Sandbox…");

        // Validate card fields
        const cardValidation = validateCardInput({
          number: card.number,
          expiry: card.expiry,
          cvc: card.cvc,
          name: card.name || `${billing.first_name} ${billing.last_name}`,
        });

        if (!cardValidation.valid) {
          setLoading(false);
          setCardError(cardValidation.error);
          setError(cardValidation.error);
          return;
        }

        setLoadingMessage("Authorizing Stripe sandbox payment & saving transaction…");

        const result = await executeStripeSandboxCheckout({
          items,
          billing,
          cardData: card,
          user,
        });

        setLoading(false);
        setSuccessOrder(result);
        clearCart();
        return;
      }

      // --- 2. Traditional Payment Methods (Bank, COD, Paypal) ---
      setLoadingMessage("Placing order…");

      const userId = user?.id || "00000000-0000-0000-0000-000000000000";

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal,
          shipping,
          tax,
          total,
          status: "pending",
          payment_method: payment,
          billing,
          notes: billing.notes,
        })
        .select()
        .single();

      if (orderErr) {
        setLoading(false);
        setError(orderErr.message);
        return;
      }

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

      if (itemsErr) {
        setError(itemsErr.message);
        return;
      }

      clearCart();
      navigate("/profile", {
        replace: true,
        state: { tab: "My order", orderSuccess: true, orderId: order.id },
      });
    } catch (err) {
      console.error("[Checkout] Order processing failed:", err);
      setLoading(false);
      setError(err.message || "An error occurred while processing your order. Please try again.");
    }
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Checkout" },
        ]}
      />

      <section className="rounded-xl bg-white p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-stone-900">Checkout</h1>
            <p className="text-xs text-stone-500 mt-1">Complete your purchase using our secure checkout flow</p>
          </div>
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="flex items-center gap-1.5 rounded-lg border border-green-600/30 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
          >
            <Zap size={14} className="text-green-600 fill-green-600" />
            Auto-Fill Sample Customer & Stripe Card
          </button>
        </div>

        {/* Informational banners */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-stone-100 p-4 border border-stone-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-xs text-stone-700">
                {user ? (
                  <span>
                    Logged in as <strong className="text-stone-900">{user.email}</strong>
                  </span>
                ) : (
                  <span>
                    Returning customer?{" "}
                    <Link to="/login" state={{ from: "/checkout" }} className="font-semibold text-green-700 underline">
                      Click here to log in
                    </Link>{" "}
                    or continue as guest.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Stripe Sandbox Active
                </p>
                <p className="text-[11px] text-purple-700">
                  Test card <code className="bg-purple-200/60 px-1 py-0.5 rounded font-mono font-bold">4242 4242 4242 4242</code> enabled
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPayment("stripe");
                fillStripeTestCard();
              }}
              className="text-xs font-bold text-purple-700 underline hover:text-purple-900"
            >
              Fill Card
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* SUCCESS CONFIRMATION MODAL / PANEL */}
        {successOrder && (
          <div className="mb-8 rounded-2xl border-2 border-green-500 bg-green-50/50 p-6 text-stone-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-full bg-green-600 text-white">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-green-800">
                  Payment Succeeded & Transaction Saved!
                </h2>
                <p className="text-xs text-green-700">
                  {successOrder.message || "Your order was successfully authorized with Stripe Sandbox."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white rounded-xl p-4 border border-green-200 text-xs">
              <div>
                <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Order ID</span>
                <span className="font-bold font-mono text-stone-800">#{successOrder.orderId}</span>
              </div>
              <div>
                <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Payment Gateway</span>
                <span className="font-bold text-purple-700">Stripe Sandbox (Free Framework)</span>
              </div>
              <div>
                <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Payment Intent</span>
                <span className="font-bold font-mono text-stone-700 truncate block">
                  {successOrder.transaction?.payment_intent_id || "pi_test_..."}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Card Applied</span>
                <span className="font-bold text-stone-800">
                  {successOrder.transaction?.card_brand} *{successOrder.transaction?.card_last4}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-green-200/80">
              <div className="flex items-center gap-2 text-xs text-green-800 font-medium">
                <ShieldCheck size={16} className="text-green-600" />
                <span>
                  {successOrder.supabaseSynced
                    ? "✓ Successfully saved transaction record to Supabase database schema."
                    : "✓ Transaction logged and saved in store audit schema."}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/profile", {
                      state: { tab: "My order", orderSuccess: true, orderId: successOrder.orderId },
                    })
                  }
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
                >
                  View My Orders
                </button>
                <Link
                  to="/"
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* LEFT: Billing Details */}
          <div>
            <h2 className="mb-6 text-base font-bold text-stone-900">Billing Detail</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field
                label="First Name"
                name="first_name"
                value={billing.first_name}
                onChange={handleChange}
                autocomplete="given-name"
                required
              />
              <Field
                label="Last Name"
                name="last_name"
                value={billing.last_name}
                onChange={handleChange}
                autocomplete="family-name"
                required
              />
            </div>
            <div className="mt-6">
              <Field
                label="Company Name"
                name="company"
                value={billing.company}
                onChange={handleChange}
                autocomplete="organization"
                optional
              />
            </div>
            <div className="mt-6">
              <Select label="Country / Region" required value="United States (US)" />
            </div>
            <div className="mt-6">
              <Field
                label="Street Address"
                name="street"
                value={billing.street}
                onChange={handleChange}
                placeholder="House number and street name …"
                autocomplete="billing address-line1"
                required
              />
            </div>
            <div className="mt-4">
              <input
                name="apartment"
                value={billing.apartment}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, etc (Optional)"
                autoComplete="billing address-line2"
                className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
              />
            </div>
            <div className="mt-6">
              <Field
                label="Town / City"
                name="city"
                value={billing.city}
                onChange={handleChange}
                autocomplete="billing address-level2"
                required
              />
            </div>
            <div className="mt-6">
              <Select label="State / County" required value="Washington" />
            </div>
            <div className="mt-6">
              <Field
                label="Zip Code"
                name="zip"
                value={billing.zip}
                onChange={handleChange}
                autocomplete="billing postal-code"
                inputmode="numeric"
                required
              />
            </div>
            <div className="mt-6">
              <Field
                label="Phone Number"
                name="phone"
                value={billing.phone}
                onChange={handleChange}
                type="tel"
                autocomplete="tel"
                inputmode="tel"
                required
              />
            </div>
            <div className="mt-6">
              <Field
                label="Email Address"
                name="email"
                value={billing.email}
                onChange={handleChange}
                required
                type="email"
                autocomplete="email"
              />
            </div>

            <h2 className="mb-4 mt-10 text-base font-bold text-stone-900">Additional Information</h2>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Order Notes <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="notes"
              value={billing.notes}
              onChange={handleChange}
              placeholder="Notes about your order, e.g. special note for delivery"
              rows={3}
              className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
            />
          </div>

          {/* RIGHT: Order Summary & Stripe Sandbox Payment Selector */}
          <div>
            <h2 className="mb-6 text-base font-bold text-stone-900">Your Order</h2>

            {/* Order Items Summary */}
            <div className="mb-6 rounded-xl bg-gray-50 border border-stone-200 p-6">
              <div className="flex justify-between border-b border-zinc-200 pb-3 text-xs font-semibold uppercase text-stone-500">
                <span>Product</span>
                <span>Subtotal</span>
              </div>

              {items.length === 0 && (
                <p className="py-6 text-center text-sm text-stone-500">Your cart is empty.</p>
              )}

              {items.map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-4 border-b border-zinc-200 py-4">
                  <div className="flex gap-3">
                    <img src={i.image} alt={i.title} className="size-14 rounded object-cover border border-stone-200 bg-white" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">{i.title}</p>
                      <p className="text-xs text-stone-500">Qty: {i.qty}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-stone-800">${(i.price * i.qty).toFixed(2)}</p>
                </div>
              ))}

              <div className="flex items-center justify-between py-2.5 text-sm text-stone-600">
                <span>Shipping (1%)</span>
                <span className="text-red-600 font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm text-stone-600">
                <span>Sales Tax (2%)</span>
                <span className="text-red-600 font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-stone-900">
                <span>Order Total</span>
                <span className="text-green-600 text-lg">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Methods Box */}
            <div className="space-y-4 rounded-xl bg-stone-100 border border-stone-200 p-6">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Select Payment Method
                </span>
                <span className="flex items-center gap-1 text-[11px] text-green-700 font-semibold bg-green-100/70 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} />
                  SSL Encrypted
                </span>
              </div>

              {/* OPTION 1: STRIPE SANDBOX (RECOMMENDED) */}
              <div
                className={`rounded-xl border transition p-4 cursor-pointer ${
                  payment === "stripe"
                    ? "border-green-600 bg-white shadow-sm ring-1 ring-green-600"
                    : "border-stone-300 bg-stone-50 hover:bg-white"
                }`}
                onClick={() => setPayment("stripe")}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === "stripe"}
                      onChange={() => setPayment("stripe")}
                      className="size-4 accent-green-600 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-stone-900">
                          Credit / Debit Card
                        </p>
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-800">
                          Stripe Sandbox
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Free Sandbox integration with instant authorization
                      </p>
                    </div>
                  </label>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                      VISA
                    </span>
                    <span className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      MC
                    </span>
                    <span className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-bold text-sky-600">
                      AMEX
                    </span>
                  </div>
                </div>

                {/* STRIPE CARD FORM EXPANDED */}
                {payment === "stripe" && (
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-4" onClick={(e) => e.stopPropagation()}>
                    {/* Sandbox helper badge */}
                    <div className="flex items-center justify-between rounded-lg bg-purple-50 p-2.5 text-xs text-purple-900 border border-purple-200">
                      <div className="flex items-center gap-1.5">
                        <Lock size={12} className="text-purple-700" />
                        <span>
                          Test Card: <strong className="font-mono">{STANDARD_STRIPE_TEST_CARD}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={fillStripeTestCard}
                        className="rounded bg-purple-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-purple-700 transition"
                      >
                        ⚡ 1-Click Fill
                      </button>
                    </div>

                    {cardError && (
                      <p className="rounded-md bg-red-50 p-2 text-xs font-medium text-red-600 border border-red-200">
                        {cardError}
                      </p>
                    )}

                    {/* Card Number */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-stone-700">
                          Card Number <span className="text-red-600">*</span>
                        </label>
                        <span className={`text-[11px] font-bold uppercase ${detectedBrand.color}`}>
                          {detectedBrand.name}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          autoComplete="cc-number"
                          inputMode="numeric"
                          maxLength={19}
                          value={card.number}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 pl-9 text-sm font-mono tracking-wider outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                        />
                        <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      </div>
                    </div>

                    {/* Expiry & CVC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Expiry Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          maxLength={7}
                          value={card.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM / YY"
                          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm font-mono outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-stone-700">
                            CVC <span className="text-red-600">*</span>
                          </label>
                          <span className="text-[10px] text-stone-400">3 or 4 digits</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            autoComplete="cc-csc"
                            inputMode="numeric"
                            maxLength={4}
                            value={card.cvc}
                            onChange={(e) => {
                              setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "") }));
                              setCardError("");
                            }}
                            placeholder="123"
                            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 pl-8 text-sm font-mono outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                          />
                          <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                    </div>

                    {/* Name on Card */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Name on Card <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="cc-name"
                        value={card.name}
                        onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Cardholder Name"
                        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1">
                      <ShieldCheck size={14} className="text-green-600 shrink-0" />
                      <span>
                        Stripe Sandbox verifies test card 4242 and records transactions directly to your Supabase schema.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* OTHER PAYMENT METHODS */}
              {[
                {
                  key: "bank",
                  title: "Direct Bank Transfer",
                  desc: "Make your payment directly into our bank account. Your order will be confirmed once funds clear.",
                },
                { key: "cod", title: "Cash on Delivery", desc: "Pay with cash upon receipt of delivery." },
                { key: "paypal", title: "Paypal", desc: "Fast and secure online payments via PayPal sandbox." },
              ].map((opt) => (
                <div
                  key={opt.key}
                  className={`rounded-xl border transition p-4 cursor-pointer ${
                    payment === opt.key
                      ? "border-green-600 bg-white shadow-sm ring-1 ring-green-600"
                      : "border-stone-300 bg-stone-50 hover:bg-white"
                  }`}
                  onClick={() => setPayment(opt.key)}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === opt.key}
                      onChange={() => setPayment(opt.key)}
                      className="mt-1 size-4 accent-green-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-bold text-stone-900">{opt.title}</p>
                      {opt.desc && <p className="mt-1 text-xs text-stone-500">{opt.desc}</p>}
                    </div>
                  </label>
                </div>
              ))}

              {/* Submit Button */}
              <button
                type="button"
                onClick={placeOrder}
                disabled={loading || items.length === 0}
                className="mt-4 w-full rounded-xl bg-green-600 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{loadingMessage}</span>
                  </>
                ) : (
                  <span>
                    {payment === "stripe"
                      ? `Pay $${total.toFixed(2)} with Stripe Sandbox`
                      : `Place Order ($${total.toFixed(2)})`}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}