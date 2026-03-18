import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AuditHistoryTable } from "@/components/dashboard/AuditHistoryTable"
import { Search } from "lucide-react"

export default async function HistoryPage() {
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

  const isPro = profile?.plan === "pro" || profile?.plan === "agency"

  const { data: audits } = await supabase
    .from("audits")
    .select("id, url, mode, score, model, created_at")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Audit History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {audits?.length ?? 0} audit{(audits?.length ?? 0) !== 1 ? "s" : ""}{" "}
            total
          </p>
        </div>
        <Button
          className="bg-seoiq-green font-bold tracking-wide text-seoiq-charcoal hover:bg-seoiq-green-dark"
          asChild
        >
          <Link href="/dashboard/audit">
            <Search className="mr-2 h-4 w-4" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Table */}
      {!audits || audits.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="text-5xl text-muted-foreground/20">◈</div>
            <p className="text-sm font-medium text-muted-foreground">
              No audits yet
            </p>
            <p className="max-w-xs text-xs text-muted-foreground/60">
              Run your first SEO audit to start building your history.
            </p>
            <Button
              size="sm"
              className="mt-2 bg-seoiq-green font-bold text-seoiq-charcoal hover:bg-seoiq-green-dark"
              asChild
            >
              <Link href="/dashboard/audit">Run First Audit →</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <AuditHistoryTable audits={audits} isPro={isPro} />
      )}
    </div>
  )
}
