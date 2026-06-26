import { NextRequest, NextResponse } from "next/server"
import { getConversations } from "@/lib/services/conversation.service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const conversations = await getConversations(id)
    return NextResponse.json({
      data: conversations,
      meta: { total: conversations.length },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal ambil percakapan" } },
      { status: 500 }
    )
  }
}