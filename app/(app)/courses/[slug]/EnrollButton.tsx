"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EnrollButton({
  courseId,
  isLoggedIn,
}: {
  courseId: string;
  isLoggedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    await supabase.from("course_enrollments").insert({
      student_id: user.id,
      course_id: courseId,
      progress_percent: 0,
    });

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="bg-[#a78bfa] hover:bg-[#b99dff] text-[#0a0a10] font-semibold text-sm rounded-xl px-6 py-3 transition-all hover:-translate-y-0.5 disabled:opacity-50"
    >
      {loading ? "Enrolling..." : isLoggedIn ? "Enroll Now" : "Sign In to Enroll"}
    </button>
  );
}
