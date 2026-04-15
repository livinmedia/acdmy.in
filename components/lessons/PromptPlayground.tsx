"use client";

import { useState } from "react";

interface PromptPlaygroundProps {
  lessonContext?: string;
  lessonId?: string;
}

export default function PromptPlayground({
  lessonContext,
  lessonId,
}: PromptPlaygroundProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runPrompt() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lessonContext, lessonId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResponse(data.reply);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-10 rounded-2xl border border-[#34d399]/20 bg-[#34d399]/[0.03] p-5">
      <h3 className="text-sm font-semibold text-[#34d399] mb-1 flex items-center gap-2">
        <span className="text-base">⚡</span> Try It Now
      </h3>
      <p className="text-xs text-white/50 mb-4">
        Test what you just learned. Write a prompt and see the AI response.
      </p>

      <textarea
        placeholder="Write your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/30 min-h-[100px] resize-y outline-none focus:border-[#34d399]/40 transition-colors"
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-white/30 font-[family-name:var(--font-jetbrains)]">
          {prompt.length}/2000
        </span>
        <button
          onClick={runPrompt}
          disabled={!prompt.trim() || loading || prompt.length > 2000}
          className="px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Running..." : "Run Prompt"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider font-[family-name:var(--font-jetbrains)] text-[#34d399]/70 mb-2">
            AI Response
          </p>
          <div className="text-sm text-white/85 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
