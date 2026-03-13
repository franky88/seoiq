"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const LAST_UPDATED = "March 13, 2026"
const APP_NAME = "SEOIQ"
const CONTACT_EMAIL = "ramosfp99@gmail.com"
const APP_URL = "https://seoiq.vercel.app"

interface Section {
  title: string
  content: React.ReactNode
}

const PrivacySections: Section[] = [
  {
    title: "1. Overview",
    content: (
      <p>
        {APP_NAME} ("we", "our", or "us") is committed to protecting your
        privacy. This Privacy Policy explains how we handle information when you
        use our free AI-powered SEO audit tool at{" "}
        <a
          href={APP_URL}
          className="text-blue-500 underline underline-offset-2"
        >
          {APP_URL}
        </a>
        . By using the Service, you agree to the practices described in this
        policy.
      </p>
    ),
  },
  {
    title: "2. Information We Do NOT Collect",
    content: (
      <div className="space-y-2">
        <p>
          We are designed with privacy in mind. We do <strong>not</strong>{" "}
          collect, store, or process:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Your Groq API key — it is sent directly from your browser to Groq's
            servers and never touches our infrastructure.
          </li>
          <li>The URLs or page content you submit for analysis.</li>
          <li>The SEO audit results generated for your queries.</li>
          <li>
            Personal identification information such as your name, email, or IP
            address.
          </li>
          <li>
            Account credentials of any kind, as we require no registration.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "3. Third-Party Services",
    content: (
      <div className="space-y-3">
        <p>
          When you use {APP_NAME}, your inputs (URL or content) and API key are
          transmitted directly from your browser to <strong>Groq, Inc.</strong>{" "}
          to generate SEO analysis results. We have no control over how Groq
          processes this data. Please review:
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://groq.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
            >
              Groq Privacy Policy <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://groq.com/terms-of-use"
              target="_blank"
              rel="noreferrer"
            >
              Groq Terms of Use <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          We may also use standard web hosting infrastructure (e.g., Vercel)
          which may log basic request metadata such as timestamps and anonymized
          IP addresses for security and performance purposes. Refer to{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline underline-offset-2"
          >
            Vercel's Privacy Policy
          </a>{" "}
          for details.
        </p>
      </div>
    ),
  },
  {
    title: "4. Cookies & Local Storage",
    content: (
      <p>
        {APP_NAME} does not use cookies or local storage to track you. Any state
        (such as your entered API key) exists only in your browser's memory for
        the duration of your session and is discarded when you close or refresh
        the page.
      </p>
    ),
  },
  {
    title: "5. Analytics",
    content: (
      <p>
        We do not currently use any third-party analytics services (e.g., Google
        Analytics). If this changes in the future, we will update this Privacy
        Policy and notify users prominently on the site.
      </p>
    ),
  },
  {
    title: "6. Children's Privacy",
    content: (
      <p>
        {APP_NAME} is not directed at children under the age of 13. We do not
        knowingly collect personal information from children. If you believe a
        child has submitted personal information through the Service, please
        contact us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-blue-500 underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
  {
    title: "7. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. Changes will be
        posted on this page with an updated "Last Updated" date. Continued use
        of the Service after changes constitutes your acceptance of the revised
        policy.
      </p>
    ),
  },
  {
    title: "8. Contact",
    content: (
      <p>
        For any privacy-related questions or concerns, please contact us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-blue-500 underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
]

const TermsSections: Section[] = [
  {
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By accessing or using {APP_NAME} ("the Service") at{" "}
        <a
          href={APP_URL}
          className="text-blue-500 underline underline-offset-2"
        >
          {APP_URL}
        </a>
        , you agree to be bound by these Terms of Use. If you do not agree to
        these terms, please do not use the Service.
      </p>
    ),
  },
  {
    title: "2. Description of Service",
    content: (
      <p>
        {APP_NAME} is a free, browser-based SEO audit tool that uses AI language
        models provided by Groq, Inc. to analyze websites or page content. You
        must supply your own Groq API key to use the Service. The Service is
        provided "as is" and "as available" without warranties of any kind.
      </p>
    ),
  },
  {
    title: "3. Your Groq API Key",
    content: (
      <div className="space-y-2">
        <p>You are solely responsible for:</p>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>Obtaining and maintaining a valid Groq API key.</li>
          <li>All costs and usage associated with your API key.</li>
          <li>Keeping your API key confidential and secure.</li>
          <li>
            Complying with Groq's Terms of Use when using their models through
            this interface.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          We are not responsible for unauthorized use of your API key or any
          charges incurred as a result of using the Service.
        </p>
      </div>
    ),
  },
  {
    title: "4. Acceptable Use",
    content: (
      <div className="space-y-2">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Analyze content that violates any applicable laws or third-party
            rights.
          </li>
          <li>Submit malicious, abusive, or harmful content for analysis.</li>
          <li>
            Attempt to reverse-engineer, scrape, or otherwise misuse the
            Service.
          </li>
          <li>
            Circumvent any technical limitations or security measures of the
            Service.
          </li>
          <li>
            Impersonate any person or entity or misrepresent your affiliation.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "5. Intellectual Property",
    content: (
      <p>
        All content, design, code, and branding of {APP_NAME} — excluding
        user-submitted inputs — are owned by or licensed to us. You may not
        copy, modify, distribute, or create derivative works from the Service
        without our explicit written permission. SEO audit results generated by
        the AI are provided for your personal or commercial use, but we make no
        claim of ownership over them.
      </p>
    ),
  },
  {
    title: "6. Disclaimer of Warranties",
    content: (
      <div className="space-y-2">
        <p>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
          NON-INFRINGEMENT.
        </p>
        <p className="text-sm text-muted-foreground">
          SEO audit results are generated by AI and are for informational
          purposes only. They do not constitute professional SEO advice. We make
          no guarantees about the accuracy, completeness, or usefulness of any
          analysis provided by the Service.
        </p>
      </div>
    ),
  },
  {
    title: "7. Limitation of Liability",
    content: (
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
        ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
        INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
        LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR
        TOTAL LIABILITY SHALL NOT EXCEED $0 (AS THE SERVICE IS PROVIDED FREE OF
        CHARGE).
      </p>
    ),
  },
  {
    title: "8. Third-Party Links & Services",
    content: (
      <p>
        The Service relies on Groq's API and may contain links to third-party
        websites. We are not responsible for the content, privacy practices, or
        terms of any third-party services. Your use of third-party services is
        governed by their respective terms and policies.
      </p>
    ),
  },
  {
    title: "9. Modifications to the Service",
    content: (
      <p>
        We reserve the right to modify, suspend, or discontinue the Service at
        any time without notice. We shall not be liable to you or any third
        party for any modification, suspension, or discontinuation of the
        Service.
      </p>
    ),
  },
  {
    title: "10. Governing Law",
    content: (
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the jurisdiction in which we operate, without regard to its
        conflict of law provisions. Any disputes arising under these Terms shall
        be subject to the exclusive jurisdiction of the courts in that
        jurisdiction.
      </p>
    ),
  },
  {
    title: "11. Changes to Terms",
    content: (
      <p>
        We reserve the right to update these Terms at any time. Updated Terms
        will be posted on this page with a revised "Last Updated" date. Your
        continued use of the Service after any changes constitutes your
        acceptance of the new Terms.
      </p>
    ),
  },
  {
    title: "12. Contact",
    content: (
      <p>
        For questions about these Terms, please contact us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-blue-500 underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
]

const SectionList = ({ sections }: { sections: Section[] }) => (
  <div className="space-y-0">
    {sections.map((section, i) => (
      <div key={i}>
        <div className="py-5">
          <h3 className="mb-3 text-sm font-bold tracking-wide">
            {section.title}
          </h3>
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {section.content}
          </div>
        </div>
        {i < sections.length - 1 && <Separator />}
      </div>
    ))}
  </div>
)

export default function LegalPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "terms" ? "terms" : "privacy"
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-background pb-20 text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-card">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">◈</span>
              <span className="text-lg font-semibold tracking-wide">
                SEO<span className="text-emerald-500">IQ</span>
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/">← Back to App</a>
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-6 px-6 pt-10">
          {/* Hero */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Legal</h1>
            <p className="text-sm text-muted-foreground">
              Please read these documents carefully before using {APP_NAME}.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger
                value="privacy"
                className="gap-2 text-xs tracking-wide"
              >
                <Shield className="h-3.5 w-3.5" /> Privacy Policy
              </TabsTrigger>
              <TabsTrigger
                value="terms"
                className="gap-2 text-xs tracking-wide"
              >
                <FileText className="h-3.5 w-3.5" /> Terms of Use
              </TabsTrigger>
            </TabsList>

            {/* Privacy Policy */}
            <TabsContent value="privacy" className="mt-4">
              <Card>
                <CardHeader className="pt-6 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold">
                        Privacy Policy
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last updated: {LAST_UPDATED}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500 text-xs text-emerald-600"
                    >
                      No Data Collected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <SectionList sections={PrivacySections} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms of Use */}
            <TabsContent value="terms" className="mt-4">
              <Card>
                <CardHeader className="pt-6 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold">
                        Terms of Use
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last updated: {LAST_UPDATED}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Free Service
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <SectionList sections={TermsSections} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer note */}
          <p className="pb-4 text-center text-xs text-muted-foreground">
            {APP_NAME} is a free tool. For questions, contact{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-500 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </Suspense>
  )
}
