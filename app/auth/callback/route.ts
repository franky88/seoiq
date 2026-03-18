import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// ── GET /auth/callback ────────────────────────────────────────────────────────
// Handles the OAuth redirect from Google (and magic link confirmations).
// Supabase redirects here after the user authenticates externally.

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)

  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const redirectTo = searchParams.get("redirectTo") ?? next

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure redirect stays on the same origin (prevent open redirect)
      const safeRedirect = redirectTo.startsWith("/")
        ? redirectTo
        : "/dashboard"
      return NextResponse.redirect(`${origin}${safeRedirect}`)
    }
  }

  // Something went wrong — send to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
