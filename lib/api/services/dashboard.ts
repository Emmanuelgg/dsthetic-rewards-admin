import api from "@/lib/api/axios"
import type {
  ActivityItem,
  DashboardKpis,
  SmilesMovementItem,
  TierBreakdownItem,
  TopRewardItem,
} from "@/lib/types"

export const dashboardService = {
  kpis: (period: string) =>
    api.get<DashboardKpis>("/dashboard/kpis", { params: { period } }).then((r) => r.data),

  tierBreakdown: () =>
    api.get<TierBreakdownItem[]>("/dashboard/tier-breakdown").then((r) => r.data),

  topRewards: () =>
    api.get<TopRewardItem[]>("/dashboard/top-rewards").then((r) => r.data),

  activity: (limit = 10) =>
    api.get<ActivityItem[]>("/dashboard/activity", { params: { limit } }).then((r) => r.data),

  smilesMovement: (days = 14) =>
    api.get<SmilesMovementItem[]>("/dashboard/smiles-movement", { params: { days } }).then((r) => r.data),
}
