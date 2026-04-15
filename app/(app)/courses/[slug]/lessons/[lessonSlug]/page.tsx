import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("slug", slug)
    .single();

  if (!course) return { title: "Lesson Not Found" };

  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("title")
    .eq("course_id", course.id)
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.title} — ${course.title} — ACDMY.in`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  // Get current lesson
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select(
      "id, title, slug, sort_order, lesson_type, estimated_minutes, content_html, content_markdown, video_youtube_id, interactive_type, sandbox_config"
    )
    .eq("course_id", course.id)
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) notFound();

  // Get prev/next lessons
  const { data: allLessons } = await supabase
    .from("course_lessons")
    .select("title, slug, sort_order")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const currentIndex = allLessons?.findIndex((l) => l.slug === lessonSlug) ?? -1;
  const prevLesson = currentIndex > 0 ? allLessons![currentIndex - 1] : null;
  const nextLesson =
    allLessons && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const LESSON_TYPE_STYLES: Record<string, string> = {
    article: "text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20",
    interactive: "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/20",
  };
  const typeStyle = LESSON_TYPE_STYLES[lesson.lesson_type] ?? LESSON_TYPE_STYLES.article;

  return (
    <article>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${typeStyle}`}
          >
            {lesson.lesson_type}
          </span>
          {lesson.estimated_minutes && (
            <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[#55545e]">
              ~{lesson.estimated_minutes} min
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Lesson video if available */}
      {lesson.video_youtube_id && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${lesson.video_youtube_id}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      )}

      {/* Content */}
      {lesson.content_html ? (
        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-p:text-[#c4c3cc] prose-p:leading-relaxed
            prose-a:text-[#a78bfa] prose-a:no-underline hover:prose-a:underline
            prose-code:text-[#f472b6] prose-code:bg-[#1a1a24] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-[#111114] prose-pre:border prose-pre:border-[#222228] prose-pre:rounded-xl
            prose-strong:text-white
            prose-li:text-[#c4c3cc]
            prose-blockquote:border-[#a78bfa]/30 prose-blockquote:text-[#8a8994]"
          dangerouslySetInnerHTML={{ __html: lesson.content_html }}
        />
      ) : lesson.content_markdown ? (
        <div className="text-sm text-[#c4c3cc] leading-relaxed whitespace-pre-wrap">
          {lesson.content_markdown}
        </div>
      ) : (
        <div className="bg-[#111114] border border-[#222228] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#8a8994]">Lesson content coming soon.</p>
        </div>
      )}

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#222228]">
        {prevLesson ? (
          <Link
            href={`/courses/${slug}/lessons/${prevLesson.slug}`}
            className="group flex flex-col"
          >
            <span className="text-[11px] text-[#55545e] font-[family-name:var(--font-jetbrains)] mb-1">
              &larr; Previous
            </span>
            <span className="text-sm text-[#8a8994] group-hover:text-white transition-colors">
              {prevLesson.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/courses/${slug}/lessons/${nextLesson.slug}`}
            className="group flex flex-col items-end"
          >
            <span className="text-[11px] text-[#55545e] font-[family-name:var(--font-jetbrains)] mb-1">
              Next &rarr;
            </span>
            <span className="text-sm text-[#8a8994] group-hover:text-white transition-colors">
              {nextLesson.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
