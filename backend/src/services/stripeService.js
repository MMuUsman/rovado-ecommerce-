import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL || "https://mubgaawxyyeeksznyztp.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// Default supabase client
const defaultSupabase = createClient(supabaseUrl, supabaseKey);

// Storage path for transaction audit trail
const DATA_DIR = path.resolve(__dirname, "../../data");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn("[stripeService] Failed to create data dir:", err.message);
  }
}

/**
 * Standard Stripe Sandbox Test Cards
 */
export const STRIPE_TEST_CARDS = {
  STANDARD_SUCCESS: "4242424242424242",
  REQUIRE_3DS: "4000000000000002",
  GENERIC_VISA: "4111111111111111",
  MASTERCARD: "5555555555554444",
  AMEX: "378282246310005",
  CARD_DECLINED: "4000000000000024",
  INSUFFICIENT_FUNDS: "4000000000000010",
  EXPIRED_CARD: "4000000000000069",
};

/**
 * Detect card brand from card number
 */
export function detectCardBrand(cleanNumber) {
  if (/^4/.test(cleanNumber)) return "Visa";
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return "Mastercard";
  if (/^3[47]/.test(cleanNumber)) return "American Express";
  if (/^6(?:011|5)/.test(cleanNumber)) return "Discover";
  return "Unknown";
}

/**
 * Validates card details using Stripe Sandbox rules.
 * Specifically checks and applies the standard public Stripe test card '4242 4242 4242 4242'.
 */
export function validateStripeSandboxCard(cardData = {}) {
  const rawNumber = String(cardData.number || "").replace(/[\s-]/g, "");
  const expMonth = parseInt(cardData.exp_month || cardData.expMonth, 10);
  const expYear = parseInt(cardData.exp_year || cardData.expYear, 10);
  const cvc = String(cardData.cvc || "").trim();

  // 1. Number validation
  if (!rawNumber) {
    return {
      valid: false,
      code: "parameter_missing",
      message: "Please enter a card number. Use Stripe Sandbox test card 4242 4242 4242 4242.",
    };
  }

  // Length check (standard credit cards are 13-19 digits, Stripe test card is 16)
  if (!/^\d{13,19}$/.test(rawNumber)) {
    return {
      valid: false,
      code: "invalid_number",
      message: "Your card number is incomplete or invalid. Use Stripe Sandbox test card 4242 4242 4242 4242.",
    };
  }

  // Standard Stripe test card error simulations
  if (rawNumber === STRIPE_TEST_CARDS.CARD_DECLINED) {
    return {
      valid: false,
      code: "card_declined",
      message: "Your card was declined by the issuer (Stripe test decline card 0024).",
    };
  }
  if (rawNumber === STRIPE_TEST_CARDS.INSUFFICIENT_FUNDS) {
    return {
      valid: false,
      code: "insufficient_funds",
      message: "Your card has insufficient funds (Stripe test insufficient funds card 0010).",
    };
  }
  if (rawNumber === STRIPE_TEST_CARDS.EXPIRED_CARD) {
    return {
      valid: false,
      code: "expired_card",
      message: "Your card is expired (Stripe test expired card 0069).",
    };
  }

  // Allow standard Stripe test cards and Luhn-valid cards (Stripe 4242 is Luhn-valid)
  const isStripeTestCard = [
    STRIPE_TEST_CARDS.STANDARD_SUCCESS,
    STRIPE_TEST_CARDS.REQUIRE_3DS,
    STRIPE_TEST_CARDS.GENERIC_VISA,
    STRIPE_TEST_CARDS.MASTERCARD,
    STRIPE_TEST_CARDS.AMEX,
  ].includes(rawNumber);

  // Luhn check for non-specific cards
  if (!isStripeTestCard) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = rawNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(rawNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) {
      return {
        valid: false,
        code: "incorrect_number",
        message: "Invalid card number checksum. Please use standard Stripe Sandbox test card: 4242 4242 4242 4242.",
      };
    }
  }

  // 2. Expiration Month Validation
  if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
    return {
      valid: false,
      code: "invalid_expiry_month",
      message: "Your card's expiration month is invalid (must be 1 - 12).",
    };
  }

  // 3. Expiration Year Validation (support 2-digit e.g. 28 -> 2028 or 4-digit 2028)
  const fullYear = expYear < 100 ? 2000 + expYear : expYear;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (isNaN(fullYear) || fullYear < currentYear || (fullYear === currentYear && expMonth < currentMonth)) {
    return {
      valid: false,
      code: "expired_card",
      message: "Your card's expiration date is in the past.",
    };
  }

  // 4. CVC Validation (3 or 4 digits)
  if (!/^\d{3,4}$/.test(cvc)) {
    return {
      valid: false,
      code: "invalid_cvc",
      message: "Your card's security code is invalid (must be 3 or 4 digits).",
    };
  }

  const brand = detectCardBrand(rawNumber);
  const last4 = rawNumber.slice(-4);

  return {
    valid: true,
    brand,
    last4,
    expMonth,
    expYear: fullYear,
    isStandard4242: rawNumber === STRIPE_TEST_CARDS.STANDARD_SUCCESS,
  };
}

/**
 * Creates a Mock Stripe Payment Intent
 */
export function createMockPaymentIntent({ amount, currency = "usd", metadata = {} }) {
  const intentId = `pi_test_${crypto.randomBytes(12).toString("hex")}`;
  const clientSecret = `${intentId}_secret_${crypto.randomBytes(12).toString("hex")}`;

  const paymentIntent = {
    id: intentId,
    object: "payment_intent",
    amount: Math.round(Number(amount) * 100),
    amount_received: 0,
    currency: currency.toLowerCase(),
    status: "requires_payment_method",
    client_secret: clientSecret,
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    metadata,
  };

  return paymentIntent;
}

/**
 * Confirms a Mock Stripe Payment Intent
 */
export function confirmMockPaymentIntent(paymentIntentId, cardData, billingDetails = {}) {
  const validation = validateStripeSandboxCard(cardData);
  if (!validation.valid) {
    return {
      success: false,
      error: validation,
    };
  }

  const chargeId = `ch_test_${crypto.randomBytes(12).toString("hex")}`;
  const balanceTransactionId = `txn_test_${crypto.randomBytes(12).toString("hex")}`;

  const charge = {
    id: chargeId,
    object: "charge",
    amount_captured: cardData.amount ? Math.round(Number(cardData.amount) * 100) : 0,
    balance_transaction: balanceTransactionId,
    billing_details: {
      address: {
        city: billingDetails.city || "",
        country: billingDetails.country || "US",
        line1: billingDetails.street || "",
        postal_code: billingDetails.zip || "",
        state: billingDetails.state || "",
      },
      email: billingDetails.email || "",
      name: billingDetails.name || `${billingDetails.first_name || ""} ${billingDetails.last_name || ""}`.trim() || "Valued Customer",
      phone: billingDetails.phone || null,
    },
    currency: (cardData.currency || "usd").toLowerCase(),
    paid: true,
    payment_intent: paymentIntentId,
    payment_method_details: {
      card: {
        brand: validation.brand.toLowerCase(),
        last4: validation.last4,
        exp_month: validation.expMonth,
        exp_year: validation.expYear,
        funding: "credit",
        network: validation.brand.toLowerCase(),
      },
      type: "card",
    },
    receipt_url: `https://pay.stripe.com/receipts/test/${paymentIntentId}`,
    status: "succeeded",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  };

  return {
    success: true,
    paymentIntent: {
      id: paymentIntentId,
      object: "payment_intent",
      status: "succeeded",
      charges: { data: [charge] },
    },
    charge,
    cardValidation: validation,
  };
}

/**
 * Saves transaction and order record accurately back into Supabase database schema.
 */
export async function saveOrderAndTransactionToSupabase({
  user,
  userToken,
  items = [],
  billing = {},
  paymentDetails = {},
  totals = {},
}) {
  const { subtotal = 0, shipping = 0, tax = 0, total = 0 } = totals;

  // Build the complete transaction record object
  const transactionRecord = {
    transaction_id: paymentDetails.charge?.id || `txn_${Date.now()}`,
    payment_intent_id: paymentDetails.paymentIntent?.id || `pi_test_${Date.now()}`,
    gateway: "stripe_sandbox",
    payment_method: "stripe",
    card_brand: paymentDetails.cardValidation?.brand || "Visa",
    card_last4: paymentDetails.cardValidation?.last4 || "4242",
    test_card: paymentDetails.cardValidation?.isStandard4242 ? "4242 4242 4242 4242" : "Stripe Test Card",
    amount: Number(total).toFixed(2),
    currency: "USD",
    status: "succeeded",
    paid_at: new Date().toISOString(),
    receipt_url: paymentDetails.charge?.receipt_url || `https://pay.stripe.com/receipts/test/${paymentDetails.paymentIntent?.id}`,
    mock_mode: true,
  };

  // Embed transaction in billing JSON object for complete schema integrity
  const enrichedBilling = {
    ...billing,
    transaction: transactionRecord,
    payment_gateway: "stripe_sandbox",
    stripe_status: "paid",
  };

  // Use user-scoped client if userToken is present, otherwise default
  const supabase = userToken
    ? createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${userToken}` } },
      })
    : defaultSupabase;

  const userId = user?.id || billing.user_id || "00000000-0000-0000-0000-000000000000";

  let savedOrder = null;
  let savedItems = [];
  let supabaseError = null;

  try {
    // 1. Insert order into Supabase 'orders' table
    const orderPayload = {
      user_id: userId,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      tax: Number(tax),
      total: Number(total),
      status: "paid", // Verified Stripe payment
      payment_method: "stripe",
      billing: enrichedBilling,
      notes: `Stripe Sandbox Payment Verified [ID: ${transactionRecord.payment_intent_id} | Card: ${transactionRecord.card_brand} *${transactionRecord.card_last4}]`,
    };

    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .maybeSingle();

    if (orderErr) {
      console.warn("[stripeService] Supabase orders table insert warning:", orderErr.message);
      supabaseError = orderErr.message;
    } else {
      savedOrder = orderData;
    }

    // 2. Insert order items if order was created
    if (savedOrder?.id && items.length > 0) {
      const lineItems = items.map((i) => ({
        order_id: savedOrder.id,
        product_id: typeof i.id === "number" ? i.id : null,
        title: i.title,
        price: Number(i.price),
        qty: Number(i.qty || 1),
        image: i.image,
      }));

      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .insert(lineItems)
        .select();

      if (itemsErr) {
        console.warn("[stripeService] Supabase order_items insert warning:", itemsErr.message);
      } else {
        savedItems = itemsData || [];
      }
    }
  } catch (err) {
    console.error("[stripeService] Supabase persistence exception:", err.message);
    supabaseError = err.message;
  }

  // 3. Fallback: Always record transaction in local persistent audit file
  const auditRecord = {
    order_id: savedOrder?.id || `sandbox_ord_${Date.now()}`,
    created_at: new Date().toISOString(),
    user_id: userId,
    customer_email: billing.email || user?.email || "anonymous@sandbox.test",
    customer_name: `${billing.first_name || ""} ${billing.last_name || ""}`.trim(),
    totals: { subtotal, shipping, tax, total },
    items,
    transaction: transactionRecord,
    supabase_persisted: !!savedOrder?.id,
    supabase_error: supabaseError,
  };

  try {
    let existingLogs = [];
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const raw = fs.readFileSync(TRANSACTIONS_FILE, "utf-8");
      existingLogs = JSON.parse(raw || "[]");
    }
    existingLogs.unshift(auditRecord);
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(existingLogs.slice(0, 100), null, 2), "utf-8");
  } catch (logErr) {
    console.warn("[stripeService] Audit log write failed:", logErr.message);
  }

  return {
    order: savedOrder || {
      id: auditRecord.order_id,
      user_id: userId,
      total,
      status: "paid",
      payment_method: "stripe",
      billing: enrichedBilling,
      created_at: auditRecord.created_at,
    },
    items: savedItems.length > 0 ? savedItems : items,
    transaction: transactionRecord,
    supabase_synced: !!savedOrder?.id,
    supabase_error: supabaseError,
  };
}

/**
 * Reads all stored sandbox transactions
 */
export function getStoredTransactions() {
  try {
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const raw = fs.readFileSync(TRANSACTIONS_FILE, "utf-8");
      return JSON.parse(raw || "[]");
    }
  } catch (err) {
    console.warn("[stripeService] Read transactions error:", err.message);
  }
  return [];
}
