// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 }
    )
  }

  const { email } = parsed.data

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from("waitlist").insert({ email })

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation — email already registered
      return NextResponse.json(
        { error: "This email is already on the list." },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
