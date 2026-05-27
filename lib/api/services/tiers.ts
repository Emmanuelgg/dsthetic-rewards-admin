import api from "@/lib/api/axios"
import type { Reward, Tier, TierBoundary } from "@/lib/types"

export const tiersService = {
  list: () =>
    api.get<Tier[]>("/tiers").then((r) => r.data),

  update: (key: string, body: Partial<Tier>) =>
    api.patch<Tier>(`/tiers/${key}`, body).then((r) => r.data),

  updateBoundaries: (boundaries: TierBoundary[]) =>
    api.put<Tier[]>("/tiers/boundaries", { boundaries }).then((r) => r.data),

  rewardsFor: (key: string) =>
    api.get<Reward[]>(`/tiers/${key}/rewards`).then((r) => r.data),
}
