import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import client from "@/api/client"
import { useTr } from "@/context/I18nContext"

interface RoomData {
  id: number
  numero: string
  roomType: { id: number; nombre: string }
  estado: string
}

interface AvailabilityData {
  rooms: RoomData[]
  occupied: Record<number, string[]>
  month: number
  year: number
}

interface Props {
  roomTypeName: string
  onClose: () => void
}

export default function AvailabilityModal({ roomTypeName, onClose }: Props) {
  const tr = useTr()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { data } = useQuery<AvailabilityData>({
    queryKey: ["landing-availability", month, year],
    queryFn: async () => {
      const { data } = await client.get("/landing/availability", { params: { month, year } })
      return data
    },
  })

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()
  const monthName = new Date(year, month - 1).toLocaleString("es-ES", { month: "long" })

  const targetRooms = useMemo(() => {
    if (!data) return []
    return data.rooms.filter((r) => r.roomType.nombre === roomTypeName)
  }, [data, roomTypeName])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOccupied = (day: number) => {
    if (!data) return false
    const dateStr = new Date(year, month - 1, day).toISOString().slice(0, 10)
    return targetRooms.some((r) => (data.occupied[r.id] || []).includes(dateStr))
  }

  const isPast = (day: number) => {
    const d = new Date(year, month - 1, day)
    d.setHours(0, 0, 0, 0)
    return d < today
  }

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1) }
    else { setMonth(month - 1) }
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1) }
    else { setMonth(month + 1) }
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const padding = Array.from({ length: firstDay }, (_, i) => i)
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white text-ink dark:bg-[#1E2A22] dark:text-[#ECF1EC] rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ fontFamily: "'Fraunces', serif" }}>
            {roomTypeName} — {tr("Disponibilidad", "Availability")}
          </h3>
          <button onClick={onClose} className="text-ink-soft hover:text-fucsia text-xl leading-none">✕</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-ink/10 hover:bg-ink/5 transition text-sm">◀</button>
          <span className="font-bold capitalize" style={{ fontFamily: "'Fraunces', serif" }}>{monthName} {year}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-ink/10 hover:bg-ink/5 transition text-sm">▶</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-xs font-bold text-ink-soft dark:text-[#A7B6AB] uppercase py-1" style={{ fontFamily: "'Space Mono', monospace" }}>{d}</div>
          ))}
          {padding.map((i) => <div key={`pad-${i}`} />)}
          {days.map((d) => {
            const occupied = isOccupied(d)
            const past = isPast(d)
            return (
              <div key={d} className={`py-2 text-sm rounded-lg ${past ? "text-ink/20 dark:text-white/20" : occupied ? "bg-rojo/15 text-rojo font-medium" : "bg-verde/15 text-verde font-bold"} ${!past ? "hover:ring-2 hover:ring-verde/40" : ""} transition`}>
                {d}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-ink-soft dark:text-[#A7B6AB]">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-verde/30" /> {tr("Disponible", "Available")}</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rojo/30" /> {tr("Ocupado", "Occupied")}</span>
        </div>

        <div className="mt-5 flex gap-3">
          <a href="https://wa.me/573004446421" target="_blank" rel="noopener"
            className="flex-1 bg-wa text-white py-3 rounded-full text-sm font-bold text-center hover:brightness-110 transition shadow-md">
            {tr("Reservar por WhatsApp", "Book via WhatsApp")}
          </a>
          <button onClick={onClose}
            className="px-5 py-3 border border-ink/15 dark:border-white/20 rounded-full text-sm font-bold hover:bg-ink/5 transition">
            {tr("Cerrar", "Close")}
          </button>
        </div>
      </div>
    </div>
  )
}