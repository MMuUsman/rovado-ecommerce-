import { Router } from "express";
import {
  STRIPE_TEST_CARDS,
  validateStripeSandboxCard,
  createMockPaymentIntent,
  confirmMockPaymentIntent,
  saveOrderAndTransactionToSupabase,
  getStoredTransactions,
} from "../services/stripeService.js";

const router = Router();

/**
 * GET /api/payment/config
 * Returns public configuration for Stripe sandbox
 */
router.get("/config", (_req, res) => {
  return res.json({
    success: true,
    sandbox: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_51MockStripeSandboxKey0000000000",
    standardTestCard: "4242 4242 4242 4242",
    testCards: {
      standardSuccess: "4242 4242 4242 4242",
      requires3DS: "4000 0000 0000 0002",
      genericVisa: "4111 1111 1111 1111",
      mastercard: "5555 5555 5555 4444",
      amex: "3782 8224 6310 005",
      cardDeclined: "4000 0000 0000 0024",
      insufficientFunds: "4000 0000 0000 0010",
      expiredCard: "4000 0000 0000 0069",
    },
    supportedCurrencies: ["USD"],
  });
});

/**
 * POST /api/payment/validate-card
 * Validates card against Stripe Sandbox rules
 */
router.post("/validate-card", (req, res) => {
  const cardData = req.body || {};
  const validation = validateStripeSandboxCard(cardData);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation,
    });
  }

  return res.json({
    success: true,
    validation,
  });
});

/**
 * POST /api/payment/create-payment-intent
 * Creates a Stripe sandbox payment intent
 */
router.post("/create-payment-intent", (req, res) => {
  const { amount, currency = "usd", metadata = {} } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({
      error: "Valid payment amount is required.",
    });
  }

  const paymentIntent = createMockPaymentIntent({
    amount: Number(amount),
    currency,
    metadata,
  });

  return res.json({
    success: true,
    paymentIntent,
    clientSecret: paymentIntent.client_secret,
  });
});

/**
 * POST /api/payment/confirm-payment
 * Confirms a Stripe sandbox payment intent
 */
router.post("/confirm-payment", (req, res) => {
  const { payment_intent_id, card, billing_details } = req.body;

  if (!payment_intent_id) {
    return res.status(400).json({
      error: "payment_intent_id is required.",
    });
  }

  const result = confirmMockPaymentIntent(payment_intent_id, card, billing_details);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error,
    });
  }

  return res.json({
    success: true,
    paymentIntent: result.paymentIntent,
    charge: result.charge,
    cardValidation: result.cardValidation,
  });
});

/**
 * POST /api/payment/checkout
 * Comprehensive end-to-end checkout with Stripe Sandbox verification
 * and accurate persistence into Supabase database schema.
 */
router.post("/checkout", async (req, res) => {
  try {
    const { items = [], billing = {}, card = {}, user = null } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    if (!billing.first_name || !billing.last_name || !billing.email) {
      return res.status(400).json({ error: "First name, last name, and email are required in billing details." });
    }

    // 1. Calculate Totals accurately
    const subtotal = items.reduce((acc, i) => acc + Number(i.price) * Number(i.qty || 1), 0);
    const shipping = subtotal * 0.01;
    const tax = subtotal * 0.02;
    const total = subtotal + shipping + tax;

    // 2. Validate Card with Stripe Sandbox Validation Workflow
    const cardValidation = validateStripeSandboxCard({
      ...card,
      amount: total,
      currency: "usd",
    });

    if (!cardValidation.valid) {
      return res.status(400).json({
        success: false,
        step: "card_validation",
        error: cardValidation.message,
        code: cardValidation.code,
      });
    }

    // 3. Create & Confirm Payment Intent in Stripe Sandbox
    const paymentIntent = createMockPaymentIntent({
      amount: total,
      currency: "usd",
      metadata: {
        customer_email: billing.email,
        customer_name: `${billing.first_name} ${billing.last_name}`,
        item_count: items.length,
      },
    });

    const confirmationResult = confirmMockPaymentIntent(
      paymentIntent.id,
      {
        ...card,
        amount: total,
        currency: "usd",
      },
      billing
    );

    if (!confirmationResult.success) {
      return res.status(400).json({
        success: false,
        step: "payment_confirmation",
        error: confirmationResult.error.message,
        code: confirmationResult.error.code,
      });
    }

    // 4. Extract User Token from headers if present (for Supabase authenticated context)
    const authHeader = req.headers.authorization || "";
    const userToken = authHeader.replace(/^Bearer\s+/i, "").trim() || null;

    // 5. Save order and transaction record accurately into Supabase database schema
    const saveResult = await saveOrderAndTransactionToSupabase({
      user,
      userToken,
      items,
      billing,
      paymentDetails: confirmationResult,
      totals: { subtotal, shipping, tax, total },
    });

    return res.json({
      success: true,
      message: "Order placed and payment successfully processed via Stripe Sandbox.",
      orderId: saveResult.order.id,
      order: saveResult.order,
      transaction: saveResult.transaction,
      supabaseSynced: saveResult.supabase_synced,
      supabaseError: saveResult.supabase_error,
      receiptUrl: saveResult.transaction.receipt_url,
    });
  } catch (err) {
    console.error("[paymentRoutes] Checkout error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal payment processing error: " + err.message,
    });
  }
});

/**
 * GET /api/payment/transactions
 * Retrieve audit trail of processed Stripe sandbox transactions
 */
router.get("/transactions", (_req, res) => {
  const transactions = getStoredTransactions();
  return res.json({
    success: true,
    count: transactions.length,
    transactions,
  });
});

export default router;
