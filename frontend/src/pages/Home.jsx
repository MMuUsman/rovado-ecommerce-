import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Phone,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Menu,
  X,
  Facebook,        
  Twitter,        
  Instagram,       
  Youtube,         
  Linkedin, 
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";


const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

/* =========================================================
   Reusable Pieces
========================================================= */

function StarRating({ count = 0, reviews }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className="flex text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < count ? "currentColor" : "none"}
            className={i < count ? "text-amber-500" : "text-neutral-300"}
          />
        ))}
      </div>
      {reviews != null && <span className="text-stone-500">({reviews})</span>}
    </div>
  );
}

function Badge({ children, tone = "green" }) {
  const tones = {
    green: "bg-green-600 text-white",
    dark: "bg-neutral-800 text-white",
  };
  return (
    <span
      className={`inline-flex flex-col rounded-md px-2 py-1 text-[10px] font-medium uppercase leading-tight ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function ProductCard({ product }) {
  const { image, badge, title, rating, reviews, price, oldPrice, shipping, stock, isNew } = product;
  const [imgError, setImgError] = useState(false);
  const src = imgError || !image ? FALLBACK_IMG : image;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex w-full shrink-0 flex-col rounded-lg p-4 snap-start sm:w-56 transition hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
        <img
          src={src}
          alt={title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {badge && (
          <div className="absolute left-2 top-2">
            <Badge tone={isNew ? "dark" : "green"}>{badge}</Badge>
          </div>
        )}
        <button
          aria-label="Wishlist"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 opacity-0 shadow-sm transition group-hover:opacity-100"
        >
          <Heart size={14} />
        </button>
      </div>

      {rating != null && <StarRating count={rating} reviews={reviews} />}

      <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-black">{title}</h3>

      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-lg font-semibold ${oldPrice ? "text-red-600" : "text-black"}`}>
          {price}
        </span>
        {oldPrice && (
          <span className="text-sm font-semibold text-stone-500 line-through">{oldPrice}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase">
        {shipping && (
          <span className="rounded bg-green-600/5 px-2 py-1 text-green-600">{shipping}</span>
        )}
        {stock === "in" && <span className="text-black">● In stock</span>}
        {stock === "out" && <span className="text-black">● Out of stock</span>}
        {stock === "contact" && <span className="text-black">● Contact</span>}
      </div>
    </Link>
  );
}

function ProductRail({ title, tabs, products, viewAllHref = "/category" }) {
  const [active, setActive] = useState(tabs?.[0] ?? "");
  const scrollerId = `rail-${(title || "products").replace(/\s+/g, "-")}`;

  // ✅ Filter products based on active tab
  const getFilteredByTab = () => {
    if (!active || !tabs || tabs.length === 0) return products;

    switch (active) {
      case "Best seller":
        // Best sellers — by reviews count
        return [...products]
          .sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0))
          .slice(0, 8);

      case "New in":
        // New arrivals — is_new = true, warna latest IDs
        const newItems = products.filter((p) => p.isNew || p.is_new);
        if (newItems.length > 0) return newItems.slice(0, 8);
        // Fallback: latest products by ID
        return [...products]
          .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
          .slice(0, 8);

      case "Popular":
        // Popular — by rating
        return [...products]
          .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
          .slice(0, 8);

      default:
        return products;
    }
  };

  const displayProducts = getFilteredByTab();

  const scroll = (dir) => {
    const el = document.getElementById(scrollerId);
    if (el) el.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-6">
          {title && <h2 className="text-lg font-bold uppercase">{title}</h2>}
          {tabs?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`text-lg uppercase ${
                active === tab ? "font-bold text-black" : "font-normal text-stone-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {title && (
          <div className="flex items-center gap-2">
            <Link
              to={viewAllHref}
              className="text-xs uppercase text-stone-500 hover:text-green-600"
            >
              View All
            </Link>
            <button
              onClick={() => scroll(-1)}
              className="grid size-8 place-items-center rounded-md bg-slate-100"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="grid size-8 place-items-center rounded-md bg-slate-100"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {displayProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          No products available for "{active}".
        </p>
      ) : (
        <div
          id={scrollerId}
          className="flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   Static UI Data
========================================================= */

const sidebarCategories = [
  { name: "Laptops", icon: "💻" },
  { name: "PC & Computers", icon: "🖥️" },
  { name: "Cell Phones", icon: "📱" },
  { name: "Tablets", icon: "📲" },
  { name: "Gaming & VR", icon: "🎮" },
  { name: "Networking", icon: "📡" },
  { name: "Cameras", icon: "📷" },
  { name: "Sounds", icon: "🎧" },
  { name: "Office", icon: "📚" },
  { name: "Storage, USB", icon: "💾" },
  { name: "Accessories", icon: "🔌" },
  { name: "Clearance", icon: "🏷️" },
];

// Exact brands as per design
const FEATURED_BRANDS = [
  "HP",
  "Asus",
  "Dell",
  "Apple",
  "Xiaomi",
  "OnePlus",
  "Google",
  "Samsung",
];

// Top Categories — vertical list
const TOP_CATEGORIES_LIST = [
  "Laptops",
  "PC & Computers",
  "Cell Phones",
  "Tablets",
  "Gaming & VR",
  "Networks",
  "Cameras",
  "Sounds",
  "Office",
];

const footerColumns = [
  {
    title: "Top Categories",
    items: ["Laptops", "PC & Computers", "Cell Phones", "Tablets", "Gaming & VR", "Networks", "Cameras", "Sounds", "Office"],
  },
  {
    title: "Company",
    items: ["About Rovado", "Contact", "Career", "Blog", "Sitemap", "Store Locations"],
  },
  {
    title: "Help Center",
    items: ["Customer Service", "Policy", "Terms & Conditions", "Track Order", "FAQs", "My Account", "Product Support"],
  },
  {
    title: "Partner",
    items: ["Become Seller", "Affiliate", "Advertise", "Partnership"],
  },
];

/* =========================================================
   Top Bar
========================================================= */

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

/* =========================================================
   Header
========================================================= */

function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

        <button
          className="grid size-10 place-items-center rounded-md bg-violet-100 lg:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-100 px-4 py-4 lg:hidden">
          <nav className="mb-4 flex flex-col gap-3 text-sm font-bold uppercase">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.label ? null : item.label)
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

/* =========================================================
   Promo Bar
========================================================= */

function PromoBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/category?search=${encodeURIComponent(q)}`);
      setSearch("");
    } else {
      navigate("/category");
    }
  };

  const items = [
    { icon: Truck, text: "Free shipping over $199" },
    { icon: RotateCcw, text: "30 days money back" },
    { icon: ShieldCheck, text: "100% secure payment" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-green-600 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center overflow-hidden rounded-full bg-white sm:w-auto sm:min-w-[380px]"
      >
        <span className="hidden shrink-0 items-center gap-1 px-4 py-3 text-xs font-bold text-neutral-800 sm:flex">
          All Categories <ChevronDown size={10} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything..."
          className="w-full bg-white px-4 py-3 text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <button type="submit" className="px-4 text-black">
          <Search size={16} />
        </button>
      </form>

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

/* =========================================================
   Sidebar
========================================================= */

function Sidebar() {
  const categoryMap = {
    "Laptops": "laptops-computers",
    "PC & Computers": "laptops-computers",
    "Cell Phones": "cellphones-tablets",
    "Tablets": "cellphones-tablets",
    "Gaming & VR": "gaming",
    "Networking": "networking",
    "Cameras": "cameras",
    "Sounds": "sounds",
    "Office": "office",
    "Storage, USB": "storage",
    "Accessories": "accessories",
    "Clearance": "clearance",
  };

  return (
    <aside className="hidden shrink-0 self-start rounded-xl bg-white p-4 lg:block lg:w-64">
      <div className="mb-3 flex items-center gap-2 border-b border-neutral-100 pb-3">
        <span className="text-base">🔥</span>
        <span className="text-sm font-bold uppercase text-red-600">Sale 40% off</span>
      </div>
      <ul className="space-y-0.5 text-[13px]">
        {sidebarCategories.map((cat) => (
          <li key={cat.name}>
            <Link
              to={`/category?category=${categoryMap[cat.name] || "all"}`}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-50"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">{cat.icon}</span>
                <span className="capitalize">{cat.name}</span>
              </span>
              <ChevronRight size={11} className="text-stone-400" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function MobileCategoryScroller() {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-3 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sidebarCategories.map((cat) => (
        <Link
          key={cat.name}
          to="/category"
          className="shrink-0 rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium capitalize"
        >
          {cat.icon} {cat.name}
        </Link>
      ))}
    </div>
  );
}

/* =========================================================
   Hero Carousel
========================================================= */

function HeroCarousel({ products = [] }) {
  const [index, setIndex] = useState(0);

  const slides = products.slice(0, 3).map((p) => ({
    image: p.image || FALLBACK_IMG,
    title: p.title,
    subtitle: p.description || `Starting from ${p.price}`,
    cta: "Buy Now",
    ctaStyle: "bg-white text-black",
    productId: p.id,
  }));

  const slide = slides[index] || {
    image: FALLBACK_IMG,
    title: "Welcome to Rovado",
    subtitle: "Discover amazing products",
    cta: "Shop Now",
    ctaStyle: "bg-white text-black",
  };

  const handlePrev = () => {
    if (slides.length === 0) return;
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  };
  const handleNext = () => {
    if (slides.length === 0) return;
    setIndex((i) => (i + 1) % slides.length);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-64 w-full object-cover sm:h-72 lg:h-80"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-black/10 p-6 sm:p-10">
          <h3 className="max-w-xs text-2xl font-bold leading-tight text-white sm:text-3xl line-clamp-2">
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="max-w-xs text-xs text-white line-clamp-2">{slide.subtitle}</p>
          )}
          <Link
            to={slide.productId ? `/product/${slide.productId}` : "/category"}
            className={`mt-2 w-fit rounded-lg px-6 py-2 text-xs font-medium uppercase ${slide.ctaStyle}`}
          >
            {slide.cta}
          </Link>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs">
            <button onClick={handlePrev}>
              <ChevronLeft size={12} />
            </button>
            <span>{index + 1} / {slides.length}</span>
            <button onClick={handleNext}>
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      {products.length >= 5 && (
        <div className="grid grid-cols-2 gap-4">
          {products.slice(3, 5).map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="relative block overflow-hidden rounded-xl bg-neutral-800"
            >
              <img
                src={p.image || FALLBACK_IMG}
                alt={p.title}
                className="h-32 w-full object-cover opacity-70"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
              <div className="absolute inset-0 flex flex-col justify-center gap-1 p-4">
                <p className="text-sm font-medium leading-tight text-white line-clamp-2">
                  {p.title}
                </p>
                <p className="text-xs text-white/80">
                  from <span className="font-bold text-green-400">{p.price}</span>
                </p>
                <p className="mt-1 text-[10px] uppercase text-white/90 underline">Shop Now</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Side Deal Cards
========================================================= */

function SideDealCards({ products = [] }) {
  const deals = products.slice(5, 7);

  if (deals.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500">
        No deals available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {deals.map((p) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          className="relative block overflow-hidden rounded-xl"
        >
          <img
            src={p.image || FALLBACK_IMG}
            alt={p.title}
            className="h-32 w-full object-cover lg:h-56"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
          <div className="absolute inset-0 flex flex-col justify-center gap-1 bg-black/30 p-4">
            {p.brand && <p className="text-[10px] uppercase text-white">{p.brand}</p>}
            <p className="text-lg font-semibold capitalize text-white line-clamp-2">{p.title}</p>
            <p className="text-2xl font-light text-green-400">{p.price}</p>
            <span className="mt-1 w-fit rounded-lg bg-neutral-800 px-4 py-2 text-[10px] font-medium uppercase text-white">
              Shop Now
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* =========================================================
   Featured Brands & Top Categories — EXACT MATCH
========================================================= */

function FeaturedBrandsAndTopCategories() {
  const brands = [
    { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Sony_logo.svg" },
    { name: "Asus", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
    { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg" },
    { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg" },
    { name: "LG", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg" },
    { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
    { name: "Acer", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg" },
    { name: "Nikon", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Nikon_logo.svg" },
  ];

  const categories = [
    { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80" },
    { name: "PC Gaming", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&q=80" },
    { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
    { name: "Monitors", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* ══════ FEATURED BRANDS ══════ */}
      <div className="rounded-xl bg-white p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">Featured Brands</h2>
          <Link
            to="/category"
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
          >
            View All <ChevronRight size={12} />
          </Link>
        </div>

        {/* 5 columns × 2 rows grid */}
        <div className="grid grid-cols-5 gap-3">
          {brands.map((b) => (
            <Link
  key={b.name}
  to={`/category?brand=${encodeURIComponent(b.name)}`}
  title={b.name}
  className="group flex h-16 items-center justify-center rounded-lg bg-neutral-50 p-2 transition hover:bg-green-50 hover:shadow-sm"
>
              <img
                src={b.logo}
                alt={b.name}
                className="max-h-10 w-full object-contain grayscale transition group-hover:grayscale-0"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="hidden text-xs font-bold text-neutral-600">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════ TOP CATEGORIES ══════ */}
      <div className="rounded-xl bg-white p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">Top Categories</h2>
          <Link
            to="/category"
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
          >
            View All <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/category"
              className="group flex flex-col items-center gap-2 text-center"
            >
              <div className="size-20 overflow-hidden rounded-lg bg-neutral-100 sm:size-24">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80";
                  }}
                />
              </div>
              <p className="text-sm font-semibold">{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Deals of the Day
========================================================= */

function DealsOfTheDay({ products = [] }) {
  const deal = products[0];
  const timers = [
    { label: "d", value: "162" },
    { label: "h", value: "09" },
    { label: "m", value: "32" },
    { label: "s", value: "34" },
  ];

  if (!deal) return null;

  return (
    <section>
      <div className="rounded-t-xl bg-green-600 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase text-white">Deals of the day</h2>
          <Link
            to="/category"
            className="flex items-center gap-1 text-xs text-white hover:underline"
          >
            View All <ChevronRight size={12} />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 rounded-b-xl bg-white p-4 sm:p-6 lg:grid-cols-2">
        <Link to={`/product/${deal.id}`} className="relative block">
          <img
            src={deal.image || FALLBACK_IMG}
            alt={deal.title}
            className="w-full rounded-xl object-cover"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
          <div className="absolute left-4 top-4 rounded-lg bg-green-600 px-3 py-2 text-white">
            <p className="text-[10px] uppercase">Save</p>
            <p className="text-lg font-medium">$199.00</p>
          </div>
        </Link>
        <div>
          <StarRating count={deal.rating ?? 5} reviews={deal.reviews ?? 12} />
          <h3 className="mt-2 text-base font-bold line-clamp-2">{deal.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-red-600">{deal.price}</span>
            {deal.oldPrice && (
              <span className="text-base font-semibold text-stone-500 line-through">
                {deal.oldPrice}
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-2 text-xs text-black">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-500" />
              {deal.description || "Premium quality product with modern design"}
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <span className="rounded bg-green-600/5 px-3 py-1 text-[10px] uppercase text-green-600">
              Free shipping
            </span>
            <span className="rounded bg-red-600/5 px-3 py-1 text-[10px] uppercase text-red-600">
              Free gift
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-xs font-medium uppercase">Hurry up! Promotion will expire in</p>
            <div className="flex gap-2">
              {timers.map((t) => (
                <div
                  key={t.label}
                  className="grid w-14 place-items-center rounded-md bg-slate-200 py-2"
                >
                  <span className="text-xl font-bold">-{t.value}</span>
                  <span className="text-sm font-bold text-stone-500">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-zinc-200 pt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div className="h-2 w-1/3 rounded-full bg-green-600" />
            </div>
            <p className="mt-2 text-xs">
              <span className="text-stone-500">Sold: </span>
              <span className="font-bold">26/75</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Member Banner
========================================================= */

function MemberBanner() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-800 p-6 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
      <p className="text-lg text-white">
        Member get <span className="uppercase text-yellow-400">Free shipping*</span> with no
        order minimum!. *Restriction apply
      </p>
      <Link to="/register" className="text-sm text-white underline">
        Try free 30-days trial!
      </Link>
    </div>
  );
}

/* =========================================================
   Brand New For You
========================================================= */

function BrandNewForYou({ products = [] }) {
  const items = products.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Brand new for you</h2>
        <div className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-1">
          <ChevronLeft size={10} />
          <ChevronRight size={10} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Link to={`/product/${it.id}`} key={it.id} className="block hover:opacity-90">
            <img
              src={it.image || FALLBACK_IMG}
              alt={it.title}
              className="mb-3 h-[250px] w-full rounded-xl object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <h3 className="text-base font-bold line-clamp-2">{it.title}</h3>
            <p className="mt-1 text-xs text-stone-500 line-clamp-2">
              {it.description || `Starting from ${it.price}`}
            </p>
            <span className="mt-3 inline-block rounded-lg border border-green-600 px-4 py-2 text-xs font-medium uppercase text-green-600">
              Shop Now
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   Top Cellphones Section
========================================================= */

function TopCellphonesSection({ products = [], viewAllHref = "/cellphones" }) {
  const miniCategories = [
    { name: "iPhone (iOS)", items: products.filter((p) => p.title?.toLowerCase().includes("iphone")).length },
    { name: "Android", items: products.filter((p) => /samsung|google|oneplus|xiaomi/i.test(p.title || "")).length },
    { name: "5G Support", items: products.length },
    { name: "Gaming", items: 0 },
    { name: "Xiaomi", items: products.filter((p) => p.title?.toLowerCase().includes("xiaomi")).length },
    { name: "Accessories", items: 0 },
  ];

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Top cellphones &amp; tablets</h2>
        <Link
          to={viewAllHref}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 border-b border-neutral-400/25 pb-6 lg:grid-cols-[605px_1fr]">
        {products.length > 0 ? (
          <Link to={`/product/${products[0].id}`} className="relative block overflow-hidden rounded-xl">
            <img
              src={products[0].image || FALLBACK_IMG}
              alt={products[0].title}
              className="h-48 w-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-black/40 p-6">
              <h3 className="max-w-xs text-2xl font-medium uppercase leading-tight text-white line-clamp-2">
                {products[0].title}
              </h3>
              <p className="text-xs text-white line-clamp-1">
                {products[0].description || "Rise to the challenge"}
              </p>
              <span className="w-fit rounded-lg bg-neutral-800 px-5 py-2 text-xs font-medium uppercase text-white">
                Shop Now
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl bg-neutral-100 p-6 text-center text-sm text-stone-500">
            No cellphones yet
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
          {miniCategories.map((c) => (
            <Link
              key={c.name}
              to={viewAllHref}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green-50 text-lg">
                📱
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-xs text-stone-500">{c.items} Items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-stone-500">No cellphones available.</p>
      )}
    </section>
  );
}

/* =========================================================
   Laptops Section
========================================================= */

function LaptopsSection({ products = [], viewAllHref = "/laptops" }) {
  const miniCategories = [
    { name: "Macbook", items: products.filter((p) => /macbook/i.test(p.title || "")).length },
    { name: "Gaming", items: products.filter((p) => /rog|gaming/i.test(p.title || "")).length },
    { name: "Dell", items: products.filter((p) => /dell/i.test(p.title || "")).length },
    { name: "HP", items: products.filter((p) => /hp|spectre/i.test(p.title || "")).length },
    { name: "Asus", items: products.filter((p) => /asus/i.test(p.title || "")).length },
    { name: "Others", items: products.length },
  ];

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Best Laptops &amp; Computers</h2>
        <Link
          to={viewAllHref}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 border-b border-neutral-400/25 pb-6 lg:grid-cols-[605px_1fr]">
        {products.length > 0 ? (
          <Link to={`/product/${products[0].id}`} className="relative block overflow-hidden rounded-xl">
            <img
              src={products[0].image || FALLBACK_IMG}
              alt={products[0].title}
              className="h-48 w-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-black/40 p-6">
              <h3 className="max-w-xs text-2xl font-medium uppercase leading-tight text-white line-clamp-2">
                {products[0].title}
              </h3>
              <p className="text-xs text-white line-clamp-1">
                {products[0].description || "Power meets performance"}
              </p>
              <span className="w-fit rounded-lg bg-green-600 px-5 py-2 text-xs font-medium uppercase text-white">
                Explore
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl bg-neutral-100 p-6 text-center text-sm text-stone-500">
            No laptops yet
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
          {miniCategories.map((c) => (
            <Link
              key={c.name}
              to={viewAllHref}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green-50 text-lg">
                💻
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-xs text-stone-500">{c.items} Items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-stone-500">No laptops available.</p>
      )}
    </section>
  );
}

/* =========================================================
   Category Grid Section
========================================================= */
/* =========================================================
   Smart Category Section — Real Supabase Data
========================================================= */

function SmartCategorySection({ title, keywords, products = [] }) {
  // ✅ Filter products matching keywords
  const matchedProducts = products.filter((p) => {
    const text = `${p.title || ""} ${p.category || ""} ${p.brand || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });

  // ✅ Get unique category names from matched products
  // Agar zyada products nahi mile, to fallback to title-based grouping
  const groupedByTitle = {};
  matchedProducts.forEach((p) => {
    // Get first word of title as category
    const firstWord = (p.title || "Other").split(" ")[0];
    if (!groupedByTitle[firstWord]) {
      groupedByTitle[firstWord] = [];
    }
    groupedByTitle[firstWord].push(p);
  });

  // ✅ Build categories list
  let categories = Object.keys(groupedByTitle)
    .slice(0, 4)
    .map((name) => {
      const items = groupedByTitle[name];
      return {
        name: name,
        items: items.length,
        image: items[0]?.image || FALLBACK_IMG,
      };
    });

  // ✅ Fallback — agar kuch nahi mila
  if (categories.length === 0) {
    categories = keywords.slice(0, 4).map((kw) => ({
      name: kw.charAt(0).toUpperCase() + kw.slice(1),
      items: 0,
      image: FALLBACK_IMG,
    }));
  }

  // ✅ Banner image — first matched product
  const bannerImage = matchedProducts[0]?.image || FALLBACK_IMG;

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">{title}</h2>
        <Link
          to="/category"
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      <Link to="/category" className="mb-6 block overflow-hidden rounded-xl">
        <img
          src={bannerImage}
          alt={title}
          className="h-40 w-full object-cover sm:h-48"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </Link>

      <div className="grid grid-cols-2 gap-6 border-t border-neutral-400/30 pt-6">
        {categories.map((c) => (
          <Link
            key={c.name}
            to="/category"
            className="flex flex-col items-center gap-2 text-center transition hover:opacity-80"
          >
            <div className="size-20 overflow-hidden rounded-full bg-neutral-100 sm:size-28">
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <div>
              <p className="text-sm font-bold capitalize">{c.name}</p>
              <p className="text-xs text-stone-500">{c.items} Items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
function CategoryGridSection({ title, categories, banner, columns = 2, viewAllHref = "/category" }) {
  const gridCols = columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-2";
  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">{title}</h2>
        <Link
          to={viewAllHref}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>
      <Link to={viewAllHref} className="mb-6 block overflow-hidden rounded-xl">
        <img
          src={banner.image}
          alt={banner.title}
          className="h-40 w-full object-cover sm:h-48"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </Link>
      <div className={`grid ${gridCols} gap-6 border-t border-neutral-400/30 pt-6`}>
        {categories.map((c) => (
          <Link
            key={c.name}
            to={viewAllHref}
            className="flex flex-col items-center gap-2 text-center transition hover:opacity-80"
          >
            <div className="size-20 overflow-hidden rounded-full bg-neutral-100 sm:size-28">
              <img
                src={banner.image}
                alt={c.name}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            <div>
              <p className="text-sm font-bold capitalize">{c.name}</p>
              <p className="text-xs text-stone-500">{c.items} Items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   Two Banners
========================================================= */

function TwoBanners() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Link to="/category" className="relative block overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1554224155-1696413565d3?w=646&q=80"
          alt="Cashback"
          className="h-44 w-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-black/30 p-6">
          <p className="text-4xl font-bold text-yellow-400">10% Back</p>
          <p className="text-sm text-white">
            Earn 10% Cash back on Rovado. <span className="underline">Learn How</span>
          </p>
        </div>
      </Link>
      <div className="relative overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=646&q=80"
          alt="Download app"
          className="h-44 w-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-black/40 p-6">
          <p className="text-2xl font-medium text-white">Download our app</p>
          <p className="text-xs text-stone-300">
            Enter your phone number and we'll send you a download link.
          </p>
          <div className="flex w-full max-w-xs overflow-hidden rounded-md bg-white/10">
            <input
              type="text"
              placeholder="(+xx) xxx..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-400"
            />
            <button className="px-3 text-xs font-normal uppercase text-green-500">
              Send Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Recently Viewed
========================================================= */

function RecentlyViewed({ products = [] }) {
  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Your recently viewed</h2>
        <Link
          to="/category"
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600"
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">No recently viewed products.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="flex gap-3 rounded-lg p-2 transition hover:bg-neutral-50"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded bg-neutral-100">
                <img
                  src={p.image || FALLBACK_IMG}
                  alt={p.title}
                  loading="lazy"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                  className="h-full w-full object-cover"
                />
                {p.badge && (
                  <span className="absolute left-1 top-1">
                    <Badge tone="dark">{p.badge}</Badge>
                  </span>
                )}
              </div>
              <div className="min-w-0">
                {p.rating != null && <StarRating count={p.rating} reviews={p.reviews} />}
                <p className="mt-1 line-clamp-2 text-xs font-bold">{p.title}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-base font-bold ${p.oldPrice ? "text-red-600" : "text-black"}`}>
                    {p.price}
                  </span>
                  {p.oldPrice && (
                    <span className="text-sm font-bold text-stone-500 line-through">
                      {p.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   About Blurb
========================================================= */

function AboutBlurb() {
  return (
    <section className="rounded-xl p-4 sm:p-6">
      <h2 className="text-lg font-bold">Rovado – #1 Online Marketplace for technology</h2>
      <p className="mt-4 text-sm leading-6 text-stone-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae posuere mi. Quisque iaculis dignissim scelerisque. Morbi condimentum sagittis leo vitae tempor.
Suspendisse in dolor odio. Sed aliquet ac lacus ut luctus. Fusce mattis sollicitudin sem, id lobortis nibh ullamcorper a. Donec vehicula dolor et arcu consequat mattis.
Fusce mattis nec nulla in scelerisque.
      </p>
      <p className="mt-4 text-sm leading-6 text-stone-500">
       Morbi pharetra sem mauris, nec aliquet ipsum vestibulum suscipit. Curabitur non euismod dui. Proin eget justo eu erat luctus placerat. Nam rhoncus ipsum ac enim faucibus, at consequat
ante maximus. Vestibulum at nibh ac odio ultrices varius. Duis vitae libero mollis, lobortis ligula id, varius erat. Sed id odio dictum, laoreet enim ac, commodo magna. Praesent sodales porttitor
maximus. Sed a lacus felis. Maecenas consectetur consequat orci scelerisque malesuada. Fusce vel orci eu tortor consequat mattis quis at ante. Class aptent taciti sociosqu ad litora
torquent per conubi,
      </p>
      <Link to="/category" className="mt-4 flex items-center gap-1 text-xs hover:text-green-600">
        View All <ChevronRight size={12} />
      </Link>
    </section>
  );
}

/* =========================================================
   Footer
========================================================= */

function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="mb-3 text-lg font-bold uppercase">
              Rovado - 1st ISB tech online market
            </h3>
            <p className="mb-3 text-sm uppercase text-black">hotline 24/7</p>
            <p className="mb-4 text-3xl font-bold text-green-600">(025) 3686 25 16</p>
            <p className="mb-2 text-sm text-black">Islamabad, PK</p>
            <p className="mb-4 text-sm text-black">workinga199430@gmail.com</p>
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

  {/* Twitter / X */}
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

  {/* LinkedIn — aapka profile */}
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
                    <Link to="/category" className="hover:text-green-600">
                      {item}
                    </Link>
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
              <button className="text-sm font-bold uppercase text-green-600">
                Subscribe
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              By subscribing, you're accepted our{" "}
              <Link to="/register" className="text-black underline">Policy</Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-neutral-400/30 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-stone-500">
            © 2026 <span className="font-bold text-black">usman.dev</span>. All Rights Reserved
          </p>
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "PayPal", "Amex", "Discover"].map((p) => (
              <span
                key={p}
                className="rounded bg-neutral-100 px-2 py-1 text-[10px] text-neutral-500"
              >
                {p}
              </span>
            ))}
          </div>
          <Link to="/" className="flex items-center gap-1 text-sm text-blue-600">
            Mobile Site
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   Main Home Component
========================================================= */

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("id", { ascending: false })
          .limit(200);

        if (error) {
          console.error("[home] Supabase error:", error.message);
          setAllProducts([]);
          setLoading(false);
          return;
        }

        const normalized = (data || []).map((p) => ({
          ...p,
          price:
            p.price != null
              ? typeof p.price === "string"
                ? p.price
                : `$${Number(p.price).toFixed(2)}`
              : "$0.00",
          oldPrice:
            p.old_price != null ? `$${Number(p.old_price).toFixed(2)}` : undefined,
          isNew: p.is_new,
        }));

        setAllProducts(normalized);
      } catch (err) {
        console.warn("[home] error:", err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bestSellersData = allProducts.filter((p) => p.category === "best-seller");
  const cellphonesData = allProducts.filter((p) => p.category === "cellphones-tablets");
  const laptopsData = allProducts.filter((p) => p.category === "laptops-computers");
  // ✅ Recently viewed — localStorage se + fallback
const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem("rovado_recently_viewed");
    if (stored) {
      const ids = JSON.parse(stored);
      const found = ids
        .map((id) => allProducts.find((p) => String(p.id) === String(id)))
        .filter(Boolean);
      if (found.length > 0) return found;
    }
  } catch (e) {
    console.warn("Recently viewed read error:", e);
  }
  // Fallback: DB me "recently-viewed" category ke products, warna last 4 products
  const dbRecent = allProducts.filter((p) => p.category === "recently-viewed");
  if (dbRecent.length > 0) return dbRecent;
  return allProducts.slice(0, 4);
};

const recentlyViewedData = getRecentlyViewed();

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6">
        <Header />
        <PromoBar />
        <MobileCategoryScroller />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_1fr_20rem] lg:items-start">
          <Sidebar />
          <HeroCarousel products={[...cellphonesData, ...laptopsData]} />
          <SideDealCards products={[...cellphonesData, ...laptopsData]} />
        </div>

        <FeaturedBrandsAndTopCategories />
        <DealsOfTheDay products={bestSellersData.length > 0 ? bestSellersData : allProducts} />
        <MemberBanner />

        {/* ✅ All products pass karo — tab filter karega */}
<ProductRail
  title="Best seller"
  tabs={["Best seller", "New in", "Popular"]}
  products={
    bestSellersData.length > 0
      ? [...bestSellersData, ...allProducts.filter((p) => !bestSellersData.find((b) => b.id === p.id))]
      : allProducts
  }
  viewAllHref="/category"
/>

        <BrandNewForYou products={allProducts} />

        <TopCellphonesSection products={cellphonesData} viewAllHref="/cellphones" />

        <LaptopsSection products={laptopsData} viewAllHref="/laptops" />

        {/* ✅ SMART SECTIONS — real Supabase data */}
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <SmartCategorySection
    title="Audios & Cameras"
    keywords={["speaker", "camera", "earbuds", "microphone", "headphone", "audio", "sound", "dslr"]}
    products={allProducts}
  />
  <SmartCategorySection
    title="Gaming"
    keywords={["gaming", "monitor", "chair", "controller", "keyboard", "mouse", "rog", "zephyrus"]}
    products={allProducts}
  />
  <SmartCategorySection
    title="Office Equipments"
    keywords={["printer", "network", "security", "projector", "office", "laser"]}
    products={allProducts}
  />
</div>

        <TwoBanners />
        <RecentlyViewed products={recentlyViewedData} />
        <AboutBlurb />
      </div>
      <Footer />
    </div>
  );
}