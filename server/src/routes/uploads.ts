import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth.js"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

const uploads = new Hono()
uploads.use("*", authMiddleware)

uploads.post("/", async (c) => {
  const body = await c.req.parseBody()
  const file = body.file as File | undefined
  if (!file) return c.json({ error: "No se envió ningún archivo" }, 400)

  const ext = file.name.split(".").pop() || "bin"
  const filename = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), "uploads")
  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return c.json({ filename, url: `/uploads/${filename}` }, 201)
})

export default uploads
