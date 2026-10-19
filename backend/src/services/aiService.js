import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
let aiClient = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

const STORE_KNOWLEDGE = `
You are "Rovado Support AI", an intelligent, polite, and helpful customer support specialist for Rovado E-Commerce Tech Mart.
Rovado is NYC's premier IT and tech online store located at 257 Thatcher Road St, Brooklyn, Manhattan, NY 10092.
Hotline 24/7: (025) 3886 25 16 / (+025) 3686 25 16.
Support Email: hello@rovadotechmart.com / contact@Rovadotechmart.com.

Key Policies & Benefits:
- Free shipping on all orders over $199. Standard shipping is $15 for smaller orders.
- 30-Day Money Back Guarantee: Hassle-free returns within 30 days if items are in original condition.
- 100% Secure Payment: We accept Visa, Mastercard, PayPal, American Express, and Discover.
- Warranty: All brand-new laptops, phones, and PC hardware come with a 1-year manufacturer warranty.
- Order Tracking: Customers can track their order via their Profile page under "Order History" or contact support with their Order ID.
- Product Categories: Laptops & Computers, Cell Phones & Tablets, Gaming & VR, PC Components, Cameras, Audio/Sounds.

Tone & Style:
- Always be courteous, concise, and helpful.
- Suggest relevant products or store categories when users ask for recommendations.
- Keep responses clean with concise bullet points if listing options or steps.
`;

// Fallback intelligent responder if GEMINI_API_KEY is not configured
function fallbackResponse(userQuery, products = []) {
  const q = userQuery.toLowerCase().trim();

  if (q.includes("shipping") || q.includes("delivery")) {
    return "🚚 **Shipping Policy**: Rovado offers **Free Shipping on all orders over $199**! For orders under $199, standard shipping is just $15. Orders typically arrive within 2-4 business days.";
  }

  if (q.includes("return") || q.includes("refund") || q.includes("money back")) {
    return "🔄 **30-Day Money-Back Guarantee**: You can return any item within 30 days of purchase for a full refund or exchange, provided it's in its original packaging and condition.";
  }

  if (q.includes("track") || q.includes("order status")) {
    return "📦 **Order Tracking**: You can view the live status of your order anytime in your **Profile > Order History** section, or reply with your Order ID and we'll check it for you!";
  }

  if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("help") || q.includes("human")) {
    return "📞 **Contact Customer Support**:\n- **Hotline 24/7**: (025) 3886 25 16\n- **Email**: hello@rovadotechmart.com\n- **Office**: 257 Thatcher Road St, Brooklyn, Manhattan, NY 10092";
  }

  if (q.includes("laptop") || q.includes("computer") || q.includes("macbook") || q.includes("dell") || q.includes("asus")) {
    const laptopList = products.filter(p => (p.category || "").includes("laptop")).slice(0, 3);
    if (laptopList.length > 0) {
      const items = laptopList.map(p => `• **${p.title}** - $${p.price} (${p.stock === 'in' ? 'In Stock' : 'Limited Stock'})`).join("\n");
      return `💻 Here are top laptops available in our store:\n${items}\n\nVisit our **Laptops & Computers** section to explore full specs and deals!`;
    }
    return "💻 We offer high-performance laptops from Apple, Dell, Lenovo, ASUS, and HP. Check out the **Laptops & Computers** catalog for the latest deals and discounts!";
  }

  if (q.includes("phone") || q.includes("cellphone") || q.includes("iphone") || q.includes("samsung") || q.includes("tablet")) {
    const phoneList = products.filter(p => (p.category || "").includes("cellphone")).slice(0, 3);
    if (phoneList.length > 0) {
      const items = phoneList.map(p => `• **${p.title}** - $${p.price}`).join("\n");
      return `📱 Check out these popular phones and tablets:\n${items}\n\nBrowse our **Cellphones & Tablets** page for the full collection!`;
    }
    return "📱 We carry the newest 5G smartphones and tablets from Apple, Samsung, Google, and more. Visit our **Cellphones & Tablets** section to view current models and offers!";
  }

  if (q.includes("payment") || q.includes("pay") || q.includes("card") || q.includes("paypal")) {
    return "💳 **Secure Payment Methods**: We accept Visa, MasterCard, PayPal, American Express, and Discover. All transactions are protected with end-to-end 256-bit encryption.";
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greetings")) {
    return "👋 Hello and welcome to Rovado Tech Mart! How can I assist you today? I can help with product recommendations, order tracking, shipping details, or technical questions.";
  }

  if (q.includes("discount") || q.includes("sale") || q.includes("coupon") || q.includes("deal")) {
    return "🎉 **Deals & Discounts**: Subscribe to our newsletter at the bottom of the page to get **10% OFF** your first order! Also check out the **Deals of the Day** on our homepage.";
  }

  return "Thank you for reaching out to Rovado Customer Support! I can assist you with product availability, laptops, phones, order tracking, shipping rates, and warranty details. How can I help you find what you need today?";
}

export async function processCustomerMessage({ message, history = [] }) {
  if (!message || typeof message !== "string") {
    throw new Error("Message is required");
  }

  // Fetch quick product context to give accurate real-time inventory knowledge
  let products = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("id, title, category, price, stock, brand")
      .eq("is_active", true)
      .limit(30);
    if (data) products = data;
  } catch (e) {
    // continue without products
  }

  // If Gemini API is available, use gemini-3.8-flash
  if (aiClient) {
    try {
      const inventorySummary = products
        .map(p => `- ${p.title} (Category: ${p.category}, Brand: ${p.brand || 'N/A'}, Price: $${p.price}, Stock: ${p.stock})`)
        .join("\n");

      const systemInstruction = `${STORE_KNOWLEDGE}\n\nCurrent Store Inventory Highlights:\n${inventorySummary}`;

      const interaction = await aiClient.interactions.create({
        model: "gemini-3.8-flash",
        system_instruction: systemInstruction,
        input: message,
      });

      if (interaction.output_text) {
        return {
          reply: interaction.output_text,
          source: "gemini",
        };
      }
    } catch (err) {
      console.warn("[aiService] Gemini API call error, falling back to intelligent knowledge base:", err.message);
    }
  }

  // Knowledge base fallback
  const reply = fallbackResponse(message, products);
  return {
    reply,
    source: "knowledge-base",
  };
}
