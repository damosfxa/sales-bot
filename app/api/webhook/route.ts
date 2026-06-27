import { NextRequest, NextResponse } from "next/server"
import { upsertLeadByWaNumber, updateLead, getLeadByWaNumber } from "@/lib/services/lead.service"
import { getConversations, saveMessage, formatForClaude } from "@/lib/services/conversation.service"
import { generateBotResponse } from "@/lib/services/bot.service"
import { notifyNewLead, notifyClosing } from "@/lib/services/notification.service"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp.service"
import { supabase } from "@/lib/supabase"

const DELAY_MS = 2 * 60 * 1000 // 2 menit

// Deduplication
const processedMessageIds = new Set<string>()

// GET — Verifikasi webhook dari Meta
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

// POST — Terima pesan masuk dari customer
export async function POST(req: NextRequest) {
  let body: any

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "ignored" })
    }

    const incomingMessage = messages[0]
    const messageId = incomingMessage.id as string
    const waNumber = incomingMessage.from as string
    const messageType = incomingMessage.type as string

    // Deduplication
    if (processedMessageIds.has(messageId)) {
      return NextResponse.json({ status: "duplicate ignored" })
    }
    processedMessageIds.add(messageId)
    if (processedMessageIds.size > 1000) {
      const arr = Array.from(processedMessageIds)
      arr.slice(0, 500).forEach((id) => processedMessageIds.delete(id))
    }

    // Handle tipe pesan
    let messageText: string | null = null
    if (messageType === "text") {
      messageText = incomingMessage.text?.body ?? null
    } else if (messageType === "image") {
      messageText = "[customer mengirim gambar — kemungkinan bukti transfer atau referensi]"
    } else if (messageType === "document") {
      messageText = "[customer mengirim dokumen]"
    } else {
      return NextResponse.json({ status: "non-text ignored" })
    }

    if (!messageText) {
      return NextResponse.json({ status: "empty message" })
    }

    const now = new Date()

    // Cek apakah lead sudah ada
    const existingLead = await getLeadByWaNumber(waNumber)
    const isNewLead = !existingLead
    const lead = existingLead ?? await upsertLeadByWaNumber(waNumber)

    // Simpan pesan customer dulu
    await saveMessage(lead.id, "user", messageText)

    // Update timestamp pesan terakhir + tandai pending
    await supabase
      .from("leads")
      .update({
        last_message_at: now.toISOString(),
        pending_reply: true,
      })
      .eq("id", lead.id)

    // Tunggu 2 menit
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

    // Setelah delay, cek apakah ada pesan baru yang masuk
    const { data: freshLead } = await supabase
      .from("leads")
      .select("last_message_at, pending_reply")
      .eq("id", lead.id)
      .single()

    if (!freshLead?.pending_reply) {
      // Sudah diproses oleh request lain
      return NextResponse.json({ status: "superseded" })
    }

    const lastMsgAt = new Date(freshLead.last_message_at)
    const secondsSinceLast = (Date.now() - lastMsgAt.getTime()) / 1000

    if (secondsSinceLast < 110) {
      // Ada pesan lebih baru yang masuk — skip, biarkan request lain yang proses
      return NextResponse.json({ status: "waiting for more messages" })
    }

    // Tandai tidak pending lagi
    await supabase
      .from("leads")
      .update({ pending_reply: false })
      .eq("id", lead.id)

    // Ambil semua percakapan terbaru (sudah include pesan-pesan yang masuk selama delay)
    const freshLead2 = await getLeadByWaNumber(waNumber)
    const conversations = await getConversations(lead.id)
    const history = formatForClaude(conversations)

    // Generate satu respons untuk semua pesan yang masuk
    const lastUserMessages = conversations
      .filter((c) => c.role === "user")
      .slice(-5)
      .map((c) => c.content)
      .join("\n")

    const botResponse = await generateBotResponse(
      freshLead2 ?? lead,
      history.slice(0, -lastUserMessages.split("\n").length),
      lastUserMessages
    )

    // Simpan respons bot
    await saveMessage(lead.id, "assistant", botResponse.message)

    // Update lead
    if (botResponse.leadUpdates && Object.keys(botResponse.leadUpdates).length > 0) {
      const cleanUpdates = Object.fromEntries(
        Object.entries(botResponse.leadUpdates).filter(
          ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
        )
      )
      if (Object.keys(cleanUpdates).length > 0) {
        await updateLead(lead.id, cleanUpdates as any)
      }
    }

    // Notif lead baru
    if (isNewLead || botResponse.shouldNotifyNewLead) {
      await notifyNewLead(lead).catch(console.error)
    }

    // Notif closing
    if (botResponse.shouldNotifyClosing) {
      const updatedLead = { ...lead, ...botResponse.leadUpdates }
      await notifyClosing(updatedLead as any).catch(console.error)
    }

    // Balas ke customer
    await sendWhatsAppMessage(waNumber, botResponse.message)

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ status: "error handled" }, { status: 200 })
  }
}