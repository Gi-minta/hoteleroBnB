import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"

export interface RoomPhoto {
  id: number
  roomId: number
  url: string
  caption: string
  orden: number
  createdAt: string
}

export function useRoomPhotos(roomId: number) {
  return useQuery<RoomPhoto[]>({
    queryKey: ["room-photos", roomId],
    queryFn: async () => {
      const { data } = await client.get(`/photos/room/${roomId}`)
      return data
    },
    enabled: !!roomId,
  })
}

export function useCreateRoomPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { roomId: number; url: string; caption?: string; orden?: number }) => {
      const { data } = await client.post("/photos", p)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["room-photos"] }),
  })
}

export function useDeleteRoomPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/photos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["room-photos"] }),
  })
}
