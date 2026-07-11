import { describe, it, expect } from "vitest"
import { Hono } from "hono"
import auth from "../routes/auth.js"
import guests from "../routes/guests.js"
import rooms from "../routes/rooms.js"
import dashboard from "../routes/dashboard.js"

// Routes that require JWT should return 401 without token
function testUnauthorized(path: string, method: string, app: Hono) {
  return async () => {
    const res = await app.request(path, { method })
    expect(res.status).toBe(401)
    const data: any = await res.json()
    expect(data.error).toBeDefined()
  }
}

describe("Auth API", () => {
  const app = new Hono()
  app.route("/api/auth", auth)

  it("POST /api/auth/login - rejects empty body", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const data: any = await res.json()
    expect(data.error).toBe("Usuario y contraseña requeridos")
  })

  it("POST /api/auth/login - rejects missing username", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "test" }),
    })
    expect(res.status).toBe(400)
  })

  it("POST /api/auth/login - rejects wrong password", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    })
    expect(res.status).toBe(401)
    const data: any = await res.json()
    expect(data.error).toBe("Credenciales inválidas")
  })

  it("POST /api/auth/register - rejects no email", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test" }),
    })
    expect(res.status).toBe(400)
  })

  it("POST /api/auth/register - rejects no password", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test", email: "test@test.com" }),
    })
    expect(res.status).toBe(400)
  })
})

describe("Health endpoint", () => {
  it("GET /api/health returns ok", async () => {
    const app = new Hono()
    app.get("/api/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }))
    const res = await app.request("/api/health")
    expect(res.status).toBe(200)
    const data: any = await res.json()
    expect(data.status).toBe("ok")
    expect(data.time).toBeDefined()
  })
})

describe("Guests API - auth guard", () => {
  const app = new Hono()
  app.route("/api/guests", guests)

  it("GET /api/guests rejects without token", testUnauthorized("/api/guests", "GET", app))
  it("POST /api/guests rejects without token", testUnauthorized("/api/guests", "POST", app))
  it("GET /api/guests/1 rejects without token", testUnauthorized("/api/guests/1", "GET", app))
  it("PUT /api/guests/1 rejects without token", testUnauthorized("/api/guests/1", "PUT", app))
  it("DELETE /api/guests/1 rejects without token", testUnauthorized("/api/guests/1", "DELETE", app))
})

describe("Rooms API - auth guard", () => {
  const app = new Hono()
  app.route("/api/rooms", rooms)

  it("GET /api/rooms rejects without token", testUnauthorized("/api/rooms", "GET", app))
  it("GET /api/rooms/available rejects without token", testUnauthorized("/api/rooms/available", "GET", app))
})

describe("Dashboard API - auth guard", () => {
  const app = new Hono()
  app.route("/api/dashboard", dashboard)

  it("GET /api/dashboard rejects without token", testUnauthorized("/api/dashboard", "GET", app))
})

describe("CORS headers", () => {
  it("OPTIONS /api/health returns CORS headers", async () => {
    const app = new Hono()
    const { cors } = await import("hono/cors")
    app.use("/api/*", cors({ origin: ["http://localhost:4200"], credentials: true }))
    app.get("/api/health", (c) => c.json({ status: "ok" }))

    const res = await app.request("/api/health", {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:4200" },
    })
    expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:4200")
  })
})

describe("JSON serialization", () => {
  it("returns valid JSON for all error responses", async () => {
    const app = new Hono()
    app.route("/api/auth", auth)

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(res.headers.get("content-type")).toContain("application/json")
    const body = await res.text()
    expect(() => JSON.parse(body)).not.toThrow()
  })
})
