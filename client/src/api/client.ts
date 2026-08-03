import axios from "axios"
import { hardRedirect } from "@/lib/paths"

// En dev VITE_API_URL queda vacía → "/api" (proxy de Vite). En GitHub Pages se
// define en el build para apuntar al backend público.
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      hardRedirect("/login")
    }
    return Promise.reject(err)
  }
)

export default client
