import { NextRequest, NextResponse } from "next/server"
import { getLeadById, updateLead } from "@/lib/services/lead.service"
import { LeadStatus } from "@/lib/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const lead = await getLeadById(id)
    if (!lead) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Lead tidak ditemukan" } },
        { status: 404 }
      )
    }
    return NextResponse.json({ data: lead })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal ambil lead" } },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await req.json()
    const { status } = body as { status: LeadStatus }

    if (!status) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Field status wajib diisi" } },
        { status: 400 }
      )
    }

    const updated = await updateLead(id, { status })
    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal update lead" } },
      { status: 500 }
    )
  }
}