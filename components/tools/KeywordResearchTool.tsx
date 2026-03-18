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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, ChevronDown, Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

interface Model {
  id: string
  label: string
  badge: string
}

interface Keyword {
  keyword: string
  intent: "informational" | "navigational" | "commercial" | "transactional"
  difficulty: "low" | "medium" | "high"
  difficultyScore: number
  monthlyVolume: string
  type: "primary" | "longtail" | "gap"
  rationale: string
}

interface KeywordResult {
  topic: string
  summary: string
  primaryKeywords: Keyword[]
  longTailKeywords: Keyword[]
  contentGapKeywords: Keyword[]
  topOpportunity: string
  contentStrategy: string
}

type InputMode = "url" | "topic"
type ActiveTab = "primary" | "longtail" | "gap"

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

const INTENT_CONFIG: Record<
  Keyword["intent"],
  {
    labelClass: string
    bgClass: string
    borderClass: string
    label: string
    desc: string
  }
> = {
  informational: {
    labelClass: "text-seoiq-info",
    bgClass: "bg-seoiq-info/10",
    borderClass: "border-l-seoiq-info",
    label: "INFO",
    desc: "Learning / research",
  },
  navigational: {
    labelClass: "text-seoiq-purple",
    bgClass: "bg-seoiq-purple/10",
    borderClass: "border-l-seoiq-purple",
    label: "NAV",
    desc: "Finding a brand/site",
  },
  commercial: {
    labelClass: "text-seoiq-warning",
    bgClass: "bg-seoiq-warning/10",
    borderClass: "border-l-seoiq-warning",
    label: "COMM",
    desc: "Researching to buy",
  },
  transactional: {
    labelClass: "text-seoiq-good",
    bgClass: "bg-seoiq-good/10",
    borderClass: "border-l-seoiq-good",
    label: "TRANS",
    desc: "Ready to convert",
  },
}

const DIFF_CONFIG: Record<
  Keyword["difficulty"],
  { labelClass: string; bgClass: string; barClass: string }
> = {
  low: {
    labelClass: "text-seoiq-good",
    bgClass: "bg-seoiq-good/10",
    barClass: "bg-seoiq-good",
  },
  medium: {
    labelClass: "text-seoiq-warning",
    bgClass: "bg-seoiq-warning/10",
    barClass: "bg-seoiq-warning",
  },
  high: {
    labelClass: "text-seoiq-critical",
    bgClass: "bg-seoiq-critical/10",
    barClass: "bg-seoiq-critical",
  },
}

const TAB_CONFIG: Record<
  ActiveTab,
  { label: string; activeClass: string; borderActive: string; desc: string }
> = {
  primary: {
    label: "Primary",
    activeClass: "text-seoiq-good",
    borderActive: "border-seoiq-good/40",
    desc: "Core terms to target",
  },
  longtail: {
    label: "Long-tail",
    activeClass: "text-seoiq-info",
    borderActive: "border-seoiq-info/40",
    desc: "Low competition, high intent",
  },
  gap: {
    label: "Content Gaps",
    activeClass: "text-seoiq-warning",
    borderActive: "border-seoiq-warning/40",
    desc: "Missing coverage opportunities",
  },
}

// ── KeywordCard ───────────────────────────────────────────────────────────────

const KeywordCard = ({ kw, index }: { kw: Keyword; index: number }) => {
  const [open, setOpen] = useState(false)
  const intent = INTENT_CONFIG[kw.intent]
  const diff = DIFF_CONFIG[kw.difficulty]

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={cn(
          "mb-2 cursor-pointer border-l-4 transition-all duration-200",
          intent.borderClass,
          open && "bg-muted/30"
        )}
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <CollapsibleTrigger asChild>
          <CardContent className="p-4">
            {/* Row 1: keyword + badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                {kw.keyword}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-transparent px-1.5 py-0 text-[9px] font-extrabold tracking-widest",
                    intent.bgClass,
                    intent.labelClass
                  )}
                >
                  {intent.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-transparent px-1.5 py-0 text-[9px] font-extrabold tracking-widest",
                    diff.bgClass,
                    diff.labelClass
                  )}
                >
                  {kw.difficulty.toUpperCase()}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-seoiq-info/20 bg-seoiq-info/5 px-1.5 py-0 text-[9px] font-bold text-seoiq-info"
                >
                  {kw.monthlyVolume}/mo
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </div>
            </div>
            {/* Row 2: KD bar */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                KD {kw.difficultyScore}
              </span>
              <div className="h-0.75 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    diff.barClass
                  )}
                  style={{ width: `${kw.difficultyScore}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {intent.desc}
              </span>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Separator className="mb-3" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {kw.rationale}
            </p>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function KeywordResearchTool(): JSX.Element {
  const [model, setModel] = useState(MODELS[0].id)
  const [inputMode, setInputMode] = useState<InputMode>("url")
  const [urlInput, setUrlInput] = useState("")
  const [topicInput, setTopicInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState("")
  const [result, setResult] = useState<KeywordResult | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<ActiveTab>("primary")
  const [sortBy, setSortBy] = useState<"difficulty" | "volume" | "default">(
    "default"
  )

  const analyze = async () => {
    const input = inputMode === "url" ? urlInput.trim() : topicInput.trim()
    if (!input) {
      setError(
        inputMode === "url" ? "Please enter a URL." : "Please enter a topic."
      )
      return
    }

    setError("")
    setLoading(true)
    setResult(null)
    setStep("Researching keywords...")

    try {
      const res = await fetch("/api/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, inputMode, model }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err?.error ?? `HTTP ${res.status}`)
      }

      setStep("Parsing results...")
      const parsed = (await res.json()) as KeywordResult
      setResult(parsed)
      setActiveTab("primary")
    } catch (e) {
      setError(`Error: ${(e as Error).message}`)
    } finally {
      setLoading(false)
      setStep("")
    }
  }

  const sortKeywords = (kws: Keyword[]): Keyword[] => {
    if (sortBy === "difficulty")
      return [...kws].sort((a, b) => a.difficultyScore - b.difficultyScore)
    if (sortBy === "volume") {
      const order = ["10K+", "1K–10K", "100–1K", "<100"]
      return [...kws].sort(
        (a, b) =>
          (order.findIndex((o) => a.monthlyVolume.includes(o)) ?? 99) -
          (order.findIndex((o) => b.monthlyVolume.includes(o)) ?? 99)
      )
    }
    return kws
  }

  const tabKeywords: Record<ActiveTab, Keyword[]> = result
    ? {
        primary: result.primaryKeywords,
        longtail: result.longTailKeywords,
        gap: result.contentGapKeywords,
      }
    : { primary: [], longtail: [], gap: [] }

  const activeKeywords = sortKeywords(tabKeywords[activeTab])
  const allKeywords = result
    ? [
        ...result.primaryKeywords,
        ...result.longTailKeywords,
        ...result.contentGapKeywords,
      ]
    : []
  const lowCount = allKeywords.filter((k) => k.difficulty === "low").length
  const highValCount = allKeywords.filter(
    (k) => k.intent === "transactional" || k.intent === "commercial"
  ).length

  return (
    <div className="space-y-4">
      {/* Model + input controls */}
      {/* Model selector */}
      <div className="flex items-center gap-4">
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
                  <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
                    {m.badge}
                  </Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-5 pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Input mode toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Input Mode
              </Label>
              <div className="flex gap-2">
                {(["url", "topic"] as InputMode[]).map((m) => (
                  <Button
                    key={m}
                    variant={inputMode === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode(m)}
                    className={cn(
                      "text-xs tracking-wide",
                      inputMode === m &&
                        "bg-seoiq-green text-seoiq-charcoal hover:bg-seoiq-green-dark"
                    )}
                  >
                    {m === "url" ? "↗ WEBSITE URL" : "⌨ TOPIC / NICHE"}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Input + submit */}
          <div className="flex gap-2">
            <Input
              value={inputMode === "url" ? urlInput : topicInput}
              onChange={(e) =>
                inputMode === "url"
                  ? setUrlInput(e.target.value)
                  : setTopicInput(e.target.value)
              }
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder={
                inputMode === "url"
                  ? "https://example.com"
                  : "e.g. local plumbing, SaaS email marketing..."
              }
              className="text-sm"
            />
            <Button
              onClick={analyze}
              disabled={loading}
              className="shrink-0 bg-seoiq-green font-bold tracking-wide text-seoiq-charcoal hover:bg-seoiq-green-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                "Research →"
              )}
            </Button>
          </div>

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
          <div className="inline-block animate-spin text-4xl text-seoiq-green">
            ◈
          </div>
          <p className="text-sm tracking-widest text-seoiq-info">{step}</p>
          <p className="text-xs text-muted-foreground">
            Using {MODELS.find((m) => m.id === model)?.label}
          </p>
          <div className="flex justify-center gap-1.5 pt-1">
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
        <div className="animate-in space-y-4 duration-500 fade-in slide-in-from-bottom-4">
          {/* Topic + summary */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Topic Analysis
                  </p>
                  <p className="mb-2.5 text-base font-bold tracking-wide text-seoiq-green">
                    {result.topic}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.summary}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  {[
                    {
                      label: "TOTAL KWS",
                      value: allKeywords.length,
                      cls: "text-seoiq-green",
                    },
                    {
                      label: "LOW KD",
                      value: lowCount,
                      cls: "text-seoiq-good",
                    },
                    {
                      label: "HIGH VALUE",
                      value: highValCount,
                      cls: "text-seoiq-warning",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-center"
                    >
                      <div className={cn("text-xl font-black", stat.cls)}>
                        {stat.value}
                      </div>
                      <div className="mt-0.5 text-[9px] tracking-widest text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Top opportunity */}
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-seoiq-good/20 bg-seoiq-good/5 p-3">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-seoiq-good" />
                <div>
                  <p className="mb-1 text-[9px] font-extrabold tracking-widest text-seoiq-good uppercase">
                    Top Opportunity
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-foreground/80">
                    {result.topOpportunity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intent legend */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 py-3">
              <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                Intent
              </span>
              {(
                Object.entries(INTENT_CONFIG) as [
                  Keyword["intent"],
                  (typeof INTENT_CONFIG)[Keyword["intent"]],
                ][]
              ).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent px-1.5 py-0 text-[9px] font-extrabold",
                      val.bgClass,
                      val.labelClass
                    )}
                  >
                    {val.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {val.desc}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tabs + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {(["primary", "longtail", "gap"] as ActiveTab[]).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "h-8 text-xs tracking-wide",
                    activeTab === tab &&
                      cn(
                        "border",
                        TAB_CONFIG[tab].borderActive,
                        TAB_CONFIG[tab].activeClass
                      )
                  )}
                >
                  {TAB_CONFIG[tab].label}
                  <span className="ml-1.5 opacity-60">
                    ({tabKeywords[tab].length})
                  </span>
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
                Sort
              </span>
              {(["default", "difficulty", "volume"] as const).map((s) => (
                <Button
                  key={s}
                  variant={sortBy === s ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(s)}
                  className={cn(
                    "h-7 px-2 text-[9px] tracking-wide",
                    sortBy === s &&
                      "border border-seoiq-green/30 text-seoiq-green"
                  )}
                >
                  {s === "default"
                    ? "DEFAULT"
                    : s === "difficulty"
                      ? "EASIEST"
                      : "VOLUME"}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-[10px] tracking-wide text-muted-foreground">
            {TAB_CONFIG[activeTab].desc} — {activeKeywords.length} keywords
          </p>

          {activeKeywords.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No keywords in this category
            </p>
          ) : (
            activeKeywords.map((kw, i) => (
              <KeywordCard key={`${activeTab}-${i}`} kw={kw} index={i} />
            ))
          )}

          {/* Content strategy */}
          <Card>
            <CardHeader className="pt-5 pb-2">
              <CardTitle className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Content Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.contentStrategy}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="space-y-3 py-16 text-center">
          <div className="text-5xl text-muted-foreground/20">◈</div>
          <p className="text-sm tracking-wide text-muted-foreground/50">
            Enter a URL or topic to discover keyword opportunities
          </p>
          <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted-foreground/30">
            Uncovers primary keywords, long-tail variations, and content gaps —
            with search intent and difficulty for each
          </p>
        </div>
      )}
    </div>
  )
}
