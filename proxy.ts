import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn   = !!req.auth
  const isLoginPage  = req.nextUrl.pathname === "/login"
  const isPublicPath = req.nextUrl.pathname.startsWith("/api/auth")

  if (isPublicPath) return NextResponse.next()
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/escanear", req.nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
