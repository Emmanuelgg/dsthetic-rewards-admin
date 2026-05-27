"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { COLORS, MONO, SANS, SERIF, TIERS, type TierKey } from "@/lib/theme/tokens"
import {
  Btn, Display, Eyebrow, Field, GoldHair, HRule, Icon,
  Modal, Panel, Press, TierGlyph, INPUT_STYLE,
} from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import { useTierBreakdown } from "@/hooks/useDashboard"
import { useSettings } from "@/hooks/useSettings"
import {
  useTierRewards, useTiers, useUpdateTier, useUpdateTierBoundaries,
} from "@/hooks/useTiers"
import type { Tier, TierBoundary } from "@/lib/types"

const tierSchema = yup.object({
  label:      yup.string().required("Requerido"),
  multiplier: yup.string().required("Requerido"),
})

export default function NivelesPage() {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const { data: tiers  = [] }      = useTiers()
  const { data: breakdown = [] }   = useTierBreakdown()
  const { data: settings }         = useSettings()

  const countMap = Object.fromEntries(breakdown.map((b) => [b.tier, b.count]))
  const tiersSorted = [...tiers].sort((a, b) => a.ord - b.ord)
  const expiryMonths = settings?.points_expiry_months ?? 12

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ maxWidth: 580 }}>
            <Display size={32} weight={400} style={{ marginBottom: 8 }}>Niveles de membresía</Display>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim, lineHeight: 1.5 }}>
              Los socios avanzan acumulando smiles. Cada nivel desbloquea más productos canjeables y multiplica las smiles por tratamiento.
            </div>
          </div>
        </div>

        {/* progression ladder */}
        <Panel pad={0} style={{ marginBottom: 28 }}>
          <div style={{ padding: "28px 32px 14px" }}>
            <Eyebrow size={9.5}>Progresión</Eyebrow>
          </div>
          <div style={{ padding: "0 32px 36px", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: 60, right: 60, height: 0.5, background: `linear-gradient(to right, ${COLORS.gold} 0%, ${COLORS.gold} 100%)`, opacity: 0.3 }} />
            <div className="grid-kpi-3" style={{ padding: "40px 0" }}>
              {tiersSorted.map((tier) => {
                const T = TIERS[tier.key as TierKey]
                return (
                  <div key={tier.key} style={{ textAlign: "center", position: "relative" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.black, border: `0.5px solid ${T?.accent as string}`, display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
                      <TierGlyph tier={tier.key} size={18} />
                    </div>
                    <div style={{ marginTop: 16, fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: COLORS.ivory }}>{tier.name}</div>
                    <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.18em" }}>
                      {tier.floor.toLocaleString("es-MX")}{tier.ceil ? ` – ${tier.ceil.toLocaleString("es-MX")}` : "+"} SMILES
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Panel>

        {/* detail cards */}
        <div className="grid-kpi-3">
          {tiersSorted.map((tier) => {
            const T = TIERS[tier.key as TierKey]
            return (
              <Panel key={tier.key} pad={0} style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${T?.accent as string}, transparent)`, opacity: 0.6 }} />
                <div style={{ padding: "26px 26px 18px", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <TierGlyph tier={tier.key} size={44} />
                  </div>
                  <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.42em", color: T?.accent as string, textTransform: "uppercase" }}>{tier.name}</div>
                  <div style={{ marginTop: 14 }}><GoldHair width={20} opacity={0.6} /></div>
                  <div style={{ marginTop: 20 }}>
                    <Eyebrow size={8.5}>Umbral</Eyebrow>
                    <Display size={38} italic weight={300} style={{ marginTop: 8 }}>
                      {tier.floor.toLocaleString("es-MX")}{tier.ceil ? `–${tier.ceil.toLocaleString("es-MX")}` : "+"}
                    </Display>
                    <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.28em" }}>SMILES ACUMULADAS</div>
                  </div>
                </div>
                <HRule />
                <div style={{ padding: "18px 26px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Eyebrow size={8.5}>Multiplicador</Eyebrow>
                  <Display size={18} italic weight={400} color={T?.accent as string}>{tier.multiplier}×</Display>
                </div>
                <HRule />
                <div style={{ padding: "20px 26px" }}>
                  <Eyebrow size={8.5} style={{ marginBottom: 14 }}>Productos canjeables</Eyebrow>
                  <TierRewardsList tierKey={tier.key} accent={T?.accent as string} />
                </div>
                <HRule />
                <div style={{ padding: "14px 26px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: COLORS.ivory }}>{countMap[tier.key] ?? "—"}</span>
                    <span style={{ fontFamily: SANS, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.24em", marginLeft: 6, textTransform: "uppercase" }}>socios</span>
                  </div>
                  <Btn size="sm" variant="ghost" onClick={() => setEditingKey(tier.key)} icon={<Icon name="edit" size={11} />}>Editar</Btn>
                </div>
              </Panel>
            )
          })}
        </div>

        {/* global rules + boundary editor */}
        <Panel pad={26} style={{ marginTop: 28 }}>
          <Eyebrow size={9.5} style={{ marginBottom: 18 }}>Reglas globales del programa</Eyebrow>
          <div className="grid-kpi-3" style={{ gap: 24 }}>
            <Rule
              label="Vigencia de smiles"
              value={`${expiryMonths} ${expiryMonths === 1 ? "mes" : "meses"}`}
              desc={`Las smiles expiran ${expiryMonths} ${expiryMonths === 1 ? "mes" : "meses"} después de su acumulación.`}
            />
            <Rule label="Bono de cumpleaños"  value="+100"      desc="Aplicado automáticamente el día del cumpleaños." />
            <Rule label="Bono por referido"   value="+200"      desc="Por cada nuevo socio referido que complete su primera visita." />
          </div>
        </Panel>

        <Panel pad={26} style={{ marginTop: 24 }}>
          <Eyebrow size={9.5} style={{ marginBottom: 18 }}>Umbrales editables</Eyebrow>
          <BoundariesEditor tiers={tiersSorted} />
        </Panel>

        <Modal open={!!editingKey} onClose={() => setEditingKey(null)} width={520}>
          {editingKey && (
            <TierEditor
              tier={tiersSorted.find((t) => t.key === editingKey)!}
              onClose={() => setEditingKey(null)}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}

function Rule({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div>
      <Eyebrow size={8.5} style={{ marginBottom: 10 }}>{label}</Eyebrow>
      <Display size={24} italic weight={400} color={COLORS.gold}>{value}</Display>
      <div style={{ marginTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim, lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}

function TierRewardsList({ tierKey, accent }: { tierKey: string; accent: string }) {
  const { data: rewards, isLoading } = useTierRewards(tierKey)

  if (isLoading) {
    return (
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute }}>
        Cargando…
      </div>
    )
  }
  if (!rewards || rewards.length === 0) {
    return (
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryMute, lineHeight: 1.4 }}>
        Aún no hay productos para este nivel.
      </div>
    )
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {rewards.map((r) => (
        <li
          key={r.id}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0",
            borderBottom: `0.5px solid ${COLORS.hairline}`,
          }}
        >
          <TierGlyph tier={r.min_tier} size={14} />
          <span
            style={{
              flex: 1, minWidth: 0,
              fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5,
              color: COLORS.ivory, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
            title={r.name}
          >
            {r.name}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 9.5, color: accent, letterSpacing: "0.12em" }}>
            {r.cost.toLocaleString("es-MX")} S
          </span>
        </li>
      ))}
    </ul>
  )
}

function BoundariesEditor({ tiers }: { tiers: Tier[] }) {
  const update = useUpdateTierBoundaries()
  const [error, setError] = useState<string | null>(null)
  // Local state of transitions: index i = ceil of tiers[i] (== floor of tiers[i+1]).
  // Length is tiers.length - 1.
  const [transitions, setTransitions] = useState<number[]>(() =>
    tiers.slice(0, -1).map((t) => t.ceil ?? 0)
  )

  // Keep local state in sync if upstream changes (e.g. another admin saves).
  useEffect(() => {
    setTransitions(tiers.slice(0, -1).map((t) => t.ceil ?? 0))
  }, [tiers])

  if (tiers.length < 2) {
    return (
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryMute }}>
        Se requieren al menos dos tiers para editar umbrales.
      </div>
    )
  }

  const handleSave = async () => {
    setError(null)
    // Local validation: strictly increasing.
    for (let i = 1; i < transitions.length; i++) {
      if (transitions[i] <= transitions[i - 1]) {
        setError(`El umbral ${tiers[i].name}→${tiers[i + 1].name} (${transitions[i]}) debe ser mayor que ${tiers[i - 1].name}→${tiers[i].name} (${transitions[i - 1]}).`)
        return
      }
    }
    if (transitions.some((n) => !Number.isFinite(n) || n < 1)) {
      setError("Cada umbral debe ser un entero mayor o igual a 1.")
      return
    }

    const boundaries: TierBoundary[] = tiers.map((t, i) => ({
      key: t.key,
      floor: i === 0 ? 0 : transitions[i - 1],
      ceil: i === tiers.length - 1 ? null : transitions[i],
    }))

    try {
      await update.mutateAsync(boundaries)
    } catch (e: unknown) {
      const msg = extractError(e)
      setError(msg)
    }
  }

  const reset = () => {
    setTransitions(tiers.slice(0, -1).map((t) => t.ceil ?? 0))
    setError(null)
  }

  return (
    <div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim, lineHeight: 1.5, marginBottom: 18 }}>
        Cada umbral define dónde termina un tier y empieza el siguiente. El primero arranca en 0 y el último no tiene techo.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <BoundaryFixedRow label={`${tiers[0].name} · piso`} value="0" />

        {tiers.slice(0, -1).map((t, i) => {
          const next = tiers[i + 1]
          return (
            <div
              key={t.key}
              style={{
                display: "grid", gridTemplateColumns: "1fr 180px", gap: 16, alignItems: "center",
                padding: "10px 14px",
                background: COLORS.blackElev,
                border: `0.5px solid ${COLORS.hairline}`,
                borderRadius: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <TierGlyph tier={t.key} size={14} />
                <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: COLORS.ivory, textTransform: "uppercase" }}>
                  {t.name}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.ivoryMute }}>→</span>
                <TierGlyph tier={next.key} size={14} />
                <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: COLORS.ivory, textTransform: "uppercase" }}>
                  {next.name}
                </span>
              </div>
              <input
                type="number"
                min={1}
                step={1}
                value={transitions[i]}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setTransitions((arr) => arr.map((x, j) => (j === i ? v : x)))
                }}
                style={INPUT_STYLE}
              />
            </div>
          )
        })}

        <BoundaryFixedRow label={`${tiers[tiers.length - 1].name} · techo`} value="∞" />
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: "10px 14px", border: `0.5px solid ${COLORS.rose}`, color: COLORS.rose, fontFamily: SANS, fontSize: 11, letterSpacing: "0.12em" }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={reset} disabled={update.isPending}>Restablecer</Btn>
        <Btn variant="gold" onClick={handleSave} disabled={update.isPending}>
          {update.isPending ? "Guardando…" : "Guardar umbrales"}
        </Btn>
      </div>
    </div>
  )
}

function BoundaryFixedRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "1fr 180px", gap: 16, alignItems: "center",
        padding: "10px 14px",
        opacity: 0.5,
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.18em", color: COLORS.ivoryDim, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 12, color: COLORS.ivoryDim, paddingLeft: 12 }}>{value}</span>
    </div>
  )
}

function extractError(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const res = (err as { response?: { data?: { detail?: unknown } } }).response
    const detail = res?.data?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in (detail[0] as object)) {
      return String((detail[0] as { msg: string }).msg)
    }
  }
  return "No se pudo guardar. Intenta de nuevo."
}

function TierEditor({ tier, onClose }: { tier: Tier; onClose: () => void }) {
  const update = useUpdateTier()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(tierSchema),
    defaultValues: {
      label:      tier.label,
      multiplier: tier.multiplier,
    },
  })

  const onSubmit = async (data: { label: string; multiplier: string }) => {
    await update.mutateAsync({ key: tier.key, data: { label: data.label, multiplier: data.multiplier } })
    onClose()
  }

  return (
    <div>
      <div style={{ padding: "22px 28px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Eyebrow gold size={9} style={{ marginBottom: 10 }}>Editar nivel</Eyebrow>
          <Display size={26} italic weight={400}>{tier.name}</Display>
        </div>
        <Press onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={12} color={COLORS.ivoryDim} />
        </Press>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px" }}>
          <Field label="Etiqueta del nivel">
            <input {...register("label")} style={INPUT_STYLE} />
            {errors.label && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.label.message}</div>}
          </Field>
          <Field label="Multiplicador de smiles">
            <input {...register("multiplier")} style={INPUT_STYLE} placeholder="Ej. 1.5" />
            {errors.multiplier && <div style={{ color: COLORS.rose, fontSize: 11, marginTop: 4 }}>{errors.multiplier.message}</div>}
          </Field>
          <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute, lineHeight: 1.5 }}>
            Los productos canjeables se gestionan en{" "}
            <a href="/recompensas" style={{ color: COLORS.gold }}>Recompensas</a>{" "}
            y los umbrales en el panel inferior.
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn type="submit" variant="gold" disabled={update.isPending}>{update.isPending ? "Guardando…" : "Guardar cambios"}</Btn>
        </div>
      </form>
    </div>
  )
}
