import { LeadStatus, statusLabel } from "@/lib/dummy-data"

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  negotiating: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed_won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed_lost: "bg-zinc-500/10 text-zinc-500 border-zinc-700",
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[status]}`}
    >
      {statusLabel[status]}
    </span>
  )
}