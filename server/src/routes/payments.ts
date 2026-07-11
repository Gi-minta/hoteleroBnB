import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const payments = new Hono()
payments.use("*", authMiddleware)

payments.get("/", async (c) => {
  const reservationId = c.req.query("reservationId")
  const where = reservationId ? { reservationId: Number(reservationId) } : {}
  const list = await prisma.payment.findMany({
    where,
    include: { reservation: { include: { guest: true } } },
    orderBy: { paymentDate: "desc" },
  })
  return c.json(list)
})

payments.post("/", async (c) => {
  const data = await c.req.json()
  const payment = await prisma.payment.create({ data })
  return c.json(payment, 201)
})

payments.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.payment.delete({ where: { id } })
  return c.json({ success: true })
})

export default payments
