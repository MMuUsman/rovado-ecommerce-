/**
 * Service to communicate with the Rovado AI Support Chatbot backend
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function sendChatMessage(message, history = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      reply: data.reply,
      source: data.source,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[chatService] Backend call failed, using client fallback:", error.message);
    // Intelligent client-side fallback if backend is unreachable
    const fallbackReply = getClientFallbackResponse(message);
    return {
      success: true,
      reply: fallbackReply,
      source: "client-fallback",
      timestamp: new Date().toISOString(),
    };
  }
}

function getClientFallbackResponse(userQuery) {
  const q = (userQuery || "").toLowerCase();
  if (q.includes("shipping") || q.includes("delivery")) {
    return "🚚 **Shipping Policy**: Rovado offers **Free Shipping on all orders over $199**! Standard shipping is $15 for smaller orders.";
  }
  if (q.includes("return") || q.includes("refund")) {
    return "🔄 **30-Day Money-Back Guarantee**: Return any item in its original condition within 30 days of purchase for a 100% full refund.";
  }
  if (q.includes("laptop") || q.includes("computer")) {
    return "💻 Check out our **Laptops & Computers** section for Apple MacBook Pros, Dell XPS, and ASUS gaming laptops with up to 1-year warranty!";
  }
  if (q.includes("phone") || q.includes("tablet")) {
    return "📱 Explore our **Cellphones & Tablets** section for the latest iPhone, Samsung Galaxy, and Google Pixel devices!";
  }
  if (q.includes("track") || q.includes("order")) {
    return "📦 You can track your recent orders anytime under **Profile > Orders**, or contact support with your order ID.";
  }
  if (q.includes("contact") || q.includes("phone")) {
    return "📞 Contact Rovado Support 24/7 at **(025) 3886 25 16** or email **hello@rovadotechmart.com**.";
  }
  return "👋 Hello! I am Rovado Support AI. I can answer questions about shipping, returns, laptops, cell phones, warranties, or store orders. How can I help you?";
}
