"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/lib/api/services/dashboard"

export function useDashboardKpis(period = "30d") {
  return useQuery({
    queryKey: ["dashboard-kpis", period],
    queryFn: () => dashboardService.kpis(period),
    staleTime: 60_000,
  })
}

export function useTierBreakdown() {
  return useQuery({
    queryKey: ["tier-breakdown"],
    queryFn: dashboardService.tierBreakdown,
    staleTime: 120_000,
  })
}

export function useTopRewards() {
  return useQuery({
    queryKey: ["top-rewards"],
    queryFn: dashboardService.topRewards,
    staleTime: 120_000,
  })
}

export function useDashboardActivity(limit = 10) {
  return useQuery({
    queryKey: ["dashboard-activity", limit],
    queryFn: () => dashboardService.activity(limit),
    staleTime: 30_000,
  })
}

export function useSmilesMovement(days = 14) {
  return useQuery({
    queryKey: ["smiles-movement", days],
    queryFn: () => dashboardService.smilesMovement(days),
    staleTime: 120_000,
  })
}
