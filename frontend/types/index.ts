export type PostStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"

export interface BlogPost {
  id: number
  topic: string
  audience: string
  status: PostStatus
  title?: string
  article?: string
  seo?: string
  social?: string
  review?: string
  schedule?: {
    recommended_publish_time?: string
    platform_schedule?: {
      twitter?: string
      linkedin?: string
      instagram?: string
    }
    reasoning?: string
  }
  review_score?: number
  source_count?: number
  loop_count?: number
  error_msg?: string
  twitter_published?: string
  linkedin_published?: string
  created_at?: string
  updated_at?: string
}

export interface GenerateRequest {
  topic: string
  audience: string
}

export interface PublishRequest {
  platforms: string[]
}
