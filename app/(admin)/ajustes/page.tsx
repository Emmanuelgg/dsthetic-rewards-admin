"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { COLORS, SANS, SERIF } from "@/lib/theme/tokens"
import {
  Btn, Display, Eyebrow, Field, GoldHair, Icon,
  INPUT_STYLE, Modal, Panel, Press,
} from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import { useExpirePoints, useSettings, useUpdateSettings } from "@/hooks/useSettings"

const monthsSchema = yup.object({
  points_expiry_months: yup
    .number()
    .typeError("Requerido")
    .integer("Solo enteros")
    .min(1, "Mínimo 1")
    .max(120, "Máximo 120")
    .required("Requerido"),
})

type MonthsForm = { points_expiry_months: number }

export default function AjustesPage() {
  const [editing, setEditing] = useState(false)
  const [sweepResult, setSweepResult] = useState<string | null>(null)
  const { data: settings, isLoading } = useSettings()
  const expire = useExpirePoints()

  const months = settings?.points_expiry_months ?? 12

  async function handleSweep() {
    setSweepResult(null)
    const r = await expire.mutateAsync()
    setSweepResult(
      `${r.smiles_expired.toLocaleString("es-MX")} smiles caducadas en ${r.members_affected} socio(s) · ${r.processed} registros`,
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ maxWidth: 580, marginBottom: 28 }}>
          <Display size={32} weight={400} style={{ marginBottom: 8 }}>Ajustes del programa</Display>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim, lineHeight: 1.5 }}>
            Configuración global de smiles. Los cambios aplican a nuevos créditos: las caducidades ya asignadas se conservan.
          </div>
        </div>

        {/* Caducidad */}
        <Panel pad={0} style={{ marginBottom: 24 }}>
          <div style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
            <div style={{ maxWidth: 420 }}>
              <Eyebrow size={9.5} style={{ marginBottom: 12 }}>Caducidad de smiles</Eyebrow>
              <Display size={48} italic weight={300} color={COLORS.gold} style={{ marginBottom: 6 }}>
                {isLoading ? "…" : `${months}`}
                <span style={{ fontSize: 18, marginLeft: 10, fontStyle: "italic", color: COLORS.ivoryDim }}>
                  {months === 1 ? "mes" : "meses"}
                </span>
              </Display>
              <GoldHair width={28} opacity={0.6} />
              <div style={{ marginTop: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim, lineHeight: 1.55 }}>
                Las smiles expiran {months} {months === 1 ? "mes" : "meses"} después de su acumulación. Aplica únicamente a nuevos créditos; las caducidades ya asignadas no se modifican al cambiar este valor.
              </div>
            </div>
            <Btn variant="ghost" size="sm" icon={<Icon name="edit" size={11} />} onClick={() => setEditing(true)}>
              Editar
            </Btn>
          </div>
        </Panel>

        {/* Sweep */}
        <Panel pad={0}>
          <div style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
            <div style={{ maxWidth: 480 }}>
              <Eyebrow size={9.5} style={{ marginBottom: 12 }}>Procesar caducidades</Eyebrow>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim, lineHeight: 1.55 }}>
                Las caducidades se aplican automáticamente al consultar el ledger de cada socio. Este barrido manual recorre todos los socios con créditos vencidos pendientes y materializa las expiraciones en una sola pasada.
              </div>
              {sweepResult && (
                <div style={{ marginTop: 16, fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: COLORS.gold, textTransform: "uppercase" }}>
                  {sweepResult}
                </div>
              )}
            </div>
            <Btn variant="ghost" size="sm" onClick={handleSweep} disabled={expire.isPending}>
              {expire.isPending ? "Procesando…" : "Procesar ahora"}
            </Btn>
          </div>
        </Panel>

        <Modal open={editing} onClose={() => setEditing(false)} width={480}>
          {settings && (
            <MonthsEditor
              current={settings.points_expiry_months}
              onClose={() => setEditing(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}

function MonthsEditor({ current, onClose }: { current: number; onClose: () => void }) {
  const update = useUpdateSettings()
  const { register, handleSubmit, formState: { errors } } = useForm<MonthsForm>({
    resolver: yupResolver(monthsSchema),
    defaultValues: { points_expiry_months: current },
  })

  const onSubmit = async (data: MonthsForm) => {
    await update.mutateAsync({ points_expiry_months: data.points_expiry_months })
    onClose()
  }

  return (
    <div>
      <div style={{ padding: "22px 28px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Eyebrow gold size={9} style={{ marginBottom: 10 }}>Editar caducidad</Eyebrow>
          <Display size={26} italic weight={400}>Vigencia de smiles</Display>
        </div>
        <Press onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={12} color={COLORS.ivoryDim} />
        </Press>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ padding: "24px 28px" }}>
          <Field label="Meses hasta caducar (1–120)">
            <input
              type="number"
              min={1}
              max={120}
              step={1}
              {...register("points_expiry_months", { valueAsNumber: true })}
              style={INPUT_STYLE}
            />
            {errors.points_expiry_months && (
              <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 11, color: COLORS.rose }}>
                {errors.points_expiry_months.message}
              </div>
            )}
          </Field>
          <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute, lineHeight: 1.5 }}>
            Solo afecta a nuevos créditos. Las transacciones existentes conservan su caducidad original.
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "14px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn type="submit" variant="gold" disabled={update.isPending}>
            {update.isPending ? "Guardando…" : "Guardar cambios"}
          </Btn>
        </div>
      </form>
    </div>
  )
}
