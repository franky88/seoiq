"use client"

import { JSX, useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  EyeOff,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

interface Model {
  id: string
  label: string
  badge: string
}

interface Issue {
  title: string
  type: "critical" | "warning" | "good" | "info"
  category: string
  description: string
  fix?: string
}

interface SEOResult {
  score: number
  summary: string
  topStrengths: string[]
  categoryScores: Record<string, number>
  issues: Issue[]
  quickWins: string[]
  algorithmInsights: string
}

type FilterType = "all" | "critical" | "warning" | "good" | "info"
type InputMode = "url" | "content"

// ── Constants ────────────────────────────────────────────────────────────────

const MODELS: Model[] = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", badge: "BEST" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", badge: "FAST" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", badge: "FREE" },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    label: "Llama 4 Scout 17B",
    badge: "NEW",
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500"
  if (score >= 50) return "text-amber-500"
  return "text-destructive"
}

const scoreHex = (score: number) => {
  if (score >= 80) return "#10b981"
  if (score >= 50) return "#f59e0b"
  return "#ef4444"
}

const scoreLabel = (score: number) => {
  if (score >= 80) return "HEALTHY"
  if (score >= 50) return "NEEDS WORK"
  return "CRITICAL"
}

const ISSUE_CONFIG = {
  critical: {
    icon: XCircle,
    className: "text-destructive",
    badgeVariant: "destructive" as const,
    label: "Critical",
    borderClass: "border-l-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-amber-500",
    badgeVariant: "outline" as const,
    label: "Warning",
    borderClass: "border-l-amber-500",
  },
  good: {
    icon: CheckCircle2,
    className: "text-emerald-500",
    badgeVariant: "outline" as const,
    label: "Good",
    borderClass: "border-l-emerald-500",
  },
  info: {
    icon: Info,
    className: "text-blue-500",
    badgeVariant: "secondary" as const,
    label: "Info",
    borderClass: "border-l-blue-500",
  },
}

// ── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing = ({ score }: { score: number }) => {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
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
        fill="#999999"
        fontSize="11"
        fontFamily="inherit"
      >
        / 100
      </text>
    </svg>
  )
}

// ── Issue Card ───────────────────────────────────────────────────────────────

const IssueCard = ({ issue, index }: { issue: Issue; index: number }) => {
  const [open, setOpen] = useState(false)
  const cfg = ISSUE_CONFIG[issue.type] ?? ISSUE_CONFIG.info
  const Icon = cfg.icon

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={cn(
          "mb-2 cursor-pointer border-l-4 transition-all duration-200",
          cfg.borderClass,
          open && "bg-muted/30"
        )}
        style={{ animationDelay: `${index * 0.035}s` }}
      >
        <CollapsibleTrigger asChild>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Icon className={cn("h-5 w-5 shrink-0", cfg.className)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{issue.title}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {issue.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={cfg.badgeVariant}
                  className={cn(
                    "text-xs",
                    issue.type === "warning" &&
                      "border-amber-500 text-amber-600",
                    issue.type === "good" &&
                      "border-emerald-500 text-emerald-600"
                  )}
                >
                  {cfg.label}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
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
                <p className="mb-1.5 text-xs font-bold tracking-widest text-blue-500">
                  ▶ HOW TO FIX
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

// ── Main Component ───────────────────────────────────────────────────────────

export default function SEOChecker(): JSX.Element {
  const [apiKey, setApiKey] = useState("")
  const [keyVisible, setKeyVisible] = useState(false)
  const [model, setModel] = useState(MODELS[0].id)
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")
  const [inputMode, setInputMode] = useState<InputMode>("url")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SEOResult | null>(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [step, setStep] = useState("")

  const analyze = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Groq API key.")
      return
    }
    const input = inputMode === "url" ? url.trim() : content.trim()
    if (!input) {
      setError("Please enter a URL or paste page content.")
      return
    }

    setError("")
    setLoading(true)
    setResult(null)
    setStep("Connecting to Groq...")

    const prompt = `You are an expert SEO analyst. Analyze the following ${
      inputMode === "url"
        ? `website URL: ${input}`
        : `page content:\n${input.substring(0, 3000)}`
    }

Provide a comprehensive SEO audit based on 2024-2025 Google algorithm updates (Helpful Content, Core Web Vitals, E-E-A-T, etc).

Return ONLY valid raw JSON — no markdown fences, no extra text before or after:

{
  "score": <0-100>,
  "summary": "<2-3 sentence executive summary>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "categoryScores": {
    "Meta & Title Tags": <0-100>,
    "Content Quality": <0-100>,
    "Technical SEO": <0-100>,
    "Mobile & Performance": <0-100>,
    "Structured Data": <0-100>,
    "Link Strategy": <0-100>
  },
  "issues": [
    {
      "title": "<issue title>",
      "type": "<critical|warning|good|info>",
      "category": "<category name>",
      "description": "<why this matters>",
      "fix": "<how to fix it>"
    }
  ],
  "quickWins": ["<win 1>", "<win 2>", "<win 3>"],
  "algorithmInsights": "<paragraph about relevant 2024-2025 Google algorithm impacts>"
}`

    try {
      setStep("Sending to model...")
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }],
          }),
        }
      )
      if (!res.ok) {
        const err = (await res.json()) as { error?: { message?: string } }
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
      }
      setStep("Parsing results...")
      const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>
      }
      const raw = data.choices?.[0]?.message?.content ?? ""
      const clean = raw.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(
        clean.substring(clean.indexOf("{"), clean.lastIndexOf("}") + 1)
      ) as SEOResult
      setResult(parsed)
      setFilter("all")
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">◈</span>
              <span className="text-lg font-semibold tracking-wide">
                SEO<span className="text-emerald-500">IQ</span>
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500 text-[9px] tracking-widest text-emerald-600"
              >
                FREE AI
              </Badge>
            </div>
            <p className="mt-0.5 text-xs tracking-wide text-muted-foreground">
              Powered by Groq · Llama 3 · Free to use
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
            >
              Get Free API Key <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-6 py-7">
        {/* API Key + Model */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label
                  htmlFor="apikey"
                  className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                >
                  Groq API Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="apikey"
                    type={keyVisible ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setKeyVisible(!keyVisible)}
                  >
                    {keyVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Model
                </Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="min-w-45">
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
          </CardContent>
        </Card>

        {/* URL / Content input */}
        <Card>
          <CardContent className="space-y-4 pt-5 pb-5">
            <div className="flex gap-2">
              {(["url", "content"] as InputMode[]).map((m) => (
                <Button
                  key={m}
                  variant={inputMode === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode(m)}
                  className="text-xs tracking-wide"
                >
                  {m === "url" ? "↗ URL" : "⌨ Paste Content"}
                </Button>
              ))}
            </div>
            {inputMode === "url" ? (
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && analyze()}
                  placeholder="https://example.com"
                  className="text-sm"
                />
                <Button
                  onClick={analyze}
                  disabled={loading}
                  className="font-bold tracking-wide whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
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
                  placeholder="Paste HTML source or page text here..."
                  rows={5}
                  className="resize-y font-mono text-sm"
                />
                <Button
                  onClick={analyze}
                  disabled={loading}
                  className="font-bold tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Run SEO Audit →"
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
          <div className="space-y-4 py-16 text-center">
            <div className="inline-block animate-spin text-4xl text-emerald-500">
              ◈
            </div>
            <p className="text-sm tracking-widest text-blue-500">{step}</p>
            <p className="text-xs text-muted-foreground">
              Using {MODELS.find((m) => m.id === model)?.label}
            </p>
            <div className="flex justify-center gap-1.5 pt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-in space-y-4 duration-500 fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[152px_1fr]">
              <Card>
                <CardContent className="flex flex-col items-center gap-3 pt-5">
                  <ScoreRing score={result.score} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold tracking-widest",
                      result.score >= 80 &&
                        "border-emerald-500 text-emerald-600",
                      result.score >= 50 &&
                        result.score < 80 &&
                        "border-amber-500 text-amber-600",
                      result.score < 50 && "border-destructive text-destructive"
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
                        className="border-emerald-500 text-xs text-emerald-600"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pt-5 pb-2">
                <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Category Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(result.categoryScores ?? {}).map(
                    ([cat, sc]) => (
                      <div key={cat}>
                        <div className="mb-1.5 flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            {cat}
                          </span>
                          <span
                            className={cn("text-xs font-bold", scoreColor(sc))}
                          >
                            {sc}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${sc}%`,
                              background: scoreHex(sc),
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="issues">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="issues" className="text-xs tracking-wide">
                  Issues ({counts.all})
                </TabsTrigger>
                <TabsTrigger
                  value="quickwins"
                  className="text-xs tracking-wide"
                >
                  Quick Wins
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs tracking-wide">
                  Algo Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "all",
                      "critical",
                      "warning",
                      "good",
                      "info",
                    ] as FilterType[]
                  ).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className="h-7 px-3 text-xs tracking-wide capitalize"
                    >
                      {f} {counts[f] > 0 && `(${counts[f]})`}
                    </Button>
                  ))}
                </div>
                {filtered.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No issues in this category
                  </p>
                ) : (
                  filtered.map((issue, i) => (
                    <IssueCard key={i} issue={issue} index={i} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="quickwins" className="mt-4">
                <Card>
                  <CardHeader className="pt-5 pb-2">
                    <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      High Impact · Low Effort
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    {result.quickWins?.map((w, i) => (
                      <div key={i}>
                        <div className="flex items-start gap-4 py-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-xs font-bold text-blue-500">
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
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <Card>
                  <CardHeader className="pt-5 pb-2">
                    <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      2024–2025 Google Algorithm Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {result.algorithmInsights}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="space-y-3 py-16 text-center text-muted-foreground/30">
            <div className="text-5xl">◈</div>
            <p className="text-sm tracking-wide">
              Enter your Groq API key above
            </p>
            <p className="text-xs">
              Free at console.groq.com · No credit card required
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          {/* Branding */}
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <span className="text-sm">◈</span>
            <span className="text-xs tracking-wide">
              SEO<span className="text-emerald-500/60">IQ</span>
            </span>
            <span className="text-xs">· Free AI SEO Audit Tool</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-0.5 text-xs text-muted-foreground/60">
            <a
              href="/legal?tab=privacy"
              className="rounded px-2.5 py-1 transition-colors hover:bg-muted hover:text-muted-foreground"
            >
              Privacy Policy
            </a>
            <span className="text-muted-foreground/30 select-none">·</span>
            <a
              href="/legal?tab=terms"
              className="rounded px-2.5 py-1 transition-colors hover:bg-muted hover:text-muted-foreground"
            >
              Terms of Use
            </a>
            <span className="text-muted-foreground/30 select-none">·</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded px-2.5 py-1 transition-colors hover:bg-muted hover:text-muted-foreground"
            >
              Groq Console <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
