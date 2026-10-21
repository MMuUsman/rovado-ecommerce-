
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
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
  Smartphone,
  Laptop,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
        <Link to="/contact" className="hover:text-green-600">Sell on Rovado</Link>
        <Link to="/profile/orders" className="hover:text-green-600">Order Tracking</Link>

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
  const [openCategories, setOpenCategories] = useState(true);
  const [openPages, setOpenPages] = useState(false);
  const headerRef = useRef(null);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const location = useLocation();

  const { count, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, profile, signOut } = useAuth();

  const cartTotal = (subtotal || 0).toFixed(2);

  // Close drawer and dropdowns automatically when route changes
  useEffect(() => {
    setOpen(false);
    setOpenDropdown(null);
  }, [location.pathname, location.search]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = originalStyle;
      };
    } else {
      if (menuButtonRef.current && document.activeElement === closeButtonRef.current) {
        menuButtonRef.current.focus();
      }
    }
  }, [open]);

  // Escape key listener for both desktop dropdown and mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (open) {
          setOpen(false);
          menuButtonRef.current?.focus();
        }
        if (openDropdown) {
          setOpenDropdown(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, openDropdown]);

  // Header-wide outside click handler for desktop dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
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

  const scrollToTopSmooth = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pagesList = [
    { label: "About", to: "/about" },
    { label: "Profile", to: "/profile" },
    { label: "Cart", to: "/cart" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Checkout", to: "/checkout" },
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
    { label: "Contact", to: "/contact" },
  ];
  if (profile?.role === "admin") {
    pagesList.push({ label: "Admin Dashboard", to: "/admin" });
  }

  const categoryItems = [
    { label: "Cellphones & Tablets", to: "/cellphones" },
    { label: "Laptops & Computers", to: "/laptops" },
    { label: "Best Sellers", to: "/cellphones?sub=bestseller", badge: "Hot" },
    { label: "New Arrivals", to: "/laptops?sub=new", badge: "New" },
    { label: "Deals of the Day", to: "/cellphones?sub=deals", badge: "Sale" },
  ];

  const navItems = [
    { label: "Home", to: "/", dropdown: null },
    {
      label: "Pages",
      to: "#",
      dropdown: pagesList,
    },
    {
      label: "Products",
      to: "#",
      dropdown: [
        { label: "Cellphones & Tablets", to: "/cellphones" },
        { label: "Laptops & Computers", to: "/laptops" },
        { label: "Best Sellers", to: "/cellphones?sub=bestseller" },
        { label: "New Arrivals", to: "/laptops?sub=new" },
        { label: "Deals of the Day", to: "/cellphones?sub=deals" },
      ],
    },
    { label: "Contact", to: "/contact", dropdown: null },
  ];

  return (
    <>
      <header ref={headerRef} className="relative z-30 rounded-xl bg-white shadow-xs">
        <TopBar />

        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5">
          {/* Logo on Left */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/"
              onClick={scrollToTopSmooth}
              className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-md"
              aria-label="Rovado Home"
            >
              <img
                src="/rovado-logo.png"
                alt="Rovado"
                className="h-8 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = "true";
                    e.target.src = "/Rovadologo.jpg";
                  }
                }}
              />
            </Link>

            {/* Desktop Navigation (>= 1024px) */}
            <nav className="hidden items-center gap-4 xl:gap-6 text-xs xl:text-sm font-bold uppercase lg:flex">
              {navItems.map((item) => {
                const isActive = item.to !== "#" && location.pathname === item.to;
                return (
                  <div key={item.label} className="relative">
                    {item.dropdown ? (
                      <button
                        type="button"
                        onClick={(e) => handleNavClick(item, e)}
                        aria-expanded={openDropdown === item.label}
                        aria-haspopup="true"
                        className={`flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded px-1.5 py-1 ${
                          openDropdown === item.label
                            ? "text-green-600"
                            : "text-black hover:text-green-600"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          size={11}
                          className={`opacity-70 transition duration-200 ${
                            openDropdown === item.label ? "rotate-180 text-green-600" : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() => {
                          if (item.to === "/") scrollToTopSmooth();
                        }}
                        className={`flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded px-1.5 py-1 ${
                          isActive
                            ? "text-green-600 font-extrabold"
                            : "text-black hover:text-green-600"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}

                    {item.dropdown && openDropdown === item.label && (
                      <div className="absolute left-0 top-full z-50 mt-2 min-w-[210px] rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150">
                        {item.dropdown.map((sub) => {
                          const isSubActive = location.pathname === sub.to;
                          return (
                            <Link
                              key={sub.label}
                              to={sub.to}
                              onClick={() => setOpenDropdown(null)}
                              className={`block px-4 py-2 text-xs font-medium uppercase transition ${
                                isSubActive
                                  ? "bg-green-50 text-green-600 font-bold"
                                  : "text-stone-600 hover:bg-green-50 hover:text-green-600"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Actions (>= 1024px) */}
          <div className="hidden items-center gap-3 xl:gap-4 lg:flex">
            <Link
              to="/search"
              aria-label="Search products"
              className="grid size-10 place-items-center rounded-full bg-violet-100 transition hover:bg-violet-200 text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Search size={18} />
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  aria-label="User profile"
                  className="grid size-10 place-items-center rounded-full bg-violet-100 text-stone-700 hover:bg-violet-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <User size={18} />
                </Link>
                <div className="text-xs">
                  <p className="uppercase text-stone-500">Welcome</p>
                  <button
                    onClick={signOut}
                    className="font-bold uppercase text-black hover:text-green-600 transition"
                  >
                    {(profile?.full_name || user.email?.split("@")[0] || "User").slice(0, 12)} · Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  aria-label="Login or register"
                  className="grid size-10 place-items-center rounded-full bg-violet-100 text-stone-700 hover:bg-violet-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <User size={18} />
                </Link>
                <div className="text-xs">
                  <p className="uppercase text-stone-500">Welcome</p>
                  <Link
                    to="/login"
                    className="font-bold uppercase text-black hover:text-green-600 transition"
                  >
                    Log in / Register
                  </Link>
                </div>
              </>
            )}

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative grid size-10 place-items-center rounded-full bg-violet-100 transition hover:bg-violet-200 text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-green-600 text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <div className="text-xs">
              <p className="uppercase text-stone-500">Cart</p>
              <Link to="/cart" className="font-bold uppercase text-black hover:text-green-600 transition">
                ${cartTotal}
              </Link>
            </div>

            <Link
              to="/cart"
              aria-label={`Shopping cart (${count} items, $${cartTotal})`}
              className="relative grid size-10 place-items-center rounded-full bg-violet-100 transition hover:bg-violet-200 text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-green-600 text-[10px] font-bold text-white shadow-xs">
                  {count}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile & Tablet Right Actions (< 1024px) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            <Link
              to="/search"
              aria-label="Search products"
              className="grid size-9 sm:size-10 place-items-center rounded-full bg-violet-100 text-stone-700 hover:bg-violet-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Search size={16} />
            </Link>

            {/* Tablet-friendly user shortcut */}
            <Link
              to={user ? "/profile" : "/login"}
              aria-label={user ? "My Profile" : "Log in"}
              className="hidden sm:grid size-10 place-items-center rounded-full bg-violet-100 text-stone-700 hover:bg-violet-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <User size={16} />
            </Link>

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative grid size-9 sm:size-10 place-items-center rounded-full bg-violet-100 text-stone-700 hover:bg-violet-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Heart size={16} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 sm:size-4.5 place-items-center rounded-full bg-green-600 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={`Shopping cart (${count} items)`}
              className="relative grid size-9 sm:size-10 place-items-center rounded-full bg-violet-100 text-stone-700 hover:bg-violet-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <ShoppingCart size={16} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 sm:size-4.5 place-items-center rounded-full bg-green-600 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            {/* Accessible Hamburger Menu Button */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              aria-label="Open navigation menu"
              className="flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white px-2.5 py-2 sm:px-3 sm:py-2 text-xs font-bold uppercase transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Menu size={18} />
              <span className="hidden xs:inline text-[11px] font-bold tracking-wide">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ MOBILE & TABLET NAVIGATION DRAWER ═══════ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Panel */}
      <aside
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed inset-y-0 right-0 z-50 flex w-[88vw] max-w-[360px] sm:max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5 bg-neutral-50/80">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center"
            aria-label="Rovado Home"
          >
            <img
              src="/rovado-logo.png"
              alt="Rovado"
              className="h-7 sm:h-8 w-auto object-contain"
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = "true";
                  e.target.src = "/Rovadologo.jpg";
                }
              }}
            />
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="grid size-9 place-items-center rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-stone-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Account Card inside Drawer */}
        <div className="border-b border-neutral-100 bg-neutral-50/60 p-4">
          {user ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-500 uppercase font-medium">Logged in as</p>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="shrink-0 rounded-md bg-red-50 hover:bg-red-100 px-2.5 py-1 text-[11px] font-bold uppercase text-red-600 transition"
                >
                  Logout
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center text-xs">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-neutral-200 bg-white py-1.5 font-medium hover:border-green-600 hover:text-green-600 transition"
                >
                  My Profile
                </Link>
                <Link
                  to="/profile/orders"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-neutral-200 bg-white py-1.5 font-medium hover:border-green-600 hover:text-green-600 transition"
                >
                  My Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm font-bold text-neutral-900">Welcome to Rovado</p>
                <p className="text-xs text-stone-500">Sign in to track orders &amp; access your cart</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-green-600 py-2 text-xs font-bold uppercase text-white hover:bg-green-700 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-neutral-300 bg-white py-2 text-xs font-bold uppercase text-neutral-800 hover:bg-neutral-50 transition"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [-ms-overflow-style:none] [scrollbar-width:thin] overscroll-contain">
          {/* Main Navigation */}
          <nav className="flex flex-col gap-1 text-sm font-bold">
            <Link
              to="/"
              onClick={() => {
                setOpen(false);
                scrollToTopSmooth();
              }}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition ${
                location.pathname === "/"
                  ? "bg-green-50 text-green-700 font-extrabold"
                  : "text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <span>Home</span>
              <ChevronRight size={14} className="text-stone-400" />
            </Link>

            {/* Shop by Category Accordion */}
            <div className="rounded-lg border border-neutral-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategories((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-2.5 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-900 transition font-bold"
              >
                <span>Shop Categories</span>
                <ChevronDown
                  size={14}
                  className={`text-stone-500 transition duration-200 ${
                    openCategories ? "rotate-180 text-green-600" : ""
                  }`}
                />
              </button>

              {openCategories && (
                <div className="flex flex-col bg-white py-1 divide-y divide-neutral-50">
                  {categoryItems.map((cat) => (
                    <Link
                      key={cat.label}
                      to={cat.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium transition ${
                        location.pathname === cat.to.split("?")[0]
                          ? "bg-green-50/70 text-green-700 font-bold"
                          : "text-stone-700 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {cat.badge && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 uppercase">
                          {cat.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Company & Pages Accordion */}
            <div className="rounded-lg border border-neutral-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenPages((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-2.5 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-900 transition font-bold"
              >
                <span>Company &amp; Pages</span>
                <ChevronDown
                  size={14}
                  className={`text-stone-500 transition duration-200 ${
                    openPages ? "rotate-180 text-green-600" : ""
                  }`}
                />
              </button>

              {openPages && (
                <div className="flex flex-col bg-white py-1 divide-y divide-neutral-50">
                  {pagesList.map((p) => (
                    <Link
                      key={p.label}
                      to={p.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between px-4 py-2 text-xs font-medium transition ${
                        location.pathname === p.to
                          ? "bg-green-50/70 text-green-700 font-bold"
                          : "text-stone-700 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <span>{p.label}</span>
                      <ChevronRight size={12} className="text-stone-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition ${
                location.pathname === "/contact"
                  ? "bg-green-50 text-green-700 font-extrabold"
                  : "text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <span>Contact Us</span>
              <ChevronRight size={14} className="text-stone-400" />
            </Link>
          </nav>

          {/* Quick Discover Pills */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Popular Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Laptops", to: "/laptops" },
                { name: "iPhones", to: "/cellphones?search=iPhone" },
                { name: "Gaming", to: "/laptops?search=gaming" },
                { name: "Samsung", to: "/cellphones?search=Samsung" },
                { name: "Deals", to: "/cellphones?sub=deals" },
              ].map((tag) => (
                <Link
                  key={tag.name}
                  to={tag.to}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-neutral-100 hover:bg-green-50 hover:text-green-700 px-3 py-1 text-xs font-medium text-stone-700 transition"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-neutral-200 bg-neutral-50 p-4 space-y-3">
          {/* Cart summary */}
          <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-neutral-200 shadow-2xs text-xs">
            <div>
              <p className="text-[10px] text-stone-500 uppercase font-medium">Cart Total</p>
              <p className="font-bold text-sm text-neutral-900">${cartTotal}</p>
            </div>
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="rounded-md bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-bold uppercase text-white transition"
            >
              View Cart ({count})
            </Link>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <span>Hotline: (025) 3886 25 16</span>
            <span>USD · English</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export function PromoBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearch("");
    } else {
      navigate("/search");
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
        <button type="submit" aria-label="Search" className="px-4 text-black">
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

export function Breadcrumb({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-4 text-sm sm:px-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-500">/</span>}
          {item.href ? (
            <Link to={item.href} className="font-bold text-neutral-400">
              {item.label}
            </Link>
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

const getFooterLink = (item) => {
  const lower = item.toLowerCase();
  if (lower.includes("laptop") || lower.includes("pc")) return "/laptops";
  if (lower.includes("phone") || lower.includes("tablet")) return "/cellphones";
  if (lower.includes("about")) return "/about";
  if (lower.includes("track order") || lower.includes("order")) return "/profile/orders";
  if (lower.includes("account")) return "/profile";
  if (lower.includes("cart")) return "/cart";
  if (
    lower.includes("contact") ||
    lower.includes("service") ||
    lower.includes("support") ||
    lower.includes("policy") ||
    lower.includes("terms") ||
    lower.includes("faq") ||
    lower.includes("career") ||
    lower.includes("seller") ||
    lower.includes("partner")
  ) {
    return "/contact";
  }
  return "/cellphones";
};

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
                    <Link to={getFooterLink(item)} className="hover:text-green-600">
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
              <button className="text-sm font-bold uppercase text-green-600">Subscribe</button>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              By subscribing, you&apos;re accepted our{" "}
              <Link to="/contact" className="text-black underline">
                Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-neutral-400/30 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-stone-500">
            © 2026 <span className="font-bold text-black">usman.dev</span>. All Rights Reserved
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { name: "Visa", icon: "/payments/visa.svg", h: "h-3.5" },
              { name: "Mastercard", icon: "/payments/mastercard.svg", h: "h-5" },
              { name: "Stripe", icon: "/payments/stripe.svg", h: "h-4" },
              { name: "Amex", icon: "/payments/amex.svg", h: "h-4" },
              { name: "Discover", icon: "/payments/discover.svg", h: "h-3.5" },
            ].map((p) => (
              <div
                key={p.name}
                title={p.name}
                className="flex h-7 sm:h-8 min-w-[46px] items-center justify-center rounded-md border border-neutral-200 bg-white px-2 shadow-xs transition hover:border-neutral-300"
              >
                <img
                  src={p.icon}
                  alt={p.name}
                  className={`${p.h} w-auto max-w-[48px] object-contain`}
                />
              </div>
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

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-200 overflow-x-hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6">{children}</div>
      <div className="mt-4">
        <Footer />
      </div>
    </div>
  );
}
