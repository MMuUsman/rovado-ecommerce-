/**
 * Comprehensive Autonomous End-to-End System Audit & Functional Test
 */

async function runAudit() {
  console.log("========================================================");
  console.log("🚀 ROVADO E-COMMERCE FULL STACK END-TO-END AUDIT");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. FRONTEND SERVER VERIFICATION
  console.log("--- 1. Testing Frontend Server (http://localhost:5173) ---");
  const routesToTest = [
    "/",
    "/category",
    "/category?page=2",
    "/cellphones",
    "/cellphones?page=2",
    "/laptops",
    "/product/1",
    "/product/9",
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/profile",
    "/contact",
    "/about",
    "/admin",
  ];

  for (const route of routesToTest) {
    try {
      const res = await fetch(`http://localhost:5173${route}`);
      if (res.status === 200) {
        console.log(`✅ Route ${route.padEnd(24)} -> HTTP 200 OK`);
        passed++;
      } else {
        console.error(`❌ Route ${route.padEnd(24)} -> HTTP ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ Route ${route.padEnd(24)} -> Connection failed:`, err.message);
      failed++;
    }
  }

  // 2. BACKEND API & CHATBOT VERIFICATION
  console.log("\n--- 2. Testing Backend API Server (http://localhost:4000) ---");

  // Health
  try {
    const healthRes = await fetch("http://localhost:4000/api/health");
    const health = await healthRes.json();
    if (healthRes.status === 200 && health.status === "ok") {
      console.log(`✅ /api/health              -> HTTP 200 OK (${health.service})`);
      passed++;
    } else {
      console.error(`❌ /api/health FAILED:`, health);
      failed++;
    }
  } catch (err) {
    console.error(`❌ /api/health connection failed:`, err.message);
    failed++;
  }

  // Chatbot test 1: Shipping
  try {
    const chat1 = await fetch("http://localhost:4000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is your shipping policy?" }),
    });
    const c1 = await chat1.json();
    if (chat1.status === 200 && c1.reply) {
      console.log(`✅ /api/chat (Shipping)     -> HTTP 200 OK [Source: ${c1.source}]`);
      passed++;
    } else {
      console.error(`❌ /api/chat (Shipping) FAILED:`, c1);
      failed++;
    }
  } catch (err) {
    console.error(`❌ /api/chat (Shipping) Error:`, err.message);
    failed++;
  }

  // Chatbot test 2: Laptops recommendation
  try {
    const chat2 = await fetch("http://localhost:4000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Can you recommend a laptop?" }),
    });
    const c2 = await chat2.json();
    if (chat2.status === 200 && c2.reply) {
      console.log(`✅ /api/chat (Laptops)      -> HTTP 200 OK [Source: ${c2.source}]`);
      passed++;
    } else {
      console.error(`❌ /api/chat (Laptops) FAILED:`, c2);
      failed++;
    }
  } catch (err) {
    console.error(`❌ /api/chat (Laptops) Error:`, err.message);
    failed++;
  }

  // Chatbot test 3: Validation on empty input
  try {
    const chat3 = await fetch("http://localhost:4000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    if (chat3.status === 400) {
      console.log(`✅ /api/chat (Validation)   -> HTTP 400 Bad Request (Correctly rejected empty input)`);
      passed++;
    } else {
      console.error(`❌ /api/chat (Validation) FAILED: Expected 400, got ${chat3.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ /api/chat (Validation) Error:`, err.message);
    failed++;
  }

  // 3. DATABASE VALIDATION VIA SUPABASE
  console.log("\n--- 3. Testing Supabase Database Flow ---");
  try {
    const { createRequire } = await import("node:module");
    const require = createRequire(new URL("../backend/package.json", import.meta.url));
    const { createClient } = require("@supabase/supabase-js");
    const supabaseUrl = "https://mubgaawxyyeeksznyztp.supabase.co";
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YmdhYXd4eXllZWtzem55enRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzc3MzYsImV4cCI6MjEwNTc1MzczNn0.WS25FfoL1DlJOzChZfaJwHQGagjvVSJE58yOfknFM_Q";

    const supabase = createClient(supabaseUrl, anonKey);
    const { data: products, error: pError } = await supabase
      .from("products")
      .select("id, title, price, category, stock")
      .eq("is_active", true)
      .limit(5);

    if (pError) {
      console.error(`❌ Supabase products fetch FAILED:`, pError.message);
      failed++;
    } else {
      console.log(`✅ Supabase Products Fetch  -> Successfully loaded ${products.length} products`);
      for (const p of products) {
        console.log(`   • [ID: ${p.id}] ${p.title} - $${p.price} (Category: ${p.category})`);
      }
      passed++;
    }
  } catch (err) {
    console.error(`❌ Supabase connection error:`, err.message);
    failed++;
  }

  // 4. DEALS OF THE DAY API & SEARCH VERIFICATION
  console.log("\n--- 4. Testing Deals of the Day & Search Queries ---");
  try {
    const dealsRes = await fetch("http://localhost:4000/api/deals");
    const dealsData = await dealsRes.json();
    if (dealsRes.status === 200 && dealsData.success && dealsData.deals?.length > 0) {
      console.log(`✅ /api/deals               -> HTTP 200 OK (${dealsData.deals.length} deals loaded, expires: ${dealsData.expiresAt})`);
      const sample = dealsData.deals[0];
      console.log(`   • Sample Deal: "${sample.title}" | Price: ${sample.price} | Old: ${sample.oldPrice} | Save: ${sample.save} | Stock: ${sample.sold}/${sample.stock_quantity}`);
      passed++;
    } else {
      console.error(`❌ /api/deals FAILED:`, dealsData);
      failed++;
    }
  } catch (err) {
    console.error(`❌ /api/deals Error:`, err.message);
    failed++;
  }

  const searchQueries = ["laptop", "iphone", "camera"];
  for (const q of searchQueries) {
    try {
      const res = await fetch(`http://localhost:5173/category?search=${encodeURIComponent(q)}`);
      if (res.status === 200) {
        console.log(`✅ Search Query '?search=${q}' -> HTTP 200 OK`);
        passed++;
      } else {
        console.error(`❌ Search Query '?search=${q}' -> HTTP ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ Search Query '?search=${q}' failed:`, err.message);
      failed++;
    }
  }

  console.log("\n========================================================");
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  process.exit(failed === 0 ? 0 : 1);
}

runAudit();
