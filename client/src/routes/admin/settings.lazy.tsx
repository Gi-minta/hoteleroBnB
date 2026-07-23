import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/api/client"
import { Save, Palette, User, Lock, RotateCcw, CalendarClock } from "lucide-react"
import { PALETTE_GROUPS, PALETTE_KEYS, getDefaultPalette, applyPalette, paletteFromLandingContent, type PaletteColors } from "@/lib/palette"
import type { Configuracion } from "@/types"

function useConfiguracion() {
  return useQuery<Configuracion[]>({
    queryKey: ["configuracion"],
    queryFn: async () => {
      const { data } = await client.get("/config")
      return data
    },
  })
}

export default function SettingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data: paletteData } = useQuery({
    queryKey: ["palette"],
    queryFn: async () => {
      const { data } = await client.get("/landing/content")
      return data as { section: string; key: string; value: string }[]
    },
  })
  const { data: configData } = useConfiguracion()

  const [colors, setColors] = useState<PaletteColors>(getDefaultPalette())
  const [newUsername, setNewUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [config, setConfig] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) setNewUsername(user.username)
  }, [user])

  useEffect(() => {
    if (configData) {
      setConfig(Object.fromEntries(configData.map((c) => [c.clave, c.valor])))
    }
  }, [configData])

  const saveConfig = useMutation({
    mutationFn: async ({ clave, valor }: { clave: string; valor: string }) => {
      await client.put(`/config/admin/${clave}`, { valor })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["configuracion"] }); setMsg("Configuración guardada") },
    onError: (err: any) => setMsg(err.response?.data?.error || "Error"),
  })

  useEffect(() => {
    if (paletteData) {
      const initial = paletteFromLandingContent(paletteData)
      setColors(initial)
      applyPalette(initial)
    }
  }, [paletteData])

  const savePalette = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(colors)) {
        await client.post("/landing/admin/content", { section: "palette", key, value })
      }
    },
    onSuccess: () => { applyPalette(colors); setMsg("Paleta guardada — se aplicó en todo el sitio, incluida la landing pública") }
  })

  const changeUsername = useMutation({
    mutationFn: async () => {
      const { data } = await client.put("/auth/username", { newUsername })
      return data
    },
    onSuccess: () => setMsg("Usuario actualizado"),
    onError: (err: any) => setMsg(err.response?.data?.error || "Error"),
  })

  const changePassword = useMutation({
    mutationFn: async () => {
      const { data } = await client.put("/auth/password", { currentPassword, newPassword })
      return data
    },
    onSuccess: () => { setCurrentPassword(""); setNewPassword(""); setMsg("Contraseña actualizada") },
    onError: (err: any) => setMsg(err.response?.data?.error || "Error"),
  })

  const resetPalette = () => {
    const defaults = getDefaultPalette()
    setColors(defaults)
    applyPalette(defaults)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      {msg && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4 flex items-center justify-between">
          {msg} <button onClick={() => setMsg("")} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      <div className="space-y-6">
        {/* Paleta de colores */}
        <div className="bg-white rounded-xl border border-ink/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={20} className="text-verde" />
            <h2 className="font-bold">Paleta de colores</h2>
            <button onClick={resetPalette} className="ml-auto text-xs text-ink-soft hover:text-fucsia flex items-center gap-1 transition">
              <RotateCcw size={12} /> Restaurar
            </button>
          </div>
          {/* Selector de grupos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {PALETTE_GROUPS.map((g) => {
              const isActive = PALETTE_GROUPS.some((grp) => grp.name === g.name &&
                Object.entries(grp.colors).every(([k, v]) => colors[k] === v))
              return (
                <button key={g.name} onClick={() => { setColors(g.colors); applyPalette(g.colors) }}
                  className={`text-left p-3 rounded-xl border-2 transition ${isActive ? "border-verde bg-verde/5" : "border-ink/10 hover:border-verde/40"}`}>
                  <div className="flex gap-1 mb-2">
                    {Object.values(g.colors).slice(0, 5).map((c, i) => (
                      <span key={i} className="w-5 h-5 rounded-full border border-white/30" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-sm font-bold">{g.name}</div>
                  <div className="text-xs text-ink-soft">{g.desc}</div>
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PALETTE_KEYS.map((p) => (
              <div key={p.key}>
                <label className="text-xs font-medium text-ink-soft block mb-1">{p.label}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={colors[p.key] || p.default}
                    onChange={(e) => {
                      const next = { ...colors, [p.key]: e.target.value }
                      setColors(next)
                      applyPalette(next)
                    }}
                    className="w-10 h-10 rounded-lg border border-ink/10 cursor-pointer" />
                  <input value={colors[p.key] || p.default}
                    onChange={(e) => {
                      const next = { ...colors, [p.key]: e.target.value }
                      setColors(next)
                      applyPalette(next)
                    }}
                    className="flex-1 px-3 py-2 border border-ink/10 rounded-lg text-sm font-mono" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => savePalette.mutate()} disabled={savePalette.isPending}
            className="mt-4 flex items-center gap-2 px-5 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
            <Save size={14} /> {savePalette.isPending ? "Guardando..." : "Guardar paleta"}
          </button>
          <p className="text-xs text-ink-soft mt-2">Los colores se aplican en tiempo real. Los cambios persisten al recargar.</p>
        </div>

        {/* Configuración general / Google Calendar */}
        <div className="bg-white rounded-xl border border-ink/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CalendarClock size={20} className="text-verde" />
            <h2 className="font-bold">Configuración general</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Nombre del hostal</label>
              <div className="flex items-center gap-3">
                <input value={config.hotelName ?? ""} onChange={(e) => setConfig({ ...config, hotelName: e.target.value })}
                  className="flex-1 px-3 py-2 border border-ink/10 rounded-lg text-sm" />
                <button onClick={() => saveConfig.mutate({ clave: "hotelName", valor: config.hotelName ?? "" })} disabled={saveConfig.isPending}
                  className="px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">Guardar</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-1">Hora check-in por defecto</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={config.checkInDefaultTime ?? "15:00"}
                    onChange={(e) => setConfig({ ...config, checkInDefaultTime: e.target.value })}
                    className="flex-1 px-3 py-2 border border-ink/10 rounded-lg text-sm" />
                  <button onClick={() => saveConfig.mutate({ clave: "checkInDefaultTime", valor: config.checkInDefaultTime ?? "15:00" })} disabled={saveConfig.isPending}
                    className="px-3 py-2 bg-verde text-white rounded-lg text-xs font-bold hover:bg-verde-2 transition disabled:opacity-50">✓</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-1">Hora check-out por defecto</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={config.checkOutDefaultTime ?? "12:00"}
                    onChange={(e) => setConfig({ ...config, checkOutDefaultTime: e.target.value })}
                    className="flex-1 px-3 py-2 border border-ink/10 rounded-lg text-sm" />
                  <button onClick={() => saveConfig.mutate({ clave: "checkOutDefaultTime", valor: config.checkOutDefaultTime ?? "12:00" })} disabled={saveConfig.isPending}
                    className="px-3 py-2 bg-verde text-white rounded-lg text-xs font-bold hover:bg-verde-2 transition disabled:opacity-50">✓</button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-ink/5">
              <div>
                <p className="text-sm font-medium">Sincronizar reservas con Google Calendar</p>
                <p className="text-xs text-ink-soft">Requiere credenciales de la cuenta de servicio configuradas en el servidor (variables de entorno)</p>
              </div>
              <button
                onClick={() => {
                  const next = config.googleSyncEnabled === "true" ? "false" : "true"
                  setConfig({ ...config, googleSyncEnabled: next })
                  saveConfig.mutate({ clave: "googleSyncEnabled", valor: next })
                }}
                className={`relative w-11 h-6 rounded-full transition ${config.googleSyncEnabled === "true" ? "bg-verde" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${config.googleSyncEnabled === "true" ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Cambiar usuario */}
        <div className="bg-white rounded-xl border border-ink/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} className="text-verde" />
            <h2 className="font-bold">Cambiar nombre de usuario</h2>
          </div>
          <div className="flex items-center gap-3">
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="Nuevo usuario" />
            <button onClick={() => changeUsername.mutate()} disabled={changeUsername.isPending}
              className="px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
              {changeUsername.isPending ? "..." : "Actualizar"}
            </button>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-xl border border-ink/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={20} className="text-verde" />
            <h2 className="font-bold">Cambiar contraseña</h2>
          </div>
          <div className="space-y-3">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="Contraseña actual" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="Nueva contraseña (mín. 6 caracteres)" />
            <button onClick={() => changePassword.mutate()} disabled={changePassword.isPending || !currentPassword || !newPassword}
              className="px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
              {changePassword.isPending ? "..." : "Cambiar contraseña"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
