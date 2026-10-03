import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware: verify user JWT from frontend
async function requireUser(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return res.status(401).json({ error: error.message });
  req.user = data.user;
  next();
}

async function requireAdmin(req, res, next) {
  const { data: profile } = await supabaseAdmin
    .from("profiles").select("role").eq("id", req.user.id).maybeSingle();
  if (profile?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// Example: admin-only product update
app.post("/api/admin/products", requireUser, requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("products").insert(req.body).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Example: list all orders (admin)
app.get("/api/admin/orders", requireUser, requireAdmin, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("orders").select("*, order_items(*), profiles(email, full_name)")
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(process.env.PORT || 4000, () =>
  console.log(`API on :${process.env.PORT || 4000}`)
);