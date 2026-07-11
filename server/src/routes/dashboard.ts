import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const dashboard = new Hono()
dashboard.use("*", authMiddleware)

dashboard.get("/", async (c) => {
  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    totalReservations,
    activeReservations,
    totalGuests,
    totalRooms,
    availableRooms,
    recentReservations,
    revenue,
    roomsByStatus,
    upcomingCheckIns,
    upcomingCheckOuts,
    pendingPreRegistros,
    paymentsLast6Months,
  ] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: { in: ["Confirmada", "CheckIn"] } } }),
    prisma.guest.count(),
    prisma.room.count(),
    prisma.room.count({ where: { estado: "Disponible" } }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdDate: "desc" },
      include: { guest: true, reservationRooms: { include: { room: true } } },
    }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.room.groupBy({ by: ["estado"], _count: { estado: true } }),
    prisma.reservation.findMany({
      where: { checkInDate: { gte: now, lte: in7days }, status: { in: ["Confirmada", "Pendiente"] } },
      orderBy: { checkInDate: "asc" },
      include: { guest: true },
      take: 8,
    }),
    prisma.reservation.findMany({
      where: { checkOutDate: { gte: now, lte: in7days }, status: { in: ["Confirmada", "CheckIn"] } },
      orderBy: { checkOutDate: "asc" },
      include: { guest: true },
      take: 8,
    }),
    prisma.preRegistro.count({ where: { estado: "Pendiente" } }),
    prisma.payment.findMany({
      where: { paymentDate: { gte: sixMonthsAgo } },
      select: { amount: true, paymentDate: true },
    }),
  ])

  // Agrupar ingresos por mes (últimos 6 meses, incluyendo meses en cero)
  const monthLabels: { key: string; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthLabels.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }),
    })
  }
  const revenueByMonth = monthLabels.map(({ key, label }) => {
    const total = paymentsLast6Months
      .filter((p) => {
        const d = new Date(p.paymentDate)
        return `${d.getFullYear()}-${d.getMonth()}` === key
      })
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: label, total }
  })

  return c.json({
    totalReservations,
    activeReservations,
    totalGuests,
    totalRooms,
    availableRooms,
    recentReservations,
    revenue: revenue._sum.amount || 0,
    roomsByStatus: roomsByStatus.map((r) => ({ estado: r.estado, count: r._count.estado })),
    upcomingCheckIns,
    upcomingCheckOuts,
    pendingPreRegistros,
    revenueByMonth,
  })
})

export default dashboard
