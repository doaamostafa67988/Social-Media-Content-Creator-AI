"use client"
import { useState } from "react"
import { Zap, Loader2 } from "lucide-react"
import { contentApi } from "@/lib/api"
import { BlogPost } from "@/types"

interface Props {
  onStart: (post: BlogPost) => void
}

export default function TopicForm({ onStart }: Props) {
  const [topic,    setTopic]    = useState("")
  const [audience, setAudience] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || !audience.trim()) return
    setLoading(true)
    setError("")
    try {
      const post = await contentApi.generate({ topic: topic.trim(), audience: audience.trim() })
      onStart(post)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to connect to backend. Is it running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative bg-[#141420] border border-[#1e1e2e] rounded-2xl p-7 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5b6bfa] via-[#c8f060] to-[#fa5b8a]" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#e2e2f0] mb-1" style={{fontFamily:"Syne,sans-serif"}}>
            Launch Pipeline
          </h2>
          <p className="text-[#5a5a72] text-sm">7 agents will research, write, optimize, and schedule your content</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest bg-[#5b6bfa]/12 text-[#5b6bfa] border border-[#5b6bfa]/25 rounded-full px-3 py-1 flex-shrink-0">
          LangGraph
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#5a5a72] mb-2">Topic *</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              disabled={loading}
              placeholder="e.g., Kafka Event Streaming at Scale"
              className="w-full bg-[#0f0f18] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-[#e2e2f0] outline-none placeholder-[#5a5a72]/60
                         focus:border-[#c8f060] focus:ring-2 focus:ring-[#c8f060]/10 disabled:opacity-50 transition"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#5a5a72] mb-2">Audience *</label>
            <input
              value={audience}
              onChange={e => setAudience(e.target.value)}
              disabled={loading}
              placeholder="e.g., Senior DevOps Engineers"
              className="w-full bg-[#0f0f18] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-[#e2e2f0] outline-none placeholder-[#5a5a72]/60
                         focus:border-[#c8f060] focus:ring-2 focus:ring-[#c8f060]/10 disabled:opacity-50 transition"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !topic.trim() || !audience.trim()}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm
                     bg-[#c8f060] text-[#09090f] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(200,240,96,.35)]
                     disabled:bg-[#1e1e2e] disabled:text-[#5a5a72] disabled:translate-y-0 disabled:shadow-none
                     transition-all duration-200"
          style={{fontFamily:"Syne,sans-serif"}}
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Dispatching agents…</>
            : <><Zap size={16} strokeWidth={2.5} /> Execute Multi-Agent Pipeline</>
          }
        </button>
      </form>
    </div>
  )
}
