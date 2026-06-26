import { supabase } from "@/lib/supabase"
import { PricingRule, ProjectType, PriceEstimate } from "@/lib/types"

// Ambil semua pricing rules
export async function getPricingRules(): Promise<PricingRule[]> {
  const { data, error } = await supabase
    .from("pricing_rules")
    .select("*")
    .order("project_type")

  if (error) throw new Error(`getPricingRules: ${error.message}`)
  return data as PricingRule[]
}

// Ambil 1 rule by project type
export async function getPricingByType(
  projectType: ProjectType
): Promise<PricingRule | null> {
  const { data, error } = await supabase
    .from("pricing_rules")
    .select("*")
    .eq("project_type", projectType)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`getPricingByType: ${error.message}`)
  }
  return data as PricingRule
}

// Hitung estimasi harga berdasarkan tipe + kompleksitas
// complexity: "low" | "medium" | "high"
export async function calculatePrice(
  projectType: ProjectType,
  complexity: "low" | "medium" | "high" = "medium"
): Promise<PriceEstimate | null> {
  const rule = await getPricingByType(projectType)
  if (!rule) return null

  const multiplier = rule.complexity_multiplier[complexity]

  return {
    min: Math.round(rule.base_price_min * multiplier),
    max: Math.round(rule.base_price_max * multiplier),
  }
}

// Update pricing rule — dari dashboard Voxy
export async function updatePricingRule(
  id: string,
  updates: Partial<{
    base_price_min: number
    base_price_max: number
    complexity_multiplier: { low: number; medium: number; high: number }
    notes: string
  }>
): Promise<PricingRule> {
  const { data, error } = await supabase
    .from("pricing_rules")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(`updatePricingRule: ${error.message}`)
  return data as PricingRule
}