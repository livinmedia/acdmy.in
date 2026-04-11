-- ============================================================
-- ACDMY.in — Supabase Schema v2
-- Project: acdmy-production (to be created)
-- No roleplay. No free tier. $25/mo single plan.
-- YouTube unlisted = video CDN. No public courses.
-- LIVIN Media · April 11, 2026
-- ============================================================

-- ============================================================
-- 1. COURSES + LESSONS
-- ============================================================

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,              -- prompt_engineering, ai_agents, business, coding, automation, tools
    difficulty TEXT DEFAULT 'beginner',  -- beginner, intermediate, advanced
    is_published BOOLEAN DEFAULT false,
    cover_image_url TEXT,
    estimated_minutes INT DEFAULT 30,
    lesson_count INT DEFAULT 5,
    youtube_playlist_id TEXT,            -- YouTube playlist grouping this course's lessons
    generated_by TEXT DEFAULT 'campus',  -- 'campus' or 'manual'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published, created_at DESC);

CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    lesson_type TEXT NOT NULL,           -- 'article', 'video', 'quiz', 'exercise'
    interactive_type TEXT,               -- optional secondary type (e.g. article + quiz)
    interactive_config JSONB,            -- questions for quiz, steps for exercise
    content_html TEXT,
    content_markdown TEXT,               -- CAMPUS writes markdown, rendered to HTML
    estimated_minutes INT DEFAULT 5,
    cover_image_url TEXT,
    -- YouTube as CDN (all unlisted)
    video_youtube_id TEXT,               -- unlisted YouTube video ID
    video_duration_seconds INT,
    video_thumbnail_url TEXT,            -- WaveSpeed thumbnail, set as YouTube custom thumb
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lessons_course ON course_lessons(course_id, sort_order);
CREATE UNIQUE INDEX idx_lessons_slug ON course_lessons(course_id, slug);

-- ============================================================
-- 2. STUDENTS
-- ============================================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_status TEXT DEFAULT 'active',   -- active, canceled, past_due
    onboarding_completed BOOLEAN DEFAULT false,
    interests JSONB,                     -- ['prompt_engineering', 'ai_agents']
    learning_goal TEXT,
    courses_completed INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    mentor_welcomed BOOLEAN DEFAULT false,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(plan_status);

-- ============================================================
-- 3. PROGRESS TRACKING
-- ============================================================

CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent NUMERIC DEFAULT 0,
    completed_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, course_id)
);

CREATE TABLE course_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    score NUMERIC,                       -- quiz score if applicable
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_progress_student ON course_lesson_progress(student_id, course_id);

-- ============================================================
-- 4. CERTIFICATIONS
-- ============================================================

CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    course_id UUID REFERENCES courses(id),
    cert_image_url TEXT,
    verification_slug TEXT UNIQUE NOT NULL,
    overall_score NUMERIC,
    issued_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_certs_verify ON certifications(verification_slug);

-- ============================================================
-- 5. COMMUNITY
-- ============================================================

CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    type TEXT DEFAULT 'tip',             -- win, tip, question, showcase
    content TEXT NOT NULL,
    pinned BOOLEAN DEFAULT false,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_bot BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_posts_created ON community_posts(created_at DESC);

CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    content TEXT NOT NULL,
    is_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, student_id)
);

-- ============================================================
-- 6. GAMIFICATION
-- ============================================================

CREATE TABLE community_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    goal INT NOT NULL,
    points INT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE community_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    challenge_id UUID REFERENCES community_challenges(id),
    current_count INT DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, challenge_id)
);

CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    badge_type TEXT NOT NULL,            -- first_course, streak_7, streak_30, helper, top_learner
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, badge_type)
);

-- ============================================================
-- 7. LEADERBOARD VIEW
-- ============================================================

CREATE VIEW v_student_leaderboard AS
SELECT
    s.id,
    s.full_name,
    s.avatar_url,
    s.courses_completed,
    s.current_streak,
    s.longest_streak,
    s.last_active_at,
    COALESCE(s.courses_completed * 50, 0)
        + COALESCE(s.current_streak * 5, 0)
        + COALESCE((SELECT COUNT(*) FROM community_posts WHERE student_id = s.id AND NOT is_bot), 0) * 10
        + COALESCE((SELECT COUNT(*) FROM community_comments WHERE student_id = s.id AND NOT is_bot), 0) * 5
    AS score
FROM students s
WHERE s.plan_status = 'active'
ORDER BY score DESC;

-- ============================================================
-- 8. MENTOR CHAT
-- ============================================================

CREATE TABLE mentor_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    course_id UUID REFERENCES courses(id),
    lesson_id UUID REFERENCES course_lessons(id),
    messages JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentor_student ON mentor_conversations(student_id, updated_at DESC);

-- ============================================================
-- 9. CAMPUS AGENT TRACKING
-- ============================================================

CREATE TABLE campus_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type TEXT NOT NULL,              -- generate_course, generate_video, upload_youtube, nudge_students, issue_cert
    course_id UUID REFERENCES courses(id),
    status TEXT DEFAULT 'started',       -- started, completed, failed, skipped
    metadata JSONB,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- 10. STRIPE CONFIG
-- ============================================================

CREATE TABLE plan_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT UNIQUE NOT NULL,
    price_monthly INT NOT NULL,          -- cents
    stripe_price_id TEXT,
    features JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO plan_config (plan_name, price_monthly, features) VALUES
('pro', 2500, '{"courses": "all", "mentor": true, "community": true, "certificates": true, "exercises": true, "quizzes": true}'::jsonb);

-- ============================================================
-- 11. RLS
-- ============================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Courses + lessons: public read (catalog browsable before paying)
CREATE POLICY "courses_read" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "lessons_read" ON course_lessons FOR SELECT USING (true);

-- Students own their data
CREATE POLICY "students_own" ON students FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "enrollments_own" ON course_enrollments FOR ALL USING (auth.uid()::text = student_id::text);
CREATE POLICY "progress_own" ON course_lesson_progress FOR ALL USING (auth.uid()::text = student_id::text);
CREATE POLICY "mentor_own" ON mentor_conversations FOR ALL USING (auth.uid()::text = student_id::text);

-- Certs: public read (verification URLs)
CREATE POLICY "certs_read" ON certifications FOR SELECT USING (true);

-- Community: everyone reads, own writes
CREATE POLICY "posts_read" ON community_posts FOR SELECT USING (true);
CREATE POLICY "posts_write" ON community_posts FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);
CREATE POLICY "comments_read" ON community_comments FOR SELECT USING (true);
CREATE POLICY "comments_write" ON community_comments FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);
CREATE POLICY "likes_read" ON community_likes FOR SELECT USING (true);
CREATE POLICY "likes_own" ON community_likes FOR ALL USING (auth.uid()::text = student_id::text);

-- Service role bypasses all RLS for CAMPUS agent + edge functions


-- ============================================================
-- 12 tables, 1 view. No roleplay. No free tier.
-- Deploy to acdmy-production Supabase project.
-- ============================================================
