import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import type { RegistroHuesped, RegistroAcompanante, RegistroDocumento } from "@/types"

export interface RegistroInput {
  numeroReserva?: string
  numeroHabitacion?: string
  fechaLlegada?: string
  fechaSalida?: string
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  fechaNacimiento?: string
  email: string
  telefono: string
  profesion?: string
  origen?: string
  numeroPersonas?: number
  acompanantes?: RegistroAcompanante[]
  documentosIdentidad?: RegistroDocumento[]
  autorizaInfo?: boolean
  aceptaReglamento: boolean
  aceptaEscnna: boolean
  aceptaContrato: boolean
  firmaUrl: string
}

// ── Público (landing, sin sesión) ──
export function useCreateRegistro() {
  return useMutation({
    mutationFn: async (input: RegistroInput) => {
      const { data } = await client.post("/registros", input)
      return data as RegistroHuesped
    },
  })
}

// Sube un archivo (foto de documento / permiso) al endpoint público y devuelve su URL.
export function useUploadRegistroDoc() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append("file", file)
      const { data } = await client.post("/registros/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data as { url: string }
    },
  })
}

// ── Admin ──
export function useRegistros(estado?: string) {
  return useQuery<RegistroHuesped[]>({
    queryKey: ["registros", estado],
    queryFn: async () => {
      const { data } = await client.get("/registros", { params: estado ? { estado } : {} })
      return data
    },
  })
}

export function useUpdateRegistroEstado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      const { data } = await client.patch(`/registros/${id}`, { estado })
      return data as RegistroHuesped
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useDeleteRegistro() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/registros/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registros"] }),
  })
}
