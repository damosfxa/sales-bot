import { Sidebar } from "@/components/sidebar"
import { StatusBadge } from "@/components/status-badge"
import {
  leads,
  conversations,
  formatRupiah,
  formatDate,
  projectTypeLabel,
} from "@/lib/dummy-data"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Link2 } from "lucide-react"
import Link from "next/link"

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = leads.find((l) => l.id === id)
  if (!lead) notFound()

  const convs = conversations
    .filter((c) => c.lead_id === lead.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-56 flex-1 px-8 py-8 max-w-5xl">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Semua leads
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Conversation */}
          <div className="col-span-2">
            <h1 className="text-lg font-semibold text-zinc-100 mb-4">
              Percakapan
            </h1>

            {convs.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-12 text-center text-sm text-zinc-600">
                Belum ada percakapan.
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                {convs.map((c) => (
                  <div
                    key={c.id}
                    className={`flex gap-3 ${c.role === "assistant" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium ${
                        c.role === "user"
                          ? "bg-zinc-700 text-zinc-300"
                          : "bg-zinc-600 text-zinc-200"
                      }`}
                    >
                      {c.role === "user" ? "U" : "B"}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-sm ${c.role === "assistant" ? "items-end" : "items-start"} flex flex-col gap-1`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                          c.role === "user"
                            ? "bg-zinc-800 text-zinc-200"
                            : "bg-zinc-700 text-zinc-100"
                        }`}
                      >
                        {c.content}
                      </div>
                      <p className="text-xs text-zinc-600 px-1">
                        {formatDate(c.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lead Info */}
          <div className="col-span-1 space-y-4">
            {/* Status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">
                Info Lead
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-600 mb-0.5">Nama</p>
                  <p className="text-sm text-zinc-200">
                    {lead.name ?? "Belum diketahui"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-0.5">Nomor WA</p>
                  <p className="text-sm text-zinc-200">+{lead.wa_number}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-0.5">Status</p>
                  <StatusBadge status={lead.status} />
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-0.5">Tipe Project</p>
                  <p className="text-sm text-zinc-200">
                    {lead.project_type
                      ? projectTypeLabel[lead.project_type]
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Project detail */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">
                Detail Project
              </p>
              <div className="space-y-3">
                {lead.project_description && (
                  <div>
                    <p className="text-xs text-zinc-600 mb-0.5">Deskripsi</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {lead.project_description}
                    </p>
                  </div>
                )}

                {lead.features.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-600 mb-1.5">Fitur</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.features.map((f) => (
                        <span
                          key={f}
                          className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lead.deadline && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar size={13} className="text-zinc-600" />
                    {lead.deadline}
                  </div>
                )}

                {lead.reference_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 size={13} className="text-zinc-600" />
                    <a
                      href={lead.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-200 transition-colors truncate"
                    >
                      {lead.reference_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Harga */}
            {lead.price_min && lead.price_max && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">
                  Estimasi Harga
                </p>
                <p className="text-lg font-semibold text-zinc-100">
                  {formatRupiah(lead.price_min)} - {formatRupiah(lead.price_max)}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-600">Pertama masuk</p>
                  <p className="text-xs text-zinc-400">{formatDate(lead.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600">Terakhir update</p>
                  <p className="text-xs text-zinc-400">{formatDate(lead.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}