"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  lesson_type: string;
  estimated_minutes: number | null;
}

interface LessonNavProps {
  lessons: Lesson[];
  courseSlug: string;
  completedLessonIds?: string[];
}

export default function LessonNav({
  lessons,
  courseSlug,
  completedLessonIds = [],
}: LessonNavProps) {
  const pathname = usePathname();
  // Extract current lesson slug from path: /courses/{slug}/lessons/{lessonSlug}
  const segments = pathname.split("/");
  const lessonsIdx = segments.indexOf("lessons");
  const currentLessonSlug = lessonsIdx >= 0 ? segments[lessonsIdx + 1] || "" : "";
  return (
    <nav>
      <h3 className="text-sm font-semibold text-white mb-3">Lessons</h3>
      <div className="space-y-1">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.slug === currentLessonSlug;
          const isCompleted = completedLessonIds.includes(lesson.id);

          return (
            <Link
              key={lesson.id}
              href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isCurrent
                  ? "bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-white"
                  : "hover:bg-[#111114] text-[#8a8994] hover:text-white"
              }`}
            >
              <span
                className={`font-[family-name:var(--font-jetbrains)] text-[11px] w-5 text-right shrink-0 ${
                  isCurrent ? "text-[#a78bfa]" : "text-[#55545e]"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 min-w-0 truncate">{lesson.title}</span>
              {isCompleted && (
                <svg
                  className="w-4 h-4 text-[#34d399] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
