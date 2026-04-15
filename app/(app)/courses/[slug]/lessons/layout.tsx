import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import CourseSidebar from "@/components/lessons/CourseSidebar";

export default async function LessonsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; lessonSlug?: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, intro_video_url, intro_video_youtube_id")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, title, slug, sort_order, lesson_type, estimated_minutes")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch completed lessons for progress
  let completedLessonIds: string[] = [];
  if (user) {
    const { data: progress } = await supabase
      .from("course_lesson_progress")
      .select("lesson_id")
      .eq("student_id", user.id)
      .eq("completed", true);
    completedLessonIds = (progress || []).map((p: { lesson_id: string }) => p.lesson_id);
  }

  // Fetch course discussion posts
  const { data: posts } = await supabase
    .from("community_posts")
    .select(
      "id, content, created_at, is_bot, likes_count, comments_count, students:student_id(full_name, avatar_url)"
    )
    .eq("course_id", course.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/courses/${slug}`}
        className="text-sm text-[#55545e] hover:text-[#8a8994] transition-colors mb-6 inline-block"
      >
        &larr; {course.title}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="min-w-0 pb-20 lg:pb-0">{children}</div>
        <CourseSidebar
          course={course}
          lessons={lessons || []}
          completedLessonIds={completedLessonIds}
          posts={(posts as unknown as Array<{
            id: string;
            content: string;
            created_at: string;
            is_bot: boolean;
            likes_count: number;
            comments_count: number;
            students: { full_name: string | null; avatar_url: string | null } | null;
          }>) || []}
          userId={user?.id}
        />
      </div>
    </main>
  );
}
