"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  History,
  BarChart2,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface SidebarProps {
  user: {
    email: string
    full_name?: string | null
    plan: "free" | "pro" | "agency"
    auditsUsed: number
    auditsLimit: number
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/audit", label: "New Audit", icon: Search },
  { href: "/history", label: "Audit History", icon: History },
  { href: "/keywords", label: "Keyword Research", icon: BarChart2 },
  { href: "/rank", label: "Rank Tracker", icon: TrendingUp },
]

const PLAN_META = {
  free: {
    label: "Free",
    cls: "border-seoiq-border-medium text-muted-foreground",
  },
  pro: { label: "Pro", cls: "border-seoiq-green/40 text-seoiq-green" },
  agency: { label: "Agency", cls: "border-seoiq-purple/40 text-seoiq-purple" },
}

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
    active
      ? "bg-seoiq-green/10 text-seoiq-green"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const planMeta = PLAN_META[user.plan]
  const isPro = user.plan === "pro" || user.plan === "agency"
  const usagePct = isPro
    ? 100
    : Math.min((user.auditsUsed / user.auditsLimit) * 100, 100)
  const atLimit = !isPro && user.auditsUsed >= user.auditsLimit

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      {/* ── Logo bar ──
          Layout: ◈ SEOIQ  [FREE]  ··············  [🌙]
          ThemeToggle sits at far right with ml-auto                        */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <span className="text-lg text-seoiq-green">◈</span>
        <span className="font-semibold tracking-wide">
          <span className="text-seoiq-green">SEO</span>
          <span className="text-foreground">IQ</span>
        </span>
        <Badge
          variant="outline"
          className={cn("text-[9px] tracking-widest", planMeta.cls)}
        >
          {planMeta.label.toUpperCase()}
        </Badge>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(active)}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active && "text-seoiq-green")}
              />
              {item.label}
              {active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
              )}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-border" />

      {/* ── Usage meter (free plan only) ── */}
      {!isPro && (
        <div className="px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Monthly Audits
            </span>
            <span
              className={cn(
                "text-[10px] font-bold",
                atLimit ? "text-seoiq-critical" : "text-muted-foreground"
              )}
            >
              {user.auditsUsed} / {user.auditsLimit}
            </span>
          </div>
          <Progress
            value={usagePct}
            className={cn(
              "h-1.5 bg-muted",
              atLimit && "[&>div]:bg-seoiq-critical"
            )}
          />
          {atLimit && (
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Limit reached.{" "}
              <Link
                href="/settings#billing"
                className="text-seoiq-green underline-offset-2 hover:underline"
              >
                Upgrade for unlimited →
              </Link>
            </p>
          )}
        </div>
      )}

      {/* ── Settings + Sign out ── */}
      <div className="space-y-0.5 px-3 pb-4">
        <Link
          href="/settings"
          className={navLinkClass(pathname === "/settings")}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>

      {/* ── User ── */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-seoiq-green/20 text-xs font-bold text-seoiq-green">
            {(user.full_name ?? user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {user.full_name ?? "My Account"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
