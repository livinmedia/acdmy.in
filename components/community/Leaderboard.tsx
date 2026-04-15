import { createClient } from "@/lib/supabase/server";

export default async function Leaderboard() {
  const supabase = await createClient();

  const { data: leaders } = await supabase
    .from("v_student_leaderboard")
    .select("id, full_name, avatar_url, courses_completed, current_streak, score")
    .order("score", { ascending: false })
    .limit(10);

  return (
    <div className="bg-[#111114] border border-[#222228] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <span className="text-base">🏅</span> Top Learners
      </h3>

      {leaders && leaders.length > 0 ? (
        <div className="space-y-3">
          {leaders.map(
            (
              student: {
                id: string;
                full_name: string | null;
                avatar_url: string | null;
                courses_completed: number;
                current_streak: number;
                score: number;
              },
              index: number
            ) => (
              <div key={student.id} className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold w-5 text-center ${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                      ? "text-gray-300"
                      : index === 2
                      ? "text-amber-600"
                      : "text-white/30"
                  }`}
                >
                  {index + 1}
                </span>

                {student.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    className="w-7 h-7 rounded-full object-cover"
                    alt={student.full_name || "Student"}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {student.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate">
                    {student.full_name || "Student"}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {student.courses_completed} courses
                    {student.current_streak > 0 && (
                      <> &middot; 🔥 {student.current_streak}d</>
                    )}
                  </p>
                </div>

                <span className="text-xs font-[family-name:var(--font-jetbrains)] text-[#34d399]">
                  {student.score}
                </span>
              </div>
            )
          )}
        </div>
      ) : (
        <p className="text-xs text-[#55545e] text-center py-4">
          Complete lessons to appear on the leaderboard!
        </p>
      )}
    </div>
  );
}
