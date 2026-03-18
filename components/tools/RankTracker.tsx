"use client"

import { useState, useEffect, useCallback, JSX } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  Plus,
  RefreshCw,
  X,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

interface Model {
  id: string
  label: string
  badge: string
}

interface RankSnapshot {
  date: string
  position: number
  positionRange: string
  change: number | null
}

interface TrackedKeyword {
  id: string
  keyword: string
  url: string
  targetUrl: string
  snapshots: RankSnapshot[]
  lastChecked: string
  trend: "up" | "down" | "flat" | "new"
  difficulty: "low" | "medium" | "high"
  intent: string
  notes: string
}

interface CheckResult {
  estimatedPosition: number
  positionRange: string
  reasoning: string
  onPageStrengths: string[]
  onPageWeaknesses: string[]
  quickFix: string
  difficulty: "low" | "medium" | "high"
  intent: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

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

const STORAGE_KEY = "seoiq-rank-tracker-v1"

// ── Helpers ───────────────────────────────────────────────────────────────────

function positionColorClass(pos: number): string {
  if (pos <= 3) return "text-seoiq-good"
  if (pos <= 10) return "text-seoiq-info"
  if (pos <= 20) return "text-seoiq-warning"
  if (pos <= 50) return "text-seoiq-orange"
  return "text-seoiq-critical"
}

// SVG sparkline stroke — static hex fallback (documented exception: SVG stroke)
function positionHex(pos: number): string {
  if (pos <= 3) return "#22d3a0"
  if (pos <= 10) return "#60a5fa"
  if (pos <= 20) return "#f0b429"
  if (pos <= 50) return "#f97316"
  return "#f05252"
}

function positionLabel(pos: number): string {
  if (pos <= 3) return "TOP 3"
  if (pos <= 10) return "PAGE 1"
  if (pos <= 20) return "PAGE 2"
  if (pos <= 50) return "PAGE 3–5"
  return "PAGE 5+"
}

function trendConfig(trend: TrackedKeyword["trend"]): {
  icon: string
  cls: string
} {
  if (trend === "up") return { icon: "↑", cls: "text-seoiq-good" }
  if (trend === "down") return { icon: "↓", cls: "text-seoiq-critical" }
  if (trend === "new") return { icon: "★", cls: "text-seoiq-warning" }
  return { icon: "→", cls: "text-muted-foreground" }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

const Sparkline = ({
  snapshots,
  width = 100,
  height = 32,
}: {
  snapshots: RankSnapshot[]
  width?: number
  height?: number
}) => {
  if (snapshots.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center"
      >
        <span className="text-[10px] text-muted-foreground/30">no history</span>
      </div>
    )
  }
  const positions = snapshots.map((s) => s.position)
  const maxP = Math.max(...positions)
  const minP = Math.min(...positions)
  const range = maxP - minP || 1
  const pad = 4
  const pts = snapshots.map((s, i) => {
    const x = pad + (i / (snapshots.length - 1)) * (width - pad * 2)
    const y = pad + ((s.position - minP) / range) * (height - pad * 2)
    return `${x},${height - y}`
  })
  const latest = snapshots[snapshots.length - 1]
  const color = positionHex(latest.position)
  const polyline = pts.join(" ")
  const firstPt = pts[0].split(",")
  const lastPt = pts[pts.length - 1].split(",")
  const areaPath = `M${firstPt[0]},${height} L${pts.join(" L")} L${lastPt[0]},${height} Z`

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient
          id={`sg-${snapshots.length}-${latest.position}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#sg-${snapshots.length}-${latest.position})`}
      />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={parseFloat(lastPt[0])}
        cy={parseFloat(lastPt[1])}
        r="3"
        fill={color}
      />
    </svg>
  )
}

// ── KeywordRow ────────────────────────────────────────────────────────────────

interface KeywordRowProps {
  kw: TrackedKeyword
  onCheck: (kw: TrackedKeyword) => void
  onDelete: (id: string) => void
  checking: boolean
}

const KeywordRow = ({ kw, onCheck, onDelete, checking }: KeywordRowProps) => {
  const [expanded, setExpanded] = useState(false)
  const latest = kw.snapshots[kw.snapshots.length - 1]
  const trend = trendConfig(kw.trend)

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card
        className={cn(
          "mb-2 transition-all duration-200",
          expanded && "bg-muted/30"
        )}
      >
        <CollapsibleTrigger asChild>
          <CardContent className="cursor-pointer p-4">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4">
              {/* Keyword + URL */}
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className={cn("text-sm font-extrabold", trend.cls)}>
                    {trend.icon}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {kw.keyword}
                  </span>
                </div>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {kw.targetUrl}
                </p>
              </div>

              {/* Sparkline */}
              <div className="hidden shrink-0 sm:block">
                <Sparkline snapshots={kw.snapshots} />
              </div>

              {/* Position */}
              <div className="shrink-0 text-center">
                {latest ? (
                  <>
                    <div
                      className={cn(
                        "text-2xl leading-none font-black",
                        positionColorClass(latest.position)
                      )}
                    >
                      #{latest.position}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 border-transparent px-1.5 py-0 text-[8px] font-extrabold tracking-wider",
                        positionColorClass(latest.position)
                      )}
                    >
                      {positionLabel(latest.position)}
                    </Badge>
                    {latest.change !== null && latest.change !== 0 && (
                      <div
                        className={cn(
                          "mt-0.5 text-[10px] font-bold",
                          latest.change < 0
                            ? "text-seoiq-good"
                            : "text-seoiq-critical"
                        )}
                      >
                        {latest.change < 0
                          ? `▲${Math.abs(latest.change)}`
                          : `▼${latest.change}`}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={checking}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCheck(kw)
                  }}
                  className="h-7 border-seoiq-good/30 px-2.5 text-[9px] font-bold tracking-widest text-seoiq-good hover:bg-seoiq-good/10"
                >
                  {checking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "CHECK"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(kw.id)
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Separator className="mb-3" />
            {kw.snapshots.length > 0 ? (
              <div className="mb-3">
                <p className="mb-2 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Position History
                </p>
                <div className="space-y-1">
                  {[...kw.snapshots].reverse().map((snap, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-1 text-xs"
                    >
                      <span className="w-16 shrink-0 font-mono text-muted-foreground">
                        {formatDate(snap.date)}
                      </span>
                      <span
                        className={cn(
                          "w-8 shrink-0 font-bold",
                          positionColorClass(snap.position)
                        )}
                      >
                        #{snap.position}
                      </span>
                      <span className="text-muted-foreground/60">
                        range {snap.positionRange}
                      </span>
                      {snap.change !== null && snap.change !== 0 && (
                        <span
                          className={cn(
                            "font-bold",
                            snap.change < 0
                              ? "text-seoiq-good"
                              : "text-seoiq-critical"
                          )}
                        >
                          {snap.change < 0
                            ? `▲ +${Math.abs(snap.change)}`
                            : `▼ ${snap.change}`}
                        </span>
                      )}
                      {snap.change === 0 && (
                        <span className="text-muted-foreground/40">
                          no change
                        </span>
                      )}
                      {snap.change === null && (
                        <span className="text-[9px] text-muted-foreground/30">
                          first check
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mb-3 text-xs text-muted-foreground">
                No checks yet. Hit CHECK to get your first position estimate.
              </p>
            )}
            {kw.notes && (
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-1 text-[9px] font-bold tracking-widest text-seoiq-info uppercase">
                  ▶ Last Insight
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {kw.notes}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RankTracker(): JSX.Element {
  const [model, setModel] = useState(MODELS[0].id)
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState<"position" | "added" | "trend">(
    "position"
  )

  // ── Storage ──────────────────────────────────────────────────────────────

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setKeywords(JSON.parse(raw) as TrackedKeyword[])
    } catch (e) {
      console.error("Storage load failed:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveToStorage = useCallback((kws: TrackedKeyword[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kws))
    } catch (e) {
      console.error("Storage save failed:", e)
    }
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  // ── Add ──────────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!newKeyword.trim() || !newUrl.trim()) {
      setError("Both keyword and target URL are required.")
      return
    }
    const kw: TrackedKeyword = {
      id: uid(),
      keyword: newKeyword.trim(),
      url: newUrl.trim(),
      targetUrl: newUrl.trim(),
      snapshots: [],
      lastChecked: "",
      trend: "new",
      difficulty: "medium",
      intent: "informational",
      notes: "",
    }
    const updated = [kw, ...keywords]
    setKeywords(updated)
    saveToStorage(updated)
    setNewKeyword("")
    setNewUrl("")
    setAddingNew(false)
    setError("")
  }

  // ── Check — calls /api/rank-check (server-side Groq key) ─────────────────

  const handleCheck = async (kw: TrackedKeyword) => {
    setCheckingId(kw.id)
    setError("")

    try {
      const res = await fetch("/api/rank-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: kw.keyword,
          targetUrl: kw.targetUrl,
          model,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err?.error ?? `HTTP ${res.status}`)
      }

      const parsed = (await res.json()) as CheckResult

      const prev = kw.snapshots[kw.snapshots.length - 1]
      const change = prev ? parsed.estimatedPosition - prev.position : null

      let trend: TrackedKeyword["trend"] = "new"
      if (change !== null) {
        trend = change < -2 ? "up" : change > 2 ? "down" : "flat"
      }

      const newSnap: RankSnapshot = {
        date: new Date().toISOString(),
        position: parsed.estimatedPosition,
        positionRange: parsed.positionRange,
        change,
      }
      const updated = keywords.map((k) =>
        k.id === kw.id
          ? {
              ...k,
              snapshots: [...k.snapshots, newSnap],
              lastChecked: new Date().toISOString(),
              trend,
              difficulty: parsed.difficulty,
              intent: parsed.intent,
              notes: `${parsed.reasoning} Quick fix: ${parsed.quickFix}`,
            }
          : k
      )
      setKeywords(updated)
      saveToStorage(updated)
    } catch (e) {
      setError(`Check failed: ${(e as Error).message}`)
    } finally {
      setCheckingId(null)
    }
  }

  const handleDelete = (id: string) => {
    const updated = keywords.filter((k) => k.id !== id)
    setKeywords(updated)
    saveToStorage(updated)
  }

  const handleCheckAll = async () => {
    for (const kw of keywords) await handleCheck(kw)
  }

  // ── Sort ─────────────────────────────────────────────────────────────────

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (sortBy === "position") {
      const ap = a.snapshots[a.snapshots.length - 1]?.position ?? 999
      const bp = b.snapshots[b.snapshots.length - 1]?.position ?? 999
      return ap - bp
    }
    if (sortBy === "trend") {
      const order = { up: 0, flat: 1, new: 2, down: 3 }
      return order[a.trend] - order[b.trend]
    }
    return 0
  })

  const tracked = keywords.length
  const page1Count = keywords.filter(
    (k) => (k.snapshots[k.snapshots.length - 1]?.position ?? 999) <= 10
  ).length
  const improvingCount = keywords.filter((k) => k.trend === "up").length

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Model selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-[10px] tracking-widest text-muted-foreground uppercase">
            Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-1.5 text-xs">
                    {m.label}
                    <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                      {m.badge}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats bar */}
      {tracked > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "TRACKED", value: tracked, cls: "text-seoiq-info" },
            { label: "PAGE 1", value: page1Count, cls: "text-seoiq-good" },
            {
              label: "IMPROVING",
              value: improvingCount,
              cls: "text-seoiq-warning",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {stat.label}
                </span>
                <span className={cn("text-2xl font-black", stat.cls)}>
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={addingNew ? "secondary" : "default"}
            size="sm"
            onClick={() => {
              setAddingNew(!addingNew)
              setError("")
            }}
            className={cn(
              "text-xs font-bold tracking-wide",
              !addingNew &&
                "bg-seoiq-green text-seoiq-charcoal hover:bg-seoiq-green-dark"
            )}
          >
            {addingNew ? (
              <>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Keyword
              </>
            )}
          </Button>
          {tracked > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckAll}
              disabled={checkingId !== null}
              className="border-seoiq-info/30 text-xs font-bold tracking-wide text-seoiq-info hover:bg-seoiq-info/10"
            >
              {checkingId ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Check All
                </>
              )}
            </Button>
          )}
        </div>
        {tracked > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
              Sort
            </span>
            {(["added", "position", "trend"] as const).map((s) => (
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
                {s.toUpperCase()}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Add keyword form */}
      {addingNew && (
        <Card className="border-seoiq-good/20">
          <CardContent className="space-y-4 pt-5 pb-5">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              New Keyword to Track
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[9px] tracking-widest text-muted-foreground uppercase">
                  Keyword
                </Label>
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="e.g. best seo tools 2025"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] tracking-widest text-muted-foreground uppercase">
                  Target URL
                </Label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="https://yoursite.com/page"
                  className="text-sm"
                />
              </div>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-seoiq-green text-xs font-bold tracking-wide text-seoiq-charcoal hover:bg-seoiq-green-dark"
            >
              Add to Tracker →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-seoiq-green" />
          <p className="text-xs text-muted-foreground">
            Loading tracked keywords...
          </p>
        </div>
      ) : sortedKeywords.length === 0 ? (
        /* Empty state */
        <div className="space-y-4 py-16 text-center">
          <div className="text-5xl text-muted-foreground/20">◈</div>
          <p className="text-sm tracking-wide text-muted-foreground/50">
            No keywords tracked yet
          </p>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground/30">
            Add a keyword + target URL, then hit CHECK to get your first
            AI-estimated position. Re-check over time to track movement.
          </p>
          {/* Position legend */}
          <Card className="mx-auto inline-block">
            <CardContent className="px-5 pt-4 pb-4 text-left">
              <p className="mb-3 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                Position Legend
              </p>
              {[
                { range: "#1–3", label: "TOP 3", cls: "text-seoiq-good" },
                { range: "#4–10", label: "PAGE 1", cls: "text-seoiq-info" },
                { range: "#11–20", label: "PAGE 2", cls: "text-seoiq-warning" },
                {
                  range: "#21–50",
                  label: "PAGE 3–5",
                  cls: "text-seoiq-orange",
                },
                { range: "#51+", label: "PAGE 5+", cls: "text-seoiq-critical" },
              ].map((item) => (
                <div
                  key={item.range}
                  className="mb-1.5 flex items-center gap-3"
                >
                  <span className={cn("w-11 text-sm font-black", item.cls)}>
                    {item.range}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent px-1.5 py-0 text-[8px] font-extrabold tracking-widest",
                      item.cls
                    )}
                  >
                    {item.label}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Keyword list */
        <div>
          {sortedKeywords.map((kw) => (
            <KeywordRow
              key={kw.id}
              kw={kw}
              onCheck={handleCheck}
              onDelete={handleDelete}
              checking={checkingId === kw.id}
            />
          ))}

          {/* Disclaimer */}
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Positions are{" "}
              <strong className="font-semibold text-seoiq-info">
                AI-estimated
              </strong>{" "}
              based on keyword competitiveness, domain signals, and SEO best
              practices — not live SERP data. Use for directional tracking and
              trend analysis. For live data, connect a SERP API in Settings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
