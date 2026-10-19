import { Router } from "express";
import { processCustomerMessage } from "../services/aiService.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const result = await processCustomerMessage({ message: message.trim(), history });
    return res.json({
      reply: result.reply,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[chatRoutes] Error processing chat:", error);
    return res.status(500).json({
      error: "Failed to process chat message",
      details: error.message,
    });
  }
});

export default router;
