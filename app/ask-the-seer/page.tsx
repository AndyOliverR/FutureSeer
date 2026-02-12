"use client";

import { useState, useRef, useEffect } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { useAuth } from "@/hooks/use-auth";

type Message = { role: "user" | "seer"; content: string };

const TYPING_DELAY_MS = 300;

export default function AskTheSeerPage() {
  const { user, userProfile } = useAuth();
  const [thread, setThread] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, isTyping]);

  useEffect(() => {
    return () => {
      if (typingDelayRef.current) clearTimeout(typingDelayRef.current);
    };
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setInput("");
    setIsTyping(false);

    typingDelayRef.current = setTimeout(() => {
      typingDelayRef.current = null;
      setIsTyping(true);
    }, TYPING_DELAY_MS);

    try {
      const res = await fetch("/api/seer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          thread,
          userId: user?.uid ?? undefined,
          birthProfile: userProfile
            ? {
                birthDate: userProfile.birthDate,
                birthTime: userProfile.birthTime,
                birthPlace: userProfile.birthPlace,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setThread((t) => [...t, { role: "user", content: trimmed }, { role: "seer", content: data.error || "The Seer could not respond." }]);
        return;
      }
      setThread(data.thread ?? []);
    } catch {
      setThread((t) => [...t, { role: "user", content: trimmed }, { role: "seer", content: "The vision is unclear. Try again." }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      if (typingDelayRef.current) {
        clearTimeout(typingDelayRef.current);
        typingDelayRef.current = null;
      }
    }
  };

  const clearVision = () => {
    setThread([]);
    setClearMessage("The vision clears. Ask again.");
    setTimeout(() => setClearMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] text-white flex flex-col relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(90, 60, 160, 0.25), transparent 60%)",
        }}
      />
      <TopNavBar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        <div
          className="w-full max-w-2xl relative backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl shadow-[0_0_40px_rgba(255,200,0,0.15)]"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(90, 60, 160, 0.12), transparent 70%), rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300 text-2xl">
              👁
            </div>
          </div>
          <h1 className="text-center text-yellow-400/90 font-medium text-lg mb-4">Ask the Seer</h1>

          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-1">
            {thread.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  msg.role === "user"
                    ? "bg-yellow-600/20 text-yellow-200 border border-yellow-500/30"
                    : "bg-blue-900/20 text-blue-200 border border-blue-500/20 " + (msg.role === "seer" ? "seer-message seer-message-reveal" : "")
                }`}
              >
                {msg.role === "seer" ? (
                  <div className="seer-message">
                    {(msg.content || "")
                      .split(/\n\n+/)
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    {!(msg.content || "").trim() && <p>&#8203;</p>}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isTyping && (
              <div className="seer-typing-glow p-3 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-200/80 text-sm inline-flex items-center gap-1">
                <span className="seer-cursor-blink">▍</span>
              </div>
            )}
            {clearMessage && (
              <div className="text-yellow-400/90 text-sm text-center py-2">✨ {clearMessage}</div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500/50 placeholder:text-white/40"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:pointer-events-none text-black font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>

          <button
            type="button"
            onClick={clearVision}
            className="mt-4 w-full text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            ✨ Clear Vision
          </button>
        </div>
      </main>
    </div>
  );
}
