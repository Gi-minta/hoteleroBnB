import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import type { Payment } from "@/types"

export function usePayments(reservationId?: number) {
  return useQuery<Payment[]>({
    queryKey: ["payments", reservationId],
    queryFn: async () => {
      const { data } = await client.get("/payments", { params: { reservationId } })
      return data
    },
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Partial<Payment>) => {
      const { data } = await client.post("/payments", p)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  })
}
