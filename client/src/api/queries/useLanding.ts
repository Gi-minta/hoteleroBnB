import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"

export interface LandingContent {
  id: number
  section: string
  key: string
  value: string
  updatedAt: string
}

export interface LandingGallery {
  id: number
  url: string
  caption: string
  orden: number
  active: boolean
  createdAt: string
}

export interface RoomWithPhotos {
  id: number
  numero: string
  roomType: { id: number; nombre: string; precioBase: number; capacidadMaxima: number }
  estado: string
  piso: number
  notas: string
  photos: { id: number; url: string; caption: string; orden: number }[]
}

export function useLandingContent() {
  return useQuery<LandingContent[]>({
    queryKey: ["landing-content"],
    queryFn: async () => {
      const { data } = await client.get("/landing/content")
      return data
    },
  })
}

export function useLandingGallery() {
  return useQuery<LandingGallery[]>({
    queryKey: ["landing-gallery"],
    queryFn: async () => {
      const { data } = await client.get("/landing/gallery")
      return data
    },
  })
}

export function useRoomsWithPhotos() {
  return useQuery<RoomWithPhotos[]>({
    queryKey: ["rooms-gallery"],
    queryFn: async () => {
      const { data } = await client.get("/landing/rooms-gallery")
      return data
    },
  })
}

export function useUpsertLandingContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (c: { section: string; key: string; value: string }) => {
      const { data } = await client.post("/landing/admin/content", c)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["landing-content"] }),
  })
}

export function useAddGalleryImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (g: { url: string; caption?: string; orden?: number }) => {
      const { data } = await client.post("/landing/admin/gallery", g)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["landing-gallery"] }),
  })
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/landing/admin/gallery/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["landing-gallery"] }),
  })
}
