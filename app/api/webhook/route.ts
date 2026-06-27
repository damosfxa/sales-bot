import { NextRequest, NextResponse } from "next/server"
import { upsertLeadByWaNumber, updateLead, getLeadByWaNumber } from "@/lib/services/lead.service"
import { getConversations, saveMessage, formatForClaude } from "@/lib/services/conversation.service"
import { generateBotResponse } from "@/lib/services/bot.service"
import { notifyNewLead, notifyClosing } from "@/lib/services/notification.service"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp.service"

// Deduplication — simpan message ID yang sudah diproses (in-memory, cukup untuk Vercel)
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

  // Selalu return 200 ke Meta supaya tidak retry terus
  try {
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    // Abaikan kalau bukan pesan masuk (misal: status update, read receipt)
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "ignored" })
    }

    const incomingMessage = messages[0]
    const messageId = incomingMessage.id as string
    const waNumber = incomingMessage.from as string
    const messageType = incomingMessage.type as string

    // Deduplication — skip kalau message ID sudah pernah diproses
    if (processedMessageIds.has(messageId)) {
      return NextResponse.json({ status: "duplicate ignored" })
    }
    processedMessageIds.add(messageId)

    // Bersihkan set kalau sudah terlalu besar (hindari memory leak)
    if (processedMessageIds.size > 1000) {
      const arr = Array.from(processedMessageIds)
      arr.slice(0, 500).forEach((id) => processedMessageIds.delete(id))
    }

    // Handle pesan teks
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

    // Cek apakah lead baru
    const existingLead = await getLeadByWaNumber(waNumber)
    const isNewLead = !existingLead

    // Dapatkan atau buat lead
    const lead = existingLead ?? await upsertLeadByWaNumber(waNumber)

    // Ambil riwayat percakapan
    const conversations = await getConversations(lead.id)
    const history = formatForClaude(conversations)

    // Simpan pesan customer
    await saveMessage(lead.id, "user", messageText)

    // Generate respons dari AI
    const botResponse = await generateBotResponse(lead, history, messageText)

    // Simpan respons bot
    await saveMessage(lead.id, "assistant", botResponse.message)

    // Update lead kalau ada info baru
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

    // Kirim notif ke Voxy kalau lead baru
    if (isNewLead || botResponse.shouldNotifyNewLead) {
      await notifyNewLead(lead).catch(console.error)
    }

    // Kirim notif closing ke Voxy
    if (botResponse.shouldNotifyClosing) {
      const updatedLead = { ...lead, ...botResponse.leadUpdates }
      await notifyClosing(updatedLead as any).catch(console.error)
    }

    // Balas ke customer via WA
    await sendWhatsAppMessage(waNumber, botResponse.message)

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ status: "error handled" }, { status: 200 })
  }
}