"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/Sidebar"

interface MobileSidebarProps {
  user: {
    email: string
    full_name?: string | null
    plan: "free" | "pro" | "agency"
    auditsUsed: number
    auditsLimit: number
  }
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Mobile top bar */}
      <div className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-seoiq-border-subtle bg-seoiq-surface px-4">
        <div className="flex items-center gap-2.5">
          <span className="text-lg text-seoiq-green">◈</span>
          <span className="text-sm font-semibold tracking-wide">
            <span className="text-seoiq-green">SEO</span>
            <span className="text-foreground">IQ</span>
          </span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 border-seoiq-border-subtle bg-seoiq-surface p-0"
          >
            <Sidebar user={user} />
          </SheetContent>
        </Sheet>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-14" />
    </div>
  )
}
