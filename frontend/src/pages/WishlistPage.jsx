import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { ProductGridCard } from "../components/Product";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function WishlistPage() {
  const { items, count, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title || item.name,
        price: typeof item.price === "number" ? item.price : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, "")),
        image: item.image,
        category: item.category,
        brand: item.brand,
      });
    });
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Wishlist" },
        ]}
      />

      <section className="rounded-xl bg-white p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
          <div>
            <h1 className="text-xl font-bold uppercase sm:text-2xl text-stone-900 flex items-center gap-2">
              <Heart size={24} className="fill-red-500 text-red-500" />
              My Wishlist
              <span className="text-sm font-semibold text-stone-500">
                ({count} {count === 1 ? "item" : "items"})
              </span>
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Save your favorite tech products and purchase them anytime.
            </p>
          </div>

          {count > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-green-700"
            >
              <ShoppingCart size={16} /> Add All to Cart
            </button>
          )}
        </div>

        {count === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-violet-100 text-neutral-400 mb-4">
              <Heart size={36} />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
              Explore our cellphones and laptops and tap the heart icon on any product to save it here.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/cellphones"
                className="rounded-lg bg-green-600 px-5 py-2.5 text-xs font-bold uppercase text-white hover:bg-green-700 transition"
              >
                Browse Cellphones
              </Link>
              <Link
                to="/laptops"
                className="rounded-lg border border-stone-300 px-5 py-2.5 text-xs font-bold uppercase text-stone-700 hover:bg-stone-50 transition"
              >
                Browse Laptops
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {items.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
