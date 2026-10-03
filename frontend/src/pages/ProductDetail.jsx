import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Phone,
  Minus,
  Plus,
  ArrowLeftRight,
  CheckCircle,
} from "lucide-react";
import { Header, PromoBar, Breadcrumb, PageShell } from "../components/Layout";
import { StarRating, ProductRail } from "../components/Product";
import { supabase } from "../services/supabaseClient";
import { useCart } from "../context/CartContext";
import ReviewsSection from "../components/ReviewsSection";

/* =========================================================
   Gallery Component
========================================================= */

function Gallery({ product }) {
  const [active, setActive] = useState(0);
  const FALLBACK =
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=524&q=80";

  const mainImage = product?.image || FALLBACK;
  const thumbs = [mainImage, mainImage, mainImage, mainImage];

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl bg-neutral-50">
        <img
          src={mainImage}
          alt={product?.title || "Product"}
          className="aspect-square w-full object-cover"
          onError={(e) => {
            e.target.src = FALLBACK;
          }}
        />
        {(product?.badge || product?.is_new) && (
          <span className="absolute left-4 top-4 rounded-md bg-neutral-800 px-2 py-1 text-[10px] font-normal uppercase text-white">
            {product?.badge || "New"}
          </span>
        )}
        <button className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-slate-200">
          <Heart size={14} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {thumbs.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`aspect-square overflow-hidden rounded-md border-2 transition ${
              active === idx ? "border-green-600" : "border-transparent"
            }`}
          >
            <img
              src={img}
              alt={`thumb ${idx + 1}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = FALLBACK;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   BuyBox Component
========================================================= */

function BuyBox({ product }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const displayPrice = product?.price
    ? typeof product.price === "string"
      ? product.price
      : `$${Number(product.price).toFixed(2)}`
    : "$0.00";

  const handleAddToCart = () => {
    if (!product) return;
    const cartProduct = {
      id: product.id,
      title: product.title,
      image: product.image,
      price:
        typeof product.price === "number"
          ? product.price
          : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0,
      badge: product.badge,
      shipping: product.shipping,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
    };
    addItem(cartProduct, qty);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-xl bg-slate-100 p-6">
      <div>
        <p className="text-xs uppercase text-stone-500">Total Price:</p>
        <p className="text-3xl font-bold text-black">{displayPrice}</p>
      </div>

      <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 text-xs">
        <span className="font-bold text-red-500">$49/m</span>
        <span className="text-black">
          in 12 months.{" "}
          <span className="text-blue-600 underline">See more</span>
        </span>
      </div>

      <p className="flex items-center gap-2 text-xs text-black">
        <CheckCircle size={12} className="text-green-600" /> In stock
      </p>

      <div className="flex items-center gap-3 rounded-lg bg-white p-2 outline outline-1 outline-neutral-400/20">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid size-8 place-items-center text-lg font-bold"
        >
          <Minus size={14} />
        </button>
        <span className="flex-1 text-center text-sm font-bold">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="grid size-8 place-items-center text-lg font-bold"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        className={`w-full rounded-xl py-4 text-xs font-medium uppercase text-white transition ${
          added ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {added ? "✓ Added to Cart!" : "Add To Cart"}
      </button>

      <button className="w-full rounded-xl bg-orange-400 py-4 text-xs font-medium uppercase text-black">
        Buy with PayPal
      </button>

      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 text-xs">
        <span className="flex items-center gap-2 text-stone-500">
          <Heart size={12} /> Wishlist
        </span>
        <span className="flex items-center gap-2 text-stone-500">
          <ArrowLeftRight size={12} /> Compare
        </span>
      </div>

      <div>
        <p className="mb-2 text-xs text-black">Guaranteed Safe Checkout</p>
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
          {["Visa", "MC", "PayPal", "Amex", "Disc"].map((p) => (
            <span
              key={p}
              className="rounded bg-neutral-200 px-2 py-1 font-medium"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Quick Order Card
========================================================= */

function QuickOrderCard() {
  return (
    <div className="rounded-xl bg-slate-100 p-6">
      <div className="flex w-fit items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-white">
        <Phone size={14} />
        <span className="text-xs">Quick Order 24/7</span>
      </div>
      <p className="mt-3 text-xl font-bold text-black">(025) 3886 25 16</p>
    </div>
  );
}

/* =========================================================
   Frequently Bought Together — WITH WORKING ADD TO CART
========================================================= */

function FrequentlyBoughtTogether({ product }) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState({
    this: true,
    headphone: false,
    watch: false,
  });
  const [added, setAdded] = useState(false);

  const extraItems = [
    {
      key: "headphone",
      id: "ext-headphone",
      title: "BOSO 2 Wireless On Ear Headphone",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=190&q=80",
      price: 369,
      displayPrice: "$369.00",
    },
    {
      key: "watch",
      id: "ext-watch",
      title: "Opplo Watch Series 8 GPS + Cellular",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=190&q=80",
      price: 129,
      displayPrice: "$129.00",
    },
  ];

  const currentPrice =
    typeof product?.price === "number"
      ? product.price
      : parseFloat(String(product?.price || "0").replace(/[^0-9.]/g, "")) || 0;

  const totalPrice =
    (selected.this ? currentPrice : 0) +
    (selected.headphone ? 369 : 0) +
    (selected.watch ? 129 : 0);

  const handleAddAllToCart = () => {
    if (selected.this && product) {
      addItem(
        {
          id: product.id,
          title: product.title,
          image: product.image,
          price: currentPrice,
          badge: product.badge,
          shipping: product.shipping,
          stock: product.stock,
          rating: product.rating,
          reviews: product.reviews,
        },
        1,
      );
    }

    extraItems.forEach((item) => {
      if (selected[item.key]) {
        addItem(
          {
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.price,
            shipping: "Free shipping",
            stock: "in",
          },
          1,
        );
      }
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggle = (key) => {
    setSelected((s) => ({ ...s, [key]: !s[key] }));
  };

  const nothingSelected =
    !selected.this && !selected.headphone && !selected.watch;

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      <h2 className="mb-6 text-lg font-bold uppercase">
        Frequently bought together
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <img
              src={product.image}
              alt={product.title}
              className="size-32 rounded-xl object-cover sm:size-40"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80";
              }}
            />
            <span className="text-2xl text-neutral-300">+</span>
            <img
              src={extraItems[0].image}
              alt={extraItems[0].title}
              className="size-32 rounded-xl object-cover opacity-90 sm:size-40"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80";
              }}
            />
            <span className="text-2xl text-neutral-300">+</span>
            <img
              src={extraItems[1].image}
              alt={extraItems[1].title}
              className="size-32 rounded-xl object-cover opacity-40 sm:size-40"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80";
              }}
            />
          </div>

          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.this}
                onChange={() => toggle("this")}
                className="mt-1 size-3.5 cursor-pointer rounded-sm border-black/25"
              />
              <span>
                <b>This item:</b> {product.title} (
                <span className="font-bold text-red-500">
                  ${currentPrice.toFixed(2)}
                </span>
                )
              </span>
            </li>

            {extraItems.map((item) => (
              <li key={item.key} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected[item.key]}
                  onChange={() => toggle(item.key)}
                  className="mt-1 size-3.5 cursor-pointer rounded-sm border-black/25"
                />
                <span>
                  {item.title} (
                  <span className="font-bold text-red-500">
                    {item.displayPrice}
                  </span>
                  )
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase text-stone-500">Total Price:</p>
          <p className="text-3xl font-bold text-black">
            ${totalPrice.toFixed(2)}
          </p>

          <button
            onClick={handleAddAllToCart}
            disabled={nothingSelected}
            className={`mt-4 w-full rounded-xl py-4 text-xs font-medium uppercase text-white transition ${
              added
                ? "bg-green-700"
                : "bg-green-600 hover:bg-green-700 disabled:opacity-50"
            }`}
          >
            {added ? "✓ Added to Cart!" : "Add To Cart"}
          </button>

          <button
            onClick={() => alert("Added to wishlist!")}
            className="mt-4 flex items-center gap-2 text-sm text-stone-500 hover:text-green-600"
          >
            <Heart size={14} /> Add all to Wishlist
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Main ProductDetail Component
========================================================= */

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [color, setColor] = useState(0);
  const [memory, setMemory] = useState(1);
  const [tab, setTab] = useState("description");
  const [relatedData, setRelatedData] = useState([]);
  const [recentlyViewedData, setRecentlyViewedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = [
    {
      name: "Midnight Blue",
      price: "$569.00",
      img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=35&q=80",
    },
    {
      name: "Deep Purple",
      price: "$569.00",
      img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=35&q=80",
    },
    {
      name: "Space Black",
      price: "$569.00",
      img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=35&q=80",
    },
  ];

  const memoryOptions = ["64GB", "128GB", "256GB", "512GB"];

  useEffect(() => {
    (async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data: prod, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) console.warn("[product] fetch error:", error.message);

        if (prod) {
          setProduct(prod);

          // ✅ Recently viewed me save karo
          try {
            const stored = JSON.parse(
              localStorage.getItem("rovado_recently_viewed") || "[]",
            );
            const filtered = stored.filter(
              (rid) => String(rid) !== String(prod.id),
            );
            const updated = [String(prod.id), ...filtered].slice(0, 10);
            localStorage.setItem(
              "rovado_recently_viewed",
              JSON.stringify(updated),
            );
          } catch (e) {
            console.warn("Recently viewed save error:", e);
          }
        }

        const category = prod?.category || "cellphones-tablets";
        const { data: related } = await supabase
          .from("products")
          .select("*")
          .eq("category", category)
          .eq("is_active", true)
          .neq("id", id)
          .limit(6);

        if (related) setRelatedData(related.map(normalizeProduct));

        const { data: recent } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .neq("id", id)
          .order("id", { ascending: false })
          .limit(4);

        if (recent) setRecentlyViewedData(recent.map(normalizeProduct));
      } catch (err) {
        console.warn("[product] error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function normalizeProduct(p) {
    return {
      ...p,
      price: p.price != null ? `$${Number(p.price).toFixed(2)}` : p.price,
      oldPrice:
        p.old_price != null ? `$${Number(p.old_price).toFixed(2)}` : undefined,
      isNew: p.is_new,
    };
  }

  if (loading) {
    return (
      <PageShell>
        <Header />
        <div className="rounded-xl bg-white p-20 text-center text-sm text-stone-500">
          Loading product…
        </div>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell>
        <Header />
        <div className="rounded-xl bg-white p-20 text-center">
          <p className="text-lg font-bold">Product not found</p>
          <Link
            to="/category"
            className="mt-2 inline-block text-sm text-green-600 hover:underline"
          >
            ← Back to products
          </Link>
        </div>
      </PageShell>
    );
  }

  const heading = product.title || "Product";
  const priceRange =
    product.old_price != null
      ? `$${Number(product.price).toFixed(2)} - $${Number(product.old_price).toFixed(2)}`
      : `$${Number(product.price).toFixed(2)}`;

  const sku = product.sku || `SKU-${product.id}`;
  const brand = product.brand || "Generic";
  const category = product.category || "Cell Phones & Tablets";

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/category" },
          { label: "Products", href: "/category" },
          { label: heading },
        ]}
      />

      {/* ============ MAIN PRODUCT SECTION ============ */}
      <section className="rounded-xl bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.2fr_18rem]">
          <Gallery product={product} />

          <div>
            <StarRating
              count={product.rating ?? 4}
              reviews={product.reviews ?? 5}
            />
            <h1 className="mt-2 text-lg font-bold sm:text-xl">{heading}</h1>
            <p className="mt-3 text-xl font-semibold text-black">
              {priceRange}
            </p>

            <ul className="mt-4 space-y-2 text-xs text-black">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-500" />
                Intel LGA 1700 Socket: Supports 13th &amp; 12th Gen Intel Core
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-500" />
                DDR5 Compatible: 4×SMD DIMMs with XMP 3.0 Memory
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-500" />
                Commanding Power Design: Twin 16+1+2 Phases Digital VRM
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

            <div className="mt-6 space-y-6 border-y border-stone-300 py-6">
              <div>
                <p className="mb-3 text-sm font-bold uppercase">
                  Color:{" "}
                  <span className="font-normal normal-case text-stone-500">
                    {colors[color].name}
                  </span>
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(i)}
                      className={`flex items-center gap-3 rounded-xl p-3 text-left outline outline-1 transition ${
                        i === color
                          ? "outline-green-600"
                          : "outline-stone-300 hover:outline-green-300"
                      }`}
                    >
                      <img
                        src={c.img}
                        alt={c.name}
                        className="size-9 rounded"
                      />
                      <div>
                        <p className="text-xs">{c.name}</p>
                        <p className="text-xs font-bold">{c.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-bold uppercase">
                  Memory size:{" "}
                  <span className="font-normal normal-case text-stone-500">
                    {memoryOptions[memory]}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {memoryOptions.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => setMemory(i)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold outline outline-1 transition ${
                        i === memory
                          ? "outline-green-600"
                          : "outline-stone-300 opacity-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <img
                src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=90&q=80"
                alt="Promo"
                className="size-20 rounded-lg"
              />
              <div className="text-sm">
                <p className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black" />
                  Buy <span className="font-bold text-red-500">02</span> boxes
                  get a <span className="font-bold">Snack Tray</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black" />
                  Buy <span className="font-bold text-red-500">04</span> boxes
                  get a free <span className="font-bold">Block Toys</span>
                </p>
                <p className="mt-1 pl-3 text-xs text-stone-500">
                  Promotion will expire in: 9h00pm, 25/5/2024
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <p>
                <span className="font-bold uppercase">SKU: </span>
                <span className="text-stone-500">{sku}</span>
              </p>
              <p>
                <span className="font-bold uppercase">Category: </span>
                <span className="text-stone-500">{category}</span>
              </p>
              <p>
                <span className="font-bold uppercase">Brand: </span>
                <span className="text-green-600">{brand}</span>
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map(
                (Icon, i) => (
                  <span
                    key={i}
                    className="grid size-10 place-items-center rounded-full bg-gray-200 transition hover:bg-green-600 hover:text-white"
                  >
                    <Icon size={14} />
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="space-y-4">
            <BuyBox product={product} />
            <QuickOrderCard />
          </div>
        </div>
      </section>

      {/* ============ FREQUENTLY BOUGHT TOGETHER — WORKING ✅ ============ */}
      <FrequentlyBoughtTogether product={product} />

      {/* ============ TABS SECTION ============ */}
      <section className="rounded-xl bg-white p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap gap-6 border-b border-stone-200">
          {[
            { key: "description", label: "Description" },
            { key: "reviews", label: "Reviews" },
            { key: "info", label: "Additional Information" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-lg uppercase transition ${
                tab === t.key
                  ? "border-b-2 border-black font-bold text-black"
                  : "text-stone-500 hover:text-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <div className="space-y-6 text-sm leading-6">
            {/* ✅ Main description from Supabase */}
            {product.description ? (
              <div className="whitespace-pre-line text-neutral-700">
                {product.description}
              </div>
            ) : (
              <p className="text-neutral-500 italic">
                No description available for this product.
              </p>
            )}

            {/* ✅ Product main image (large) */}
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-full rounded-xl"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80";
                }}
              />
            )}

            {/* ✅ Product details from Supabase */}
            <div className="rounded-xl bg-green-50 p-5">
              <h3 className="mb-3 text-lg font-bold">Product Details</h3>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="font-bold uppercase text-stone-500">
                    Brand:{" "}
                  </span>
                  <span className="text-black">
                    {product.brand || "Generic"}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase text-stone-500">
                    Category:{" "}
                  </span>
                  <span className="text-black capitalize">
                    {(product.category || "").replace("-", " ")}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase text-stone-500">
                    SKU:{" "}
                  </span>
                  <span className="text-black">
                    {product.sku || `SKU-${product.id}`}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase text-stone-500">
                    Stock:{" "}
                  </span>
                  <span
                    className={`font-bold ${
                      product.stock === "in"
                        ? "text-green-600"
                        : product.stock === "out"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {product.stock === "in"
                      ? "✓ In Stock"
                      : product.stock === "out"
                        ? "✗ Out of Stock"
                        : "Contact Us"}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase text-stone-500">
                    Price:{" "}
                  </span>
                  <span className="font-bold text-black">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>
                {product.old_price && (
                  <div>
                    <span className="font-bold uppercase text-stone-500">
                      Old Price:{" "}
                    </span>
                    <span className="text-stone-500 line-through">
                      ${Number(product.old_price).toFixed(2)}
                    </span>
                  </div>
                )}
                {product.shipping && (
                  <div>
                    <span className="font-bold uppercase text-stone-500">
                      Shipping:{" "}
                    </span>
                    <span className="text-green-600">{product.shipping}</span>
                  </div>
                )}
                {product.rating && (
                  <div>
                    <span className="font-bold uppercase text-stone-500">
                      Rating:{" "}
                    </span>
                    <span className="text-amber-600">
                      {product.rating} ★ ({product.reviews || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Guarantee section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral-100 p-5 text-center">
                <p className="text-3xl">🚚</p>
                <p className="mt-2 font-bold">Free Shipping</p>
                <p className="text-xs text-stone-500">On orders over $199</p>
              </div>
              <div className="rounded-xl bg-neutral-100 p-5 text-center">
                <p className="text-3xl">🛡️</p>
                <p className="mt-2 font-bold">Secure Payment</p>
                <p className="text-xs text-stone-500">100% protected</p>
              </div>
            </div>
          </div>
        )}

        {tab === "reviews" && <ReviewsSection productId={product.id} />}

        {tab === "info" && (
          <div className="space-y-2 text-sm text-stone-500">
            <p>
              <b className="text-black">Brand:</b> {brand}
            </p>
            <p>
              <b className="text-black">Category:</b> {category}
            </p>
            <p>
              <b className="text-black">SKU:</b> {sku}
            </p>
          </div>
        )}
      </section>

      {/* ============ RELATED PRODUCTS ============ */}
      {relatedData.length > 0 && (
        <ProductRail
          title="Related products"
          products={relatedData}
          viewAllHref="/category"
        />
      )}

      {/* ============ RECENTLY VIEWED ============ */}
      {recentlyViewedData.length > 0 && (
        <section className="rounded-xl bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase">
              Your recently viewed
            </h2>
            <Link
              to="/category"
              className="text-xs text-stone-500 hover:text-green-600"
            >
              View All →
            </Link>
          </div>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentlyViewedData.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="flex w-64 sm:w-72 shrink-0 snap-start gap-2 sm:gap-3 rounded-lg border border-stone-200 p-2 transition hover:border-green-600 hover:bg-neutral-50"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="size-20 sm:size-24 shrink-0 rounded object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80";
                  }}
                />
                <div className="min-w-0 flex-1">
                  {p.rating != null && (
                    <StarRating count={p.rating} reviews={p.reviews} />
                  )}
                  <p className="mt-1 line-clamp-2 text-[10px] sm:text-xs font-bold">
                    {p.title}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1 sm:gap-2">
                    <span
                      className={`text-xs sm:text-base font-bold ${p.oldPrice ? "text-red-600" : "text-black"}`}
                    >
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
        </section>
      )}

      <PromoBar />
    </PageShell>
  );
}
