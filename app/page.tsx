"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CheckCircle2,
  Search,
  BarChart2,
  TrendingUp,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

// ── Score Ring (animated) ─────────────────────────────────────────────────────
// SVG stroke — static hex fallback (documented exception)

const AnimatedScoreRing = ({
  score,
  size = 160,
}: {
  score: number
  size?: number
}) => {
  const [displayed, setDisplayed] = useState(0)
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const dash = (displayed / 100) * circ

  useEffect(() => {
    const timeout = setTimeout(() => {
      let current = 0
      const step = score / 60
      const timer = setInterval(() => {
        current += step
        if (current >= score) {
          setDisplayed(score)
          clearInterval(timer)
        } else setDisplayed(Math.floor(current))
      }, 16)
      return () => clearInterval(timer)
    }, 600)
    return () => clearTimeout(timeout)
  }, [score])

  const color =
    displayed >= 85
      ? "#0FA968"
      : displayed >= 70
        ? "#EAB308"
        : displayed >= 40
          ? "#F97316"
          : "#EF4444"

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1c2333"
        strokeWidth={size * 0.065}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.065}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.05s linear" }}
      />
      <text
        x={size / 2}
        y={size / 2 - size * 0.04}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.22}
        fontWeight="900"
        fontFamily="inherit"
      >
        {displayed}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.14}
        textAnchor="middle"
        fill="#3a4560"
        fontSize={size * 0.075}
        fontFamily="inherit"
      >
        / 100
      </text>
    </svg>
  )
}

// ── Waitlist form ─────────────────────────────────────────────────────────────

const WaitlistForm = ({ className }: { className?: string }) => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email.")
      return
    }
    setStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? "Failed")
      setStatus("success")
      setMessage("You're on the list! We'll notify you at launch.")
      setEmail("")
    } catch (e) {
      setStatus("error")
      setMessage((e as Error).message ?? "Something went wrong.")
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-seoiq-good/30 bg-seoiq-good/10 px-5 py-4",
          className
        )}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-seoiq-good" />
        <p className="text-sm font-medium text-seoiq-good">{message}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          className="h-12 border-seoiq-border-medium bg-seoiq-surface text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-seoiq-green"
        />
        <Button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="h-12 shrink-0 bg-seoiq-green px-6 font-bold tracking-wide text-seoiq-charcoal hover:bg-seoiq-green-dark"
        >
          {status === "loading" ? (
            "..."
          ) : (
            <>
              Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {status === "error" && (
        <p className="pl-1 text-xs text-seoiq-critical">{message}</p>
      )}
      <p className="pl-1 text-xs text-muted-foreground">
        No spam. Early access when we launch.
      </p>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section = ({
  children,
  className,
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) => (
  <section
    id={id}
    className={cn("mx-auto w-full max-w-5xl px-6 py-20", className)}
  >
    {children}
  </section>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 flex items-center gap-2">
    <div className="h-px w-8 bg-seoiq-green" />
    <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-seoiq-green uppercase">
      {children}
    </span>
  </div>
)

// ── Animated counter ──────────────────────────────────────────────────────────

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        let current = 0
        const step = to / 50
        const timer = setInterval(() => {
          current += step
          if (current >= to) {
            setVal(to)
            clearInterval(timer)
          } else setVal(Math.floor(current))
        }, 20)
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Search,
    title: "SEO Audit",
    desc: "Full site audit against 2024–2025 Google algorithm standards. Score, category breakdown, issue cards, quick wins, and algorithm insights — in under 10 seconds.",
    tags: ["E-E-A-T", "Core Web Vitals", "Helpful Content"],
    accent: "text-seoiq-good border-seoiq-good/20 bg-seoiq-good/5",
  },
  {
    icon: BarChart2,
    title: "Keyword Research",
    desc: "AI-powered keyword discovery with search intent classification, difficulty scoring, monthly volume estimates, and content gap analysis for any URL or topic.",
    tags: ["Search Intent", "KD Score", "Content Gaps"],
    accent: "text-seoiq-info border-seoiq-info/20 bg-seoiq-info/5",
  },
  {
    icon: TrendingUp,
    title: "Rank Tracker",
    desc: "Track keyword positions over time with AI-estimated rankings, sparkline history charts, trend indicators, and per-keyword improvement insights.",
    tags: ["Position History", "Trend Analysis", "Quick Fixes"],
    accent: "text-seoiq-warning border-seoiq-warning/20 bg-seoiq-warning/5",
  },
]

const STEPS = [
  {
    step: "01",
    title: "Enter your URL or topic",
    desc: "Paste any website URL or describe your niche. No setup, no crawlers to configure.",
  },
  {
    step: "02",
    title: "AI analyzes in seconds",
    desc: "Llama 3.3 70B audits your page against current Google standards and returns structured findings.",
  },
  {
    step: "03",
    title: "Act on clear fixes",
    desc: "Every issue comes with a specific, actionable fix. No jargon. No vague recommendations.",
  },
]

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Get started, no card required.",
    features: [
      "3 audits per month",
      "SEO issue detection",
      "Category score breakdown",
      "Quick wins + insights",
    ],
    cta: "Join Waitlist",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    desc: "For marketers and growing sites.",
    features: [
      "Unlimited audits",
      "Keyword research tool",
      "Rank tracker",
      "PDF export",
      "Full audit history",
      "All AI models",
    ],
    cta: "Join Waitlist",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$79",
    period: "/mo",
    desc: "For teams managing multiple clients.",
    features: [
      "Everything in Pro",
      "White-label reports",
      "5 team seats",
      "Priority support",
      "Bulk URL auditing",
      "API access (coming soon)",
    ],
    cta: "Join Waitlist",
    highlight: false,
  },
]

const FAQS = [
  {
    q: "How accurate are the AI-estimated rankings?",
    a: "Rankings are directional estimates based on keyword competitiveness, domain authority signals, and content relevance — not live SERP data. They're best used for trend tracking and relative comparisons, not as absolute position data. Pro plan will include optional SERP API integration for live positions.",
  },
  {
    q: "Which AI model powers SEOIQ?",
    a: "SEOIQ uses Llama 3.3 70B via Groq's ultra-fast inference by default, with Llama 4 Scout, Llama 3.1 8B, and GPT-OSS 120B available for Pro users. All models run on Groq's LPU hardware for sub-10-second audit times.",
  },
  {
    q: "Do I need an API key to use SEOIQ?",
    a: "No. SEOIQ manages the API keys server-side — you just sign up and start auditing. The free plan covers 3 audits per month with no technical setup required.",
  },
  {
    q: "How is this different from Ahrefs or Semrush?",
    a: "SEOIQ uses AI to explain why each issue matters and provide specific, plain-English fixes — not just flag problems. It's designed for non-technical business owners and marketers, not SEO specialists. It's also a fraction of the cost.",
  },
  {
    q: "When is the full product launching?",
    a: "We're in private beta. Join the waitlist and you'll be among the first to get access, along with early-bird pricing locked in before public launch.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Audit data is tied to your account and never shared. URLs you audit are not used to train any models. Full privacy policy will be published at launch.",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-seoiq-bg text-foreground">
      {/* ── Grid texture overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-seoiq-border-subtle bg-seoiq-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl text-seoiq-green">◈</span>
            <span className="font-semibold tracking-wide">
              <span className="text-seoiq-green">SEO</span>
              <span className="text-foreground">IQ</span>
            </span>
            <Badge
              variant="outline"
              className="border-seoiq-green/40 text-[9px] tracking-widest text-seoiq-green"
            >
              BETA
            </Badge>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {["Features", "How it Works", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-seoiq-surface hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              className="bg-seoiq-green text-xs font-bold tracking-wide text-seoiq-charcoal hover:bg-seoiq-green-dark"
              size="sm"
              asChild
            >
              <a href="#waitlist">Join Waitlist</a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-24 text-center md:pt-32">
        {/* Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #0FA968 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 space-y-6">
          <Badge
            variant="outline"
            className="border-seoiq-green/30 bg-seoiq-green/5 px-4 py-1.5 text-[11px] font-semibold tracking-widest text-seoiq-green"
          >
            AI-POWERED SEO · POWERED BY GROQ + LLAMA 3.3
          </Badge>

          <h1 className="mx-auto max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-foreground md:text-6xl">
            Know exactly why your site{" "}
            <span className="text-seoiq-green">isn't ranking.</span>
            <br />
            <span className="text-muted-foreground">Fix it in minutes.</span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            SEOIQ audits your pages against 2024–2025 Google standards,
            discovers your best keyword opportunities, and tracks your rankings
            — all powered by AI, no technical expertise required.
          </p>

          {/* Animated score rings demo */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-4">
            {[
              {
                score: 91,
                label: "Excellent",
                cls: "text-seoiq-score-excellent",
              },
              { score: 74, label: "Good", cls: "text-seoiq-score-good" },
              {
                score: 47,
                label: "Needs Work",
                cls: "text-seoiq-score-warning",
              },
              {
                score: 23,
                label: "Critical",
                cls: "text-seoiq-score-critical",
              },
            ].map((item) => (
              <div
                key={item.score}
                className="flex flex-col items-center gap-2"
              >
                <AnimatedScoreRing score={item.score} size={88} />
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-widest",
                    item.cls
                  )}
                >
                  {item.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Waitlist form */}
          <div id="waitlist" className="mx-auto w-full max-w-md pt-2">
            <WaitlistForm />
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {[
              { value: 10, suffix: "s", label: "avg audit time" },
              { value: 6, suffix: "", label: "SEO categories" },
              { value: 3, suffix: "", label: "AI tools in one" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-black text-seoiq-green">
                  <Counter to={item.value} suffix={item.suffix} />
                </div>
                <div className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-seoiq-border-subtle" />

      {/* ── Features ── */}
      <Section id="features">
        <SectionLabel>Features</SectionLabel>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">
          Three tools. One platform.
        </h2>
        <p className="mb-14 max-w-xl text-base text-muted-foreground">
          Everything you need to understand your SEO performance, find new
          opportunities, and track your progress over time.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={cn(
                  "group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  f.accent
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={cn(
                    "mb-4 flex h-10 w-10 items-center justify-center rounded-xl border",
                    f.accent
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
                        f.accent
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Separator className="bg-seoiq-border-subtle" />

      {/* ── How it works ── */}
      <Section id="how-it-works">
        <SectionLabel>How it Works</SectionLabel>
        <h2 className="mb-14 text-3xl font-black tracking-tight text-foreground md:text-4xl">
          From URL to action plan
          <br />
          <span className="text-seoiq-green">in three steps.</span>
        </h2>

        <div className="relative space-y-0">
          {/* Connector line */}
          <div className="absolute top-8 left-[28px] h-[calc(100%-64px)] w-px bg-seoiq-border-subtle md:left-[39px]" />

          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className="relative flex gap-6 pb-12 last:pb-0"
            >
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-seoiq-border-medium bg-seoiq-surface font-mono text-xs font-bold text-seoiq-green">
                {step.step}
              </div>
              <div className="pt-2">
                <h3 className="mb-1.5 text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Why faster matters */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "< 10 seconds",
              desc: "Average audit time via Groq's LPU inference",
            },
            {
              icon: Shield,
              title: "No API key",
              desc: "We manage the infrastructure. You just audit.",
            },
            {
              icon: Clock,
              title: "Plain English",
              desc: "Every finding comes with a clear, actionable fix",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-seoiq-border-subtle bg-seoiq-surface p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-seoiq-green/10">
                  <Icon className="h-4 w-4 text-seoiq-green" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Separator className="bg-seoiq-border-subtle" />

      {/* ── Pricing ── */}
      <Section id="pricing">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="mb-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">
          Simple, transparent pricing.
        </h2>
        <p className="mb-14 max-w-lg text-base text-muted-foreground">
          Start free. Upgrade when you need more. All plans include the core
          audit engine.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 transition-all duration-200",
                plan.highlight
                  ? "border-seoiq-green bg-seoiq-green/5 shadow-[0_0_40px_-8px_rgba(15,169,104,0.2)]"
                  : "border-seoiq-border-subtle bg-seoiq-surface"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-seoiq-green px-3 text-[10px] font-bold tracking-widest text-seoiq-charcoal">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <p className="mb-1 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {plan.desc}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-seoiq-good" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full font-bold tracking-wide",
                  plan.highlight
                    ? "bg-seoiq-green text-seoiq-charcoal hover:bg-seoiq-green-dark"
                    : "border border-seoiq-border-medium bg-transparent text-foreground hover:bg-seoiq-surface-raised"
                )}
                variant={plan.highlight ? "default" : "outline"}
                asChild
              >
                <a href="#waitlist">
                  {plan.cta} <ChevronRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Separator className="bg-seoiq-border-subtle" />

      {/* ── FAQ ── */}
      <Section id="faq">
        <div className="mx-auto max-w-2xl">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mb-10 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Common questions.
          </h2>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border-seoiq-border-subtle bg-seoiq-surface px-5 data-[state=open]:border-seoiq-green/30 data-[state=open]:bg-seoiq-green/5"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      <Separator className="bg-seoiq-border-subtle" />

      {/* ── Final CTA ── */}
      <Section className="text-center">
        <div className="mx-auto max-w-xl space-y-6">
          <span className="text-4xl">◈</span>
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Get early access.
          </h2>
          <p className="text-base text-muted-foreground">
            Join the waitlist and be first in line when SEOIQ launches publicly.
            Early members get locked-in launch pricing.
          </p>
          <WaitlistForm className="mx-auto max-w-md" />
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-seoiq-border-subtle bg-seoiq-surface">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="text-lg text-seoiq-green">◈</span>
              <span className="font-semibold tracking-wide">
                <span className="text-seoiq-green">SEO</span>
                <span className="text-foreground">IQ</span>
              </span>
              <span className="text-xs text-muted-foreground">
                · AI-Powered SEO Platform
              </span>
            </div>
            <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <a
                href="/legal?tab=privacy"
                className="rounded px-2.5 py-1 transition-colors hover:bg-seoiq-surface-raised hover:text-foreground"
              >
                Privacy Policy
              </a>
              <span className="text-muted-foreground/30 select-none">·</span>
              <a
                href="/legal?tab=terms"
                className="rounded px-2.5 py-1 transition-colors hover:bg-seoiq-surface-raised hover:text-foreground"
              >
                Terms of Use
              </a>
              <span className="text-muted-foreground/30 select-none">·</span>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded px-2.5 py-1 transition-colors hover:bg-seoiq-surface-raised hover:text-foreground"
              >
                Powered by Groq <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </nav>
          </div>
          <Separator className="my-6 bg-seoiq-border-subtle" />
          <p className="text-center text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} SEOIQ. All rights reserved. AI position
            estimates are directional and not guaranteed.
          </p>
        </div>
      </footer>
    </div>
  )
}
