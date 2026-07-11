import { useGuests } from "@/api/queries/useGuests"
import { useState } from "react"
import { Users, Search } from "lucide-react"
import { TableSkeleton } from "@/components/Skeletons"

export default function GuestsPage() {
  const [search, setSearch] = useState("")
  const { data: guests, isLoading } = useGuests(search)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Huéspedes</h1>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input type="text" placeholder="Buscar por nombre, documento o email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30 bg-white" />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : guests?.length ? (
        <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-ink-soft text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Documento</th>
                <th className="text-left px-4 py-3">Tipo Doc.</th>
                <th className="text-left px-4 py-3">Profesión</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{g.nombre} {g.apellido}</td>
                    <td className="px-4 py-3 text-ink-soft">{g.documento}</td>
                    <td className="px-4 py-3 text-ink-soft">{g.tipoDocumento}</td>
                    <td className="px-4 py-3 text-ink-soft">{g.profesion || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{g.email}</td>
                    <td className="px-4 py-3 text-ink-soft">{g.telefono}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? "No se encontraron huéspedes" : "No hay huéspedes registrados"}</p>
        </div>
      )}
    </div>
  )
}
