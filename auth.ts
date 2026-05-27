import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  } catch {
    return {}
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  basePath: "/auth",
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const res = await fetch(
            `${process.env.API_URL_INTERNAL}/auth/login`,
            {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ email: credentials.email, password: credentials.password }),
            }
          )
          if (!res.ok) return null
          const data = await res.json()
          const payload = decodeJwtPayload(data.access_token)
          return {
            id:          String(payload.sub ?? credentials.email),
            email:       String(payload.sub ?? credentials.email),
            role:        String(payload.role ?? "reception"),
            accessToken: data.access_token,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken: string }).accessToken
        token.role        = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.accessToken = token.accessToken
      session.role        = token.role
      return session
    },
  },
  pages:   { signIn: "/login" },
  session: { strategy: "jwt" },
})
