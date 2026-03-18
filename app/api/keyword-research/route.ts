import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { input, inputMode, model } = (await req.json()) as {
    input: string
    inputMode: "url" | "topic"
    model?: string
  }

  if (!input?.trim()) {
    return NextResponse.json({ error: "input is required" }, { status: 400 })
  }

  const prompt = `You are an expert SEO keyword researcher with deep knowledge of search intent, keyword difficulty, and content strategy.

${
  inputMode === "url"
    ? `Analyze the website at this URL and perform comprehensive keyword research: ${input}`
    : `Perform comprehensive keyword research for this topic/niche: "${input}"`
}

Research three distinct keyword categories:
1. PRIMARY keywords — high-value, core terms this page/topic should rank for (5–7 keywords)
2. LONG-TAIL keywords — specific, lower-competition phrase variations with clear intent (6–8 keywords)
3. CONTENT GAP keywords — related terms the page/topic is likely missing or underserving (5–6 keywords)

For each keyword, assess:
- Search intent: informational | navigational | commercial | transactional
- Keyword difficulty: low (0–33) | medium (34–66) | high (67–100) with a numeric score
- Estimated monthly search volume range (e.g. "1K–10K", "100–1K", "10K+", "<100")
- A 1–2 sentence rationale explaining why this keyword matters and how to target it

Return ONLY valid raw JSON — no markdown, no preamble, start with {:
{
  "topic": "<inferred main topic/niche in 3-5 words>",
  "summary": "<2-sentence overview of the keyword landscape and main opportunity>",
  "primaryKeywords": [{"keyword":"","intent":"","difficulty":"","difficultyScore":0,"monthlyVolume":"","type":"primary","rationale":""}],
  "longTailKeywords": [{"keyword":"","intent":"","difficulty":"","difficultyScore":0,"monthlyVolume":"","type":"longtail","rationale":""}],
  "contentGapKeywords": [{"keyword":"","intent":"","difficulty":"","difficultyScore":0,"monthlyVolume":"","type":"gap","rationale":""}],
  "topOpportunity": "<single most actionable keyword opportunity in 1 sentence>",
  "contentStrategy": "<1 paragraph on prioritized content approach based on this keyword set>"
}`

  try {
    const completion = await groq.chat.completions.create({
      model: model ?? "llama-3.3-70b-versatile",
      max_tokens: 3000,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = completion.choices[0]?.message?.content ?? ""
    const clean = raw.replace(/```json|```/g, "").trim()
    const result = JSON.parse(
      clean.substring(clean.indexOf("{"), clean.lastIndexOf("}") + 1)
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error("Keyword research error:", e)
    return NextResponse.json(
      { error: "Keyword research failed" },
      { status: 500 }
    )
  }
}
