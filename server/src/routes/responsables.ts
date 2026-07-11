import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const responsables = new Hono()
responsables.use("*", authMiddleware)

responsables.get("/", async (c) => {
  const search = c.req.query("search") || ""
  const where = search
    ? { OR: [{ razonSocial: { contains: search } }, { cuit: { contains: search } }] }
    : {}
  const list = await prisma.responsablePago.findMany({
    where,
    orderBy: { razonSocial: "asc" },
  })
  return c.json(list)
})

responsables.get("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const r = await prisma.responsablePago.findUnique({
    where: { id },
    include: { reservations: true },
  })
  if (!r) return c.json({ error: "No encontrado" }, 404)
  return c.json(r)
})

responsables.post("/", async (c) => {
  const data = await c.req.json()
  const existing = await prisma.responsablePago.findUnique({ where: { cuit: data.cuit } })
  if (existing) return c.json({ error: "Ya existe un responsable con ese CUIT" }, 409)

  const r = await prisma.responsablePago.create({ data })
  return c.json(r, 201)
})

responsables.put("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const data = await c.req.json()

  const duplicado = await prisma.responsablePago.findUnique({ where: { cuit: data.cuit } })
  if (duplicado && duplicado.id !== id) {
    return c.json({ error: "El CUIT ya pertenece a otro responsable" }, 409)
  }

  const r = await prisma.responsablePago.update({ where: { id }, data })
  return c.json(r)
})

responsables.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.responsablePago.delete({ where: { id } })
  return c.json({ success: true })
})

export default responsables
