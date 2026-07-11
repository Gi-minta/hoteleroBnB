import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

const registros = new Hono()

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"])

// ── Subida pública de documentos (fotos de identidad, permisos de menores) ──
// Es público porque lo usa el formulario de registro de la landing (sin sesión).
// Se limita el tamaño y la extensión para acotar el abuso.
registros.post("/upload", async (c) => {
  const body = await c.req.parseBody()
  const file = body.file as File | undefined
  if (!file) return c.json({ error: "No se envió ningún archivo" }, 400)
  if (file.size > MAX_UPLOAD_BYTES) return c.json({ error: "El archivo supera el máximo de 8 MB" }, 413)

  const ext = (file.name.split(".").pop() || "bin").toLowerCase()
  if (!ALLOWED_EXT.has(ext)) return c.json({ error: "Tipo de archivo no permitido (usa imágenes o PDF)" }, 415)

  const filename = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), "uploads", "registros")
  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return c.json({ url: `/uploads/registros/${filename}` }, 201)
})

// ── Crear registro de huésped (público, desde la landing) ──
registros.post("/", async (c) => {
  const b = await c.req.json()

  if (!b.nombres || !b.apellidos || !b.numeroDocumento || !b.email || !b.telefono) {
    return c.json({ error: "Nombres, apellidos, documento, correo y teléfono son requeridos" }, 400)
  }
  if (!b.aceptaReglamento || !b.aceptaEscnna || !b.aceptaContrato) {
    return c.json({ error: "Debes aceptar el reglamento, la política ESCNNA y el contrato" }, 400)
  }
  if (!b.firmaUrl) {
    return c.json({ error: "La firma es requerida" }, 400)
  }

  const acompanantes = Array.isArray(b.acompanantes) ? b.acompanantes : []
  const documentosIdentidad = Array.isArray(b.documentosIdentidad) ? b.documentosIdentidad : []

  const created = await prisma.registroHuesped.create({
    data: {
      numeroReserva: b.numeroReserva || "",
      numeroHabitacion: b.numeroHabitacion || "",
      fechaLlegada: b.fechaLlegada ? new Date(b.fechaLlegada) : null,
      fechaSalida: b.fechaSalida ? new Date(b.fechaSalida) : null,
      nombres: b.nombres,
      apellidos: b.apellidos,
      tipoDocumento: b.tipoDocumento || "CC",
      numeroDocumento: b.numeroDocumento,
      fechaNacimiento: b.fechaNacimiento ? new Date(b.fechaNacimiento) : null,
      email: b.email,
      telefono: b.telefono,
      profesion: b.profesion || "",
      origen: b.origen || "",
      numeroPersonas: Number(b.numeroPersonas) || (1 + acompanantes.length),
      acompanantes: JSON.stringify(acompanantes),
      documentosIdentidad: JSON.stringify(documentosIdentidad),
      autorizaInfo: !!b.autorizaInfo,
      aceptaReglamento: !!b.aceptaReglamento,
      aceptaEscnna: !!b.aceptaEscnna,
      aceptaContrato: !!b.aceptaContrato,
      firmaUrl: b.firmaUrl || "",
    },
  })

  return c.json(created, 201)
})

// ── Gestión admin (requiere sesión) ──
registros.get("/", authMiddleware, async (c) => {
  const estado = c.req.query("estado")
  const where = estado ? { estado } : {}
  const list = await prisma.registroHuesped.findMany({ where, orderBy: { createdAt: "desc" } })
  return c.json(list)
})

registros.get("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"))
  const r = await prisma.registroHuesped.findUnique({ where: { id } })
  if (!r) return c.json({ error: "No encontrado" }, 404)
  return c.json(r)
})

registros.patch("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"))
  const { estado } = await c.req.json()
  const valid = ["Pendiente", "Revisado", "Aprobado", "Rechazado"]
  if (!valid.includes(estado)) return c.json({ error: "Estado inválido" }, 400)
  const updated = await prisma.registroHuesped.update({ where: { id }, data: { estado } })
  return c.json(updated)
})

registros.delete("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.registroHuesped.delete({ where: { id } })
  return c.body(null, 204)
})

export default registros
