"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { membersService, type MemberListParams, type TransactionListParams } from "@/lib/api/services/members"

export function useMembers(params?: MemberListParams) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => membersService.list(params),
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => membersService.get(id),
    enabled: !!id,
  })
}

export function useMemberByCode(code: string) {
  return useQuery({
    queryKey: ["member-by-code", code],
    queryFn: () => membersService.byCode(code),
    enabled: !!code,
    retry: false,
  })
}

export function useMemberTransactions(id: string, params?: TransactionListParams) {
  return useQuery({
    queryKey: ["member-transactions", id, params],
    queryFn: () => membersService.transactions(id, params),
    enabled: !!id,
  })
}

export function useCreditMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, treatment_id, note }: { id: string; treatment_id: string; note?: string }) =>
      membersService.credit(id, { treatment_id, note }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["member", id] })
      qc.invalidateQueries({ queryKey: ["member-transactions", id] })
    },
  })
}

export function useRedeemReward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reward_id }: { id: string; reward_id: string }) =>
      membersService.redeem(id, { reward_id }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["member", id] })
      qc.invalidateQueries({ queryKey: ["member-transactions", id] })
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      membersService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["member", id] })
      qc.invalidateQueries({ queryKey: ["members"] })
    },
  })
}

export function useAdjustMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, delta, note }: { id: string; delta: number; note: string }) =>
      membersService.adjust(id, { delta, note }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["member", id] })
      qc.invalidateQueries({ queryKey: ["member-transactions", id] })
    },
  })
}

export function useUpdateNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      membersService.updateNotes(id, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["member", id] })
    },
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: membersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  })
}

export function useBulkImportMembers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => membersService.bulkImport(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  })
}
