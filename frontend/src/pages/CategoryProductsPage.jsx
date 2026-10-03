import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Search,
} from "lucide-react";
import { Header, PromoBar, Breadcrumb, PageShell } from "../components/Layout";
import { ProductGridCard, StarRating } from "../components/Product";
import { supabase } from "../services/supabaseClient";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

/* =========================================================
   Data — static filter options
========================================================= */
const BRAND_FILTERS = [
  { name: "Apple", count: 14 },
  { name: "Samsung", count: 6 },
  { name: "Xiaomi", count: 7 },
  { name: "Asus", count: 18 },
  { name: "Oppo", count: 1 },
  { name: "HP", count: 3 },
  { name: "Dell", count: 2 },
  { name: "Google", count: 1 },
  { name: "OnePlus", count: 1 },
];

const RATING_FILTERS = [
  { stars: 5, count: 52 },
  { stars: 4, count: 24 },
  { stars: 3, count: 5 },
  { stars: 2, count: 1 },
];

const SCREEN_SIZES = ['7" & Under', '7.1" - 8.9"', '9" - 10.9"', '11" & Greater'];

const COLORS = [
  { name: "Red", class: "bg-red-800" },
  { name: "Cyan", class: "bg-cyan-800" },
  { name: "Teal", class: "bg-teal-500" },
  { name: "Black", class: "bg-neutral-800" },
  { name: "White", class: "bg-white border" },
  { name: "Green", class: "bg-green-600" },
  { name: "Stone", class: "bg-stone-500" },
  { name: "Indigo", class: "bg-indigo-800" },
];

const MEMORY_OPTIONS = [
  "12GB (4)",
  "8GB (3)",
  "6GB (12)",
  "4GB (6)",
  "3GB (7)",
  "1.5GB (1)",
  "1GB (1)",
  "512MB (2)",
];

const CONDITION_OPTIONS = ["New (21)", "Like New (2)", "Open Box (38)"];

/* =========================================================
   FilterGroup — collapsible
========================================================= */
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-400/20 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex w-full items-center justify-between"
      >
        <h3 className="text-sm font-bold">{title}</h3>
        <ChevronDown
          size={14}
          className={`transition ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && children}
    </div>
  );
}

/* =========================================================
   CategorySidebar — Top section (categories list)
========================================================= */
function CategorySidebar({ categories, activeCategory, onSelect, title }) {
  return (
    <div className="mb-4 rounded-xl bg-gray-100 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Categories</h2>
        <button
          onClick={() => onSelect("all")}
          className="text-xs text-red-600 hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="mb-4 rounded-lg bg-white px-3 py-2 text-xs font-bold">
        All Categories
      </div>

      <p className="mb-3 text-sm font-bold text-black">{title}</p>

      <ul className="space-y-0.5 text-sm">
        <li>
          <button
            onClick={() => onSelect("all")}
            className={`w-full rounded px-3 py-1.5 text-left transition ${
              activeCategory === "all"
                ? "bg-green-600 font-bold text-white"
                : "hover:bg-white"
            }`}
          >
            All
          </button>
        </li>
        {categories.map((c) => (
          <li key={c}>
            <button
              onClick={() => onSelect(c)}
              className={`w-full rounded px-3 py-1.5 text-left transition ${
                activeCategory === c
                  ? "bg-green-600 font-bold text-white"
                  : "hover:bg-white"
              }`}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
   FiltersSidebar — Full filters
========================================================= */
function FiltersSidebar({
  // Filters state
  selectedBrands,
  toggleBrand,
  selectedRatings,
  toggleRating,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  applyPrice,
  selectedSizes,
  toggleSize,
  selectedColors,
  toggleColor,
  selectedMemory,
  toggleMemory,
  selectedConditions,
  toggleCondition,
  onReset,
  activeFiltersCount,
}) {
  const hasFilters = activeFiltersCount > 0;

  return (
    <div className="rounded-xl bg-gray-100 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Filters</h2>
        <button
          onClick={onReset}
          disabled={!hasFilters}
          className="flex items-center gap-1 text-xs text-red-600 disabled:opacity-40"
        >
          <X size={12} /> Reset All
        </button>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedBrands.map((b) => (
            <span
              key={`brand-${b}`}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px]"
            >
              {b}
              <button onClick={() => toggleBrand(b)}>
                <X size={10} />
              </button>
            </span>
          ))}
          {selectedRatings.map((r) => (
            <span
              key={`rating-${r}`}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px]"
            >
              {r}★ & up
              <button onClick={() => toggleRating(r)}>
                <X size={10} />
              </button>
            </span>
          ))}
          {(minPrice > 0 || maxPrice < 10000) && (
            <span className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px]">
              ${minPrice} - ${maxPrice}
              <button
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(10000);
                }}
              >
                <X size={10} />
              </button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span
              key={`size-${s}`}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px]"
            >
              {s}
              <button onClick={() => toggleSize(s)}>
                <X size={10} />
              </button>
            </span>
          ))}
          {selectedColors.map((c) => (
            <span
              key={`color-${c}`}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px]"
            >
              {c}
              <button onClick={() => toggleColor(c)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* By Brands */}
      <FilterGroup title="By Brands">
        <ul className="space-y-3">
          {BRAND_FILTERS.map((b) => (
            <li key={b.name} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.name)}
                onChange={() => toggleBrand(b.name)}
                className="size-3.5 cursor-pointer rounded-sm border-black/25"
              />
              <span className="flex-1">{b.name}</span>
              <span className="text-xs text-zinc-500">({b.count})</span>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {/* By Price */}
      <FilterGroup title="By Price">
        <div className="mb-4 h-0.5 rounded bg-zinc-200">
          <div className="h-0.5 w-full rounded bg-green-600" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-white px-2 py-2 text-xs">
            $
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-14 outline-none"
            />
          </div>
          <span>—</span>
          <div className="flex items-center gap-1 rounded-md bg-white px-2 py-2 text-xs">
            $
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              className="w-14 outline-none"
            />
          </div>
          <button
            onClick={applyPrice}
            className="grid size-10 place-items-center rounded-md bg-green-600 text-sm font-bold text-white"
          >
            Go
          </button>
        </div>
      </FilterGroup>

      {/* By Rating */}
      <FilterGroup title="By Rating">
        <ul className="space-y-2">
          {RATING_FILTERS.map((r) => (
            <li key={r.stars} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedRatings.includes(r.stars)}
                onChange={() => toggleRating(r.stars)}
                className="size-3.5 cursor-pointer rounded-sm border-black/25"
              />
              <StarRating count={r.stars} />
              <span className="text-xs text-black">({r.count})</span>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {/* By Screen Size */}
      <FilterGroup title="By Screen Size">
        <div className="flex flex-wrap gap-2">
          {SCREEN_SIZES.map((s) => {
            const active = selectedSizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`rounded-md px-3 py-1.5 text-xs transition ${
                  active
                    ? "bg-green-600 text-white"
                    : "bg-white text-black hover:bg-green-50"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* By Color */}
      <FilterGroup title="By Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const active = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                title={c.name}
                onClick={() => toggleColor(c.name)}
                className={`size-7 rounded-md transition ${c.class} ${
                  active ? "ring-2 ring-green-600 ring-offset-2" : ""
                }`}
              />
            );
          })}
        </div>
      </FilterGroup>

      {/* By Memory */}
      <FilterGroup title="By Memory">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {MEMORY_OPTIONS.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMemory.includes(m)}
                onChange={() => toggleMemory(m)}
                className="size-3.5 cursor-pointer rounded-sm border-black/25"
              />
              {m}
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* By Conditions */}
      <FilterGroup title="By Conditions">
        <div className="space-y-2 text-sm">
          {CONDITION_OPTIONS.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedConditions.includes(c)}
                onChange={() => toggleCondition(c)}
                className="size-3.5 cursor-pointer rounded-sm border-black/25"
              />
              {c}
            </label>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

/* =========================================================
   Side Promo Banner
========================================================= */
function SidePromoBanner() {
  return (
    <Link
      to="/category"
      className="relative block h-64 overflow-hidden rounded-xl bg-neutral-800"
    >
      <img
        src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80"
        alt="OKODo Hero 11+"
        className="h-full w-full object-cover opacity-70"
        onError={(e) => { e.target.src = FALLBACK_IMG; }}
      />
      <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6">
        <p className="text-2xl font-bold uppercase text-white">
          OKODo <span className="font-medium">hero 11+</span>
        </p>
        <p className="text-sm font-medium text-white">5K wireless</p>
        <p className="mt-3 text-[10px] uppercase text-white/70">From</p>
        <p className="text-3xl font-light text-green-400">$169</p>
      </div>
    </Link>
  );
}

/* =========================================================
   Pagination
========================================================= */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (currentPage > 4) pages.push("...");
    if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
  }

  const uniquePages = [...new Set(pages)];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-9 items-center gap-1 rounded-md bg-white px-3 text-sm text-stone-500 outline outline-1 outline-zinc-200 disabled:opacity-40"
      >
        <ChevronLeft size={14} /> Prev
      </button>

      {uniquePages.map((p, i) => {
        if (p === "...") {
          return (
            <span key={`dots-${i}`} className="px-2 text-sm text-stone-400">
              ...
            </span>
          );
        }
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`grid h-9 min-w-9 place-items-center rounded-md px-2 text-sm ${
              p === currentPage
                ? "bg-green-600 text-white"
                : "bg-white text-stone-500 outline outline-1 outline-zinc-200"
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-9 items-center gap-1 rounded-md bg-white px-3 text-sm text-stone-500 outline outline-1 outline-zinc-200 disabled:opacity-40"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* =========================================================
   MAIN SHARED COMPONENT
========================================================= */
export default function CategoryProductsPage({
  categoryKey,
  pageTitle,
  breadcrumbLabel,
  heroBanner,
  sideBanner,
  popularCategories,
  sidebarCategories,
  sidebarTitle,
}) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [sortBy, setSortBy] = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters state
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [appliedMin, setAppliedMin] = useState(0);
  const [appliedMax, setAppliedMax] = useState(10000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);

  /* ---------- Fetch products ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("category", categoryKey)
          .order("id", { ascending: false })
          .limit(200);

        if (error || !data) {
          setLoading(false);
          return;
        }

        const normalized = data.map((p) => ({
          ...p,
          price:
            typeof p.price === "string"
              ? p.price
              : `$${Number(p.price).toFixed(2)}`,
          priceRaw: Number(p.price) || 0,
          oldPrice:
            p.old_price != null
              ? `$${Number(p.old_price).toFixed(2)}`
              : undefined,
          isNew: p.is_new,
        }));

        setAllProducts(normalized);
      } catch (err) {
        console.warn("[category] fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryKey]);

  /* ---------- Toggle helpers ---------- */
  const toggleBrand = useCallback((brand) => {
    setSelectedBrands((arr) =>
      arr.includes(brand) ? arr.filter((b) => b !== brand) : [...arr, brand]
    );
    setCurrentPage(1);
  }, []);

  const toggleRating = useCallback((stars) => {
    setSelectedRatings((arr) =>
      arr.includes(stars) ? arr.filter((s) => s !== stars) : [...arr, stars]
    );
    setCurrentPage(1);
  }, []);

  const toggleSize = useCallback((size) => {
    setSelectedSizes((arr) =>
      arr.includes(size) ? arr.filter((s) => s !== size) : [...arr, size]
    );
    setCurrentPage(1);
  }, []);

  const toggleColor = useCallback((color) => {
    setSelectedColors((arr) =>
      arr.includes(color) ? arr.filter((c) => c !== color) : [...arr, color]
    );
    setCurrentPage(1);
  }, []);

  const toggleMemory = useCallback((mem) => {
    setSelectedMemory((arr) =>
      arr.includes(mem) ? arr.filter((m) => m !== mem) : [...arr, mem]
    );
    setCurrentPage(1);
  }, []);

  const toggleCondition = useCallback((cond) => {
    setSelectedConditions((arr) =>
      arr.includes(cond) ? arr.filter((c) => c !== cond) : [...arr, cond]
    );
    setCurrentPage(1);
  }, []);

  const applyPrice = () => {
    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
    setCurrentPage(1);
  };

  const onReset = () => {
    setSelectedBrands([]);
    setSelectedRatings([]);
    setMinPrice(0);
    setMaxPrice(10000);
    setAppliedMin(0);
    setAppliedMax(10000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMemory([]);
    setSelectedConditions([]);
    setActiveCategory("all");
    setCurrentPage(1);
    setSortBy("default");
  };

  const activeFiltersCount =
    selectedBrands.length +
    selectedRatings.length +
    selectedSizes.length +
    selectedColors.length +
    selectedMemory.length +
    selectedConditions.length +
    (appliedMin > 0 || appliedMax < 10000 ? 1 : 0);

  /* ---------- Filter + sort ---------- */
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Category filter (title/brand match)
    if (activeCategory !== "all") {
      const filter = activeCategory.toLowerCase();
      list = list.filter((p) => {
        const text = `${p.title || ""} ${p.brand || ""}`.toLowerCase();
        return text.includes(filter);
      });
    }

    // 2. Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) => {
        const brand = (p.brand || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        return selectedBrands.some(
          (b) => brand.includes(b.toLowerCase()) || title.includes(b.toLowerCase())
        );
      });
    }

    // 3. Rating filter
    if (selectedRatings.length > 0) {
      list = list.filter((p) => {
        const rating = Number(p.rating) || 0;
        return selectedRatings.some((minStars) => rating >= minStars);
      });
    }

    // 4. Price filter
    list = list.filter(
      (p) => (p.priceRaw ?? 0) >= appliedMin && (p.priceRaw ?? 0) <= appliedMax
    );

    // 5. Sort
    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => (a.priceRaw ?? 0) - (b.priceRaw ?? 0));
        break;
      case "price-high":
        list.sort((a, b) => (b.priceRaw ?? 0) - (a.priceRaw ?? 0));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "newest":
        list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      default:
        break;
    }

    return list;
  }, [
    allProducts,
    activeCategory,
    selectedBrands,
    selectedRatings,
    appliedMin,
    appliedMax,
    sortBy,
  ]);

  /* ---------- Pagination ---------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showingFrom =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(
    currentPage * itemsPerPage,
    filteredProducts.length
  );

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/category" },
          { label: breadcrumbLabel },
        ]}
      />

      {/* ══════ HERO ══════ */}
      <section className="rounded-xl bg-white p-4 sm:p-6">
        <h1 className="mb-4 text-lg font-bold uppercase">{pageTitle}</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <Link
            to="/category"
            className="group relative block overflow-hidden rounded-xl"
          >
            <img
              src={heroBanner.image}
              alt={heroBanner.title}
              className="h-56 w-full object-cover transition group-hover:scale-105 sm:h-72 lg:h-80"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-black/30 p-6 sm:p-10">
              <h2 className="max-w-xs text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
                {heroBanner.title}
              </h2>
              <p className="text-xs text-white/90">{heroBanner.subtitle}</p>
              <span className="w-fit rounded-lg bg-white px-6 py-3 text-xs font-medium uppercase text-black">
                {heroBanner.cta}
              </span>
            </div>
          </Link>

          <Link
            to="/category"
            className="group relative block overflow-hidden rounded-xl"
          >
            <img
              src={sideBanner.image}
              alt={sideBanner.title}
              className="h-56 w-full object-cover transition group-hover:scale-105 sm:h-72 lg:h-80"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-black/30 p-6">
              <h3 className="max-w-[200px] text-xl font-bold uppercase leading-tight text-white">
                {sideBanner.title}
              </h3>
              <p className="text-xs text-white/90">{sideBanner.subtitle}</p>
              <span className="mt-2 w-fit rounded-lg bg-black px-4 py-2 text-[10px] font-medium uppercase text-white">
                {sideBanner.cta}
              </span>
            </div>
          </Link>
        </div>

        {/* Popular categories */}
        <h2 className="mb-4 mt-8 text-lg font-bold uppercase">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {popularCategories.map((c) => (
            <Link
              key={c.name}
              to="/category"
              className="flex flex-col items-center gap-2 text-center transition hover:opacity-80"
            >
              <div className="size-16 overflow-hidden rounded-full bg-neutral-100 sm:size-20">
                <img
                  src={c.image || FALLBACK_IMG}
                  alt={c.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
              </div>
              <p className="text-sm font-bold">{c.name}</p>
              <p className="text-xs text-stone-500">{c.items} Items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════ SIDEBAR + PRODUCTS ══════ */}
      <section className="rounded-xl bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Mobile toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 p-3 text-sm font-bold lg:hidden"
            >
              {filtersOpen ? "Hide Filters" : "Show Filters"}
              {activeFiltersCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-green-600 text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className={`${filtersOpen ? "block" : "hidden"} space-y-4 lg:block`}>
              {/* Categories list */}
              <CategorySidebar
                title={sidebarTitle}
                categories={sidebarCategories}
                activeCategory={activeCategory}
                onSelect={handleCategoryChange}
              />

              {/* Full filters */}
              <FiltersSidebar
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                selectedRatings={selectedRatings}
                toggleRating={toggleRating}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                applyPrice={applyPrice}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                selectedColors={selectedColors}
                toggleColor={toggleColor}
                selectedMemory={selectedMemory}
                toggleMemory={toggleMemory}
                selectedConditions={selectedConditions}
                toggleCondition={toggleCondition}
                onReset={onReset}
                activeFiltersCount={activeFiltersCount}
              />

              {/* Promo banner */}
              <SidePromoBanner />
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <h2 className="text-lg font-bold uppercase">
                Best seller in this category
              </h2>
              <p className="text-sm text-stone-500">
                <span className="font-bold text-black">
                  {showingFrom} - {showingTo}
                </span>{" "}
                of {filteredProducts.length} results
              </p>
            </div>

            {/* Sort row */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                Show item
                <div className="flex rounded-md bg-gray-100 px-3 py-2 text-xs">
                  {[24, 48, 72].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setItemsPerPage(n);
                        setCurrentPage(1);
                      }}
                      className={`ml-2 first:ml-0 ${
                        itemsPerPage === n
                          ? "font-bold text-black"
                          : "text-neutral-500"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                Sort by
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-md bg-gray-100 px-3 py-2 text-xs font-semibold text-neutral-800 outline-none"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-stone-500">
                Loading products…
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-stone-500">
                  No products match your filters.
                </p>
                <button
                  onClick={onReset}
                  className="mt-2 text-green-600 underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {paginatedProducts.map((p) => (
                  <ProductGridCard key={p.id} product={p} />
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </section>

      <PromoBar />
    </PageShell>
  );
}