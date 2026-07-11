import { useAuth } from "@/context/AuthContext"
import { useDashboard } from "@/api/queries/useDashboard"
import { Link } from "@tanstack/react-router"
import { CalendarDays, Users, DoorOpen, DollarSign, Activity, ClipboardList, LogIn, LogOut, PlusCircle } from "lucide-react"
import { StatsSkeleton } from "@/components/Skeletons"

const ROOM_STATUS_COLORS: Record<string, string> = {
  Disponible: "bg-green-500",
  Ocupada: "bg-blue-500",
  Reservada: "bg-amber-500",
  Limpieza: "bg-purple-500",
  Mantenimiento: "bg-red-500",
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useDashboard()

  const stats = [
    { label: "Reservas totales", value: data?.totalReservations ?? 0, icon: CalendarDays, color: "bg-blue-50 text-blue-600" },
    { label: "Reservas activas", value: data?.activeReservations ?? 0, icon: Activity, color: "bg-green-50 text-green-600" },
    { label: "Huéspedes", value: data?.totalGuests ?? 0, icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: "Disponibles", value: `${data?.availableRooms ?? 0}/${data?.totalRooms ?? 0}`, icon: DoorOpen, color: "bg-amber-50 text-amber-600" },
    { label: "Ingresos", value: `$${(data?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
  ]

  const maxRevenue = Math.max(1, ...(data?.revenueByMonth?.map((m) => m.total) ?? [1]))
  const totalRoomsForBreakdown = data?.roomsByStatus?.reduce((s, r) => s + r.count, 0) || 1

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-ink-soft text-sm">Bienvenido, {user?.username}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/reservations/new" className="flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition">
            <PlusCircle size={16} /> Nueva reserva
          </Link>
          <Link to="/admin/pre-registros" className="flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-lg text-sm font-bold hover:border-verde/40 transition">
            <ClipboardList size={16} /> Solicitudes
            {!!data?.pendingPreRegistros && (
              <span className="bg-fucsia text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{data.pendingPreRegistros}</span>
            )}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <StatsSkeleton count={5} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 border border-ink/5">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon size={18} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>

          {!!data?.pendingPreRegistros && (
            <Link to="/admin/pre-registros"
              className="flex items-center gap-3 bg-fucsia/10 border border-fucsia/20 text-fucsia rounded-xl p-4 mb-8 hover:bg-fucsia/15 transition">
              <ClipboardList size={20} />
              <p className="text-sm font-medium">
                Tienes <strong>{data.pendingPreRegistros}</strong> solicitud{data.pendingPreRegistros === 1 ? "" : "es"} de reserva pendiente{data.pendingPreRegistros === 1 ? "" : "s"} desde la página web.
                <span className="underline ml-1">Revisar →</span>
              </p>
            </Link>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Ingresos por mes */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-ink/5 p-6">
              <h2 className="font-bold mb-5">Ingresos — últimos 6 meses</h2>
              <div className="flex items-end gap-3 h-40">
                {data?.revenueByMonth?.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <span className="text-[11px] text-ink-soft">{m.total > 0 ? `$${(m.total / 1000).toFixed(0)}k` : ""}</span>
                    <div className="w-full bg-verde/15 rounded-t-md relative" style={{ height: `${Math.max(4, (m.total / maxRevenue) * 100)}%` }}>
                      <div className="absolute inset-0 bg-verde rounded-t-md" />
                    </div>
                    <span className="text-[11px] text-ink-soft capitalize">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ocupación por estado */}
            <div className="bg-white rounded-xl border border-ink/5 p-6">
              <h2 className="font-bold mb-4">Ocupación de habitaciones</h2>
              <div className="w-full h-3 rounded-full overflow-hidden flex mb-4">
                {data?.roomsByStatus?.map((r) => (
                  <div key={r.estado} className={ROOM_STATUS_COLORS[r.estado] || "bg-gray-300"}
                    style={{ width: `${(r.count / totalRoomsForBreakdown) * 100}%` }} title={r.estado} />
                ))}
              </div>
              <div className="space-y-2">
                {data?.roomsByStatus?.map((r) => (
                  <div key={r.estado} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-soft">
                      <span className={`w-2.5 h-2.5 rounded-full ${ROOM_STATUS_COLORS[r.estado] || "bg-gray-300"}`} /> {r.estado}
                    </span>
                    <span className="font-bold">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Próximas entradas */}
            <div className="bg-white rounded-xl border border-ink/5 p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2"><LogIn size={16} className="text-verde" /> Próximas entradas (7 días)</h2>
              {data?.upcomingCheckIns?.length ? (
                <div className="space-y-3">
                  {data.upcomingCheckIns.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                      <p className="font-medium text-sm">{r.guest.nombre} {r.guest.apellido}</p>
                      <span className="text-xs text-ink-soft">{new Date(r.checkInDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-ink-soft text-sm">Sin entradas próximas</p>}
            </div>

            {/* Próximas salidas */}
            <div className="bg-white rounded-xl border border-ink/5 p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2"><LogOut size={16} className="text-fucsia" /> Próximas salidas (7 días)</h2>
              {data?.upcomingCheckOuts?.length ? (
                <div className="space-y-3">
                  {data.upcomingCheckOuts.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                      <p className="font-medium text-sm">{r.guest.nombre} {r.guest.apellido}</p>
                      <span className="text-xs text-ink-soft">{new Date(r.checkOutDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-ink-soft text-sm">Sin salidas próximas</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-ink/5 p-6">
            <h2 className="font-bold mb-4">Reservas recientes</h2>
            {data?.recentReservations?.length ? (
              <div className="space-y-3">
                {data.recentReservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{r.guest.nombre} {r.guest.apellido}</p>
                      <p className="text-xs text-ink-soft">{new Date(r.checkInDate).toLocaleDateString()} → {new Date(r.checkOutDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      r.status === "Confirmada" ? "bg-green-50 text-green-700" :
                      r.status === "CheckIn" ? "bg-blue-50 text-blue-700" :
                      r.status === "Cancelada" ? "bg-red-50 text-red-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">No hay reservas recientes</p>
            )}
            <Link to="/admin/reservations" className="text-sm text-verde font-medium mt-4 inline-block hover:underline">Ver todas las reservas →</Link>
          </div>
        </>
      )}
    </div>
  )
}
