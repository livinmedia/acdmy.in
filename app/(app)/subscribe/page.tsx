"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  );
}

function SubscribeContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "true";

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Try again.");
      setLoading(false);
    }
  }

  async function handleManage() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore — button only shows for existing subscribers
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-jetbrains)] text-lg font-medium tracking-tight text-white"
          >
            ACDMY<span className="text-[#a78bfa]">.</span>in
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">
            Unlock everything
          </h1>
          <p className="text-sm text-[#8a8994] mt-2">
            One plan. All courses. AI mentor. Community.
          </p>
        </div>

        {canceled && (
          <div className="mb-6 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3 text-center">
            Checkout was canceled. Ready when you are.
          </div>
        )}

        <div className="bg-gradient-to-b from-[#a78bfa]/[0.06] to-[#60a5fa]/[0.03] border border-[#a78bfa]/25 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#a78bfa] mb-2">
              ACDMY Pro
            </div>
            <div className="text-5xl font-bold text-white">
              $25<span className="text-lg font-normal text-[#8a8994]">/mo</span>
            </div>
            <div className="text-sm text-[#8a8994] mt-2">
              Cancel anytime. New course every day.
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "New course every day (365/year)",
              "Video + text lessons",
              "Interactive exercises & quizzes",
              "AI mentor chat (unlimited)",
              "Community + challenges",
              "Shareable certificates",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-[#8a8994]"
              >
                <span className="text-[#34d399] font-semibold">&#10003;</span>
                {feature}
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-[#a78bfa] hover:bg-[#b99dff] text-[#0a0a10] font-semibold text-sm rounded-xl px-4 py-3.5 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Redirecting to checkout..." : "Subscribe Now"}
          </button>

          <button
            onClick={handleManage}
            className="w-full text-[#55545e] hover:text-[#8a8994] text-xs mt-4 transition-colors"
          >
            Had a subscription before? Manage billing
          </button>
        </div>

        <p className="text-center text-xs text-[#55545e] mt-6">
          Secure payment via Stripe. Cancel anytime in billing settings.
        </p>
      </div>
    </div>
  );
}
