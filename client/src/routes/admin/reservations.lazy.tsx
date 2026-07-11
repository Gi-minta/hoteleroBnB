import { useReservations, useCancelReservation, useCheckIn, useCheckOut } from "@/api/queries/useReservations"
import { useState } from "react"
import { CalendarDays, X, Check, DoorOpen, Plus, DollarSign } from "lucide-react"
import { Link } from "@tanstack/react-router"
import PaymentModal from "@/components/PaymentModal"
import { TableSkeleton } from "@/components/Skeletons"

export default function ReservationsPage() {
  const [filter, setFilter] = useState("")
  const { data: reservations, isLoading } = useReservations(filter)
  const cancelMutation = useCancelReservation()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  const [paymentTarget, setPaymentTarget] = useState<{ id: number; total: number } | null>(null)

  const statusColors: Record<string, string> = {
    Confirmada: "bg-green-50 text-green-700",
    CheckIn: "bg-blue-50 text-blue-700",
    CheckOut: "bg-purple-50 text-purple-700",
    Cancelada: "bg-red-50 text-red-700",
    Pendiente: "bg-yellow-50 text-yellow-700",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <div className="flex gap-2">
          <Link to="/admin/reservations/new" className="flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition">
            <Plus size={16} /> Nueva reserva
          </Link>
          {["", "Confirmada", "CheckIn", "Cancelada"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition ${filter === s ? "bg-verde text-white border-verde" : "bg-white border-ink/10 text-ink-soft hover:border-verde"}`}>
              {s || "Todas"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : reservations?.length ? (
        <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ink-soft text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Huésped</th>
                  <th className="text-left px-4 py-3">Fechas</th>
                  <th className="text-left px-4 py-3">Habitaciones</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.guest.nombre} {r.guest.apellido}</p>
                      <p className="text-xs text-ink-soft">{r.guest.documento}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(r.checkInDate).toLocaleDateString()} → {new Date(r.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.reservationRooms.map((rr) => (
                        <span key={rr.id} className="inline-flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded mr-1">
                          <DoorOpen size={12} /> {rr.room.numero}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-medium">${r.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[r.status] || "bg-gray-50 text-gray-600"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {r.status === "Confirmada" && (
                          <button onClick={() => checkInMutation.mutate(r.id)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Check-in">
                            <Check size={14} />
                          </button>
                        )}
                        {r.status === "CheckIn" && (
                          <button onClick={() => checkOutMutation.mutate(r.id)} className="p-1.5 rounded hover:bg-purple-50 text-purple-600" title="Check-out">
                            <DoorOpen size={14} />
                          </button>
                        )}
                        {(r.status === "Confirmada" || r.status === "CheckIn") && (
                          <button onClick={() => setPaymentTarget({ id: r.id, total: r.totalAmount })} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600" title="Registrar pago">
                            <DollarSign size={14} />
                          </button>
                        )}
                        {(r.status === "Confirmada" || r.status === "Pendiente") && (
                          <button onClick={() => { if (confirm("¿Cancelar reserva?")) cancelMutation.mutate({ id: r.id, motivo: "Cancelado por administrador" }) }} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Cancelar">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay reservas {filter ? `con estado "${filter}"` : ""}</p>
        </div>
      )}

      {paymentTarget && (
        <PaymentModal
          reservationId={paymentTarget.id}
          totalAmount={paymentTarget.total}
          onClose={() => setPaymentTarget(null)}
        />
      )}
    </div>
  )
}
