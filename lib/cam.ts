import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (server-side, service role) ───
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Fetch live course catalog from Supabase ───
export async function getCourseCatalog() {
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("id, title, slug, description, category, difficulty, estimated_minutes, lesson_count, is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return courses || [];
}

// ─── Fetch student context ───
export async function getStudentContext(studentId: string) {
  const { data: student } = await supabaseAdmin
    .from("students")
    .select("full_name, interests, learning_goal, courses_completed, current_streak")
    .eq("id", studentId)
    .single();

  const { data: enrollments } = await supabaseAdmin
    .from("course_enrollments")
    .select("course_id, progress_percent, courses:courses(title)")
    .eq("student_id", studentId);

  return { student, enrollments: enrollments || [] };
}

// ─── Build CAM's system prompt ───
export async function buildSystemPrompt(studentId?: string) {
  const courses = await getCourseCatalog();
  let studentContext = "";

  if (studentId) {
    const { student, enrollments } = await getStudentContext(studentId);
    if (student) {
      studentContext = `
CURRENT STUDENT:
- Name: ${student.full_name || "Unknown"}
- Learning goal: ${student.learning_goal || "Not set"}
- Interests: ${JSON.stringify(student.interests || [])}
- Courses completed: ${student.courses_completed || 0}
- Current streak: ${student.current_streak || 0} days
- Currently enrolled in: ${enrollments.map((e: any) => `"${e.courses?.title}" (${e.progress_percent}%)`).join(", ") || "Nothing yet"}
`;
    }
  }

  const catalogStr = courses.length > 0
    ? courses.map((c: any) => `- "${c.title}" [${c.difficulty}] (${c.category}) — ${c.description} | ${c.lesson_count} lessons, ~${c.estimated_minutes}min`).join("\n")
    : "No courses published yet.";

  return `You are CAM, the AI Instructor for ACDMY.in — a platform where a new hands-on AI course drops every single day.

PERSONALITY: You're sharp, current, encouraging, and deeply knowledgeable about all things AI. You speak like a brilliant friend who happens to know everything about AI — not a textbook. You use casual language but precise technical knowledge. You're excited about AI and it shows.

Your name is CAM. If asked, you can say it stands for nothing in particular — it's just your name.

${studentContext}

COURSE CATALOG (${courses.length} published courses):
${catalogStr}

YOUR CAPABILITIES:
1. **Answer AI questions** — You know everything about AI, ML, LLMs, agents, computer vision, NLP, MLOps, and more. Use web search to stay current on the latest developments, papers, and releases.
2. **Recommend courses** — When a student asks about a topic, check if there's a matching course in the catalog. If so, recommend it with enthusiasm and explain why it's relevant to their question.
3. **Create new courses** — If no course exists for what the student needs, tell them you're on it. Generate a FULL course package:
   - Course title and description
   - Category and difficulty level
   - 5-8 lesson modules, each with:
     • Video script outline (key talking points, 3-5 min per lesson)
     • 2 interactive exercises (code challenges, drag-and-drop, fill-in)
     • 1 quiz question with 4 options and explanation
   - Prerequisites and estimated completion time

   When generating a course, wrap the JSON in a \`\`\`cam-course\`\`\` code block so the frontend can parse it:
   \`\`\`cam-course
   {
     "title": "...",
     "description": "...",
     "category": "...",
     "difficulty": "beginner|intermediate|advanced",
     "estimated_minutes": 30,
     "lessons": [
       {
         "title": "...",
         "sort_order": 1,
         "video_script": "...",
         "exercises": [
           { "type": "code_challenge", "prompt": "...", "starter_code": "...", "solution": "..." },
           { "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }
         ],
         "quiz": { "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }
       }
     ]
   }
   \`\`\`

IMPORTANT RULES:
- Always check the catalog FIRST before suggesting a new course
- When recommending existing courses, mention the exact title in quotes
- Personalize recommendations based on the student's interests and progress
- Keep chat responses concise — expand only when generating course content
- For recent AI news, use web search to get current info
- Never make up course titles that don't exist in the catalog — either recommend a real one or create a new one
- Sign off casual messages with — CAM`;
}

// ─── Parse course JSON from CAM's response ───
export function parseCourseFromResponse(text: string) {
  const match = text.match(/```cam-course\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// ─── Save conversation to Supabase ───
export async function saveConversation(
  conversationId: string | null,
  studentId: string,
  messages: any[],
  context: string = "general"
) {
  if (conversationId) {
    const { data } = await supabaseAdmin
      .from("cam_conversations")
      .update({ messages, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .select("id")
      .single();
    return data?.id;
  } else {
    const { data } = await supabaseAdmin
      .from("cam_conversations")
      .insert({
        student_id: studentId,
        messages,
        context,
        title: messages[0]?.content?.slice(0, 80) || "New conversation",
      })
      .select("id")
      .single();
    return data?.id;
  }
}

// ─── Save course draft to Supabase ───
export async function saveCourseDraft(
  studentId: string,
  conversationId: string,
  courseData: any
) {
  const slug = courseData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data } = await supabaseAdmin
    .from("cam_course_drafts")
    .insert({
      requested_by: studentId,
      conversation_id: conversationId,
      title: courseData.title,
      slug,
      description: courseData.description,
      category: courseData.category,
      difficulty: courseData.difficulty,
      estimated_minutes: courseData.estimated_minutes,
      lesson_outline: courseData.lessons.map((l: any) => ({
        title: l.title,
        sort_order: l.sort_order,
      })),
      full_content: courseData,
      status: "draft",
    })
    .select("id")
    .single();

  return data?.id;
}
