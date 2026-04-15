"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkAndAwardBadges } from "@/lib/badges";
import BadgeToast from "@/components/ui/BadgeToast";

interface LessonCompleteButtonProps {
  lessonId: string;
  courseId: string;
  userId: string;
  isCompleted: boolean;
  totalLessons: number;
}

export default function LessonCompleteButton({
  lessonId,
  courseId,
  userId,
  isCompleted: initialCompleted,
  totalLessons,
}: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  async function markComplete() {
    if (completed || loading) return;
    setLoading(true);

    const supabase = createClient();

    // Upsert lesson progress
    const { error: progressErr } = await supabase
      .from("course_lesson_progress")
      .upsert(
        {
          student_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "student_id,lesson_id" }
      );

    if (progressErr) {
      console.error("Failed to mark complete:", progressErr.message);
      setLoading(false);
      return;
    }

    // Update enrollment progress_percent
    const { count } = await supabase
      .from("course_lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId)
      .eq("course_id", courseId)
      .eq("completed", true);

    const percent = totalLessons > 0
      ? Math.round(((count || 0) / totalLessons) * 100)
      : 0;

    await supabase
      .from("course_enrollments")
      .update({ progress_percent: percent })
      .eq("student_id", userId)
      .eq("course_id", courseId);

    // Check and award badges
    const awarded = await checkAndAwardBadges(userId);
    if (awarded.length > 0) setNewBadges(awarded);

    setCompleted(true);
    setLoading(false);
  }

  if (completed) {
    return (
      <>
        <BadgeToast badgeTypes={newBadges} />
        <div className="flex items-center justify-center gap-2 py-3 text-[#34d399] font-medium">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Lesson Complete
        </div>
      </>
    );
  }

  return (
    <button
      onClick={markComplete}
      disabled={loading}
      className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-medium transition-colors disabled:opacity-50"
    >
      {loading ? "Saving..." : "Mark as Complete"}
    </button>
  );
}
