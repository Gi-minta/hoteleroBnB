import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const landing = new Hono()

landing.get("/content", async (c) => {
  const items = await prisma.landingContent.findMany({ orderBy: [{ section: "asc" }, { key: "asc" }] })
  return c.json(items)
})

landing.get("/gallery", async (c) => {
  const items = await prisma.landingGallery.findMany({ where: { active: true }, orderBy: { orden: "asc" } })
  return c.json(items)
})

landing.get("/rooms-gallery", async (c) => {
  const rooms = await prisma.room.findMany({
    include: {
      roomType: true,
      photos: { orderBy: { orden: "asc" } },
    },
    orderBy: { numero: "asc" },
  })
  return c.json(rooms)
})

// ── Pre-registro público (formulario de la landing, sin WhatsApp) ──
landing.post("/pre-registro", async (c) => {
  const body = await c.req.json()
  const { nombre, apellido, email, telefono, checkInDate, checkOutDate, personas, mensaje } = body

  if (!nombre || !email || !telefono) {
    return c.json({ error: "Nombre, email y teléfono son requeridos" }, 400)
  }

  const created = await prisma.preRegistro.create({
    data: {
      nombre,
      apellido: apellido || "",
      email,
      telefono,
      checkInDate: checkInDate ? new Date(checkInDate) : null,
      checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
      personas: Number(personas) || 1,
      mensaje: mensaje || "",
      origen: "Web",
    },
  })

  return c.json(created, 201)
})

landing.use("/admin/*", authMiddleware)

// ── Gestión admin de pre-registros ──
landing.get("/admin/pre-registros", async (c) => {
  const estado = c.req.query("estado")
  const where = estado ? { estado } : {}
  const items = await prisma.preRegistro.findMany({ where, orderBy: { createdAt: "desc" } })
  return c.json(items)
})

landing.patch("/admin/pre-registros/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const { estado } = await c.req.json()
  const valid = ["Pendiente", "Contactado", "Convertido", "Descartado"]
  if (!valid.includes(estado)) {
    return c.json({ error: "Estado inválido" }, 400)
  }
  const updated = await prisma.preRegistro.update({ where: { id }, data: { estado } })
  return c.json(updated)
})

landing.delete("/admin/pre-registros/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.preRegistro.delete({ where: { id } })
  return c.body(null, 204)
})

landing.post("/admin/content", async (c) => {
  const { section, key, value } = await c.req.json()
  const item = await prisma.landingContent.upsert({
    where: { section_key: { section, key } },
    update: { value },
    create: { section, key, value },
  })
  return c.json(item, 201)
})

landing.put("/admin/content/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const { value } = await c.req.json()
  const updated = await prisma.landingContent.update({ where: { id }, data: { value } })
  return c.json(updated)
})

landing.get("/admin/content", async (c) => {
  const items = await prisma.landingContent.findMany({ orderBy: [{ section: "asc" }, { key: "asc" }] })
  return c.json(items)
})

landing.post("/admin/gallery", async (c) => {
  const { url, caption, orden } = await c.req.json()
  const created = await prisma.landingGallery.create({ data: { url, caption: caption || "", orden: orden || 0 } })
  return c.json(created, 201)
})

landing.delete("/admin/gallery/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.landingGallery.update({ where: { id }, data: { active: false } })
  return c.body(null, 204)
})

landing.put("/admin/gallery/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const data = await c.req.json()
  const updated = await prisma.landingGallery.update({ where: { id }, data })
  return c.json(updated)
})

export default landing
