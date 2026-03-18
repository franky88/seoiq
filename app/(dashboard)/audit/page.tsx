import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuditForm } from "@/components/audit/AuditForm"

export default async function NewAuditPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", authUser.id)
    .single()

  // Count usage this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authUser.id)
    .gte("created_at", startOfMonth.toISOString())

  const plan = profile?.plan ?? "free"
  const isPro = plan === "pro" || plan === "agency"
  const atLimit = !isPro && (count ?? 0) >= 3

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          New SEO Audit
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit any URL or paste page content against 2024–2025 Google
          standards.
        </p>
      </div>

      {/* Usage warning */}
      {!isPro && (
        <div className="flex items-center justify-between rounded-xl border border-seoiq-border-subtle bg-seoiq-surface px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            <span
              className={
                (count ?? 0 >= 3)
                  ? "font-bold text-seoiq-critical"
                  : "font-semibold text-foreground"
              }
            >
              {count ?? 0} of 3
            </span>{" "}
            free audits used this month
          </span>
          {atLimit && (
            <a
              href="/dashboard/settings#billing"
              className="text-xs font-bold text-seoiq-green hover:underline"
            >
              Upgrade for unlimited →
            </a>
          )}
        </div>
      )}

      {/* Audit form — calls /api/audit server-side, no client API key needed */}
      <AuditForm atLimit={atLimit} isPro={isPro} />
    </div>
  )
}
