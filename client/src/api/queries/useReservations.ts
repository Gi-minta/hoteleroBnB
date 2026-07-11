import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import type { Reservation } from "@/types"

export function useReservations(status = "") {
  return useQuery<Reservation[]>({
    queryKey: ["reservations", status],
    queryFn: async () => {
      const { data } = await client.get("/reservations", { params: { status } })
      return data
    },
  })
}

export function useReservation(id: number) {
  return useQuery<Reservation>({
    queryKey: ["reservations", id],
    queryFn: async () => {
      const { data } = await client.get(`/reservations/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (r: any) => {
      const { data } = await client.post("/reservations", r)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] })
      qc.invalidateQueries({ queryKey: ["rooms"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useCancelReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data } = await client.post(`/reservations/${id}/cancel`, { motivo })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] })
      qc.invalidateQueries({ queryKey: ["rooms"] })
    },
  })
}

export function useCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.post(`/reservations/${id}/checkin`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  })
}

export function useCheckOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.post(`/reservations/${id}/checkout`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  })
}
