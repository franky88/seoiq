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

    const completion = await groq.chat.completions.create({
      model: model ?? "llama-3.3-70b-versatile",
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = completion.choices[0]?.message?.content ?? ""
    const clean = raw.replace(/```json|```/g, "").trim()
    const result = JSON.parse(
      clean.substring(clean.indexOf("{"), clean.lastIndexOf("}") + 1)
    ) as unknown as SEOResult

    const { data: audit } = await supabase
      .from("audits")
      .insert({
        user_id: user.id,
        url: url ?? null,
        mode,
        model: model ?? "llama-3.3-70b-versatile",
        result: result as unknown as Json,
        score: result.score,
      })
      .select()
      .single()

    return NextResponse.json({ audit })
  } catch (e) {
    console.error("Audit error:", e)
    return NextResponse.json({ error: "Audit failed" }, { status: 500 })
  }
}
