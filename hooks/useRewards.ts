"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { rewardsService, type RewardListParams } from "@/lib/api/services/rewards"
import type { Reward } from "@/lib/types"

export function useRewards(params?: RewardListParams) {
  return useQuery({
    queryKey: ["rewards", params],
    queryFn: () => rewardsService.list(params),
  })
}

export function useCreateReward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rewardsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rewards"] }),
  })
}

export function useUpdateReward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reward> }) =>
      rewardsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rewards"] }),
  })
}

export function useDeleteReward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rewardsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rewards"] }),
  })
}
