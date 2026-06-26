"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Tag, Bell } from "lucide-react"

const navItems = [
  { href: "/", label: "Leads", icon: Users },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/notifications", label: "Notifikasi", icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-zinc-800 bg-zinc-900 flex flex-col">
      <div className="px-5 py-5 border-b border-zinc-800">
        <span className="font-semibold text-base tracking-tight text-zinc-100">Sales Bot</span>
        <p className="text-xs text-zinc-500 mt-0.5">Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">Voxy Dev</p>
      </div>
    </aside>
  )
}