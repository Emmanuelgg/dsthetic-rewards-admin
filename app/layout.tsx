import type { Metadata } from "next"
import { Cormorant_Garamond, JetBrains_Mono, Jost } from "next/font/google"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
})

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Dsthetic · Admin Recompensas",
  description: "Panel de administración del programa de lealtad Dsthetic",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} ${jetbrains.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  )
}
