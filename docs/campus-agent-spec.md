# CAMPUS Agent Spec v2 — ACDMY.in
## Managed Agent · T4 Growth Engine · LIVIN Media
### April 11, 2026

---

## Identity

| Field | Value |
|---|---|
| **Agent** | CAMPUS |
| **Tier** | T4 Growth Engine |
| **Spoke** | ACDMY.in |
| **Model** | Claude Haiku 4.5 (high volume, cost efficiency) |
| **Runtime** | Anthropic Claude Managed Agent |
| **Environment** | production (env_013H9tmvqFsDBerpkZqJ1Mm5) |
| **Vault** | LIVIN Production (vlt_011CZvmCwnyj2c49P5FqQCG2) |

---

## Mission

Generate one complete AI education course every day — video lessons, interactive exercises, quizzes — upload videos to YouTube (unlisted), publish to ACDMY.in. Fully autonomous. No human in the loop for daily operations.

---

## Daily Course Pipeline

### Trigger

pg_cron on acdmy-production, daily at **5:00 AM UTC (10 PM PST)**. Courses are ready by morning.

```sql
SELECT cron.schedule(
    'campus-daily-course',
    '0 5 * * *',
    $$SELECT net.http_post(
        url := 'https://api.anthropic.com/v1/agents/agent_CAMPUS_ID/invoke',
        headers := '{"Authorization": "Bearer <MANAGED_AGENTS_KEY>"}'::jsonb,
        body := '{"action": "generate_course"}'::jsonb
    )$$
);
```

### Step 1 — Topic Selection

Check last 30 days to avoid repeats:

```sql
SELECT title, category FROM courses 
WHERE created_at > NOW() - INTERVAL '30 days' ORDER BY created_at DESC;
```

Category calendar:

| Day | Category | Examples |
|---|---|---|
| Mon | Prompt Engineering | System prompts, chain-of-thought, structured outputs |
| Tue | AI Agents | Tool calling, memory, MCP, multi-agent patterns |
| Wed | Business + AI | Content pipelines, automation, AI products, pricing |
| Thu | AI Tools | Claude, Cursor, v0, Bolt, Replit Agent, Windsurf |
| Fri | Coding with AI | Pair programming, debugging, refactoring, code review |
| Sat | AI Workflows | n8n, Make, Zapier, cron automation, custom pipelines |
| Sun | Deep Dive | Hot topic — new model, API change, technique breakdown |

Perplexity Sonar check for trending AI topics. Merge with calendar category.

### Step 2 — Course Outline

Model: **Claude Haiku 4.5**

Output:
- Title + slug + description + category + difficulty
- 5 lessons, each with title, slug, lesson_type, sort_order, estimated_minutes

Lesson pattern:
1. **Intro article** — What we're building/learning, why it matters
2. **Video walkthrough + exercise** — Screen demo, then hands-on steps
3. **Deeper article + quiz** — Concepts explained, then tested
4. **Video walkthrough + exercise** — Build something real
5. **Assessment quiz** — 8-10 questions, pass to earn certificate

### Step 3 — Lesson Content Generation

For each lesson:

| Type | What CAMPUS Generates |
|---|---|
| **Article** | content_markdown (1000-2000 words). Practical, example-heavy, code blocks. No filler. |
| **Quiz** | interactive_config: 8-10 questions. Mix of multiple choice + short answer. Correct answers + explanations. |
| **Exercise** | interactive_config: 4-6 step checklist. References real tools ("Open Claude, paste this prompt, modify for your use case"). Checkbox validation. |

Cost: **~$0.08/course** (Haiku)

### Step 4 — Video Scripts

Model: **Grok 4.1 Fast** (xAI)

Per video lesson (lessons 2 and 4):
- **Avatar intro** (60-90 seconds): Hook, what you'll learn, why it matters. Direct, no fluff.
- **Voiceover** (5-8 minutes): Screen-share narration walking through the content step by step.

Cost: **~$0.04/course**

### Step 5 — Avatar Video

**ElevenLabs TTS** → MP3 from avatar script (voice_id: `77tWiZAhoF8WyUpL5ola`)
**WaveSpeed InfiniteTalk** → MP3 + avatar photo → talking-head MP4

Only 2 video lessons per course (lessons 2 and 4). Text lessons don't need video.

Cost: **~$1.92/course** (2 lessons × ~$0.96 each)

### Step 6 — Voiceover

**ElevenLabs TTS** → MP3 from voiceover script (same voice)

Cost: **~$0.20/course** (2 lessons × ~$0.10)

### Step 7 — Video Stitch (Modal.com)

**FFmpeg on Modal** combines:
- Avatar intro MP4 (60-90 sec)
- Course slide image (WaveSpeed Ideogram) as background during voiceover
- Voiceover MP3 as audio track

Output: Single MP4 per video lesson.

Cost: **~$0.06/course** (2 FFmpeg jobs)

### Step 8 — Thumbnail

**WaveSpeed Ideogram v3** — Generate course cover image. Dark theme, category-relevant visual.

Also used as YouTube custom thumbnail for each video.

Cost: **~$0.05/course**

### Step 9 — YouTube Upload (Unlisted)

**YouTube Data API v3** (project: `livin-network-prod`)

For each video lesson:
1. Upload MP4
2. Set privacy: **unlisted** (always — no public courses)
3. Set custom thumbnail from Step 8
4. Add to course playlist (auto-create if needed)
5. Capture `video_id`

```javascript
const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
        snippet: {
            title: `${courseTitle} — ${lessonTitle}`,
            description: lessonDescription,
            tags: ['AI', 'learn', category],
        },
        status: {
            privacyStatus: 'unlisted',
            selfDeclaredMadeForKids: false,
        },
    },
    media: { body: fs.createReadStream(videoPath) },
});
```

Cost: **$0**

### Step 10 — Publish to Supabase

Insert course + all 5 lessons to acdmy-production:

```sql
-- Course
INSERT INTO courses (title, slug, description, category, difficulty, 
                     is_published, cover_image_url, estimated_minutes, 
                     lesson_count, youtube_playlist_id, generated_by)
VALUES ($1, $2, $3, $4, $5, true, $6, $7, 5, $8, 'campus');

-- Each lesson (video lessons get youtube_id, text lessons get NULL)
INSERT INTO course_lessons (course_id, title, slug, sort_order, lesson_type, 
                            interactive_type, interactive_config, content_html, 
                            content_markdown, estimated_minutes, 
                            video_youtube_id, video_duration_seconds, video_thumbnail_url)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
```

### Step 11 — Dual-Write to livi-hub

Summary row to `content_index` on livi-hub (wqmersuhdamwwdbebblp). Same pattern as SCRIBE.

### Step 12 — Log

```sql
INSERT INTO campus_runs (run_type, course_id, status, metadata, completed_at)
VALUES ('generate_course', $1, 'completed', $2, now());
```

Metadata includes: tokens_used, cost_breakdown, youtube_ids[], duration_ms.

---

## Secondary Jobs

### Stalled Student Nudge
**Schedule:** Daily 9 AM UTC

Find students with active enrollment, progress > 0%, no activity in 48 hours. Send personalized nudge email via Resend (from learn@acdmy.in). References the specific course and where they left off.

Cost: ~$0.005/nudge (Haiku email) + Resend free tier

### Certificate Issuance
**Trigger:** All 5 lessons completed for a course (check course_lesson_progress).

1. WaveSpeed Ideogram → dark certificate image (student name, course, score, date, verification URL)
2. Upload to `cert-images` storage bucket
3. INSERT into certifications with unique verification_slug
4. Email congratulations via Resend

Cost: ~$0.05/cert

### Weekly Challenge Rotation
**Schedule:** Monday 5 AM UTC

Deactivate expired challenges. Generate 4 new ones:
- Complete a course (50 pts)
- Finish 3 exercises (30 pts)
- Post in community (20 pts)
- 7-day streak (40 pts)

Cost: ~$0.01/week

### Community Bot (MENTOR)
**Schedule:**

| Job | Schedule | Action |
|---|---|---|
| mentor-daily-post | 7 AM PST | Today's new course, active challenges, welcome new members |
| mentor-reply-sweep | Every 6 hours | Reply to unanswered posts |
| mentor-weekly-shoutout | Friday 3 PM PST | Top learner from leaderboard |
| mentor-welcome | Every 4 hours | Welcome new students (mentor_welcomed flag) |

Model: **Grok 4.1 Fast**

Cost: ~$3/mo

---

## Agent Definition

```javascript
const campusAgent = {
    name: "CAMPUS",
    model: "claude-haiku-4-5-20251001",
    system: `You are CAMPUS — the autonomous education engine for ACDMY.in.

MISSION: Generate one complete AI education course every day. Video lessons uploaded to YouTube (unlisted), interactive exercises, quizzes, published to ACDMY.in. Fully autonomous.

DAILY PIPELINE (follow exactly):
1. TOPIC — Check last 30 days for repeats. Follow category calendar. Check Perplexity Sonar for trending AI topics.
2. OUTLINE — 5 lessons. Pattern: intro article → video+exercise → article+quiz → video+exercise → assessment quiz.
3. CONTENT — Generate markdown for each lesson. Exercises with real tool steps. Quizzes that test understanding.
4. VIDEO SCRIPTS — Grok writes avatar intro (60-90s) + voiceover (5-8 min) for video lessons only (lessons 2 and 4).
5. AVATAR — ElevenLabs TTS + WaveSpeed InfiniteTalk for talking-head intros.
6. VOICEOVER — ElevenLabs TTS for screen narration audio.
7. STITCH — FFmpeg on Modal: avatar intro + slide background + voiceover → final MP4.
8. THUMBNAIL — WaveSpeed Ideogram cover image. Also used as YouTube custom thumbnail.
9. YOUTUBE — Upload all video lessons as UNLISTED. Add to playlist. Store video_youtube_id on lesson row.
10. PUBLISH — Insert course + lessons to acdmy-production Supabase. is_published = true.
11. DUAL-WRITE — Summary to livi-hub content_index.
12. LOG — campus_runs with full metadata.

SECONDARY JOBS:
- Stalled students: 48hr no activity → nudge email via Resend
- Certificates: all lessons complete → WaveSpeed cert image → certifications table → email
- Challenges: Monday rotation → deactivate old, create 4 new
- Community bot: daily post, reply sweep, welcome, shoutout (Grok)

CRITICAL RULES:
- No fabricated data. Every claim accurate.
- Content must be practical and actionable.
- Code examples must be runnable.
- Quiz questions test understanding, not memorization.
- ALL YouTube uploads are UNLISTED. No public videos.
- Embed with youtube-nocookie.com for privacy.
- One course per day. Never skip. Never batch.
- Log every run. If any step fails, log status = 'failed' with error.
- Course slugs: lowercase, hyphenated, max 60 chars.`,

    tools: [
        { type: "mcp", server: "https://mcp.supabase.com/mcp", name: "supabase" }
    ],

    credential_vault: {
        SUPABASE_ACDMY_URL: "https://<acdmy-project-id>.supabase.co",
        SUPABASE_ACDMY_KEY: "<service_role_key>",
        SUPABASE_LIVI_HUB_URL: "https://wqmersuhdamwwdbebblp.supabase.co",
        SUPABASE_LIVI_HUB_KEY: "<service_role_key>",
        XAI_API_KEY: "<key_last4_VO6F>",
        PERPLEXITY_API_KEY: "<key>",
        ELEVENLABS_API_KEY: "<key>",
        ELEVENLABS_VOICE_ID: "77tWiZAhoF8WyUpL5ola",
        WAVESPEED_API_KEY: "<key>",
        YOUTUBE_OAUTH_REFRESH: "<refresh_token>",
        YOUTUBE_CLIENT_ID: "<from livin-network-prod>",
        YOUTUBE_CLIENT_SECRET: "<from livin-network-prod>",
        RESEND_API_KEY: "<key>",
        MODAL_TOKEN_ID: "<modal_token>",
        MODAL_TOKEN_SECRET: "<modal_secret>"
    }
};
```

---

## pg_cron Schedule (acdmy-production)

| Job | Schedule | Action |
|---|---|---|
| `campus-daily-course` | `0 5 * * *` | Generate + publish daily course |
| `campus-stalled-nudge` | `0 9 * * *` | Email stalled students |
| `campus-challenge-rotation` | `0 5 * * 1` | Rotate weekly challenges |
| `mentor-daily-post` | `0 14 * * *` | Community morning post |
| `mentor-reply-sweep` | `0 */6 * * *` | Reply to unanswered posts |
| `mentor-weekly-shoutout` | `0 22 * * 5` | Top learner shoutout |
| `mentor-welcome` | `30 */4 * * *` | Welcome new students |

---

## Edge Functions (acdmy-production)

| Function | Purpose | Auth |
|---|---|---|
| `landing-capture` | Email capture → students table | verify_jwt: false |
| `run-quiz` | Score quiz submissions, pass/fail | verify_jwt: true |
| `run-exercise` | Track exercise step completion | verify_jwt: true |
| `mentor-chat` | AI mentor. Context: course + lesson + progress | verify_jwt: true |
| `issue-certification` | WaveSpeed cert image + DB insert + email | verify_jwt: false |
| `mentor-community` | Bot: daily post, reply, welcome, shoutout | verify_jwt: false |

6 edge functions. Down from 8 (removed run-roleplay + score-response).

---

## Monthly Cost (at 100 students)

| Component | Monthly |
|---|---|
| Claude Haiku — course generation (30 courses) | $2.40 |
| Grok — video scripts (60 video lessons) | $1.20 |
| ElevenLabs — avatar intros + voiceovers | $6.50 |
| WaveSpeed InfiniteTalk — avatar videos (60) | $57.60 |
| WaveSpeed Ideogram — thumbnails + certs | $3.00 |
| Modal — FFmpeg stitching (60 jobs) | $2.00 |
| YouTube hosting | $0 |
| Perplexity Sonar — trending topics | $2.00 |
| Resend — nudge + cert emails | $0 |
| Claude Haiku — mentor chat (100 students) | $15.00 |
| Grok — community bot | $3.00 |
| Supabase Pro | $25.00 |
| Managed Agent runtime | $5.00 |
| **TOTAL** | **~$123/mo** |

---

## Revenue Math

| Students | Revenue | Cost | Margin |
|---|---|---|---|
| 5 (break even) | $125 | ~$80 | 36% |
| 50 | $1,250 | ~$100 | 92% |
| 100 | $2,500 | ~$123 | 95% |
| 500 | $12,500 | ~$200 | 98% |
| 1,000 | $25,000 | ~$290 | 99% |

Break even at **5 students**. After that it's almost pure margin because video generation is fixed cost (same 30 courses whether 5 students or 5,000 watch them) and YouTube handles all delivery.

---

## What Got Cut (and why it doesn't matter)

| Cut | Why |
|---|---|
| Free YouTube tier | Simplifies product. One plan, one price. No free/paid content management. Can always add a YouTube channel later for marketing. |
| Roleplay system | Complex to build (3 tables, 2 edge functions, scoring engine). Not core to AI education. Exercises + quizzes cover interactivity. Can add later as a premium feature. |

**What remains is clean:** Daily course with video + text + exercises + quizzes + AI mentor + community + certificates. All for $25/mo. Ships faster, costs less to run.

---

*LIVIN Media · ACDMY.in · CAMPUS Agent Spec v2 · April 11, 2026*
