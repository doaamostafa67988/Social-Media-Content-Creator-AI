"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Zap, BookOpen, Share2, TrendingUp } from "lucide-react"
import TopicForm      from "@/components/TopicForm"
import WorkflowStatus from "@/components/WorkflowStatus"
import BlogPreview    from "@/components/BlogPreview"
import SocialPreview  from "@/components/SocialPreview"
import SEOPanel       from "@/components/SEOPanel"
import { contentApi } from "@/lib/api"
import { BlogPost }   from "@/types"

type Tab = "workflow" | "article" | "seo" | "social"

export default function DashboardPage() {
  const [activePost, setActivePost] = useState<BlogPost | null>(null)
  const [tab, setTab]               = useState<Tab>("workflow")
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const startPoll = useCallback((id: number) => {
    stopPoll()
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await contentApi.status(id)
        setActivePost(fresh)
        if (fresh.status === "COMPLETED" || fresh.status === "FAILED") {
          stopPoll()
          if (fresh.status === "COMPLETED") setTab("article")
        }
      } catch { stopPoll() }
    }, 3000)
  }, [stopPoll])

  const handleStart = (post: BlogPost) => {
    setActivePost(post)
    setTab("workflow")
    startPoll(post.id)
  }

  const handleRefresh = async () => {
    if (!activePost) return
    const fresh = await contentApi.status(activePost.id)
    setActivePost(fresh)
  }

  useEffect(() => () => stopPoll(), [stopPoll])

  const tabs: { key: Tab; label: string; icon: React.ReactNode; disabled: boolean }[] = [
    { key: "workflow", label: "Pipeline",  icon: <Zap size={13} />,        disabled: false },
    { key: "article",  label: "Article",   icon: <BookOpen size={13} />,   disabled: !activePost?.article },
    { key: "seo",      label: "SEO",       icon: <TrendingUp size={13} />, disabled: !activePost?.seo },
    { key: "social",   label: "Social",    icon: <Share2 size={13} />,     disabled: !activePost?.social },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-widest text-[#c8f060] mb-2">Autonomous Content Intelligence</p>
        <h1 className="text-3xl font-black tracking-tight text-[#e2e2f0] mb-2" style={{fontFamily:"Syne,sans-serif"}}>
          Content<span className="text-[#c8f060]">Forge</span> Dashboard
        </h1>
        <p className="text-[#5a5a72] text-sm">7-agent LangGraph pipeline · RAG research · SEO · Social distribution</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Agents",     value: "7",      color: "#c8f060" },
          { label: "LLM",        value: "Llama 3.3", color: "#5b6bfa" },
          { label: "Vector DB",  value: "Chroma", color: "#40d996" },
          { label: "Queue",      value: "Celery", color: "#fa5b8a" },
        ].map(s => (
          <div key={s.label} className="bg-[#141420] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#5a5a72] mb-1">{s.label}</p>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Launch Form */}
      <div className="mb-6">
        <TopicForm onStart={handleStart} />
      </div>

      {/* Output tabs — shown once a run starts */}
      {activePost && (
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 mb-5 bg-[#0f0f18] border border-[#1e1e2e] rounded-xl p-1 w-fit">
            {tabs.map(t => (
              <button key={t.key}
                onClick={() => !t.disabled && setTab(t.key)}
                disabled={t.disabled}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all
                  ${tab === t.key
                    ? "bg-[#c8f060] text-[#09090f]"
                    : t.disabled
                      ? "text-[#2a2a3a] cursor-not-allowed"
                      : "text-[#5a5a72] hover:text-[#e2e2f0] hover:bg-[#1e1e2e]"
                  }`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "workflow" && <WorkflowStatus post={activePost} />}
          {tab === "article"  && <BlogPreview    post={activePost} />}
          {tab === "seo"      && <SEOPanel       post={activePost} />}
          {tab === "social"   && <SocialPreview  post={activePost} onRefresh={handleRefresh} />}
        </div>
      )}

      {/* Empty state */}
      {!activePost && (
        <div className="text-center py-16 text-[#2a2a3a]">
          <Zap size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Fill in topic & audience above to start the pipeline</p>
        </div>
      )}
    </div>
  )
}
