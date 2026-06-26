import { supabase } from "@/lib/supabase"
import { Conversation, ConversationRole } from "@/lib/types"

// Ambil semua conversation untuk 1 lead, urut dari awal
export async function getConversations(leadId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(`getConversations: ${error.message}`)
  return data as Conversation[]
}

// Simpan 1 pesan baru
export async function saveMessage(
  leadId: string,
  role: ConversationRole,
  content: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ lead_id: leadId, role, content })
    .select()
    .single()

  if (error) throw new Error(`saveMessage: ${error.message}`)
  return data as Conversation
}

// Format conversations ke format messages Claude API
// [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
export function formatForClaude(
  conversations: Conversation[]
): { role: "user" | "assistant"; content: string }[] {
  return conversations.map((c) => ({
    role: c.role,
    content: c.content,
  }))
}