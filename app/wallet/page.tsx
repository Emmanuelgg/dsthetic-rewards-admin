"use client"

/**
 * Public wallet page — no auth required (no NextAuth).
 * Members authenticate via email OTP and receive Apple/Google Wallet links.
 * Route is excluded from the admin middleware matcher via proxy.ts.
 */
import { useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://rewards.dsthetic.mx/api/v1"

type Step = "email" | "otp" | "links"

interface WalletCard {
  code: string
  first_name: string
  last_name: string
  tier_label: string
  smiles_balance: number
}

interface WalletLinks {
  apple_url: string | null
  google_url: string | null
}

export default function WalletPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [token, setToken] = useState("")
  const [card, setCard] = useState<WalletCard | null>(null)
  const [links, setLinks] = useState<WalletLinks | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API}/members/auth/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.detail ?? "Error al enviar el código")
      }
      setStep("otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API}/members/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: otp.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.detail ?? "Código incorrecto")
      }
      const { access_token } = await res.json()
      setToken(access_token)

      // Fetch card + wallet links in parallel
      const [cardRes, linksRes] = await Promise.all([
        fetch(`${API}/me/card`, { headers: { Authorization: `Bearer ${access_token}` } }),
        fetch(`${API}/wallet/links`, { headers: { Authorization: `Bearer ${access_token}` } }),
      ])

      if (!cardRes.ok || !linksRes.ok) {
        throw new Error("Error al obtener la tarjeta")
      }

      setCard(await cardRes.json())
      setLinks(await linksRes.json())
      setStep("links")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        backgroundColor: "#0A0A0A",
        color: "#F0E8D0",
        fontFamily: "var(--font-jost), ui-sans-serif, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      {/* Wordmark */}
      <header style={{ marginBottom: 40, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: 28,
            letterSpacing: "0.42em",
            color: "#F0E8D0",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          DSTHETIC
        </p>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "#C9A84C",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Membership
        </p>
      </header>

      {/* Card container */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#111110",
          border: "1px solid rgba(240,232,208,0.10)",
          borderRadius: 10,
          padding: 32,
        }}
      >
        {step === "email" && (
          <>
            <Title>Agrega tu tarjeta al Wallet</Title>
            <Subtitle>
              Ingresa tu correo para recibir un código y agregar tu tarjeta de membresía
              directamente a Apple Wallet o Google Wallet.
            </Subtitle>
            <form onSubmit={sendOtp} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(v) => setEmail(v)}
                required
              />
              {error && <ErrMsg>{error}</ErrMsg>}
              <Btn type="submit" loading={loading}>
                Enviar código
              </Btn>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <Title>Revisa tu correo</Title>
            <Subtitle>
              Enviamos un código de 6 dígitos a <strong style={{ color: "#C9A84C" }}>{email}</strong>.
            </Subtitle>
            <form onSubmit={verifyOtp} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChange={(v) => setOtp(v)}
                maxLength={6}
                style={{ letterSpacing: "0.5em", textAlign: "center", fontSize: 22 }}
                required
              />
              {error && <ErrMsg>{error}</ErrMsg>}
              <Btn type="submit" loading={loading}>
                Verificar
              </Btn>
              <button
                type="button"
                onClick={() => { setStep("email"); setError("") }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(240,232,208,0.45)",
                  fontSize: 12,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  marginTop: 4,
                }}
              >
                ← Cambiar correo
              </button>
            </form>
          </>
        )}

        {step === "links" && card && links && (
          <>
            {/* Member info */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.28em", color: "#C9A84C", textTransform: "uppercase", margin: 0 }}>
                Miembro {card.tier_label.toLowerCase()}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: 26,
                  fontStyle: "italic",
                  color: "#F0E8D0",
                  margin: "10px 0 4px",
                }}
              >
                {card.first_name} {card.last_name}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 11,
                  color: "#C9A84C",
                  letterSpacing: "0.12em",
                }}
              >
                {card.code}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 28,
                  marginTop: 16,
                  padding: "16px 0",
                  borderTop: "1px solid rgba(201,168,76,0.18)",
                  borderBottom: "1px solid rgba(201,168,76,0.18)",
                }}
              >
                <Stat label="Sonrisas" value={String(card.smiles_balance)} />
                <Stat label="Nivel" value={card.tier_label} />
              </div>
            </div>

            {/* Wallet buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {links.apple_url ? (
                <a href={links.apple_url} style={{ display: "block", textDecoration: "none" }}>
                  <WalletBtn label="Agregar a Apple Wallet" logo="apple" />
                </a>
              ) : (
                <WalletBtnDisabled label="Apple Wallet no disponible" />
              )}

              {links.google_url ? (
                <a
                  href={links.google_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <WalletBtn label="Agregar a Google Wallet" logo="google" />
                </a>
              ) : (
                <WalletBtnDisabled label="Google Wallet no disponible" />
              )}
            </div>

            <p
              style={{
                marginTop: 24,
                fontSize: 11,
                color: "rgba(240,232,208,0.35)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Tu tarjeta se actualiza automáticamente con tu saldo de sonrisas.
            </p>
          </>
        )}
      </div>

      <p style={{ marginTop: 32, fontSize: 11, color: "rgba(240,232,208,0.25)", letterSpacing: "0.06em" }}>
        © Dsthetic — Programa de membresía
      </p>
    </main>
  )
}

// ─────────────────────────── Sub-components ──────────────────────────────────

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: "var(--font-cormorant), serif",
        fontSize: 24,
        fontWeight: 400,
        color: "#F0E8D0",
        margin: "0 0 10px",
      }}
    >
      {children}
    </h1>
  )
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: "rgba(240,232,208,0.55)", lineHeight: 1.65, margin: 0 }}>
      {children}
    </p>
  )
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: "#d99a8a", margin: 0 }}>{children}</p>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.24em", color: "rgba(240,232,208,0.45)", textTransform: "uppercase", margin: "0 0 4px" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: 22,
          color: "#F0E8D0",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  )
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (v: string) => void
}
function Input({ onChange, style, ...props }: InputProps) {
  return (
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 14px",
        backgroundColor: "#0A0A0A",
        border: "1px solid rgba(240,232,208,0.16)",
        borderRadius: 6,
        color: "#F0E8D0",
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  )
}

function Btn({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        width: "100%",
        padding: "13px",
        backgroundColor: "#C9A84C",
        color: "#0A0A0A",
        border: "none",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.65 : 1,
        fontFamily: "var(--font-jost), sans-serif",
      }}
    >
      {loading ? "Cargando…" : children}
    </button>
  )
}

function WalletBtn({ label, logo }: { label: string; logo: "apple" | "google" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "14px",
        backgroundColor: logo === "apple" ? "#F0E8D0" : "#0A0A0A",
        border: logo === "google" ? "1px solid rgba(240,232,208,0.22)" : "none",
        borderRadius: 8,
        color: logo === "apple" ? "#0A0A0A" : "#F0E8D0",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "var(--font-jost), sans-serif",
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
    >
      {logo === "apple" && (
        <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-28.4-149.6-90.6c-51.3-73.3-96.7-188.6-96.7-298.5 0-191.7 125.6-292.8 248.9-292.8 66.9 0 122.5 44 164.5 44 40.4 0 103.2-46.4 175.5-46.4z"/>
          <path d="M549.8 64.7c28.4-35.2 48.8-84.7 48.8-134.2 0-6.5-.6-13-.6-19.5-46.4 1.9-101.4 31.2-134.8 69.7-30.5 35.2-55.3 84.7-55.3 136.8 0 7.2.6 14.5 1.3 21.7 3.2.6 8.5 1.3 13.8 1.3 41.6 0 94.9-28.5 127-75.8z"/>
        </svg>
      )}
      {logo === "google" && (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {label}
    </div>
  )
}

function WalletBtnDisabled({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "14px",
        border: "1px solid rgba(240,232,208,0.08)",
        borderRadius: 8,
        color: "rgba(240,232,208,0.25)",
        fontSize: 13,
        textAlign: "center",
        fontFamily: "var(--font-jost), sans-serif",
      }}
    >
      {label}
    </div>
  )
}
