import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from "lucide-react";
import { sendChatMessage } from "../services/chatService";

const QUICK_SUGGESTIONS = [
  "What is your shipping policy?",
  "What is your return policy?",
  "Can you recommend a laptop?",
  "How can I track my order?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "👋 Hi there! I'm **Rovado Support AI**. How can I help you today with products, shipping, or orders?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        text: m.text,
      }));

      const res = await sendChatMessage(query, history);

      const botMessage = {
        id: "bot-" + Date.now(),
        role: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-err-" + Date.now(),
          role: "assistant",
          text: "I apologize, but I encountered a temporary issue. Please feel free to call our hotline at (025) 3886 25 16 for immediate assistance!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 transition-all duration-200 sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-green-600 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold">
                  Rovado Support AI
                  <Sparkles size={13} className="text-amber-300" />
                </h3>
                <p className="flex items-center gap-1 text-[11px] text-green-100">
                  <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
                  Online • 24/7 IT Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="grid size-8 place-items-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="grid size-7 shrink-0 place-items-center rounded-full bg-green-100 text-green-700">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-white text-stone-800 rounded-tl-none border border-stone-200/60"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`mt-1 block text-[10px] ${
                      m.role === "user" ? "text-green-200" : "text-stone-400"
                    } text-right`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.role === "user" && (
                  <div className="grid size-7 shrink-0 place-items-center rounded-full bg-green-600 text-white">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-green-100 text-green-700">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-stone-200/60 bg-white px-3.5 py-2.5 text-stone-500 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green-600 animate-bounce" />
                    <span className="size-2 rounded-full bg-green-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-2 rounded-full bg-green-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-stone-200 bg-white px-3 py-2 scrollbar-none">
            {QUICK_SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] text-stone-700 transition hover:border-green-600 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 focus-within:border-green-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-green-600">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about products, orders, returns..."
                className="flex-1 bg-transparent text-xs text-stone-800 outline-none placeholder:text-stone-400"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="grid size-7 place-items-center rounded-lg bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-40"
                aria-label="Send Message"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-stone-400">
              Powered by Rovado AI • 24/7 Customer Support
            </p>
          </div>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2 rounded-full bg-green-600 px-4 py-3.5 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-green-700"
        aria-label={isOpen ? "Close Chat" : "Open Customer Support Chat"}
      >
        <span className="relative">
          <MessageCircle size={22} />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
            </span>
          )}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider">
          {isOpen ? "Close" : "AI Support"}
        </span>
      </button>
    </div>
  );
}
