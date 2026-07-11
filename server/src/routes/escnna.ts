import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const escnna = new Hono()

escnna.get("/", authMiddleware, async (c) => {
  const list = await prisma.escnnaChecklist.findMany({ orderBy: { paso: "asc" } })
  return c.json(list)
})

escnna.get("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"))
  const item = await prisma.escnnaChecklist.findUnique({ where: { id } })
  if (!item) return c.json({ error: "No encontrado" }, 404)
  return c.json(item)
})

escnna.post("/", authMiddleware, async (c) => {
  const body = await c.req.json()
  const { paso, completado, data, reservationId, guestId } = body

  const existing = await prisma.escnnaChecklist.findFirst({ where: { paso } })

  if (existing) {
    const updated = await prisma.escnnaChecklist.update({
      where: { id: existing.id },
      data: {
        completado: completado ?? existing.completado,
        data: data ? JSON.stringify(data) : existing.data,
        reservationId: reservationId ?? existing.reservationId,
        guestId: guestId ?? existing.guestId,
      },
    })
    return c.json(updated)
  }

  const created = await prisma.escnnaChecklist.create({
    data: {
      paso,
      completado: completado ?? false,
      data: data ? JSON.stringify(data) : "{}",
      reservationId,
      guestId,
    },
  })
  return c.json(created, 201)
})

escnna.delete("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.escnnaChecklist.delete({ where: { id } })
  return c.body(null, 204)
})

export default escnna
