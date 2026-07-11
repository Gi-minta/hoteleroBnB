import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"

export interface EscnnaRecord {
  id: number
  reservationId: number | null
  guestId: number | null
  paso: number
  completado: boolean
  data: string
  createdAt: string
  updatedAt: string
}

export function useEscnna() {
  return useQuery<EscnnaRecord[]>({
    queryKey: ["escnna"],
    queryFn: async () => {
      const { data } = await client.get("/escnna")
      return data
    },
  })
}

export function useUpsertEscnna() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { paso: number; completado: boolean; data: Record<string, any> }) => {
      const { data } = await client.post("/escnna", body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["escnna"] }),
  })
}
