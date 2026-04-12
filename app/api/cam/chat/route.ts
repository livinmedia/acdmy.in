import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  parseCourseFromResponse,
  saveConversation,
  saveCourseDraft,
} from "@/lib/cam";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, studentId, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Build system prompt with live course catalog + student context
    const systemPrompt = await buildSystemPrompt(studentId);

    // Call Claude with web search enabled
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        } as any,
      ],
    });

    // Extract text from response blocks
    const assistantText = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    // Check if CAM generated a course
    const courseData = parseCourseFromResponse(assistantText);
    let courseDraftId = null;

    // Save conversation
    const allMessages = [
      ...messages,
      { role: "assistant", content: assistantText },
    ];
    const savedConvoId = await saveConversation(
      conversationId,
      studentId,
      allMessages,
      courseData ? "course_creation" : "general"
    );

    // If CAM created a course, save the draft
    if (courseData && studentId && savedConvoId) {
      courseDraftId = await saveCourseDraft(studentId, savedConvoId, courseData);
    }

    return NextResponse.json({
      message: assistantText,
      conversationId: savedConvoId,
      courseDraftId,
      courseData: courseData || null,
    });
  } catch (error: any) {
    console.error("CAM chat error:", error);
    return NextResponse.json(
      { error: "CAM is having trouble right now. Try again in a sec." },
      { status: 500 }
    );
  }
}
