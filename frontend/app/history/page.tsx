"use client"
import { useEffect, useState } from "react"
import { contentApi } from "@/lib/api"
import { BlogPost } from "@/types"
import { Trash2, ExternalLink, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-[#40d996]/12 text-[#40d996] border-[#40d996]/25",
  FAILED:    "bg-red-500/12 text-red-400 border-red-500/25",
  RUNNING:   "bg-[#c8f060]/10 text-[#c8f060] border-[#c8f060]/20",
  PENDING:   "bg-[#5b6bfa]/12 text-[#5b6bfa] border-[#5b6bfa]/25",
}

export default function HistoryPage() {
  const [posts,    setPosts]   = useState<BlogPost[]>([])
  const [loading,  setLoading] = useState(true)
  const [deleting, setDeleting]= useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try { setPosts(await contentApi.history()) }
    catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try { await contentApi.delete(id); setPosts(p => p.filter(x => x.id !== id)) }
    finally { setDeleting(null) }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#5b6bfa] mb-1">Run History</p>
          <h1 className="text-2xl font-black tracking-tight text-[#e2e2f0]" style={{fontFamily:"Syne,sans-serif"}}>
            Previous Pipelines
          </h1>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-[#5a5a72] hover:text-[#e2e2f0] border border-[#1e1e2e] rounded-xl px-4 py-2 transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#5a5a72] gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading history…
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-[#2a2a3a]">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No runs yet. Go to Dashboard to start your first pipeline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-[#141420] border border-[#1e1e2e] rounded-2xl p-5 hover:border-[#2a2a3a] transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] uppercase tracking-widest rounded-full px-2.5 py-0.5 border font-semibold ${STATUS_STYLES[post.status] ?? ""}`}>
                      {post.status}
                    </span>
                    <span className="text-[10px] text-[#5a5a72] font-mono">#{post.id}</span>
                    {post.review_score != null && (
                      <span className="text-[10px] text-[#c8f060]">Score: {post.review_score}/10</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#e2e2f0] truncate">{post.topic}</h3>
                  <p className="text-[11px] text-[#5a5a72] mt-0.5">
                    Audience: {post.audience} · {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
                  </p>
                  {post.status === "FAILED" && post.error_msg && (
                    <p className="text-[11px] text-red-400 mt-1 truncate">Error: {post.error_msg}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`/dashboard?id=${post.id}`}
                    className="text-[10px] text-[#5a5a72] hover:text-[#c8f060] border border-[#1e1e2e] rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition">
                    <ExternalLink size={10} /> View
                  </a>
                  <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                    className="text-[10px] text-[#5a5a72] hover:text-red-400 border border-[#1e1e2e] rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition disabled:opacity-50">
                    {deleting === post.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                    Delete
                  </button>
                </div>
              </div>

              {/* Mini stats */}
              {post.status === "COMPLETED" && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-[#1e1e2e] text-[10px] text-[#5a5a72]">
                  <span>📄 Article: {post.article ? `${Math.round(post.article.split(" ").length)} words` : "—"}</span>
                  <span>🔍 Sources: {post.source_count ?? 0}</span>
                  <span>🔄 Revisions: {post.loop_count ?? 0}</span>
                  <span>🐦 Twitter: {post.twitter_published ?? "pending"}</span>
                  <span>💼 LinkedIn: {post.linkedin_published ?? "pending"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
