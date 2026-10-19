import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireUser, requireAdmin } from "../middleware/authMiddleware.js";
import "dotenv/config";

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

// All routes here require authenticated admin
router.use(requireUser, requireAdmin);

// --- PRODUCTS ---
router.get("/products", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.post("/products", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .insert(req.body)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("products")
    .update(req.body)
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  return res.json({ success: true, message: "Product deleted" });
});

// --- ORDERS ---
router.get("/orders", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.put("/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required." });

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

// --- USERS ---
router.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.put("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role || !["admin", "customer"].includes(role)) {
    return res.status(400).json({ error: "Valid role ('admin' or 'customer') is required." });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: "Cannot delete your own admin account." });
  }

  // Delete profile
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  return res.json({ success: true, message: "User profile deleted." });
});

export default router;
