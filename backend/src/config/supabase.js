import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const supabaseUrl =
  process.env.SUPABASE_URL || "https://mubgaawxyyeeksznyztp.supabase.co";

export const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YmdhYXd4eXllZWtzem55enRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzc3MzYsImV4cCI6MjEwNTc1MzczNn0.WS25FfoL1DlJOzChZfaJwHQGagjvVSJE58yOfknFM_Q";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function getUserClient(token) {
  if (!token) return supabase;
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default supabase;
