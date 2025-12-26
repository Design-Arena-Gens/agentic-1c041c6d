import { NextRequest, NextResponse } from "next/server";
import { buildChatReply } from "@/lib/analyzer";
import { AnalysisSummary } from "@/lib/types";
import { getAnalysisFromYoutube, YoutubeApiError } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const identifier = (body.channel ?? body.identifier ?? "").trim();
  const question = body.question ? String(body.question) : null;
  const existingAnalysis: AnalysisSummary | undefined = body.analysis;

  try {
    if (question && existingAnalysis) {
      const reply = buildChatReply(question, existingAnalysis);
      return NextResponse.json({ reply });
    }

    if (!identifier) {
      return NextResponse.json(
        { error: "Channel identifier is required." },
        { status: 400 },
      );
    }

    const result = await getAnalysisFromYoutube(identifier);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YoutubeApiError) {
      const status = error.status ?? 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Unexpected error while analyzing channel." },
      { status: 500 },
    );
  }
}

