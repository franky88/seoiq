"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ExternalLink, Trash2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Audit {
  id: string
  url: string | null
  mode: string
  score: number
  model: string
  created_at: string
}

interface AuditHistoryTableProps {
  audits: Audit[]
  isPro: boolean
}

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
    hour: "numeric",
    minute: "2-digit",
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AuditHistoryTable({ audits, isPro }: AuditHistoryTableProps) {
  const [rows, setRows] = useState<Audit[]>(audits)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await supabase.from("audits").delete().eq("id", id)
      setRows((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch (e) {
      console.error("Delete failed:", e)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Card>
      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3">
        <div className="w-14 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Score
        </div>
        <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          URL / Content
        </div>
        <div className="hidden text-[10px] font-semibold tracking-widest text-muted-foreground uppercase sm:block">
          Model
        </div>
        <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Date
        </div>
        <div className="w-8" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {rows.map((audit) => (
          <div
            key={audit.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
          >
            {/* Score */}
            <div className="w-14">
              <div
                className={cn(
                  "text-xl leading-none font-black",
                  scoreColorClass(audit.score)
                )}
              >
                {audit.score}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 border-transparent px-1 py-0 text-[8px] font-bold tracking-wide",
                  scoreBadgeClass(audit.score)
                )}
              >
                {scoreLabel(audit.score)}
              </Badge>
            </div>

            {/* URL */}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {audit.url ?? "Pasted content"}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {audit.mode} audit
              </p>
            </div>

            {/* Model */}
            <div className="hidden sm:block">
              <span className="font-mono text-[10px] text-muted-foreground">
                {audit.model
                  .split("/")
                  .pop()
                  ?.replace("-versatile", "")
                  .replace("-instant", "") ?? audit.model}
              </span>
            </div>

            {/* Date */}
            <div className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground">
              {formatDate(audit.created_at)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-seoiq-info"
                asChild
              >
                <Link href={`/dashboard/audit/${audit.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>

              {isPro ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleting === audit.id}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-seoiq-border-subtle bg-seoiq-surface">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete audit?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete the audit for{" "}
                        <span className="font-medium text-foreground">
                          {audit.url ?? "pasted content"}
                        </span>
                        . This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-seoiq-border-medium">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(audit.id)}
                        className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-not-allowed text-muted-foreground/30"
                  title="Pro feature — upgrade to delete audits"
                  asChild
                >
                  <Link href="/settings#billing">
                    <Lock className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
