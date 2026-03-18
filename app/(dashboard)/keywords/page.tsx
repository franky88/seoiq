import KeywordResearchTool from "@/components/tools/KeywordResearchTool"

export default function KeywordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Keyword Research
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover keyword opportunities with AI-powered intent and difficulty
          analysis.
        </p>
      </div>
      <KeywordResearchTool />
    </div>
  )
}
