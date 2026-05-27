"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { treatmentsService, type TreatmentListParams } from "@/lib/api/services/treatments"
import type { Treatment } from "@/lib/types"

export function useTreatments(params?: TreatmentListParams) {
  return useQuery({
    queryKey: ["treatments", params],
    queryFn: () => treatmentsService.list(params),
  })
}

export function useCreateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: treatmentsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  })
}

export function useUpdateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Treatment> }) =>
      treatmentsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  })
}

export function useDeleteTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: treatmentsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  })
}
