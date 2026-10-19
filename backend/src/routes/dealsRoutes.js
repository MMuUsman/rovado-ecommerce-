import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

/**
 * GET /api/deals
 * Returns active deals with calculated savings, stock metrics, and expiration time
 */
router.get("/", async (_req, res) => {
  try {
    // 1. Fetch discounted products from Supabase
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .not("old_price", "is", null)
      .order("id", { ascending: false })
      .limit(10);

    let deals = data || [];

    // Fallback if no products have old_price set
    if (deals.length === 0) {
      const { data: anyProducts } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: false })
        .limit(10);
      deals = anyProducts || [];
    }

    // Dynamic 48-hour rolling expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

    const formattedDeals = deals.map((p) => {
      const priceNum = typeof p.price === "number" ? p.price : parseFloat(String(p.price || 0).replace(/[^0-9.]/g, ""));
      const oldPriceNum = p.old_price != null ? (typeof p.old_price === "number" ? p.old_price : parseFloat(String(p.old_price).replace(/[^0-9.]/g, ""))) : (priceNum > 0 ? Number((priceNum * 1.25).toFixed(2)) : null);
      const savingsNum = oldPriceNum && priceNum && oldPriceNum > priceNum ? Number((oldPriceNum - priceNum).toFixed(2)) : 199.0;

      const totalStock = p.stock_quantity ? Math.max(p.stock_quantity, 50) : 75;
      const sold = Math.min(Math.round(totalStock * 0.35), totalStock);

      return {
        id: p.id,
        title: p.title,
        price: typeof p.price === "string" ? p.price : `$${priceNum.toFixed(2)}`,
        oldPrice: oldPriceNum ? `$${oldPriceNum.toFixed(2)}` : "$1,199.00",
        save: `$${savingsNum.toFixed(2)}`,
        image: p.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
        rating: p.rating ?? 5,
        reviews: p.reviews ?? 12,
        brand: p.brand || "Rovado Tech",
        category: p.category || "deals",
        stock_quantity: totalStock,
        sold,
        isNew: p.is_new ?? false,
      };
    });

    return res.json({
      success: true,
      deals: formattedDeals,
      expiresAt,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[deals] error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch deals",
      message: err.message,
    });
  }
});

export default router;
