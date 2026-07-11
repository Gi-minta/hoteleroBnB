import type { Context, Next } from "hono"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "hotelero-secret-key-2026"

export interface JwtPayload {
  id: number
  username: string
  role: string
}

declare module "hono" {
  interface ContextVariableMap {
    user: JwtPayload
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Token requerido" }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    c.set("user", payload)
    await next()
  } catch {
    return c.json({ error: "Token inválido o expirado" }, 401)
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}
