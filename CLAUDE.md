# CLAUDE.md - ACDMY.in

## Project Overview

ACDMY.in is a learning platform for AI-native creators and builders. Built on Next.js 15 + Supabase Auth.

## Infrastructure

| Resource | Value |
|----------|-------|
| Vercel Project | prj_UME0d3JirkvwC1KDbxJWVrm9CD7f |
| Supabase Project | dgfhwqutftavhlujmrwv |
| Domain | acdmy.in |
| Team | LIVIN Media (anthony@livin.in) |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Supabase Auth
- **Database**: Supabase Postgres
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Routes (11 total)

- `/` — Landing page
- `/courses` — Course catalog
- `/courses/[slug]` — Individual course page
- `/courses/[slug]/lessons/[lessonSlug]` — Lesson view
- `/community` — Community features
- `/cam` — CAM AI Instructor chat
- `/login`, `/signup` — Auth flows
- `/dashboard` — User dashboard
- `/profile` — User profile

## Database Schema

### courses
- id, title, slug, description, instructor, thumbnail_url, category, level, duration_hours, price, status

### lessons
- id, course_id, title, slug, content, video_url, order_index, duration_minutes

### users (via Supabase Auth)
- Currently 1 user: anthony@livin.in

## Current State

- **6 courses** created (titles/metadata only)
- **10 lessons** with content
- **4 courses need lessons** added

## CAM AI Instructor

CAM is an AI teaching assistant that helps students navigate courses.

- **Config file**: `cam-agent.yaml` exists in repo
- **Status**: NOT YET DEPLOYED to Anthropic Console
- **Endpoint**: Will be at `/cam` when live

### CAM Agent Config Requirements
```yaml
mcp_servers:
  - type: url
    name: supabase
    url: https://mcp.supabase.com/mcp

tools:
  - agent_toolset_20260401
  - mcp_toolset:
      mcp_server_name: supabase
```

## Pending Work

1. **Resend email integration** — For course notifications, welcome emails
2. **Stripe integration** — Payment processing for paid courses
3. **4 courses need lessons** — Content creation
4. **6 edge functions** — TBD based on requirements
5. **CAM agent deploy** — Push cam-agent.yaml to Anthropic Console

## Development Commands

```bash
# Local development
npm run dev

# Build
npm run build

# Deploy (automatic via Vercel on push to main)
git push origin main
```

## Supabase Commands

```bash
# Generate types
npx supabase gen types typescript --project-id dgfhwqutftavhlujmrwv > types/supabase.ts

# Run migrations
npx supabase db push --project-ref dgfhwqutftavhlujmrwv
```

## Environment Variables

Required in `.env.local` and Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://dgfhwqutftavhlujmrwv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Code Conventions

- Use App Router patterns (layout.tsx, page.tsx, loading.tsx)
- Server Components by default, 'use client' only when needed
- Supabase client via `createServerClient` for server components
- Tailwind for all styling, no CSS modules

## Related Systems

This is part of the LIVIN Media empire. For cross-project context:
- Call `livi_get_context` to check empire state
- Record significant decisions in `livi_memory` on livi-hub
