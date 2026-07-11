import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import type { Room, RoomType } from "@/types"

export function useRooms(status = "") {
  return useQuery<Room[]>({
    queryKey: ["rooms", status],
    queryFn: async () => {
      const { data } = await client.get("/rooms", { params: { status } })
      return data
    },
  })
}

export function useRoomTypes() {
  return useQuery<RoomType[]>({
    queryKey: ["room-types"],
    queryFn: async () => {
      const { data } = await client.get("/rooms/types")
      return data
    },
  })
}

export function useAvailableRooms(checkIn: string, checkOut: string, roomTypeId = 0) {
  return useQuery<Room[]>({
    queryKey: ["rooms", "available", checkIn, checkOut, roomTypeId],
    queryFn: async () => {
      const { data } = await client.get("/rooms/available", {
        params: { checkIn, checkOut, roomTypeId },
      })
      return data
    },
    enabled: !!checkIn && !!checkOut,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (r: Partial<Room>) => {
      const { data } = await client.post("/rooms", r)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  })
}

export function useDeleteRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/rooms/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Room> & { id: number }) => {
      const { data: updated } = await client.put(`/rooms/${id}`, data)
      return updated
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  })
}
