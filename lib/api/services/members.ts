import api from "@/lib/api/axios"
import type { BulkImportResult, MemberLedger, Page, Transaction } from "@/lib/types"

export interface MemberListParams {
  search?: string
  tier?: string
  is_active?: boolean
  skip?: number
  limit?: number
  order_by?: "first_name" | "last_name" | "email" | "code" | "created_at"
  order_dir?: "asc" | "desc"
}

export interface TransactionListParams {
  type?: string
  skip?: number
  limit?: number
  order_by?: "created_at" | "type" | "delta"
  order_dir?: "asc" | "desc"
}

export const membersService = {
  list: (params?: MemberListParams) =>
    api.get<Page<MemberLedger>>("/members", { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<MemberLedger>(`/members/${id}`).then((r) => r.data),

  byCode: (code: string) =>
    api.get<MemberLedger>(`/members/by-code/${code}`).then((r) => r.data),

  create: (body: Partial<MemberLedger>) =>
    api.post<MemberLedger>("/members", body).then((r) => r.data),

  update: (id: string, body: Partial<MemberLedger>) =>
    api.patch<MemberLedger>(`/members/${id}`, body).then((r) => r.data),

  updateNotes: (id: string, notes: string) =>
    api.put(`/members/${id}/notes`, { notes }).then((r) => r.data),

  deactivate: (id: string) =>
    api.post(`/members/${id}/deactivate`).then((r) => r.data),

  credit: (id: string, body: { treatment_id: string; note?: string }) =>
    api.post<Transaction>(`/members/${id}/credit`, body).then((r) => r.data),

  redeem: (id: string, body: { reward_id: string }) =>
    api.post<Transaction>(`/members/${id}/redeem`, body).then((r) => r.data),

  adjust: (id: string, body: { delta: number; note: string }) =>
    api.post<Transaction>(`/members/${id}/adjust`, body).then((r) => r.data),

  transactions: (id: string, params?: TransactionListParams) =>
    api.get<Page<Transaction>>(`/members/${id}/transactions`, { params }).then((r) => r.data),

  downloadTemplate: () =>
    api.get("/members/import/template", { responseType: "blob" }).then((r) => r.data as Blob),

  bulkImport: (file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    return api.post<BulkImportResult>("/members/bulk-import", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data)
  },
}
