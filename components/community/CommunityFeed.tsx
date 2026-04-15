"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkAndAwardBadges } from "@/lib/badges";
import BadgeToast from "@/components/ui/BadgeToast";

const CAM_AVATAR =
  "https://dgfhwqutftavhlujmrwv.supabase.co/storage/v1/object/public/cam-assets/cam-photo.png";

const TYPE_EMOJI: Record<string, string> = {
  win: "\uD83C\uDFC6",
  tip: "\uD83D\uDCA1",
  question: "\u2753",
  showcase: "\uD83D\uDE80",
};

interface Post {
  id: string;
  type: string;
  content: string;
  likes_count: number;
  comments_count: number;
  is_bot: boolean;
  bot_name: string | null;
  created_at: string;
  student_name: string | null;
}

interface CommunityFeedProps {
  initialPosts: Post[];
  userId: string | null;
  userName: string | null;
}

export default function CommunityFeed({
  initialPosts,
  userId,
  userName,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  async function handlePost() {
    if (!content.trim() || !userId || submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        student_id: userId,
        content: content.trim(),
        type: "tip",
        category: "discussion",
        is_bot: false,
        bot_name: null,
      })
      .select("id, type, content, likes_count, comments_count, is_bot, bot_name, created_at")
      .single();

    if (!error && data) {
      setPosts([
        { ...data, student_name: userName } as Post,
        ...posts,
      ]);
      setContent("");

      const awarded = await checkAndAwardBadges(userId);
      if (awarded.length > 0) setNewBadges(awarded);
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <BadgeToast badgeTypes={newBadges} />

      {/* Post composer */}
      {userId && (
        <div className="bg-[#111114] border border-[#222228] rounded-2xl p-5">
          <textarea
            placeholder="Share something with the community..."
            className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/30 resize-none border-none outline-none min-h-[80px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handlePost}
              disabled={!content.trim() || submitting}
              className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* Posts feed */}
      {posts.length > 0 ? (
        posts.map((post) => {
          const isBot = !!post.is_bot;
          const authorName = isBot
            ? post.bot_name || "CAM"
            : post.student_name || "Anonymous";

          return (
            <article
              key={post.id}
              className="bg-[#111114] border border-[#222228] rounded-2xl p-5 hover:border-[#333340] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                {isBot ? (
                  <img
                    src={CAM_AVATAR}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {(authorName)[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {authorName}
                    {isBot && (
                      <span className="ml-1.5 text-[10px] font-medium text-[#34d399] bg-[#34d399]/10 px-1.5 py-0.5 rounded">
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
                <span className="text-lg">
                  {TYPE_EMOJI[post.type] ?? "\uD83D\uDCAC"}
                </span>
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
  );
}
