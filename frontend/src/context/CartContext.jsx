import { createContext, useContext, useEffect, useState, useMemo } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "rovado.cart.v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((cur) => {
      const existing = cur.find((i) => String(i.id) === String(product.id));
      if (existing) {
        return cur.map((i) =>
          String(i.id) === String(product.id) ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...cur,
        {
          id: product.id,
          title: product.title,
          image: product.image,
          price: Number(product.price),
          badge: product.badge,
          shipping: product.shipping,
          stock: product.stock,
          rating: product.rating,
          reviews: product.reviews,
          save: product.save,
          qty,
        },
      ];
    });
  };

  const removeItem = (id) =>
    setItems((cur) => cur.filter((i) => String(i.id) !== String(id)));

  const updateQty = (id, delta) =>
    setItems((cur) =>
      cur.map((i) =>
        String(i.id) === String(id)
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );

  const clearCart = () => setItems([]);

  const { subtotal, count } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.subtotal += Number(i.price) * i.qty;
        acc.count += i.qty;
        return acc;
      },
      { subtotal: 0, count: 0 }
    );
  }, [items]);

  const value = {
    items,
    count,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};