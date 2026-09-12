import { NextRequest, NextResponse } from "next/server";
import { askOpenAI, ChatMessage } from "@/lib/openai";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
  return NextResponse.json({
    hasServerOpenAiKey: hasKey,
    defaultModel: "gpt-5-mini"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const report = body.report;
    const clientApiKey = body.apiKey;
    const model = body.model;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se proporcionaron mensajes para el chat." },
        { status: 400 }
      );
    }

    const reply = await askOpenAI({
      messages,
      investigationReport: report,
      apiKey: clientApiKey,
      model: model || "gpt-5-mini"
    });

    return NextResponse.json({ success: true, message: reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al comunicarse con el asistente de OpenAI."
      },
      { status: 500 }
    );
  }
}
