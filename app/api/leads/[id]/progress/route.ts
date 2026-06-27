import { NextRequest, NextResponse } from "next/server"
import {
  getProgress,
  addProgressItem,
  toggleProgressItem,
  deleteProgressItem,
  formatProgressMessage,
} from "@/lib/services/progress.service"
import { getLeadById } from "@/lib/services/lead.service"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp.service"

// GET /api/leads/:id/progress
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const items = await getProgress(id)
    return NextResponse.json({ data: items })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal ambil progress" }, { status: 500 })
  }
}

// POST /api/leads/:id/progress — tambah fitur baru
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { feature_name, position } = body
    if (!feature_name) {
      return NextResponse.json({ error: "feature_name wajib diisi" }, { status: 400 })
    }
    const item = await addProgressItem(id, feature_name, position ?? 0)
    return NextResponse.json({ data: item })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal tambah progress" }, { status: 500 })
  }
}

// PATCH /api/leads/:id/progress — toggle item atau kirim update ke WA
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()

    // Kirim update ke WA customer
    if (body.action === "send_update") {
      const lead = await getLeadById(id)
      if (!lead) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })

      const items = await getProgress(id)
      if (items.length === 0) {
        return NextResponse.json({ error: "Belum ada progress item" }, { status: 400 })
      }

      const message = formatProgressMessage(items, lead.project_description ?? undefined)
      await sendWhatsAppMessage(lead.wa_number, message)

      return NextResponse.json({ status: "sent", message })
    }

    // Toggle is_done
    if (body.item_id !== undefined && body.is_done !== undefined) {
      const item = await toggleProgressItem(body.item_id, body.is_done)
      return NextResponse.json({ data: item })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal update progress" }, { status: 500 })
  }
}

// DELETE /api/leads/:id/progress?item_id=xxx
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get("item_id")
    if (!itemId) return NextResponse.json({ error: "item_id wajib" }, { status: 400 })

    await deleteProgressItem(itemId)
    return NextResponse.json({ status: "deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal hapus progress" }, { status: 500 })
  }
}