import { useState, type ChangeEvent, type FormEvent } from "react"
import { useTr } from "@/context/I18nContext"
import { useCreateRegistro, useUploadRegistroDoc } from "@/api/queries/useRegistros"
import SignaturePad from "@/components/SignaturePad"

const inputCls = "w-full px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm"

type Tr = (es: string, en: string) => string

interface Comp {
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  esMenor: boolean
  permisoUrl: string
  docUrl: string
}

const emptyComp = (): Comp => ({ nombres: "", apellidos: "", tipoDocumento: "CC", numeroDocumento: "", esMenor: false, permisoUrl: "", docUrl: "" })

function TipoDocSelect({ value, onChange, tr }: { value: string; onChange: (v: string) => void; tr: Tr }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="CC">{tr("Cédula de ciudadanía", "Citizenship ID (CC)")}</option>
      <option value="CE">{tr("Cédula de extranjería", "Foreigner ID (CE)")}</option>
      <option value="PA">{tr("Pasaporte", "Passport")}</option>
    </select>
  )
}

// Campo de archivo: sube al endpoint público y guarda la URL resultante.
function FileField({ label, value, onChange, tr }: { label: string; value: string; onChange: (url: string) => void; tr: Tr }) {
  const upload = useUploadRegistroDoc()
  const isImg = /\.(jpe?g|png|webp|heic|heif)$/i.test(value)

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url } = await upload.mutateAsync(file)
      onChange(url)
    } catch {
      /* el error se muestra abajo con upload.isError */
    }
    e.target.value = ""
  }

  return (
    <div>
      <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{label}</label>
      {value ? (
        <div className="flex items-center gap-2">
          {isImg
            ? <img src={value} alt="" className="w-12 h-12 object-cover rounded border border-ink/10" />
            : <span className="text-xl">📄</span>}
          <a href={value} target="_blank" rel="noopener" className="text-xs text-verde underline truncate max-w-[140px]">{tr("Ver archivo", "View file")}</a>
          <button type="button" onClick={() => onChange("")} className="text-xs text-rojo hover:underline">{tr("Quitar", "Remove")}</button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-ink/25 dark:border-white/20 rounded-lg text-xs cursor-pointer hover:border-verde/50 transition">
          <input type="file" accept="image/*,.pdf" onChange={onPick} className="hidden" />
          {upload.isPending ? tr("Subiendo…", "Uploading…") : tr("Seleccionar archivo", "Choose file")}
        </label>
      )}
      {upload.isError && <p className="text-xs text-rojo mt-1">{tr("No se pudo subir el archivo.", "Couldn't upload the file.")}</p>}
    </div>
  )
}

// Documento a leer y aceptar (reglamento, ESCNNA, contrato).
function AcceptDoc({ checked, onChange, title, body, tr }: { checked: boolean; onChange: (v: boolean) => void; title: string; body: string; tr: Tr }) {
  return (
    <div className="border border-ink/10 dark:border-white/10 rounded-lg p-3">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-[#3F6B4B]" />
        <span className="text-sm">{tr("He leído y acepto", "I have read and accept")} <strong>{title}</strong></span>
      </label>
      <details className="mt-1 ml-6">
        <summary className="text-xs text-verde cursor-pointer">{tr("Ver documento", "View document")}</summary>
        <p className="text-xs text-ink-soft dark:text-[#A7B6AB] mt-1 whitespace-pre-line">{body}</p>
      </details>
    </div>
  )
}

export default function RegistroHuespedModal({ onClose }: { onClose: () => void }) {
  const tr = useTr()
  const createRegistro = useCreateRegistro()
  const [localError, setLocalError] = useState("")
  const [form, setForm] = useState({
    numeroReserva: "", numeroHabitacion: "", fechaLlegada: "", fechaSalida: "",
    nombres: "", apellidos: "", tipoDocumento: "CC", numeroDocumento: "", fechaNacimiento: "",
    email: "", telefono: "", profesion: "", origen: "",
    docPrincipalUrl: "",
    autorizaInfo: true,
    aceptaReglamento: false, aceptaEscnna: false, aceptaContrato: false,
    firmaUrl: "",
  })
  const [acompanantes, setAcompanantes] = useState<Comp[]>([])

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }))
  const addComp = () => setAcompanantes((a) => [...a, emptyComp()])
  const removeComp = (i: number) => setAcompanantes((a) => a.filter((_, idx) => idx !== i))
  const updateComp = (i: number, field: keyof Comp, value: string | boolean) =>
    setAcompanantes((a) => a.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.numeroDocumento.trim() || !form.email.trim() || !form.telefono.trim()) {
      setLocalError(tr("Completa nombres, apellidos, documento, correo y teléfono.", "Fill in first name, last name, document, email and phone."))
      return
    }
    if (!form.aceptaReglamento || !form.aceptaEscnna || !form.aceptaContrato) {
      setLocalError(tr("Debes aceptar el reglamento, la política ESCNNA y el contrato.", "You must accept the house rules, ESCNNA policy and contract."))
      return
    }
    if (!form.firmaUrl) {
      setLocalError(tr("Por favor firma en el recuadro.", "Please sign in the box."))
      return
    }

    const documentosIdentidad = [
      ...(form.docPrincipalUrl ? [{ persona: `${form.nombres} ${form.apellidos}`.trim(), url: form.docPrincipalUrl }] : []),
      ...acompanantes.filter((a) => a.docUrl).map((a) => ({ persona: `${a.nombres} ${a.apellidos}`.trim(), url: a.docUrl })),
    ]

    createRegistro.mutate({
      numeroReserva: form.numeroReserva,
      numeroHabitacion: form.numeroHabitacion,
      fechaLlegada: form.fechaLlegada || undefined,
      fechaSalida: form.fechaSalida || undefined,
      nombres: form.nombres,
      apellidos: form.apellidos,
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento,
      fechaNacimiento: form.fechaNacimiento || undefined,
      email: form.email,
      telefono: form.telefono,
      profesion: form.profesion,
      origen: form.origen,
      numeroPersonas: 1 + acompanantes.length,
      acompanantes: acompanantes.map((a) => ({
        nombres: a.nombres, apellidos: a.apellidos, tipoDocumento: a.tipoDocumento,
        numeroDocumento: a.numeroDocumento, esMenor: a.esMenor, permisoUrl: a.permisoUrl,
      })),
      documentosIdentidad,
      autorizaInfo: form.autorizaInfo,
      aceptaReglamento: form.aceptaReglamento,
      aceptaEscnna: form.aceptaEscnna,
      aceptaContrato: form.aceptaContrato,
      firmaUrl: form.firmaUrl,
    })
  }

  const sectionTitle = (t: string) => (
    <h4 className="text-xs tracking-widest uppercase text-verde font-bold mt-5 mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>{t}</h4>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white text-ink dark:bg-[#1E2A22] dark:text-[#ECF1EC] rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {createRegistro.isSuccess ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-verde/10 text-verde flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Fraunces', serif" }}>{tr("¡Registro enviado!", "Registration submitted!")}</h3>
            <p className="text-sm text-ink-soft dark:text-[#A7B6AB] mb-5">
              {tr(`Gracias, ${form.nombres}. Recibimos tu registro de huésped y lo revisaremos. Te contactaremos a ${form.email} si necesitamos algo más.`,
                  `Thank you, ${form.nombres}. We received your guest registration and will review it. We'll contact you at ${form.email} if we need anything else.`)}
            </p>
            <button onClick={onClose} className="bg-verde text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-verde-2 transition">{tr("Cerrar", "Close")}</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-xl" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Registro de huésped", "Guest registration")}</h3>
              <button onClick={onClose} className="text-ink-soft hover:text-fucsia text-xl leading-none">✕</button>
            </div>
            <p className="text-sm text-ink-soft dark:text-[#A7B6AB] mb-2">
              {tr("Completa tu ficha de registro (pre check-in). Los campos de reserva son opcionales si aún no tienes una.",
                  "Complete your registration card (pre check-in). Booking fields are optional if you don't have one yet.")}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Datos de la reserva */}
              {sectionTitle(tr("Datos de la reserva (opcional)", "Booking details (optional)"))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Número de reserva", "Booking number")}</label>
                  <input value={form.numeroReserva} onChange={(e) => set("numeroReserva", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Número de habitación", "Room number")}</label>
                  <input value={form.numeroHabitacion} onChange={(e) => set("numeroHabitacion", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Fecha de llegada", "Arrival date")}</label>
                  <input type="date" value={form.fechaLlegada} onChange={(e) => set("fechaLlegada", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Fecha de salida", "Departure date")}</label>
                  <input type="date" value={form.fechaSalida} onChange={(e) => set("fechaSalida", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Huésped principal */}
              {sectionTitle(tr("Huésped principal", "Main guest"))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Nombres", "First names")} *</label>
                  <input required value={form.nombres} onChange={(e) => set("nombres", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Apellidos", "Last names")} *</label>
                  <input required value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Tipo de documento", "Document type")}</label>
                  <TipoDocSelect value={form.tipoDocumento} onChange={(v) => set("tipoDocumento", v)} tr={tr} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Número de documento", "Document number")} *</label>
                  <input required value={form.numeroDocumento} onChange={(e) => set("numeroDocumento", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Fecha de nacimiento", "Date of birth")}</label>
                  <input type="date" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Profesión", "Occupation")}</label>
                  <input value={form.profesion} onChange={(e) => set("profesion", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Correo electrónico", "Email")} *</label>
                  <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Teléfono", "Phone")} *</label>
                  <input required value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Origen (ciudad/país)", "Origin (city/country)")}</label>
                  <input value={form.origen} onChange={(e) => set("origen", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <FileField label={tr("Foto del documento de identidad", "Photo of ID document")} value={form.docPrincipalUrl} onChange={(url) => set("docPrincipalUrl", url)} tr={tr} />
              </div>

              {/* Acompañantes */}
              {sectionTitle(tr("Acompañantes", "Additional guests"))}
              {acompanantes.length === 0 && (
                <p className="text-xs text-ink-soft dark:text-[#A7B6AB]">{tr("Si viajas con más personas, agrégalas aquí.", "If you're traveling with others, add them here.")}</p>
              )}
              <div className="space-y-3">
                {acompanantes.map((c, i) => (
                  <div key={i} className="border border-ink/10 dark:border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-ink-soft dark:text-[#A7B6AB]">{tr("Persona", "Person")} {i + 2}</span>
                      <button type="button" onClick={() => removeComp(i)} className="text-xs text-rojo hover:underline">{tr("Quitar", "Remove")}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder={tr("Nombres", "First names")} value={c.nombres} onChange={(e) => updateComp(i, "nombres", e.target.value)} className={inputCls} />
                      <input placeholder={tr("Apellidos", "Last names")} value={c.apellidos} onChange={(e) => updateComp(i, "apellidos", e.target.value)} className={inputCls} />
                      <TipoDocSelect value={c.tipoDocumento} onChange={(v) => updateComp(i, "tipoDocumento", v)} tr={tr} />
                      <input placeholder={tr("Número de documento", "Document number")} value={c.numeroDocumento} onChange={(e) => updateComp(i, "numeroDocumento", e.target.value)} className={inputCls} />
                    </div>
                    <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={c.esMenor} onChange={(e) => updateComp(i, "esMenor", e.target.checked)} className="accent-[#3F6B4B]" />
                      {tr("Es menor de edad", "Is a minor")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <FileField label={tr("Foto del documento", "Photo of ID document")} value={c.docUrl} onChange={(url) => updateComp(i, "docUrl", url)} tr={tr} />
                      {c.esMenor && (
                        <FileField label={tr("Permiso notarizado del menor", "Notarized permit for minor")} value={c.permisoUrl} onChange={(url) => updateComp(i, "permisoUrl", url)} tr={tr} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addComp} className="mt-2 text-sm font-bold text-verde hover:underline">+ {tr("Agregar acompañante", "Add guest")}</button>

              {/* Autorización y documentos */}
              {sectionTitle(tr("Autorización y documentos", "Authorization and documents"))}
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
                <input type="checkbox" checked={form.autorizaInfo} onChange={(e) => set("autorizaInfo", e.target.checked)} className="accent-[#3F6B4B]" />
                {tr("Autorizo el envío de información y promociones", "I authorize sending me information and promotions")}
              </label>
              <div className="space-y-2">
                <AcceptDoc checked={form.aceptaReglamento} onChange={(v) => set("aceptaReglamento", v)} tr={tr}
                  title={tr("el Reglamento de la casa", "the House Rules")}
                  body={tr("Normas de convivencia, horarios de check-in (15:00) y check-out (11:00), cuidado de las áreas comunes, prohibición de fumar dentro de los apartamentos y respeto a los demás huéspedes.",
                          "House rules, check-in (3:00 p.m.) and check-out (11:00 a.m.) times, care of common areas, no smoking inside the apartments and respect for other guests.")} />
                <AcceptDoc checked={form.aceptaEscnna} onChange={(v) => set("aceptaEscnna", v)} tr={tr}
                  title={tr("la Política de prevención ESCNNA", "the ESCNNA prevention policy")}
                  body={tr("Rechazamos la explotación sexual comercial de niñas, niños y adolescentes (Ley 679 de 2001). El establecimiento reporta cualquier actividad sospechosa a las autoridades.",
                          "We reject the commercial sexual exploitation of children and adolescents (Colombian Law 679 of 2001). The establishment reports any suspicious activity to the authorities.")} />
                <AcceptDoc checked={form.aceptaContrato} onChange={(v) => set("aceptaContrato", v)} tr={tr}
                  title={tr("el Contrato de arrendamiento de estancia corta", "the short-stay lease agreement")}
                  body={tr("Contrato de hospedaje/arrendamiento de estancia corta que regula el uso del inmueble, la duración de la estadía, el pago y las responsabilidades de las partes.",
                          "Short-stay lodging/lease agreement governing the use of the property, length of stay, payment and the responsibilities of both parties.")} />
              </div>

              {/* Firma */}
              {sectionTitle(tr("Firma", "Signature"))}
              <SignaturePad value={form.firmaUrl} onChange={(dataUrl) => set("firmaUrl", dataUrl)} label={tr("Firma en el recuadro", "Sign in the box")} />

              {(localError || createRegistro.isError) && (
                <p className="text-sm text-rojo mt-4">
                  {localError || tr("Ocurrió un error al enviar tu registro. Intenta de nuevo.", "Something went wrong submitting your registration. Please try again.")}
                </p>
              )}

              <button type="submit" disabled={createRegistro.isPending}
                className="w-full mt-5 bg-verde text-white py-3 rounded-full text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
                {createRegistro.isPending ? tr("Enviando…", "Submitting…") : tr("Enviar registro", "Submit registration")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
