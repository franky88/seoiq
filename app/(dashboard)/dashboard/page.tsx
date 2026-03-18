import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  BarChart2,
  TrendingUp,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SEOResult } from "@/types/audit"

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColorClass(score: number): string {
  if (score >= 85) return "text-seoiq-score-excellent"
  if (score >= 70) return "text-seoiq-score-good"
  if (score >= 40) return "text-seoiq-score-warning"
  return "text-seoiq-score-critical"
}

function scoreBadgeClass(score: number): string {
  if (score >= 85)
    return "border-seoiq-score-excellent/40 text-seoiq-score-excellent"
  if (score >= 70) return "border-seoiq-score-good/40 text-seoiq-score-good"
  if (score >= 40)
    return "border-seoiq-score-warning/40 text-seoiq-score-warning"
  return "border-seoiq-score-critical/40 text-seoiq-score-critical"
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 40) return "Needs Work"
  return "Critical"
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect("/login")

  // Fetch profile + plan
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, plan")
    .eq("id", authUser.id)
    .single()

  const plan = profile?.plan ?? "free"
  const isPro = plan === "pro" || plan === "agency"

  // Recent audits
  const { data: recentAudits } = await supabase
    .from("audits")
    .select("id, url, mode, score, created_at, model")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // This month count
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const { count: monthCount } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authUser.id)
    .gte("created_at", startOfMonth.toISOString())

  // All-time count
  const { count: totalCount } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authUser.id)

  // Avg score this month
  const { data: monthAudits } = await supabase
    .from("audits")
    .select("score")
    .eq("user_id", authUser.id)
    .gte("created_at", startOfMonth.toISOString())

  const avgScore =
    monthAudits && monthAudits.length > 0
      ? Math.round(
          monthAudits.reduce((s, a) => s + a.score, 0) / monthAudits.length
        )
      : null

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Good to see you, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your SEO.
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

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Audits This Month",
            value: monthCount ?? 0,
            sub: isPro ? "Unlimited plan" : `of 3 free`,
            cls: "text-seoiq-green",
          },
          {
            label: "Total Audits",
            value: totalCount ?? 0,
            sub: "all time",
            cls: "text-seoiq-info",
          },
          {
            label: "Avg Score",
            value: avgScore !== null ? avgScore : "—",
            sub: "this month",
            cls:
              avgScore !== null
                ? scoreColorClass(avgScore)
                : "text-muted-foreground",
          },
          {
            label: "Plan",
            value: plan.charAt(0).toUpperCase() + plan.slice(1),
            sub: isPro ? "All features unlocked" : "3 audits/mo",
            cls: isPro ? "text-seoiq-green" : "text-muted-foreground",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-5">
              <p className="mb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className={cn("text-3xl font-black", stat.cls)}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/dashboard/audit",
              icon: Search,
              title: "Run SEO Audit",
              desc: "Audit any URL or paste content",
              cls: "border-seoiq-good/20 bg-seoiq-good/5 hover:border-seoiq-good/40",
              iconCls: "text-seoiq-good bg-seoiq-good/10",
            },
            {
              href: "/dashboard/keywords",
              icon: BarChart2,
              title: "Keyword Research",
              desc: "Find opportunities for any topic",
              cls: "border-seoiq-info/20 bg-seoiq-info/5 hover:border-seoiq-info/40",
              iconCls: "text-seoiq-info bg-seoiq-info/10",
            },
            {
              href: "/dashboard/rank",
              icon: TrendingUp,
              title: "Track Rankings",
              desc: "Monitor keyword positions over time",
              cls: "border-seoiq-warning/20 bg-seoiq-warning/5 hover:border-seoiq-warning/40",
              iconCls: "text-seoiq-warning bg-seoiq-warning/10",
            },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5",
                  action.cls
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    action.iconCls
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Recent audits ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Recent Audits
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-seoiq-info hover:text-seoiq-info"
            asChild
          >
            <Link href="/history">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>

        {!recentAudits || recentAudits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="text-4xl text-muted-foreground/20">◈</div>
              <p className="text-sm font-medium text-muted-foreground">
                No audits yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Run your first audit to see results here.
              </p>
              <Button
                size="sm"
                className="mt-2 bg-seoiq-green font-bold text-seoiq-charcoal hover:bg-seoiq-green-dark"
                asChild
              >
                <Link href="/dashboard/audit">Run First Audit →</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {recentAudits.map((audit, i) => (
                <Link
                  key={audit.id}
                  href={`/dashboard/audit/${audit.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  {/* Score */}
                  <div className="shrink-0 text-center">
                    <div
                      className={cn(
                        "text-2xl leading-none font-black",
                        scoreColorClass(audit.score)
                      )}
                    >
                      {audit.score}
                    </div>
                    <div className="mt-0.5 text-[9px] font-bold text-muted-foreground">
                      /100
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-8 bg-border" />

                  {/* URL + meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {audit.url ?? "Pasted content"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelative(audit.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[9px] font-bold tracking-wide",
                      scoreBadgeClass(audit.score)
                    )}
                  >
                    {scoreLabel(audit.score)}
                  </Badge>

                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Upgrade nudge (free plan) ── */}
      {!isPro && (monthCount ?? 0) >= 2 && (
        <Card className="border-seoiq-green/20 bg-seoiq-green/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {(monthCount ?? 0) >= 3
                  ? "You've used all your free audits this month."
                  : "Running low on free audits."}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Upgrade to Pro for unlimited audits, PDF export, and full
                history.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-seoiq-green font-bold text-seoiq-charcoal hover:bg-seoiq-green-dark"
              asChild
            >
              <Link href="/dashboard/settings#billing">Upgrade to Pro →</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
