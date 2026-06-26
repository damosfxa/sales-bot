import { supabase } from "@/lib/supabase"
import { Lead, Notification, NotificationType } from "@/lib/types"

const FONNTE_TOKEN = process.env.FONNTE_TOKEN!
const VOXY_WA_NUMBER = process.env.VOXY_WA_NUMBER!

// Kirim pesan WA via Fonnte
async function sendViaFonnte(message: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: VOXY_WA_NUMBER,
        message,
      }),
    })

    const result = await res.json()
    return result.status === true
  } catch {
    return false
  }
}

// Log notif ke tabel notifications
async function logNotification(
  leadId: string,
  type: NotificationType,
  status: "sent" | "failed"
): Promise<void> {
  await supabase.from("notifications").insert({ lead_id: leadId, type, status })
}

// Format pesan notif lead baru
function buildNewLeadMessage(lead: Lead): string {
  return [
    "🔔 *Lead Baru Masuk*",
    "",
    `Nomor WA: +${lead.wa_number}`,
    `Status: Baru`,
    "",
    "Cek dashboard untuk lihat percakapan.",
  ].join("\n")
}

// Format pesan notif closing
function buildClosingMessage(lead: Lead): string {
  const harga =
    lead.price_min && lead.price_max
      ? `Rp ${(lead.price_min / 1000).toFixed(0)}rb – Rp ${(lead.price_max / 1000000).toFixed(1)}jt`
      : "belum dihitung"

  return [
    "✅ *Ada yang Mau Closing!*",
    "",
    `Nama: ${lead.name ?? "Belum diketahui"}`,
    `Nomor WA: +${lead.wa_number}`,
    `Project: ${lead.project_type ?? "-"}`,
    `Estimasi: ${harga}`,
    "",
    lead.project_description ? `Deskripsi: ${lead.project_description}` : "",
    "",
    "Segera konfirmasi sebelum minta DP.",
  ]
    .filter((l) => l !== undefined)
    .join("\n")
    .trim()
}

// Kirim notif lead baru ke Voxy
export async function notifyNewLead(lead: Lead): Promise<void> {
  const message = buildNewLeadMessage(lead)
  const success = await sendViaFonnte(message)
  await logNotification(lead.id, "new_lead", success ? "sent" : "failed")
}

// Kirim notif closing ke Voxy
export async function notifyClosing(lead: Lead): Promise<void> {
  const message = buildClosingMessage(lead)
  const success = await sendViaFonnte(message)
  await logNotification(lead.id, "closing", success ? "sent" : "failed")
}

// Ambil semua notif, optional filter by lead
export async function getNotifications(leadId?: string): Promise<Notification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .order("sent_at", { ascending: false })

  if (leadId) query = query.eq("lead_id", leadId)

  const { data, error } = await query
  if (error) throw new Error(`getNotifications: ${error.message}`)
  return data as Notification[]
}