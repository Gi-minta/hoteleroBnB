import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const photos = new Hono()
photos.use("*", authMiddleware)

photos.get("/room/:roomId", async (c) => {
  const roomId = Number(c.req.param("roomId"))
  const list = await prisma.roomPhoto.findMany({ where: { roomId }, orderBy: { orden: "asc" } })
  return c.json(list)
})

photos.post("/", async (c) => {
  const { roomId, url, caption, orden } = await c.req.json()
  const created = await prisma.roomPhoto.create({ data: { roomId, url, caption: caption || "", orden: orden || 0 } })
  return c.json(created, 201)
})

photos.put("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const data = await c.req.json()
  const updated = await prisma.roomPhoto.update({ where: { id }, data })
  return c.json(updated)
})

photos.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.roomPhoto.delete({ where: { id } })
  return c.body(null, 204)
})

export default photos
