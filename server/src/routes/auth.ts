import { Hono } from "hono"
import bcrypt from "bcryptjs"
import prisma from "../lib/prisma.js"
import { signToken, authMiddleware } from "../middleware/auth.js"

const auth = new Hono()

auth.post("/login", async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) {
    return c.json({ error: "Usuario y contraseña requeridos" }, 400)
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return c.json({ error: "Credenciales inválidas" }, 401)
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return c.json({ error: "Credenciales inválidas" }, 401)
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role })
  return c.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  })
})

auth.get("/users", async (c) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  return c.json(users)
})

auth.delete("/users/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.user.delete({ where: { id } })
  return c.body(null, 204)
})

auth.put("/password", authMiddleware, async (c) => {
  const { currentPassword, newPassword } = await c.req.json()
  const { id } = c.var.user

  if (!currentPassword || !newPassword) {
    return c.json({ error: "Contraseña actual y nueva requeridas" }, 400)
  }
  if (newPassword.length < 6) {
    return c.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, 400)
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return c.json({ error: "Usuario no encontrado" }, 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return c.json({ error: "Contraseña actual incorrecta" }, 401)

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id }, data: { password: hashed } })

  return c.json({ success: true })
})

auth.put("/username", authMiddleware, async (c) => {
  const { newUsername } = await c.req.json()
  const { id } = c.var.user

  if (!newUsername || newUsername.length < 3) {
    return c.json({ error: "El usuario debe tener al menos 3 caracteres" }, 400)
  }

  const existing = await prisma.user.findUnique({ where: { username: newUsername } })
  if (existing && existing.id !== id) {
    return c.json({ error: "El nombre de usuario ya está en uso" }, 409)
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { username: newUsername },
    select: { id: true, username: true, email: true, role: true },
  })

  return c.json(updated)
})

auth.post("/register", async (c) => {
  const { username, email, password } = await c.req.json()
  if (!username || !email || !password) {
    return c.json({ error: "Todos los campos son requeridos" }, 400)
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  })
  if (existing) {
    return c.json({ error: "Usuario o email ya existe" }, 409)
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  })

  const token = signToken({ id: user.id, username: user.username, role: user.role })
  return c.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  }, 201)
})

export default auth
