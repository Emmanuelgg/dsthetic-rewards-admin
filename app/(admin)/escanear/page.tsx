"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { COLORS, MONO, SANS, SERIF, TIERS } from "@/lib/theme/tokens"
import {
  AnimatedNumber, Avatar, Btn, Display, Eyebrow, FakeQR,
  Field, GoldHair, HRule, Icon, ImgPlaceholder, Modal, ModalHeader,
  Panel, Press, TierChip, INPUT_STYLE,
} from "@/components/ui"
import { TopBar } from "@/components/layout/TopBar"
import { useCreditMember, useMembers, useMemberTransactions, useRedeemReward } from "@/hooks/useMembers"
import { useRewards } from "@/hooks/useRewards"
import { useTreatments } from "@/hooks/useTreatments"
import type { MemberLedger, Transaction } from "@/lib/types"
import { membersService } from "@/lib/api/services/members"
import { useDashboardActivity } from "@/hooks/useDashboard"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

type Phase = "idle" | "searching" | "matched" | "done"

const codeSchema = yup.object({ code: yup.string().required("Ingresa un código") })

const TIER_ORD: Record<string, number> = { plata: 1, oro: 2, diamante: 3 }
const now = Date.now()

export default function EscanearPage() {
  const [phase,       setPhase]       = useState<Phase>("idle")
  const [ledger,      setLedger]      = useState<MemberLedger | null>(null)
  const [actionMode,  setActionMode]  = useState<"credit" | "redeem" | null>(null)
  const [toast,       setToast]       = useState<{ kind: "credit" | "redeem"; text: string } | null>(null)
  const [searchErr,   setSearchErr]   = useState("")
  const [cameraActive,setCameraActive]= useState(false)
  const [cameraError, setCameraError] = useState("")

  const { data: membersPage }   = useMembers({ limit: 6 })
  const members = membersPage?.items ?? []
  const { data: activity = [] } = useDashboardActivity(8)
  const { data: txData }        = useMemberTransactions(ledger?.id ?? "")
  const txns = txData?.items ?? []

  const visitCount  = txns.filter((t) => t.type === "credit").length
  const redeemCount = txns.filter((t) => t.type === "redeem").length

  const { register: regCode, handleSubmit: handleCode, formState: { errors: codeErrors } } = useForm({
    resolver: yupResolver(codeSchema),
  })

  const scanByCode = async (data: { code: string }) => {
    setSearchErr("")
    setPhase("searching")
    try {
      const result = await membersService.byCode(data.code.trim().toUpperCase())
      setLedger(result)
      setPhase("matched")
    } catch {
      setPhase("idle")
      setSearchErr("Código no encontrado")
    }
  }

  const scanById = async (memberId: string) => {
    setSearchErr("")
    setPhase("searching")
    try {
      const result = await membersService.get(memberId)
      setLedger(result)
      setPhase("matched")
    } catch {
      setPhase("idle")
    }
  }

  const reset = () => { setPhase("idle"); setLedger(null); setActionMode(null); setSearchErr("") }

  const handleQrScan = (code: string) => {
    if (phase !== "idle") return
    scanByCode({ code: code.trim().toUpperCase() })
  }

  const toggleCamera = () => {
    setCameraActive((v) => !v)
    setCameraError("")
  }

  const showToast = async (kind: "credit" | "redeem", text: string, memberId: string) => {
    try {
      const updated = await membersService.get(memberId)
      setLedger(updated)
    } catch { /* no-op — show stale balance rather than crash */ }
    setToast({ kind, text })
    setTimeout(() => setToast(null), 2800)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar />
      <div className="page-body nice-scroll" style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {/* intro */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ maxWidth: 540 }}>
            <Display size={32} weight={400} style={{ marginBottom: 8 }}>Escanea la tarjeta del socio</Display>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: COLORS.ivoryDim, lineHeight: 1.5 }}>
              Ingresa el código del socio o selecciónalo de la lista reciente para acreditar una visita o canjear una recompensa.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Eyebrow size={9} style={{ color: COLORS.ivoryMute }}>Estado</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", border: `0.5px solid ${COLORS.hairlineStrong}`, borderRadius: 1 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: phase === "idle" ? COLORS.gold : phase === "searching" ? COLORS.amber : COLORS.sage,
                animation: phase === "searching" ? "pulse 1.2s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", color: COLORS.ivoryDim }}>
                {phase === "idle" ? "EN ESPERA" : phase === "searching" ? "BUSCANDO" : phase === "matched" ? "OK · RECONOCIDO" : "COMPLETADO"}
              </span>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="grid-2col" style={{ gap: 28, alignItems: "stretch" }}>
          {/* Viewfinder panel */}
          <Panel pad={0} style={{ overflow: "hidden", position: "relative", minHeight: 540 }}>
            <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="scan" size={13} color={COLORS.gold} />
                <Eyebrow size={9}>Lector QR · estación 01</Eyebrow>
              </div>
              <button onClick={toggleCamera} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 12px", background: cameraActive ? "rgba(201,168,76,0.08)" : "transparent",
                border: `0.5px solid ${cameraActive ? COLORS.goldDim : COLORS.hairlineStrong}`,
                borderRadius: 1, cursor: "pointer",
              }}>
                <Icon name="cam" size={11} color={cameraActive ? COLORS.gold : COLORS.ivoryDim} />
                <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.14em", color: cameraActive ? COLORS.gold : COLORS.ivoryMute }}>
                  {cameraActive ? "CÁMARA ON" : "ACTIVAR"}
                </span>
              </button>
            </div>

            {/* viewport */}
            <div style={{ aspectRatio: "1 / 1", background: `radial-gradient(circle at 50% 50%, ${COLORS.blackPanelLo} 0%, ${COLORS.blackDeep} 80%)`, position: "relative", overflow: "hidden" }}>
              {/* decorative grain — hidden when camera is live */}
              {!cameraActive && (
                <div style={{ position: "absolute", inset: 0, opacity: 0.35, background: "radial-gradient(rgba(240,232,208,0.05) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
              )}

              {/* live camera feed */}
              {cameraActive && (
                <QrCamera
                  onScan={handleQrScan}
                  onError={(msg) => { setCameraError(msg); setCameraActive(false) }}
                />
              )}

              {/* fake QR shown when matched and camera off */}
              {!cameraActive && (phase === "searching" || phase === "matched") && ledger && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: phase === "searching" ? 0.5 : 0.85, transition: "opacity 600ms ease" }}>
                  <FakeQR size={220} seed={ledger.code} fg={COLORS.ivory} bg="transparent" />
                </div>
              )}

              {/* corner brackets overlay */}
              {[{ top: 60, left: 60, rot: 0 }, { top: 60, right: 60, rot: 90 }, { bottom: 60, right: 60, rot: 180 }, { bottom: 60, left: 60, rot: 270 }].map((pos, i) => (
                <div key={i} style={{ position: "absolute", ...pos, width: 38, height: 38, transform: `rotate(${pos.rot}deg)`, zIndex: 2 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 0.5, background: COLORS.gold }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: 0.5, height: 20, background: COLORS.gold }} />
                </div>
              ))}

              {/* scan line: loop while camera active, single-shot while searching */}
              {(cameraActive || phase === "searching") && (
                <div style={{
                  position: "absolute", left: 60, right: 60, height: 1,
                  background: COLORS.gold, boxShadow: `0 0 12px ${COLORS.gold}`, zIndex: 2,
                  animation: cameraActive
                    ? "scanLine 1.8s ease-in-out infinite"
                    : "scanLine 1.4s ease-in-out",
                }} />
              )}

              <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
                {phase === "idle"      && !cameraActive && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: COLORS.ivoryDim }}>· esperando código ·</div>}
                {phase === "idle"      &&  cameraActive && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.32em", color: COLORS.gold, textTransform: "uppercase" }}>· enfoca el QR ·</div>}
                {phase === "searching" && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.32em", color: COLORS.gold, textTransform: "uppercase" }}>· buscando ·</div>}
                {phase === "matched"   && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: COLORS.gold }}>· socio reconocido ·</div>}
              </div>
            </div>

            {/* search footer */}
            <div style={{ padding: "18px 22px 20px", borderTop: `0.5px solid ${COLORS.hairline}` }}>
              <Eyebrow size={8.5} style={{ marginBottom: 10 }}>Buscar por código</Eyebrow>
              <form onSubmit={handleCode(scanByCode)} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  {...regCode("code")}
                  placeholder="DSTH-0000147"
                  style={{ ...INPUT_STYLE, flex: 1, padding: "8px 10px", fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", border: `0.5px solid ${codeErrors.code ? COLORS.rose : COLORS.hairline}` }}
                />
                <Btn type="submit" size="sm" variant="ghost" disabled={phase === "searching"}>Buscar</Btn>
                {phase === "matched" && <Btn size="sm" variant="ghost" onClick={reset}>Nuevo</Btn>}
              </form>
              {searchErr  && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.rose, marginBottom: 6 }}>{searchErr}</div>}
              {cameraError && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.rose, marginBottom: 6 }}>{cameraError}</div>}

              {members.length > 0 && (
                <div>
                  <Eyebrow size={8} style={{ marginBottom: 8 }}>Socios recientes</Eyebrow>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {members.slice(0, 6).map((m) => (
                      <button key={m.id} onClick={() => scanById(m.id)} disabled={phase === "searching"}
                        style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "6px 9px", borderRadius: 1, border: `0.5px solid ${COLORS.hairlineStrong}`, color: COLORS.ivoryDim, background: "transparent", cursor: phase === "searching" ? "wait" : "pointer" }}>
                        {m.code.slice(-4)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>

          {/* Profile panel */}
          <Panel pad={0} style={{ position: "relative", minHeight: 540, display: "flex", flexDirection: "column" }}>
            {phase === "idle"      && <ProfileEmpty />}
            {phase === "searching" && <ProfileLoading />}
            {(phase === "matched" || phase === "done") && ledger && (
              <ProfileMatched
                ledger={ledger}
                visitCount={visitCount}
                redeemCount={redeemCount}
                onCredit={() => setActionMode("credit")}
                onRedeem={() => setActionMode("redeem")}
              />
            )}
          </Panel>
        </div>

        {/* Activity strip */}
        {activity.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
              <Eyebrow size={9.5}>Movimientos de hoy</Eyebrow>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute }}>actualizado en vivo</div>
            </div>
            <div className="table-scroll">
            <Panel pad={0} style={{ minWidth: 560 }}>
              {activity.slice(0, 6).map((r, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "90px 130px 1fr 1fr 100px",
                  alignItems: "center", gap: 16, padding: "14px 22px",
                  borderTop: i === 0 ? "none" : `0.5px solid ${COLORS.hairline}`,
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>
                    {new Date(r.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.gold, letterSpacing: "0.06em" }}>{r.member_code}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: COLORS.ivory }}>{r.member_name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: r.delta < 0 ? COLORS.rose : COLORS.gold }}>
                      {r.type === "redeem" ? "Canjeó" : "Acreditó"}
                    </span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: COLORS.ivoryDim }}>{r.label}</span>
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: r.delta > 0 ? COLORS.gold : COLORS.rose, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                    {r.delta > 0 ? "+" : ""}{r.delta}
                  </div>
                </div>
              ))}
            </Panel>
            </div>
          </div>
        )}

        {/* Modals */}
        {ledger && (
          <>
            <Modal open={actionMode === "credit"} onClose={() => setActionMode(null)} width={620}>
              <CreditModal
                ledger={ledger}
                onClose={() => setActionMode(null)}
                onDone={(text) => { setActionMode(null); showToast("credit", text, ledger.id) }}
              />
            </Modal>
            <Modal open={actionMode === "redeem"} onClose={() => setActionMode(null)} width={720}>
              <RedeemModal
                ledger={ledger}
                onClose={() => setActionMode(null)}
                onDone={(text) => { setActionMode(null); showToast("redeem", text, ledger.id) }}
              />
            </Modal>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
            zIndex: 80, animation: "fadeUp 320ms ease",
            background: COLORS.blackPanel, border: `0.5px solid ${COLORS.goldDim}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)", padding: "18px 26px",
            display: "flex", alignItems: "center", gap: 18, borderRadius: 1, minWidth: 420,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(154,171,138,0.15)", border: "0.5px solid rgba(154,171,138,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={14} color={COLORS.sage} />
            </div>
            <div style={{ flex: 1 }}>
              <Eyebrow size={8.5} gold>{toast.kind === "credit" ? "Visita acreditada" : "Canje realizado"}</Eyebrow>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: COLORS.ivory, marginTop: 5 }}>{toast.text}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── QR Camera ────────────────────────────────────────────
function QrCamera({ onScan, onError }: { onScan: (code: string) => void; onError: (msg: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let scanner: { start: () => Promise<void>; stop: () => void; destroy: () => void } | null = null
    // `cancelled` guards against strict-mode double-invoke: the import is async, so cleanup
    // may run before it resolves. Without this flag, two scanner instances race on the same
    // <video> element and only one (unpredictably) wins — causing the "needs multiple clicks" bug.
    let cancelled = false

    import("qr-scanner").then(({ default: QrScanner }) => {
      if (cancelled || !videoRef.current) return
      scanner = new QrScanner(
        videoRef.current,
        (result: { data: string }) => onScan(result.data),
        { returnDetailedScanResult: true, highlightScanRegion: false, highlightCodeOutline: false }
      )
      scanner.start().catch(() => {
        if (!cancelled) onError("Permiso de cámara denegado o no disponible.")
      })
    })

    return () => {
      cancelled = true
      scanner?.stop()
      scanner?.destroy()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      playsInline
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, zIndex: 1 }}
    />
  )
}

// ─── Profile states ──────────────────────────────────────
function ProfileEmpty() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", border: `0.5px solid ${COLORS.hairlineStrong}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
        <Icon name="scan" size={26} color={COLORS.ivoryMute} />
      </div>
      <Display size={22} italic weight={400} style={{ color: COLORS.ivoryDim, marginBottom: 10 }}>Esperando socio</Display>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: COLORS.ivoryMute, maxWidth: 280, lineHeight: 1.5 }}>
        Ingresa un código o selecciona un socio reciente para comenzar.
      </div>
      <div style={{ marginTop: 26 }}><GoldHair width={20} opacity={0.4} /></div>
    </div>
  )
}

function ProfileLoading() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: COLORS.gold, marginBottom: 14 }}>· buscando ·</div>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.gold, animation: `pulse 1s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

function ProfileMatched({ ledger, visitCount, redeemCount, onCredit, onRedeem }: {
  ledger: MemberLedger
  visitCount: number
  redeemCount: number
  onCredit: () => void
  onRedeem: () => void
}) {
  const router    = useRouter()
  const tierData  = TIERS[ledger.tier as keyof typeof TIERS]
  const nextTier  = tierData?.next ? TIERS[tierData.next as keyof typeof TIERS] : null
  const pct       = nextTier && tierData?.ceil
    ? Math.min(1, Math.max(0, (ledger.smiles_lifetime - tierData.floor) / (tierData.ceil - tierData.floor)))
    : 1
  const name      = `${ledger.first_name} ${ledger.last_name}`
  const age       = ledger.birth_date
    ? Math.floor((now - new Date(ledger.birth_date).getTime()) / 31536000000)
    : null

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", animation: "fadeUp 360ms ease" }}>
      <div style={{ padding: "18px 26px 14px", borderBottom: `0.5px solid ${COLORS.hairline}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Eyebrow gold size={9}>Socio identificado</Eyebrow>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.gold, letterSpacing: "0.12em" }}>{ledger.code}</div>
      </div>
      <div style={{ padding: "24px 26px 14px", display: "flex", alignItems: "center", gap: 18 }}>
        <Avatar name={name} size={64} tier={ledger.tier} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Display size={26} italic weight={400} style={{ lineHeight: 1.05 }}>{name}</Display>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <TierChip tier={ledger.tier} size={9.5} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.1em" }}>
              SOCIO DESDE {new Date(ledger.member_since).getFullYear()}
            </span>
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryDim, letterSpacing: "0.12em" }}>
              VISITAS · <span style={{ color: COLORS.ivory }}>{visitCount}</span>
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryDim, letterSpacing: "0.12em" }}>
              CANJES · <span style={{ color: COLORS.ivory }}>{redeemCount}</span>
            </span>
          </div>
        </div>
      </div>
      <div style={{ padding: "6px 26px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <Eyebrow size={8.5} style={{ marginBottom: 6 }}>Saldo disponible</Eyebrow>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <AnimatedNumber value={ledger.smiles_balance} size={50} />
              <span style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.28em", color: COLORS.ivoryDim, textTransform: "uppercase" }}>smiles</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: COLORS.hairline, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${pct * 100}%`, background: COLORS.gold, transition: "width 800ms ease" }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryDim, letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" }}>{Math.round(pct * 100)}%</div>
          </div>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
            <Eyebrow size={8.5}>{ledger.tier_label.toUpperCase()}</Eyebrow>
            <Eyebrow size={8.5} gold={!!nextTier}>
              {nextTier ? `${(tierData?.ceil ?? 0) - ledger.smiles_lifetime} para ${nextTier.label.toUpperCase()}` : "NIVEL MÁX"}
            </Eyebrow>
          </div>
        </div>
      </div>
      <HRule />
      <div style={{ padding: "14px 26px", display: "flex", gap: 24, alignItems: "center" }}>
        {ledger.phone && <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}><Icon name="phone" size={13} color={COLORS.gold} /><span style={{ fontFamily: SANS, fontSize: 12, color: COLORS.ivoryDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ledger.phone}</span></div>}
        {age && <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Icon name="calendar" size={13} color={COLORS.gold} /><span style={{ fontFamily: SANS, fontSize: 12, color: COLORS.ivoryDim }}>{age} años</span></div>}
      </div>
      <HRule />
      <div style={{ padding: "14px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Icon name="mail" size={13} color={COLORS.gold} /><span style={{ fontFamily: SANS, fontSize: 12, color: COLORS.ivoryDim }}>{ledger.email}</span></div>
      </div>
      <HRule />
      <div style={{ marginTop: "auto", padding: "22px 26px", background: "rgba(201,168,76,0.025)", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn variant="gold" size="lg" onClick={onCredit} icon={<Icon name="plus" size={14} color={COLORS.black} />}>Acreditar visita</Btn>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onRedeem} style={{ flex: 1, justifyContent: "center" }} icon={<Icon name="gift" size={14} />}>Canjear recompensa</Btn>
          <Btn variant="ghost" onClick={() => router.push(`/socios?member=${ledger.id}`)} icon={<Icon name="arrow-r" size={12} />}>Perfil</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Credit Modal ──────────────────────────────────────────
function CreditModal({ ledger, onClose, onDone }: { ledger: MemberLedger; onClose: () => void; onDone: (text: string) => void }) {
  const { data: treatmentsPage } = useTreatments()
  const treatments = treatmentsPage?.items ?? []
  const credit = useCreditMember()
  const [selected, setSelected] = useState<string>("")
  const [note,     setNote]     = useState("")

  const activeTreatments = treatments.filter((t) => t.is_active)
  const t      = activeTreatments.find((x) => x.id === selected) ?? activeTreatments[0]
  const mult   = { plata: 1, oro: 1.5, diamante: 2 }[ledger.tier as "plata"|"oro"|"diamante"] ?? 1
  const earned = t ? Math.round(t.base_smiles * mult) : 0

  const confirm = async () => {
    if (!t) return
    await credit.mutateAsync({ id: ledger.id, treatment_id: t.id, note })
    onDone(`${ledger.first_name} · +${earned} smiles · ${t.name}`)
  }

  return (
    <div>
      <ModalHeader eyebrow="Acreditar visita" title="Registrar tratamiento" sub={`${ledger.first_name} · ${ledger.code}`} onClose={onClose} />
      <div style={{ padding: "24px 28px" }}>
        <Eyebrow size={9} style={{ marginBottom: 12 }}>1 · Tratamiento</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 22, maxHeight: 320, overflow: "auto" }} className="nice-scroll">
          {activeTreatments.map((it) => {
            const sel = (selected || activeTreatments[0]?.id) === it.id
            return (
              <Press key={it.id} onClick={() => setSelected(it.id)} style={{
                display: "grid", gridTemplateColumns: "20px 1fr 70px 100px", gap: 14, alignItems: "center",
                padding: "11px 14px",
                background: sel ? "rgba(201,168,76,0.06)" : "transparent",
                border: `0.5px solid ${sel ? "rgba(201,168,76,0.35)" : COLORS.hairline}`,
              }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", border: `0.5px solid ${sel ? COLORS.gold : COLORS.hairlineStrong}`, position: "relative" }}>
                  {sel && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: COLORS.gold }} />}
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: COLORS.ivory }}>{it.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.12em", marginTop: 3 }}>
                    {it.category.toUpperCase()} · {it.duration ?? ""}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.ivoryDim, fontVariantNumeric: "tabular-nums" }}>
                  ${Number(it.price).toLocaleString("es-MX")}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: COLORS.gold }}>+{it.base_smiles}</span>
                  <span style={{ fontFamily: SANS, fontSize: 8, color: COLORS.ivoryMute, letterSpacing: "0.22em", marginLeft: 4 }}>SMILES</span>
                </div>
              </Press>
            )
          })}
        </div>
        <Eyebrow size={9} style={{ marginBottom: 10 }}>2 · Nota (opcional)</Eyebrow>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. Aplicó descuento, refirió paciente…" style={{ ...INPUT_STYLE }} />
        <div style={{ marginTop: 24, padding: "18px", border: `0.5px solid ${COLORS.goldDim}`, background: "rgba(201,168,76,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Eyebrow size={8.5} gold>Smiles a acreditar</Eyebrow>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim, marginTop: 4 }}>
              {t?.base_smiles ?? 0} base × {mult} ({ledger.tier_label.toLowerCase()})
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, fontWeight: 300, color: COLORS.gold, lineHeight: 1 }}>+{earned}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: COLORS.gold, letterSpacing: "0.28em" }}>SMILES</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "16px 28px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={confirm} disabled={credit.isPending || !t}>
          {credit.isPending ? "Acreditando…" : "Confirmar y acreditar"}
        </Btn>
      </div>
    </div>
  )
}

// ─── Redeem Modal ──────────────────────────────────────────
function RedeemModal({ ledger, onClose, onDone }: { ledger: MemberLedger; onClose: () => void; onDone: (text: string) => void }) {
  const { data: rewardsPage } = useRewards()
  const rewards = rewardsPage?.items ?? []
  const redeem    = useRedeemReward()
  const available = rewards.filter((r) => r.is_active)
  const [selected, setSelected] = useState<string>("")

  const memberTierOrd = TIER_ORD[ledger.tier] ?? 1
  const r             = available.find((x) => x.id === selected) ?? available[0]
  const tierLocked    = r ? (TIER_ORD[r.min_tier] ?? 1) > memberTierOrd : false
  const enough        = r ? ledger.smiles_balance >= r.cost : false
  const canRedeem     = !tierLocked && enough
  const remaining     = r ? ledger.smiles_balance - r.cost : 0

  const footerMsg = () => {
    if (!r) return ""
    if (tierLocked) return `Requiere nivel ${r.min_tier.charAt(0).toUpperCase() + r.min_tier.slice(1)}.`
    if (!enough)    return `Faltan ${(r.cost - ledger.smiles_balance).toLocaleString("es-MX")} smiles para este canje.`
    return "El canje se registrará en el historial del socio."
  }

  const confirm = async () => {
    if (!r || !canRedeem) return
    await redeem.mutateAsync({ id: ledger.id, reward_id: r.id })
    onDone(`${ledger.first_name} · ${r.name} · −${r.cost} smiles`)
  }

  return (
    <div>
      <ModalHeader eyebrow="Canjear recompensa" title="Elegir del catálogo" sub={`${ledger.first_name} · saldo actual ${ledger.smiles_balance.toLocaleString("es-MX")} smiles`} onClose={onClose} />
      <div style={{ padding: "20px 28px 24px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 380, overflow: "auto" }} className="nice-scroll">
          {available.map((it) => {
            const sel        = (selected || available[0]?.id) === it.id
            const locked     = (TIER_ORD[it.min_tier] ?? 1) > memberTierOrd
            const affordable = ledger.smiles_balance >= it.cost
            return (
              <Press key={it.id} onClick={() => setSelected(it.id)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                background: sel ? "rgba(201,168,76,0.06)" : "transparent",
                border: `0.5px solid ${sel ? "rgba(201,168,76,0.35)" : COLORS.hairline}`,
                opacity: locked || !affordable ? 0.4 : 1,
              }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, background: `repeating-linear-gradient(135deg, ${COLORS.blackElev} 0 8px, rgba(240,232,208,0.04) 8px 9px)`, border: `0.5px solid ${COLORS.hairline}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 11.5, color: COLORS.ivory }}>{it.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <div style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.12em" }}>{it.kind.toUpperCase()}</div>
                    {locked && (
                      <div style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", color: COLORS.rose, padding: "2px 5px", border: `0.5px solid rgba(217,154,138,0.4)` }}>
                        {it.min_tier.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: affordable && !locked ? COLORS.gold : COLORS.ivoryMute }}>{it.cost}</span>
                  <div style={{ fontFamily: SANS, fontSize: 7.5, color: COLORS.ivoryMute, letterSpacing: "0.24em", marginTop: 1 }}>SMILES</div>
                </div>
              </Press>
            )
          })}
        </div>
        {r && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ImgPlaceholder label={r.kind} height={150} accent />
            <Eyebrow size={8.5} gold style={{ marginTop: 16 }}>{r.kind}</Eyebrow>
            <Display size={22} italic weight={400} style={{ marginTop: 6 }}>{r.name}</Display>
            <div style={{ marginTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: COLORS.ivoryDim, lineHeight: 1.5 }}>{r.description}</div>
            <div style={{ marginTop: "auto", paddingTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Eyebrow size={9}>Costo</Eyebrow>
                <div>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: COLORS.gold }}>{r.cost}</span>
                  <span style={{ fontFamily: SANS, fontSize: 9, color: COLORS.gold, letterSpacing: "0.28em", marginLeft: 6 }}>SMILES</span>
                </div>
              </div>
              <HRule />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                <Eyebrow size={9}>Saldo después</Eyebrow>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: canRedeem ? COLORS.ivory : COLORS.rose, fontVariantNumeric: "tabular-nums" }}>
                  {canRedeem ? remaining.toLocaleString("es-MX") : tierLocked ? "bloqueado" : "insuficiente"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ borderTop: `0.5px solid ${COLORS.hairline}`, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: COLORS.ivoryMute }}>{footerMsg()}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="gold" disabled={!canRedeem || redeem.isPending} onClick={confirm}>
            {redeem.isPending ? "Canjeando…" : "Confirmar canje"}
          </Btn>
        </div>
      </div>
    </div>
  )
}
