"use client"
import { useState } from "react"
import { Copy, Check, TrendingUp } from "lucide-react"
import { BlogPost } from "@/types"

function parseField(content: string, label: string): string {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, "i")
  const m  = re.exec(content)
  return m ? m[1].trim() : ""
}

export default function SEOPanel({ post }: { post: BlogPost }) {
  const [copied, setCopied] = useState(false)
  if (!post.seo) return null

  const fields: { label: string; key: string; color?: string }[] = [
    { label: "Meta Title",       key: "Meta Title",         color: "#c8f060" },
    { label: "Meta Description", key: "Meta Description",   color: "#e2e2f0" },
    { label: "Primary Keyword",  key: "Primary Keyword",    color: "#5b6bfa" },
    { label: "Suggested Slug",   key: "Suggested Slug",     color: "#40d996" },
  ]

  return (
    <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e] bg-[#0f0f18]">
        <div className="flex items-center gap-2">
          <TrendingUp size={13} className="text-[#40d996]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#40d996]">SEO Package</span>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(post.seo!); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1.5 text-[10px] text-[#5a5a72] hover:text-[#40d996] transition">
          {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? "Copied" : "Copy all"}
        </button>
      </div>

      <div className="p-5 space-y-3">
        {fields.map(f => {
          const val = parseField(post.seo!, f.key)
          if (!val) return null
          return (
            <div key={f.key}>
              <p className="text-[10px] uppercase tracking-widest text-[#5a5a72] mb-1">{f.label}</p>
              <p className="text-sm" style={{ color: f.color ?? "#c0c0d8" }}>{val}</p>
            </div>
          )
        })}

        <details className="cursor-pointer">
          <summary className="text-[11px] text-[#5a5a72] hover:text-[#e2e2f0] transition">Show full SEO report ▾</summary>
          <pre className="mt-3 text-[11px] leading-relaxed whitespace-pre-wrap text-[#5a5a72] max-h-64 overflow-y-auto">{post.seo}</pre>
        </details>
      </div>
    </div>
  )
}
