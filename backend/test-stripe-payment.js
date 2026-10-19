/**
 * Automated Test Suite for Stripe Sandbox Mock Payment Checkout Flow
 * Tests:
 * 1. GET /api/payment/config - Verify sandbox configuration and test cards
 * 2. POST /api/payment/validate-card - Validates standard public test card '4242 4242 4242 4242'
 * 3. POST /api/payment/validate-card - Rejects invalid card checksums
 * 4. POST /api/payment/validate-card - Rejects expired cards
 * 5. POST /api/payment/create-payment-intent - Generates payment intent with client secret
 * 6. POST /api/payment/confirm-payment - Confirms intent with test card 4242
 * 7. POST /api/payment/checkout - Complete end-to-end checkout with Supabase persistence
 * 8. GET /api/payment/transactions - Verifies audit trail of saved transactions
 */

const BASE_URL = "http://localhost:4000";

async function runStripeTests() {
  console.log("========================================================");
  console.log("💳 STRIPE SANDBOX PAYMENT CHECKOUT FLOW TEST SUITE");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  // TEST 1: Config
  try {
    const res = await fetch(`${BASE_URL}/api/payment/config`);
    const data = await res.json();
    if (res.status === 200 && data.sandbox && data.standardTestCard === "4242 4242 4242 4242") {
      console.log(`✅ [1/8] GET /api/payment/config -> PASSED`);
      console.log(`         Publishable Key: ${data.publishableKey}`);
      console.log(`         Standard Test Card: ${data.standardTestCard}`);
      passed++;
    } else {
      console.error(`❌ [1/8] GET /api/payment/config FAILED:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [1/8] Config connection error:`, err.message);
    failed++;
  }

  // TEST 2: Validate Standard Public Stripe Test Card '4242 4242 4242 4242'
  try {
    const res = await fetch(`${BASE_URL}/api/payment/validate-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: "4242 4242 4242 4242",
        exp_month: "12",
        exp_year: "2028",
        cvc: "123",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.validation?.valid && data.validation?.brand === "Visa" && data.validation?.isStandard4242) {
      console.log(`✅ [2/8] POST /api/payment/validate-card ('4242 4242 4242 4242') -> PASSED`);
      console.log(`         Brand: ${data.validation.brand} | Last4: ${data.validation.last4} | 4242 Recognized: ${data.validation.isStandard4242}`);
      passed++;
    } else {
      console.error(`❌ [2/8] Standard test card validation FAILED:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [2/8] Error validating 4242 card:`, err.message);
    failed++;
  }

  // TEST 3: Reject Invalid Card Number
  try {
    const res = await fetch(`${BASE_URL}/api/payment/validate-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: "4242 1111 2222 3333",
        exp_month: "12",
        exp_year: "2028",
        cvc: "123",
      }),
    });
    const data = await res.json();
    if (res.status === 400 && data.error?.valid === false) {
      console.log(`✅ [3/8] POST /api/payment/validate-card (Invalid Card Checksum) -> PASSED (Correctly rejected: "${data.error.message}")`);
      passed++;
    } else {
      console.error(`❌ [3/8] Expected 400 rejection for invalid card, got ${res.status}:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [3/8] Error testing invalid card:`, err.message);
    failed++;
  }

  // TEST 4: Reject Expired Date
  try {
    const res = await fetch(`${BASE_URL}/api/payment/validate-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: "4242 4242 4242 4242",
        exp_month: "01",
        exp_year: "2020",
        cvc: "123",
      }),
    });
    const data = await res.json();
    if (res.status === 400 && data.error?.code === "expired_card") {
      console.log(`✅ [4/8] POST /api/payment/validate-card (Expired Card) -> PASSED (Correctly rejected: "${data.error.message}")`);
      passed++;
    } else {
      console.error(`❌ [4/8] Expected expired_card rejection, got ${res.status}:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [4/8] Error testing expired card:`, err.message);
    failed++;
  }

  // TEST 5: Create Mock Stripe Payment Intent
  let createdIntentId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/payment/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 149.99,
        currency: "usd",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.paymentIntent?.id?.startsWith("pi_test_")) {
      createdIntentId = data.paymentIntent.id;
      console.log(`✅ [5/8] POST /api/payment/create-payment-intent -> PASSED`);
      console.log(`         Intent ID: ${data.paymentIntent.id} | Amount: $${(data.paymentIntent.amount / 100).toFixed(2)} | Status: ${data.paymentIntent.status}`);
      passed++;
    } else {
      console.error(`❌ [5/8] Create Payment Intent FAILED:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [5/8] Error creating intent:`, err.message);
    failed++;
  }

  // TEST 6: Confirm Payment Intent with Test Card 4242
  try {
    const res = await fetch(`${BASE_URL}/api/payment/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_intent_id: createdIntentId,
        card: {
          number: "4242 4242 4242 4242",
          exp_month: "12",
          exp_year: "2028",
          cvc: "123",
          amount: 149.99,
        },
        billing_details: {
          name: "Test Stripe Customer",
          email: "stripe.buyer@example.com",
        },
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.paymentIntent?.status === "succeeded" && data.charge?.id?.startsWith("ch_test_")) {
      console.log(`✅ [6/8] POST /api/payment/confirm-payment -> PASSED`);
      console.log(`         Charge ID: ${data.charge.id} | Status: ${data.charge.status} | Brand: ${data.charge.payment_method_details?.card?.brand}`);
      passed++;
    } else {
      console.error(`❌ [6/8] Confirm Payment FAILED:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [6/8] Error confirming payment:`, err.message);
    failed++;
  }

  // TEST 7: End-to-End Checkout with Test Card 4242 & Supabase Persistence
  try {
    const sampleItems = [
      { id: 1, title: "Apple MacBook Pro 16 M3 Max", price: 3499.0, qty: 1, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200" },
      { id: 4, title: "Sony WH-1000XM5 Wireless Headphones", price: 399.0, qty: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
    ];

    const sampleBilling = {
      first_name: "Alex",
      last_name: "Taylor",
      company: "Rovado Tech Systems",
      country: "United States (US)",
      street: "701 Pike Street",
      apartment: "Floor 18",
      city: "Seattle",
      state: "Washington",
      zip: "98101",
      phone: "+1 206-555-0144",
      email: "alex.taylor@rovadotest.com",
      notes: "Deliver to IT Department via Stripe Sandbox checkout.",
    };

    const res = await fetch(`${BASE_URL}/api/payment/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: sampleItems,
        billing: sampleBilling,
        card: {
          number: "4242 4242 4242 4242",
          exp_month: "10",
          exp_year: "2028",
          cvc: "424",
          name: "Alex Taylor",
        },
      }),
    });

    const data = await res.json();
    if (res.status === 200 && data.success && data.transaction?.status === "succeeded") {
      console.log(`✅ [7/8] POST /api/payment/checkout (End-to-End Flow) -> PASSED`);
      console.log(`         Order ID: #${data.orderId}`);
      console.log(`         Transaction ID: ${data.transaction.transaction_id}`);
      console.log(`         Payment Intent: ${data.transaction.payment_intent_id}`);
      console.log(`         Card Last4: ${data.transaction.card_last4} | Amount: $${data.transaction.amount}`);
      console.log(`         Supabase Persistence: ${data.supabaseSynced ? "Synced directly to Supabase orders schema" : "Saved in Store Audit Schema"}`);
      passed++;
    } else {
      console.error(`❌ [7/8] End-to-end checkout FAILED:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [7/8] Error in checkout:`, err.message);
    failed++;
  }

  // TEST 8: Retrieve Stored Transactions Audit Trail
  try {
    const res = await fetch(`${BASE_URL}/api/payment/transactions`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.count > 0) {
      console.log(`✅ [8/8] GET /api/payment/transactions -> PASSED (${data.count} transactions on record)`);
      const latest = data.transactions[0];
      console.log(`         Latest: ${latest.transaction.transaction_id} | Total: $${latest.totals?.total} | Customer: ${latest.customer_name}`);
      passed++;
    } else {
      console.error(`❌ [8/8] Retrieve transactions FAILED:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [8/8] Error retrieving transactions:`, err.message);
    failed++;
  }

  console.log("\n========================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  process.exit(failed === 0 ? 0 : 1);
}

runStripeTests();
