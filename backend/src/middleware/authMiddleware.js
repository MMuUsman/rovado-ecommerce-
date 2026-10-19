import { supabase } from "../config/supabase.js";

export async function requireUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing." });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: error?.message || "Invalid authentication token." });
    }

    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication error: " + err.message });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User authentication required." });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to verify admin permissions." });
    }

    if (profile?.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    req.isAdmin = true;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Authorization error: " + err.message });
  }
}
