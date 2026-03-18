import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import SignupForm from "@/components/auth/SignupForm"

export const metadata: Metadata = { title: "Create Account — SEOIQ" }

export default function SignupPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-foreground">
          Start for free
        </h1>
        <p className="text-sm text-muted-foreground">
          3 free audits per month — no credit card required
        </p>
      </div>
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading...</p>}
      >
        <SignupForm />
      </Suspense>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
