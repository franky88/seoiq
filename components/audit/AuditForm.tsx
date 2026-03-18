"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  XCircle,
  FileText,
  Zap,
  Settings2,
  AlignLeft,
  Code2,
  Smartphone,
  Link2,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  SEOResult,
  Issue,
  IssueType,
  TitleMetaAnalysis,
  ContentQuality,
  CoreWebVitals,
  TechnicalSEO,
  OnPageStructure,
  SchemaMarkup,
  MobileUsability,
  BacklinkProfile,
  CompetitorGap,
} from "@/types/audit"

// ── Types ─────────────────────────────────────────────────────────────────────

type InputMode = "url" | "content"
type FilterType = "all" | "critical" | "warning" | "good" | "info"

interface AuditFormProps {
  atLimit: boolean
  isPro: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", badge: "BEST" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", badge: "FAST" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", badge: "FREE" },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    label: "Llama 4 Scout 17B",
    badge: "NEW",
  },
]

const ISSUE_CONFIG: Record<
  IssueType,
  {
    icon: React.ElementType
    cls: string
    borderCls: string
    badgeCls: string
    label: string
  }
> = {
  critical: {
    icon: XCircle,
    cls: "text-seoiq-critical",
    borderCls: "border-l-seoiq-critical",
    badgeCls: "border-seoiq-critical/40 text-seoiq-critical",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    cls: "text-seoiq-warning",
    borderCls: "border-l-seoiq-warning",
    badgeCls: "border-seoiq-warning/40 text-seoiq-warning",
    label: "Warning",
  },
  good: {
    icon: CheckCircle2,
    cls: "text-seoiq-good",
    borderCls: "border-l-seoiq-good",
    badgeCls: "border-seoiq-good/40 text-seoiq-good",
    label: "Good",
  },
  info: {
    icon: Info,
    cls: "text-seoiq-info",
    borderCls: "border-l-seoiq-info",
    badgeCls: "border-seoiq-info/40 text-seoiq-info",
    label: "Info",
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreHex(score: number): string {
  // SVG stroke — static hex (documented exception)
  if (score >= 85) return "#0FA968"
  if (score >= 70) return "#EAB308"
  if (score >= 40) return "#F97316"
  return "#EF4444"
}

function scoreColorClass(score: number): string {
  if (score >= 85) return "text-seoiq-score-excellent"
  if (score >= 70) return "text-seoiq-score-good"
  if (score >= 40) return "text-seoiq-score-warning"
  return "text-seoiq-score-critical"
}

function scoreLabel(score: number): string {
  if (score >= 85) return "EXCELLENT"
  if (score >= 70) return "GOOD"
  if (score >= 40) return "NEEDS WORK"
  return "CRITICAL"
}

function scoreBadgeClass(score: number): string {
  if (score >= 85)
    return "border-seoiq-score-excellent/40 text-seoiq-score-excellent"
  if (score >= 70) return "border-seoiq-score-good/40 text-seoiq-score-good"
  if (score >= 40)
    return "border-seoiq-score-warning/40 text-seoiq-score-warning"
  return "border-seoiq-score-critical/40 text-seoiq-score-critical"
}

function VerdictBadge({
  verdict,
  label,
}: {
  verdict: IssueType
  label?: string
}) {
  const cfg = ISSUE_CONFIG[verdict]
  return (
    <Badge
      variant="outline"
      className={cn("text-[9px] font-bold tracking-wide", cfg.badgeCls)}
    >
      {label ?? cfg.label}
    </Badge>
  )
}

function StatusDot({ verdict }: { verdict: IssueType }) {
  const cls: Record<IssueType, string> = {
    critical: "bg-seoiq-critical",
    warning: "bg-seoiq-warning",
    good: "bg-seoiq-good",
    info: "bg-seoiq-info",
  }
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", cls[verdict])}
    />
  )
}

function CheckRow({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-2 text-sm">
      {pass ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-seoiq-good" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-seoiq-critical" />
      )}
      <span className="text-foreground">{label}</span>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  score,
  verdict,
}: {
  icon: React.ElementType
  title: string
  score?: number
  verdict?: IssueType
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {score !== undefined && (
          <span className={cn("text-lg font-black", scoreColorClass(score))}>
            {score}
          </span>
        )}
        {verdict && <VerdictBadge verdict={verdict} />}
      </div>
    </div>
  )
}

// ── Score Ring ─────────────────────────────────────────────────────────────────

const ScoreRing = ({ score }: { score: number }) => {
  const r = 52,
    circ = 2 * Math.PI * r,
    dash = (score / 100) * circ
  const color = scoreHex(score)
  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      <circle
        cx="68"
        cy="68"
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="10"
      />
      <circle
        cx="68"
        cy="68"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 68 68)"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
      <text
        x="68"
        y="63"
        textAnchor="middle"
        fill={color}
        fontSize="30"
        fontWeight="900"
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x="68"
        y="82"
        textAnchor="middle"
        fill="#6b7280"
        fontSize="11"
        fontFamily="inherit"
      >
        / 100
      </text>
    </svg>
  )
}

// ── IssueCard ──────────────────────────────────────────────────────────────────

const IssueCard = ({ issue, index }: { issue: Issue; index: number }) => {
  const [open, setOpen] = useState(false)
  const cfg = ISSUE_CONFIG[issue.type] ?? ISSUE_CONFIG.info
  const Icon = cfg.icon
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={cn(
          "mb-2 cursor-pointer border-l-4 transition-all duration-200",
          cfg.borderCls,
          open && "bg-muted/30"
        )}
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <CollapsibleTrigger asChild>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Icon className={cn("h-4 w-4 shrink-0", cfg.cls)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{issue.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {issue.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("text-xs", cfg.badgeCls)}
                >
                  {cfg.label}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Separator className="mb-3" />
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {issue.description}
            </p>
            {issue.fix && (
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-1 text-xs font-bold tracking-widest text-seoiq-info uppercase">
                  ▶ How to Fix
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {issue.fix}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ── Section components ─────────────────────────────────────────────────────────

function TitleMetaSection({
  data,
  score,
}: {
  data: TitleMetaAnalysis
  score: number
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={FileText}
        title="Title & Meta Description"
        score={score}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Title Tag
              </span>
              <VerdictBadge verdict={data.titleVerdict} />
            </div>
            <p className="mb-2 rounded bg-muted px-3 py-2 text-sm font-medium">
              {data.titleTag || "Not detected"}
            </p>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{data.titleLength} chars</span>
              <span
                className={cn(
                  data.titleLength >= 50 && data.titleLength <= 60
                    ? "text-seoiq-good"
                    : "text-seoiq-warning"
                )}
              >
                {data.titleLength < 50
                  ? "Too short"
                  : data.titleLength > 60
                    ? "Too long"
                    : "✓ Optimal"}
              </span>
            </div>
            <Progress
              value={Math.min((data.titleLength / 60) * 100, 110)}
              className={cn(
                "h-1.5 bg-muted",
                data.titleLength > 60
                  ? "[&>div]:bg-seoiq-warning"
                  : "[&>div]:bg-seoiq-good"
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Meta Description
              </span>
              <VerdictBadge verdict={data.metaVerdict} />
            </div>
            <p className="mb-2 rounded bg-muted px-3 py-2 text-sm leading-relaxed font-medium">
              {data.metaDescription || "Not detected"}
            </p>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{data.metaLength} chars</span>
              <span
                className={cn(
                  data.metaLength >= 120 && data.metaLength <= 160
                    ? "text-seoiq-good"
                    : "text-seoiq-warning"
                )}
              >
                {data.metaLength < 120
                  ? "Too short"
                  : data.metaLength > 160
                    ? "Too long"
                    : "✓ Optimal"}
              </span>
            </div>
            <Progress
              value={Math.min((data.metaLength / 160) * 100, 110)}
              className={cn(
                "h-1.5 bg-muted",
                data.metaLength > 160
                  ? "[&>div]:bg-seoiq-warning"
                  : "[&>div]:bg-seoiq-good"
              )}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Keyword Presence
          </p>
          <div className="grid grid-cols-2 gap-x-4">
            <CheckRow label="Keyword in title" pass={data.titleHasKeyword} />
            <CheckRow label="Keyword in meta" pass={data.metaHasKeyword} />
          </div>
          {data.suggestions.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              {data.suggestions.map((s, i) => (
                <p
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="shrink-0 text-seoiq-info">→</span>
                  {s}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ContentSection({
  data,
  score,
}: {
  data: ContentQuality
  score: number
}) {
  const eeeatLabels: Record<keyof typeof data.eeeatSignals, string> = {
    experience: "Experience",
    expertise: "Expertise",
    authoritativeness: "Authoritativeness",
    trustworthiness: "Trustworthiness",
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={AlignLeft}
        title="Content Quality & E-E-A-T"
        score={score}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-black text-seoiq-green">
              {data.estimatedWordCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Est. Word Count
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-2 text-[9px] capitalize",
                data.contentDepth === "comprehensive"
                  ? "border-seoiq-good/40 text-seoiq-good"
                  : data.contentDepth === "moderate"
                    ? "border-seoiq-warning/40 text-seoiq-warning"
                    : "border-seoiq-critical/40 text-seoiq-critical"
              )}
            >
              {data.contentDepth}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p
              className={cn(
                "text-3xl font-black",
                scoreColorClass(data.readabilityScore)
              )}
            >
              {data.readabilityScore}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Readability Score
            </p>
            <Badge variant="outline" className="mt-2 text-[9px] capitalize">
              {data.readabilityLevel}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="mb-2 flex justify-center">
              <VerdictBadge
                verdict={data.uniquenessSignal}
                label="Uniqueness"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Content Originality Signal
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            E-E-A-T Signals
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              Object.entries(data.eeeatSignals) as [
                keyof typeof data.eeeatSignals,
                IssueType,
              ][]
            ).map(([key, verdict]) => (
              <div
                key={key}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-center"
              >
                <StatusDot verdict={verdict} />
                <span className="text-xs font-medium">{eeeatLabels[key]}</span>
                <VerdictBadge verdict={verdict} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.notes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function CWVSection({ data, score }: { data: CoreWebVitals; score: number }) {
  const metrics = [
    {
      key: "lcp" as const,
      label: "LCP",
      desc: "Largest Contentful Paint",
      good: "≤ 2.5s",
      poor: "> 4.0s",
    },
    {
      key: "inp" as const,
      label: "INP",
      desc: "Interaction to Next Paint",
      good: "≤ 200ms",
      poor: "> 500ms",
    },
    {
      key: "cls" as const,
      label: "CLS",
      desc: "Cumulative Layout Shift",
      good: "≤ 0.1",
      poor: "> 0.25",
    },
  ]
  const estClass: Record<string, string> = {
    good: "text-seoiq-good border-seoiq-good/40",
    "needs-improvement": "text-seoiq-warning border-seoiq-warning/40",
    poor: "text-seoiq-critical border-seoiq-critical/40",
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Zap}
        title="Core Web Vitals"
        score={score}
        verdict={data.overallVerdict}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.key}>
            <CardContent className="pt-4 pb-4 text-center">
              <p
                className={cn(
                  "text-2xl font-black",
                  estClass[data[m.key].estimate]?.split(" ")[0]
                )}
              >
                {m.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-2 text-[9px] capitalize",
                  estClass[data[m.key].estimate]
                )}
              >
                {data[m.key].estimate.replace("-", " ")}
              </Badge>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {data[m.key].notes}
              </p>
              <div className="mt-2 flex justify-center gap-2 text-[9px] text-muted-foreground">
                <span className="text-seoiq-good">Good {m.good}</span>·
                <span className="text-seoiq-critical">Poor {m.poor}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.summary}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TechnicalSection({
  data,
  score,
}: {
  data: TechnicalSEO
  score: number
}) {
  const checks = [
    { label: "HTTPS / SSL", pass: data.https },
    { label: "Canonical tag", pass: data.canonicalPresent },
    { label: "Robots indexable", pass: data.robotsIndexable },
    { label: "Sitemap present", pass: data.sitemapLikely },
    { label: "Hreflang configured", pass: data.hreflang },
    { label: "Mobile-friendly", pass: data.mobileFriendly },
  ]
  return (
    <div className="space-y-4">
      <SectionHeader icon={Settings2} title="Technical SEO" score={score} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-4 pb-2">
            <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Checklist
            </p>
            <Separator className="mb-1" />
            {checks.map((c) => (
              <CheckRow key={c.label} label={c.label} pass={c.pass} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Page Speed Signals
            </p>
            <Separator className="mb-1" />
            {(
              Object.entries(data.pageSpeedSignals) as [string, IssueType][]
            ).map(([key, verdict]) => (
              <div
                key={key}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusDot verdict={verdict} />
                  <VerdictBadge verdict={verdict} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {data.issues.length > 0 && (
        <Card className="border-seoiq-critical/20 bg-seoiq-critical/5">
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-bold tracking-widest text-seoiq-critical uppercase">
              Issues Found
            </p>
            <ul className="space-y-1.5">
              {data.issues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-seoiq-critical" />
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {data.passing.length > 0 && (
        <Card className="border-seoiq-good/20 bg-seoiq-good/5">
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-bold tracking-widest text-seoiq-good uppercase">
              Passing Checks
            </p>
            <ul className="space-y-1.5">
              {data.passing.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-seoiq-good" />
                  {p}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function OnPageSection({
  data,
  score,
}: {
  data: OnPageStructure
  score: number
}) {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Code2} title="On-Page Structure" score={score} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Heading Structure
            </p>
            <div className="mb-2 rounded bg-muted px-3 py-2 text-sm">
              <span className="font-bold text-muted-foreground">H1: </span>
              {data.h1Text || "Not detected"}
            </div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Count:</span>
              <span
                className={cn(
                  "font-bold",
                  data.h1Count === 1 ? "text-seoiq-good" : "text-seoiq-critical"
                )}
              >
                {data.h1Count}
              </span>
              {data.h1Count !== 1 && (
                <span className="text-xs text-seoiq-critical">
                  (should be 1)
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hierarchy</span>
              <VerdictBadge verdict={data.headingHierarchy} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Signals
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Keyword density",
                  right: (
                    <>
                      <span
                        className={cn(
                          "mr-1.5 text-xs font-bold",
                          data.keywordDensity === "optimal"
                            ? "text-seoiq-good"
                            : "text-seoiq-warning"
                        )}
                      >
                        {data.keywordDensityPct}%
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] capitalize"
                      >
                        {data.keywordDensity}
                      </Badge>
                    </>
                  ),
                },
                {
                  label: "Internal links",
                  right: (
                    <Badge variant="outline" className="text-[9px] capitalize">
                      {data.internalLinksEstimate}
                    </Badge>
                  ),
                },
                {
                  label: "Image alt tags",
                  right: <VerdictBadge verdict={data.imageAltTags} />,
                },
                {
                  label: "URL structure",
                  right: <VerdictBadge verdict={data.urlStructure} />,
                },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-1">{row.right}</div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.notes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SchemaSection({ data, score }: { data: SchemaMarkup; score: number }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Code2}
        title="Schema Markup"
        score={score}
        verdict={data.verdict}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Detected
            </p>
            <CheckRow label="Schema markup present" pass={data.detected} />
            <CheckRow
              label="Rich result eligible"
              pass={data.richResultEligible}
            />
            {data.types.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.types.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                No schema types detected
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-seoiq-info/20 bg-seoiq-info/5">
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-bold tracking-widest text-seoiq-info uppercase">
              Recommended
            </p>
            {data.recommended.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.recommended.map((r) => (
                  <Badge
                    key={r}
                    variant="outline"
                    className="border-seoiq-info/30 text-xs text-seoiq-info"
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Schema coverage looks good
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.notes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function MobileSection({
  data,
  score,
}: {
  data: MobileUsability
  score: number
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Smartphone}
        title="Mobile Usability"
        score={score}
        verdict={data.mobileLayoutVerdict}
      />
      <Card>
        <CardContent className="pt-4 pb-4">
          <CheckRow
            label="Viewport meta tag configured"
            pass={data.viewportConfigured}
          />
          {[
            { label: "Tap target sizes", verdict: data.tapTargetsAdequate },
            { label: "Font sizes readable", verdict: data.fontSizesReadable },
            { label: "Overall layout", verdict: data.mobileLayoutVerdict },
          ].map((row) => (
            <div key={row.label}>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <StatusDot verdict={row.verdict} />
                  <VerdictBadge verdict={row.verdict} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.notes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function BacklinkSection({
  data,
  score,
}: {
  data: BacklinkProfile
  score: number
}) {
  const daClass = {
    low: "text-seoiq-critical",
    moderate: "text-seoiq-warning",
    high: "text-seoiq-good",
  }
  const ageClass = {
    new: "text-seoiq-warning",
    established: "text-seoiq-info",
    authoritative: "text-seoiq-good",
  }
  return (
    <div className="space-y-4">
      <SectionHeader icon={Link2} title="Backlink Profile" score={score} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p
              className={cn(
                "text-2xl font-black capitalize",
                daClass[data.domainAuthorityEstimate]
              )}
            >
              {data.domainAuthorityEstimate}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Domain Authority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p
              className={cn(
                "text-2xl font-black capitalize",
                ageClass[data.domainAgeSignal]
              )}
            >
              {data.domainAgeSignal}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Domain Age Signal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="mb-2 flex justify-center">
              <VerdictBadge
                verdict={data.backlinkStrengthEstimate}
                label="Backlink Strength"
              />
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
              {data.topLinkingTypesLikely.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="text-[10px] capitalize"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Anchor Diversity
            </p>
            <VerdictBadge verdict={data.anchorDiversityEstimate} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {data.notes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function CompetitorSection({
  data,
  score,
}: {
  data: CompetitorGap
  score: number
}) {
  const gapClass = {
    shorter: "text-seoiq-critical",
    similar: "text-seoiq-warning",
    longer: "text-seoiq-good",
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={TrendingUp}
        title="Competitor Gap Analysis"
        score={score}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p
              className={cn(
                "text-2xl font-black capitalize",
                gapClass[data.contentLengthGap]
              )}
            >
              {data.contentLengthGap}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Content length vs top results
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Top Opportunities
            </p>
            <ul className="space-y-2">
              {data.topOpportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-seoiq-green/10 text-[10px] font-bold text-seoiq-green">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{opp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-seoiq-good/20 bg-seoiq-good/5">
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-bold tracking-widest text-seoiq-good uppercase">
              What Top Pages Have
            </p>
            <ul className="space-y-1.5">
              {data.topRankingSignals.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-seoiq-good" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-seoiq-critical/20 bg-seoiq-critical/5">
          <CardContent className="pt-4 pb-4">
            <p className="mb-2 text-xs font-bold tracking-widest text-seoiq-critical uppercase">
              Missing From This Page
            </p>
            <ul className="space-y-1.5">
              {data.missingFromThisPage.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-seoiq-critical" />
                  {m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.notes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function AuditForm({ atLimit, isPro }: AuditFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<InputMode>("url")
  const [model, setModel] = useState(MODELS[0].id)
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState("")
  const [result, setResult] = useState<SEOResult | null>(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")

  const analyze = async () => {
    if (atLimit) {
      setError(
        "Monthly audit limit reached. Upgrade to Pro for unlimited audits."
      )
      return
    }
    const input = mode === "url" ? url.trim() : content.trim()
    if (!input) {
      setError("Please enter a URL or paste page content.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    setStep("Connecting...")
    try {
      setStep("Running 10-dimension SEO audit...")
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: mode === "url" ? input : undefined,
          content: mode === "content" ? input : undefined,
          mode,
          model,
        }),
      })
      if (res.status === 429) {
        setError("Monthly limit reached. Upgrade to Pro.")
        setLoading(false)
        return
      }
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        throw new Error(d.error ?? `HTTP ${res.status}`)
      }
      setStep("Parsing results...")
      const data = (await res.json()) as { audit: { result: SEOResult } }
      setResult(data.audit.result)
      setFilter("all")
      router.refresh()
    } catch (e) {
      setError(`Error: ${(e as Error).message}`)
    } finally {
      setLoading(false)
      setStep("")
    }
  }

  const filtered =
    result?.issues?.filter((i) => filter === "all" || i.type === filter) ?? []
  const counts: Record<FilterType, number> = {
    all: result?.issues?.length ?? 0,
    critical: result?.issues?.filter((i) => i.type === "critical").length ?? 0,
    warning: result?.issues?.filter((i) => i.type === "warning").length ?? 0,
    good: result?.issues?.filter((i) => i.type === "good").length ?? 0,
    info: result?.issues?.filter((i) => i.type === "info").length ?? 0,
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardContent className="space-y-4 pt-5 pb-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Input Mode
              </Label>
              <div className="flex gap-2">
                {(["url", "content"] as InputMode[]).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode(m)}
                    className={cn(
                      "text-xs tracking-wide",
                      mode === m &&
                        "bg-seoiq-green text-white hover:bg-seoiq-green-dark"
                    )}
                  >
                    {m === "url" ? "↗ URL" : "⌨ Paste Content"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="min-w-44 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        {m.label}
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[9px]"
                        >
                          {m.badge}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === "url" ? (
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://example.com"
                className="text-sm"
                disabled={atLimit}
              />
              <Button
                onClick={analyze}
                disabled={loading || atLimit}
                className="shrink-0 bg-seoiq-green font-bold text-white hover:bg-seoiq-green-dark"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step}
                  </>
                ) : (
                  "Analyze →"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste HTML or page text here..."
                rows={5}
                className="resize-y font-mono text-sm"
                disabled={atLimit}
              />
              <Button
                onClick={analyze}
                disabled={loading || atLimit}
                className="bg-seoiq-green font-bold text-white hover:bg-seoiq-green-dark"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step}
                  </>
                ) : (
                  "Run Full SEO Audit →"
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 py-16 text-center">
          <div className="inline-block animate-spin text-4xl text-seoiq-green">
            ◈
          </div>
          <p className="text-sm font-medium text-foreground">
            Analyzing 10 SEO dimensions...
          </p>
          <p className="text-xs text-muted-foreground">{step}</p>
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-seoiq-green"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
          {/* Score + summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[152px_1fr]">
            <Card>
              <CardContent className="flex flex-col items-center gap-2 pt-5 pb-5">
                <ScoreRing score={result.score} />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold tracking-widest",
                    scoreBadgeClass(result.score)
                  )}
                >
                  {scoreLabel(result.score)}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pt-5 pb-2">
                <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.topStrengths?.map((s, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-seoiq-good/40 text-xs text-seoiq-good"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category scores */}
          <Card>
            <CardHeader className="pt-5 pb-2">
              <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Score by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(result.categoryScores).map(([cat, sc]) => (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {cat}
                      </span>
                      <span
                        className={cn("text-xs font-bold", scoreColorClass(sc))}
                      >
                        {sc}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${sc}%`, background: scoreHex(sc) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 9 detail tabs */}
          <Tabs defaultValue="title-meta">
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex h-auto w-auto gap-0.5 bg-muted p-1">
                {[
                  { id: "title-meta", label: "Title & Meta", icon: FileText },
                  { id: "content", label: "Content", icon: AlignLeft },
                  { id: "cwv", label: "Core Web Vitals", icon: Zap },
                  { id: "technical", label: "Technical", icon: Settings2 },
                  { id: "onpage", label: "On-Page", icon: Code2 },
                  { id: "schema", label: "Schema", icon: Code2 },
                  { id: "mobile", label: "Mobile", icon: Smartphone },
                  { id: "backlinks", label: "Backlinks", icon: Link2 },
                  { id: "competitor", label: "Competitors", icon: TrendingUp },
                ].map((s) => {
                  const Icon = s.icon
                  return (
                    <TabsTrigger
                      key={s.id}
                      value={s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-seoiq-green data-[state=active]:shadow-sm"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {s.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
            <div className="mt-4">
              <TabsContent value="title-meta">
                {" "}
                <TitleMetaSection
                  data={result.titleMeta}
                  score={result.categoryScores["Title & Meta"]}
                />{" "}
              </TabsContent>
              <TabsContent value="content">
                {" "}
                <ContentSection
                  data={result.contentQuality}
                  score={result.categoryScores["Content Quality"]}
                />{" "}
              </TabsContent>
              <TabsContent value="cwv">
                {" "}
                <CWVSection
                  data={result.coreWebVitals}
                  score={result.categoryScores["Core Web Vitals"]}
                />{" "}
              </TabsContent>
              <TabsContent value="technical">
                {" "}
                <TechnicalSection
                  data={result.technicalSEO}
                  score={result.categoryScores["Technical SEO"]}
                />{" "}
              </TabsContent>
              <TabsContent value="onpage">
                {" "}
                <OnPageSection
                  data={result.onPageStructure}
                  score={result.categoryScores["On-Page Structure"]}
                />{" "}
              </TabsContent>
              <TabsContent value="schema">
                {" "}
                <SchemaSection
                  data={result.schemaMarkup}
                  score={result.categoryScores["Schema Markup"]}
                />{" "}
              </TabsContent>
              <TabsContent value="mobile">
                {" "}
                <MobileSection
                  data={result.mobileUsability}
                  score={result.categoryScores["Mobile Usability"]}
                />{" "}
              </TabsContent>
              <TabsContent value="backlinks">
                {" "}
                <BacklinkSection
                  data={result.backlinkProfile}
                  score={result.categoryScores["Backlink Profile"]}
                />{" "}
              </TabsContent>
              <TabsContent value="competitor">
                {" "}
                <CompetitorSection
                  data={result.competitorGap}
                  score={result.categoryScores["Competitor Gap"]}
                />{" "}
              </TabsContent>
            </div>
          </Tabs>

          {/* Issues list */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              All Issues ({counts.all})
            </h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {(
                ["all", "critical", "warning", "good", "info"] as FilterType[]
              ).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "h-7 px-3 text-xs tracking-wide capitalize",
                    filter === f &&
                      f === "critical" &&
                      "border-seoiq-critical/40 bg-seoiq-critical/10 text-seoiq-critical",
                    filter === f &&
                      f === "warning" &&
                      "border-seoiq-warning/40 bg-seoiq-warning/10 text-seoiq-warning",
                    filter === f &&
                      f === "good" &&
                      "border-seoiq-good/40 bg-seoiq-good/10 text-seoiq-good",
                    filter === f &&
                      f === "info" &&
                      "border-seoiq-info/40 bg-seoiq-info/10 text-seoiq-info"
                  )}
                >
                  {f} {counts[f] > 0 && `(${counts[f]})`}
                </Button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No issues in this category
              </p>
            ) : (
              filtered.map((issue, i) => (
                <IssueCard key={i} issue={issue} index={i} />
              ))
            )}
          </div>

          {/* Quick wins + insights */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pt-5 pb-2">
                <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {result.quickWins?.map((w, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 py-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-seoiq-green/10 text-[10px] font-bold text-seoiq-green">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {w}
                      </p>
                    </div>
                    {i < result.quickWins.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pt-5 pb-2">
                <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Algorithm Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.algorithmInsights}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
