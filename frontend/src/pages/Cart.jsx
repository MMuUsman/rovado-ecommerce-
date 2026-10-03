import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { StarRating } from "../components/Product";
import { useCart } from "../context/CartContext";

function CartRow({ item, onQty, onRemove }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-neutral-50 p-4 sm:flex-row sm:items-center">
      <div className="relative size-40 shrink-0 self-center overflow-hidden rounded-xl bg-white sm:size-56">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        {item.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-neutral-800 px-2 py-1 text-[10px] uppercase text-white">
            {item.badge}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {item.rating != null && <StarRating count={item.rating} reviews={item.reviews} />}
        <h3 className="mt-1 text-sm font-bold sm:text-base">{item.title}</h3>
        <p className="mt-2 text-lg font-semibold">${Number(item.price).toFixed(2)}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-lg outline outline-1 outline-neutral-400/20 px-2 py-1.5">
            <button onClick={() => onQty(item.id, -1)} className="px-1 text-sm font-bold">−</button>
            <span className="text-sm font-bold">{item.qty}</span>
            <button onClick={() => onQty(item.id, 1)} className="px-1 text-sm font-bold">+</button>
          </div>
          {item.shipping && (
            <span className="rounded bg-green-600/5 px-2 py-1 text-[10px] uppercase text-green-600">
              {item.shipping}
            </span>
          )}
          {item.stock === "in" && <span className="text-xs">● In stock</span>}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 self-start sm:self-center">
        {item.save && (
          <div className="flex flex-col rounded-md bg-green-600 px-3 py-2 text-white">
            <span className="text-[10px] uppercase">Save</span>
            <span className="text-sm font-medium">{item.save}</span>
          </div>
        )}
        <button className="grid size-9 place-items-center rounded-full bg-gray-200 text-neutral-400">
          <Heart size={14} />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="grid size-9 place-items-center rounded-full bg-red-600/5 text-red-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  const shipping = subtotal * 0.01; 

  const tax = subtotal * 0.02;
  const total = subtotal + shipping + tax;

  return (
    <PageShell>
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pages", href: "/" }, { label: "Cart" }]} />

      <section className="rounded-xl bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            {items.length === 0 && (
              <p className="rounded-xl bg-neutral-50 p-8 text-center text-sm text-stone-500">
                Your cart is empty.
              </p>
            )}
            {items.map((item) => (
              <CartRow key={item.id} item={item} onQty={updateQty} onRemove={removeItem} />
            ))}
          </div>

          <aside className="h-fit rounded-xl p-6 outline outline-1 outline-green-600">
            <h2 className="mb-6 text-base font-bold">Order Summary</h2>
            <div className="space-y-4 border-b border-stone-300 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Sub Total:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping estimate:</span>
                <span className="font-bold">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tax estimate:</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm font-bold uppercase">
              <span>Order total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-xl bg-green-600 py-4 text-center text-xs font-medium uppercase text-white"
            >
              Checkout
            </Link>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}