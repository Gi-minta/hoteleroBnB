import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const rooms = new Hono()
rooms.use("*", authMiddleware)

rooms.get("/types", async (c) => {
  const types = await prisma.roomType.findMany({ orderBy: { nombre: "asc" } })
  return c.json(types)
})

rooms.get("/", async (c) => {
  const status = c.req.query("status") || ""
  const where = status ? { estado: status } : {}
  const list = await prisma.room.findMany({
    where,
    include: { roomType: true },
    orderBy: { numero: "asc" },
  })
  return c.json(list)
})

rooms.get("/available", async (c) => {
  const checkIn = new Date(c.req.query("checkIn") || "")
  const checkOut = new Date(c.req.query("checkOut") || "")
  const roomTypeId = Number(c.req.query("roomTypeId")) || 0

  if (!checkIn || !checkOut) return c.json({ error: "checkIn y checkOut requeridos" }, 400)

  const overlapping = await prisma.reservationRoom.findMany({
    where: {
      reservation: {
        status: { not: "Cancelada" },
        checkInDate: { lt: checkOut },
        checkOutDate: { gt: checkIn },
      },
    },
    select: { roomId: true },
  })

  const occupiedIds = [...new Set(overlapping.map((r) => r.roomId))]
  const where: any = { estado: "Disponible", id: { notIn: occupiedIds } }
  if (roomTypeId > 0) where.roomTypeId = roomTypeId

  const available = await prisma.room.findMany({
    where,
    include: { roomType: true },
    orderBy: { numero: "asc" },
  })
  return c.json(available)
})

rooms.get("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const room = await prisma.room.findUnique({ where: { id }, include: { roomType: true } })
  if (!room) return c.json({ error: "No encontrada" }, 404)
  return c.json(room)
})

rooms.post("/", async (c) => {
  const data = await c.req.json()
  const room = await prisma.room.create({ data, include: { roomType: true } })
  return c.json(room, 201)
})

rooms.put("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const data = await c.req.json()
  const room = await prisma.room.update({ where: { id }, data, include: { roomType: true } })
  return c.json(room)
})

rooms.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.room.delete({ where: { id } })
  return c.json({ success: true })
})

export default rooms
