import { NextResponse } from "next/server"

export async function GET() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Reply with only: {"status": "ok", "message": "Gemini is working!"}',
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 128 },
      }),
    }
  )

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)"

  return NextResponse.json({ status: res.status, response: text })
}
