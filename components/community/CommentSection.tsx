"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
  student_name: string | null;
}

interface CommentSectionProps {
  postId: string;
  initialCount: number;
  studentId: string | null;
}

export default function CommentSection({
  postId,
  initialCount,
  studentId,
}: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function loadComments() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("community_comments")
      .select(
        "id, content, is_bot, created_at, students:student_id(full_name)"
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    setComments(
      (data || []).map((c) => {
        const student = (c as Record<string, unknown>).students as {
          full_name: string | null;
        } | null;
        return {
          id: c.id as string,
          content: c.content as string,
          is_bot: c.is_bot as boolean,
          created_at: c.created_at as string,
          student_name: student?.full_name ?? null,
        };
      })
    );
    setExpanded(true);
    setLoading(false);
  }

  async function submitComment() {
    if (!newComment.trim() || !studentId) return;
    const supabase = createClient();

    await supabase.from("community_comments").insert({
      post_id: postId,
      student_id: studentId,
      content: newComment.trim(),
      is_bot: false,
    });

    await supabase
      .from("community_posts")
      .update({ comments_count: count + 1 })
      .eq("id", postId);

    setCount((c) => c + 1);
    setNewComment("");
    loadComments();
  }

  return (
    <div>
      <button
        onClick={expanded ? () => setExpanded(false) : loadComments}
        disabled={loading}
        className="flex items-center gap-1.5 text-[11px] font-[family-name:var(--font-jetbrains)] text-[#55545e] hover:text-[#8a8994] transition-colors"
      >
        {"\uD83D\uDCAC"}{" "}
        {count > 0
          ? `${count} comment${count !== 1 ? "s" : ""}`
          : "Comment"}
      </button>

      {expanded && (
        <div className="mt-3 pl-4 border-l border-white/10 space-y-3">
          {comments.map((c) => (
            <div key={c.id}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/70">
                  {c.is_bot ? "CAM" : c.student_name || "Student"}
                </span>
                <span className="text-[10px] text-white/30">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">{c.content}</p>
            </div>
          ))}

          {studentId && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && submitComment()
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/30 outline-none focus:border-white/20"
              />
              <button
                onClick={submitComment}
                disabled={!newComment.trim()}
                className="px-3 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-medium disabled:opacity-30 transition-colors"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
