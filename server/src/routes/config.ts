import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const config = new Hono()

config.get("/", async (c) => {
  const items = await prisma.configuracion.findMany({ orderBy: { clave: "asc" } })
  return c.json(items)
})

config.use("/admin/*", authMiddleware)

config.put("/admin/:clave", async (c) => {
  const clave = c.req.param("clave")
  const { valor } = await c.req.json()
  if (valor === undefined) return c.json({ error: "valor requerido" }, 400)

  const item = await prisma.configuracion.upsert({
    where: { clave },
    update: { valor: String(valor) },
    create: { clave, valor: String(valor) },
  })
  return c.json(item)
})

export default config
