import { createContext, useContext, useState, useEffect, useMemo } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "rovado.wishlist.v1";

export function WishlistProvider({ children }) {
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

  const toggleWishlist = (product) => {
    if (!product || !product.id) return;
    setItems((cur) => {
      const exists = cur.some((i) => String(i.id) === String(product.id));
      if (exists) {
        return cur.filter((i) => String(i.id) !== String(product.id));
      } else {
        return [
          ...cur,
          {
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            oldPrice: product.oldPrice,
            category: product.category,
            rating: product.rating,
            reviews: product.reviews,
          },
        ];
      }
    });
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return items.some((i) => String(i.id) === String(productId));
  };

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      count,
      toggleWishlist,
      isInWishlist,
    }),
    [items, count]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      items: [],
      count: 0,
      toggleWishlist: () => {},
      isInWishlist: () => false,
    };
  }
  return ctx;
};
