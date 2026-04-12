"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: "https://www.acdmy.in/api/auth/callback",
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/courses");
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
        <h1 className="text-2xl font-bold text-white mt-4">
          Start learning AI
        </h1>
        <p className="text-sm text-[#8a8994] mt-1">
          A new course drops every day. $25/mo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#8a8994] mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full bg-[#111114] border border-[#222228] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#55545e] focus:outline-none focus:border-[#a78bfa] transition-colors"
            placeholder="Jane Smith"
          />
        </div>
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
            minLength={6}
            className="w-full bg-[#111114] border border-[#222228] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#55545e] focus:outline-none focus:border-[#a78bfa] transition-colors"
            placeholder="6+ characters"
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-[#55545e] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#a78bfa] hover:text-[#b99dff]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
