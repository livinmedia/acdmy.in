import CAMChat from "@/components/cam/CAMChat";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "CAM — AI Instructor | ACDMY.in",
  description:
    "Your personal AI instructor. Ask anything about AI, get course recommendations, or have CAM create a course just for you.",
};

export default async function CAMPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const studentId = user?.id;

  return (
    <div className="h-screen bg-[#0a0a10] flex flex-col">
      {/* Nav bar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <a href="/" className="text-white font-bold text-sm tracking-widest">
          ACDMY.in
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/courses"
            className="text-white/40 text-sm hover:text-white transition-colors"
          >
            Courses
          </a>
          <a
            href="/community"
            className="text-white/40 text-sm hover:text-white transition-colors"
          >
            Community
          </a>
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#7c6cf0]/20 to-[#5bbfef]/10 border border-[#7c6cf0]/20 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-semibold text-[#7c6cf0]">
              CAM Online
            </span>
          </div>
        </div>
      </nav>

      {/* Chat takes remaining space */}
      <div className="flex-1 max-w-3xl w-full mx-auto">
        <CAMChat studentId={studentId} />
      </div>
    </div>
  );
}
