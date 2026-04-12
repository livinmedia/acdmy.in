"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CAMChatProps {
  studentId?: string;
  compact?: boolean; // true for widget mode, false for full page
}

const SUGGESTIONS = [
  "What's the latest in AI agents?",
  "I want to learn about RAG",
  "Create a course on AI video generation",
  "What course should I start with?",
];

export default function CAMChat({ studentId, compact = false }: CAMChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [courseDraft, setCourseDraft] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/cam/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          studentId,
          conversationId,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
        if (data.conversationId) setConversationId(data.conversationId);
        if (data.courseData) setCourseDraft(data.courseData);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Having trouble connecting right now. Try again? — CAM",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#0a0a10] ${
        compact ? "h-[480px] w-[380px]" : "h-full w-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-white text-sm font-extrabold shadow-[0_0_16px_rgba(124,108,240,0.3)]">
          C
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-bold tracking-wide">
              CAM
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
          </div>
          <span className="text-[11px] text-white/30">
            AI Instructor · ACDMY.in
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 animate-in fade-in slide-in-from-bottom-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-white text-xl font-extrabold shadow-[0_0_30px_rgba(124,108,240,0.2)]">
              C
            </div>
            <div className="text-center">
              <h3 className="text-white text-lg font-bold">Hey, I'm CAM</h3>
              <p className="text-white/35 text-xs mt-1 max-w-[280px] leading-relaxed">
                Ask me anything about AI, get course recs, or I'll build a
                course just for you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/50 text-xs text-left leading-snug hover:bg-[#7c6cf0]/10 hover:border-[#7c6cf0]/30 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-[9px] font-extrabold text-white">
                  C
                </div>
                <span className="text-[10px] font-semibold text-white/30">
                  CAM
                </span>
              </div>
            )}
            <div
              className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#7c6cf0] to-[#6558d4] text-white rounded-2xl rounded-br-sm"
                  : "bg-white/[0.05] border border-white/[0.08] text-white/90 rounded-2xl rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-[9px] font-extrabold text-white">
                C
              </div>
            </div>
            <div className="flex gap-1 py-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#7c6cf0] animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Course draft banner */}
        {courseDraft && (
          <div className="bg-gradient-to-br from-[#7c6cf0]/15 to-[#5bbfef]/10 border border-[#7c6cf0]/25 rounded-xl p-4 mt-2">
            <div className="text-xs font-bold text-[#7c6cf0] uppercase tracking-wider mb-1">
              Course Draft Created
            </div>
            <div className="text-sm font-semibold text-white">
              {courseDraft.title}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {courseDraft.lessons?.length} lessons · {courseDraft.difficulty} ·
              ~{courseDraft.estimated_minutes}min
            </div>
            <div className="text-xs text-white/30 mt-2">
              Saved as draft — pending admin review
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-white/[0.06]">
        <div className="flex items-end gap-2 bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 focus-within:border-[#7c6cf0]/40 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask CAM anything about AI..."
            rows={1}
            className="flex-1 bg-transparent border-none text-white text-sm leading-relaxed resize-none placeholder:text-white/20 focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              input.trim() && !loading
                ? "bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] cursor-pointer"
                : "bg-white/[0.05] cursor-default"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
