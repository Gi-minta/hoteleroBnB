import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import type { PreRegistro } from "@/types"

export interface PreRegistroInput {
  nombre: string
  apellido?: string
  email: string
  telefono: string
  checkInDate?: string
  checkOutDate?: string
  personas?: number
  mensaje?: string
}

// Público — usado desde la landing page, no requiere sesión
export function useCreatePreRegistro() {
  return useMutation({
    mutationFn: async (input: PreRegistroInput) => {
      const { data } = await client.post("/landing/pre-registro", input)
      return data as PreRegistro
    },
  })
}

// Admin — listar solicitudes
export function usePreRegistros(estado?: string) {
  return useQuery<PreRegistro[]>({
    queryKey: ["pre-registros", estado],
    queryFn: async () => {
      const { data } = await client.get("/landing/admin/pre-registros", {
        params: estado ? { estado } : {},
      })
      return data
    },
  })
}

export function useUpdatePreRegistroEstado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      const { data } = await client.patch(`/landing/admin/pre-registros/${id}`, { estado })
      return data as PreRegistro
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pre-registros"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useDeletePreRegistro() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/landing/admin/pre-registros/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pre-registros"] }),
  })
}
