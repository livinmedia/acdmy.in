import { createClient } from "@/lib/supabase/server";
import Leaderboard from "@/components/community/Leaderboard";
import CommunityFeed from "@/components/community/CommunityFeed";

export const metadata = {
  title: "Community — ACDMY.in",
  description:
    "Connect with AI builders. Share wins, ask questions, take on weekly challenges.",
};

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: rawPosts } = await supabase
    .from("community_posts")
    .select(
      "id, type, content, likes_count, comments_count, is_bot, bot_name, created_at, students:student_id(full_name)"
    )
    .is("course_id", null)
    .order("created_at", { ascending: false })
    .limit(30);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch which posts the current user has liked
  let likedPostIds = new Set<string>();
  if (user) {
    const { data: likes } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("student_id", user.id);
    likedPostIds = new Set((likes || []).map((l: { post_id: string }) => l.post_id));
  }

  // Flatten student name + liked_by_me into each post
  const posts = (rawPosts || []).map((p) => {
    const student = p.students as unknown as {
      full_name: string | null;
    } | null;
    return {
      id: p.id as string,
      type: p.type as string,
      content: p.content as string,
      likes_count: p.likes_count as number,
      comments_count: p.comments_count as number,
      is_bot: p.is_bot as boolean,
      bot_name: p.bot_name as string | null,
      created_at: p.created_at as string,
      student_name: student?.full_name ?? null,
      liked_by_me: likedPostIds.has(p.id as string),
    };
  });

  const { data: challenges } = await supabase
    .from("community_challenges")
    .select("id, title, emoji, description, goal, points, starts_at, ends_at")
    .eq("active", true)
    .order("starts_at", { ascending: false });

  let userName: string | null = null;
  if (user) {
    const { data: student } = await supabase
      .from("students")
      .select("full_name")
      .eq("id", user.id)
      .single();
    userName = student?.full_name ?? user.email ?? null;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-widest text-[#a78bfa] mb-2">
          Community
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Learn with builders
        </h1>
        <p className="text-[#8a8994] mt-2">
          Share wins, ask questions, take on weekly challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <CommunityFeed
          initialPosts={posts}
          userId={user?.id ?? null}
          userName={userName}
        />

        {/* Sidebar: Leaderboard + Challenges */}
        <aside className="space-y-6">
          <Leaderboard />

          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-base">🎯</span> Active Challenges
          </h2>
          {challenges && challenges.length > 0 ? (
            challenges.map((c) => (
              <div
                key={c.id}
                className="bg-[#111114] border border-[#222228] rounded-xl p-4 hover:border-[#333340] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{c.emoji}</span>
                  <h3 className="text-sm font-semibold text-white">
                    {c.title}
                  </h3>
                </div>
                <p className="text-xs text-[#8a8994] leading-relaxed mb-3">
                  {c.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[#a78bfa]">
                    +{c.points} pts
                  </span>
                  <span className="text-[10px] text-[#55545e]">
                    Ends{" "}
                    {new Date(c.ends_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#55545e]">
              No active challenges right now.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
