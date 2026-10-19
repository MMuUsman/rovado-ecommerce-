import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dealsRoutes from "./routes/dealsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Rovado E-Commerce Backend",
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/payment", paymentRoutes);


// Global Error Handler & Invalid JSON parser handling
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON payload received.",
      tip: "In Windows PowerShell, format JSON with @{ message = '...' } | ConvertTo-Json or run: npm test",
      details: err.message,
    });
  }
  console.error("[server] Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error", message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Rovado Backend API listening on http://localhost:${PORT}`);
});