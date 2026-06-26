import { Sidebar } from "@/components/sidebar"
import { pricingRules, formatRupiah, formatDate, projectTypeLabel } from "@/lib/dummy-data"

export default function PricingPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-56 flex-1 px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">Pricing</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Harga dasar per tipe project. Edit langsung di Supabase dashboard.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Tipe</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Harga Minimum</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Harga Maksimum</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Multiplier</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Catatan</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Diupdate</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.map((rule, i) => (
                <tr
                  key={rule.id}
                  className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${
                    i === pricingRules.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-5 py-4 font-medium text-zinc-100">
                    {projectTypeLabel[rule.project_type]}
                  </td>
                  <td className="px-5 py-4 text-zinc-300">
                    {formatRupiah(rule.base_price_min)}
                  </td>
                  <td className="px-5 py-4 text-zinc-300">
                    {formatRupiah(rule.base_price_max)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {Object.entries(rule.complexity_multiplier).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                        >
                          {k}: {v}x
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {rule.notes ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {formatDate(rule.updated_at)}
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