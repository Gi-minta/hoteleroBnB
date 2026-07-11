import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import type { Guest } from "@/types"

export function useGuests(search = "") {
  return useQuery<Guest[]>({
    queryKey: ["guests", search],
    queryFn: async () => {
      const { data } = await client.get("/guests", { params: { search } })
      return data
    },
  })
}

export function useGuest(id: number) {
  return useQuery<Guest>({
    queryKey: ["guests", id],
    queryFn: async () => {
      const { data } = await client.get(`/guests/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (guest: Partial<Guest>) => {
      const { data } = await client.post("/guests", guest)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  })
}

export function useUpdateGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...guest }: Partial<Guest> & { id: number }) => {
      const { data } = await client.put(`/guests/${id}`, guest)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  })
}

export function useDeleteGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/guests/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  })
}
