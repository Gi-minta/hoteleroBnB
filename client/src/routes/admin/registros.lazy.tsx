import { useState } from "react"
import { useRegistros, useUpdateRegistroEstado, useDeleteRegistro } from "@/api/queries/useRegistros"
import type { RegistroAcompanante, RegistroDocumento, RegistroHuesped } from "@/types"
import { ClipboardList, Mail, Phone, Calendar, Users, Trash2, FileText, DoorOpen } from "lucide-react"
import { TableSkeleton } from "@/components/Skeletons"

const ESTADOS = ["Pendiente", "Revisado", "Aprobado", "Rechazado"] as const

const ESTADO_STYLES: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700",
  Revisado: "bg-blue-50 text-blue-700",
  Aprobado: "bg-green-50 text-green-700",
  Rechazado: "bg-red-50 text-red-700",
}

const TIPO_DOC: Record<string, string> = { CC: "Cédula de ciudadanía", CE: "Cédula de extranjería", PA: "Pasaporte" }

function parse<T>(json: string, fallback: T): T {
  try { return JSON.parse(json) as T } catch { return fallback }
}

function fecha(v: string | null) {
  return v ? new Date(v).toLocaleDateString() : "—"
}

export default function RegistrosPage() {
  const [filtro, setFiltro] = useState<string>("")
  const { data: registros, isLoading } = useRegistros(filtro || undefined)
  const updateEstado = useUpdateRegistroEstado()
  const deleteRegistro = useDeleteRegistro()

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Registros de huéspedes</h1>
      </div>
      <p className="text-ink-soft text-sm mb-6">
        Fichas de registro (pre check-in) enviadas desde el formulario "Reservar" de la página web.
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
        <TableSkeleton rows={4} cols={5} />
      ) : registros?.length ? (
        <div className="space-y-3">
          {registros.map((r) => <RegistroCard key={r.id} r={r}
            onEstado={(estado) => updateEstado.mutate({ id: r.id, estado })}
            onDelete={() => { if (confirm("¿Eliminar este registro?")) deleteRegistro.mutate(r.id) }} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p>{filtro ? `No hay registros en estado "${filtro}"` : "Aún no hay registros de huéspedes"}</p>
        </div>
      )}
    </div>
  )
}

function RegistroCard({ r, onEstado, onDelete }: { r: RegistroHuesped; onEstado: (estado: string) => void; onDelete: () => void }) {
  const acompanantes = parse<RegistroAcompanante[]>(r.acompanantes, [])
  const documentos = parse<RegistroDocumento[]>(r.documentosIdentidad, [])

  return (
    <div className="bg-white rounded-xl border border-ink/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold">{r.nombres} {r.apellidos}</p>
          <p className="text-xs text-ink-soft mt-0.5">
            {TIPO_DOC[r.tipoDocumento] || r.tipoDocumento}: {r.numeroDocumento} · Enviado el {new Date(r.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_STYLES[r.estado]}`}>{r.estado}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-3">
        <div className="flex items-center gap-2 text-ink-soft"><Mail size={14} /> {r.email}</div>
        <div className="flex items-center gap-2 text-ink-soft"><Phone size={14} /> {r.telefono}</div>
        <div className="flex items-center gap-2 text-ink-soft"><Users size={14} /> {r.numeroPersonas} persona{r.numeroPersonas === 1 ? "" : "s"}</div>
        <div className="flex items-center gap-2 text-ink-soft"><Calendar size={14} /> {fecha(r.fechaLlegada)} → {fecha(r.fechaSalida)}</div>
        {(r.numeroReserva || r.numeroHabitacion) && (
          <div className="flex items-center gap-2 text-ink-soft"><DoorOpen size={14} /> Reserva {r.numeroReserva || "—"} · Hab. {r.numeroHabitacion || "—"}</div>
        )}
        {r.profesion && <div className="flex items-center gap-2 text-ink-soft">💼 {r.profesion}</div>}
      </div>

      {acompanantes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-bold text-ink-soft mb-1">Acompañantes</p>
          <ul className="text-sm space-y-1">
            {acompanantes.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-ink-soft">
                <span>{a.nombres} {a.apellidos}</span>
                <span className="text-xs">({TIPO_DOC[a.tipoDocumento] || a.tipoDocumento}: {a.numeroDocumento})</span>
                {a.esMenor && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Menor</span>}
                {a.permisoUrl && <a href={a.permisoUrl} target="_blank" rel="noopener" className="text-xs text-verde underline">Permiso</a>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-3">
        {documentos.length > 0 && (
          <div>
            <p className="text-xs font-bold text-ink-soft mb-1 flex items-center gap-1"><FileText size={13} /> Documentos</p>
            <div className="flex flex-wrap gap-2">
              {documentos.map((d, i) => (
                <a key={i} href={d.url} target="_blank" rel="noopener" title={d.persona}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-gray-50 text-ink-soft hover:bg-gray-100 transition">
                  <FileText size={12} /> {d.persona || `Doc ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}
        {r.firmaUrl && (
          <div>
            <p className="text-xs font-bold text-ink-soft mb-1">Firma</p>
            <img src={r.firmaUrl} alt="Firma" className="h-12 border border-ink/10 rounded bg-white" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <Badge ok={r.autorizaInfo} label="Autoriza info" />
        <Badge ok={r.aceptaReglamento} label="Reglamento" />
        <Badge ok={r.aceptaEscnna} label="ESCNNA" />
        <Badge ok={r.aceptaContrato} label="Contrato" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-wa/10 text-wa hover:bg-wa/20 transition">
          <Phone size={14} /> WhatsApp
        </a>
        <select value={r.estado} onChange={(e) => onEstado(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-ink/10 bg-white">
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-ink-soft hover:text-rojo hover:bg-rojo/10 transition ml-auto">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full font-bold ${ok ? "bg-green-50 text-green-700" : "bg-gray-100 text-ink-soft"}`}>
      {ok ? "✓" : "✕"} {label}
    </span>
  )
}
