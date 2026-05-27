"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { COLORS, MONO, SANS, SERIF } from "@/lib/theme/tokens"
import { Btn, Display, Eyebrow, GoldHair, Wordmark } from "@/components/ui"

const schema = yup.object({
  email:    yup.string().email("Email inválido").required("Requerido"),
  password: yup.string().min(1, "Requerido").required("Requerido"),
})

type FormData = yup.InferType<typeof schema>

export default function LoginPage() {
  const router  = useRouter()
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError("")
    const res = await signIn("credentials", { ...data, redirect: false })
    if (res?.error) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.")
    } else {
      router.push("/escanear")
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      {/* background grain */}
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.03) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: 400, position: "relative", zIndex: 1 }}>
        {/* brand */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, color: COLORS.gold, lineHeight: 1, marginBottom: 16 }}>D</div>
          <Wordmark size={15} sub="Admin · Recompensas" />
        </div>

        <GoldHair width={40} my={32} opacity={0.5} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{
            background: COLORS.blackPanel,
            border: `0.5px solid ${COLORS.hairlineStrong}`,
            borderRadius: 2, padding: 32,
          }}>
            <Eyebrow size={9} style={{ marginBottom: 28, textAlign: "center" }}>Acceso Staff</Eyebrow>

            <div style={{ marginBottom: 20 }}>
              <Eyebrow size={8.5} style={{ marginBottom: 10 }}>Email</Eyebrow>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@dsthetic.mx"
                style={{
                  width: "100%", padding: "12px 14px",
                  background: COLORS.blackElev,
                  border: `0.5px solid ${errors.email ? COLORS.rose : COLORS.hairline}`,
                  color: COLORS.ivory, fontFamily: SANS, fontSize: 13, borderRadius: 1,
                  boxSizing: "border-box",
                }}
              />
              {errors.email && (
                <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.rose, marginTop: 6 }}>
                  {errors.email.message}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <Eyebrow size={8.5} style={{ marginBottom: 10 }}>Contraseña</Eyebrow>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 14px",
                  background: COLORS.blackElev,
                  border: `0.5px solid ${errors.password ? COLORS.rose : COLORS.hairline}`,
                  color: COLORS.ivory, fontFamily: SANS, fontSize: 13, borderRadius: 1,
                  boxSizing: "border-box",
                }}
              />
              {errors.password && (
                <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.rose, marginTop: 6 }}>
                  {errors.password.message}
                </div>
              )}
            </div>

            {error && (
              <div style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 13,
                color: COLORS.rose, marginBottom: 20, textAlign: "center",
              }}>{error}</div>
            )}

            <Btn type="submit" variant="gold" size="lg" disabled={isSubmitting}
              style={{ width: "100%", justifyContent: "center" }}>
              {isSubmitting ? "Verificando…" : "Ingresar"}
            </Btn>
          </div>
        </form>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: COLORS.ivoryMute, letterSpacing: "0.18em" }}>
            DSTHETIC · SISTEMA DE RECOMPENSAS · V1
          </div>
        </div>
      </div>
    </div>
  )
}
