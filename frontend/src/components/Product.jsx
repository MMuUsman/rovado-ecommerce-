import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";

export function StarRating({ count = 0, reviews }) {
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

export function Badge({ children, tone = "green" }) {
  const tones = {
    green: "bg-green-600 text-white",
    dark: "bg-neutral-800 text-white",
  };
  return (
    <span className={`inline-flex flex-col rounded-md px-2 py-1 text-[10px] font-medium uppercase leading-tight ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ProductCard({ product }) {
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
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 opacity-0 shadow-sm transition group-hover:opacity-100"
        >
          <Heart size={14} />
        </button>
      </div>

      {rating != null && <StarRating count={rating} reviews={reviews} />}

      <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-black">{title}</h3>

      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-lg font-semibold ${oldPrice ? "text-red-600" : "text-black"}`}>{price}</span>
        {oldPrice && <span className="text-sm font-semibold text-stone-500 line-through">{oldPrice}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase">
        {shipping && <span className="rounded bg-green-600/5 px-2 py-1 text-green-600">{shipping}</span>}
        {stock === "in" && <span className="text-black">● In stock</span>}
        {stock === "out" && <span className="text-black">● Out of stock</span>}
        {stock === "contact" && <span className="text-black">● Contact</span>}
      </div>
    </Link>
  );
}

export function ProductGridCard({ product }) {
  const { image, badge, title, rating, reviews, price, oldPrice, shipping, stock, isNew, save } = product;
  const [imgError, setImgError] = useState(false);
  const src = imgError || !image ? FALLBACK_IMG : image;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col rounded-lg p-4 transition hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
        <img
          src={src}
          alt={title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {(badge || save) && (
          <div className="absolute left-2 top-2">
            {save ? (
              <div className="flex flex-col rounded-md bg-green-600 px-2 py-1 text-white">
                <span className="text-[10px] uppercase">Save</span>
                <span className="text-sm font-medium">{save}</span>
              </div>
            ) : (
              <Badge tone={isNew ? "dark" : "green"}>{badge}</Badge>
            )}
          </div>
        )}
        <button
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-gray-200 text-neutral-400 opacity-0 transition group-hover:opacity-100"
        >
          <Heart size={14} />
        </button>
      </div>

      {rating != null && <StarRating count={rating} reviews={reviews} />}

      <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-black">{title}</h3>

      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-lg font-semibold ${oldPrice ? "text-red-600" : "text-black"}`}>{price}</span>
        {oldPrice && <span className="text-sm font-semibold text-stone-500 line-through">{oldPrice}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase">
        {shipping && <span className="rounded bg-green-600/5 px-2 py-1 text-green-600">{shipping}</span>}
        {stock === "in" && <span className="text-black">● In stock</span>}
        {stock === "out" && <span className="text-black">● Out of stock</span>}
        {stock === "contact" && <span className="text-black">● Contact</span>}
      </div>
    </Link>
  );
}

export function ProductRail({ title, products, viewAllHref = "/category" }) {
  const scrollerId = `rail-${(title || "products").replace(/\s+/g, "-")}`;

  const scroll = (dir) => {
    const el = document.getElementById(scrollerId);
    if (el) el.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <section className="rounded-xl bg-white p-4 sm:p-6">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">{title}</h2>
          <div className="flex items-center gap-2">
            <Link to={viewAllHref} className="text-xs uppercase text-stone-500 hover:text-green-600">
              View All
            </Link>
            <button onClick={() => scroll(-1)} className="grid size-8 place-items-center rounded-md bg-slate-100">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => scroll(1)} className="grid size-8 place-items-center rounded-md bg-slate-100">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
      <div
        id={scrollerId}
        className="flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <ProductCard key={p.id ?? i} product={p} />
        ))}
      </div>
    </section>
  );
}