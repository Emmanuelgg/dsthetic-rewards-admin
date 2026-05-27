import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Providers from "@/app/providers"
import { AdminShell } from "@/components/layout/AdminShell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  )
}
