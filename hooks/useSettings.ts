"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { settingsService } from "@/lib/api/services/settings"

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.get,
    staleTime: 300_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { points_expiry_months: number }) =>
      settingsService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] })
      qc.invalidateQueries({ queryKey: ["tiers"] })
    },
  })
}

export function useExpirePoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => settingsService.expirePoints(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
