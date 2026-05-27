"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { COLORS, MONO, SANS, SERIF, TIERS } from "@/lib/theme/tokens"
import {
  Avatar, Btn, Display, Eyebrow, GoldHair, HRule, Icon, Modal,
  ModalHeader, Pagination, Panel, Press, TierChip, Field, Switch, INPUT_STYLE,
} from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import {
  useAdjustMember, useBulkImportMembers, useCreateMember, useMembers, useMemberTransactions,
  useUpdateMember, useUpdateNotes, useMember,
} from "@/hooks/useMembers"
import { useTierRewards } from "@/hooks/useTiers"
import { membersService } from "@/lib/api/services/members"
import type { BulkImportResult, Member, MemberLedger, Transaction } from "@/lib/types"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const LIMIT = 50

const adjustSchema = yup.object({ delta: yup.number().required("Requerido"), note: yup.string().required("Requerido") })
const memberSchema = yup.object({
  first_name: yup.string().required("Requerido"),
  last_name:  yup.string().required("Requerido"),
  email:      yup.string().email("Correo inválido").required("Requerido"),
  phone:      yup.string().optional(),
  doctor:     yup.string().optional(),
  birth_date: yup.string().optional(),
})

export default function SociosPage() {
  const [search,     setSearch]     = useState("")
  const [tierFilter, setTierFilter] = useState("todos")
  const [orderBy,    setOrderBy]    = useState<"created_at" | "first_name">("created_at")
  const [orderDir,   setOrderDir]   = useState<"asc" | "desc">("desc")
  const [skip,       setSkip]       = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating,   setCreating]   = useState(false)
  const [importing,  setImporting]  = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const memberParam  = searchParams.get("member")

  const closeMemberModal = () => {
    setSelectedId(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("member")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Reset to page 1 when filters or sort change
  useEffect(() => { setSkip(0) }, [search, tierFilter, orderBy, orderDir])

  const { data, isPending } = useMembers({
    search:    search || undefined,
    tier:      tierFilter !== "todos" ? tierFilter : undefined,
    order_by:  orderBy,
    order_dir: orderDir,
    skip,
    limit: LIMIT,
  })

  const members = data?.items ?? []
  const total   = data?.total ?? 0

  useEffect(() => {
    if (memberParam && members.length > 0 && !selectedId) {
      setSelectedId(memberParam)
    }
  }, [memberParam, members.length])

  const setSort = (ob: "created_at" | "first_name", od: "asc" | "desc") => {
    setOrderBy(ob); setOrderDir(od)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar search={search} onSearch={setSearch} />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ maxWidth: 540 }}>
            <Display size={32} weight={400} style={{ marginBottom: 8 }}>Socios del programa</Display>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim }}>
              {total.toLocaleString("es-MX")} socios registrados
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" icon={<Icon name="arrow-r" size={13} color={COLORS.ivoryDim} />} onClick={() => setImporting(true)}>
              Importar
            </Btn>
            <Btn variant="gold" icon={<Icon name="plus" size={13} color={COLORS.black} />} onClick={() => setCreating(true)}>
              Nuevo socio
            </Btn>
          </div>
        </div>

        {/* filter bar */}
        <Panel pad={0} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "14px 22px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Eyebrow size={9} style={{ marginRight: 4 }}>Nivel</Eyebrow>
              {(["todos","plata","oro","diamante"] as const).map((t) => (
                <button key={t} onClick={() => setTierFilter(t)} style={{
                  padding: "6px 12px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.22em",
                  textTransform: "uppercase", fontWeight: 500,
                  color: tierFilter === t ? (t === "todos" ? COLORS.gold : TIERS[t as keyof typeof TIERS]?.accent as string) : COLORS.ivoryDim,
                  border: `0.5px solid ${tierFilter === t ? COLORS.goldDim : "transparent"}`,
                  background: tierFilter === t ? "rgba(201,168,76,0.05)" : "transparent", borderRadius: 1,
                }}>{t === "todos" ? "Todos" : TIERS[t as keyof typeof TIERS]?.name}</button>
              ))}
            </div>
            <div style={{ width: 0.5, height: 22, background: COLORS.hairline }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Eyebrow size={9} style={{ marginRight: 4 }}>Orden</Eyebrow>
              {([
                { ob: "created_at" as const, od: "desc" as const, label: "Reciente" },
                { ob: "first_name" as const, od: "asc"  as const, label: "Nombre A→Z" },
              ]).map((opt) => {
                const active = orderBy === opt.ob && orderDir === opt.od
                return (
                  <button key={opt.label} onClick={() => setSort(opt.ob, opt.od)} style={{
                    padding: "6px 12px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.22em",
                    textTransform: "uppercase", fontWeight: 500,
                    color: active ? COLORS.ivory : COLORS.ivoryDim,
                    background: active ? "rgba(240,232,208,0.04)" : "transparent",
                    border: "0.5px solid transparent", borderRadius: 1,
                  }}>{opt.label}</button>
                )
              })}
            </div>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: COLORS.ivoryMute, letterSpacing: "0.12em" }}>
              {total.toLocaleString("es-MX")} RESULTADOS
            </span>
          </div>
        </Panel>

        {/* table */}
        <div className="table-scroll">
        <Panel pad={0} style={{ minWidth: 500 }}>
          <div style={{ display: "grid", gridTemplateColumns: "54px 1.4fr 1.1fr 130px 32px", gap: 18, alignItems: "center", padding: "12px 22px", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
            <div />
            {["Socio","Contacto","Código",""].map((h) => <Eyebrow key={h} size={8.5}>{h}</Eyebrow>)}
          </div>
          {isPending && (
            <div style={{ padding: "40px 22px", textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: COLORS.ivoryMute }}>Cargando socios…</div>
            </div>
          )}
          {members.map((m) => {
            const name = `${m.first_name} ${m.last_name}`
            return (
              <Press key={m.id} onClick={() => setSelectedId(m.id)}
                style={{ display: "grid", gridTemplateColumns: "54px 1.4fr 1.1fr 130px 32px", gap: 18, alignItems: "center", padding: "14px 22px", borderTop: `0.5px solid ${COLORS.hairline}`, cursor: "pointer" }}
                hoverStyle={{ background: "rgba(240,232,208,0.025)" }}
              >
                <Avatar name={name} size={38} />
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: COLORS.ivory }}>{name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.1em", marginTop: 3 }}>
                    DESDE {new Date(m.member_since).getFullYear()} · {m.is_active ? "ACTIVO" : "INACTIVO"}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 11.5, color: COLORS.ivoryDim }}>{m.email}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.ivoryMute, marginTop: 2 }}>{m.phone ?? ""}</div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.gold, letterSpacing: "0.08em" }}>{m.code}</div>
                <Icon name="chev-r" size={12} color={COLORS.ivoryMute} />
              </Press>
            )
          })}
          {members.length === 0 && !isPending && (
            <div style={{ padding: "60px 22px", textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: COLORS.ivoryDim }}>· sin resultados ·</div>
            </div>
          )}
          <Pagination total={total} skip={skip} limit={LIMIT} onChange={setSkip} />
        </Panel>
        </div>

        {/* detail modal */}
        <Modal open={!!selectedId} onClose={closeMemberModal} width={780}>
          {selectedId && <UserDetail memberId={selectedId} onClose={closeMemberModal} />}
        </Modal>
        <Modal open={creating} onClose={() => setCreating(false)} width={560}>
          {creating && <MemberForm onClose={() => setCreating(false)} />}
        </Modal>
        <Modal open={importing} onClose={() => setImporting(false)} width={560}>
          {importing && <ImportModal onClose={() => setImporting(false)} />}
        </Modal>
      </div>
    </div>
  )
}

// ─── User Detail ──────────────────────────────────────────
function UserDetail({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const { data: ledger }  = useMember(memberId)
  const { data: txData }  = useMemberTransactions(memberId)
  const transactions      = txData?.items ?? []
  const [tab,           setTab]     = useState("historial")
  const [editingNotes,  setEN]      = useState(false)
  const [adjustOpen,    setAO]      = useState(false)
  const [editOpen,      setEO]      = useState(false)
  const updateNotes = useUpdateNotes()

  if (!ledger) return <div style={{ padding: 40, textAlign: "center" }}><div style={{ fontFamily: SERIF, fontStyle: "italic", color: COLORS.ivoryMute }}>Cargando…</div></div>

  const name     = `${ledger.first_name} ${ledger.last_name}`
  const tierData = TIERS[ledger.tier as keyof typeof TIERS]
  const nextTier = tierData?.next ? TIERS[tierData.next as keyof typeof TIERS] : null
  const pct      = nextTier && tierData?.ceil ? Math.min(1, Math.max(0, (ledger.smiles_lifetime - tierData.floor) / (tierData.ceil - tierData.floor))) : 1

  return (
    <div>
      <div style={{ padding: "24px 32px 22px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", alignItems: "flex-start", gap: 20 }}>
        <Avatar name={name} size={68} tier={ledger.tier} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow gold size={9} style={{ marginBottom: 8 }}>{ledger.code}</Eyebrow>
          <Display size={28} italic weight={400} style={{ marginBottom: 10 }}>{name}</Display>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <TierChip tier={ledger.tier} size={9.5} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.12em" }}>
              SOCIO DESDE {new Date(ledger.member_since).toLocaleDateString("es-MX", { year: "numeric", month: "short" }).toUpperCase()}
            </span>
            {ledger.doctor && <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.12em" }}>· {ledger.doctor.toUpperCase()}</span>}
          </div>
        </div>
        <Press onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={12} color={COLORS.ivoryDim} />
        </Press>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
        <StatCell label="Saldo de smiles" value={ledger.smiles_balance.toLocaleString("es-MX")} accent />
        <StatCell label="Smiles lifetime" value={ledger.smiles_lifetime.toLocaleString("es-MX")} />
        <StatCell label="Movimientos"     value={txData?.total ?? 0} />
        <StatCell label={nextTier ? `Para ${nextTier.label}` : "Nivel"} value={nextTier ? `${(tierData?.ceil ?? 0) - ledger.smiles_lifetime}` : "MAX"} accent={!!nextTier} />
      </div>

      {/* contact */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
        <ContactCell icon="mail"     label="Email"     value={ledger.email} />
        <ContactCell icon="phone"    label="Teléfono"  value={ledger.phone ?? "—"} />
        <ContactCell icon="calendar" label="Cumpleaños" value={ledger.birth_date ? new Date(ledger.birth_date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
      </div>

      {/* tabs */}
      <div style={{ display: "flex", borderBottom: `0.5px solid ${COLORS.hairline}`, padding: "0 32px" }}>
        {[{id:"historial",label:"Historial"},{id:"progreso",label:"Progreso"},{id:"notas",label:"Notas internas"}].map((opt) => (
          <button key={opt.id} onClick={() => setTab(opt.id)} style={{
            padding: "14px 0", marginRight: 28, fontFamily: SANS, fontSize: 10, letterSpacing: "0.24em",
            textTransform: "uppercase", fontWeight: 500,
            color: tab === opt.id ? COLORS.gold : COLORS.ivoryDim,
            borderBottom: `1px solid ${tab === opt.id ? COLORS.gold : "transparent"}`, marginBottom: -1,
          }}>{opt.label}</button>
        ))}
      </div>

      <div style={{ padding: "24px 32px 28px", maxHeight: 400, overflow: "auto" }} className="nice-scroll">
        {tab === "historial" && (
          <div>
            {transactions.map((h, i) => (
              <div key={h.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 80px", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: i === transactions.length - 1 ? "none" : `0.5px solid ${COLORS.hairline}` }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>
                  {new Date(h.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }).toUpperCase()}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: COLORS.ivory }}>{h.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.ivoryMute, letterSpacing: "0.08em" }}>{h.performed_by.toUpperCase()}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, textAlign: "right", color: h.delta > 0 ? COLORS.gold : COLORS.rose, fontVariantNumeric: "tabular-nums" }}>
                  {h.delta > 0 ? "+" : ""}{h.delta}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "progreso" && (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
              <Display size={24} italic weight={400}>
                {nextTier ? `${(tierData?.ceil ?? 0) - ledger.smiles_lifetime} smiles para ${nextTier.label.toLowerCase()}` : "Nivel máximo alcanzado"}
              </Display>
              <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.gold, letterSpacing: "0.1em" }}>{Math.round(pct * 100)}%</span>
            </div>
            <div style={{ height: 1, background: COLORS.hairline, position: "relative", marginTop: 16 }}>
              <div style={{ position: "absolute", inset: 0, width: `${pct * 100}%`, background: COLORS.gold }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Eyebrow size={8.5}>{ledger.tier_label.toUpperCase()}</Eyebrow>
              <Eyebrow size={8.5} gold={!!nextTier}>{nextTier ? nextTier.label.toUpperCase() : "MAX"}</Eyebrow>
            </div>
            <HRule color={COLORS.hairlineStrong} />
            <Eyebrow size={9} style={{ margin: "24px 0 16px" }}>Productos canjeables · {ledger.tier_label.toLowerCase()}</Eyebrow>
            <MemberTierRewardsList tierKey={ledger.tier} />
          </div>
        )}
        {tab === "notas" && <NotasTab member={ledger} />}
      </div>

      <div style={{ padding: "18px 32px", borderTop: `0.5px solid ${COLORS.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.blackPanelLo }}>
        <Btn variant="danger" size="sm">Desactivar socio</Btn>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm" icon={<Icon name="edit" size={12} />} onClick={() => setEO(true)}>Editar perfil</Btn>
          <Btn variant="gold" size="sm" icon={<Icon name="plus" size={12} color={COLORS.black} />} onClick={() => setAO(true)}>
            Acreditar ajuste
          </Btn>
        </div>
      </div>

      <Modal open={adjustOpen} onClose={() => setAO(false)} width={460}>
        <AdjustModal memberId={memberId} memberName={name} onClose={() => setAO(false)} />
      </Modal>
      <Modal open={editOpen} onClose={() => setEO(false)} width={560}>
        {editOpen && <EditMemberModal member={ledger} onClose={() => setEO(false)} />}
      </Modal>
    </div>
  )
}

function MemberTierRewardsList({ tierKey }: { tierKey: string }) {
  const { data, isLoading } = useTierRewards(tierKey)
  if (isLoading) {
    return <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: COLORS.ivoryMute }}>Cargando…</div>
  }
  if (!data || data.length === 0) {
    return (
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: COLORS.ivoryMute }}>
        Aún no hay productos canjeables para este nivel.
      </div>
    )
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {data.map((r) => (
        <li key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
          <Icon name="check" size={12} color={COLORS.gold} />
          <span style={{ flex: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivory }}>{r.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.gold, letterSpacing: "0.12em" }}>
            {r.cost.toLocaleString("es-MX")} S
          </span>
        </li>
      ))}
    </ul>
  )
}

function NotasTab({ member }: { member: Member }) {
  const [notes, setNotes] = useState(member.internal_notes ?? "")
  const update = useUpdateNotes()
  return (
    <div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
        style={{ width: "100%", minHeight: 140, background: COLORS.blackElev, border: `0.5px solid ${COLORS.hairline}`, color: COLORS.ivory, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, padding: 16, borderRadius: 1, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }}
      />
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="ghost" size="sm" onClick={() => update.mutate({ id: member.id, notes })}>
          {update.isPending ? "Guardando…" : "Guardar nota"}
        </Btn>
      </div>
    </div>
  )
}

function AdjustModal({ memberId, memberName, onClose }: { memberId: string; memberName: string; onClose: () => void }) {
  const adjust = useAdjustMember()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(adjustSchema) })
  const onSubmit = async (data: { delta: number; note: string }) => {
    await adjust.mutateAsync({ id: memberId, ...data })
    onClose()
  }
  return (
    <div>
      <ModalHeader eyebrow="Ajuste manual" title="Acreditar / descontar smiles" sub={memberName} onClose={onClose} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px" }}>
          <Field label="Delta (positivo o negativo)">
            <input type="number" {...register("delta")} style={INPUT_STYLE} placeholder="Ej. +200 o -50" />
            {errors.delta && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.delta.message}</div>}
          </Field>
          <Field label="Motivo (requerido)">
            <input {...register("note")} style={INPUT_STYLE} placeholder="Ej. Corrección de error, bono especial…" />
            {errors.note && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.note.message}</div>}
          </Field>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="gold" type="submit" disabled={adjust.isPending}>{adjust.isPending ? "Aplicando…" : "Aplicar ajuste"}</Btn>
        </div>
      </form>
    </div>
  )
}

function MemberForm({ onClose }: { onClose: () => void }) {
  const create = useCreateMember()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(memberSchema) })
  const onSubmit = async (data: { first_name: string; last_name: string; email: string; phone?: string; doctor?: string; birth_date?: string }) => {
    await create.mutateAsync(data)
    onClose()
  }
  return (
    <div>
      <ModalHeader eyebrow="Nuevo socio" title="Registrar socio" onClose={onClose} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Nombre">
              <input {...register("first_name")} style={INPUT_STYLE} placeholder="Ana" />
              {errors.first_name && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.first_name.message}</div>}
            </Field>
            <Field label="Apellido">
              <input {...register("last_name")} style={INPUT_STYLE} placeholder="García" />
              {errors.last_name && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.last_name.message}</div>}
            </Field>
          </div>
          <Field label="Correo electrónico">
            <input {...register("email")} type="email" style={INPUT_STYLE} placeholder="ana@ejemplo.com" />
            {errors.email && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.email.message}</div>}
          </Field>
          <Field label="Teléfono (opcional)">
            <input {...register("phone")} style={INPUT_STYLE} placeholder="+52 55 0000 0000" />
          </Field>
          <Field label="Doctor (opcional)">
            <input {...register("doctor")} style={INPUT_STYLE} placeholder="Dr. Martínez" />
          </Field>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute, lineHeight: 1.5 }}>
            Se generará código único DSTH-XXXXXXX · nivel Plata inicial
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose} type="button">Cancelar</Btn>
          <Btn variant="gold" type="submit" disabled={create.isPending}>{create.isPending ? "Creando…" : "Crear socio"}</Btn>
        </div>
      </form>
    </div>
  )
}

function EditMemberModal({ member, onClose }: { member: MemberLedger; onClose: () => void }) {
  const update = useUpdateMember()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(memberSchema),
    defaultValues: {
      first_name: member.first_name,
      last_name:  member.last_name,
      email:      member.email,
      phone:      member.phone ?? "",
      doctor:     member.doctor ?? "",
      birth_date: member.birth_date ?? "",
    },
  })
  const onSubmit = async (data: { first_name: string; last_name: string; email: string; phone?: string; doctor?: string; birth_date?: string }) => {
    await update.mutateAsync({ id: member.id, data })
    onClose()
  }
  return (
    <div>
      <ModalHeader eyebrow="Editar perfil" title={`${member.first_name} ${member.last_name}`} sub={member.code} onClose={onClose} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Nombre">
              <input {...register("first_name")} style={INPUT_STYLE} />
              {errors.first_name && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.first_name.message}</div>}
            </Field>
            <Field label="Apellido">
              <input {...register("last_name")} style={INPUT_STYLE} />
              {errors.last_name && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.last_name.message}</div>}
            </Field>
          </div>
          <Field label="Correo electrónico">
            <input {...register("email")} type="email" style={INPUT_STYLE} />
            {errors.email && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.email.message}</div>}
          </Field>
          <Field label="Teléfono">
            <input {...register("phone")} style={INPUT_STYLE} placeholder="+52 55 0000 0000" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Doctor">
              <input {...register("doctor")} style={INPUT_STYLE} placeholder="Dr. Martínez" />
            </Field>
            <Field label="Fecha de nacimiento">
              <input {...register("birth_date")} type="date" style={INPUT_STYLE} />
            </Field>
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose} type="button">Cancelar</Btn>
          <Btn variant="gold" type="submit" disabled={update.isPending}>{update.isPending ? "Guardando…" : "Guardar cambios"}</Btn>
        </div>
      </form>
    </div>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ padding: "20px 24px", borderRight: `0.5px solid ${COLORS.hairline}` }}>
      <Eyebrow size={8.5} style={{ marginBottom: 10 }}>{label}</Eyebrow>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: accent ? COLORS.gold : COLORS.ivory, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  )
}

function ContactCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ padding: "16px 24px", borderRight: `0.5px solid ${COLORS.hairline}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Icon name={icon} size={11} color={COLORS.gold} />
        <Eyebrow size={8.5}>{label}</Eyebrow>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: COLORS.ivory }}>{value}</div>
    </div>
  )
}

// ─── Import Modal ──────────────────────────────────────────
function ImportModal({ onClose }: { onClose: () => void }) {
  const bulkImport = useBulkImportMembers()
  const [step,   setStep]   = useState<"idle" | "ready" | "done">("idle")
  const [file,   setFile]   = useState<File | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  const handleDownload = async () => {
    const blob = await membersService.downloadTemplate()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = "plantilla_miembros.xlsx"; a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) setStep("ready")
  }

  const handleUpload = async () => {
    if (!file) return
    const res = await bulkImport.mutateAsync(file)
    setResult(res)
    setStep("done")
  }

  return (
    <div>
      <div style={{ padding: "22px 28px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Eyebrow gold size={9} style={{ marginBottom: 10 }}>Carga masiva</Eyebrow>
          <Display size={26} italic weight={400}>Importar miembros</Display>
        </div>
        <Press onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={12} color={COLORS.ivoryDim} />
        </Press>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {step !== "done" && (
          <>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: COLORS.ivoryDim, lineHeight: 1.6, marginBottom: 22 }}>
              Descarga la plantilla y llena los datos de los pacientes, o sube directamente un export .xlsx de tu sistema clínico. El formato se detecta automáticamente.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: COLORS.blackElev, border: `0.5px solid ${COLORS.hairline}`, borderRadius: 1, marginBottom: 12 }}>
              <Icon name="arrow-r" size={14} color={COLORS.gold} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.ivory, letterSpacing: "0.1em" }}>plantilla_miembros.xlsx</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.1em", marginTop: 2 }}>8 columnas · Nombre, Apellido, Correo, Teléfono…</div>
              </div>
              <Btn variant="ghost" size="sm" onClick={handleDownload}>Descargar</Btn>
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute, lineHeight: 1.5, marginBottom: 22 }}>
              También aceptamos exports con headers <span style={{ fontFamily: MONO, fontSize: 10 }}>{`# Paciente`}</span>, <span style={{ fontFamily: MONO, fontSize: 10 }}>Nombre</span>, <span style={{ fontFamily: MONO, fontSize: 10 }}>Apellidos</span>, <span style={{ fontFamily: MONO, fontSize: 10 }}>E-Mail</span>. Las filas sin correo se importan con un email temporal <span style={{ fontFamily: MONO, fontSize: 10 }}>legacy-*@imported.dsthetic.local</span> que puedes actualizar después.
            </div>
            <label style={{ display: "block", cursor: "pointer" }}>
              <div style={{
                padding: "28px 18px", border: `0.5px dashed ${file ? COLORS.goldDim : COLORS.hairlineStrong}`,
                borderRadius: 1, textAlign: "center", background: file ? "rgba(201,168,76,0.04)" : "transparent",
                transition: "border-color 160ms, background 160ms",
              }}>
                {file ? (
                  <>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: COLORS.ivory, marginBottom: 4 }}>{file.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>
                      {(file.size / 1024).toFixed(1)} KB · listo para subir
                    </div>
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={18} color={COLORS.ivoryMute} />
                    <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.ivoryDim, marginTop: 10, letterSpacing: "0.12em" }}>
                      Selecciona un archivo .xlsx
                    </div>
                  </>
                )}
              </div>
              <input type="file" accept=".xlsx" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </>
        )}

        {step === "done" && result && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              <div style={{ flex: 1, padding: "16px 18px", background: "rgba(154,171,138,0.08)", border: `0.5px solid rgba(154,171,138,0.3)`, borderRadius: 1, textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: COLORS.sage, lineHeight: 1 }}>{result.created}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: COLORS.sage, letterSpacing: "0.22em", marginTop: 6, textTransform: "uppercase" }}>Creados</div>
              </div>
              <div style={{ flex: 1, padding: "16px 18px", background: result.errors.length > 0 ? "rgba(217,154,138,0.08)" : "transparent", border: `0.5px solid ${result.errors.length > 0 ? "rgba(217,154,138,0.3)" : COLORS.hairline}`, borderRadius: 1, textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: result.errors.length > 0 ? COLORS.rose : COLORS.ivoryMute, lineHeight: 1 }}>{result.errors.length}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: result.errors.length > 0 ? COLORS.rose : COLORS.ivoryMute, letterSpacing: "0.22em", marginTop: 6, textTransform: "uppercase" }}>Errores</div>
              </div>
            </div>

            {(result.placeholder_emails ?? 0) > 0 && (
              <div style={{ marginBottom: 18, padding: "12px 14px", border: `0.5px solid ${COLORS.goldDim}`, background: "rgba(201,168,76,0.06)", borderRadius: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 10.5, color: COLORS.gold, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
                  {result.placeholder_emails} con email temporal
                </div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: COLORS.ivoryDim, lineHeight: 1.5 }}>
                  Estos socios fueron creados con <span style={{ fontFamily: MONO, fontSize: 10 }}>legacy-*@imported.dsthetic.local</span> porque el export no traía correo. Edítalos cuando vengan a la clínica para habilitar OTP.
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div style={{ border: `0.5px solid ${COLORS.hairline}`, borderRadius: 1, overflow: "hidden", maxHeight: 220, overflowY: "auto" }} className="nice-scroll">
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", gap: 12, padding: "10px 16px", borderBottom: `0.5px solid ${COLORS.hairline}`, background: COLORS.blackElev }}>
                  {["Fila","Correo","Motivo"].map((h) => <Eyebrow key={h} size={8}>{h}</Eyebrow>)}
                </div>
                {result.errors.map((e) => (
                  <div key={e.row} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", gap: 12, padding: "10px 16px", borderTop: `0.5px solid ${COLORS.hairline}` }}>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.ivoryMute }}>{e.row}</span>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.ivoryDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email}</span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.rose }}>{e.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {step === "done" ? (
          <Btn variant="gold" onClick={onClose}>Cerrar</Btn>
        ) : (
          <>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn variant="gold" disabled={!file || bulkImport.isPending} onClick={handleUpload}>
              {bulkImport.isPending ? "Importando…" : "Subir e importar"}
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
