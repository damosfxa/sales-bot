import { NextRequest, NextResponse } from "next/server"
import { getLeads } from "@/lib/services/lead.service"
import { LeadStatus } from "@/lib/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as LeadStatus | null

  try {
    const leads = await getLeads(status ?? undefined)
    return NextResponse.json({ data: leads, meta: { total: leads.length } })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal ambil leads" } },
      { status: 500 }
    )
  }
}