"use client"
import { useState } from "react"
import { Copy, Check, BookOpen } from "lucide-react"
import { BlogPost } from "@/types"

export default function BlogPreview({ post }: { post: BlogPost }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(post.article || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!post.article) return null

  return (
    <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e] bg-[#0f0f18]">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-[#c8f060]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8f060]">
            Generated Article
          </span>
          {post.source_count != null && post.source_count > 0 && (
            <span className="text-[10px] bg-[#1e1e2e] text-[#5a5a72] rounded px-2 py-0.5">
              {post.source_count} sources
            </span>
          )}
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-[10px] bg-[#1e1e2e] border border-[#1e1e2e] hover:border-[#c8f060] hover:text-[#c8f060] text-[#5a5a72] rounded px-3 py-1 transition">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Article rendered as plain text to avoid parsing issues with Markdown pkg */}
      <div className="p-5 max-h-[480px] overflow-y-auto">
        <div className="text-[13px] leading-7 whitespace-pre-wrap text-[#c0c0d8] font-mono">
          {post.article}
        </div>
      </div>
    </div>
  )
}
