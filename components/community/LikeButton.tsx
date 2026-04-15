"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  studentId: string | null;
}

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  studentId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!studentId || busy) return;
    setBusy(true);
    const supabase = createClient();

    if (liked) {
      await supabase
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("student_id", studentId);
      await supabase
        .from("community_posts")
        .update({ likes_count: count - 1 })
        .eq("id", postId);
      setCount((c) => c - 1);
      setLiked(false);
    } else {
      await supabase
        .from("community_likes")
        .insert({ post_id: postId, student_id: studentId });
      await supabase
        .from("community_posts")
        .update({ likes_count: count + 1 })
        .eq("id", postId);
      setCount((c) => c + 1);
      setLiked(true);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggleLike}
      disabled={!studentId}
      className={`flex items-center gap-1.5 text-[11px] font-[family-name:var(--font-jetbrains)] transition-colors ${
        liked
          ? "text-rose-400"
          : "text-[#55545e] hover:text-[#8a8994]"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {liked ? "\u2764\uFE0F" : "\uD83E\uDD0D"}{" "}
      {count > 0 ? count : "Like"}
    </button>
  );
}
