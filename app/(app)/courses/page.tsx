import { createClient } from "@/lib/supabase/server";
import CourseCard from "@/components/ui/CourseCard";

export const metadata = {
  title: "Courses — ACDMY.in",
  description: "Browse all AI courses. A new one drops every day.",
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "slug, title, description, category, difficulty, lesson_count, estimated_minutes, thumbnail_url"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-widest text-[#a78bfa] mb-2">
          Course Library
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Learn AI. Every day.
        </h1>
        <p className="text-[#8a8994] mt-2 max-w-lg">
          A new hands-on course drops daily. Pick one, do the exercises, earn
          the cert.
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      ) : (
        <p className="text-[#55545e] text-sm">
          No courses published yet. Check back tomorrow.
        </p>
      )}
    </main>
  );
}
