import api from "@/lib/api/axios"
import type { Page, Reward } from "@/lib/types"

export interface RewardListParams {
  search?: string
  kind?: string
  is_active?: boolean
  skip?: number
  limit?: number
  order_by?: "name" | "cost" | "kind" | "created_at"
  order_dir?: "asc" | "desc"
}

export const rewardsService = {
  list: (params?: RewardListParams) =>
    api.get<Page<Reward>>("/rewards", { params }).then((r) => r.data),

  create: (body: Omit<Reward, "id" | "created_at">) =>
    api.post<Reward>("/rewards", body).then((r) => r.data),

  update: (id: string, body: Partial<Reward>) =>
    api.patch<Reward>(`/rewards/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/rewards/${id}`).then((r) => r.data),
}
