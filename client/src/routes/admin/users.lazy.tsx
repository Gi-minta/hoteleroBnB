import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import { UserPlus, Users } from "lucide-react"

interface AppUser {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

function useUsers() {
  return useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await client.get("/auth/users")
      return data
    },
  })
}

function useRegisterUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (u: { username: string; email: string; password: string }) => {
      const { data } = await client.post("/auth/register", u)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => client.delete(`/auth/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const register = useRegisterUser()
  const remove = useDeleteUser()

  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await register.mutateAsync({ username, email, password })
      setUsername("")
      setEmail("")
      setPassword("")
      setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition">
          <UserPlus size={16} /> {showForm ? "Cancelar" : "Nuevo usuario"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleRegister} className="bg-white rounded-xl border border-ink/5 p-6 mb-6">
          <h3 className="font-bold mb-4">Registrar nuevo usuario</h3>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Usuario</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="usuario" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="email@ejemplo.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="••••••" />
            </div>
          </div>
          <button type="submit" disabled={register.isPending}
            className="mt-4 px-5 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
            {register.isPending ? "Registrando..." : "Registrar"}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-soft">Cargando...</p>
      ) : users?.length ? (
        <div className="bg-white rounded-xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-ink-soft text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Usuario</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rol</th>
                <th className="text-left px-4 py-3">Creado</th>
                <th className="text-right px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-verde/10 text-verde px-2 py-1 rounded-full font-medium">{u.role}</span></td>
                  <td className="px-4 py-3 text-ink-soft">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm("¿Eliminar usuario?")) remove.mutate(u.id) }}
                      className="text-xs text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay usuarios registrados</p>
        </div>
      )}
    </div>
  )
}
