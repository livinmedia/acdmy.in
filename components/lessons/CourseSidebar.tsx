"use client";

import { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import LessonNav from "./LessonNav";
import CourseDiscussion from "./CourseDiscussion";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  lesson_type: string;
  estimated_minutes: number | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  is_bot: boolean;
  likes_count: number;
  comments_count: number;
  students: { full_name: string | null; avatar_url: string | null } | null;
}

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    slug: string;
    intro_video_url: string | null;
    intro_video_youtube_id: string | null;
  };
  lessons: Lesson[];
  completedLessonIds: string[];
  posts: Post[];
  userId?: string | null;
}

export default function CourseSidebar({
  course,
  lessons,
  completedLessonIds,
  posts,
  userId,
}: CourseSidebarProps) {
  const [mobileTab, setMobileTab] = useState<"lessons" | "discussion" | null>(null);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 scrollbar-thin">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">Course progress</span>
              <span className="text-sm font-medium text-white/80">
                {completedLessonIds.length}/{lessons.length}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#34d399] rounded-full transition-all duration-500"
                style={{
                  width: `${lessons.length > 0 ? (completedLessonIds.length / lessons.length) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1.5">
              {lessons.length > 0
                ? `${Math.round((completedLessonIds.length / lessons.length) * 100)}% complete`
                : "No lessons yet"}
            </p>
          </div>

          <VideoPlayer
            videoUrl={course.intro_video_url}
            youtubeId={course.intro_video_youtube_id}
            title={course.title}
          />
          <LessonNav
            lessons={lessons}
            courseSlug={course.slug}
            
            completedLessonIds={completedLessonIds}
          />
          <div className="border-t border-[#222228] pt-4">
            <CourseDiscussion
              courseId={course.id}
              posts={posts}
              userId={userId}
            />
          </div>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {mobileTab && (
          <div className="bg-[#0a0a10] border-t border-[#222228] max-h-[70vh] overflow-y-auto p-4">
            {mobileTab === "lessons" && (
              <LessonNav
                lessons={lessons}
                courseSlug={course.slug}
                
                completedLessonIds={completedLessonIds}
              />
            )}
            {mobileTab === "discussion" && (
              <CourseDiscussion
                courseId={course.id}
                posts={posts}
                userId={userId}
              />
            )}
          </div>
        )}
        <div className="flex bg-[#111114] border-t border-[#222228]">
          <button
            onClick={() => setMobileTab(mobileTab === "lessons" ? null : "lessons")}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileTab === "lessons" ? "text-[#a78bfa]" : "text-[#8a8994]"
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setMobileTab(mobileTab === "discussion" ? null : "discussion")}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileTab === "discussion" ? "text-[#a78bfa]" : "text-[#8a8994]"
            }`}
          >
            Discussion
          </button>
        </div>
      </div>
    </>
  );
}
