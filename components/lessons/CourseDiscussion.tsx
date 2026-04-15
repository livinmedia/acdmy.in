"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkAndAwardBadges } from "@/lib/badges";
import BadgeToast from "@/components/ui/BadgeToast";

interface Post {
  id: string;
  content: string;
  created_at: string;
  is_bot: boolean;
  likes_count: number;
  comments_count: number;
  students: { full_name: string | null; avatar_url: string | null } | null;
}

interface CourseDiscussionProps {
  courseId: string;
  posts: Post[];
  userId?: string | null;
}

export default function CourseDiscussion({
  courseId,
  posts: initialPosts,
  userId,
}: CourseDiscussionProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !userId || submitting) return;

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        student_id: userId,
        course_id: courseId,
        content: content.trim(),
        type: "tip",
        category: "discussion",
      })
      .select(
        "id, content, created_at, is_bot, likes_count, comments_count, students:student_id(full_name, avatar_url)"
      )
      .single();

    if (!error && data) {
      setPosts([data as unknown as Post, ...posts]);
      setContent("");

      // Check for new badges after posting
      const awarded = await checkAndAwardBadges(userId);
      if (awarded.length > 0) setNewBadges(awarded);
    }
    setSubmitting(false);
  }

  return (
    <div>
      <BadgeToast badgeTypes={newBadges} />
      <h3 className="text-sm font-semibold text-white mb-3">Discussion</h3>

      {userId && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask a question or share a tip..."
            rows={2}
            className="w-full bg-[#111114] border border-[#222228] rounded-lg px-3 py-2 text-sm text-white placeholder-[#55545e] resize-none focus:outline-none focus:border-[#a78bfa]/40"
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="mt-2 px-4 py-1.5 text-xs font-medium bg-[#a78bfa] text-white rounded-lg hover:bg-[#9475f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {posts.length > 0 ? (
          posts.map((post) => {
            const student = post.students as {
              full_name: string | null;
              avatar_url: string | null;
            } | null;
            return (
              <div
                key={post.id}
                className="bg-[#111114] border border-[#222228] rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                    {student?.full_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-xs font-medium text-white truncate">
                    {student?.full_name ?? "Anonymous"}
                    {post.is_bot && (
                      <span className="ml-1 text-[9px] text-[#a78bfa] bg-[#a78bfa]/10 px-1 py-0.5 rounded">
                        BOT
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[#55545e] ml-auto shrink-0">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#f0eff4] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-[#55545e] text-center py-4">
            No discussion yet. Start the conversation.
          </p>
        )}
      </div>
    </div>
  );
}
