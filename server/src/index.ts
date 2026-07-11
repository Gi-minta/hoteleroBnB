import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"
import auth from "./routes/auth.js"
import guests from "./routes/guests.js"
import rooms from "./routes/rooms.js"
import reservations from "./routes/reservations.js"
import responsables from "./routes/responsables.js"
import payments from "./routes/payments.js"
import dashboard from "./routes/dashboard.js"
import uploads from "./routes/uploads.js"
import escnna from "./routes/escnna.js"
import photos from "./routes/photos.js"
import landing from "./routes/landing.js"
import registros from "./routes/registros.js"

const app = new Hono()

app.get("/", (c) => c.json({
  nombre: "Hotelero API",
  version: "1.0.0",
  docs: "/scalar/v1",
  endpoints: ["/api/auth", "/api/guests", "/api/rooms", "/api/reservations", "/api/responsables", "/api/payments", "/api/dashboard", "/api/uploads", "/api/escnna", "/api/photos", "/api/landing", "/api/registros", "/api/health"],
}))

app.use("/api/*", cors({ origin: ["http://localhost:4200", "http://localhost:5173"], credentials: true }))

app.use("/uploads/*", serveStatic({ root: "./" }))

app.route("/api/auth", auth)
app.route("/api/guests", guests)
app.route("/api/rooms", rooms)
app.route("/api/reservations", reservations)
app.route("/api/responsables", responsables)
app.route("/api/payments", payments)
app.route("/api/dashboard", dashboard)
app.route("/api/uploads", uploads)
app.route("/api/escnna", escnna)
app.route("/api/photos", photos)
app.route("/api/landing", landing)
app.route("/api/registros", registros)

app.get("/api/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }))

const port = Number(process.env.PORT) || 3001
console.log(`Hotelero API running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
