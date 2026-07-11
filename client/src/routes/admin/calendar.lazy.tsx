import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import client from "@/api/client"

interface CalendarReservation {
  id: number
  roomId: number
  roomNumero: string
  roomType: string
  guestName: string
  checkIn: string
  checkOut: string
  status: string
}

function useCalendarReservations(month: number, year: number) {
  return useQuery<CalendarReservation[]>({
    queryKey: ["calendar", month, year],
    queryFn: async () => {
      const { data } = await client.get("/reservations/calendar", { params: { month, year } })
      return data
    },
  })
}

export default function CalendarPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const { data: reservations } = useCalendarReservations(month, year)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()
  const monthName = new Date(year, month - 1).toLocaleString("es-ES", { month: "long" })

  const roomMap = useMemo(() => {
    const map = new Map<number, CalendarReservation[]>()
    if (!reservations) return map
    for (const r of reservations) {
      if (!map.has(r.roomId)) map.set(r.roomId, [])
      map.get(r.roomId)!.push(r)
    }
    return map
  }, [reservations])

  const rooms = useMemo(() => {
    const ids = new Set<number>()
    if (!reservations) return []
    for (const r of reservations) {
      if (!ids.has(r.roomId)) ids.add(r.roomId)
    }
    return reservations.filter((r, i, arr) => arr.findIndex((x) => x.roomId === r.roomId) === i)
  }, [reservations])

  const isInRange = (roomId: number, day: number) => {
    const rs = roomMap.get(roomId) || []
    const date = new Date(year, month - 1, day)
    date.setHours(12, 0, 0, 0)
    return rs.some((r) => {
      const ci = new Date(r.checkIn)
      const co = new Date(r.checkOut)
      ci.setHours(12, 0, 0, 0)
      co.setHours(12, 0, 0, 0)
      return date >= ci && date < co
    })
  }

  const getReservationForDay = (roomId: number, day: number) => {
    const rs = roomMap.get(roomId) || []
    const date = new Date(year, month - 1, day)
    date.setHours(12, 0, 0, 0)
    return rs.find((r) => {
      const ci = new Date(r.checkIn)
      const co = new Date(r.checkOut)
      ci.setHours(12, 0, 0, 0)
      co.setHours(12, 0, 0, 0)
      return date >= ci && date < co
    })
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "Confirmada": return "bg-green-400"
      case "CheckIn": return "bg-blue-400"
      case "Pendiente": return "bg-amber-300"
      case "CheckOut": return "bg-gray-300"
      default: return "bg-red-300"
    }
  }

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1) } else { setMonth(month - 1) } }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1) } else { setMonth(month + 1) } }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const padding = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendario de Reservas</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="px-3 py-1.5 border border-ink/10 rounded-lg text-sm hover:bg-gray-50 transition">◀</button>
          <span className="font-bold capitalize text-lg" style={{ fontFamily: "'Fraunces', serif" }}>{monthName} {year}</span>
          <button onClick={nextMonth} className="px-3 py-1.5 border border-ink/10 rounded-lg text-sm hover:bg-gray-50 transition">▶</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-ink/5 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${daysInMonth}, 1fr)` }}>
            <div className="sticky left-0 bg-white z-10 border-r border-b border-ink/10 p-2 font-bold text-xs uppercase tracking-wider text-ink-soft" style={{ fontFamily: "'Space Mono', monospace" }}>
              Habitación
            </div>
            {days.map((d) => {
              const isWeekend = new Date(year, month - 1, d).getDay() === 0 || new Date(year, month - 1, d).getDay() === 6
              const isToday = new Date().getDate() === d && new Date().getMonth() === month - 1 && new Date().getFullYear() === year
              return (
                <div key={d} className={`border-b border-r border-ink/5 p-1.5 text-center text-xs font-mono ${isToday ? "bg-verde/10 font-bold text-verde" : isWeekend ? "bg-gray-50" : ""}`}>
                  {d}
                </div>
              )
            })}

            {rooms.map((room) => (
              <>
                <div key={`label-${room.roomId}`} className="sticky left-0 bg-white z-10 border-r border-b border-ink/10 p-2 text-sm font-medium truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verde" />
                  {room.roomNumero} — {room.roomType}
                </div>
                {days.map((d) => {
                  const res = getReservationForDay(room.roomId, d)
                  const occupied = isInRange(room.roomId, d)
                  return (
                    <div key={`${room.roomId}-${d}`} className={`border-b border-r border-ink/5 p-0.5 relative min-h-[32px] ${occupied ? statusColor(res?.status || "") : ""}`}>
                      {occupied && res && d === new Date(res.checkIn).getDate() && new Date(res.checkIn).getMonth() === month - 1 && (
                        <div className="absolute inset-0 flex items-center justify-center" title={`${res.guestName}: ${res.status}`}>
                          <span className="text-[8px] leading-tight text-white font-bold px-1 truncate text-center w-full">
                            {res.guestName}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-4 text-xs text-ink-soft">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-400" /> Confirmada</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-400" /> Check-In</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-300" /> Pendiente</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-300" /> Check-Out</span>
      </div>
    </div>
  )
}
