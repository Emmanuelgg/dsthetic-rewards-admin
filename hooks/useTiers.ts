"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tiersService } from "@/lib/api/services/tiers"
import type { Tier, TierBoundary } from "@/lib/types"

export function useTiers() {
  return useQuery({
    queryKey: ["tiers"],
    queryFn: tiersService.list,
    staleTime: 300_000,
  })
}

export function useUpdateTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: Partial<Tier> }) =>
      tiersService.update(key, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tiers"] }),
  })
}

export function useUpdateTierBoundaries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (boundaries: TierBoundary[]) =>
      tiersService.updateBoundaries(boundaries),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tiers"] })
      qc.invalidateQueries({ queryKey: ["tier-rewards"] })
      qc.invalidateQueries({ queryKey: ["members"] })
    },
  })
}

export function useTierRewards(key: string | undefined) {
  return useQuery({
    queryKey: ["tier-rewards", key],
    queryFn: () => tiersService.rewardsFor(key!),
    enabled: !!key,
    staleTime: 300_000,
  })
}
