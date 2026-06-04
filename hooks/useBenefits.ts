"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { benefitsService, type BenefitListParams } from "@/lib/api/services/benefits"
import type { Reward } from "@/lib/types"

export function useBenefits(params?: BenefitListParams) {
  return useQuery({
    queryKey: ["benefits", params],
    queryFn: () => benefitsService.list(params),
  })
}

export function useCreateBenefit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: benefitsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benefits"] }),
  })
}

export function useUpdateBenefit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reward> }) =>
      benefitsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benefits"] }),
  })
}

export function useDeleteBenefit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: benefitsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benefits"] }),
  })
}
