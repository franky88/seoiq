// ── Core audit types ─────────────────────────────────────────────────────────

export type IssueType = "critical" | "warning" | "good" | "info"

export interface Issue {
  title: string
  type: IssueType
  category: string
  description: string
  fix?: string
}

// ── Title & Meta ──────────────────────────────────────────────────────────────

export interface TitleMetaAnalysis {
  titleTag: string
  titleLength: number
  titleHasKeyword: boolean
  titleVerdict: IssueType
  metaDescription: string
  metaLength: number
  metaHasKeyword: boolean
  metaVerdict: IssueType
  suggestions: string[]
}

// ── Content Quality ───────────────────────────────────────────────────────────

export interface ContentQuality {
  estimatedWordCount: number
  readabilityLevel: "easy" | "moderate" | "difficult"
  readabilityScore: number
  eeeatSignals: {
    experience: IssueType
    expertise: IssueType
    authoritativeness: IssueType
    trustworthiness: IssueType
  }
  contentDepth: "thin" | "moderate" | "comprehensive"
  uniquenessSignal: IssueType
  notes: string
}

// ── Core Web Vitals ───────────────────────────────────────────────────────────

export interface CoreWebVitals {
  lcp: { estimate: "good" | "needs-improvement" | "poor"; notes: string }
  inp: { estimate: "good" | "needs-improvement" | "poor"; notes: string }
  cls: { estimate: "good" | "needs-improvement" | "poor"; notes: string }
  overallVerdict: IssueType
  summary: string
}

// ── Technical SEO ─────────────────────────────────────────────────────────────

export interface TechnicalSEO {
  https: boolean
  canonicalPresent: boolean
  robotsIndexable: boolean
  sitemapLikely: boolean
  hreflang: boolean
  mobileFriendly: boolean
  pageSpeedSignals: {
    renderBlocking: IssueType
    imageOptimization: IssueType
    caching: IssueType
    minification: IssueType
  }
  issues: string[]
  passing: string[]
}

// ── On-Page Structure ─────────────────────────────────────────────────────────

export interface OnPageStructure {
  h1Count: number
  h1Text: string
  headingHierarchy: IssueType
  keywordDensity: "low" | "optimal" | "high"
  keywordDensityPct: number
  internalLinksEstimate: "none" | "few" | "adequate" | "strong"
  imageAltTags: IssueType
  urlStructure: IssueType
  notes: string
}

// ── Schema Markup ─────────────────────────────────────────────────────────────

export interface SchemaMarkup {
  detected: boolean
  types: string[]
  recommended: string[]
  richResultEligible: boolean
  verdict: IssueType
  notes: string
}

// ── Mobile Usability ──────────────────────────────────────────────────────────

export interface MobileUsability {
  viewportConfigured: boolean
  tapTargetsAdequate: IssueType
  fontSizesReadable: IssueType
  mobileLayoutVerdict: IssueType
  notes: string
}

// ── Backlink Profile ──────────────────────────────────────────────────────────

export interface BacklinkProfile {
  domainAuthorityEstimate: "low" | "moderate" | "high"
  domainAgeSignal: "new" | "established" | "authoritative"
  backlinkStrengthEstimate: IssueType
  topLinkingTypesLikely: string[]
  anchorDiversityEstimate: IssueType
  notes: string
}

// ── Competitor Gap ────────────────────────────────────────────────────────────

export interface CompetitorGap {
  topRankingSignals: string[]
  missingFromThisPage: string[]
  contentLengthGap: "shorter" | "similar" | "longer"
  topOpportunities: string[]
  notes: string
}

// ── Full SEO Result ───────────────────────────────────────────────────────────

export interface SEOResult {
  score: number
  summary: string
  topStrengths: string[]
  quickWins: string[]
  algorithmInsights: string

  categoryScores: {
    "Title & Meta": number
    "Content Quality": number
    "Core Web Vitals": number
    "Technical SEO": number
    "On-Page Structure": number
    "Schema Markup": number
    "Mobile Usability": number
    "Backlink Profile": number
    "Page Speed": number
    "Competitor Gap": number
  }

  issues: Issue[]

  titleMeta: TitleMetaAnalysis
  contentQuality: ContentQuality
  coreWebVitals: CoreWebVitals
  technicalSEO: TechnicalSEO
  onPageStructure: OnPageStructure
  schemaMarkup: SchemaMarkup
  mobileUsability: MobileUsability
  backlinkProfile: BacklinkProfile
  competitorGap: CompetitorGap
}
