import "dotenv/config"
import prisma from "./lib/prisma.js"
import bcrypt from "bcryptjs"

async function seed() {
  console.log("Seeding database...")

  const roles = [
    { nombre: "admin", descripcion: "Acceso total al panel de administración" },
    { nombre: "recepcionista", descripcion: "Gestión de reservas, huéspedes y check-in/check-out" },
  ]
  for (const r of roles) {
    await prisma.role.upsert({ where: { nombre: r.nombre }, update: {}, create: r })
  }
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { nombre: "admin" } })

  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", email: "admin@hotelero.com", password: adminPassword, roleId: adminRole.id },
  })

  const configuracion = [
    { clave: "hotelName", valor: "B&B Medellín" },
    { clave: "checkInDefaultTime", valor: "15:00" },
    { clave: "checkOutDefaultTime", valor: "12:00" },
    { clave: "googleSyncEnabled", valor: "false" },
  ]
  for (const cfg of configuracion) {
    await prisma.configuracion.upsert({ where: { clave: cfg.clave }, update: {}, create: cfg })
  }

  const roomTypes = [
    { nombre: "Ejecutiva", descripcion: "Habitación ejecutiva para viajeros de negocios", precioBase: 120000, capacidadMaxima: 2 },
    { nombre: "Familiar", descripcion: "Habitación amplia para familias", precioBase: 180000, capacidadMaxima: 4 },
    { nombre: "Suite", descripcion: "Suite de lujo con sala independiente", precioBase: 250000, capacidadMaxima: 3 },
  ]

  for (const rt of roomTypes) {
    await prisma.roomType.upsert({ where: { nombre: rt.nombre }, update: {}, create: rt })
  }

  const types = await prisma.roomType.findMany()
  const rooms = [
    { numero: "101", roomTypeId: types[0].id, piso: 1 },
    { numero: "102", roomTypeId: types[0].id, piso: 1 },
    { numero: "103", roomTypeId: types[1].id, piso: 1 },
    { numero: "201", roomTypeId: types[1].id, piso: 2 },
    { numero: "202", roomTypeId: types[2].id, piso: 2 },
    { numero: "203", roomTypeId: types[0].id, piso: 2 },
    { numero: "301", roomTypeId: types[2].id, piso: 3 },
    { numero: "302", roomTypeId: types[1].id, piso: 3 },
  ]

  for (const room of rooms) {
    const exists = await prisma.room.findFirst({ where: { numero: room.numero } })
    if (!exists) await prisma.room.create({ data: room })
  }

  console.log("Seed completed!")
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
