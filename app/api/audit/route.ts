import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Groq from "groq-sdk"
import { buildSEOPrompt } from "@/lib/prompts"
import type { SEOResult } from "@/types/audit"
import { Json } from "@/types/supabase"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: Infinity,
  agency: Infinity,
}

// --- Gemini fallback via REST ---
async function runGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY not set")

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

// --- Parse raw LLM output to SEOResult ---
function parseResult(raw: string): SEOResult {
  const clean = raw.replace(/```json|```/g, "").trim()
  return JSON.parse(
    clean.substring(clean.indexOf("{"), clean.lastIndexOf("}") + 1)
  ) as unknown as SEOResult
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { url, content, mode, model } = (await req.json()) as {
    url?: string
    content?: string
    mode: "url" | "content"
    model?: string
  }

  if (mode === "url" && !url?.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }
  if (mode === "content" && !content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  // Usage limit check
  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single()

  const plan = profile?.plan ?? "free"
  const limit = PLAN_LIMITS[plan] ?? 3

  if (limit !== Infinity) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from("audits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString())

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        { error: "Monthly audit limit reached. Please upgrade your plan." },
        { status: 429 }
      )
    }
  }

  try {
    const prompt = buildSEOPrompt({ url, content, mode })

    let raw = ""
    let usedModel = model ?? "llama-3.3-70b-versatile"
    let provider: "groq" | "gemini" = "groq"

    // 1. Try Groq first
    try {
      const completion = await groq.chat.completions.create({
        model: usedModel,
        max_tokens: 4096,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      })
      raw = completion.choices[0]?.message?.content ?? ""
    } catch (groqError) {
      // 2. Groq failed — fall back to Gemini
      console.warn("Groq failed, falling back to Gemini:", groqError)
      raw = await runGemini(prompt)
      usedModel = "gemini-2.5-flash-lite"
      provider = "gemini"
    }

    const result = parseResult(raw)

    const { data: audit } = await supabase
      .from("audits")
      .insert({
        user_id: user.id,
        url: url ?? null,
        mode,
        model: usedModel,
        result: result as unknown as Json,
        score: result.score,
      })
      .select()
      .single()

    return NextResponse.json({ audit, provider })
  } catch (e) {
    console.error("Audit error:", e)
    return NextResponse.json({ error: "Audit failed" }, { status: 500 })
  }
}
