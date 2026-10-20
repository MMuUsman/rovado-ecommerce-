import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { Header, PromoBar, Breadcrumb, PageShell } from "../components/Layout";
import { ProductGridCard, StarRating } from "../components/Product";
import { supabase } from "../services/supabaseClient";
import { useLoading, RovadoLoadingScreen } from "../context/LoadingContext";

const heroBanner = {
  image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=864&q=80",
  title: "redmi note 12 Pro+ 5g",
  subtitle: "Rise to the challenge",
  cta: "Shop Now",
};

const popularCategories = [
  { name: "iPhone (iOS)", items: 74 },
  { name: "Android", items: 35 },
  { name: "5G Support", items: 12 },
  { name: "Apple Tablets", items: 22 },
  { name: "Smartphone Chargers", items: 33 },
  { name: "Gaming", items: 9 },
  { name: "Xiaomi", items: 52 },
  { name: "Accessories", items: 29 },
  { name: "Samsung Tablets", items: 26 },
  { name: "eReader", items: 5 },
];

const brandFilters = [
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

const ratingFilters = [
  { stars: 5, count: 52 },
  { stars: 4, count: 24 },
  { stars: 3, count: 5 },
  { stars: 2, count: 1 },
];

const screenSizes = ["7” & Under", "7.1” - 8.9”", "9” - 10.9”", "11” & Greater"];

const colorSwatches = [
  { name: "Red", class: "bg-red-800" },
  { name: "Cyan", class: "bg-cyan-800" },
  { name: "Teal", class: "bg-teal-500" },
  { name: "Black", class: "bg-neutral-800" },
  { name: "White", class: "bg-white border" },
  { name: "Green", class: "bg-green-600" },
  { name: "Stone", class: "bg-stone-500" },
  { name: "Indigo", class: "bg-indigo-800" },
];

const memoryOptions = [
  "12GB (4)",
  "8GB (3)",
  "6GB (12)",
  "4GB (6)",
  "3GB (7)",
  "1.5GB (1)",
  "1GB (1)",
  "512MB (2)",
];

const conditionOptions = ["New (21)", "Like New (2)", "Open Box (38)"];

/* --------- Category label map --------- */
const CATEGORY_LABELS = {
  "cellphones-tablets": "Cell Phones & Tablets",
  "laptops-computers": "Laptops & Computers",
  "best-seller": "Best Sellers",
  "recently-viewed": "Recently Viewed",
};

/* ---------------------------------------------------------
   Filter Group
--------------------------------------------------------- */
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-400/20 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex w-full items-center justify-between"
      >
        <h3 className="text-sm font-bold">{title}</h3>
        <ChevronDown size={14} className={`transition ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && children}
    </div>
  );
}

/* ---------------------------------------------------------
   Filters Panel
--------------------------------------------------------- */
function FiltersPanel({
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
    <div className="space-y-1 rounded-xl bg-gray-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">Categories</h2>
        <button
          onClick={onReset}
          disabled={!hasFilters}
          className="flex items-center gap-1 text-sm disabled:opacity-40"
        >
          <X size={14} /> Reset All
        </button>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedBrands.map((b) => (
            <span
              key={`brand-${b}`}
              className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs"
            >
              {b}
              <button onClick={() => toggleBrand(b)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedRatings.map((r) => (
            <span
              key={`rating-${r}`}
              className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs"
            >
              {r}★ & up
              <button onClick={() => toggleRating(r)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {(minPrice > 0 || maxPrice < 10000) && (
            <span className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs">
              ${minPrice} - ${maxPrice}
              <button
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(10000);
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span
              key={`size-${s}`}
              className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs"
            >
              {s}
              <button onClick={() => toggleSize(s)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedColors.map((c) => (
            <span
              key={`color-${c}`}
              className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs"
            >
              Color: {c}
              <button onClick={() => toggleColor(c)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* By Brands */}
      <FilterGroup title="By Brands">
        <ul className="space-y-3">
          {brandFilters.map((b) => (
            <li key={b.name} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.name)}
                onChange={() => toggleBrand(b.name)}
                className="size-3.5 cursor-pointer rounded-sm border-black/25"
              />
              <span className="flex-1">{b.name}</span>
              <span className="text-zinc-500">({b.count})</span>
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
          {ratingFilters.map((r) => (
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
          {screenSizes.map((s) => {
            const active = selectedSizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`rounded-md px-3 py-1.5 text-xs transition ${
                  active ? "bg-green-600 text-white" : "bg-white text-black hover:bg-green-50"
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
          {colorSwatches.map((c) => {
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
          {memoryOptions.map((m) => (
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
          {conditionOptions.map((c) => (
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

/* ---------------------------------------------------------
   Pagination
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   Main Component
--------------------------------------------------------- */
export default function CategoryListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("q") || searchParams.get("search") || "";
  const urlBrand = searchParams.get("brand") || "";
  const urlPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  // Brand state
  const [brandFilter, setBrandFilter] = useState(urlBrand);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useLoading();

  // Category filter from URL
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);

  // Search from URL
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // Filters
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

  // Sort + pagination
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  // Sync URL params with state
  useEffect(() => {
    setCategoryFilter(urlCategory);
    setSearchQuery(urlSearch);
    setBrandFilter(urlBrand);
    setCurrentPage(urlPage);
  }, [urlCategory, urlSearch, urlBrand, urlPage]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    const q = searchQuery.trim();
    if (q) {
      newParams.set("q", q);
      newParams.delete("search");
    } else {
      newParams.delete("q");
      newParams.delete("search");
    }
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const pageNum = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(pageNum);
    const newParams = new URLSearchParams(searchParams);
    if (pageNum === 1) {
      newParams.delete("page");
    } else {
      newParams.set("page", String(pageNum));
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Fetch from Supabase
  useEffect(() => {
    (async () => {
      startLoading("category_products");
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("id", { ascending: false })
          .limit(200);

        if (error || !data) {
          setLoading(false);
          return;
        }

        const normalized = data.map((p) => ({
          ...p,
          price:
            typeof p.price === "string" ? p.price : `$${Number(p.price).toFixed(2)}`,
          priceRaw: Number(p.price) || 0,
          oldPrice:
            p.old_price != null ? `$${Number(p.old_price).toFixed(2)}` : undefined,
          isNew: p.is_new,
        }));

        setAllProducts(normalized);
      } catch (err) {
        console.warn("[category] fetch error:", err);
      } finally {
        setLoading(false);
        stopLoading("category_products");
      }
    })();
  }, [startLoading, stopLoading]);

  // Toggle helpers
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
  setCurrentPage(1);
  setSortBy("default");
  setSearchQuery("");
  setBrandFilter("");       // ✅ Add
  setCategoryFilter("");    // ✅ Add
};

  const activeFiltersCount =
    selectedBrands.length +
    selectedRatings.length +
    selectedSizes.length +
    selectedColors.length +
    selectedMemory.length +
    selectedConditions.length +
    (appliedMin > 0 || appliedMax < 10000 ? 1 : 0);

  // ✅ Filter + sort
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

// ✅ 1. BRAND FILTER (URL se)
if (brandFilter) {
  const bf = brandFilter.toLowerCase();
  list = list.filter((p) => {
    const brand = (p.brand || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    return brand.includes(bf) || title.includes(bf);
  });
}

// ✅ 2. CATEGORY FILTER
if (categoryFilter && categoryFilter.toLowerCase() !== "all") {
  const normCat = categoryFilter.toLowerCase().trim();
  list = list.filter((p) => {
    const pCat = (p.category || "").toLowerCase();
    if (pCat === normCat) return true;
    if (normCat === "cellphones" && (pCat.includes("cellphone") || pCat.includes("tablet"))) return true;
    if (normCat === "laptops" && (pCat.includes("laptop") || pCat.includes("computer"))) return true;
    if (normCat === "best-sellers" && pCat.includes("best-seller")) return true;
    return pCat.includes(normCat);
  });
}

    // ✅ 2. SEARCH FILTER (Name, brand, category, specifications)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.title || p.name || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.processor || "").toLowerCase().includes(q) ||
          (p.ram || "").toLowerCase().includes(q) ||
          (p.storage || "").toLowerCase().includes(q) ||
          (p.display || "").toLowerCase().includes(q) ||
          (p.gpu || "").toLowerCase().includes(q) ||
          (p.camera || "").toLowerCase().includes(q) ||
          (p.operating_system || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    // 3. Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) => {
        const brand = (p.brand || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        return selectedBrands.some(
          (b) => brand.includes(b.toLowerCase()) || title.includes(b.toLowerCase())
        );
      });
    }

    // 4. Rating filter
    if (selectedRatings.length > 0) {
      list = list.filter((p) => {
        const rating = Number(p.rating) || 0;
        return selectedRatings.some((minStars) => rating >= minStars);
      });
    }

    // 5. Price filter
    list = list.filter(
      (p) => (p.priceRaw ?? 0) >= appliedMin && (p.priceRaw ?? 0) <= appliedMax
    );

    // 6. Sort
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
  brandFilter,          // ✅ Add
  categoryFilter,
  searchQuery,
  selectedBrands,
  selectedRatings,
  appliedMin,
  appliedMax,
  sortBy,
]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
// ✅ Separate products by category
const cellphonesProducts = filteredProducts.filter(
  (p) => p.category === "cellphones-tablets"
);
const laptopsProducts = filteredProducts.filter(
  (p) => p.category === "laptops-computers"
);
const otherProducts = filteredProducts.filter(
  (p) =>
    p.category !== "cellphones-tablets" &&
    p.category !== "laptops-computers"
);
  const showingFrom = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  // ✅ Dynamic title
  const pageTitle = brandFilter
  ? `${brandFilter} Products`
  : categoryFilter
  ? CATEGORY_LABELS[categoryFilter] || categoryFilter.replace("-", " ")
  : "All Products";

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Search", href: "/search" },
          { label: pageTitle },
        ]}
      />

      {/* Category hero + popular categories — sirf jab koi category filter na ho */}
      {!categoryFilter && (
        <section className="rounded-xl bg-white p-4 sm:p-6">
            <h1 className="mb-4 text-lg font-bold uppercase">
    {pageTitle || "All Products"}
  </h1>
          <div className="relative mb-8 overflow-hidden rounded-xl">
            <img
              src={heroBanner.image}
              alt={heroBanner.title}
              className="h-56 w-full object-cover sm:h-72"
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 sm:p-10">
              <h2 className="max-w-xs text-2xl font-medium capitalize text-black sm:text-3xl">
                {heroBanner.title}
              </h2>
              <p className="text-xs text-stone-500">{heroBanner.subtitle}</p>
              <button className="mt-2 w-fit rounded-lg bg-black px-6 py-3 text-xs font-medium uppercase text-white">
                {heroBanner.cta}
              </button>
            </div>
          </div>

          <h2 className="mb-4 text-lg font-bold uppercase">Popular categories</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {popularCategories.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2 text-center">
                <img
                  src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=51&q=80"
                  alt={c.name}
                  className="size-12 object-contain"
                />
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-xs text-stone-500">{c.items} Items</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters + grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-white p-3 text-sm font-bold lg:hidden"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <SlidersHorizontal size={16} /> {filtersOpen ? "Hide Filters" : "Show Filters"}
          {activeFiltersCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-green-600 text-[10px] text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <FiltersPanel
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
        </div>

        <section className="rounded-xl bg-white p-4 sm:p-6">
          {/* Title + search */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold uppercase">{pageTitle}</h2>
            {(categoryFilter || brandFilter) && (
  <Link
    to="/search"
    className="text-xs text-green-600 hover:underline"
  >
    Clear filter ×
  </Link>
)}
          </div>

          {/* Search box */}
          <div className="mb-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2">
              <button type="submit" aria-label="Search">
                <Search size={16} className="text-stone-400 hover:text-green-600 transition" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </form>
          </div>

          {/* Results header */}
          <div className="mb-6 flex flex-col gap-3 border-b border-stone-300 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="font-bold text-black">
                {showingFrom} - {showingTo}
              </span>{" "}
              <span className="text-stone-500">of {filteredProducts.length} results</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
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
                        itemsPerPage === n ? "font-bold text-black" : "text-neutral-500"
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
          </div>

          {loading && (
            <RovadoLoadingScreen message="Searching Store..." fullScreen={false} />
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-stone-500">No products match your search or filters.</p>
              <button
                onClick={onReset}
                className="mt-2 text-green-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            categoryFilter || brandFilter || searchQuery.trim() || activeFiltersCount > 0 || currentPage > 1 ? (
              <div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {paginatedProducts.map((p) => (
                    <div key={p.id} className="card-entrance">
                      <ProductGridCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* ✅ CELLPHONES SECTION */}
                {(categoryFilter === "" || categoryFilter === "cellphones-tablets") &&
                  cellphonesProducts.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                        <h3 className="text-lg font-bold uppercase">
                          📱 Cell Phones &amp; Tablets
                        </h3>
                        <span className="text-xs text-stone-500">
                          {cellphonesProducts.length} products
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                        {cellphonesProducts.map((p) => (
                          <ProductGridCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* ✅ LAPTOPS SECTION */}
                {(categoryFilter === "" || categoryFilter === "laptops-computers") &&
                  laptopsProducts.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                        <h3 className="text-lg font-bold uppercase">
                          💻 Laptops &amp; Computers
                        </h3>
                        <span className="text-xs text-stone-500">
                          {laptopsProducts.length} products
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                        {laptopsProducts.map((p) => (
                          <ProductGridCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* ✅ OTHER PRODUCTS */}
                {otherProducts.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                      <h3 className="text-lg font-bold uppercase">📦 Other Products</h3>
                      <span className="text-xs text-stone-500">
                        {otherProducts.length} products
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                      {otherProducts.map((p) => (
                        <ProductGridCard key={p.id} product={p} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <PromoBar />
    </PageShell>
  );
}