import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"
import { syncReservationToCalendar, deleteReservationFromCalendar } from "../lib/googleCalendar.js"

const withSyncInclude = {
  guest: true,
  reservationRooms: { include: { room: { include: { roomType: true } } } },
  payments: true,
} as const

async function syncAndPersist(id: number) {
  try {
    const r = await prisma.reservation.findUnique({ where: { id }, include: withSyncInclude })
    if (!r) return
    const eventId = await syncReservationToCalendar(r)
    if (eventId && eventId !== r.googleEventId) {
      await prisma.reservation.update({ where: { id }, data: { googleEventId: eventId } })
    }
  } catch (err) {
    console.error("[googleCalendar] syncAndPersist error for reservation", id, err)
  }
}

const reservations = new Hono()
reservations.use("*", authMiddleware)

reservations.get("/", async (c) => {
  const status = c.req.query("status") || ""
  const where: any = {}
  if (status) where.status = status

  const list = await prisma.reservation.findMany({
    where,
    include: {
      guest: true,
      responsablePago: true,
      reservationRooms: { include: { room: { include: { roomType: true } } } },
      payments: true,
    },
    orderBy: { createdDate: "desc" },
  })
  return c.json(list)
})

reservations.get("/calendar", async (c) => {
  const month = Number(c.req.query("month")) || new Date().getMonth() + 1
  const year = Number(c.req.query("year")) || new Date().getFullYear()
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59)

  const list = await prisma.reservation.findMany({
    where: {
      checkInDate: { lt: end },
      checkOutDate: { gt: start },
      status: { notIn: ["Cancelada"] },
    },
    include: {
      guest: { select: { nombre: true, apellido: true } },
      reservationRooms: { include: { room: { include: { roomType: true } } } },
    },
    orderBy: { checkInDate: "asc" },
  })

  const flat = list.flatMap((r) =>
    r.reservationRooms.map((rr) => ({
      id: r.id,
      roomId: rr.roomId,
      roomNumero: rr.room.numero,
      roomType: rr.room.roomType.nombre,
      guestName: `${r.guest.nombre} ${r.guest.apellido}`,
      checkIn: r.checkInDate,
      checkOut: r.checkOutDate,
      status: r.status,
    }))
  )

  return c.json(flat)
})

reservations.get("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const r = await prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      responsablePago: true,
      reservationRooms: { include: { room: { include: { roomType: true } } } },
      payments: true,
    },
  })
  if (!r) return c.json({ error: "No encontrada" }, 404)
  return c.json(r)
})

reservations.post("/", async (c) => {
  const data = await c.req.json()
  const user = c.get("user")

  const roomIds = data.rooms?.map((r: any) => r.roomId) || []

  const overlapping = await prisma.reservationRoom.findMany({
    where: {
      roomId: { in: roomIds },
      reservation: {
        status: { not: "Cancelada" },
        checkInDate: { lt: new Date(data.checkOutDate) },
        checkOutDate: { gt: new Date(data.checkInDate) },
      },
    },
  })

  if (overlapping.length > 0) {
    return c.json({ error: "Una o más habitaciones no están disponibles en esas fechas" }, 409)
  }

  const reservation = await prisma.reservation.create({
    data: {
      guestId: data.guestId,
      userId: user.id,
      responsablePagoId: data.responsablePagoId || null,
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      checkInTime: data.checkInTime || "15:00",
      checkOutTime: data.checkOutTime || "12:00",
      numPersonas: data.numPersonas || 1,
      status: "Confirmada",
      totalAmount: data.totalAmount || 0,
      notas: data.notas || "",
      reservationRooms: {
        create: data.rooms?.map((r: any) => ({
          roomId: r.roomId,
          pricePerNight: r.pricePerNight,
          nights: r.nights,
        })) || [],
      },
    },
    include: withSyncInclude,
  })

  syncAndPersist(reservation.id)

  return c.json(reservation, 201)
})

reservations.put("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const data = await c.req.json()
  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      checkInDate: data.checkInDate ? new Date(data.checkInDate) : undefined,
      checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : undefined,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      numPersonas: data.numPersonas,
      status: data.status,
      totalAmount: data.totalAmount,
      notas: data.notas,
      responsablePagoId: data.responsablePagoId,
    },
    include: withSyncInclude,
  })

  syncAndPersist(reservation.id)

  return c.json(reservation)
})

reservations.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const existing = await prisma.reservation.findUnique({ where: { id }, select: { googleEventId: true } })
  await prisma.reservationRoom.deleteMany({ where: { reservationId: id } })
  await prisma.payment.deleteMany({ where: { reservationId: id } })
  await prisma.reservation.delete({ where: { id } })
  deleteReservationFromCalendar(existing?.googleEventId ?? null)
  return c.json({ success: true })
})

reservations.post("/:id/cancel", async (c) => {
  const id = Number(c.req.param("id"))
  const { motivo } = await c.req.json()
  const previous = await prisma.reservation.findUnique({ where: { id }, select: { googleEventId: true } })
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: "Cancelada", notas: `Cancelada: ${motivo || "Sin motivo"}`, googleEventId: null },
  })
  deleteReservationFromCalendar(previous?.googleEventId ?? null)
  return c.json(reservation)
})

reservations.post("/:id/checkin", async (c) => {
  const id = Number(c.req.param("id"))
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: "CheckIn" },
  })
  syncAndPersist(id)
  return c.json(reservation)
})

reservations.post("/:id/checkout", async (c) => {
  const id = Number(c.req.param("id"))
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: "CheckOut" },
  })
  syncAndPersist(id)
  return c.json(reservation)
})

export default reservations
