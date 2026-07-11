import { useState, useRef, useEffect } from "react"
import { useCreateReservation } from "@/api/queries/useReservations"
import { useGuests, useCreateGuest } from "@/api/queries/useGuests"
import { useAvailableRooms, useRooms } from "@/api/queries/useRooms"
import { useResponsables } from "@/api/queries/useResponsables"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Plus, User, CalendarDays, DoorOpen, FileText, Upload } from "lucide-react"
import SignaturePad from "@/components/SignaturePad"
import client from "@/api/client"
import type { Guest, Room } from "@/types"

const TIPOS_DOC = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "Pasaporte", label: "Pasaporte" },
]

export default function NewReservationPage() {
  const nav = useNavigate()
  const createReservation = useCreateReservation()
  const createGuest = useCreateGuest()
  const { data: responsables } = useResponsables()
  const { data: allRooms } = useRooms()

  const [step, setStep] = useState(1)
  const [guestSearch, setGuestSearch] = useState("")
  const { data: guests } = useGuests(guestSearch)

  // Guest fields
  const [guestId, setGuestId] = useState<number | null>(null)
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("CC")
  const [documento, setDocumento] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [profesion, setProfesion] = useState("")

  // Reservation fields
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [selectedRooms, setSelectedRooms] = useState<any[]>([])
  const [responsablePagoId, setResponsablePagoId] = useState<number | null>(null)
  const [notas, setNotas] = useState("")
  const [origen, setOrigen] = useState("")
  const [numPersonas, setNumPersonas] = useState(1)
  const [acompanantes, setAcompanantes] = useState<{ nombre: string; tipoDoc: string; documento: string; permiso: boolean }[]>([])
  const [autorizaInfo, setAutorizaInfo] = useState(false)

  // Si se viene desde "Solicitudes" (pre-registro web), precargar datos del huésped
  useEffect(() => {
    const raw = sessionStorage.getItem("prefillGuest")
    if (!raw) return
    try {
      const p = JSON.parse(raw)
      if (p.nombre) setNombre(p.nombre)
      if (p.apellido) setApellido(p.apellido)
      if (p.email) setEmail(p.email)
      if (p.telefono) setTelefono(p.telefono)
      if (p.checkIn) setCheckIn(p.checkIn)
      if (p.checkOut) setCheckOut(p.checkOut)
      if (p.numPersonas) setNumPersonas(p.numPersonas)
    } catch {
      // ignorar datos corruptos
    } finally {
      sessionStorage.removeItem("prefillGuest")
    }
  }, [])

  // File uploads
  const [fotosDocs, setFotosDocs] = useState<string[]>([])
  const [docReglamento, setDocReglamento] = useState<string | null>(null)
  const [docEscnna, setDocEscnna] = useState<string | null>(null)
  const [docContrato, setDocContrato] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Signature
  const [firma, setFirma] = useState("")

  const [submitting, setSubmitting] = useState(false)

  const { data: availableRooms } = useAvailableRooms(checkIn, checkOut)

  const handleSelectGuest = (g: Guest) => {
    setGuestId(g.id)
    setNombre(g.nombre)
    setApellido(g.apellido)
    setTipoDocumento(g.tipoDocumento || "CC")
    setDocumento(g.documento)
    setEmail(g.email)
    setTelefono(g.telefono)
    setFechaNacimiento(g.fechaNacimiento ? g.fechaNacimiento.split("T")[0] : "")
    setProfesion(g.profesion || "")
  }

  const handleCreateAndSelect = async () => {
    if (!nombre.trim() || !apellido.trim() || !documento.trim()) return
    try {
      const guest = await createGuest.mutateAsync({
        nombre, apellido, tipoDocumento, documento,
        email, telefono,
        profesion,
        fechaNacimiento: fechaNacimiento || null,
      } as any)
      setGuestId(guest.id)
    } catch (err: any) {
      alert(err?.response?.data?.error || "Error al crear huésped")
    }
  }

  const handleUpload = async (file: File, onSuccess: (url: string) => void) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await client.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onSuccess(data.url)
    } catch {
      alert("Error al subir archivo")
    } finally { setUploading(false) }
  }

  const toggleRoom = (room: Room) => {
    setSelectedRooms((prev) => {
      const exists = prev.find((r: any) => r.roomId === room.id)
      if (exists) return prev.filter((r: any) => r.roomId !== room.id)
      const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
      return [...prev, { roomId: room.id, pricePerNight: room.roomType?.precioBase || 0, nights: Math.max(1, nights) }]
    })
  }

  const totalAmount = selectedRooms.reduce((sum: number, r: any) => sum + r.pricePerNight * r.nights, 0)

  const handleSubmit = async () => {
    if (!guestId || !checkIn || !checkOut || selectedRooms.length === 0) return
    setSubmitting(true)
    try {
      await createReservation.mutateAsync({
        guestId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        rooms: selectedRooms,
        responsablePagoId,
        totalAmount,
        notas: JSON.stringify({
          profesion, origen, numPersonas, autorizaInfo,
          acompanantes, fotosDocs, docReglamento, docEscnna, docContrato,
          firma: firma ? "Recolectada" : "No",
          notas,
        }),
      })
      nav({ to: "/admin/reservations" })
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => nav({ to: "/admin/reservations" })} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold">Nueva Reserva</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["Huésped", "Habitaciones", "Detalles", "Documentos", "Confirmar"].map((s, i) => (
          <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${step >= i + 1 ? "bg-verde text-white" : "bg-gray-100 text-ink-soft"}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-ink/5 p-6 md:p-8">

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2"><User size={18} /> Huésped</h2>

            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Buscar huésped existente</label>
              <input value={guestSearch} onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30"
                placeholder="Nombre, apellido o documento..." />
              {guestSearch && guests && (
                <div className="border border-ink/10 rounded-lg divide-y max-h-40 overflow-y-auto mt-1">
                  {guests.length > 0 ? guests.map((g) => (
                    <button key={g.id} type="button" onClick={() => handleSelectGuest(g)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-verde/5 transition ${guestId === g.id ? "bg-verde/10 font-semibold" : ""}`}>
                      {g.nombre} {g.apellido} — {g.documento}
                    </button>
                  )) : <div className="px-4 py-3 text-sm text-ink-soft">Sin resultados</div>}
                </div>
              )}
            </div>

            {!guestId && (
              <>
                <div className="border-t border-ink/5 pt-4">
                  <h3 className="text-sm font-semibold mb-4">Datos del nuevo huésped</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Tipo de documento</label>
                      <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30">
                        {TIPOS_DOC.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">N° documento *</label>
                      <input value={documento} onChange={(e) => setDocumento(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Nombres *</label>
                      <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Apellidos *</label>
                      <input value={apellido} onChange={(e) => setApellido(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Teléfono</label>
                      <input value={telefono} onChange={(e) => setTelefono(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Fecha de nacimiento</label>
                      <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-soft block mb-1">Profesión</label>
                      <input value={profesion} onChange={(e) => setProfesion(e.target.value)}
                        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                  </div>
                  <button onClick={handleCreateAndSelect}
                    disabled={!nombre.trim() || !apellido.trim() || !documento.trim() || createGuest.isPending}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
                    <Plus size={16} /> {createGuest.isPending ? "Guardando..." : "Crear y seleccionar huésped"}
                  </button>
                </div>
              </>
            )}

            {guestId && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{nombre} {apellido}</span>
                  <span className="text-ink-soft ml-2">{documento}</span>
                  {email && <span className="text-ink-soft ml-2">· {email}</span>}
                </div>
                <button onClick={() => { setGuestId(null) }} className="text-red-500 hover:text-red-700 text-sm">Cambiar</button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2"><CalendarDays size={18} /> Fechas y Habitaciones</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-1">Fecha de llegada *</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-1">Fecha de salida *</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
              </div>
            </div>
            {checkIn && checkOut && (
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-2">Seleccionar habitaciones</label>
                <div className="grid gap-2">
                  {(availableRooms || allRooms || []).map((room) => {
                    const selected = selectedRooms.find((r: any) => r.roomId === room.id)
                    return (
                      <button key={room.id} type="button" onClick={() => toggleRoom(room)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-sm transition text-left ${selected ? "border-verde bg-verde/5" : "border-ink/10 hover:border-verde/30"}`}>
                        <div className="flex items-center gap-3">
                          <DoorOpen size={16} className="text-verde" />
                          <div>
                            <span className="font-medium">{room.numero}</span>
                            <span className="text-ink-soft ml-2 text-xs">{room.roomType?.nombre}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">${room.roomType?.precioBase?.toLocaleString()}/noche</span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${selected ? "bg-verde border-verde" : "border-gray-300"}`}>
                            {selected && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  {(!availableRooms || availableRooms.length === 0) && (!allRooms || allRooms.length === 0) && (
                    <p className="text-sm text-ink-soft text-center py-4">Ingrese fechas para ver disponibilidad</p>
                  )}
                </div>
              </div>
            )}
            {selectedRooms.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs text-green-700 font-medium mb-1">{selectedRooms.length} habitación(es)</p>
                <p className="text-lg font-bold">Total: ${totalAmount.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2"><FileText size={18} /> Detalles de la reserva</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-1">Origen</label>
                <input value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Ciudad, País"
                  className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-1">N° de personas</label>
                <input type="number" min={1} value={numPersonas} onChange={(e) => setNumPersonas(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
              </div>
            </div>

            {numPersonas > 1 && (
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-2">Acompañantes</label>
                {Array.from({ length: numPersonas - 1 }).map((_, i) => {
                  const a = acompanantes[i] || { nombre: "", tipoDoc: "CC", documento: "", permiso: false }
                  return (
                    <div key={i} className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-50 rounded-lg items-start">
                      <input placeholder="Nombre y apellido" value={a.nombre}
                        onChange={(e) => { const c = [...acompanantes]; c[i] = { ...a, nombre: e.target.value }; setAcompanantes(c) }}
                        className="flex-1 min-w-[180px] px-3 py-2 border border-ink/10 rounded-lg text-sm" />
                      <select value={a.tipoDoc}
                        onChange={(e) => { const c = [...acompanantes]; c[i] = { ...a, tipoDoc: e.target.value }; setAcompanantes(c) }}
                        className="px-3 py-2 border border-ink/10 rounded-lg text-sm">
                        {TIPOS_DOC.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <input placeholder="Documento" value={a.documento}
                        onChange={(e) => { const c = [...acompanantes]; c[i] = { ...a, documento: e.target.value }; setAcompanantes(c) }}
                        className="flex-1 min-w-[140px] px-3 py-2 border border-ink/10 rounded-lg text-sm" />
                      <label className="flex items-center gap-2 text-xs text-ink-soft whitespace-nowrap">
                        <input type="checkbox" checked={a.permiso}
                          onChange={(e) => { const c = [...acompanantes]; c[i] = { ...a, permiso: e.target.checked }; setAcompanantes(c) }}
                          className="w-4 h-4 rounded border-gray-300 text-verde" />
                        Permiso menor
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink-soft block mb-2">Responsable de pago (opcional)</label>
              <select value={responsablePagoId || ""} onChange={(e) => setResponsablePagoId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30">
                <option value="">Sin responsable</option>
                {responsables?.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.razonSocial} — {r.cuit}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={autorizaInfo} onChange={(e) => setAutorizaInfo(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-verde" />
              Autoriza envío de información
            </label>

            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Notas adicionales</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30 resize-none" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2"><Upload size={18} /> Documentos y Firma</h2>

            <div>
              <label className="text-xs font-medium text-ink-soft block mb-2">Fotos de documentos de identidad</label>
              <input type="file" accept="image/*" multiple disabled={uploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  files.forEach((f) => handleUpload(f, (url) => setFotosDocs((prev) => [...prev, url])))
                }}
                className="w-full text-sm" />
              {fotosDocs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fotosDocs.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt={`doc-${i}`} className="w-16 h-16 object-cover rounded-lg border" />
                      <button onClick={() => setFotosDocs((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-2">Reglamento de la casa</label>
                <input type="file" accept=".pdf,.jpg,.png" disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f, (url) => setDocReglamento(url))
                  }}
                  className="w-full text-sm" />
                {docReglamento && <span className="text-xs text-green-600">✓ Subido</span>}
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-2">Política ESCNNA</label>
                <input type="file" accept=".pdf,.jpg,.png" disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f, (url) => setDocEscnna(url))
                  }}
                  className="w-full text-sm" />
                {docEscnna && <span className="text-xs text-green-600">✓ Subido</span>}
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft block mb-2">Contrato de estancia corta</label>
                <input type="file" accept=".pdf,.jpg,.png" disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f, (url) => setDocContrato(url))
                  }}
                  className="w-full text-sm" />
                {docContrato && <span className="text-xs text-green-600">✓ Subido</span>}
              </div>
            </div>

            <SignaturePad value={firma} onChange={setFirma} label="Firma del huésped" />

            {uploading && <p className="text-xs text-verde">Subiendo archivos...</p>}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2">✅ Confirmar reserva</h2>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">Huésped:</span><span className="font-medium">{nombre} {apellido}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Documento:</span><span>{tipoDocumento} {documento}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Email / Tel:</span><span>{email} / {telefono}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Check-in / out:</span><span>{new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Habitaciones:</span><span>{selectedRooms.length}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Personas:</span><span>{numPersonas}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Total:</span><span className="font-bold text-lg">${totalAmount.toLocaleString()}</span></div>
              {autorizaInfo && <div className="flex justify-between"><span className="text-ink-soft">Autoriza info:</span><span className="text-green-600">Sí</span></div>}
              {fotosDocs.length > 0 && <div className="flex justify-between"><span className="text-ink-soft">Docs foto:</span><span className="text-green-600">{fotosDocs.length} archivo(s)</span></div>}
              {docReglamento && <div className="flex justify-between"><span className="text-ink-soft">Reglamento:</span><span className="text-green-600">✓</span></div>}
              {docEscnna && <div className="flex justify-between"><span className="text-ink-soft">Política ESCNNA:</span><span className="text-green-600">✓</span></div>}
              {docContrato && <div className="flex justify-between"><span className="text-ink-soft">Contrato:</span><span className="text-green-600">✓</span></div>}
              {firma && <div className="flex justify-between"><span className="text-ink-soft">Firma:</span><span className="text-green-600">✓ Recolectada</span></div>}
            </div>
            {createReservation.isError && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-sm text-red-700">
                {(createReservation.error as any)?.response?.data?.error || "Error al crear la reserva"}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink/5">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-30 transition">
            <ArrowLeft size={16} /> Anterior
          </button>
          {step < 5 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !guestId) || (step === 2 && (selectedRooms.length === 0 || !checkIn || !checkOut))}
              className="flex items-center gap-2 px-5 py-2.5 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
              Siguiente
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition disabled:opacity-50">
              {submitting ? "Guardando..." : "Confirmar y crear reserva"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
