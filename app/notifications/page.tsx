import { Sidebar } from "@/components/sidebar"
import { notifications, leads, formatDate } from "@/lib/dummy-data"
import { CheckCircle, XCircle } from "lucide-react"

const typeLabel: Record<string, string> = {
  new_lead: "Lead Baru",
  closing: "Closing",
  follow_up: "Follow Up",
}

export default function NotificationsPage() {
  const enriched = notifications
    .map((n) => ({
      ...n,
      lead: leads.find((l) => l.id === n.lead_id),
    }))
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-56 flex-1 px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">Notifikasi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Log notif yang sudah dikirim ke WA kamu.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Tipe</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Dikirim</th>
              </tr>
            </thead>
            <tbody>
              {enriched.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-zinc-600">
                    Belum ada notifikasi.
                  </td>
                </tr>
              )}
              {enriched.map((n, i) => (
                <tr
                  key={n.id}
                  className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${
                    i === enriched.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-zinc-300">
                      {typeLabel[n.type] ?? n.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-zinc-200">
                      {n.lead?.name ?? "Belum diketahui"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      +{n.lead?.wa_number ?? n.lead_id}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    {n.status === "sent" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle size={13} />
                        Terkirim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
                        <XCircle size={13} />
                        Gagal
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {formatDate(n.sent_at)}
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