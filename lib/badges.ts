import { createClient } from "@/lib/supabase/client";

export const BADGES: Record<
  string,
  { emoji: string; label: string; description: string }
> = {
  // Milestone
  "first-lesson": {
    emoji: "\uD83C\uDFAF",
    label: "First Step",
    description: "Completed your first lesson",
  },
  "course-complete": {
    emoji: "\uD83C\uDF93",
    label: "Graduate",
    description: "Completed a full course",
  },
  "three-courses": {
    emoji: "\uD83C\uDFC6",
    label: "Triple Threat",
    description: "Completed 3 courses",
  },
  "all-courses": {
    emoji: "\uD83D\uDC51",
    label: "Valedictorian",
    description: "Completed every course",
  },

  // Streaks
  "streak-3": {
    emoji: "\uD83D\uDD25",
    label: "3-Day Streak",
    description: "Learned 3 days in a row",
  },
  "streak-7": {
    emoji: "\u26A1",
    label: "Week Warrior",
    description: "7-day learning streak",
  },
  "streak-30": {
    emoji: "\uD83D\uDC8E",
    label: "Monthly Master",
    description: "30-day learning streak",
  },

  // Community
  "first-post": {
    emoji: "\uD83D\uDCAC",
    label: "Community Voice",
    description: "Made your first community post",
  },
  helpful: {
    emoji: "\uD83E\uDD1D",
    label: "Helpful",
    description: "Received 10+ likes on posts",
  },

  // Special
  "early-adopter": {
    emoji: "\uD83D\uDE80",
    label: "Early Adopter",
    description: "Joined in the first month",
  },
  builder: {
    emoji: "\uD83D\uDEE0\uFE0F",
    label: "Builder",
    description: "Shared a project in the community",
  },
};

export async function checkAndAwardBadges(
  studentId: string
): Promise<string[]> {
  const supabase = createClient();

  // Get student data
  const { data: student } = await supabase
    .from("students")
    .select("courses_completed, current_streak, created_at")
    .eq("id", studentId)
    .single();

  if (!student) return [];

  // Get existing badges
  const { data: existing } = await supabase
    .from("student_badges")
    .select("badge_type")
    .eq("student_id", studentId);

  const earned = new Set(
    (existing || []).map((b: { badge_type: string }) => b.badge_type)
  );
  const toAward: string[] = [];

  // Lesson completions
  const { count: lessonsCompleted } = await supabase
    .from("course_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("completed", true);

  if ((lessonsCompleted ?? 0) >= 1 && !earned.has("first-lesson"))
    toAward.push("first-lesson");

  // Course completions
  const cc = student.courses_completed ?? 0;
  if (cc >= 1 && !earned.has("course-complete"))
    toAward.push("course-complete");
  if (cc >= 3 && !earned.has("three-courses")) toAward.push("three-courses");

  const { count: totalCourses } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  if (
    totalCourses &&
    cc >= totalCourses &&
    !earned.has("all-courses")
  )
    toAward.push("all-courses");

  // Streaks
  const streak = student.current_streak ?? 0;
  if (streak >= 3 && !earned.has("streak-3")) toAward.push("streak-3");
  if (streak >= 7 && !earned.has("streak-7")) toAward.push("streak-7");
  if (streak >= 30 && !earned.has("streak-30")) toAward.push("streak-30");

  // Community posts
  const { count: postCount } = await supabase
    .from("community_posts")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("is_bot", false);

  if ((postCount ?? 0) >= 1 && !earned.has("first-post"))
    toAward.push("first-post");

  // Project shared
  const { count: projectPosts } = await supabase
    .from("community_posts")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .not("project_url", "is", null);

  if ((projectPosts ?? 0) >= 1 && !earned.has("builder"))
    toAward.push("builder");

  // Early adopter
  const isEarly =
    student.created_at &&
    new Date(student.created_at) < new Date("2026-05-15");
  if (isEarly && !earned.has("early-adopter")) toAward.push("early-adopter");

  // Helpful — total likes across all posts >= 10
  const { data: likesData } = await supabase
    .from("community_posts")
    .select("likes_count")
    .eq("student_id", studentId)
    .eq("is_bot", false);
  const totalLikes = (likesData || []).reduce(
    (sum: number, p: { likes_count: number }) => sum + (p.likes_count || 0),
    0
  );
  if (totalLikes >= 10 && !earned.has("helpful")) toAward.push("helpful");

  // Award new badges
  if (toAward.length > 0) {
    await supabase.from("student_badges").insert(
      toAward.map((badge_type) => ({
        student_id: studentId,
        badge_type,
      }))
    );
  }

  return toAward;
}
