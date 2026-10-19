import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);
const STORAGE_KEY = "rovado.wishlist.v1";

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("wishlist")
          .select("product_id, products(*)")
          .eq("user_id", user.id);

        if (!error && data && isMounted) {
          const remoteItems = data
            .map((row) => {
              const p = row.products;
              if (!p) return null;
              return {
                id: p.id,
                title: p.title || p.name,
                name: p.name || p.title,
                image: p.image,
                price: typeof p.price === "string" ? p.price : `$${Number(p.price || 0).toFixed(2)}`,
                oldPrice: p.old_price != null ? `$${Number(p.old_price).toFixed(2)}` : undefined,
                category: p.category,
                brand: p.brand,
                rating: p.rating ?? 5,
                reviews: p.reviews ?? 10,
                stock: p.stock ?? "in",
              };
            })
            .filter(Boolean);

          if (remoteItems.length > 0 || items.length === 0) {
            setItems(remoteItems);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteItems));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("[wishlist] failed to fetch remote wishlist:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist to local storage as fallback cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const toggleWishlist = useCallback(
    async (product) => {
      if (!product || !product.id) return;
      const productId = Number(product.id);
      const exists = items.some((i) => Number(i.id) === productId);

      if (exists) {
        // Remove locally
        setItems((cur) => cur.filter((i) => Number(i.id) !== productId));

        // Remove from Supabase if authenticated
        if (user) {
          try {
            await supabase
              .from("wishlist")
              .delete()
              .eq("user_id", user.id)
              .eq("product_id", productId);
          } catch (err) {
            console.warn("[wishlist] remote delete error:", err);
          }
        }
      } else {
        // Add locally
        const newItem = {
          id: productId,
          title: product.title || product.name,
          name: product.name || product.title,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice,
          category: product.category,
          brand: product.brand,
          rating: product.rating ?? 5,
          reviews: product.reviews ?? 10,
          stock: product.stock ?? "in",
        };
        setItems((cur) => [...cur, newItem]);

        // Add to Supabase if authenticated
        if (user) {
          try {
            await supabase.from("wishlist").upsert(
              {
                user_id: user.id,
                product_id: productId,
              },
              { onConflict: "user_id,product_id" }
            );
          } catch (err) {
            console.warn("[wishlist] remote insert error:", err);
          }
        }
      }
    },
    [items, user]
  );

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return items.some((i) => String(i.id) === String(productId));
    },
    [items]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      const pid = Number(productId);
      setItems((cur) => cur.filter((i) => Number(i.id) !== pid));
      if (user) {
        try {
          await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", pid);
        } catch (err) {
          console.warn("[wishlist] remote delete error:", err);
        }
      }
    },
    [user]
  );

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      count,
      toggleWishlist,
      isInWishlist,
      removeFromWishlist,
    }),
    [items, count, toggleWishlist, isInWishlist, removeFromWishlist]
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
      removeFromWishlist: () => {},
    };
  }
  return ctx;
};
