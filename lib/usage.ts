// import { createClient } from "@/lib/supabase/server"
// import type { Plan } from "@/types/user"

// export const PLAN_LIMITS: Record<Plan, number | null> = {
//   free: 5,
//   pro: null,
//   agency: null,
// }

// export function isUnlimited(plan: Plan): boolean {
//   return PLAN_LIMITS[plan] === null
// }

// export async function getAuditsThisMonth(userId: string): Promise<number> {
//   const supabase = await createClient()
//   const now = new Date()
//   const startOfMonth = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     1
//   ).toISOString()

//   const { count, error } = await supabase
//     .from("audits")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", userId)
//     .gte("created_at", startOfMonth)

//   if (error) {
//     console.error("Failed to count audits:", error.message)
//     return 0
//   }

//   return count ?? 0
// }

// export async function checkUsageLimit(userId: string): Promise<{
//   allowed: boolean
//   used: number
//   limit: number | null
//   plan: Plan
// }> {
//   const supabase = await createClient()

//   const { data: user, error } = await supabase
//     .from("users")
//     .select("plan")
//     .eq("id", userId)
//     .single()

//   if (error || !user) {
//     return { allowed: false, used: 0, limit: 0, plan: "free" }
//   }

//   const plan = (user.plan as Plan) ?? "free"
//   const limit = PLAN_LIMITS[plan]

//   if (limit === null) {
//     return { allowed: true, used: 0, limit: null, plan }
//   }

//   const used = await getAuditsThisMonth(userId)

//   return {
//     allowed: used < limit,
//     used,
//     limit,
//     plan,
//   }
// }
