import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AjustesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.role !== "admin") redirect("/dashboard")
  return <>{children}</>
}
