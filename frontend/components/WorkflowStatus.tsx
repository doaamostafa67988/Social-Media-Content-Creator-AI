"use client"
import { BlogPost } from "@/types"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"

const AGENTS = [
  { key: "strategist", label: "Content Strategist", desc: "Outline & keyword blueprint" },
  { key: "researcher",  label: "Research Agent",     desc: "RAG + live web search" },
  { key: "writer",      label: "Blog Writer",         desc: "Long-form article draft" },
  { key: "reviewer",    label: "Quality Reviewer",    desc: "Score & reflection loop" },
  { key: "seo",         label: "SEO Optimizer",       desc: "Meta, keywords, slug" },
  { key: "social",      label: "Social Adapter",      desc: "Twitter · LinkedIn · Instagram" },
  { key: "scheduler",   label: "Scheduler Agent",     desc: "Optimal publish timing" },
]

function getActive(post: BlogPost): number {
  if (post.status === "PENDING")   return 0
  if (post.status === "FAILED")    return -1
  if (post.status === "COMPLETED") return 7
  if (!post.article) return 2
  if (!post.review)  return 3
  if (!post.seo)     return 4
  if (!post.social)  return 5
  return 6
}

export default function WorkflowStatus({ post }: { post: BlogPost }) {
  const active = getActive(post)

  return (
    <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-[#e2e2f0]" style={{fontFamily:'Syne,sans-serif'}}>
          Agent Execution Timeline
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#5a5a72] bg-[#0f0f18] border border-[#1e1e2e] rounded px-2 py-0.5">
            run #{post.id}
          </span>
          <StatusBadge status={post.status} />
        </div>
      </div>

      <div className="space-y-0">
        {AGENTS.map((agent, i) => {
          const done    = active > i || post.status === "COMPLETED"
          const running = active === i && post.status === "RUNNING"
          const failed  = post.status === "FAILED" && active === i

          return (
            <div key={agent.key} className="flex gap-3 relative">
              {i < AGENTS.length - 1 && (
                <div className="absolute left-[13px] top-7 w-px bg-[#1e1e2e]" style={{height:"calc(100% - 4px)"}} />
              )}
              <div className="relative z-10 mt-0.5 flex-shrink-0">
                {failed  ? <XCircle    size={26} className="text-red-500" /> :
                 done    ? <CheckCircle2 size={26} className="text-[#40d996]" /> :
                 running ? <Loader2    size={26} className="text-[#c8f060] animate-spin" /> :
                           <Circle    size={26} className="text-[#1e1e2e]" />}
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${done ? "text-[#e2e2f0]" : running ? "text-[#c8f060]" : "text-[#5a5a72]"}`}>
                    {agent.label}
                  </span>
                  {running && (
                    <span className="text-[9px] uppercase tracking-widest bg-[#c8f060]/10 text-[#c8f060] border border-[#c8f060]/20 rounded-full px-2 py-0.5">
                      Running
                    </span>
                  )}
                  {done && (
                    <span className="text-[9px] uppercase tracking-widest bg-[#40d996]/10 text-[#40d996] rounded-full px-2 py-0.5">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5a5a72] mt-0.5">{agent.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Review score if available */}
      {post.review_score != null && (
        <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex items-center gap-3">
          <span className="text-[11px] text-[#5a5a72]">Quality Score</span>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-sm ${i < post.review_score! ? "bg-[#c8f060]" : "bg-[#1e1e2e]"}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-[#c8f060]">{post.review_score}/10</span>
          {post.loop_count != null && (
            <span className="ml-auto text-[10px] text-[#5a5a72]">{post.loop_count} revision{post.loop_count !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:   "bg-[#5b6bfa]/15 text-[#5b6bfa] border-[#5b6bfa]/25",
    RUNNING:   "bg-[#c8f060]/10 text-[#c8f060] border-[#c8f060]/25",
    COMPLETED: "bg-[#40d996]/15 text-[#40d996] border-[#40d996]/30",
    FAILED:    "bg-red-500/15 text-red-400 border-red-500/30",
  }
  return (
    <span className={`text-[9px] uppercase tracking-widest rounded-full px-2.5 py-1 border font-semibold ${map[status] ?? ""}`}>
      {status}
    </span>
  )
}
