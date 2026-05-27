import api from "@/lib/api/axios"
import type { ExpirationSweepResult, SystemSettings } from "@/lib/types"

export const settingsService = {
  get: () =>
    api.get<SystemSettings>("/settings").then((r) => r.data),

  update: (body: { points_expiry_months: number }) =>
    api.put<SystemSettings>("/settings", body).then((r) => r.data),

  expirePoints: () =>
    api.post<ExpirationSweepResult>("/settings/expire-points").then((r) => r.data),
}
