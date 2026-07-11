import { useState } from "react"
import { useResponsables } from "@/api/queries/useResponsables"
import { Building2, Search } from "lucide-react"
import { TableSkeleton } from "@/components/Skeletons"

export default function ResponsablesPage() {
  const [search, setSearch] = useState("")
  const { data: responsables, isLoading } = useResponsables(search)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Responsables de Pago</h1>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input type="text" placeholder="Buscar por razón social o CUIT..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30 bg-white" />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : responsables?.length ? (
        <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-ink-soft text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Razón Social</th>
                <th className="text-left px-4 py-3">CUIT</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Teléfono</th>
                <th className="text-left px-4 py-3">Posición IVA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {responsables.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.razonSocial}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.cuit}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.telefono}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.posicionIva}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? "No se encontraron responsables" : "No hay responsables registrados"}</p>
        </div>
      )}
    </div>
  )
}
