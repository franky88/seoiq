/**
 * lib/crawler.ts
 *
 * Production-grade URL crawler for SEO analysis.
 * Extracts all signals needed for a comprehensive SEO audit.
 *
 * Install dependencies:
 *   npm install cheerio
 *   npm install --save-dev @types/cheerio
 */

import * as cheerio from "cheerio"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CrawlResult {
  // Page metadata
  url: string
  finalUrl: string // After redirects
  statusCode: number
  redirectChain: string[]
  crawledAt: string // ISO timestamp

  // Title & meta
  title: string
  titleLength: number
  metaDescription: string
  metaDescLength: number
  metaKeywords: string
  metaRobots: string
  canonicalUrl: string
  hasCanonical: boolean

  // Open Graph / Social
  hasOpenGraph: boolean
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  hasTwitterCard: boolean
  twitterCard: string

  // Headings
  h1: string[]
  h2: string[]
  h3: string[]
  h1Count: number

  // Content
  wordCount: number
  bodyText: string // First 4000 chars for AI
  readingTimeMin: number
  hasFAQContent: boolean

  // Links
  internalLinks: number
  externalLinks: number
  brokenAnchors: number // href="#" or href=""
  nofollowLinks: number

  // Images
  totalImages: number
  imagesMissingAlt: number
  imagesEmptyAlt: number
  largeImages: string[] // src of images with no width/height attrs

  // Structured data
  hasStructuredData: boolean
  structuredDataTypes: string[] // e.g. ["Article", "BreadcrumbList"]
  structuredDataRaw: string[] // raw JSON-LD blocks (first 2)

  // Technical
  hasViewport: boolean
  isHTTPS: boolean
  hasHreflang: boolean
  hreflangLocales: string[]
  langAttribute: string
  hasFavicon: boolean
  hasSitemap: boolean // only if /sitemap.xml was checked
  hasRobotsTxt: boolean // only if /robots.txt was checked

  // Performance hints (from HTML analysis only — no real CWV)
  inlineScriptCount: number
  inlineStyleCount: number
  externalScriptCount: number
  externalStyleCount: number
  hasLazyLoadImages: boolean
  hasPreconnect: boolean
  hasDNSPrefetch: boolean

  // Errors / warnings from crawl
  crawlErrors: string[]
}

export interface CrawlOptions {
  timeout?: number // ms, default 12000
  followRedirects?: boolean // default true
  checkRobotsTxt?: boolean // default true
  checkSitemap?: boolean // default true
  userAgent?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_UA =
  "Mozilla/5.0 (compatible; SEOIQBot/1.0; +https://seoiq.app/bot)"

const DEFAULT_OPTIONS: Required<CrawlOptions> = {
  timeout: 12_000,
  followRedirects: true,
  checkRobotsTxt: true,
  checkSitemap: true,
  userAgent: DEFAULT_UA,
}

// Words per minute reading speed
const READING_WPM = 200

// ── Main crawler function ──────────────────────────────────────────────────────

export async function crawlUrl(
  rawUrl: string,
  options?: CrawlOptions
): Promise<CrawlResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []

  // Normalize URL
  let targetUrl: string
  try {
    targetUrl = normalizeUrl(rawUrl)
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`)
  }

  const isHTTPS = targetUrl.startsWith("https://")

  // ── Fetch the page ─────────────────────────────────────────────────────────

  let html = ""
  let statusCode = 0
  let finalUrl = targetUrl
  const redirectChain: string[] = []

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout)

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: opts.followRedirects ? "follow" : "manual",
      headers: {
        "User-Agent": opts.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    })

    clearTimeout(timeoutId)
    statusCode = response.status
    finalUrl = response.url ?? targetUrl

    // Track redirects
    if (finalUrl !== targetUrl) {
      redirectChain.push(targetUrl, finalUrl)
    }

    if (!response.ok && statusCode !== 200) {
      errors.push(`HTTP ${statusCode} response`)
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html")) {
      errors.push(`Non-HTML content-type: ${contentType}`)
    }

    html = await response.text()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("aborted")) {
      errors.push(`Crawl timed out after ${opts.timeout}ms`)
    } else {
      errors.push(`Fetch error: ${msg}`)
    }
  }

  // ── Parse HTML ─────────────────────────────────────────────────────────────

  const $ = html ? cheerio.load(html) : cheerio.load("")
  const origin = getOrigin(finalUrl)

  // Title
  const title = $("title").first().text().trim()
  const titleLength = title.length

  // Meta tags
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ?? ""
  const metaDescLength = metaDescription.length
  const metaKeywords = $('meta[name="keywords"]').attr("content")?.trim() ?? ""
  const metaRobots = $('meta[name="robots"]').attr("content")?.trim() ?? ""

  // Canonical
  const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() ?? ""
  const hasCanonical = canonicalUrl.length > 0

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() ?? ""
  const ogDescription =
    $('meta[property="og:description"]').attr("content")?.trim() ?? ""
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim() ?? ""
  const ogType = $('meta[property="og:type"]').attr("content")?.trim() ?? ""
  const hasOpenGraph = !!$('meta[property^="og:"]').length

  // Twitter Card
  const twitterCard =
    $('meta[name="twitter:card"]').attr("content")?.trim() ?? ""
  const hasTwitterCard = !!twitterCard

  // Lang
  const langAttribute = $("html").attr("lang")?.trim() ?? ""

  // Viewport
  const hasViewport = !!$('meta[name="viewport"]').length

  // Favicon
  const hasFavicon = !!(
    $('link[rel="icon"]').length ||
    $('link[rel="shortcut icon"]').length ||
    $('link[rel="apple-touch-icon"]').length
  )

  // Hreflang
  const hreflangLocales: string[] = []
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const locale = $(el).attr("hreflang")
    if (locale) hreflangLocales.push(locale)
  })
  const hasHreflang = hreflangLocales.length > 0

  // Headings
  const h1: string[] = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
  const h2: string[] = $("h2")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 15)
  const h3: string[] = $("h3")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 10)

  // Body text & word count
  // Remove script/style content from text extraction
  $("script, style, noscript, iframe").remove()
  const rawBodyText = $("body").text().replace(/\s+/g, " ").trim()
  const words = rawBodyText.split(" ").filter(Boolean)
  const wordCount = words.length
  const bodyText = rawBodyText.substring(0, 4000)
  const readingTimeMin = Math.ceil(wordCount / READING_WPM)

  // FAQ detection
  const hasFAQContent =
    html.toLowerCase().includes('"@type":"faqpage"') ||
    !!$('[class*="faq"], [id*="faq"]').length ||
    !!$("details summary").length

  // Links
  let internalLinks = 0
  let externalLinks = 0
  let brokenAnchors = 0
  let nofollowLinks = 0

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? ""
    const rel = $(el).attr("rel") ?? ""

    if (!href || href === "#" || href === "javascript:void(0)") {
      brokenAnchors++
      return
    }

    if (rel.includes("nofollow")) nofollowLinks++

    if (href.startsWith("/") || href.startsWith(origin)) {
      internalLinks++
    } else if (href.startsWith("http")) {
      externalLinks++
    }
  })

  // Images
  let totalImages = 0
  let imagesMissingAlt = 0
  let imagesEmptyAlt = 0
  const largeImages: string[] = []

  $("img").each((_, el) => {
    totalImages++
    const alt = $(el).attr("alt")
    const src = $(el).attr("src") ?? ""
    const width = $(el).attr("width")
    const height = $(el).attr("height")

    if (alt === undefined) imagesMissingAlt++
    else if (alt.trim() === "") imagesEmptyAlt++

    if (!width && !height && src) {
      largeImages.push(src.substring(0, 100)) // cap URL length
    }
  })

  // Lazy loading
  const hasLazyLoadImages = !!$('img[loading="lazy"]').length

  // Structured data
  const structuredDataRaw: string[] = []
  const structuredDataTypes: string[] = []

  $('script[type="application/ld+json"]').each((i, el) => {
    if (i >= 2) return // Only first 2 blocks
    const raw = $(el).html()?.trim() ?? ""
    if (!raw) return

    structuredDataRaw.push(raw.substring(0, 500))

    try {
      const parsed = JSON.parse(raw)
      const types = extractSchemaTypes(parsed)
      structuredDataTypes.push(...types)
    } catch {
      errors.push("Invalid JSON-LD block found")
    }
  })

  const hasStructuredData = structuredDataRaw.length > 0

  // Performance signals
  const inlineScriptCount = $("script:not([src])").length
  const inlineStyleCount = $("style").length
  const externalScriptCount = $("script[src]").length
  const externalStyleCount = $('link[rel="stylesheet"]').length
  const hasPreconnect = !!$('link[rel="preconnect"]').length
  const hasDNSPrefetch = !!$('link[rel="dns-prefetch"]').length

  // ── Side-checks: robots.txt & sitemap ─────────────────────────────────────

  let hasRobotsTxt = false
  let hasSitemap = false

  if (opts.checkRobotsTxt) {
    hasRobotsTxt = await checkUrl(`${origin}/robots.txt`, opts.timeout / 3)
  }

  if (opts.checkSitemap) {
    hasSitemap =
      (await checkUrl(`${origin}/sitemap.xml`, opts.timeout / 3)) ||
      (await checkUrl(`${origin}/sitemap_index.xml`, opts.timeout / 3))
  }

  // ── Validation warnings ────────────────────────────────────────────────────

  if (!title) errors.push("Missing <title> tag")
  if (h1.length === 0) errors.push("No H1 tag found")
  if (h1.length > 1) errors.push(`Multiple H1 tags found (${h1.length})`)
  if (titleLength > 60)
    errors.push(`Title too long (${titleLength} chars, max 60)`)
  if (titleLength < 30 && title)
    errors.push(`Title too short (${titleLength} chars, min 30)`)
  if (metaDescLength > 160)
    errors.push(`Meta description too long (${metaDescLength} chars)`)
  if (!metaDescription) errors.push("Missing meta description")
  if (!hasViewport) errors.push("Missing viewport meta tag — mobile SEO issue")
  if (!isHTTPS) errors.push("Site not served over HTTPS")
  if (wordCount < 300)
    errors.push(`Low word count (${wordCount} words, aim for 300+)`)

  return {
    // Identity
    url: rawUrl,
    finalUrl,
    statusCode,
    redirectChain,
    crawledAt: new Date().toISOString(),

    // Title & meta
    title,
    titleLength,
    metaDescription,
    metaDescLength,
    metaKeywords,
    metaRobots,
    canonicalUrl,
    hasCanonical,

    // Social
    hasOpenGraph,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    hasTwitterCard,
    twitterCard,

    // Headings
    h1,
    h2,
    h3,
    h1Count: h1.length,

    // Content
    wordCount,
    bodyText,
    readingTimeMin,
    hasFAQContent,

    // Links
    internalLinks,
    externalLinks,
    brokenAnchors,
    nofollowLinks,

    // Images
    totalImages,
    imagesMissingAlt,
    imagesEmptyAlt,
    largeImages: largeImages.slice(0, 5), // Cap at 5

    // Structured data
    hasStructuredData,
    structuredDataTypes: [...new Set(structuredDataTypes)],
    structuredDataRaw,

    // Technical
    hasViewport,
    isHTTPS,
    hasHreflang,
    hreflangLocales,
    langAttribute,
    hasFavicon,
    hasSitemap,
    hasRobotsTxt,

    // Performance
    inlineScriptCount,
    inlineStyleCount,
    externalScriptCount,
    externalStyleCount,
    hasLazyLoadImages,
    hasPreconnect,
    hasDNSPrefetch,

    // Errors
    crawlErrors: errors,
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

/**
 * Builds an enriched SEO audit prompt using real crawl data.
 * Far more accurate than URL-only inference.
 */
export function buildPromptFromCrawlData(data: CrawlResult): string {
  const redirectNote =
    data.redirectChain.length > 0
      ? `REDIRECT CHAIN: ${data.redirectChain.join(" → ")}`
      : "NO REDIRECTS"

  const schemaTypes =
    data.structuredDataTypes.length > 0
      ? data.structuredDataTypes.join(", ")
      : "None detected"

  return `You are a senior SEO specialist with 10+ years of experience.
The following data was crawled directly from a live webpage. Every field is real — do not speculate.

=== PAGE IDENTITY ===
URL: ${data.finalUrl}
HTTP Status: ${data.statusCode}
${redirectNote}
Crawled At: ${data.crawledAt}
HTTPS: ${data.isHTTPS}
Language: ${data.langAttribute || "Not set"}

=== META & TITLE ===
Title: ${data.title || "(MISSING)"}
Title Length: ${data.titleLength} characters (ideal: 30–60)
Meta Description: ${data.metaDescription || "(MISSING)"}
Meta Desc Length: ${data.metaDescLength} characters (ideal: 70–160)
Meta Keywords: ${data.metaKeywords || "None"}
Meta Robots: ${data.metaRobots || "Not set (default: index, follow)"}
Canonical URL: ${data.canonicalUrl || "(MISSING)"}

=== OPEN GRAPH / SOCIAL ===
Has Open Graph: ${data.hasOpenGraph}
OG Title: ${data.ogTitle || "(MISSING)"}
OG Description: ${data.ogDescription || "(MISSING)"}
OG Image: ${data.ogImage || "(MISSING)"}
Has Twitter Card: ${data.hasTwitterCard} (${data.twitterCard || "none"})

=== HEADINGS ===
H1 Count: ${data.h1Count} (ideal: exactly 1)
H1 Tags: ${data.h1.join(" | ") || "(NONE)"}
H2 Tags (first 10): ${data.h2.slice(0, 10).join(" | ") || "(NONE)"}
H3 Tags (first 5): ${data.h3.slice(0, 5).join(" | ") || "(NONE)"}

=== CONTENT ===
Word Count: ${data.wordCount} (ideal: 600+ for informational, 300+ for service pages)
Reading Time: ~${data.readingTimeMin} minute(s)
Has FAQ Content/Schema: ${data.hasFAQContent}

=== LINKS ===
Internal Links: ${data.internalLinks}
External Links: ${data.externalLinks}
Broken/Empty Anchors: ${data.brokenAnchors}
Nofollow Links: ${data.nofollowLinks}

=== IMAGES ===
Total Images: ${data.totalImages}
Missing Alt Text: ${data.imagesMissingAlt}
Empty Alt Text: ${data.imagesEmptyAlt}
Images Without Dimensions: ${data.largeImages.length}
Lazy Loading Used: ${data.hasLazyLoadImages}

=== STRUCTURED DATA ===
Has Schema Markup: ${data.hasStructuredData}
Schema Types Found: ${schemaTypes}

=== TECHNICAL ===
Has Viewport Meta: ${data.hasViewport}
Has Favicon: ${data.hasFavicon}
Has Hreflang: ${data.hasHreflang}${data.hasHreflang ? ` (${data.hreflangLocales.join(", ")})` : ""}
Robots.txt Present: ${data.hasRobotsTxt}
Sitemap Present: ${data.hasSitemap}

=== PERFORMANCE SIGNALS ===
Inline Scripts: ${data.inlineScriptCount}
Inline Styles: ${data.inlineStyleCount}
External Scripts: ${data.externalScriptCount}
External Stylesheets: ${data.externalStyleCount}
Has Preconnect Hints: ${data.hasPreconnect}
Has DNS Prefetch: ${data.hasDNSPrefetch}

=== CRAWL WARNINGS ===
${data.crawlErrors.length > 0 ? data.crawlErrors.map((e) => `• ${e}`).join("\n") : "• None"}

=== PAGE CONTENT SAMPLE (first 4000 chars) ===
${data.bodyText || "(No body text extracted)"}

=== INSTRUCTIONS ===
Analyze ALL of the above data against 2024–2025 Google algorithm standards:
- Helpful Content System (HCS)
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Core Web Vitals (LCP, INP, CLS) — use performance signals as indicators
- Page Experience (HTTPS, mobile-friendly, no intrusive interstitials)
- Passage Indexing (heading structure and content sections)
- Mobile-first indexing (viewport, responsive signals)
- Structured data / Schema.org correctness
- Internal linking architecture
- Title and meta optimization

Rules:
- Every issue must be directly supported by the crawl data above — no speculation
- Every fix must be specific and actionable (include examples where possible)
- Severity: critical = blocks rankings, warning = reduces rankings, good = positive signal, info = neutral
- Return ONLY valid JSON — no markdown, no preamble, start with {

{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "topStrengths": ["<strength>", "<strength>", "<strength>"],
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
      "title": "<concise title, max 10 words>",
      "type": "<critical|warning|good|info>",
      "category": "<one of the 6 categories above>",
      "description": "<why this matters, max 60 words>",
      "fix": "<specific action with example, max 60 words>"
    }
  ],
  "quickWins": ["<action 1>", "<action 2>", "<action 3>"],
  "algorithmInsights": "<paragraph on which 2024-2025 Google updates most affect this page>"
}`
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  const withProtocol = trimmed.startsWith("http")
    ? trimmed
    : `https://${trimmed}`
  return new URL(withProtocol).href
}

function getOrigin(url: string): string {
  try {
    return new URL(url).origin
  } catch {
    return ""
  }
}

/** Silently checks if a URL returns a 2xx. Used for robots.txt / sitemap. */
async function checkUrl(url: string, timeout: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": DEFAULT_UA },
    })
    clearTimeout(id)
    return res.ok
  } catch {
    return false
  }
}

/** Recursively extracts all @type values from a JSON-LD object or array. */
function extractSchemaTypes(obj: unknown): string[] {
  if (!obj || typeof obj !== "object") return []

  const types: string[] = []

  if (Array.isArray(obj)) {
    for (const item of obj) {
      types.push(...extractSchemaTypes(item))
    }
    return types
  }

  const record = obj as Record<string, unknown>
  if (record["@type"]) {
    const t = record["@type"]
    if (typeof t === "string") types.push(t)
    else if (Array.isArray(t))
      types.push(...t.filter((x): x is string => typeof x === "string"))
  }

  for (const value of Object.values(record)) {
    if (typeof value === "object") {
      types.push(...extractSchemaTypes(value))
    }
  }

  return types
}
