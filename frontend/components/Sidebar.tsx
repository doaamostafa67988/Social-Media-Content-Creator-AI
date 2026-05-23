"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, Zap } from "lucide-react"

const nav = [
  { href: "/dashboard",         icon: LayoutDashboard, label: "Dashboard" },
  { href: "/history",           icon: History,          label: "History" },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[#0f0f18] border-r border-[#1e1e2e] flex flex-col z-40">
      <div className="px-5 py-5 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#c8f060] rounded-lg grid place-items-center flex-shrink-0">
            <Zap size={14} className="text-[#09090f]" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-[#e2e2f0]" style={{fontFamily:"Syne,sans-serif"}}>
            Content<span className="text-[#c8f060]">Forge</span>
          </span>
        </div>
        <p className="text-[10px] text-[#5a5a72] mt-1 ml-9">Multi-Agent AI Pipeline</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + "/")
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-[#c8f060]/10 text-[#c8f060] border border-[#c8f060]/20"
                  : "text-[#5a5a72] hover:text-[#e2e2f0] hover:bg-[#1e1e2e]"
              }`}>
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#1e1e2e]">
        <div className="flex items-center gap-2 text-[10px] text-[#5a5a72]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#40d996] animate-pulse" />
          API Connected
        </div>
        <p className="text-[10px] text-[#2a2a3a] mt-1">v1.0.0 · LangGraph</p>
      </div>
    </aside>
  )
}
