import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/cam";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const DAILY_LIMIT = 20;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sign in to use the playground" },
        { status: 401 }
      );
    }

    const { prompt, lessonContext, lessonId } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: "Prompt too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Rate limit: 20 attempts per student per 24 hours
    const admin = getSupabaseAdmin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("playground_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .gte("created_at", since);

    if ((count || 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `You've reached today's practice limit (${DAILY_LIMIT}/day). Come back tomorrow!`,
        },
        { status: 429 }
      );
    }

    // Log the attempt
    await admin.from("playground_attempts").insert({
      student_id: user.id,
      lesson_id: lessonId || null,
      prompt: prompt.slice(0, 2000),
    });

    // Call Claude
    const contextLine = lessonContext
      ? `they are learning about ${lessonContext}`
      : "they are learning about AI and prompt engineering";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: `You are a helpful AI responding to a student's practice prompt on ACDMY.in, an AI education platform. The student is practicing prompt engineering, so ${contextLine}. Respond naturally and helpfully to their prompt. Keep responses under 300 words.`,
      messages: [{ role: "user", content: prompt.trim() }],
    });

    const reply = response.content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { type: string; text?: string }) => b.text || "")
      .join("\n");

    return NextResponse.json({
      reply,
      remaining: DAILY_LIMIT - (count || 0) - 1,
    });
  } catch (err) {
    console.error("Playground error:", err);
    return NextResponse.json(
      { error: "Playground is having trouble right now. Try again in a sec." },
      { status: 500 }
    );
  }
}
