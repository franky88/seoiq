import RankTracker from "@/components/tools/RankTracker"

export default function RankPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Rank Tracker
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor keyword positions over time with AI-estimated rankings.
        </p>
      </div>
      <RankTracker />
    </div>
  )
}
