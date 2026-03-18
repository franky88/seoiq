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

  const { keyword, targetUrl, model } = (await req.json()) as {
    keyword: string
    targetUrl: string
    model?: string
  }

  if (!keyword?.trim() || !targetUrl?.trim()) {
    return NextResponse.json(
      { error: "keyword and targetUrl are required" },
      { status: 400 }
    )
  }

  const prompt = `You are an expert SEO analyst. Estimate the current Google search ranking position for the following:

Keyword: "${keyword}"
Target URL / Website: ${targetUrl}

Based on typical competitiveness for this keyword, domain/URL type, current SEO landscape for this niche, and how well a page at this URL would satisfy search intent — provide a realistic estimated ranking position.

Return ONLY valid raw JSON:
{
  "estimatedPosition": <integer 1-100>,
  "positionRange": "<e.g. '3-8' or '15-25'>",
  "reasoning": "<2-3 sentences explaining the estimate>",
  "onPageStrengths": ["<strength 1>", "<strength 2>"],
  "onPageWeaknesses": ["<weakness 1>", "<weakness 2>"],
  "quickFix": "<single most impactful action to improve ranking>",
  "difficulty": "<low|medium|high>",
  "intent": "<informational|navigational|commercial|transactional>"
}`

  try {
    const completion = await groq.chat.completions.create({
      model: model ?? "llama-3.3-70b-versatile",
      max_tokens: 800,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = completion.choices[0]?.message?.content ?? ""
    const clean = raw.replace(/```json|```/g, "").trim()
    const result = JSON.parse(
      clean.substring(clean.indexOf("{"), clean.lastIndexOf("}") + 1)
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error("Rank check error:", e)
    return NextResponse.json({ error: "Rank check failed" }, { status: 500 })
  }
}
