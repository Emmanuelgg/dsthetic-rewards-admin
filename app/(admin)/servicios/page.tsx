"use client"

import { useState, useEffect } from "react"
import { COLORS, MONO, SANS, SERIF } from "@/lib/theme/tokens"
import {
  Btn, Display, Eyebrow, Field, Icon, Modal,
  Pagination, Panel, Press, INPUT_STYLE,
} from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import { useCreateTreatment, useDeleteTreatment, useTreatments, useUpdateTreatment } from "@/hooks/useTreatments"
import type { Treatment } from "@/lib/types"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const treatmentSchema = yup.object({
  name:        yup.string().required("Requerido"),
  category:    yup.string().required("Requerido"),
  duration:    yup.string().optional(),
  price:       yup.number().min(0, "Debe ser 0 o mayor").required(),
  base_smiles: yup.number().min(0, "Debe ser 0 o mayor").required(),
  is_active:   yup.boolean().required(),
  description: yup.string().optional(),
})

const LIMIT = 50
const TREATMENT_CATS = ["todas","Ortodoncia","Implantes","Blanqueamiento","Periodoncia","Endodoncia","Odontología General","Radiología","Cirugía Oral"]

export default function ServiciosPage() {
  const [search,    setSearch]    = useState("")
  const [catFilter, setCatFilter] = useState("todas")
  const [skip,      setSkip]      = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating,  setCreating]  = useState(false)

  useEffect(() => { setSkip(0) }, [search, catFilter])

  const { data } = useTreatments({
    search:    search || undefined,
    category:  catFilter !== "todas" ? catFilter : undefined,
    skip,
    limit: LIMIT,
    order_by:  "category",
    order_dir: "asc",
  })

  const treatments = data?.items ?? []
  const total      = data?.total ?? 0

  const editing = editingId ? treatments.find((t) => t.id === editingId) : null

  const activeTreatments = treatments.filter((t) => t.is_active)
  const withPrice        = activeTreatments.filter((t) => parseFloat(t.price) > 0)
  const avgPrice         = withPrice.length
    ? Math.round(withPrice.reduce((s, t) => s + parseFloat(t.price), 0) / withPrice.length)
    : 0
  const avgSmiles = activeTreatments.length
    ? Math.round(activeTreatments.reduce((s, t) => s + t.base_smiles, 0) / activeTreatments.length)
    : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar search={search} onSearch={setSearch} />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Display size={32} weight={400} style={{ marginBottom: 8 }}>Servicios y tratamientos</Display>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim, lineHeight: 1.5, maxWidth: 580 }}>
              Cada servicio define cuántas smiles base recibe el socio. El multiplicador del nivel se aplica al acreditar.
            </div>
          </div>
          <Btn variant="gold" onClick={() => setCreating(true)} icon={<Icon name="plus" size={13} color={COLORS.black} />} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            Nuevo servicio
          </Btn>
        </div>

        {/* filter bar */}
        <Panel pad={0} style={{ marginBottom: 20 }}>
          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Eyebrow size={9} style={{ marginRight: 6 }}>Categoría</Eyebrow>
            {TREATMENT_CATS.map((c) => (
              <FilterPill key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
                {c === "todas" ? "Todas" : c}
              </FilterPill>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: COLORS.ivoryMute, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
              {total.toLocaleString("es-MX")} RESULTADOS
            </span>
          </div>
        </Panel>

        {/* table */}
        <div className="table-scroll">
        <Panel pad={0} style={{ minWidth: 700 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "50px 1.8fr 1fr 100px 120px 130px 40px",
            gap: 18, alignItems: "center",
            padding: "12px 22px",
            borderBottom: `0.5px solid ${COLORS.hairline}`,
          }}>
            <Eyebrow size={8.5}>#</Eyebrow>
            <Eyebrow size={8.5}>Tratamiento</Eyebrow>
            <Eyebrow size={8.5}>Categoría</Eyebrow>
            <Eyebrow size={8.5}>Duración</Eyebrow>
            <Eyebrow size={8.5} style={{ textAlign: "right" }}>Precio</Eyebrow>
            <Eyebrow size={8.5} style={{ textAlign: "right" }}>Smiles base</Eyebrow>
            <div />
          </div>

          {treatments.map((t, i) => {
            const price     = parseFloat(t.price)
            const earnRatio = price > 0 ? (t.base_smiles / price * 100).toFixed(1) : "∞"
            return (
              <Press key={t.id} style={{
                display: "grid",
                gridTemplateColumns: "50px 1.8fr 1fr 100px 120px 130px 40px",
                gap: 18, alignItems: "center",
                padding: "16px 22px",
                borderTop: `0.5px solid ${COLORS.hairline}`,
                opacity: t.is_active ? 1 : 0.55,
              }} hoverStyle={{ background: "rgba(240,232,208,0.025)" }} onClick={() => setEditingId(t.id)}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <Display size={17} italic weight={400} style={{ lineHeight: 1.15 }}>{t.name}</Display>
                  {!t.is_active && (
                    <div style={{ fontFamily: MONO, fontSize: 8, color: COLORS.rose, letterSpacing: "0.14em", marginTop: 3 }}>EN PAUSA</div>
                  )}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.22em", color: COLORS.ivoryDim, textTransform: "uppercase" }}>
                  {t.category}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.ivoryDim, letterSpacing: "0.08em" }}>
                  {t.duration ?? "—"}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: COLORS.ivory, fontVariantNumeric: "tabular-nums" }}>
                    {price === 0 ? "—" : `$${price.toLocaleString("es-MX")}`}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: COLORS.gold, fontVariantNumeric: "tabular-nums" }}>
                    +{t.base_smiles}
                  </span>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: COLORS.ivoryMute, letterSpacing: "0.14em", marginTop: 2 }}>
                    RATIO {earnRatio}{price > 0 ? "%" : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Icon name="chev-r" size={12} color={COLORS.ivoryMute} />
                </div>
              </Press>
            )
          })}

          {treatments.length === 0 && (
            <div style={{ padding: "60px 22px", textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: COLORS.ivoryDim }}>· sin resultados ·</div>
            </div>
          )}
          <Pagination total={total} skip={skip} limit={LIMIT} onChange={setSkip} />
        </Panel>
        </div>

        {/* summary strip */}
        <div className="grid-kpi" style={{ marginTop: 22 }}>
          <SummaryCell label="Servicios activos"  value={activeTreatments.length} />
          <SummaryCell label="Precio promedio"    value={avgPrice > 0 ? `$${avgPrice.toLocaleString("es-MX")}` : "—"} />
          <SummaryCell label="Smiles promedio"    value={avgSmiles} accent />
          <SummaryCell label="Categorías"         value={TREATMENT_CATS.length - 1} />
        </div>

        <Modal open={!!editing} onClose={() => setEditingId(null)} width={560}>
          {editing && <TreatmentEditor treatment={editing} onClose={() => setEditingId(null)} />}
        </Modal>
        <Modal open={creating} onClose={() => setCreating(false)} width={560}>
          {creating && <TreatmentEditor treatment={null} onClose={() => setCreating(false)} />}
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

function SummaryCell({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <Panel pad={20}>
      <Eyebrow size={8.5} style={{ marginBottom: 10 }}>{label}</Eyebrow>
      <Display size={28} italic weight={400} color={accent ? COLORS.gold : COLORS.ivory}>{value}</Display>
    </Panel>
  )
}

function TreatmentEditor({ treatment, onClose }: { treatment: Treatment | null; onClose: () => void }) {
  const create = useCreateTreatment()
  const update = useUpdateTreatment()
  const del    = useDeleteTreatment()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(treatmentSchema),
    defaultValues: {
      name:        treatment?.name        ?? "",
      category:    treatment?.category    ?? "Ortodoncia",
      duration:    treatment?.duration    ?? "",
      price:       treatment ? parseFloat(treatment.price) : 0,
      base_smiles: treatment?.base_smiles ?? 0,
      is_active:   treatment?.is_active   ?? true,
      description: treatment?.description ?? "",
    },
  })

  const onSubmit = async (data: {
    name: string; category: string; duration?: string; price: number;
    base_smiles: number; is_active: boolean; description?: string
  }) => {
    const payload = { ...data, price: data.price.toString() }
    if (treatment) {
      await update.mutateAsync({ id: treatment.id, data: payload })
    } else {
      await create.mutateAsync(payload as any)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!treatment) return
    await del.mutateAsync(treatment.id)
    onClose()
  }

  return (
    <div>
      <div style={{ padding: "22px 28px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Eyebrow gold size={9} style={{ marginBottom: 10 }}>{treatment ? "Editar servicio" : "Nuevo servicio"}</Eyebrow>
          <Display size={26} italic weight={400}>{treatment?.name || "Sin nombre"}</Display>
        </div>
        <Press onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={12} color={COLORS.ivoryDim} />
        </Press>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px" }}>
          <Field label="Nombre del servicio">
            <input {...register("name")} style={INPUT_STYLE} />
            {errors.name && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.name.message}</div>}
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Categoría">
              <select {...register("category")} style={INPUT_STYLE}>
                {["Ortodoncia","Implantes","Blanqueamiento","Periodoncia","Endodoncia","Odontología General","Radiología","Cirugía Oral"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Duración">
              <input {...register("duration")} style={INPUT_STYLE} placeholder="Ej. 45 min" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Precio (MXN)">
              <input type="number" step="0.01" {...register("price")} style={INPUT_STYLE} placeholder="0" />
              {errors.price && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.price.message}</div>}
            </Field>
            <Field label="Smiles base">
              <input type="number" {...register("base_smiles")} style={INPUT_STYLE} />
              {errors.base_smiles && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.base_smiles.message}</div>}
            </Field>
          </div>
          <Field label="Descripción">
            <textarea {...register("description")} style={{ ...INPUT_STYLE, minHeight: 70, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <input type="checkbox" id="is_active" {...register("is_active")} style={{ accentColor: COLORS.gold, width: 14, height: 14 }} />
            <label htmlFor="is_active" style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.ivoryDim, cursor: "pointer" }}>
              Servicio activo
            </label>
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "space-between" }}>
          {treatment ? <Btn variant="danger" size="sm" onClick={handleDelete} disabled={del.isPending}>Eliminar</Btn> : <div />}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" variant="gold" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Guardando…" : treatment ? "Guardar" : "Crear servicio"}
            </Btn>
          </div>
        </div>
      </form>
    </div>
  )
}
