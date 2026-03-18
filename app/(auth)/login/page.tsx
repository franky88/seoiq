import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = { title: "Sign In — SEOIQ" }

export default function LoginPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your SEOIQ account
        </p>
      </div>
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading...</p>}
      >
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up free
        </Link>
      </p>
    </>
  )
}
