import axios from "axios"
import { BlogPost, GenerateRequest, PublishRequest } from "@/types"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({ baseURL: BASE, timeout: 15000 })

export const contentApi = {
  generate: (data: GenerateRequest): Promise<BlogPost> =>
    api.post("/api/content/generate", data).then(r => r.data),

  status: (id: number): Promise<BlogPost> =>
    api.get(`/api/content/status/${id}`).then(r => r.data),

  history: (skip = 0, limit = 20): Promise<BlogPost[]> =>
    api.get("/api/content/history", { params: { skip, limit } }).then(r => r.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/api/content/${id}`).then(() => undefined),

  publish: (id: number, data: PublishRequest): Promise<BlogPost> =>
    api.post(`/api/content/${id}/publish`, data).then(r => r.data),
}
