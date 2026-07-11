import { useMutation } from "@tanstack/react-query"
import client from "@/api/client"

export function useUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append("file", file)
      const { data } = await client.post("/uploads", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data as { filename: string; url: string }
    },
  })
}
