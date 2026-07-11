import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { usePreRegistros, useUpdatePreRegistroEstado, useDeletePreRegistro } from "@/api/queries/usePreRegistros"
import { ClipboardList, Mail, Phone, Calendar, Users, Trash2, ArrowRight, MessageCircle } from "lucide-react"
import { TableSkeleton } from "@/components/Skeletons"

const ESTADOS = ["Pendiente", "Contactado", "Convertido", "Descartado"] as const

const ESTADO_STYLES: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700",
  Contactado: "bg-blue-50 text-blue-700",
  Convertido: "bg-green-50 text-green-700",
  Descartado: "bg-red-50 text-red-700",
}

export default function PreRegistrosPage() {
  const nav = useNavigate()
  const [filtro, setFiltro] = useState<string>("")
  const { data: registros, isLoading } = usePreRegistros(filtro || undefined)
  const updateEstado = useUpdatePreRegistroEstado()
  const deleteRegistro = useDeletePreRegistro()

  const handleCrearReserva = (r: NonNullable<typeof registros>[number]) => {
    // Guarda los datos del huésped para prellenar el wizard de nueva reserva
    sessionStorage.setItem("prefillGuest", JSON.stringify({
      nombre: r.nombre,
      apellido: r.apellido,
      email: r.email,
      telefono: r.telefono,
      checkIn: r.checkInDate ? r.checkInDate.split("T")[0] : "",
      checkOut: r.checkOutDate ? r.checkOutDate.split("T")[0] : "",
      numPersonas: r.personas,
    }))
    updateEstado.mutate({ id: r.id, estado: "Convertido" })
    nav({ to: "/admin/reservations/new" })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Solicitudes de reserva</h1>
      </div>
      <p className="text-ink-soft text-sm mb-6">
        Pre-registros enviados desde el formulario de la página web (además de las reservas por WhatsApp).
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFiltro("")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filtro === "" ? "bg-verde text-white" : "bg-white border border-ink/10 text-ink-soft hover:border-verde/40"}`}>
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button key={e} onClick={() => setFiltro(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filtro === e ? "bg-verde text-white" : "bg-white border border-ink/10 text-ink-soft hover:border-verde/40"}`}>
            {e}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : registros?.length ? (
        <div className="space-y-3">
          {registros.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-ink/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold">{r.nombre} {r.apellido}</p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Solicitado el {new Date(r.createdAt).toLocaleDateString()} · Origen: {r.origen}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_STYLES[r.estado]}`}>{r.estado}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2 text-ink-soft">
                  <Mail size={14} /> {r.email}
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  <Phone size={14} /> {r.telefono}
                </div>
                {(r.checkInDate || r.checkOutDate) && (
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Calendar size={14} />
                    {r.checkInDate ? new Date(r.checkInDate).toLocaleDateString() : "?"} → {r.checkOutDate ? new Date(r.checkOutDate).toLocaleDateString() : "?"}
                  </div>
                )}
                <div className="flex items-center gap-2 text-ink-soft">
                  <Users size={14} /> {r.personas} persona{r.personas === 1 ? "" : "s"}
                </div>
              </div>

              {r.mensaje && (
                <p className="text-sm bg-gray-50 rounded-lg p-3 mb-3 text-ink-soft italic">"{r.mensaje}"</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-wa/10 text-wa hover:bg-wa/20 transition">
                  <MessageCircle size={14} /> Contactar por WhatsApp
                </a>
                <select value={r.estado} onChange={(e) => updateEstado.mutate({ id: r.id, estado: e.target.value })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-ink/10 bg-white">
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <button onClick={() => handleCrearReserva(r)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-verde text-white hover:bg-verde-2 transition ml-auto">
                  Crear reserva <ArrowRight size={14} />
                </button>
                <button onClick={() => { if (confirm("¿Eliminar esta solicitud?")) deleteRegistro.mutate(r.id) }}
                  className="p-1.5 rounded-lg text-ink-soft hover:text-rojo hover:bg-rojo/10 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p>{filtro ? `No hay solicitudes en estado "${filtro}"` : "Aún no hay solicitudes de reserva"}</p>
        </div>
      )}
    </div>
  )
}
