"use client"

import { useState } from "react"
import { COLORS, MONO, SANS, SERIF, TIERS } from "@/lib/theme/tokens"
import { AnimatedNumber, Display, Eyebrow, HRule, Panel, TierChip } from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import { useDashboardActivity, useDashboardKpis, useSmilesMovement, useTierBreakdown, useTopRewards } from "@/hooks/useDashboard"

const PERIODS = [
  { id: "today", label: "Hoy" },
  { id: "7d",    label: "7 días" },
  { id: "30d",   label: "30 días" },
  { id: "ytd",   label: "YTD" },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d")
  const { data: kpis }      = useDashboardKpis(period)
  const { data: breakdown } = useTierBreakdown()
  const { data: topRewards} = useTopRewards()
  const { data: activity  } = useDashboardActivity(8)
  const { data: movement  } = useSmilesMovement(14)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto" }}>
        {/* intro */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ maxWidth: 580 }}>
            <Display size={32} weight={400} style={{ marginBottom: 8 }}>Resumen del programa</Display>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim, lineHeight: 1.5 }}>
              Vista general del rendimiento. Los datos se actualizan cada hora.
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PERIODS.map(({ id, label }) => (
              <button key={id} onClick={() => setPeriod(id)} style={{
                padding: "8px 14px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.24em",
                textTransform: "uppercase", color: period === id ? COLORS.gold : COLORS.ivoryDim,
                fontWeight: 500, border: `0.5px solid ${period === id ? COLORS.goldDim : COLORS.hairline}`,
                background: period === id ? "rgba(201,168,76,0.06)" : "transparent", borderRadius: 1,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        {kpis && (
          <div className="grid-kpi" style={{ marginBottom: 32 }}>
            <KpiCard label="Nuevos socios"           value={kpis.new_members}    delta="" spark={[]} />
            <KpiCard label="Smiles acreditadas"      value={kpis.smiles_credited} delta="" spark={[]} />
            <KpiCard label="Smiles canjeadas"        value={kpis.smiles_redeemed} delta="" spark={[]} />
            <KpiCard label="Socios activos"          value={kpis.active_members}  delta="" spark={[]} />
          </div>
        )}

        {/* main grid */}
        <div className="grid-2col" style={{ marginBottom: 32 }}>
          <Panel pad={0}>
            <div style={{ padding: "20px 26px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <Eyebrow size={9.5} style={{ marginBottom: 6 }}>Movimiento de smiles · últimos 14 días</Eyebrow>
                <Display size={22} italic weight={400}>Acreditaciones vs. canjes</Display>
              </div>
              <div style={{ display: "flex", gap: 18, fontFamily: SANS, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                <span style={{ color: COLORS.gold, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.gold }} /> Acreditadas
                </span>
                <span style={{ color: COLORS.rose, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.rose, opacity: 0.65 }} /> Canjeadas
                </span>
              </div>
            </div>
            {movement && movement.length > 0
              ? <DualBarChart data={movement} />
              : <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: SERIF, fontStyle: "italic", color: COLORS.ivoryMute }}>Sin datos</span></div>
            }
          </Panel>

          <Panel pad={26}>
            <Eyebrow size={9.5} style={{ marginBottom: 6 }}>Composición de socios</Eyebrow>
            <Display size={22} italic weight={400} style={{ marginBottom: 22 }}>
              {breakdown ? breakdown.reduce((s, r) => s + r.count, 0) : "—"} activos
            </Display>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {(breakdown ?? []).map((row) => (
                <div key={`${row.tier}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <TierChip tier={row.tier} size={10} />
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: COLORS.ivory }}>{row.count}</span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>{Math.round(row.share * 100)}%</span>
                    </div>
                  </div>
                  <div style={{ height: 1, background: COLORS.hairline, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${row.share * 100}%`, background: TIERS[row.tier_key as keyof typeof TIERS]?.accent as string ?? COLORS.gold }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* bottom row */}
        <div className="grid-2col">
          <Panel pad={0}>
            <div style={{ padding: "20px 26px 16px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <Eyebrow size={9.5}>Actividad reciente</Eyebrow>
            </div>
            {(activity ?? []).map((r, i) => (
              <div key={`${r.member_code}-${i}`} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px",
                alignItems: "center", gap: 14, padding: "12px 26px",
                borderTop: `0.5px solid ${COLORS.hairline}`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>
                  {new Date(r.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: COLORS.ivory }}>{r.member_name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.08em" }}>{r.member_code}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: r.delta < 0 ? COLORS.rose : COLORS.gold }}>
                    {r.type === "redeem" ? "Canjeó" : "Acreditó"}
                  </span>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim }}>{r.label}</span>
                </div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: r.delta > 0 ? COLORS.gold : COLORS.rose, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {r.delta > 0 ? "+" : ""}{r.delta}
                </div>
              </div>
            ))}
          </Panel>

          <Panel pad={26}>
            <Eyebrow size={9.5} style={{ marginBottom: 6 }}>Recompensas más canjeadas</Eyebrow>
            <Display size={22} italic weight={400} style={{ marginBottom: 20 }}>Este período</Display>
            {(topRewards ?? []).slice(0, 5).map((r, i) => (
              <div key={r.reward_id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.gold, letterSpacing: "0.12em" }}>0{i + 1}</span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: COLORS.ivory }}>{r.name} - {r.kind}</span>
                  </div>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: COLORS.ivory, fontVariantNumeric: "tabular-nums" }}>{r.redemption_count}</span>
                </div>
                <div style={{ height: 1, background: COLORS.hairline, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${Math.min(1, r.redemption_count / Math.max(...(topRewards ?? []).map((x) => x.redemption_count), 1)) * 100}%`, background: COLORS.gold, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, delta, spark }: { label: string; value: number; delta: string; spark: number[] }) {
  return (
    <Panel pad={22}>
      <Eyebrow size={9} style={{ marginBottom: 14 }}>{label}</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <AnimatedNumber value={value} size={44} weight={300} />
        {delta && <span style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.gold, letterSpacing: "0.1em", fontVariantNumeric: "tabular-nums" }}>{delta}</span>}
      </div>
      {spark.length > 1 && <Sparkline data={spark} />}
    </Panel>
  )
}

function Sparkline({ data, height = 28 }: { data: number[]; height?: number }) {
  const w   = 100
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - ((v - min) / (max - min || 1)) * height
    return `${x},${y}`
  }).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <polyline points={pts} fill="none" stroke={COLORS.gold} strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${height} ${pts} ${w},${height}`} fill={COLORS.gold} opacity="0.08" />
    </svg>
  )
}

function DualBarChart({ data }: { data: { date: string; credited: number; redeemed: number }[] }) {
  const h      = 220
  const padX   = 26
  const maxVal = Math.max(...data.map((d) => Math.max(d.credited, d.redeemed)), 1)
  return (
    <div style={{ padding: `16px ${padX}px 36px`, position: "relative" }}>
      <div style={{ height: h, position: "relative", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 0.5, background: COLORS.hairline }} />
        <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", gap: 4 }}>
          {data.map((d, i) => {
            const upH = (d.credited / maxVal) * (h / 2 - 4)
            const dn  = (d.redeemed / maxVal) * (h / 2 - 4)
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", position: "relative" }}>
                <div style={{ position: "absolute", bottom: "50%", width: "60%", height: upH, background: COLORS.gold, opacity: 0.85, transition: "height 600ms ease" }} />
                <div style={{ position: "absolute", top: "50%", width: "60%", height: dn, background: COLORS.rose, opacity: 0.55, transition: "height 600ms ease" }} />
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.06em" }}>
            {new Date(d.date).getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
