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
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Gamepad2,
  Wifi,
  Camera,
  Headphones,
  Printer,
  HardDrive,
  Plug,
  Tag,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useLoading, RovadoLoadingScreen } from "../context/LoadingContext";
import { Header } from "../components/Layout";

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
  const [added, setAdded] = useState(false);
  const src = imgError || !image ? FALLBACK_IMG : image;
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const isFav = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addItem) {
      addItem(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex shrink-0 flex-col justify-between rounded-xl bg-white border border-stone-200/80 p-3 sm:p-4 snap-start w-44 sm:w-56 transition hover:shadow-md hover:border-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      <div>
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
          <img
            src={src}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {badge && (
            <div className="absolute left-2 top-2 z-10">
              <Badge tone={isNew ? "dark" : "green"}>{badge}</Badge>
            </div>
          )}
          <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              aria-label={isFav ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`grid size-7 sm:size-8 place-items-center rounded-full bg-white/95 shadow-xs transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                isFav ? "text-red-500" : "text-neutral-400 hover:text-red-500"
              }`}
            >
              <Heart size={14} className={isFav ? "fill-red-500 text-red-500" : ""} />
            </button>
            <button
              type="button"
              aria-label={`Add ${title} to cart`}
              onClick={handleAddToCart}
              className={`grid size-7 sm:size-8 place-items-center rounded-full shadow-xs transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                added ? "bg-green-600 text-white" : "bg-white/95 text-neutral-600 hover:bg-green-600 hover:text-white"
              }`}
            >
              <ShoppingCart size={13} />
            </button>
          </div>
        </div>

        {rating != null && <StarRating count={rating} reviews={reviews} />}

        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-bold text-black group-hover:text-green-600 transition">
          {title}
        </h3>
      </div>

      <div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-base sm:text-lg font-semibold ${oldPrice ? "text-red-600" : "text-black"}`}>
            {price}
          </span>
          {oldPrice && (
            <span className="text-xs sm:text-sm font-semibold text-stone-500 line-through">{oldPrice}</span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-medium uppercase">
          {shipping && (
            <span className="rounded bg-green-600/5 px-2 py-1 text-green-600">{shipping}</span>
          )}
          {stock === "in" && <span className="text-black">● In stock</span>}
          {stock === "out" && <span className="text-black">● Out of stock</span>}
          {stock === "contact" && <span className="text-black">● Contact</span>}
        </div>
      </div>
    </Link>
  );
}

function ProductRail({ title, tabs, products, viewAllHref = "/cellphones" }) {
  const [active, setActive] = useState(tabs?.[0] ?? "");
  const scrollerId = `rail-${(title || "products").replace(/\s+/g, "-")}`;

  const getFilteredByTab = () => {
    if (!active || !tabs || tabs.length === 0) return products;

    switch (active) {
      case "Best seller":
        const best = products.filter((p) => p.is_best_seller);
        if (best.length > 0) return best.slice(0, 8);
        return [...products]
          .sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0))
          .slice(0, 8);

      case "New in":
        const newItems = products.filter((p) => p.is_new || p.isNew);
        if (newItems.length > 0) return newItems.slice(0, 8);
        return [...products]
          .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
          .slice(0, 8);

      case "Popular":
        const pop = products.filter((p) => p.is_popular);
        if (pop.length > 0) return pop.slice(0, 8);
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
    if (el) el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-3 sm:p-6 shadow-xs border border-neutral-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          {title && <h2 className="text-base sm:text-lg font-bold uppercase">{title}</h2>}
          {tabs?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`text-sm sm:text-lg uppercase whitespace-nowrap transition ${
                active === tab ? "font-bold text-black" : "font-normal text-stone-500 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={viewAllHref}
            className="text-[10px] sm:text-xs uppercase text-stone-500 hover:text-green-600 font-medium"
          >
            View All
          </Link>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {displayProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          No products available for "{active}".
        </p>
      ) : (
        <div
          id={scrollerId}
          className="flex snap-x snap-mandatory gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
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
  { name: "Laptops", Icon: Laptop },
  { name: "PC & Computers", Icon: Monitor },
  { name: "Cell Phones", Icon: Smartphone },
  { name: "Tablets", Icon: Tablet },
  { name: "Gaming & VR", Icon: Gamepad2 },
  { name: "Networking", Icon: Wifi },
  { name: "Cameras", Icon: Camera },
  { name: "Sounds", Icon: Headphones },
  { name: "Office", Icon: Printer },
  { name: "Storage, USB", Icon: HardDrive },
  { name: "Accessories", Icon: Plug },
  { name: "Clearance", Icon: Tag },
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
    <div className="flex flex-col gap-3 sm:gap-4 rounded-xl bg-green-600 p-3 sm:p-4 text-white sm:flex-row sm:items-center sm:justify-between">
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
          className="w-full bg-white px-4 py-2.5 sm:py-3 text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <button type="submit" className="px-4 text-black">
          <Search size={16} />
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 text-[10px] sm:text-xs font-medium uppercase">
        {items.map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-1.5 sm:gap-2">
            <Icon size={14} /> {text}
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
  const getCategoryLink = (catName) => {
    const lower = (catName || "").toLowerCase();
    if (lower.includes("laptop") || lower.includes("pc") || lower.includes("gaming") || lower.includes("office") || lower.includes("storage")) {
      return "/laptops";
    }
    return "/cellphones";
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
              to={getCategoryLink(cat.name)}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-50 transition"
            >
              <span className="flex items-center gap-2">
                <cat.Icon size={16} className="text-stone-600" />
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
  const getCategoryLink = (catName) => {
    const lower = (catName || "").toLowerCase();
    if (lower.includes("laptop") || lower.includes("pc") || lower.includes("gaming") || lower.includes("office") || lower.includes("storage")) {
      return "/laptops";
    }
    return "/cellphones";
  };

  return (
    <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-3 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sidebarCategories.map((cat) => (
        <Link
          key={cat.name}
          to={getCategoryLink(cat.name)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-2 text-xs font-medium capitalize whitespace-nowrap hover:bg-neutral-200 transition"
        >
          <cat.Icon size={14} className="text-stone-600" />
          <span>{cat.name}</span>
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
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-56 w-full object-cover sm:h-72 lg:h-80"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 sm:gap-3 bg-black/30 p-4 sm:p-10">
          <h3 className="max-w-[85%] text-xl font-bold leading-tight text-white sm:text-3xl line-clamp-2">
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="max-w-[85%] text-[11px] sm:text-xs text-white line-clamp-2">
              {slide.subtitle}
            </p>
          )}
          <Link
            to={slide.productId ? `/product/${slide.productId}` : "/cellphones"}
            className={`mt-1 sm:mt-2 w-fit rounded-lg px-4 sm:px-6 py-2 text-[11px] sm:text-xs font-medium uppercase ${slide.ctaStyle}`}
          >
            {slide.cta}
          </Link>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs">
            <button onClick={handlePrev}>
              <ChevronLeft size={12} />
            </button>
            <span className="text-[10px] sm:text-xs">{index + 1} / {slides.length}</span>
            <button onClick={handleNext}>
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      {products.length >= 5 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {products.slice(3, 5).map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="relative block overflow-hidden rounded-xl bg-neutral-800"
            >
              <img
                src={p.image || FALLBACK_IMG}
                alt={p.title}
                className="h-28 sm:h-32 w-full object-cover opacity-70"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
              <div className="absolute inset-0 flex flex-col justify-center gap-1 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium leading-tight text-white line-clamp-2">
                  {p.title}
                </p>
                <p className="text-[10px] sm:text-xs text-white/80">
                  from <span className="font-bold text-green-400">{p.price}</span>
                </p>
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
      {deals.map((p) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          className="relative block overflow-hidden rounded-xl"
        >
          <img
            src={p.image || FALLBACK_IMG}
            alt={p.title}
            className="h-32 sm:h-40 lg:h-56 w-full object-cover"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
          <div className="absolute inset-0 flex flex-col justify-center gap-1 bg-black/40 p-3 sm:p-4">
            {p.brand && <p className="text-[10px] uppercase text-white">{p.brand}</p>}
            <p className="text-sm sm:text-lg font-semibold capitalize text-white line-clamp-2">
              {p.title}
            </p>
            <p className="text-lg sm:text-2xl font-light text-green-400">{p.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* =========================================================
   Featured Brands & Top Categories
========================================================= */

function FeaturedBrandsAndTopCategories() {
  const brands = [
    { name: "Apple", logo: "/brands/apple.svg" },
    { name: "Samsung", logo: "/brands/samsung.svg" },
    { name: "Sony", logo: "/brands/sony.svg" },
    { name: "Dell", logo: "/brands/dell.svg" },
    { name: "HP", logo: "/brands/hp.svg" },
    { name: "Asus", logo: "/brands/asus.svg" },
    { name: "Xiaomi", logo: "/brands/xiaomi.svg" },
    { name: "Lenovo", logo: "/brands/lenovo.svg" },
    { name: "Acer", logo: "/brands/acer.svg" },
    { name: "Nikon", logo: "/brands/nikon.svg" },
  ];

  const categories = [
    {
      name: "Laptops",
      href: "/laptops",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80",
    },
    {
      name: "PC Gaming",
      href: "/laptops?search=gaming",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&q=80",
    },
    {
      name: "Cellphones",
      href: "/cellphones",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80",
    },
    {
      name: "Smartphones",
      href: "/cellphones",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&q=80",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      {/* Featured Brands */}
      <div className="rounded-xl bg-white p-3 sm:p-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold uppercase">Featured Brands</h2>
          <Link to="/cellphones" className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600">
            View All <ChevronRight size={12} />
          </Link>
        </div>

        {/* Mobile: 3 columns, Desktop: 5 columns */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {brands.map((b) => (
            <Link
              key={b.name}
              to={`/search?brand=${encodeURIComponent(b.name)}`}
              title={b.name}
              className="group flex h-14 sm:h-16 items-center justify-center rounded-lg bg-neutral-50 p-2 sm:p-3 transition hover:bg-green-50 hover:shadow-sm"
            >
              <img
                src={b.logo}
                alt={b.name}
                className="max-h-7 sm:max-h-8 w-auto max-w-[80%] object-contain grayscale transition group-hover:grayscale-0"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="hidden text-xs font-bold text-neutral-600">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="rounded-xl bg-white p-3 sm:p-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold uppercase">Top Categories</h2>
          <Link to="/laptops" className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600">
            View All <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={c.href}
              className="group flex flex-col items-center gap-2 text-center"
            >
              <div className="size-16 sm:size-20 lg:size-24 overflow-hidden rounded-lg bg-neutral-100">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              </div>
              <p className="text-[11px] sm:text-sm font-semibold line-clamp-2">{c.name}</p>
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
  const [dealIndex, setDealIndex] = useState(0);
  const dealList = Array.isArray(products) && products.length > 0 ? products : [];
  const deal = dealList.length > 0 ? dealList[dealIndex % dealList.length] : null;

  const [timeLeft, setTimeLeft] = useState({ d: "02", h: "14", m: "25", s: "40" });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      // 48-hour rolling deals window
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59, 59);
      const diff = Math.max(0, end - now);
      const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
      setTimeLeft({ d, h, m, s });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deal) return null;

  const timers = [
    { label: "d", value: timeLeft.d },
    { label: "h", value: timeLeft.h },
    { label: "m", value: timeLeft.m },
    { label: "s", value: timeLeft.s },
  ];

  const numPrice = parseFloat(String(deal.price || "").replace(/[^0-9.]/g, ""));
  const numOld = parseFloat(String(deal.old_price || deal.oldPrice || "").replace(/[^0-9.]/g, ""));
  const savings = (numOld && numPrice && numOld > numPrice)
    ? `$${(numOld - numPrice).toFixed(2)}`
    : (deal.save || "$199.00");

  const totalStock = deal.stock_quantity ? Math.max(deal.stock_quantity, 50) : 75;
  const soldCount = deal.sold != null ? deal.sold : (deal.stock_quantity ? Math.min(Math.round(totalStock * 0.35), totalStock) : 26);
  const stockPercent = Math.min(Math.round((soldCount / totalStock) * 100), 100);

  return (
    <section>
      <div className="rounded-t-xl bg-green-600 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold uppercase text-white">
            Deals of the day
          </h2>
          <div className="flex items-center gap-3">
            <Link to="/cellphones" className="flex items-center gap-1 text-xs text-white hover:underline">
              View All <ChevronRight size={12} />
            </Link>
            {dealList.length > 1 && (
              <div className="flex items-center gap-1 text-white">
                <button
                  type="button"
                  onClick={() => setDealIndex((i) => (i - 1 + dealList.length) % dealList.length)}
                  className="grid size-6 place-items-center rounded bg-green-700/80 hover:bg-green-800 transition"
                  title="Previous Deal"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-[11px] font-mono px-1">
                  {(dealIndex % dealList.length) + 1}/{dealList.length}
                </span>
                <button
                  type="button"
                  onClick={() => setDealIndex((i) => (i + 1) % dealList.length)}
                  className="grid size-6 place-items-center rounded bg-green-700/80 hover:bg-green-800 transition"
                  title="Next Deal"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 rounded-b-xl bg-white p-3 sm:p-6 lg:grid-cols-2">
        <Link to={`/product/${deal.id}`} className="relative block">
          <img
            src={deal.image || FALLBACK_IMG}
            alt={deal.title || deal.name}
            className="w-full rounded-xl object-cover max-h-96"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
          <div className="absolute left-3 sm:left-4 top-3 sm:top-4 rounded-lg bg-green-600 px-2.5 sm:px-3 py-1.5 sm:py-2 text-white">
            <p className="text-[10px] uppercase">Save</p>
            <p className="text-base sm:text-lg font-medium">{savings}</p>
          </div>
        </Link>
        <div>
          <StarRating count={deal.rating ?? 5} reviews={deal.reviews ?? 12} />
          <Link to={`/product/${deal.id}`}>
            <h3 className="mt-2 text-sm sm:text-base font-bold line-clamp-2 hover:text-green-600 transition">
              {deal.title || deal.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-semibold text-red-600">{deal.price}</span>
            {(deal.old_price != null || deal.oldPrice != null) && (
              <span className="text-sm sm:text-base font-semibold text-stone-500 line-through">
                {deal.oldPrice || `$${Number(deal.old_price).toFixed(2)}`}
              </span>
            )}
          </div>
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
            <span className="rounded bg-green-600/5 px-2.5 sm:px-3 py-1 text-[10px] uppercase text-green-600">
              Free shipping
            </span>
            <span className="rounded bg-red-600/5 px-2.5 sm:px-3 py-1 text-[10px] uppercase text-red-600">
              Free gift
            </span>
          </div>
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase">
              Hurry up! Promotion ends in
            </p>
            <div className="flex gap-1.5 sm:gap-2">
              {timers.map((t) => (
                <div
                  key={t.label}
                  className="grid w-11 sm:w-14 place-items-center rounded-md bg-slate-200 py-1.5 sm:py-2"
                >
                  <span className="text-base sm:text-xl font-bold">-{t.value}</span>
                  <span className="text-xs sm:text-sm font-bold text-stone-500">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 sm:mt-6 border-t border-zinc-200 pt-3 sm:pt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-600"
                style={{ width: `${stockPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs">
              <span className="text-stone-500">Sold: </span>
              <span className="font-bold">
                {soldCount}/{totalStock}
              </span>
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
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-800 p-4 sm:p-6 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
      <p className="text-sm sm:text-lg text-white">
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
  const newItems = products.filter((p) => p.is_new || p.isNew);
  const items = newItems.length > 0 ? newItems : products.slice(0, 8);
  if (items.length === 0) return null;

  const scrollBrandNew = (dir) => {
    const el = document.getElementById("scroller-brand-new");
    if (el) el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-3 sm:p-6 shadow-xs border border-neutral-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold uppercase">Brand new for you</h2>
        <div className="flex items-center gap-2">
          <Link
            to="/cellphones?sub=new"
            className="text-[10px] sm:text-xs uppercase text-stone-500 hover:text-green-600 font-medium"
          >
            View All
          </Link>
          <button
            type="button"
            aria-label="Scroll brand new products left"
            onClick={() => scrollBrandNew(-1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="Scroll brand new products right"
            onClick={() => scrollBrandNew(1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      <div
        id="scroller-brand-new"
        className="flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
      >
        {items.map((it) => (
          <Link
            to={`/product/${it.id}`}
            key={it.id}
            className="group flex flex-col justify-between w-[72vw] max-w-[260px] xs:w-60 sm:w-64 lg:w-[calc(25%-12px)] shrink-0 snap-start rounded-xl border border-stone-200/80 p-3 sm:p-4 transition hover:border-green-600 hover:shadow-md bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div>
              <div className="relative mb-2 sm:mb-3 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                <img
                  src={it.image || FALLBACK_IMG}
                  alt={it.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
              </div>
              <h3 className="text-xs sm:text-base font-bold line-clamp-2 text-black group-hover:text-green-600 transition">
                {it.title}
              </h3>
              <p className="mt-1 text-[10px] sm:text-xs text-stone-500 line-clamp-2">
                {it.description || `Starting from ${it.price}`}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-2.5">
              <span className="text-xs sm:text-sm font-semibold text-black">
                {it.price}
              </span>
              <span className="inline-block rounded-lg border border-green-600 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium uppercase text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                Shop Now
              </span>
            </div>
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
    { name: "iPhone (iOS)", items: products.filter((p) => p.title?.toLowerCase().includes("iphone")).length, icon: "/brands/apple.svg", isImg: true },
    { name: "Android", items: products.filter((p) => /samsung|google|oneplus|xiaomi/i.test(p.title || "")).length, icon: "/brands/android.svg", isImg: true },
    { name: "5G Support", items: products.length, icon: "/brands/5g.svg", isImg: true },
    { name: "Gaming", items: 0, icon: Gamepad2, isImg: false },
    { name: "Xiaomi", items: products.filter((p) => p.title?.toLowerCase().includes("xiaomi")).length, icon: "/brands/xiaomi.svg", isImg: true },
    { name: "Accessories", items: 0, icon: Headphones, isImg: false },
  ];

  const scrollCellphones = (dir) => {
    const el = document.getElementById("cellphones-product-rail");
    if (el) el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-3 sm:p-6 shadow-xs border border-neutral-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold uppercase">Top cellphones &amp; tablets</h2>
        <div className="flex items-center gap-2">
          <Link to={viewAllHref} className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600 font-medium">
            View All <ChevronRight size={12} />
          </Link>
          <button
            type="button"
            aria-label="Scroll cellphones left"
            onClick={() => scrollCellphones(-1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="Scroll cellphones right"
            onClick={() => scrollCellphones(1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 grid grid-cols-1 gap-4 sm:gap-6 border-b border-neutral-400/25 pb-4 sm:pb-6 lg:grid-cols-[605px_1fr]">
        {products.length > 0 ? (
          <Link to={`/product/${products[0].id}`} className="relative block overflow-hidden rounded-xl group">
            <img
              src={products[0].image || FALLBACK_IMG}
              alt={products[0].title}
              className="h-48 sm:h-56 w-full object-cover transition duration-300 group-hover:scale-102"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-2 sm:gap-3 bg-black/40 p-4 sm:p-6">
              <h3 className="max-w-[90%] text-xl sm:text-2xl font-medium uppercase leading-tight text-white line-clamp-2">
                {products[0].title}
              </h3>
              <span className="w-fit rounded-lg bg-neutral-800 px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium uppercase text-white transition group-hover:bg-green-600">
                Shop Now
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl bg-neutral-100 p-6 text-center text-sm text-stone-500">
            No cellphones yet
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6">
          {miniCategories.map((c) => (
            <Link
              key={c.name}
              to={viewAllHref}
              className="flex items-center gap-2 sm:gap-3 transition hover:opacity-80"
            >
              <div className="grid size-10 sm:size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green-50 p-2 text-stone-700">
                {c.isImg ? (
                  <img
                    src={c.icon}
                    alt={c.name}
                    className="size-5 sm:size-6 object-contain"
                  />
                ) : (
                  <c.icon size={18} className="text-green-700" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold line-clamp-1">{c.name}</p>
                <p className="text-[10px] sm:text-xs text-stone-500">{c.items} Items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div
          id="cellphones-product-rail"
          className="flex snap-x snap-mandatory gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
        >
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
    { name: "Macbook", items: products.filter((p) => /macbook/i.test(p.title || "")).length, icon: "/brands/apple.svg", isImg: true },
    { name: "Gaming", items: products.filter((p) => /rog|gaming/i.test(p.title || "")).length, icon: Gamepad2, isImg: false },
    { name: "Dell", items: products.filter((p) => /dell/i.test(p.title || "")).length, icon: "/brands/dell.svg", isImg: true },
    { name: "HP", items: products.filter((p) => /hp|spectre/i.test(p.title || "")).length, icon: "/brands/hp.svg", isImg: true },
    { name: "Asus", items: products.filter((p) => /asus/i.test(p.title || "")).length, icon: "/brands/asus.svg", isImg: true },
    { name: "Others", items: products.length, icon: Laptop, isImg: false },
  ];

  const scrollLaptops = (dir) => {
    const el = document.getElementById("laptops-product-rail");
    if (el) el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-3 sm:p-6 shadow-xs border border-neutral-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold uppercase">Best Laptops &amp; Computers</h2>
        <div className="flex items-center gap-2">
          <Link to={viewAllHref} className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600 font-medium">
            View All <ChevronRight size={12} />
          </Link>
          <button
            type="button"
            aria-label="Scroll laptops left"
            onClick={() => scrollLaptops(-1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="Scroll laptops right"
            onClick={() => scrollLaptops(1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 grid grid-cols-1 gap-4 sm:gap-6 border-b border-neutral-400/25 pb-4 sm:pb-6 lg:grid-cols-[605px_1fr]">
        {products.length > 0 ? (
          <Link to={`/product/${products[0].id}`} className="relative block overflow-hidden rounded-xl group">
            <img
              src={products[0].image || FALLBACK_IMG}
              alt={products[0].title}
              className="h-48 sm:h-56 w-full object-cover transition duration-300 group-hover:scale-102"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-2 sm:gap-3 bg-black/40 p-4 sm:p-6">
              <h3 className="max-w-[90%] text-xl sm:text-2xl font-medium uppercase leading-tight text-white line-clamp-2">
                {products[0].title}
              </h3>
              <span className="w-fit rounded-lg bg-green-600 px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium uppercase text-white transition group-hover:bg-green-500">
                Explore
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl bg-neutral-100 p-6 text-center text-sm text-stone-500">
            No laptops yet
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6">
          {miniCategories.map((c) => (
            <Link
              key={c.name}
              to={viewAllHref}
              className="flex items-center gap-2 sm:gap-3 transition hover:opacity-80"
            >
              <div className="grid size-10 sm:size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-green-50 p-2 text-stone-700">
                {c.isImg ? (
                  <img
                    src={c.icon}
                    alt={c.name}
                    className="size-5 sm:size-6 object-contain"
                  />
                ) : (
                  <c.icon size={18} className="text-green-700" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold line-clamp-1">{c.name}</p>
                <p className="text-[10px] sm:text-xs text-stone-500">{c.items} Items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div
          id="laptops-product-rail"
          className="flex snap-x snap-mandatory gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
        >
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
   Smart Category Section
========================================================= */

const CATEGORY_DEFAULT_IMAGES = {
  Speaker: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80",
  Camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  Earbuds: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
  Microphone: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
  ASUS: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80",
  Gaming: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80",
  Printer: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80",
  Network: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
  Security: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80",
  Projector: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80",
};

const SECTION_BANNERS = {
  "Audios & Cameras": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80",
  "Gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
  "Office Equipments": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
};

function SmartCategorySection({ title, keywords, products = [] }) {
  const matchedProducts = products.filter((p) => {
    const text = `${p.title || ""} ${p.category || ""} ${p.brand || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });

  const groupedByTitle = {};
  matchedProducts.forEach((p) => {
    const firstWord = (p.title || "Other").split(" ")[0];
    if (!groupedByTitle[firstWord]) {
      groupedByTitle[firstWord] = [];
    }
    groupedByTitle[firstWord].push(p);
  });

  let categories = Object.keys(groupedByTitle)
    .slice(0, 4)
    .map((name) => {
      const items = groupedByTitle[name];
      const fallbackForName = CATEGORY_DEFAULT_IMAGES[name] || CATEGORY_DEFAULT_IMAGES[name.toUpperCase()] || FALLBACK_IMG;
      return {
        name: name,
        items: items.length,
        image: items[0]?.image || fallbackForName,
      };
    });

  if (categories.length === 0) {
    categories = keywords.slice(0, 4).map((kw) => {
      const name = kw.charAt(0).toUpperCase() + kw.slice(1);
      return {
        name: name,
        items: 0,
        image: CATEGORY_DEFAULT_IMAGES[name] || FALLBACK_IMG,
      };
    });
  }

  const bannerImage = SECTION_BANNERS[title] || matchedProducts[0]?.image || FALLBACK_IMG;
  const isLaptopSection = keywords.some((k) => /laptop|pc|gaming|office|computer/i.test(k));
  const categoryHref = isLaptopSection ? "/laptops" : "/cellphones";

  return (
    <section className="rounded-xl bg-white p-3 sm:p-6 shadow-xs border border-neutral-100 flex flex-col justify-between">
      <div>
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-bold uppercase line-clamp-1">{title}</h2>
          <Link to={categoryHref} className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600 whitespace-nowrap font-medium">
            View All <ChevronRight size={12} />
          </Link>
        </div>

        <Link to={categoryHref} className="mb-3 sm:mb-6 block overflow-hidden rounded-xl group">
          <img
            src={bannerImage}
            alt={title}
            className="h-32 sm:h-48 w-full object-cover transition duration-300 group-hover:scale-102"
            onError={(e) => { e.target.src = SECTION_BANNERS[title] || FALLBACK_IMG; }}
          />
        </Link>
      </div>

      <div className={`grid ${categories.length === 1 ? "grid-cols-1 place-items-center py-2" : "grid-cols-2"} gap-3 sm:gap-6 border-t border-neutral-200/60 pt-3 sm:pt-6`}>
        {categories.map((c) => {
          const isAsus = c.name.toLowerCase() === "asus";
          const resolvedImg = isAsus ? (CATEGORY_DEFAULT_IMAGES.ASUS || c.image) : (c.image || CATEGORY_DEFAULT_IMAGES[c.name] || FALLBACK_IMG);
          return (
            <Link
              key={c.name}
              to={`${categoryHref}?search=${encodeURIComponent(c.name)}`}
              className="group flex flex-col items-center gap-1.5 sm:gap-2 text-center transition hover:opacity-90 max-w-[140px]"
            >
              <div className="relative size-16 sm:size-20 lg:size-24 overflow-hidden rounded-full bg-neutral-100 ring-2 ring-neutral-200/70 shadow-sm transition group-hover:ring-green-500 group-hover:scale-105">
                <img
                  src={resolvedImg}
                  alt={c.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = CATEGORY_DEFAULT_IMAGES[c.name] || FALLBACK_IMG; }}
                />
                {isAsus && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/65 py-0.5">
                    <img
                      src="/brands/asus.svg"
                      alt="ASUS brand"
                      className="h-2 sm:h-2.5 w-auto object-contain brightness-0 invert"
                    />
                  </div>
                )}
              </div>
              <div className="w-full">
                <p className="text-xs sm:text-sm font-bold capitalize line-clamp-1 text-neutral-900 group-hover:text-green-600 transition">
                  {c.name}
                </p>
                <p className="text-[10px] sm:text-xs text-stone-500">
                  {c.items} {c.items === 1 ? "Item" : "Items"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   Two Banners
========================================================= */

function TwoBanners() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      <Link to="/cellphones" className="relative block overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1554224155-1696413565d3?w=646&q=80"
          alt="Cashback"
          className="h-40 sm:h-44 w-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-black/30 p-4 sm:p-6">
          <p className="text-3xl sm:text-4xl font-bold text-yellow-400">10% Back</p>
          <p className="text-xs sm:text-sm text-white">
            Earn 10% Cash back on Rovado. <span className="underline">Learn How</span>
          </p>
        </div>
      </Link>
      <div className="relative overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=646&q=80"
          alt="Download app"
          className="h-40 sm:h-44 w-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 sm:gap-3 bg-black/40 p-4 sm:p-6">
          <p className="text-xl sm:text-2xl font-medium text-white">Download our app</p>
          <p className="text-[11px] sm:text-xs text-stone-300">
            Enter your phone number and we'll send you a download link.
          </p>
          <div className="flex w-full max-w-xs overflow-hidden rounded-md bg-white/10">
            <input
              type="text"
              placeholder="(+xx) xxx..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white outline-none placeholder:text-neutral-400"
            />
            <button className="px-3 text-[10px] sm:text-xs font-normal uppercase text-green-500">
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
  const scrollRecent = (dir) => {
    const el = document.getElementById("recently-viewed-scroller");
    if (el) el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-3 sm:p-6 shadow-xs border border-neutral-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold uppercase">Your recently viewed</h2>
        <div className="flex items-center gap-2">
          <Link to="/cellphones" className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-600 font-medium">
            View All <ChevronRight size={12} />
          </Link>
          <button
            type="button"
            aria-label="Scroll recently viewed left"
            onClick={() => scrollRecent(-1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="Scroll recently viewed right"
            onClick={() => scrollRecent(1)}
            className="grid size-7 sm:size-8 place-items-center rounded-md bg-slate-100 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">No recently viewed products.</p>
      ) : (
        <div
          id="recently-viewed-scroller"
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
        >
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="flex w-[72vw] max-w-[280px] xs:w-64 sm:w-72 shrink-0 snap-start gap-2 sm:gap-3 rounded-xl border border-stone-200/80 p-2 sm:p-2.5 transition hover:border-green-600 hover:bg-neutral-50 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                <img
                  src={p.image || FALLBACK_IMG}
                  alt={p.title}
                  loading="lazy"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-1 top-1">
                    <Badge tone="dark">{p.badge}</Badge>
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                <div>
                  {p.rating != null && <StarRating count={p.rating} reviews={p.reviews} />}
                  <p className="mt-1 line-clamp-2 text-[10px] sm:text-xs font-bold text-black hover:text-green-600 transition">
                    {p.title}
                  </p>
                </div>
                <div className="mt-1 flex items-baseline gap-1 sm:gap-2">
                  <span className={`text-xs sm:text-base font-bold ${p.oldPrice ? "text-red-600" : "text-black"}`}>
                    {p.price}
                  </span>
                  {p.oldPrice && (
                    <span className="text-[10px] sm:text-sm font-bold text-stone-500 line-through">
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
    <section className="rounded-xl p-3 sm:p-6">
      <h2 className="text-base sm:text-lg font-bold">Rovado – #1 Online Marketplace for technology</h2>
      <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 text-stone-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae posuere mi. Quisque iaculis dignissim scelerisque.
      </p>
      <Link to="/cellphones" className="mt-4 flex items-center gap-1 text-xs hover:text-green-600">
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
          <div>
            <h3 className="mb-3 text-base sm:text-lg font-bold uppercase">
              Rovado - 1st ISB tech online market
            </h3>
            <p className="mb-3 text-sm uppercase text-black">hotline 24/7</p>
            <p className="mb-4 text-2xl sm:text-3xl font-bold text-green-600">(025) 3686 25 16</p>
            <p className="mb-2 text-sm text-black">Islamabad, PK</p>
            <p className="mb-4 text-sm text-black">workinga199430@gmail.com</p>
            <div className="flex gap-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-blue-600 hover:text-white">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-sky-500 hover:text-white">
                <Twitter size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-pink-600 hover:text-white">
                <Instagram size={16} />
              </a>
              <a href="https://www.linkedin.com/in/mian-muhammad-usman-9b2919228/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-blue-700 hover:text-white">
                <Linkedin size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid size-9 place-items-center rounded-full bg-zinc-200 text-black transition hover:bg-red-600 hover:text-white">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold uppercase">{col.title}</h4>
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

        <div className="mt-8 sm:mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-neutral-400/20 px-3 py-2.5 sm:py-3 text-sm">
              USD <ChevronDown size={10} />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-neutral-400/20 px-3 py-2.5 sm:py-3 text-sm">
              Eng <ChevronDown size={10} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base sm:text-lg font-bold uppercase">
              Subscribe &amp; get <span className="text-red-600">10% off</span> for your first order
            </p>
            <div className="mt-3 flex items-center gap-2 border-b border-stone-300 pb-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
              />
              <button className="text-xs sm:text-sm font-bold uppercase text-green-600">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4 border-t border-neutral-400/30 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs sm:text-sm text-stone-500">
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

/* =========================================================
   Main Home Component
========================================================= */

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [dealsData, setDealsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    (async () => {
      startLoading("home_products");
      try {
        // Fetch deals from backend if on localhost
        if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
          try {
            const res = await fetch("http://localhost:4000/api/deals");
            if (res.ok) {
              const json = await res.json();
              if (json.deals && json.deals.length > 0) {
                setDealsData(json.deals);
              }
            }
          } catch {
            // ignore backend fallback
          }
        }

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
        stopLoading("home_products");
      }
    })();
  }, [startLoading, stopLoading]);

  const cellphonesData = allProducts.filter((p) => (p.category || "").includes("cellphone") || (p.category || "").includes("tablet"));
  const laptopsData = allProducts.filter((p) => (p.category || "").includes("laptop") || (p.category || "").includes("computer"));
  const dealsProducts = allProducts.filter((p) => p.is_deal || p.sale_price != null || p.old_price != null);
  const bestSellersData = allProducts.filter((p) => p.is_best_seller);

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
    const dbRecent = allProducts.filter((p) => p.is_new);
    if (dbRecent.length > 0) return dbRecent.slice(0, 4);
    return allProducts.slice(0, 4);
  };

  const recentlyViewedData = getRecentlyViewed();

  if (loading && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-200 overflow-x-hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:gap-4 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
          <Header />
          <PromoBar />
          <RovadoLoadingScreen message="Loading Rovado IT Store..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 overflow-x-hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:gap-4 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
        <Header />
        <PromoBar />
        <MobileCategoryScroller />

        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[16rem_1fr_20rem] lg:items-start">
          <Sidebar />
          <HeroCarousel products={[...cellphonesData, ...laptopsData]} />
          <SideDealCards products={[...cellphonesData, ...laptopsData]} />
        </div>

        <FeaturedBrandsAndTopCategories />
        <DealsOfTheDay products={dealsProducts.length > 0 ? dealsProducts : allProducts} />
        <MemberBanner />

        <ProductRail
          title=""
          tabs={["Best seller", "New in", "Popular"]}
          products={allProducts}
          viewAllHref="/cellphones"
        />

        <BrandNewForYou products={allProducts} />

        <TopCellphonesSection products={cellphonesData} viewAllHref="/cellphones" />

        <LaptopsSection products={laptopsData} viewAllHref="/laptops" />

        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
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