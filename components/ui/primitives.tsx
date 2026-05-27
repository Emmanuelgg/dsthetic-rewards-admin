"use client"

import React, { useEffect, useRef, useState } from "react"
import { COLORS, MONO, SANS, SERIF, TIERS, type TierKey } from "@/lib/theme/tokens"
import { Icon } from "./Icon"

// ─── Eyebrow ──────────────────────────────────────────────
interface EyebrowProps {
  children: React.ReactNode
  gold?: boolean
  size?: number
  color?: string
  style?: React.CSSProperties
}
export function Eyebrow({ children, gold, size = 10, color, style }: EyebrowProps) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: size,
      letterSpacing: "0.32em", textTransform: "uppercase",
      color: gold ? COLORS.gold : (color ?? COLORS.ivoryDim),
      fontWeight: 500, ...style,
    }}>{children}</div>
  )
}

// ─── Display ──────────────────────────────────────────────
interface DisplayProps {
  children: React.ReactNode
  size?: number
  italic?: boolean
  weight?: number
  color?: string
  style?: React.CSSProperties
}
export function Display({ children, size = 44, italic = true, weight = 300, color, style }: DisplayProps) {
  return (
    <div style={{
      fontFamily: SERIF, fontStyle: italic ? "italic" : "normal",
      fontSize: size, fontWeight: weight,
      letterSpacing: "-0.02em", lineHeight: 1.05,
      color: color ?? COLORS.ivory, ...style,
    }}>{children}</div>
  )
}

// ─── Wordmark ─────────────────────────────────────────────
export function Wordmark({ size = 14, sub = "Admin · Recompensas" }: { size?: number; sub?: string }) {
  return (
    <div style={{ textAlign: "left", lineHeight: 1 }}>
      <div style={{
        fontFamily: SERIF, fontSize: size, letterSpacing: "0.42em",
        color: COLORS.ivory, fontWeight: 400,
        textTransform: "uppercase", paddingLeft: "0.42em",
      }}>Dsthetic</div>
      {sub && (
        <div style={{
          fontFamily: SANS, fontSize: Math.max(7.5, size * 0.46),
          letterSpacing: "0.32em", color: COLORS.gold,
          marginTop: size * 0.46, textTransform: "uppercase", fontWeight: 400,
        }}>{sub}</div>
      )}
    </div>
  )
}

// ─── GoldHair ─────────────────────────────────────────────
export function GoldHair({ width = 32, my = 0, opacity = 1 }: { width?: number; my?: number; opacity?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: `${my}px 0`, opacity }}>
      <div style={{ width, height: 0.5, background: COLORS.gold }} />
      <div style={{ width: 3, height: 3, borderRadius: 3, background: COLORS.gold }} />
      <div style={{ width, height: 0.5, background: COLORS.gold }} />
    </div>
  )
}

// ─── HRule ────────────────────────────────────────────────
export function HRule({ opacity = 1, color }: { opacity?: number; color?: string }) {
  return <div style={{ height: 0.5, background: color ?? COLORS.hairline, opacity, width: "100%" }} />
}

// ─── TierGlyph ────────────────────────────────────────────
export function TierGlyph({ tier = "plata", size = 14 }: { tier?: string; size?: number }) {
  const fill = (TIERS[tier as TierKey]?.accent as string) ?? COLORS.gold
  if (tier === "diamante") return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ display: "block" }}>
      <path d="M7 1 L13 5.5 L7 13 L1 5.5 Z" fill="none" stroke={fill} strokeWidth="0.8" />
      <path d="M3.5 5.5 L10.5 5.5" stroke={fill} strokeWidth="0.5" opacity="0.7" />
      <path d="M5.2 5.5 L7 1 L8.8 5.5" stroke={fill} strokeWidth="0.5" opacity="0.7" fill="none" />
    </svg>
  )
  if (tier === "oro") return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke={fill} strokeWidth="0.8" />
      <circle cx="7" cy="7" r="2.5" fill={fill} opacity="0.85" />
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke={fill} strokeWidth="0.8" />
      <circle cx="7" cy="7" r="2.5" fill="none" stroke={fill} strokeWidth="0.6" />
    </svg>
  )
}

// ─── TierChip ─────────────────────────────────────────────
export function TierChip({ tier = "plata", size = 10 }: { tier?: string; size?: number }) {
  const T = TIERS[tier as TierKey] ?? TIERS.plata
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      fontFamily: SANS, fontSize: size, letterSpacing: "0.32em",
      color: T.accent as string, fontWeight: 500, textTransform: "uppercase",
    }}>
      <TierGlyph tier={tier} size={size + 2} />
      <span>{T.label}</span>
    </span>
  )
}

// ─── Panel ────────────────────────────────────────────────
interface PanelProps {
  children: React.ReactNode
  style?: React.CSSProperties
  pad?: number
  soft?: boolean
  onClick?: () => void
}
export function Panel({ children, style, pad = 24, soft = false, onClick }: PanelProps) {
  return (
    <div onClick={onClick} style={{
      background: soft ? "transparent" : COLORS.blackPanel,
      border: `0.5px solid ${COLORS.hairline}`,
      borderRadius: 2, padding: pad,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>{children}</div>
  )
}

// ─── Btn ──────────────────────────────────────────────────
interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "gold" | "ghost" | "dark" | "danger"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  disabled?: boolean
  style?: React.CSSProperties
  type?: "button" | "submit" | "reset"
}
export function Btn({ children, onClick, variant = "ghost", size = "md", icon, disabled, style, type = "button" }: BtnProps) {
  const [down, setDown] = useState(false)
  const padY = size === "sm" ? 7 : size === "lg" ? 16 : 11
  const padX = size === "sm" ? 14 : size === "lg" ? 28 : 20
  const fs   = size === "sm" ? 9.5 : size === "lg" ? 11.5 : 10.5
  const palette = {
    gold:   { bg: COLORS.gold,       fg: COLORS.black,   bd: COLORS.gold },
    ghost:  { bg: "transparent",     fg: COLORS.ivory,   bd: COLORS.hairlineStrong },
    dark:   { bg: COLORS.blackElev,  fg: COLORS.ivory,   bd: COLORS.hairline },
    danger: { bg: "transparent",     fg: COLORS.rose,    bd: "rgba(217,154,138,0.35)" },
  }[variant]
  return (
    <button
      type={type}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: `${padY}px ${padX}px`,
        background: palette.bg, color: palette.fg,
        border: `0.5px solid ${palette.bd}`,
        borderRadius: 1,
        fontFamily: SANS, fontSize: fs,
        letterSpacing: "0.28em", textTransform: "uppercase",
        fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : (down ? 0.86 : 1),
        transform: down ? "translateY(0.5px)" : "none",
        transition: "opacity 120ms ease, transform 120ms ease",
        ...style,
      }}
    >
      {icon}{children}
    </button>
  )
}

// ─── ImgPlaceholder ───────────────────────────────────────
interface ImgPlaceholderProps {
  label?: string
  height?: number
  ratio?: string
  accent?: boolean
  style?: React.CSSProperties
}
export function ImgPlaceholder({ label, height = 140, ratio, accent = false, style }: ImgPlaceholderProps) {
  const fg = accent ? COLORS.gold : COLORS.ivoryMute
  return (
    <div style={{
      width: "100%", aspectRatio: ratio, height: ratio ? undefined : height,
      background: `repeating-linear-gradient(135deg, ${COLORS.blackPanel} 0 12px, rgba(240,232,208,0.04) 12px 13px)`,
      borderRadius: 2,
      display: "flex", alignItems: "flex-end", padding: 10, boxSizing: "border-box",
      position: "relative", overflow: "hidden", ...style,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.18em", color: fg, textTransform: "uppercase" }}>
        {label ?? "imagery"}
      </div>
      <div style={{
        position: "absolute", top: 8, right: 10,
        width: 6, height: 6, border: `0.5px solid ${fg}`, transform: "rotate(45deg)",
      }} />
    </div>
  )
}

// ─── AnimatedNumber ───────────────────────────────────────
interface AnimatedNumberProps {
  value: number
  duration?: number
  italic?: boolean
  size?: number
  weight?: number
  color?: string
}
export function AnimatedNumber({ value, duration = 900, italic = true, size = 64, weight = 300, color }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const from = prev.current
    const to   = value
    if (from === to) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration)
      const e = 1 - Math.pow(1 - k, 3)
      setDisplay(Math.round(from + (to - from) * e))
      if (k < 1) raf = requestAnimationFrame(tick)
      else prev.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <span style={{
      fontFamily: SERIF, fontStyle: italic ? "italic" : "normal",
      fontSize: size, lineHeight: 0.9, fontWeight: weight,
      color: color ?? COLORS.ivory, letterSpacing: "-0.02em",
      fontVariantNumeric: "tabular-nums", display: "inline-block",
    }}>{display.toLocaleString("es-MX")}</span>
  )
}

// ─── FakeQR ───────────────────────────────────────────────
export function FakeQR({ size = 180, seed = "DSTH-0000001", fg = "#0A0A0A", bg = "#F0E8D0", cells = 29 }: {
  size?: number; seed?: string; fg?: string; bg?: string; cells?: number
}) {
  const seedInit = React.useMemo(() => {
    let s = 0
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
    return s
  }, [seed])

  const sRef = React.useRef<number>(seedInit)
  React.useEffect(() => { sRef.current = seedInit }, [seedInit])

  const rand = React.useCallback(() => {
    sRef.current = (sRef.current * 1664525 + 1013904223) >>> 0
    return sRef.current / 0xffffffff
  }, [])
  const grid = React.useMemo(() => {
    const g: number[][] = []
    for (let y = 0; y < cells; y++) {
      const row: number[] = []
      for (let x = 0; x < cells; x++) row.push(rand() > 0.52 ? 1 : 0)
      g.push(row)
    }
    const stamp = (cx: number, cy: number) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const onBorder = x === 0 || x === 6 || y === 0 || y === 6
        const inner    = x >= 2 && x <= 4 && y >= 2 && y <= 4
        g[cy + y][cx + x] = (onBorder || inner) ? 1 : 0
      }
    }
    stamp(0, 0); stamp(cells - 7, 0); stamp(0, cells - 7)
    const m = Math.floor(cells / 2)
    for (let y = m - 2; y <= m + 2; y++) for (let x = m - 2; x <= m + 2; x++) g[y][x] = 0
    return g
  }, [rand, cells])
  const cell = size / cells
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: 4, position: "relative", boxSizing: "border-box", padding: cell }}>
      <svg width={size - cell * 2} height={size - cell * 2} viewBox={`0 0 ${cells} ${cells}`} style={{ display: "block" }}>
        {grid.map((row, y) =>
          row.map((v, x) =>
            v ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fg} rx="0.15" /> : null
          )
        )}
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: cell * 6, height: cell * 6, borderRadius: "50%",
        background: bg, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 0 ${cell * 0.4}px ${bg}`,
      }}>
        <div style={{
          fontFamily: SERIF, fontStyle: "italic", fontSize: cell * 3.3,
          color: fg, lineHeight: 1, fontWeight: 400, letterSpacing: "-0.05em",
        }}>D</div>
      </div>
    </div>
  )
}

// ─── Press ────────────────────────────────────────────────
interface PressProps {
  onClick?: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  hoverStyle?: React.CSSProperties
  role?: string
}
export function Press({ onClick, children, style, hoverStyle = {}, role }: PressProps) {
  const [down,  setDown]  = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <div
      role={role ?? (onClick ? "button" : undefined)}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => { setDown(false); setHover(false) }}
      onPointerEnter={() => setHover(true)}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        transition: "transform 120ms ease, opacity 120ms ease, background 160ms ease, border-color 160ms ease",
        transform: down ? "scale(0.995)" : "scale(1)",
        opacity: down ? 0.9 : 1,
        ...style,
        ...(hover ? hoverStyle : {}),
      }}
    >{children}</div>
  )
}

// ─── Avatar ───────────────────────────────────────────────
export function Avatar({ name = "", size = 36, tier }: { name?: string; size?: number; tier?: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase()
  const ring     = tier ? ((TIERS[tier as TierKey]?.accent as string) ?? COLORS.gold) : COLORS.gold
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: COLORS.blackElev,
      border: `0.5px solid ${ring}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: SERIF, fontStyle: "italic",
      fontSize: size * 0.42, color: COLORS.ivory, fontWeight: 400,
      letterSpacing: "-0.02em", flexShrink: 0,
    }}>{initials}</div>
  )
}

// ─── Modal ────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  width?: number
}
export function Modal({ open, onClose, children, width = 560 }: ModalProps) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(5,5,5,0.72)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 180ms ease",
    }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="nice-scroll"
        style={{
          width: `min(90vw, ${width}px)`, maxHeight: "85vh", overflow: "auto",
          background: COLORS.blackPanel,
          border: `0.5px solid ${COLORS.hairlineStrong}`,
          borderRadius: 2,
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Switch ───────────────────────────────────────────────
export function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 42, height: 22, borderRadius: 11,
        border: `0.5px solid ${value ? COLORS.gold : COLORS.hairlineStrong}`,
        background: value ? "rgba(201,168,76,0.18)" : "transparent",
        position: "relative", transition: "all 200ms ease",
        cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: value ? 22 : 2,
        width: 16, height: 16, borderRadius: "50%",
        background: value ? COLORS.gold : COLORS.ivoryMute,
        transition: "left 200ms ease, background 200ms ease",
      }} />
    </button>
  )
}

// ─── Field ────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Eyebrow size={8.5} style={{ marginBottom: 8 }}>{label}</Eyebrow>
      {children}
    </div>
  )
}

// ─── ModalHeader ──────────────────────────────────────────
interface ModalHeaderProps {
  eyebrow: string
  title: string
  sub?: string
  onClose: () => void
}
export function ModalHeader({ eyebrow, title, sub, onClose }: ModalHeaderProps) {
  return (
    <div style={{
      padding: "22px 28px 20px",
      borderBottom: `0.5px solid ${COLORS.hairline}`,
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    }}>
      <div>
        <Eyebrow gold size={9} style={{ marginBottom: 10 }}>{eyebrow}</Eyebrow>
        <Display size={26} italic weight={400} style={{ marginBottom: 6 }}>{title}</Display>
        {sub && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: COLORS.ivoryDim }}>{sub}</div>}
      </div>
      <Press onClick={onClose} style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `0.5px solid ${COLORS.hairlineStrong}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="x" size={12} color={COLORS.ivoryDim} />
      </Press>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────
interface PaginationProps {
  total: number
  skip: number
  limit: number
  onChange: (skip: number) => void
}
export function Pagination({ total, skip, limit, onChange }: PaginationProps) {
  if (!total || total <= limit) return null
  const pages   = Math.ceil(total / limit)
  const current = Math.floor(skip / limit) + 1
  const btnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px",
    fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.22em",
    textTransform: "uppercase", fontWeight: 500,
    background: "transparent", border: `0.5px solid ${COLORS.hairlineStrong}`,
    borderRadius: 1, cursor: "pointer", color: COLORS.ivory,
    transition: "opacity 120ms ease",
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 22px", borderTop: `0.5px solid ${COLORS.hairline}`,
    }}>
      <button
        onClick={() => onChange(skip - limit)}
        disabled={current === 1}
        style={{ ...btnBase, opacity: current === 1 ? 0.3 : 1, cursor: current === 1 ? "default" : "pointer" }}
      >
        <Icon name="arrow-l" size={11} color={COLORS.ivory} />
        Anterior
      </button>
      <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.ivoryDim, letterSpacing: "0.12em" }}>
        {current} / {pages}
      </span>
      <button
        onClick={() => onChange(skip + limit)}
        disabled={current >= pages}
        style={{ ...btnBase, opacity: current >= pages ? 0.3 : 1, cursor: current >= pages ? "default" : "pointer" }}
      >
        Siguiente
        <Icon name="arrow-r" size={11} color={COLORS.ivory} />
      </button>
    </div>
  )
}

// ─── InputStyle ───────────────────────────────────────────
export const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: COLORS.blackElev,
  border: `0.5px solid ${COLORS.hairline}`,
  color: COLORS.ivory, fontFamily: SANS, fontSize: 12, borderRadius: 1,
  boxSizing: "border-box",
}
