import "dotenv/config"
import prisma from "./lib/prisma.js"
import bcrypt from "bcryptjs"

// Sembrado del usuario administrador, idempotente y configurable por entorno.
// A diferencia de `seed.ts` (datos de demo), esto solo asegura el rol y el
// usuario admin, y SÍ actualiza la contraseña al re-ejecutarlo (útil para
// rotarla o para el primer arranque en producción).
//
// Variables:
//   ADMIN_USERNAME   (por defecto "admin")
//   ADMIN_EMAIL      (por defecto "admin@hotelero.com")
//   ADMIN_PASSWORD   (por defecto "admin123" — solo válido fuera de producción)
//   ALLOW_INSECURE_ADMIN=true  para permitir la contraseña por defecto en prod
const username = process.env.ADMIN_USERNAME || "admin"
const email = process.env.ADMIN_EMAIL || "admin@hotelero.com"
const password = process.env.ADMIN_PASSWORD || "admin123"

async function main() {
  const isProd = process.env.NODE_ENV === "production"
  const usingDefault = !process.env.ADMIN_PASSWORD || password === "admin123"
  if (isProd && usingDefault && process.env.ALLOW_INSECURE_ADMIN !== "true") {
    console.error(
      "[seed-admin] Rechazado: en producción debes definir ADMIN_PASSWORD con una " +
        "contraseña fuerte.\n" +
        '  Fly:    fly secrets set ADMIN_PASSWORD="..."\n' +
        "  Render: agrega ADMIN_PASSWORD en Environment del servicio.\n" +
        "  (Para forzar la contraseña por defecto, define ALLOW_INSECURE_ADMIN=true.)"
    )
    process.exit(1)
  }

  // Asegura el rol admin.
  const adminRole = await prisma.role.upsert({
    where: { nombre: "admin" },
    update: {},
    create: { nombre: "admin", descripcion: "Acceso total al panel de administración" },
  })

  // Crea el admin si no existe; si ya existe, actualiza contraseña/email/rol.
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.upsert({
    where: { username },
    update: { password: hashed, email, roleId: adminRole.id },
    create: { username, email, password: hashed, roleId: adminRole.id },
  })

  console.log(`[seed-admin] Admin listo: "${user.username}" (rol admin). Contraseña establecida.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
