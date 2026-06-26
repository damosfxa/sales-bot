import { supabase } from "@/lib/supabase"
import { Lead, LeadStatus, ProjectType } from "@/lib/types"

// Ambil semua leads, optional filter by status
export async function getLeads(status?: LeadStatus): Promise<Lead[]> {
  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) throw new Error(`getLeads: ${error.message}`)
  return data as Lead[]
}

// Ambil 1 lead by id
export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // not found
    throw new Error(`getLeadById: ${error.message}`)
  }
  return data as Lead
}

// Ambil lead by nomor WA — dipakai bot setiap pesan masuk
export async function getLeadByWaNumber(waNumber: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("wa_number", waNumber)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`getLeadByWaNumber: ${error.message}`)
  }
  return data as Lead
}

// Buat lead baru saat customer pertama kali chat
export async function createLead(waNumber: string): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert({ wa_number: waNumber, status: "new" })
    .select()
    .single()

  if (error) throw new Error(`createLead: ${error.message}`)
  return data as Lead
}

// Update lead — dipakai bot untuk update info setelah discovery
export async function updateLead(
  id: string,
  updates: Partial<{
    name: string
    project_type: ProjectType
    project_description: string
    features: string[]
    deadline: string
    reference_url: string
    price_min: number
    price_max: number
    status: LeadStatus
  }>
): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(`updateLead: ${error.message}`)
  return data as Lead
}

// Upsert — kalau WA number sudah ada return yang lama, kalau belum buat baru
export async function upsertLeadByWaNumber(waNumber: string): Promise<Lead> {
  const existing = await getLeadByWaNumber(waNumber)
  if (existing) return existing
  return createLead(waNumber)
}