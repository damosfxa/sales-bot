"use client"

import { useState } from "react"
import { Plus, Trash2, Send, CheckCircle, Circle, Loader2 } from "lucide-react"

interface ProgressItem {
  id: string
  feature_name: string
  is_done: boolean
  position: number
}

export function ProgressPanel({ leadId }: { leadId: string }) {
  const [items, setItems] = useState<ProgressItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newFeature, setNewFeature] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Load saat pertama kali panel dibuka
  async function loadProgress() {
    if (loaded) return
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/progress`)
      const data = await res.json()
      setItems(data.data ?? [])
      setLoaded(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!loaded && !loading) {
    loadProgress()
  }

  async function addItem() {
    if (!newFeature.trim()) return
    try {
      const res = await fetch(`/api/leads/${leadId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature_name: newFeature.trim(),
          position: items.length,
        }),
      })
      const data = await res.json()
      setItems((prev) => [...prev, data.data])
      setNewFeature("")
    } catch (err) {
      console.error(err)
    }
  }

  async function toggleItem(id: string, currentDone: boolean) {
    try {
      const res = await fetch(`/api/leads/${leadId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id, is_done: !currentDone }),
      })
      const data = await res.json()
      setItems((prev) => prev.map((i) => (i.id === id ? data.data : i)))
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteItem(id: string) {
    try {
      await fetch(`/api/leads/${leadId}/progress?item_id=${id}`, {
        method: "DELETE",
      })
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  async function sendUpdate() {
    setSending(true)
    try {
      await fetch(`/api/leads/${leadId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_update" }),
      })
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const done = items.filter((i) => i.is_done).length
  const total = items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
            Progress Project
          </p>
          {total > 0 && (
            <p className="text-xs text-zinc-400 mt-0.5">
              {done}/{total} selesai ({pct}%)
            </p>
          )}
        </div>
        {total > 0 && (
          <button
            onClick={sendUpdate}
            disabled={sending}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            {sent ? "Terkirim" : "Kirim Update ke WA"}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin text-zinc-600" />
        </div>
      )}

      {/* List */}
      {!loading && (
        <div className="space-y-1">
          {items.length === 0 && (
            <p className="text-xs text-zinc-600 py-2">
              Belum ada fitur. Tambah di bawah.
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 group py-1.5"
            >
              <button
                onClick={() => toggleItem(item.id, item.is_done)}
                className="flex-shrink-0 text-zinc-500 hover:text-emerald-400 transition-colors"
              >
                {item.is_done ? (
                  <CheckCircle size={15} className="text-emerald-400" />
                ) : (
                  <Circle size={15} />
                )}
              </button>
              <span
                className={`text-sm flex-1 ${
                  item.is_done ? "line-through text-zinc-600" : "text-zinc-300"
                }`}
              >
                {item.feature_name}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input tambah fitur */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Nama fitur..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        />
        <button
          onClick={addItem}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-zinc-300 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}