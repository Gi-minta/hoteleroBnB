import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User } from "@/types"
import client from "@/api/client"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))

  const login = useCallback(async (username: string, password: string) => {
    const res = await client.post("/auth/login", { username, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await client.post("/auth/register", { username, email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    window.location.href = "/"
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
