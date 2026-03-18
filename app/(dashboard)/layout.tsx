import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { MobileSidebar } from "@/components/dashboard/MobileSidebar"

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: Infinity,
  agency: Infinity,
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !authUser) redirect("/login")

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, plan")
    .eq("id", authUser.id)
    .single()

  const plan = (profile?.plan ?? "free") as "free" | "pro" | "agency"
  const limit = PLAN_LIMITS[plan] ?? 3

  // Count audits this month (usage metering)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authUser.id)
    .gte("created_at", startOfMonth.toISOString())

  const user = {
    email: profile?.email ?? authUser.email ?? "",
    full_name: profile?.full_name ?? null,
    plan,
    auditsUsed: count ?? 0,
    auditsLimit: limit === Infinity ? 999 : limit,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile header + drawer */}
      <MobileSidebar user={user} />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
