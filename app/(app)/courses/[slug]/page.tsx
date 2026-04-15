import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "./EnrollButton";
import CourseResources from "@/components/courses/CourseResources";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  intermediate: "text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20",
  advanced: "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/20",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!course) return { title: "Course Not Found" };
  return { title: `${course.title} — ACDMY.in`, description: course.description };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, description, category, difficulty, estimated_minutes, lesson_count")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, title, slug, sort_order, lesson_type, estimated_minutes, video_youtube_id")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const { data: resources } = await supabase
    .from("course_resources")
    .select("id, title, description, file_url, file_type")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrolled = false;
  if (user) {
    const { data } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    enrolled = !!data;
  }

  const diffColor = DIFFICULTY_COLORS[course.difficulty] ?? DIFFICULTY_COLORS.beginner;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/courses"
        className="text-sm text-[#55545e] hover:text-[#8a8994] transition-colors mb-6 inline-block"
      >
        &larr; All Courses
      </Link>

      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-wider text-[#a78bfa]">
              {course.category}
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${diffColor}`}
            >
              {course.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            {course.title}
          </h1>
          <p className="text-[#8a8994] leading-relaxed">{course.description}</p>
          <div className="flex gap-6 mt-4 font-[family-name:var(--font-jetbrains)] text-xs text-[#55545e]">
            <span>{course.lesson_count} lessons</span>
            <span>~{course.estimated_minutes} min</span>
          </div>
        </div>

        <div className="shrink-0">
          {enrolled ? (
            <div className="bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-sm font-semibold px-6 py-3 rounded-xl">
              Enrolled
            </div>
          ) : (
            <EnrollButton courseId={course.id} isLoggedIn={!!user} />
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white mb-4">Lessons</h2>
        {lessons && lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson, i) => {
              const inner = (
                <div className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-jetbrains)] text-sm text-white/30 w-8 text-right shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors truncate">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40 font-[family-name:var(--font-jetbrains)]">
                      <span>{lesson.lesson_type}</span>
                      {lesson.estimated_minutes && (
                        <span>~{lesson.estimated_minutes} min</span>
                      )}
                      {lesson.video_youtube_id && <span>Video</span>}
                    </div>
                  </div>
                  {enrolled ? (
                    <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white/40 transition-colors shrink-0" />
                  ) : (
                    <svg
                      className="w-4 h-4 text-white/20 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                </div>
              );

              const base =
                "group relative rounded-xl border p-5 transition-all duration-200 cursor-pointer";
              const enrolledStyle = enrolled
                ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                : "border-white/[0.06] bg-white/[0.01] opacity-60";

              return enrolled ? (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  className={`${base} ${enrolledStyle}`}
                >
                  {inner}
                </Link>
              ) : (
                <div key={lesson.id} className={`${base} ${enrolledStyle}`}>
                  {inner}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#55545e]">Lessons coming soon.</p>
        )}
      </div>

      <CourseResources resources={resources || []} />
    </main>
  );
}
