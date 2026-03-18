"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignupForm() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/10 p-6 text-center">
        <div className="mb-3 text-3xl">✉️</div>
        <p className="mb-2 text-base font-semibold text-primary">
          Check your email
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to{" "}
          <strong className="text-foreground">{email}</strong>. Click it to
          activate your account.
        </p>
      </div>
    )
  }

  const disabled = loading || googleLoading

  return (
    <div className="flex flex-col gap-4">
      {/* Google */}
      <button
        onClick={handleGoogleSignup}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] tracking-widest text-muted-foreground">
          OR
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Full name */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium tracking-widest text-muted-foreground">
          FULL NAME
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          autoComplete="name"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground transition-all outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium tracking-widest text-muted-foreground">
          EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground transition-all outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium tracking-widest text-muted-foreground">
          PASSWORD{" "}
          <span className="font-normal text-muted-foreground/60">
            (min 8 characters)
          </span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          placeholder="••••••••"
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground transition-all outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {error && (
        <p className="text-xs leading-relaxed text-destructive">⚠ {error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSignup}
        disabled={disabled}
        className="w-full rounded-lg bg-primary py-3 font-mono text-sm font-bold tracking-wide text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "CREATING ACCOUNT..." : "CREATE FREE ACCOUNT →"}
      </button>

      {/* Terms */}
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        By signing up you agree to our{" "}
        <a
          href="/terms"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
