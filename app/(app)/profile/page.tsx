import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BadgeGrid from "@/components/profile/BadgeGrid";

export const metadata = {
  title: "Profile — ACDMY.in",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: student } = await supabase
    .from("students")
    .select(
      "full_name, display_name, avatar_url, bio, courses_completed, current_streak, longest_streak, total_points, community_rank, created_at"
    )
    .eq("id", user.id)
    .single();

  const { data: badges } = await supabase
    .from("student_badges")
    .select("badge_type, earned_at")
    .eq("student_id", user.id)
    .order("earned_at", { ascending: true });

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select(
      "progress_percent, enrolled_at, courses:course_id(title, slug)"
    )
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  const name = student?.display_name || student?.full_name || user.email;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        {student?.avatar_url ? (
          <img
            src={student.avatar_url}
            alt={name || "Profile"}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-xl font-bold text-white shrink-0">
            {(name || "?")[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          {student?.bio && (
            <p className="text-sm text-[#8a8994] mt-1">{student.bio}</p>
          )}
          <div className="flex gap-5 mt-2 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#55545e]">
            <span>{student?.courses_completed ?? 0} courses</span>
            <span>
              🔥 {student?.current_streak ?? 0}d streak
            </span>
            <span>{student?.total_points ?? 0} pts</span>
            {student?.community_rank && (
              <span className="text-[#a78bfa]">{student.community_rank}</span>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-10">
        <BadgeGrid
          earnedBadges={
            (badges as { badge_type: string; earned_at: string }[]) || []
          }
        />
      </div>

      {/* Enrolled courses */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">
          Enrolled Courses
        </h2>
        {enrollments && enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses as unknown as {
                title: string;
                slug: string;
              } | null;
              return (
                <a
                  key={course?.slug}
                  href={`/courses/${course?.slug}`}
                  className="flex items-center gap-4 bg-[#111114] border border-[#222228] rounded-xl px-5 py-4 hover:border-[#333340] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {course?.title}
                    </p>
                    <p className="text-[11px] text-[#55545e] font-[family-name:var(--font-jetbrains)] mt-0.5">
                      Enrolled{" "}
                      {new Date(enrollment.enrolled_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#34d399] rounded-full"
                        style={{
                          width: `${enrollment.progress_percent ?? 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-white/50 font-[family-name:var(--font-jetbrains)] w-8 text-right">
                      {enrollment.progress_percent ?? 0}%
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#55545e]">
            No courses enrolled yet.
          </p>
        )}
      </div>
    </main>
  );
}
