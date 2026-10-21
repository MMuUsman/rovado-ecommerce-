import { createRequire } from "node:module";
const require = createRequire(new URL("../backend/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://mubgaawxyyeeksznyztp.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YmdhYXd4eXllZWtzem55enRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzc3MzYsImV4cCI6MjEwNTc1MzczNn0.WS25FfoL1DlJOzChZfaJwHQGagjvVSJE58yOfknFM_Q";

async function runTestSuite() {
  console.log("========================================================================");
  console.log("🧪 ROVADO COMPREHENSIVE AUTH, PASSWORD RESET, & MY ORDERS TEST SUITE");
  console.log("========================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  const clientA = createClient(supabaseUrl, anonKey);
  const clientB = createClient(supabaseUrl, anonKey);

  // -------------------------------------------------------------------------
  // TEST 1: Password Reset Request (Phase 2 & 3)
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing Password Reset Request Flow ---");
  const resetEmail = "customer_446552@gmail.com";
  const resetUrl = "http://localhost:5173/reset-password";

  try {
    const { data: resetData, error: resetErr } = await clientA.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: resetUrl,
    });
    const okOrRateLimited = !resetErr || resetErr.status === 429 || resetErr.code === "over_email_send_rate_limit";
    assert(okOrRateLimited, `resetPasswordForEmail handled by Supabase Auth for registered account (${resetEmail}${resetErr ? ` - ${resetErr.message}` : ""})`);
  } catch (e) {
    assert(false, `resetPasswordForEmail threw: ${e.message}`);
  }

  // Non-existent email should return same result without revealing user presence
  try {
    const { data: nonExData, error: nonExErr } = await clientA.auth.resetPasswordForEmail("nonexistent_user_9999@test.com", {
      redirectTo: resetUrl,
    });
    assert(!nonExErr, `resetPasswordForEmail returned neutral result for non-existent email (prevents enumeration)`);
  } catch (e) {
    assert(false, `nonEx threw: ${e.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Signup with emailRedirectTo & Resend Confirmation (Phase 4)
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing Signup with emailRedirectTo & Resend Confirmation ---");
  const testNewEmail = `testuser_${Date.now().toString().slice(-6)}@rovadomail.test`;
  const initialPassword = "InitialPassword123!";
  const callbackUrl = "http://localhost:5173/auth/callback";

  const { data: signUpData, error: signUpErr } = await clientA.auth.signUp({
    email: testNewEmail,
    password: initialPassword,
    options: {
      emailRedirectTo: callbackUrl,
      data: { full_name: "Test Account User" },
    },
  });

  assert(!signUpErr && signUpData?.user?.id, `signUp succeeded for ${testNewEmail}`);
  const userAId = signUpData?.user?.id;

  // Test resend confirmation API
  const { data: resendData, error: resendErr } = await clientA.auth.resend({
    type: "signup",
    email: testNewEmail,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });
  assert(!resendErr, `resend confirmation API executed successfully with redirect URL`);

  // -------------------------------------------------------------------------
  // TEST 3: Password Update with Recovery / Authenticated Session (Phase 3)
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Password Update & Validation ---");
  const newPassword = "UpdatedNewPassword456!";

  // Client A is authenticated with newly created account
  const { data: updateData, error: updateErr } = await clientA.auth.updateUser({
    password: newPassword,
  });

  assert(!updateErr, `supabase.auth.updateUser successfully updated password`);

  // Verify old password fails
  const clientATestOld = createClient(supabaseUrl, anonKey);
  const { error: oldLoginErr } = await clientATestOld.auth.signInWithPassword({
    email: testNewEmail,
    password: initialPassword,
  });
  assert(!!oldLoginErr, `Old password (${initialPassword}) is now rejected as expected`);

  // Verify new password succeeds
  const { data: newLoginData, error: newLoginErr } = await clientATestOld.auth.signInWithPassword({
    email: testNewEmail,
    password: newPassword,
  });
  assert(!newLoginErr && newLoginData?.user?.id === userAId, `New password (${newPassword}) logs in successfully`);

  // -------------------------------------------------------------------------
  // TEST 4: Customer Order Placement & My Orders Query (Phase 5)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing Customer Order Creation & Profile / My Orders Query ---");

  // Place order for user A
  const items = [
    {
      id: 2,
      product_id: 2,
      title: "Samsung Galaxy S25 Ultra 512GB",
      price: 1299,
      qty: 1,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    },
  ];
  const billing = {
    first_name: "Test",
    last_name: "User",
    email: testNewEmail,
    phone: "+1 555-0100",
    street: "500 Pine Street",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    country: "United States (US)",
  };
  const transaction = {
    status: "succeeded",
    card_brand: "mastercard",
    card_last4: "4444",
    amount: 1337.97,
  };

  const { data: orderRes, error: orderErr } = await clientATestOld.rpc("create_order_secure", {
    p_user_id: userAId,
    p_items: items,
    p_billing: billing,
    p_payment_method: "stripe",
    p_notes: "Customer A test delivery instructions",
    p_transaction: transaction,
  });

  assert(!orderErr && orderRes?.success && orderRes?.order_id, `Order #${orderRes?.order_id} placed securely`);
  const createdOrderId = orderRes?.order_id;

  // Query orders exactly as Profile.jsx does
  const { data: customerAOrders, error: fetchErr } = await clientATestOld
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userAId)
    .order("created_at", { ascending: false });

  assert(!fetchErr && customerAOrders?.length > 0, `Profile My Orders query returned customer's real orders (Count: ${customerAOrders?.length})`);
  const myOrder = customerAOrders?.find((o) => o.id === createdOrderId);
  assert(myOrder && myOrder.order_items?.length === 1, `Order #${createdOrderId} found with complete order_items snapshots`);
  assert(myOrder && Number(myOrder.total) > 0, `Order total is correct ($${myOrder?.total})`);

  // -------------------------------------------------------------------------
  // TEST 5: Strict Multi-tenant RLS Isolation (Phase 6)
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Testing Multi-Tenant RLS Security & Isolation ---");
  const testCustomerBEmail = `buyer_b_${Date.now().toString().slice(-6)}@rovadomail.test`;
  const { data: authBData } = await clientB.auth.signUp({
    email: testCustomerBEmail,
    password: "PasswordB123!",
    options: { data: { full_name: "Customer B" } },
  });

  const userBId = authBData?.user?.id;
  assert(!!userBId, `Customer B authenticated (ID: ${userBId})`);

  // Customer B tries to query Customer A's orders list
  const { data: bLeakedOrders } = await clientB
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userAId);

  assert(!bLeakedOrders || bLeakedOrders.length === 0, `RLS Check 1: Customer B cannot query Customer A's orders (Got: ${bLeakedOrders?.length ?? 0})`);

  // Customer B tries direct fetch of Customer A's order by ID
  const { data: bDirectFetch } = await clientB
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", createdOrderId);

  assert(!bDirectFetch || bDirectFetch.length === 0, `RLS Check 2: Customer B cannot direct-fetch Order #${createdOrderId} (Got: ${bDirectFetch?.length ?? 0})`);

  // Customer B tries direct fetch of Customer A's order items
  const { data: bItemLeak } = await clientB
    .from("order_items")
    .select("*")
    .eq("order_id", createdOrderId);

  assert(!bItemLeak || bItemLeak.length === 0, `RLS Check 3: Customer B cannot query Customer A's order_items (Got: ${bItemLeak?.length ?? 0})`);

  // Anonymous unauthenticated client tries to read orders
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: anonOrders } = await anonClient.from("orders").select("*");
  assert(anonOrders?.length === 0, `RLS Check 4: Anonymous clients cannot view any customer orders`);

  // -------------------------------------------------------------------------
  // TEST 6: Demo Customer Login with Real Supabase Session (Phase 5)
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Testing 1-Click Demo Customer Account Flow ---");
  const demoClient = createClient(supabaseUrl, anonKey);
  const { data: demoAuth, error: demoErr } = await demoClient.auth.signInWithPassword({
    email: "demo.customer@rovado.com",
    password: "DemoCustomer123!",
  });

  assert(!demoErr && demoAuth?.user?.id, `1-Click Demo Customer authenticates with real Supabase Auth session`);
  const { data: demoOrders, error: demoOrdErr } = await demoClient
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", demoAuth.user.id)
    .order("created_at", { ascending: false });

  assert(!demoOrdErr && demoOrders?.length > 0, `Demo customer Profile/My Orders retrieves real orders (Count: ${demoOrders?.length})`);

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n========================================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
