"use client"

import { useRef, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { COLORS, MONO, SANS, SERIF } from "@/lib/theme/tokens"
import { Avatar, Display, Eyebrow, Icon, Press } from "@/components/ui"
import { useSidebar } from "./AdminShell"

const SECTIONS: Record<string, { eyebrow: string; title: string }> = {
  "/escanear":    { eyebrow: "Operación",      title: "Escanear"              },
  "/dashboard":   { eyebrow: "Vista general",  title: "Dashboard"             },
  "/socios":      { eyebrow: "Administración", title: "Socios"                },
  "/niveles":     { eyebrow: "Programa",       title: "Niveles"               },
  "/recompensas": { eyebrow: "Catálogo",       title: "Recompensas"           },
  "/servicios":   { eyebrow: "Catálogo",       title: "Servicios y tratamientos"},
}

export function TopBar({ search, onSearch }: { search?: string; onSearch?: (v: string) => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { toggle } = useSidebar()
  const section    = Object.keys(SECTIONS).find((k) => pathname.startsWith(k)) ?? "/escanear"
  const { eyebrow, title } = SECTIONS[section]
  const today      = new Date()
  const dateLabel  = today.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
  const name       = session?.user?.email?.split("@")[0] ?? "Admin"
  const role       = session?.role ?? "admin"

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  return (
    <header className="topbar" style={{
      height: 84, flexShrink: 0,
      flexWrap: "wrap", gap: 24, padding: "0 24px",
      borderBottom: `0.5px solid ${COLORS.hairline}`,
      display: "flex", alignItems: "center",
      background: COLORS.black,
      position: "relative", zIndex: 5,
    }}>
      {/* Hamburger — only visible on mobile */}
      <button
        className="mobile-only"
        onClick={toggle}
        style={{
          width: 36, height: 36, flexShrink: 0,
          alignItems: "center", justifyContent: "center",
          border: `0.5px solid ${COLORS.hairlineStrong}`, borderRadius: 1,
          background: "transparent", cursor: "pointer",
        }}
      >
        <Icon name="menu" size={16} color={COLORS.ivoryDim} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Eyebrow size={9} style={{ marginBottom: 6 }}>{eyebrow}</Eyebrow>
        <Display size={26} italic weight={400}>{title}</Display>
      </div>

      <div className="hide-sm" style={{ flex: "0 1 420px", maxWidth: 420, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="search" size={14} color={COLORS.ivoryMute} />
        </div>
        <input
          value={search ?? ""}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Buscar socio, recompensa, código…"
          style={{
            width: "100%", height: 36,
            paddingLeft: 24, paddingRight: 60,
            background: "transparent",
            border: "none", borderBottom: `0.5px solid ${COLORS.hairline}`,
            color: COLORS.ivory, fontFamily: SANS, fontSize: 13, letterSpacing: "0.02em",
          }}
          onFocus={(e) => (e.target.style.borderBottomColor = COLORS.goldDim)}
          onBlur={(e)  => (e.target.style.borderBottomColor = COLORS.hairline)}
        />
        <div style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          {["⌘","K"].map((k) => (
            <div key={k} style={{
              border: `0.5px solid ${COLORS.hairlineStrong}`, padding: "2px 6px", borderRadius: 1,
              fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.06em",
            }}>{k}</div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div className="hide-sm" style={{ textAlign: "right" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: COLORS.ivoryDim, textTransform: "lowercase" }}>
            {dateLabel}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", color: COLORS.gold, marginTop: 2 }}>
            {role.toUpperCase()} · TURNO AM
          </div>
        </div>
        <div className="hide-sm" style={{ width: 0.5, height: 36, background: COLORS.hairline }} />
        <Press style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `0.5px solid ${COLORS.hairlineStrong}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <Icon name="bell" size={14} color={COLORS.ivoryDim} />
          <div style={{
            position: "absolute", top: 7, right: 8,
            width: 5, height: 5, borderRadius: "50%", background: COLORS.gold,
          }} />
        </Press>
        <div ref={menuRef} style={{ position: "relative" }}>
          <Press
            onClick={() => setMenuOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", borderRadius: 2 }}
            hoverStyle={{ background: "rgba(240,232,208,0.04)" }}
          >
            <Avatar name={name} size={36} />
            <div className="hide-sm">
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: COLORS.ivory, fontWeight: 500 }}>{name}</div>
              <div style={{ fontFamily: SANS, fontSize: 9.5, color: COLORS.ivoryMute, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>
                {role}
              </div>
            </div>
            <Icon name="chev-d" size={10} color={COLORS.ivoryMute} />
          </Press>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 180,
              background: COLORS.blackElev, border: `0.5px solid ${COLORS.hairlineStrong}`,
              borderRadius: 2, overflow: "hidden", zIndex: 100,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${COLORS.hairline}` }}>
                <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.ivory, fontWeight: 500 }}>{name}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: COLORS.ivoryMute, letterSpacing: "0.14em", marginTop: 3 }}>
                  {session?.user?.email}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  width: "100%", padding: "11px 16px", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: SANS, fontSize: 12, color: COLORS.rose, letterSpacing: "0.04em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(217,154,138,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon name="logout" size={12} color={COLORS.rose} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
