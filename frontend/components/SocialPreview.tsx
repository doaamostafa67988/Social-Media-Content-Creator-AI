"use client"
import { useState } from "react"
import { Copy, Check, Clock, Send } from "lucide-react"
import { BlogPost } from "@/types"
import { contentApi } from "@/lib/api"

// ── Inline SVGs for social icons removed from lucide-react v0.294+ ──────────
function TwitterXIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function LinkedInIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function InstagramIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractSection(content: string, header: string): string {
  const regex = new RegExp(`---\\s*${header}\\s*---([\\s\\S]*?)(?=---|$)`, "i")
  const match = regex.exec(content)
  return match ? match[1].trim() : ""
}

function extractHashtags(content: string, platform: string): string {
  const regex = new RegExp(`${platform}:\\s*([^\n]+)`, "i")
  const match = regex.exec(content)
  return match ? match[1].trim() : ""
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1 text-[10px] text-[#5a5a72] hover:text-[#c8f060] transition"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function SocialPreview({
  post,
  onRefresh,
}: {
  post: BlogPost
  onRefresh: () => void
}) {
  const [publishing, setPublishing] = useState<string | null>(null)

  if (!post.social) return null

  const twitter   = extractSection(post.social, "TWITTER/X THREAD")
  const linkedin  = extractSection(post.social, "LINKEDIN POST")
  const instagram = extractSection(post.social, "INSTAGRAM CAPTION")
  const hashtagSection = post.social.match(/---\s*HASHTAGS\s*---([\s\S]*?)$/i)?.[1] ?? ""
  const twitterTags   = extractHashtags(hashtagSection, "Twitter")
  const linkedinTags  = extractHashtags(hashtagSection, "LinkedIn")
  const instagramTags = extractHashtags(hashtagSection, "Instagram")

  const publish = async (platform: string) => {
    setPublishing(platform)
    try {
      await contentApi.publish(post.id, { platforms: [platform] })
      onRefresh()
    } catch (e) {
      console.error(e)
    } finally {
      setPublishing(null)
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Twitter / X ── */}
      {twitter && (
        <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e] bg-[#0f0f18]">
            <div className="flex items-center gap-2">
              <TwitterXIcon size={13} className="text-[#e2e2f0]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#e2e2f0]">
                Twitter / X Thread
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CopyBtn text={twitter} />
              <button
                onClick={() => publish("twitter")}
                disabled={publishing === "twitter" || post.twitter_published === "published"}
                className="flex items-center gap-1.5 text-[10px] bg-[#e2e2f0]/10 text-[#e2e2f0] border border-[#e2e2f0]/20
                           rounded px-2.5 py-1 hover:bg-[#e2e2f0]/20 transition disabled:opacity-40"
              >
                {publishing === "twitter"
                  ? "…"
                  : post.twitter_published === "published"
                  ? "✓ Published"
                  : <><Send size={9} /> Publish</>}
              </button>
            </div>
          </div>
          <pre className="p-5 text-xs leading-relaxed whitespace-pre-wrap text-[#c0c0d8] max-h-64 overflow-y-auto font-mono">
            {twitter}
          </pre>
          {twitterTags && (
            <div className="px-5 pb-4 text-[11px] text-[#5a5a72] font-mono">{twitterTags}</div>
          )}
        </div>
      )}

      {/* ── LinkedIn ── */}
      {linkedin && (
        <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e] bg-[#0f0f18]">
            <div className="flex items-center gap-2">
              <LinkedInIcon size={13} className="text-[#0a66c2]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#0a66c2]">
                LinkedIn Post
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CopyBtn text={linkedin} />
              <button
                onClick={() => publish("linkedin")}
                disabled={publishing === "linkedin" || post.linkedin_published === "published"}
                className="flex items-center gap-1.5 text-[10px] bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/25
                           rounded px-2.5 py-1 hover:bg-[#0a66c2]/20 transition disabled:opacity-40"
              >
                {publishing === "linkedin"
                  ? "…"
                  : post.linkedin_published === "published"
                  ? "✓ Published"
                  : <><Send size={9} /> Publish</>}
              </button>
            </div>
          </div>
          <pre className="p-5 text-xs leading-relaxed whitespace-pre-wrap text-[#c0c0d8] max-h-64 overflow-y-auto font-mono">
            {linkedin}
          </pre>
          {linkedinTags && (
            <div className="px-5 pb-4 text-[11px] text-[#0a66c2] font-mono">{linkedinTags}</div>
          )}
        </div>
      )}

      {/* ── Instagram ── */}
      {instagram && (
        <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e] bg-[#0f0f18]">
            <div className="flex items-center gap-2">
              <InstagramIcon size={13} className="text-[#e1306c]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#e1306c]">
                Instagram Caption
              </span>
            </div>
            <CopyBtn text={instagram} />
          </div>
          <pre className="p-5 text-xs leading-relaxed whitespace-pre-wrap text-[#c0c0d8] max-h-64 overflow-y-auto font-mono">
            {instagram}
          </pre>
          {instagramTags && (
            <div className="px-5 pb-4 text-[11px] text-[#e1306c] font-mono">{instagramTags}</div>
          )}
        </div>
      )}

      {/* ── Publish Schedule ── */}
      {post.schedule && (
        <div className="bg-[#141420] border border-[#1e1e2e] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-[#5b6bfa]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#5b6bfa]">
              Publish Schedule
            </span>
          </div>
          <div className="space-y-2 text-xs">
            {post.schedule.platform_schedule &&
              Object.entries(post.schedule.platform_schedule).map(([platform, time]) => (
                <div key={platform} className="flex justify-between items-center">
                  <span className="capitalize text-[#5a5a72]">{platform}</span>
                  <span className="text-[#c0c0d8] font-mono text-[11px]">
                    {time ? new Date(time).toLocaleString() : "—"}
                  </span>
                </div>
              ))}
          </div>
          {post.schedule.reasoning && (
            <p className="mt-3 text-[11px] text-[#5a5a72] border-t border-[#1e1e2e] pt-3 leading-relaxed">
              {post.schedule.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
