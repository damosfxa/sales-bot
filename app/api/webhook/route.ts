import { NextRequest, NextResponse } from "next/server"
import { upsertLeadByWaNumber, updateLead } from "@/lib/services/lead.service"
import { getConversations, saveMessage, formatForClaude } from "@/lib/services/conversation.service"
import { generateBotResponse } from "@/lib/services/bot.service"
import { notifyNewLead, notifyClosing } from "@/lib/services/notification.service"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp.service"

// ============================================================
// GET — Verifikasi webhook dari Meta
// Meta akan hit endpoint ini saat kamu daftarkan webhook di dashboard
// ============================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// ============================================================
// POST — Terima pesan masuk dari customer via Meta
// ============================================================
export async function POST(req: NextRequest) {
  let body: any

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Ambil pesan dari payload Meta
  const entry = body?.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value
  const messages = value?.messages

  // Kalau bukan pesan (misal status update), abaikan
  if (!messages || messages.length === 0) {
    return NextResponse.json({ status: "ignored" })
  }

  const incomingMessage = messages[0]
  const waNumber = incomingMessage.from as string
  const messageText = incomingMessage.text?.body as string

  // Abaikan kalau bukan pesan teks
  if (!messageText) {
    return NextResponse.json({ status: "non-text ignored" })
  }

  try {
    // 1. Dapatkan atau buat lead untuk nomor ini
    const isNewLead = !(await import("@/lib/services/lead.service").then(m => m.getLeadByWaNumber(waNumber)))
    const lead = await upsertLeadByWaNumber(waNumber)

    // 2. Ambil riwayat percakapan
    const conversations = await getConversations(lead.id)
    const history = formatForClaude(conversations)

    // 3. Simpan pesan customer
    await saveMessage(lead.id, "user", messageText)

    // 4. Generate respons dari Claude
    const botResponse = await generateBotResponse(lead, history, messageText)

    // 5. Simpan respons bot
    await saveMessage(lead.id, "assistant", botResponse.message)

    // 6. Update lead kalau ada info baru dari Claude
    if (botResponse.leadUpdates && Object.keys(botResponse.leadUpdates).length > 0) {
      await updateLead(lead.id, botResponse.leadUpdates)
    }

    // 7. Kirim notif ke Voxy kalau lead baru
    if (isNewLead || botResponse.shouldNotifyNewLead) {
      await notifyNewLead(lead)
    }

    // 8. Kirim notif closing ke Voxy
    if (botResponse.shouldNotifyClosing) {
      const updatedLead = { ...lead, ...botResponse.leadUpdates }
      await notifyClosing(updatedLead as any)
    }

    // 9. Balas ke customer via WA
    await sendWhatsAppMessage(waNumber, botResponse.message)

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}