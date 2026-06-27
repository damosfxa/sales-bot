import { supabase } from "@/lib/supabase"

export interface ProjectProgress {
  id: string
  lead_id: string
  feature_name: string
  is_done: boolean
  position: number
  created_at: string
  updated_at: string
}

export async function getProgress(leadId: string): Promise<ProjectProgress[]> {
  const { data, error } = await supabase
    .from("project_progress")
    .select("*")
    .eq("lead_id", leadId)
    .order("position", { ascending: true })

  if (error) throw new Error(`getProgress: ${error.message}`)
  return data as ProjectProgress[]
}

export async function addProgressItem(
  leadId: string,
  featureName: string,
  position: number
): Promise<ProjectProgress> {
  const { data, error } = await supabase
    .from("project_progress")
    .insert({ lead_id: leadId, feature_name: featureName, position })
    .select()
    .single()

  if (error) throw new Error(`addProgressItem: ${error.message}`)
  return data as ProjectProgress
}

export async function toggleProgressItem(
  id: string,
  isDone: boolean
): Promise<ProjectProgress> {
  const { data, error } = await supabase
    .from("project_progress")
    .update({ is_done: isDone })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(`toggleProgressItem: ${error.message}`)
  return data as ProjectProgress
}

export async function deleteProgressItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("project_progress")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`deleteProgressItem: ${error.message}`)
}

export async function updateProgressOrder(
  items: { id: string; position: number }[]
): Promise<void> {
  for (const item of items) {
    await supabase
      .from("project_progress")
      .update({ position: item.position })
      .eq("id", item.id)
  }
}

// Format progress untuk dikirim ke WA customer
export function formatProgressMessage(
  items: ProjectProgress[],
  projectName?: string
): string {
  const done = items.filter((i) => i.is_done)
  const pending = items.filter((i) => !i.is_done)

  const lines: string[] = [
    `update progres${projectName ? ` project ${projectName}` : ""} ka`,
    "",
  ]

  for (const item of done) {
    lines.push(`✅ ${item.feature_name}`)
  }

  for (const item of pending) {
    lines.push(`⌛ ${item.feature_name}`)
  }

  const pct = Math.round((done.length / items.length) * 100)
  lines.push("")
  lines.push(`progres: ${done.length}/${items.length} fitur selesai (${pct}%)`)

  return lines.join("\n")
}