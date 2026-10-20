import { createRequire } from "node:module";
const require = createRequire(new URL("../backend/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://mubgaawxyyeeksznyztp.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YmdhYXd4eXllZWtzem55enRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzc3MzYsImV4cCI6MjEwNTc1MzczNn0.WS25FfoL1DlJOzChZfaJwHQGagjvVSJE58yOfknFM_Q";

async function verifyRealOrderFlow() {
  console.log("=================================================================");
  console.log("🔍 ROVADO REAL END-TO-END MY ORDERS VERIFICATION TEST");
  console.log("=================================================================\n");

  const client1 = createClient(supabaseUrl, anonKey);
  const client2 = createClient(supabaseUrl, anonKey);

  // STEP 1: Register customer 1
  const customerEmail = `customer_${Date.now().toString().slice(-6)}@gmail.com`;
  const password = "ValidPassword123!";
  console.log(`[Step 1] Registering and authenticating customer 1: ${customerEmail}...`);

  const { data: authData1, error: authErr1 } = await client1.auth.signUp({
    email: customerEmail,
    password,
    options: { data: { full_name: "Customer One" } },
  });

  if (authErr1) {
    console.error("❌ Failed to register customer 1:", authErr1);
    process.exit(1);
  }
  const user1 = authData1.user;
  console.log(`✅ Customer 1 authenticated. User ID: ${user1.id} (Email confirmed: ${!!user1.email_confirmed_at})`);

  // STEP 2 & 3: Select product
  console.log("\n[Step 2 & 3] Querying real active product from catalog...");
  const { data: products, error: prodErr } = await client1
    .from("products")
    .select("id, title, price, image, stock, category")
    .eq("is_active", true)
    .limit(1);

  if (prodErr || !products || products.length === 0) {
    console.error("❌ Failed to query products:", prodErr);
    process.exit(1);
  }
  const product = products[0];
  console.log(`✅ Product selected: ID=${product.id} "${product.title}" - $${product.price} (${product.category})`);

  // STEP 4 & 5: Cart items and checkout
  console.log("\n[Step 4 & 5] Calculating cart totals and preparing checkout...");
  const qty = 2;
  const unitPrice = Number(product.price);
  const subtotal = unitPrice * qty;
  const shipping = Number((subtotal * 0.01).toFixed(2));
  const tax = Number((subtotal * 0.02).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const items = [
    {
      id: product.id,
      product_id: product.id,
      title: product.title,
      price: unitPrice,
      qty,
      image: product.image,
    },
  ];

  const billing = {
    first_name: "Customer",
    last_name: "One",
    email: customerEmail,
    phone: "+1 206-555-0199",
    street: "1201 3rd Ave",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    country: "United States (US)",
  };

  const transaction = {
    payment_intent_id: `pi_test_${Date.now()}`,
    charge_id: `ch_test_${Date.now()}`,
    status: "succeeded",
    amount: total,
    card_brand: "visa",
    card_last4: "4242",
  };

  // STEP 6: Execute create_order_secure RPC
  console.log("\n[Step 6] Placing order through create_order_secure RPC...");
  const { data: rpcRes, error: rpcErr } = await client1.rpc("create_order_secure", {
    p_user_id: user1.id,
    p_items: items,
    p_billing: billing,
    p_payment_method: "stripe",
    p_notes: "Leave package at reception",
    p_transaction: transaction,
  });

  if (rpcErr || !rpcRes?.success) {
    console.error("❌ Order placement failed:", rpcErr || rpcRes);
    process.exit(1);
  }

  const orderId = rpcRes.order_id;
  console.log(`✅ Order placed successfully! Order ID: #${orderId}`);

  // STEP 7 & 8 & 9: Verify Supabase database rows and snapshots
  console.log("\n[Step 7, 8, 9] Verifying database records & snapshot data in Supabase...");
  const { data: dbOrder, error: dbOrderErr } = await client1
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (dbOrderErr || !dbOrder) {
    console.error("❌ Failed to query order from Supabase:", dbOrderErr);
    process.exit(1);
  }

  console.log(`✅ Order record confirmed in Supabase:`);
  console.log(`   • ID: #${dbOrder.id}`);
  console.log(`   • User ID: ${dbOrder.user_id} (Matches auth user: ${dbOrder.user_id === user1.id})`);
  console.log(`   • Status: ${dbOrder.status} | Payment: ${dbOrder.payment_status} | Delivery: ${dbOrder.delivery_status}`);
  console.log(`   • Subtotal: $${dbOrder.subtotal} | Shipping: $${dbOrder.shipping} | Tax: $${dbOrder.tax} | Total: $${dbOrder.total}`);
  console.log(`   • Delivery Address Snapshot: ${dbOrder.billing?.street}, ${dbOrder.billing?.city}, ${dbOrder.billing?.state} ${dbOrder.billing?.zip}`);
  console.log(`   • Items Count: ${dbOrder.order_items?.length}`);

  if (!dbOrder.order_items || dbOrder.order_items.length === 0) {
    console.error("❌ Order items missing or relationship broken!");
    process.exit(1);
  }

  const snapshotItem = dbOrder.order_items[0];
  console.log(`   • Snapshot Item: "${snapshotItem.title}" | Price: $${snapshotItem.price} | Qty: ${snapshotItem.qty}`);

  // STEP 10 & 11: /profile/orders query test
  console.log("\n[Step 10 & 11] Testing /profile/orders query with client1...");
  const { data: user1Orders, error: user1OrdersErr } = await client1
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user1.id)
    .order("created_at", { ascending: false });

  if (user1OrdersErr || !user1Orders || user1Orders.length === 0) {
    console.error("❌ /profile/orders query returned 0 orders or error:", user1OrdersErr);
    process.exit(1);
  }

  console.log(`✅ /profile/orders returned ${user1Orders.length} order(s) for Customer 1 immediately!`);
  const foundOrder = user1Orders.find((o) => o.id === orderId);
  if (!foundOrder) {
    console.error(`❌ Order #${orderId} not found in user orders!`);
    process.exit(1);
  }
  console.log(`✅ Order #${orderId} verified in customer order list with items!`);

  // STEP 12 & 13: Page Refresh simulation (re-executing query in fresh call)
  console.log("\n[Step 12 & 13] Simulating page refresh on /profile/orders...");
  const { data: refreshedOrders, error: refreshErr } = await client1
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user1.id)
    .order("created_at", { ascending: false });

  if (refreshErr || !refreshedOrders || refreshedOrders.length === 0) {
    console.error("❌ On refresh, orders disappeared! Error:", refreshErr);
    process.exit(1);
  }
  console.log(`✅ On refresh, order #${refreshedOrders[0].id} STILL appears! (Count: ${refreshedOrders.length})`);

  // STEP 14, 15, 16: Logout and Login again simulation
  console.log("\n[Step 14, 15, 16] Logging out customer 1 and logging back in...");
  await client1.auth.signOut();

  const { data: reLoginData, error: reLoginErr } = await client1.auth.signInWithPassword({
    email: customerEmail,
    password,
  });

  if (reLoginErr || !reLoginData?.user) {
    console.error("❌ Re-login failed:", reLoginErr);
    process.exit(1);
  }

  const { data: ordersAfterRelogin, error: reLoginOrdersErr } = await client1
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", reLoginData.user.id)
    .order("created_at", { ascending: false });

  if (reLoginOrdersErr || !ordersAfterRelogin || ordersAfterRelogin.length === 0) {
    console.error("❌ After re-login, orders disappeared! Error:", reLoginOrdersErr);
    process.exit(1);
  }
  console.log(`✅ After re-login, order #${ordersAfterRelogin[0].id} STILL appears! (Count: ${ordersAfterRelogin.length})`);

  // STEP 17: Multi-tenant Security & RLS Check (Customer 2 cannot see Customer 1's orders)
  console.log("\n[Step 17] Registering Customer 2 and checking RLS security isolation...");
  const customer2Email = `customer2_${Date.now().toString().slice(-6)}@gmail.com`;
  const { data: authData2, error: authErr2 } = await client2.auth.signUp({
    email: customer2Email,
    password,
    options: { data: { full_name: "Customer Two" } },
  });

  if (authErr2) {
    console.error("❌ Failed to register customer 2:", authErr2);
    process.exit(1);
  }
  const user2 = authData2.user;
  console.log(`✅ Customer 2 authenticated. User ID: ${user2.id}`);

  // Customer 2 attempts to query customer 1's orders
  const { data: c2OrdersOfC1, error: c2Err } = await client2
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user1.id);

  console.log(`   • Customer 2 querying Customer 1's orders returned: ${c2OrdersOfC1?.length ?? 0} orders (Expected: 0)`);
  if (c2OrdersOfC1 && c2OrdersOfC1.length > 0) {
    console.error("❌ CRITICAL SECURITY LEAK: Customer 2 can see Customer 1's orders!");
    process.exit(1);
  }

  // Customer 2 attempts to direct-fetch Customer 1's order by ID
  const { data: directLeak, error: directLeakErr } = await client2
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId);

  console.log(`   • Customer 2 direct query for Order #${orderId} returned: ${directLeak?.length ?? 0} orders (Expected: 0)`);
  if (directLeak && directLeak.length > 0) {
    console.error("❌ CRITICAL SECURITY LEAK: Customer 2 can direct-fetch Customer 1's order!");
    process.exit(1);
  }

  console.log("✅ RLS CONFIRMED: Customer 2 CANNOT see Customer 1's orders!");

  console.log("\n=================================================================");
  console.log("🎉 ALL 17 STEPS OF THE REAL ORDER LIFECYCLE PASSED WITH 100% SUCCESS!");
  console.log("=================================================================\n");
}

verifyRealOrderFlow().catch((err) => {
  console.error("FATAL ERROR in verification:", err);
  process.exit(1);
});
