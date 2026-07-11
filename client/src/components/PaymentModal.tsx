import { useState } from "react"
import { useCreatePayment } from "@/api/queries/usePayments"
import { X, DollarSign } from "lucide-react"

interface PaymentModalProps {
  reservationId: number
  totalAmount: number
  onClose: () => void
}

const METHODS = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Tarjeta", label: "Tarjeta" },
  { value: "Consignación", label: "Consignación" },
]

export default function PaymentModal({ reservationId, totalAmount, onClose }: PaymentModalProps) {
  const [amount, setAmount] = useState(totalAmount)
  const [method, setMethod] = useState("Efectivo")
  const [reference, setReference] = useState("")
  const createPayment = useCreatePayment()

  const handleSubmit = async () => {
    if (amount <= 0) return
    await createPayment.mutateAsync({
      reservationId,
      amount,
      method,
      reference,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><DollarSign size={18} /> Registrar Pago</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-soft block mb-1">Monto</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1}
              className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft block mb-1">Método de pago</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30">
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft block mb-1">Referencia (opcional)</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
          </div>

          {createPayment.isError && (
            <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
              {(createPayment.error as any)?.response?.data?.error || "Error al registrar pago"}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-ink/10 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={amount <= 0 || createPayment.isPending}
              className="flex-1 px-4 py-2.5 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
              {createPayment.isPending ? "Guardando..." : "Registrar pago"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
