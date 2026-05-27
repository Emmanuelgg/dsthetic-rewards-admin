"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { COLORS, MONO, SANS, SERIF } from "@/lib/theme/tokens"
import { Eyebrow, Icon, Wordmark } from "@/components/ui"
import { useSidebar } from "./AdminShell"

type NavEntry = {
  id: string
  label: string
  icon: string
  primary: boolean
  href: string
  adminOnly?: boolean
}

const NAV: NavEntry[] = [
  { id: "escanear",   label: "Escanear",    icon: "scan",     primary: true,  href: "/escanear"   },
  { id: "dashboard",  label: "Dashboard",   icon: "dash",     primary: false, href: "/dashboard"  },
  { id: "socios",     label: "Socios",      icon: "users",    primary: false, href: "/socios"     },
  { id: "niveles",    label: "Niveles",     icon: "tiers",    primary: false, href: "/niveles"    },
  { id: "recompensas",label: "Recompensas", icon: "gift",     primary: false, href: "/recompensas"},
  { id: "servicios",  label: "Servicios",   icon: "tooth",    primary: false, href: "/servicios"  },
  { id: "ajustes",    label: "Ajustes",     icon: "settings", primary: false, href: "/ajustes", adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { open } = useSidebar()
  const { data: session } = useSession()
  const role = session?.role
  const visible = NAV.filter((it) => !it.adminOnly || role === "admin")

  return (
    <aside className={`sidebar-shell${open ? " open" : ""}`} style={{
      width: 232, flexShrink: 0,
      background: COLORS.blackDeep,
      borderRight: `0.5px solid ${COLORS.hairline}`,
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, bottom: 0, right: -0.5,
        width: 1, background: `linear-gradient(to bottom, transparent 0%, ${COLORS.gold} 30%, ${COLORS.gold} 70%, transparent 100%)`,
        opacity: 0.18, pointerEvents: "none",
      }} />

      <div style={{ padding: "32px 28px 28px", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
        <Wordmark size={13} sub="Admin · Recompensas" />
      </div>

      <nav style={{ flex: 1, padding: "24px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Eyebrow size={8.5} style={{ padding: "4px 14px 14px", color: COLORS.ivoryMute }}>Operación</Eyebrow>
        {visible.slice(0, 1).map((it) => (
          <NavItem key={it.id} {...it} active={pathname.startsWith(it.href)} />
        ))}
        <Eyebrow size={8.5} style={{ padding: "20px 14px 14px", color: COLORS.ivoryMute }}>Administración</Eyebrow>
        {visible.slice(1).map((it) => (
          <NavItem key={it.id} {...it} active={pathname.startsWith(it.href)} />
        ))}
      </nav>

      <div style={{ padding: "20px 24px 24px", borderTop: `0.5px solid ${COLORS.hairline}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 1,
            background: COLORS.blackElev,
            border: `0.5px solid ${COLORS.goldDim}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SERIF, fontStyle: "italic", fontSize: 17,
            color: COLORS.gold, letterSpacing: "-0.04em", lineHeight: 1,
          }}>D</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 10.5, color: COLORS.ivory, fontWeight: 500 }}>Dsthetic</div>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.1em", marginTop: 2 }}>
              CLÍNICA #01 · ACTIVA
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ id, label, icon, primary, active, href }: {
  id: string; label: string; icon: string; primary: boolean; active: boolean; href: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: primary ? "12px 14px" : "11px 14px",
        background: active
          ? (primary ? "rgba(201,168,76,0.08)" : "rgba(240,232,208,0.04)")
          : (hover ? "rgba(240,232,208,0.02)" : "transparent"),
        border: `0.5px solid ${active ? (primary ? "rgba(201,168,76,0.32)" : COLORS.hairlineStrong) : "transparent"}`,
        borderRadius: 1,
        textDecoration: "none",
        position: "relative",
        transition: "background 160ms ease, border-color 160ms ease",
      }}
    >
      {active && (
        <div style={{
          position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
          width: 8, height: 0.5, background: COLORS.gold,
        }} />
      )}
      <Icon name={icon} size={15} color={active ? (primary ? COLORS.gold : COLORS.ivory) : COLORS.ivoryDim} />
      <span style={{
        fontFamily: SANS, fontSize: 11.5,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: active ? (primary ? COLORS.gold : COLORS.ivory) : COLORS.ivoryDim,
        fontWeight: 500, flex: 1,
      }}>{label}</span>
      {primary && (
        <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.18em", color: COLORS.gold, opacity: active ? 1 : 0.6 }}>●</span>
      )}
    </Link>
  )
}

