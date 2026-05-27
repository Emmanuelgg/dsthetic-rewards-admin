"use client"

import { useState, useEffect } from "react"
import { COLORS, MONO, SANS, SERIF, TIERS, type TierKey } from "@/lib/theme/tokens"
import {
  Btn, Display, Eyebrow, Field, Icon, ImgPlaceholder, Modal,
  Pagination, Panel, Press, Switch, TierGlyph, INPUT_STYLE,
} from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import { useCreateReward, useDeleteReward, useRewards, useUpdateReward } from "@/hooks/useRewards"
import type { Reward } from "@/lib/types"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const rewardSchema = yup.object({
  name:       yup.string().required("Requerido"),
  kind:       yup.string().required(),
  cost:       yup.number().min(1, "Debe ser mayor a 0").required(),
  min_tier:   yup.string().required(),
  is_active:  yup.boolean().required(),
  stock:      yup.number().nullable().optional(),
  description:yup.string().optional(),
})

const LIMIT = 24
const REWARD_KINDS = ["todos", "Tratamiento", "Producto", "Consulta", "Experiencia"]

export default function RecompensasPage() {
  const [search,       setSearch]    = useState("")
  const [kindFilter,   setKindFilter] = useState("todos")
  const [statusFilter, setStatus]    = useState<"todos" | "activas" | "pausa">("todos")
  const [skip,         setSkip]      = useState(0)
  const [editingId,    setEditingId]  = useState<string | null>(null)
  const [creating,     setCreating]   = useState(false)

  useEffect(() => { setSkip(0) }, [search, kindFilter, statusFilter])

  const isActiveParam = statusFilter === "activas" ? true : statusFilter === "pausa" ? false : undefined

  const { data } = useRewards({
    search:    search || undefined,
    kind:      kindFilter !== "todos" ? kindFilter : undefined,
    is_active: isActiveParam,
    skip,
    limit: LIMIT,
    order_by:  "created_at",
    order_dir: "desc",
  })

  const rewards = data?.items ?? []
  const total   = data?.total ?? 0

  const editing = editingId ? rewards.find((r) => r.id === editingId) : null

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar search={search} onSearch={setSearch} />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Display size={32} weight={400} style={{ marginBottom: 10 }}>Catálogo de recompensas</Display>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim, lineHeight: 1.5, maxWidth: 580 }}>
              {total.toLocaleString("es-MX")} recompensas encontradas
            </div>
          </div>
          <Btn variant="gold" onClick={() => setCreating(true)} icon={<Icon name="plus" size={13} color={COLORS.black} />} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            Nueva recompensa
          </Btn>
        </div>

        {/* filter bar */}
        <Panel pad={0} style={{ marginBottom: 20 }}>
          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Eyebrow size={9} style={{ marginRight: 6 }}>Categoría</Eyebrow>
              {REWARD_KINDS.map((k) => (
                <FilterPill key={k} active={kindFilter === k} onClick={() => setKindFilter(k)}>
                  {k === "todos" ? "Todas" : k}
                </FilterPill>
              ))}
            </div>
            <div style={{ width: 0.5, height: 22, background: COLORS.hairline }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Eyebrow size={9} style={{ marginRight: 6 }}>Estado</Eyebrow>
              {([{id:"todos",label:"Todos"},{id:"activas",label:"Activas"},{id:"pausa",label:"En pausa"}] as const).map((opt) => (
                <FilterPill key={opt.id} active={statusFilter === opt.id} onClick={() => setStatus(opt.id)}>{opt.label}</FilterPill>
              ))}
            </div>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: COLORS.ivoryMute, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
              {total.toLocaleString("es-MX")} RESULTADOS
            </span>
          </div>
        </Panel>

        {/* grid */}
        <div className="grid-kpi-3" style={{ gap: 18 }}>
          {rewards.map((r) => (
            <RewardCard key={r.id} reward={r} onClick={() => setEditingId(r.id)} />
          ))}
        </div>

        {rewards.length === 0 && (
          <Panel style={{ marginTop: 12, textAlign: "center", padding: 60 }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: COLORS.ivoryDim }}>· sin resultados ·</div>
          </Panel>
        )}

        {total > LIMIT && (
          <Panel pad={0} style={{ marginTop: 12 }}>
            <Pagination total={total} skip={skip} limit={LIMIT} onChange={setSkip} />
          </Panel>
        )}

        <Modal open={!!editing} onClose={() => setEditingId(null)} width={600}>
          {editing && <RewardEditor reward={editing} onClose={() => setEditingId(null)} />}
        </Modal>
        <Modal open={creating} onClose={() => setCreating(false)} width={600}>
          {creating && <RewardEditor reward={null} onClose={() => setCreating(false)} />}
        </Modal>
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.22em",
      textTransform: "uppercase", fontWeight: 500,
      color: active ? COLORS.gold : COLORS.ivoryDim,
      background: active ? "rgba(201,168,76,0.05)" : "transparent",
      border: `0.5px solid ${active ? COLORS.goldDim : "transparent"}`, borderRadius: 1,
    }}>{children}</button>
  )
}

function RewardCard({ reward, onClick }: { reward: Reward; onClick: () => void }) {
  return (
    <Press onClick={onClick} style={{ background: COLORS.blackPanel, border: `0.5px solid ${reward.is_active ? COLORS.hairline : "rgba(217,154,138,0.18)"}`, borderRadius: 2, overflow: "hidden", opacity: reward.is_active ? 1 : 0.7 }} hoverStyle={{ borderColor: COLORS.goldDim }}>
      <div style={{ position: "relative" }}>
        <ImgPlaceholder label={reward.kind} height={130} />
        {!reward.is_active && (
          <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 8px", background: "rgba(217,154,138,0.15)", border: "0.5px solid rgba(217,154,138,0.4)", fontFamily: MONO, fontSize: 8, color: COLORS.rose, letterSpacing: "0.2em" }}>EN PAUSA</div>
        )}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "rgba(10,10,10,0.7)", border: `0.5px solid ${COLORS.hairline}` }}>
          <TierGlyph tier={reward.min_tier} size={9} />
          <span style={{ fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.22em", color: TIERS[reward.min_tier as TierKey]?.accent as string }}>
            {TIERS[reward.min_tier as TierKey]?.name.toUpperCase()}+
          </span>
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <Display size={19} italic weight={400} style={{ marginBottom: 14, lineHeight: 1.15 }}>{reward.name}</Display>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: COLORS.gold, lineHeight: 1 }}>{reward.cost}</span>
            <span style={{ fontFamily: SANS, fontSize: 8.5, color: COLORS.gold, letterSpacing: "0.22em" }}>SMILES</span>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.08em" }}>
              STOCK · {reward.stock ?? "∞"}
            </div>
          </div>
        </div>
      </div>
    </Press>
  )
}

function RewardEditor({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const create = useCreateReward()
  const update = useUpdateReward()
  const del    = useDeleteReward()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(rewardSchema),
    defaultValues: {
      name:       reward?.name       ?? "",
      kind:       reward?.kind       ?? "Tratamiento",
      cost:       reward?.cost       ?? 0,
      min_tier:   reward?.min_tier   ?? "plata",
      is_active:  reward?.is_active  ?? true,
      stock:      reward?.stock      ?? undefined,
      description:reward?.description ?? "",
    },
  })

  const isActive  = watch("is_active")
  const minTier   = watch("min_tier")

  const onSubmit = async (data: {
    name: string; kind: string; cost: number; min_tier: string;
    is_active: boolean; stock?: number | null; description?: string
  }) => {
    if (reward) {
      await update.mutateAsync({ id: reward.id, data })
    } else {
      await create.mutateAsync({ ...data, created_at: "" } as any)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!reward) return
    await del.mutateAsync(reward.id)
    onClose()
  }

  return (
    <div>
      <div style={{ padding: "22px 28px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Eyebrow gold size={9} style={{ marginBottom: 10 }}>{reward ? "Editar recompensa" : "Nueva recompensa"}</Eyebrow>
          <Display size={26} italic weight={400}>{reward?.name || "Sin nombre"}</Display>
        </div>
        <Press onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={12} color={COLORS.ivoryDim} />
        </Press>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px" }}>
          {/* status toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", marginBottom: 22, border: `0.5px solid ${COLORS.hairline}`, borderRadius: 1, background: isActive ? "rgba(154,171,138,0.04)" : "rgba(217,154,138,0.04)" }}>
            <div>
              <Eyebrow size={9} style={{ marginBottom: 4 }} gold={isActive}>{isActive ? "Activa en catálogo" : "En pausa"}</Eyebrow>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute }}>
                {isActive ? "Los socios la pueden canjear ahora mismo." : "No aparece para canje en la app de socios."}
              </div>
            </div>
            <Switch value={isActive} onChange={(v) => setValue("is_active", v)} />
          </div>
          <Field label="Nombre">
            <input {...register("name")} style={INPUT_STYLE} />
            {errors.name && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.name.message}</div>}
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Categoría">
              <select {...register("kind")} style={INPUT_STYLE}>
                {["Tratamiento","Producto","Consulta","Experiencia"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Costo (smiles)">
              <input type="number" {...register("cost")} style={INPUT_STYLE} />
              {errors.cost && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.cost.message}</div>}
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Nivel requerido">
              <div style={{ display: "flex", gap: 6 }}>
                {(["plata","oro","diamante"] as const).map((tk) => (
                  <button key={tk} type="button" onClick={() => setValue("min_tier", tk)} style={{ flex: 1, padding: "10px 0", fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 500, color: minTier === tk ? TIERS[tk].accent as string : COLORS.ivoryDim, background: minTier === tk ? "rgba(201,168,76,0.05)" : COLORS.blackElev, border: `0.5px solid ${minTier === tk ? TIERS[tk].accent as string : COLORS.hairline}`, borderRadius: 1 }}>
                    {TIERS[tk].name}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Inventario (vacío = ∞)">
              <input type="number" {...register("stock")} style={INPUT_STYLE} placeholder="∞" />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea {...register("description")} style={{ ...INPUT_STYLE, minHeight: 70, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, resize: "vertical" }} />
          </Field>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "space-between" }}>
          {reward ? <Btn variant="danger" size="sm" onClick={handleDelete} disabled={del.isPending}>Eliminar</Btn> : <div />}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" variant="gold" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Guardando…" : reward ? "Guardar" : "Crear recompensa"}
            </Btn>
          </div>
        </div>
      </form>
    </div>
  )
}
