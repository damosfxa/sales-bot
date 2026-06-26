export type ProjectType = "web" | "bot" | "automation" | "skripsi" | "fullstack"
export type LeadStatus = "new" | "negotiating" | "closed_won" | "closed_lost"
export type ConversationRole = "user" | "assistant"
export type NotificationType = "new_lead" | "closing" | "follow_up"
export type NotificationStatus = "sent" | "failed"

export interface Lead {
  id: string
  wa_number: string
  name: string | null
  project_type: ProjectType | null
  project_description: string | null
  features: string[]
  deadline: string | null
  reference_url: string | null
  price_min: number | null
  price_max: number | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  lead_id: string
  role: ConversationRole
  content: string
  created_at: string
}

export interface PricingRule {
  id: string
  project_type: ProjectType
  base_price_min: number
  base_price_max: number
  complexity_multiplier: { low: number; medium: number; high: number }
  notes: string | null
  updated_at: string
}

export interface Notification {
  id: string
  lead_id: string
  type: NotificationType
  status: NotificationStatus
  sent_at: string
}

export interface PriceEstimate {
  min: number
  max: number
}