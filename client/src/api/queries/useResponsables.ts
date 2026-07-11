import { useQuery } from "@tanstack/react-query"
import client from "@/api/client"
import type { ResponsablePago } from "@/types"

export function useResponsables(search = "") {
  return useQuery<ResponsablePago[]>({
    queryKey: ["responsables", search],
    queryFn: async () => {
      const { data } = await client.get("/responsables", { params: { search } })
      return data
    },
  })
}
