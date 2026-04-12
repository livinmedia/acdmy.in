import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#0a0a10]/85 backdrop-blur-xl border-b border-[#222228]">
      <Link
        href="/"
        className="font-[family-name:var(--font-jetbrains)] text-base font-medium tracking-tight text-white"
      >
        ACDMY<span className="text-[#a78bfa]">.</span>in
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/courses"
          className="text-sm text-[#8a8994] hover:text-white transition-colors"
        >
          Courses
        </Link>
        <Link
          href="/community"
          className="text-sm text-[#8a8994] hover:text-white transition-colors"
        >
          Community
        </Link>
        <Link
          href="/cam"
          className="text-sm text-[#8a8994] hover:text-white transition-colors"
        >
          CAM
        </Link>

        {user ? (
          <div className="flex items-center gap-2 bg-[#111114] border border-[#222228] rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-[10px] font-bold text-white">
              {user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-xs text-[#8a8994] max-w-[120px] truncate">
              {user.email}
            </span>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-[#0a0a10] bg-[#a78bfa] hover:bg-[#b99dff] px-4 py-1.5 rounded-lg transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
