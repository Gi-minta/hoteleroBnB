import { useAuth } from "@/context/AuthContext"
import { useState, useEffect, type FormEvent } from "react"
import { LogIn, UserPlus } from "lucide-react"

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")

  // Login fields
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Register fields
  const [regUsername, setRegUsername] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) window.location.href = "/admin"
  }, [isAuthenticated])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      window.location.href = "/admin"
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (regPassword !== regConfirm) {
      setError("Las contraseñas no coinciden")
      return
    }
    setLoading(true)
    try {
      await register(regUsername, regEmail, regPassword)
      window.location.href = "/admin"
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-verde to-verde-2 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-verde rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl" style={{ fontFamily: "'Fraunces', serif" }}>B&amp;B</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>B&amp;B Medellín</h1>
          <p className="text-ink-soft text-sm mt-1">
            {mode === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta de administrador"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button type="button" onClick={() => { setMode("login"); setError("") }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === "login" ? "bg-white text-verde shadow-sm" : "text-ink-soft"}`}>
            Iniciar sesión
          </button>
          <button type="button" onClick={() => { setMode("register"); setError("") }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === "register" ? "bg-white text-verde shadow-sm" : "text-ink-soft"}`}>
            Registrarme
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Usuario</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde/30 text-sm"
                placeholder="admin" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde/30 text-sm"
                placeholder="••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-verde text-white py-2.5 rounded-lg font-bold text-sm hover:bg-verde-2 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Ingresando..." : <><LogIn size={16} /> Ingresar</>}
            </button>
            <p className="text-xs text-ink-soft text-center mt-4">Demo: admin / admin123</p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Usuario</label>
              <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde/30 text-sm"
                placeholder="Nombre de usuario" required minLength={3} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Correo electrónico</label>
              <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde/30 text-sm"
                placeholder="tucorreo@ejemplo.com" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Contraseña</label>
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde/30 text-sm"
                placeholder="Mín. 6 caracteres" required minLength={6} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Confirmar contraseña</label>
              <input type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde/30 text-sm"
                placeholder="Repite la contraseña" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-verde text-white py-2.5 rounded-lg font-bold text-sm hover:bg-verde-2 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Creando cuenta..." : <><UserPlus size={16} /> Crear cuenta</>}
            </button>
          </form>
        )}

        <div className="text-center mt-5">
          <a href="/" className="text-xs text-ink-soft hover:text-verde transition">← Volver al sitio</a>
        </div>
      </div>
    </div>
  )
}
