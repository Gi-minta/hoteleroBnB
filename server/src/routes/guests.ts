import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const guests = new Hono()
guests.use("*", authMiddleware)

guests.get("/", async (c) => {
  const search = c.req.query("search") || ""
  const where = search
    ? {
        OR: [
          { nombre: { contains: search } },
          { apellido: { contains: search } },
          { documento: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {}
  const list = await prisma.guest.findMany({ where, orderBy: { id: "desc" } })
  return c.json(list)
})

guests.get("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: { reservations: true },
  })
  if (!guest) return c.json({ error: "No encontrado" }, 404)
  return c.json(guest)
})

guests.post("/", async (c) => {
  const data = await c.req.json()
  const existing = await prisma.guest.findUnique({ where: { documento: data.documento } })
  if (existing) return c.json({ error: "Ya existe un huésped con ese documento" }, 409)
  const guest = await prisma.guest.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      tipoDocumento: data.tipoDocumento || "CC",
      documento: data.documento,
      email: data.email || "",
      telefono: data.telefono || "",
      profesion: data.profesion || "",
      nacionalidad: data.nacionalidad || "",
      fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
      direccion: data.direccion || "",
    },
  })
  return c.json(guest, 201)
})

guests.put("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const data = await c.req.json()
  const updateData: any = {}
  if (data.nombre !== undefined) updateData.nombre = data.nombre
  if (data.apellido !== undefined) updateData.apellido = data.apellido
  if (data.tipoDocumento !== undefined) updateData.tipoDocumento = data.tipoDocumento
  if (data.documento !== undefined) updateData.documento = data.documento
  if (data.email !== undefined) updateData.email = data.email
  if (data.telefono !== undefined) updateData.telefono = data.telefono
  if (data.profesion !== undefined) updateData.profesion = data.profesion
  if (data.nacionalidad !== undefined) updateData.nacionalidad = data.nacionalidad
  if (data.fechaNacimiento !== undefined) updateData.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento) : null
  if (data.direccion !== undefined) updateData.direccion = data.direccion
  const guest = await prisma.guest.update({ where: { id }, data: updateData })
  return c.json(guest)
})

guests.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.guest.delete({ where: { id } })
  return c.json({ success: true })
})

guests.get("/:id/reservations", async (c) => {
  const guestId = Number(c.req.param("id"))
  const reservations = await prisma.reservation.findMany({
    where: { guestId },
    include: {
      reservationRooms: { include: { room: { include: { roomType: true } } } },
      payments: true,
    },
    orderBy: { createdDate: "desc" },
  })
  return c.json(reservations)
})

export default guests
