
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Phone,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";


export function TopBar() {
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("Eng");
  const [openMenu, setOpenMenu] = useState(null); // "currency" | "language" | null

const currencies = ["USD"];
const languages = ["Eng"];

  // Outside click close
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCurrencyChange = (c) => {
    setCurrency(c);
    setOpenMenu(null);
    // ✅ Save to localStorage
    try {
      localStorage.setItem("rovado_currency", c);
    } catch {}
  };

  const handleLanguageChange = (l) => {
    setLanguage(l);
    setOpenMenu(null);
    try {
      localStorage.setItem("rovado_language", l);
    } catch {}
  };

  // Load saved preferences
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("rovado_currency");
      const savedLang = localStorage.getItem("rovado_language");
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedLang) setLanguage(savedLang);
    } catch {}
  }, []);

  return (
    <div className="hidden items-center justify-between border-b border-neutral-100 px-4 py-2 text-xs text-black lg:flex">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-md bg-violet-100 px-3 py-1.5 font-normal">
          <Phone size={12} /> Hotline 24/7
        </span>
        <span className="font-bold">(025) 3886 25 16</span>
      </div>

      <div className="flex items-center gap-6" ref={ref}>
        <a href="#" className="hover:text-green-600">Sell on Rovado</a>
        <a href="#" className="hover:text-green-600">Order Tracking</a>

        {/* ✅ Currency Dropdown */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenMenu(openMenu === "currency" ? null : "currency")
            }
            className="flex items-center gap-1 border-r border-neutral-400/60 pr-4 hover:text-green-600"
          >
            {currency} <ChevronDown size={10} />
          </button>

          {openMenu === "currency" && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[100px] rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
              {currencies.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCurrencyChange(c)}
                  className={`block w-full px-4 py-2 text-left text-xs hover:bg-green-50 hover:text-green-600 ${
                    currency === c ? "font-bold text-green-600" : "text-stone-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Language Dropdown */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenMenu(openMenu === "language" ? null : "language")
            }
            className="flex items-center gap-1 hover:text-green-600"
          >
            {language} <ChevronDown size={10} />
          </button>

          {openMenu === "language" && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[120px] rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  className={`block w-full px-4 py-2 text-left text-xs hover:bg-green-50 hover:text-green-600 ${
                    language === l ? "font-bold text-green-600" : "text-stone-600"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const { count, subtotal } = useCart();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { label: "Homes", to: "/", dropdown: null },
    {
      label: "Pages",
      to: "#",
      dropdown: [
        { label: "About", to: "/about" },  
        { label: "Profile", to: "/profile" },
        { label: "Cart", to: "/cart" },
        { label: "Checkout", to: "/checkout" },
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
        { label: "Admin Dashboard", to: "/admin" },
        { label: "Contact", to: "/contact" },
      ],
    },
    {
      label: "Products",
      to: "#",
      dropdown: [
        { label: "All Products", to: "/category" },
        { label: "Cellphones & Tablets", to: "/cellphones" },
        { label: "Laptops & Computers", to: "/laptops" },
        { label: "Best Sellers", to: "/category" },
        { label: "New Arrivals", to: "/category" },
        { label: "Deals of the Day", to: "/category" },
      ],
    },
    { label: "Contact", to: "/contact", dropdown: null },
  ];

  const cartTotal = subtotal.toFixed(2);

  // Outside click close
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (item, e) => {
    if (item.dropdown) {
      e.preventDefault();
      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else {
      setOpenDropdown(null);
    }
  };

  return (
    <header className="rounded-xl bg-white">
      <TopBar />

      <div className="flex items-center justify-between gap-4 px-4 py-4">
        {/* LEFT: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link to="/">
            <img
              src="/Rovadologo.jpg"
              alt="Rovado logo"
              className="h-9 w-auto"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </Link>

          <nav
            ref={dropdownRef}
            className="hidden items-center gap-6 text-sm font-bold uppercase lg:flex"
          >
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <button
                    onClick={(e) => handleNavClick(item, e)}
                    className="flex items-center gap-1 text-black hover:text-green-600"
                  >
                    {item.label}
                    <ChevronDown
                      size={10}
                      className={`opacity-70 transition ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    className="flex items-center gap-1 text-black hover:text-green-600"
                  >
                    {item.label}
                  </Link>
                )}

                {item.dropdown && openDropdown === item.label && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.to}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2 text-xs font-medium uppercase text-stone-600 hover:bg-green-50 hover:text-green-600"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* RIGHT: Icons */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/category"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-full bg-violet-100"
          >
            <Search size={18} />
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="grid size-10 place-items-center rounded-full bg-violet-100"
              >
                <User size={18} />
              </Link>
              <div className="text-xs">
                <p className="uppercase text-stone-500">Welcome</p>
                <button
                  onClick={signOut}
                  className="font-bold uppercase hover:text-green-600"
                >
                  {(profile?.full_name || user.email?.split("@")[0] || "User").slice(0, 12)} · Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="grid size-10 place-items-center rounded-full bg-violet-100"
              >
                <User size={18} />
              </Link>
              <div className="text-xs">
                <p className="uppercase text-stone-500">Welcome</p>
                <Link to="/login" className="font-bold uppercase">
                  Log in / Register
                </Link>
              </div>
            </>
          )}

          <Link
            to="/cart"
            aria-label="Wishlist"
            className="relative grid size-10 place-items-center rounded-full bg-violet-100"
          >
            <Heart size={18} />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-green-600 text-[10px] text-white">
              {count}
            </span>
          </Link>

          <div className="text-xs">
            <p className="uppercase text-stone-500">Cart</p>
            <Link to="/cart" className="font-bold uppercase">
              ${cartTotal}
            </Link>
          </div>

          <Link to="/cart">
            <ShoppingCart size={20} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="grid size-10 place-items-center rounded-md bg-violet-100 lg:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-neutral-100 px-4 py-4 lg:hidden">
          <nav className="mb-4 flex flex-col gap-3 text-sm font-bold uppercase">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.label ? null : item.label
                        )
                      }
                      className="flex w-full items-center justify-between"
                    >
                      {item.label}
                      <ChevronDown
                        size={12}
                        className={`transition ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="mt-2 ml-4 flex flex-col gap-2 border-l-2 border-neutral-200 pl-3">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            onClick={() => {
                              setOpenDropdown(null);
                              setOpen(false);
                            }}
                            className="text-xs normal-case text-stone-600"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.to} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center justify-between text-xs">
            {user ? (
              <span>
                Hi {(profile?.full_name || "User").slice(0, 12)} —{" "}
                <button onClick={signOut} className="font-bold">
                  Logout
                </button>
              </span>
            ) : (
              <span>
                Welcome — <Link to="/login">Log in</Link> / Register
              </span>
            )}
            <Link to="/cart" className="font-bold">
              Cart: ${cartTotal}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PromoBar() {
  const items = [
    { icon: Truck, text: "Free shipping over $199" },
    { icon: RotateCcw, text: "30 days money back" },
    { icon: ShieldCheck, text: "100% secure payment" },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-green-600 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center overflow-hidden rounded-full bg-white sm:w-auto sm:min-w-[380px]">
        <span className="hidden shrink-0 items-center gap-1 px-4 py-3 text-xs font-bold text-neutral-800 sm:flex">
          All Categories <ChevronDown size={10} />
        </span>
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-white px-4 py-3 text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <button className="px-4 text-black">
          <Search size={16} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium uppercase">
        {items.map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-2">
            <Icon size={16} /> {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-4 text-sm sm:px-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-500">/</span>}
          {item.href ? (
            <a href={item.href} className="font-bold text-neutral-400">
              {item.label}
            </a>
          ) : (
            <span className="font-bold text-black">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

const footerColumns = [
  {
    title: "Top Categories",
    items: [
      "Laptops",
      "PC & Computers",
      "Cell Phones",
      "Tablets",
      "Gaming & VR",
      "Networks",
      "Cameras",
      "Sounds",
      "Office",
    ],
  },
  {
    title: "Company",
    items: ["About Rovado", "Contact", "Career", "Blog", "Sitemap", "Store Locations"],
  },
  {
    title: "Help Center",
    items: [
      "Customer Service",
      "Policy",
      "Terms & Conditions",
      "Track Order",
      "FAQs",
      "My Account",
      "Product Support",
    ],
  },
  {
    title: "Partner",
    items: ["Become Seller", "Affiliate", "Advertise", "Partnership"],
  },
];

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="mb-3 text-lg font-bold uppercase">Rovado - 1st NYC tech online market</h3>
            <p className="mb-3 text-sm uppercase text-black">hotline 24/7</p>
            <p className="mb-4 text-3xl font-bold text-green-600">(025) 3686 25 16</p>
            <p className="mb-2 text-sm text-black">257 Thatcher Road St, Brooklyn, Manhattan, NY 10092</p>
            <p className="mb-4 text-sm text-black">contact@Rovadotechmart.com</p>
            <div className="flex gap-2">
  {/* Facebook */}
  <a
    href="https://facebook.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-blue-600 hover:text-white"
  >
    <Facebook size={16} />
  </a>

  {/* Twitter */}
  <a
    href="https://twitter.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Twitter"
    className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-sky-500 hover:text-white"
  >
    <Twitter size={16} />
  </a>

  {/* Instagram */}
  <a
    href="https://instagram.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-pink-600 hover:text-white"
  >
    <Instagram size={16} />
  </a>

  {/* LinkedIn — Aapka profile */}
  <a
    href="https://www.linkedin.com/in/mian-muhammad-usman-9b2919228/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
    className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-blue-700 hover:text-white"
  >
    <Linkedin size={16} />
  </a>

  {/* YouTube */}
  <a
    href="https://youtube.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="YouTube"
    className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-red-600 hover:text-white"
  >
    <Youtube size={16} />
  </a>
</div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-lg font-bold uppercase">{col.title}</h4>
              <ul className="space-y-2 text-sm capitalize text-stone-500">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-neutral-400/20 px-3 py-3 text-sm">
              USD <ChevronDown size={10} />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-neutral-400/20 px-3 py-3 text-sm">
              Eng <ChevronDown size={10} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold uppercase">
              Subscribe &amp; get <span className="text-red-600">10% off</span> for your first order
            </p>
            <div className="mt-3 flex items-center gap-2 border-b border-stone-300 pb-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
              />
              <button className="text-sm font-bold uppercase text-green-600">Subscribe</button>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              By subscribing, you&apos;re accepted our{" "}
              <a href="#" className="text-black underline">
                Policy
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-neutral-400/30 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-stone-500">
            © 2026 <span className="font-bold text-black">usman.dev</span>. All Rights Reserved
          </p>
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "PayPal", "Amex", "Discover"].map((p) => (
              <span key={p} className="rounded bg-neutral-100 px-2 py-1 text-[10px] text-neutral-500">
                {p}
              </span>
            ))}
          </div>
          <a href="#" className="flex items-center gap-1 text-sm text-blue-600">
            Mobile Site
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6">{children}</div>
      <div className="mt-4">
        <Footer />
      </div>
    </div>
  );
}
