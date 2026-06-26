import { NextRequest, NextResponse } from "next/server"
import { getPricingRules } from "@/lib/services/pricing.service"

export async function GET() {
  try {
    const rules = await getPricingRules()
    return NextResponse.json({ data: rules })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Gagal ambil pricing" } },
      { status: 500 }
    )
  }
}