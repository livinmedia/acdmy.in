"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/courses";
      router.push(next);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-jetbrains)] text-lg font-medium tracking-tight text-white"
        >
          ACDMY<span className="text-[#a78bfa]">.</span>in
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4">Welcome back</h1>
        <p className="text-sm text-[#8a8994] mt-1">
          Sign in to continue learning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#8a8994] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#111114] border border-[#222228] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#55545e] focus:outline-none focus:border-[#a78bfa] transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8a8994] mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#111114] border border-[#222228] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#55545e] focus:outline-none focus:border-[#a78bfa] transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a78bfa] hover:bg-[#b99dff] text-[#0a0a10] font-semibold text-sm rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-[#55545e] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#a78bfa] hover:text-[#b99dff]">
          Sign up
        </Link>
      </p>
    </div>
  );
}
