"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error("Portal redirect failed:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="border-seoiq-border-medium text-xs font-semibold"
    >
      {loading ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Manage Billing
        </>
      )}
    </Button>
  )
}
