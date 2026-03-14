import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export interface TriageResult {
  triageLevel: 1 | 2 | 3 | 4 | 5;
  recommendedDepartment: string;
  clinicalReasoning: string;
  keyConcerns: string[];
  recommendedActions: string[];
}

const SYSTEM_PROMPT = `You are an experienced emergency medicine physician performing patient triage.
Your role is to assess patient symptoms and assign an appropriate triage level based on the Emergency Severity Index (ESI) or similar frameworks.

Triage Levels:
- Level 1 (Immediate/Resuscitation): Life-threatening, requires immediate intervention. Examples: cardiac arrest, major trauma, severe respiratory failure.
- Level 2 (Emergent): High risk situation, severe pain/distress, potential rapid deterioration. Examples: chest pain with cardiac features, stroke symptoms, severe allergic reaction.
- Level 3 (Urgent): Stable but requires multiple resources, moderate severity. Examples: moderate pain, minor head injury, uncomplicated fractures.
- Level 4 (Less Urgent): Stable, low complexity, single resource needed. Examples: minor lacerations, mild infections, routine complaints.
- Level 5 (Non-Urgent): Stable, minimal resources needed, could be seen in primary care. Examples: prescription refills, very minor complaints, administrative issues.

You must respond ONLY with a valid JSON object — no markdown, no code blocks, no extra text. The response must be parseable by JSON.parse().

Response format:
{
  "triageLevel": <number 1-5>,
  "recommendedDepartment": "<department name>",
  "clinicalReasoning": "<detailed clinical reasoning>",
  "keyConcerns": ["<concern 1>", "<concern 2>", ...],
  "recommendedActions": ["<action 1>", "<action 2>", ...]
}`;

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const startTime = Date.now();

  try {
    const { symptoms } = await req.json();

    console.log(`[${requestId}] POST /api/triage — symptoms: ${symptoms?.length ?? 0} chars`);

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim() === "") {
      return NextResponse.json(
        { error: "Symptoms are required" },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Sending to Claude (model: claude-opus-4-6)...`);

    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please triage the following patient presentation:\n\n${symptoms.trim()}`,
        },
      ],
    });

    const message = await stream.finalMessage();
    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log(`[${requestId}] Claude raw response (${rawText.length} chars):\n${rawText}`);
    console.log(`[${requestId}] Usage — input: ${message.usage.input_tokens} tokens, output: ${message.usage.output_tokens} tokens`);

    const result: TriageResult = JSON.parse(rawText);

    // Validate triage level is in range
    if (result.triageLevel < 1 || result.triageLevel > 5) {
      throw new Error("Invalid triage level returned");
    }

    console.log(`[${requestId}] Triage complete — Level ${result.triageLevel}, dept: ${result.recommendedDepartment} (${Date.now() - startTime}ms)`);

    return NextResponse.json({ ...result, _debug: { requestId, durationMs: Date.now() - startTime, inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens } });
  } catch (error) {
    console.error(`[${requestId}] Triage API error (${Date.now() - startTime}ms):`, error);
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid API key. Please check ANTHROPIC_API_KEY." },
        { status: 401 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        { status: 429 }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse triage response. Please try again.", _debug: { requestId, errorDetail: String(error) } },
        { status: 500 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again.", _debug: { requestId, errorDetail: errorMessage, errorType: error?.constructor?.name } },
      { status: 500 }
    );
  }
}
