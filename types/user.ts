export type Plan = "free" | "pro" | "agency"

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface UserWithUsage extends User {
  audits_this_month: number
  audit_limit: number | null // null = unlimited
}
