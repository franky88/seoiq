type InputMode = "url" | "content"

interface PromptOptions {
  url?: string
  content?: string
  mode: InputMode
}

export function buildSEOPrompt({ url, content, mode }: PromptOptions): string {
  const subject =
    mode === "url"
      ? `website URL: ${url}`
      : `page content:\n${content?.substring(0, 4000)}`

  return `You are a senior SEO specialist with 10+ years of experience. Perform a comprehensive audit of the following ${subject}.

Analyze ALL ten SEO dimensions listed below. Be specific and data-driven. Where exact data is unavailable, make well-reasoned estimates based on URL structure, domain signals, and content patterns.

Return ONLY valid raw JSON — no markdown, no preamble, start with {

{
  "score": <integer 0-100, weighted average across all dimensions>,
  "summary": "<3-sentence executive summary of overall SEO health>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "quickWins": ["<actionable win 1>", "<actionable win 2>", "<actionable win 3>"],
  "algorithmInsights": "<paragraph on which 2024-2025 Google algorithm updates most affect this site>",

  "categoryScores": {
    "Title & Meta": <0-100>,
    "Content Quality": <0-100>,
    "Core Web Vitals": <0-100>,
    "Technical SEO": <0-100>,
    "On-Page Structure": <0-100>,
    "Schema Markup": <0-100>,
    "Mobile Usability": <0-100>,
    "Backlink Profile": <0-100>,
    "Page Speed": <0-100>,
    "Competitor Gap": <0-100>
  },

  "issues": [
    {
      "title": "<concise issue title, max 10 words>",
      "type": "<critical|warning|good|info>",
      "category": "<category name>",
      "description": "<why this matters, max 60 words>",
      "fix": "<specific actionable fix, max 60 words>"
    }
  ],

  "titleMeta": {
    "titleTag": "<title tag text>",
    "titleLength": <integer>,
    "titleHasKeyword": <true|false>,
    "titleVerdict": "<critical|warning|good|info>",
    "metaDescription": "<meta description text>",
    "metaLength": <integer>,
    "metaHasKeyword": <true|false>,
    "metaVerdict": "<critical|warning|good|info>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  },

  "contentQuality": {
    "estimatedWordCount": <integer>,
    "readabilityLevel": "<easy|moderate|difficult>",
    "readabilityScore": <integer 0-100>,
    "eeeatSignals": {
      "experience": "<critical|warning|good|info>",
      "expertise": "<critical|warning|good|info>",
      "authoritativeness": "<critical|warning|good|info>",
      "trustworthiness": "<critical|warning|good|info>"
    },
    "contentDepth": "<thin|moderate|comprehensive>",
    "uniquenessSignal": "<critical|warning|good|info>",
    "notes": "<2-sentence assessment>"
  },

  "coreWebVitals": {
    "lcp": { "estimate": "<good|needs-improvement|poor>", "notes": "<1 sentence>" },
    "inp": { "estimate": "<good|needs-improvement|poor>", "notes": "<1 sentence>" },
    "cls": { "estimate": "<good|needs-improvement|poor>", "notes": "<1 sentence>" },
    "overallVerdict": "<critical|warning|good|info>",
    "summary": "<2-sentence summary>"
  },

  "technicalSEO": {
    "https": <true|false>,
    "canonicalPresent": <true|false>,
    "robotsIndexable": <true|false>,
    "sitemapLikely": <true|false>,
    "hreflang": <true|false>,
    "mobileFriendly": <true|false>,
    "pageSpeedSignals": {
      "renderBlocking": "<critical|warning|good|info>",
      "imageOptimization": "<critical|warning|good|info>",
      "caching": "<critical|warning|good|info>",
      "minification": "<critical|warning|good|info>"
    },
    "issues": ["<issue 1>", "<issue 2>"],
    "passing": ["<passing 1>", "<passing 2>"]
  },

  "onPageStructure": {
    "h1Count": <integer>,
    "h1Text": "<H1 text>",
    "headingHierarchy": "<critical|warning|good|info>",
    "keywordDensity": "<low|optimal|high>",
    "keywordDensityPct": <float>,
    "internalLinksEstimate": "<none|few|adequate|strong>",
    "imageAltTags": "<critical|warning|good|info>",
    "urlStructure": "<critical|warning|good|info>",
    "notes": "<2-sentence assessment>"
  },

  "schemaMarkup": {
    "detected": <true|false>,
    "types": ["<type 1>"],
    "recommended": ["<rec 1>", "<rec 2>"],
    "richResultEligible": <true|false>,
    "verdict": "<critical|warning|good|info>",
    "notes": "<1-2 sentences>"
  },

  "mobileUsability": {
    "viewportConfigured": <true|false>,
    "tapTargetsAdequate": "<critical|warning|good|info>",
    "fontSizesReadable": "<critical|warning|good|info>",
    "mobileLayoutVerdict": "<critical|warning|good|info>",
    "notes": "<1-2 sentences>"
  },

  "backlinkProfile": {
    "domainAuthorityEstimate": "<low|moderate|high>",
    "domainAgeSignal": "<new|established|authoritative>",
    "backlinkStrengthEstimate": "<critical|warning|good|info>",
    "topLinkingTypesLikely": ["<type 1>", "<type 2>"],
    "anchorDiversityEstimate": "<critical|warning|good|info>",
    "notes": "<2-sentence assessment>"
  },

  "competitorGap": {
    "topRankingSignals": ["<signal 1>", "<signal 2>", "<signal 3>"],
    "missingFromThisPage": ["<missing 1>", "<missing 2>", "<missing 3>"],
    "contentLengthGap": "<shorter|similar|longer>",
    "topOpportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
    "notes": "<2-sentence summary>"
  }
}`
}
