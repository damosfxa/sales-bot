import { NextRequest, NextResponse } from "next/server"
import { updatePricingRule } from "@/lib/services/pricing.service"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await req.json()
    const updated = await updatePricingRule(id, body)
    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal update pricing" } },
      { status: 500 }
    )
  }
}