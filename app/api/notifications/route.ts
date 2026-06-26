import { NextRequest, NextResponse } from "next/server"
import { getNotifications } from "@/lib/services/notification.service"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("lead_id") ?? undefined

  try {
    const notifications = await getNotifications(leadId)
    return NextResponse.json({
      data: notifications,
      meta: { total: notifications.length },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal ambil notifikasi" } },
      { status: 500 }
    )
  }
}