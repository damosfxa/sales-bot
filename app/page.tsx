import { Sidebar } from "@/components/sidebar"
import { StatusBadge } from "@/components/status-badge"
import {
  leads,
  formatRupiah,
  formatDate,
  projectTypeLabel,
  LeadStatus,
} from "@/lib/dummy-data"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

const statuses: { label: string; value: LeadStatus | "all" }[] = [
  { label: "Semua", value: "all" },
  { label: "Baru", value: "new" },
  { label: "Nego", value: "negotiating" },
  { label: "Deal", value: "closed_won" },
  { label: "Batal", value: "closed_lost" },
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = (status as LeadStatus | "all") || "all"

  const filtered =
    activeStatus === "all"
      ? leads
      : leads.filter((l) => l.status === activeStatus)

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    negotiating: leads.filter((l) => l.status === "negotiating").length,
    closed_won: leads.filter((l) => l.status === "closed_won").length,
    closed_lost: leads.filter((l) => l.status === "closed_lost").length,
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-56 flex-1 px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">Leads</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Semua calon customer yang masuk via WhatsApp
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: stats.total },
            { label: "Baru", value: stats.new },
            { label: "Nego", value: stats.negotiating },
            { label: "Deal", value: stats.closed_won },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4"
            >
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-zinc-100">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-5">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={s.value === "all" ? "/" : `/?status=${s.value}`}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeStatus === s.value
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">
                  Tipe
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">
                  Harga Estimasi
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">
                  Masuk
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-zinc-600"
                  >
                    Tidak ada lead dengan status ini.
                  </td>
                </tr>
              )}
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-zinc-100">
                      {lead.name ?? "Belum diketahui"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      +{lead.wa_number}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">
                    {lead.project_type
                      ? projectTypeLabel[lead.project_type]
                      : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-300">
                    {lead.price_min && lead.price_max
                      ? `${formatRupiah(lead.price_min)} - ${formatRupiah(lead.price_max)}`
                      : "-"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      <MessageSquare size={13} />
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}