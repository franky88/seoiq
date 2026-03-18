import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BillingPortalButton } from "@/components/dashboard/BillingPortalButton"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    features: [
      "3 audits per month",
      "SEO issue detection",
      "Category score breakdown",
      "Quick wins + insights",
    ],
    badgeCls: "border-seoiq-border-medium text-muted-foreground",
  },
  pro: {
    name: "Pro",
    price: "$29/mo",
    features: [
      "Unlimited audits",
      "Keyword research",
      "Rank tracker",
      "PDF export",
      "Full audit history",
      "All AI models",
    ],
    badgeCls: "border-seoiq-green/40 text-seoiq-green",
  },
  agency: {
    name: "Agency",
    price: "$79/mo",
    features: [
      "Everything in Pro",
      "White-label reports",
      "5 team seats",
      "Priority support",
      "Bulk auditing",
      "API access",
    ],
    badgeCls: "border-seoiq-purple/40 text-seoiq-purple",
  },
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, plan, stripe_subscription_id, created_at")
    .eq("id", authUser.id)
    .single()

  const plan = (profile?.plan ?? "free") as "free" | "pro" | "agency"
  const isPro = plan === "pro" || plan === "agency"
  const planMeta = PLANS[plan]

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and subscription.
        </p>
      </div>

      {/* ── Account ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">
              {profile?.full_name ?? "—"}
            </span>
          </div>
          <Separator className="bg-border" />
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">
              {profile?.email ?? authUser.email}
            </span>
          </div>
          <Separator className="bg-border" />
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium text-foreground">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Billing ── */}
      <Card id="billing">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Billing & Plan
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold tracking-widest",
                planMeta.badgeCls
              )}
            >
              {planMeta.name.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                {planMeta.name} Plan
              </p>
              <p className="text-sm text-muted-foreground">{planMeta.price}</p>
            </div>
            {isPro && profile?.stripe_subscription_id && (
              <BillingPortalButton />
            )}
          </div>

          <div className="space-y-1.5">
            {planMeta.features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-seoiq-good" />
                {f}
              </div>
            ))}
          </div>

          {!isPro && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Upgrade your plan
                </p>
                {(["pro", "agency"] as const).map((p) => (
                  <div
                    key={p}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4",
                      p === "pro"
                        ? "border-seoiq-green/30 bg-seoiq-green/5"
                        : "border-seoiq-border-subtle bg-seoiq-surface"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {PLANS[p].name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {PLANS[p].price}
                        </span>
                        {p === "pro" && (
                          <Badge className="bg-seoiq-green px-2 py-0 text-[9px] font-bold text-seoiq-charcoal">
                            POPULAR
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {PLANS[p].features.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={cn(
                        "shrink-0 text-xs font-bold tracking-wide",
                        p === "pro"
                          ? "bg-seoiq-green text-seoiq-charcoal hover:bg-seoiq-green-dark"
                          : "border border-seoiq-border-medium bg-transparent text-foreground hover:bg-seoiq-surface-raised"
                      )}
                      asChild
                    >
                      <a href={`/api/stripe/checkout?plan=${p}`}>
                        Upgrade <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold tracking-widest text-destructive/70 uppercase">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Delete account
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all audit data. This cannot
                be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs font-bold tracking-wide"
              disabled
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
