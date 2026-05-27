import api from "@/lib/api/axios"
import type { Page, Treatment } from "@/lib/types"

export interface TreatmentListParams {
  search?: string
  category?: string
  is_active?: boolean
  skip?: number
  limit?: number
  order_by?: "name" | "category" | "price" | "base_smiles" | "created_at"
  order_dir?: "asc" | "desc"
}

export const treatmentsService = {
  list: (params?: TreatmentListParams) =>
    api.get<Page<Treatment>>("/treatments", { params }).then((r) => r.data),

  create: (body: Omit<Treatment, "id">) =>
    api.post<Treatment>("/treatments", body).then((r) => r.data),

  update: (id: string, body: Partial<Treatment>) =>
    api.patch<Treatment>(`/treatments/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/treatments/${id}`).then((r) => r.data),
}
