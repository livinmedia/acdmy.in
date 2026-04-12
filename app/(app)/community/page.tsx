import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Community — ACDMY.in",
  description: "Connect with AI builders. Share wins, ask questions, take on weekly challenges.",
};

const TYPE_EMOJI: Record<string, string> = {
  win: "🏆",
  tip: "💡",
  question: "❓",
  showcase: "🚀",
};

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("community_posts")
    .select(
      "id, type, content, likes_count, comments_count, is_bot, created_at, students:student_id(full_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: challenges } = await supabase
    .from("community_challenges")
    .select("id, title, emoji, description, goal, points, starts_at, ends_at")
    .eq("active", true)
    .order("starts_at", { ascending: false });

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
        {/* Posts feed */}
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => {
              const student = post.students as unknown as { full_name: string | null; avatar_url: string | null } | null;
              return (
                <article
                  key={post.id}
                  className="bg-[#111114] border border-[#222228] rounded-2xl p-5 hover:border-[#333340] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {student?.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {student?.full_name ?? "Anonymous"}
                        {post.is_bot && (
                          <span className="ml-1.5 text-[10px] font-medium text-[#a78bfa] bg-[#a78bfa]/10 px-1.5 py-0.5 rounded">
                            BOT
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#55545e]">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-lg">{TYPE_EMOJI[post.type] ?? "💬"}</span>
                  </div>

                  <p className="text-sm text-[#f0eff4] leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex gap-4 mt-3 text-[11px] text-[#55545e] font-[family-name:var(--font-jetbrains)]">
                    <span>{post.likes_count} likes</span>
                    <span>{post.comments_count} comments</span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="bg-[#111114] border border-[#222228] rounded-2xl p-8 text-center">
              <p className="text-2xl mb-2">🌱</p>
              <p className="text-sm text-[#8a8994]">
                No posts yet. Be the first to share something.
              </p>
            </div>
          )}
        </div>

        {/* Challenges sidebar */}
        <aside className="space-y-4">
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
