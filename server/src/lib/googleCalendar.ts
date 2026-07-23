import { google } from "googleapis"
import prisma from "./prisma.js"

interface ReservationForSync {
  id: number
  checkInDate: Date
  checkOutDate: Date
  checkInTime: string
  checkOutTime: string
  numPersonas: number
  status: string
  notas: string
  googleEventId: string | null
  guest: { nombre: string; apellido: string; telefono: string }
  reservationRooms: { room: { numero: string } }[]
}

const STATUS_COLOR_ID: Record<string, string> = {
  Pendiente: "5", // Banana (amarillo)
  Confirmada: "2", // Sage (verde)
  CheckIn: "9", // Blueberry (azul)
  CheckOut: "8", // Graphite (gris)
  Cancelada: "11", // Tomato (rojo)
}

let warnedMissingCreds = false

function getCredentials() {
  const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!clientEmail || !privateKey || !calendarId) return null
  return { clientEmail, privateKey, calendarId }
}

function getCalendarClient() {
  const creds = getCredentials()
  if (!creds) {
    if (!warnedMissingCreds) {
      console.warn("[googleCalendar] Credenciales no configuradas (GOOGLE_CALENDAR_CLIENT_EMAIL / GOOGLE_CALENDAR_PRIVATE_KEY / GOOGLE_CALENDAR_ID) — sincronización deshabilitada")
      warnedMissingCreds = true
    }
    return null
  }
  const auth = new google.auth.JWT({
    email: creds.clientEmail,
    key: creds.privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  })
  return { calendar: google.calendar({ version: "v3", auth }), calendarId: creds.calendarId }
}

async function isSyncEnabled(): Promise<boolean> {
  const flag = await prisma.configuracion.findUnique({ where: { clave: "googleSyncEnabled" } })
  return flag?.valor === "true"
}

function combineDateTime(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

function buildEventPayload(r: ReservationForSync) {
  const roomNumbers = r.reservationRooms.map((rr) => rr.room.numero).join(", ")
  const summary = `Habitación ${roomNumbers} - ${r.guest.nombre} ${r.guest.apellido}`
  const description = [
    `Cliente: ${r.guest.nombre} ${r.guest.apellido}`,
    `Habitación: ${roomNumbers}`,
    `Teléfono: ${r.guest.telefono}`,
    `Huéspedes: ${r.numPersonas}`,
    `Estado: ${r.status}`,
    r.notas ? `Observaciones: ${r.notas}` : null,
  ].filter(Boolean).join("\n")

  const start = combineDateTime(r.checkInDate, r.checkInTime)
  const end = combineDateTime(r.checkOutDate, r.checkOutTime)

  return {
    summary,
    description,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    colorId: STATUS_COLOR_ID[r.status] || undefined,
  }
}

/** Crea o actualiza el evento de la reserva en Google Calendar. Nunca lanza — retorna null si falla o no está configurado. */
export async function syncReservationToCalendar(r: ReservationForSync): Promise<string | null> {
  try {
    if (!(await isSyncEnabled())) return null
    const client = getCalendarClient()
    if (!client) return null
    const { calendar, calendarId } = client
    const payload = buildEventPayload(r)

    if (r.googleEventId) {
      const res = await calendar.events.update({ calendarId, eventId: r.googleEventId, requestBody: payload })
      return res.data.id || r.googleEventId
    }
    const res = await calendar.events.insert({ calendarId, requestBody: payload })
    return res.data.id || null
  } catch (err) {
    console.error("[googleCalendar] Error sincronizando reserva", r.id, err)
    return null
  }
}

/** Elimina el evento de Google Calendar asociado a una reserva cancelada/borrada. Nunca lanza. */
export async function deleteReservationFromCalendar(googleEventId: string | null): Promise<void> {
  if (!googleEventId) return
  try {
    if (!(await isSyncEnabled())) return
    const client = getCalendarClient()
    if (!client) return
    await client.calendar.events.delete({ calendarId: client.calendarId, eventId: googleEventId })
  } catch (err) {
    console.error("[googleCalendar] Error eliminando evento", googleEventId, err)
  }
}
