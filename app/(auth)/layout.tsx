import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SEOIQ — Sign In",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10 font-mono">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-2xl text-primary">◈</span>
          <span className="text-xl font-medium tracking-widest text-foreground">
            SEO<span className="text-primary">IQ</span>
          </span>
        </div>
        <p className="text-xs tracking-widest text-muted-foreground">
          AI-Powered SEO Analysis
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        {children}
      </div>
    </div>
  )
}
