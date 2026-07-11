import { useState, useEffect } from "react"
import { Shield, Check, ArrowLeft, ArrowRight } from "lucide-react"
import { useEscnna, useUpsertEscnna } from "@/api/queries/useEscnna"
import type { EscnnaRecord } from "@/api/queries/useEscnna"

const STEPS = [
  { id: 1, title: "Promoción Responsable", icon: "📋" },
  { id: 2, title: "Reserva Segura", icon: "🔒" },
  { id: 3, title: "Recepción Cuidadosa", icon: "🏠" },
  { id: 4, title: "Estadía Protectora", icon: "👁️" },
  { id: 5, title: "Cierre", icon: "✅" },
]

function getStepData(records: EscnnaRecord[] | undefined, paso: number): { completed: boolean; data: Record<string, any> } {
  const step = records?.find((r) => r.paso === paso)
  if (!step) return { completed: false, data: {} }
  try {
    return { completed: step.completado, data: step.data ? JSON.parse(step.data) : {} }
  } catch {
    return { completed: step.completado, data: {} }
  }
}

export default function EscnnaChecklistPage() {
  const { data: records, isLoading } = useEscnna()
  const upsert = useUpsertEscnna()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const stepInfo = getStepData(records, currentStep)

  useEffect(() => {
    setFormData(stepInfo.data)
  }, [currentStep, records])

  const handleCheck = (key: string) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleText = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const saveAndAdvance = () => {
    upsert.mutate(
      { paso: currentStep, completado: true, data: formData },
      { onSuccess: () => { setFormData({}); if (currentStep < 5) setCurrentStep(currentStep + 1) } }
    )
  }

  const saveAndFinish = () => {
    upsert.mutate(
      { paso: currentStep, completado: true, data: formData }
    )
  }

  const progress = records?.filter((r) => r.completado).length ?? 0
  const progressPct = (progress / 5) * 100

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-verde" />
        <h1 className="text-2xl font-bold">Checklist ESCNNA</h1>
      </div>
      <p className="text-ink-soft text-sm mb-6">
        Guía de buenas prácticas para la prevención de explotación sexual comercial de niñas, niños y adolescentes.
      </p>

      <div className="bg-white rounded-xl border border-ink/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progreso general</span>
          <span className="text-sm text-ink-soft">{progress}/5 pasos</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-verde to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id
          const isDone = records?.find((r) => r.paso === step.id)?.completado
          return (
            <button key={step.id} onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border transition flex-shrink-0 ${
                isActive ? "bg-verde text-white border-verde" :
                isDone ? "bg-green-50 text-green-700 border-green-200" :
                "bg-white text-ink-soft border-ink/10 hover:border-verde/30"
              }`}>
              {isDone ? <Check size={14} /> : <span>{step.icon}</span>}
              {step.title}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-ink/5 p-6 text-center text-ink-soft text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-ink/5 p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6">
            {STEPS[currentStep - 1].icon} Paso {currentStep}: {STEPS[currentStep - 1].title}
          </h2>

          {currentStep === 1 && <Step1Promocion formData={formData} onCheck={handleCheck} onText={handleText} />}
          {currentStep === 2 && <Step2Reserva formData={formData} onCheck={handleCheck} onText={handleText} />}
          {currentStep === 3 && <Step3Recepcion formData={formData} onCheck={handleCheck} onText={handleText} />}
          {currentStep === 4 && <Step4Estadia formData={formData} onCheck={handleCheck} onText={handleText} />}
          {currentStep === 5 && <Step5Cierre formData={formData} onCheck={handleCheck} onText={handleText} />}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink/5">
            <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-30 transition">
              <ArrowLeft size={16} /> Anterior
            </button>
            {currentStep < 5 ? (
              <button onClick={saveAndAdvance} disabled={upsert.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
                {upsert.isPending ? "Guardando..." : <>Siguiente <ArrowRight size={16} /></>}
              </button>
            ) : (
              <button onClick={saveAndFinish} disabled={upsert.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition disabled:opacity-50">
                {upsert.isPending ? "Guardando..." : <><Check size={16} /> Completar Proceso</>}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckItem({ label, checked, onCheck, name, required }: { label: string; checked?: boolean; onCheck: (k: string) => void; name: string; required?: boolean }) {
  return (
    <label className="flex items-start gap-3 py-1.5 cursor-pointer group">
      <input type="checkbox" checked={checked || false} onChange={() => onCheck(name)}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-verde focus:ring-verde" />
      <span className="text-sm text-ink/80 group-hover:text-ink">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
    </label>
  )
}

function TextArea({ label, name, value, onText, placeholder }: { label: string; name: string; value: string; onText: (k: string, v: string) => void; placeholder?: string }) {
  return (
    <div className="mt-3">
      <label className="text-xs font-medium text-ink-soft block mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onText(name, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30 resize-none" rows={2} />
    </div>
  )
}

function Input({ label, name, value, onText, placeholder }: { label: string; name: string; value: string; onText: (k: string, v: string) => void; placeholder?: string }) {
  return (
    <div className="mt-3">
      <label className="text-xs font-medium text-ink-soft block mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onText(name, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde/30" />
    </div>
  )
}

function Step1Promocion({ formData, onCheck, onText }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-semibold text-sm mb-3">Mensaje de rechazo explícito a la Explotación Sexual</h3>
        <CheckItem label="He incluido mensaje contundente en la descripción del alojamiento" checked={formData.check1} onCheck={onCheck} name="check1" required />
        <CheckItem label="He agregado el mensaje en los mensajes de bienvenida" checked={formData.check2} onCheck={onCheck} name="check2" />
        <CheckItem label="He incluido una imagen con mensaje de rechazo" checked={formData.check3} onCheck={onCheck} name="check3" />
        <TextArea label="Describa el mensaje utilizado" name="mensaje1" value={formData.mensaje1 || ""} onText={onText} placeholder="Ej: 'Este alojamiento rechaza toda forma de explotación sexual...'" />
      </div>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-semibold text-sm mb-3">Mensaje de advertencia de revisión de documentos</h3>
        <CheckItem label="He incluido la frase sobre verificación de documentos" checked={formData.check4} onCheck={onCheck} name="check4" required />
        <Input label="Frase utilizada" name="frase_docs" value={formData.frase_docs || ""} onText={onText} placeholder="'Se exige documento de identidad...'" />
      </div>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-semibold text-sm mb-3">Capacidad máxima y reglas</h3>
        <CheckItem label="He detallado el número máximo de huéspedes" checked={formData.check5} onCheck={onCheck} name="check5" required />
        <Input label="Número máximo de huéspedes" name="max_huespedes" value={formData.max_huespedes || ""} onText={onText} />
      </div>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-semibold text-sm mb-3">Canales de comunicación</h3>
        <CheckItem label="He publicado el mensaje en redes sociales" checked={formData.check6} onCheck={onCheck} name="check6" />
        <CheckItem label="He publicado el mensaje en el sitio web" checked={formData.check7} onCheck={onCheck} name="check7" />
      </div>
    </div>
  )
}

function Step2Reserva({ formData, onCheck, onText }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h3 className="font-semibold text-sm mb-3">Verificación previa del huésped</h3>
        <CheckItem label="He revisado el perfil del huésped en la plataforma" checked={formData.check1} onCheck={onCheck} name="check1" required />
        <CheckItem label="He revisado el historial de reservas" checked={formData.check2} onCheck={onCheck} name="check2" />
        <CheckItem label="He revisado comentarios de otros anfitriones" checked={formData.check3} onCheck={onCheck} name="check3" />
      </div>
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h3 className="font-semibold text-sm mb-3">Comunicación exclusiva por la plataforma</h3>
        <CheckItem label="Toda la comunicación se mantiene dentro de la plataforma" checked={formData.check4} onCheck={onCheck} name="check4" required />
        <CheckItem label="He guardado toda la información relevante" checked={formData.check5} onCheck={onCheck} name="check5" />
      </div>
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h3 className="font-semibold text-sm mb-3">Solicitud de documentación</h3>
        <CheckItem label="He solicitado documentos de identidad de todos los huéspedes" checked={formData.check6} onCheck={onCheck} name="check6" required />
        <CheckItem label="He solicitado envío de documentos antes de la llegada" checked={formData.check7} onCheck={onCheck} name="check7" />
        <CheckItem label="He informado que serán verificados físicamente en recepción" checked={formData.check8} onCheck={onCheck} name="check8" />
      </div>
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h3 className="font-semibold text-sm mb-3">Reglas claras y aceptadas</h3>
        <CheckItem label="Me he asegurado de que el huésped ha leído las reglas" checked={formData.check9} onCheck={onCheck} name="check9" required />
        <CheckItem label="He enviado las reglas al huésped" checked={formData.check10} onCheck={onCheck} name="check10" />
        <CheckItem label="He solicitado confirmación de aceptación por escrito" checked={formData.check11} onCheck={onCheck} name="check11" />
      </div>
    </div>
  )
}

function Step3Recepcion({ formData, onCheck, onText }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="font-semibold text-sm mb-3">Recepción presencial</h3>
        <CheckItem label="He priorizado la recepción del huésped en persona" checked={formData.check1} onCheck={onCheck} name="check1" required />
        <Input label="Fecha y hora acordada de llegada" name="hora_llegada" value={formData.hora_llegada || ""} onText={onText} />
      </div>
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="font-semibold text-sm mb-3">Verificación de identidad</h3>
        <CheckItem label="He verificado que quienes entran son los mismos de la reserva" checked={formData.check2} onCheck={onCheck} name="check2" required />
        <CheckItem label="He pedido mostrar documento (sin quedarme con copias)" checked={formData.check3} onCheck={onCheck} name="check3" />
        <CheckItem label="He anotado en bitácora: fecha, nombre, quién revisó" checked={formData.check4} onCheck={onCheck} name="check4" />
      </div>
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="font-semibold text-sm mb-3">Viaje con NNA</h3>
        <CheckItem label="¿Llegaron menores de edad?" checked={formData.check5} onCheck={onCheck} name="check5" />
        <CheckItem label="He pedido documento del menor" checked={formData.check6} onCheck={onCheck} name="check6" />
        <CheckItem label="He solicitado prueba de parentesco o permiso válido" checked={formData.check7} onCheck={onCheck} name="check7" />
        <Input label="Nombre del menor (si aplica)" name="nombre_menor" value={formData.nombre_menor || ""} onText={onText} />
      </div>
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="font-semibold text-sm mb-3">Reglas y consecuencias</h3>
        <CheckItem label="He reiterado las reglas protectoras en el check-in" checked={formData.check8} onCheck={onCheck} name="check8" required />
        <CheckItem label="He explicado las consecuencias de incumplimiento" checked={formData.check9} onCheck={onCheck} name="check9" />
        <CheckItem label="He entregado hoja de reglas y he pedido firma" checked={formData.check10} onCheck={onCheck} name="check10" />
      </div>
    </div>
  )
}

function Step4Estadia({ formData, onCheck, onText }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
        <h3 className="font-semibold text-sm mb-3">Señalética y mensajes</h3>
        <CheckItem label="He colocado avisos sobre turismo responsable" checked={formData.check1} onCheck={onCheck} name="check1" required />
        <CheckItem label="He colocado avisos sobre prohibición de ESCNNA" checked={formData.check2} onCheck={onCheck} name="check2" />
        <CheckItem label="He colocado información sobre canales de ayuda" checked={formData.check3} onCheck={onCheck} name="check3" />
      </div>
      <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
        <h3 className="font-semibold text-sm mb-3">Contacto de seguimiento</h3>
        <CheckItem label="He mantenido contacto breve y respetuoso" checked={formData.check4} onCheck={onCheck} name="check4" />
        <CheckItem label="He realizado preguntas como: ¿Todo en orden?" checked={formData.check5} onCheck={onCheck} name="check5" />
        <CheckItem label="He evitado vigilancia o interrogatorios" checked={formData.check6} onCheck={onCheck} name="check6" />
      </div>
      <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
        <h3 className="font-semibold text-sm mb-3">Registro de incidentes</h3>
        <CheckItem label="¿Se presentó algún incidente?" checked={formData.check7} onCheck={onCheck} name="check7" />
        <CheckItem label="He usado formato corto (fecha, hecho, acción)" checked={formData.check8} onCheck={onCheck} name="check8" />
        <CheckItem label="He reportado a líneas locales de autoridades (si aplica)" checked={formData.check9} onCheck={onCheck} name="check9" />
        <TextArea label="Descripción del incidente" name="desc_incidente" value={formData.desc_incidente || ""} onText={onText} />
      </div>
    </div>
  )
}

function Step5Cierre({ formData, onCheck, onText }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
        <h3 className="font-semibold text-sm mb-3">Evaluación del huésped</h3>
        <CheckItem label="He tomado tiempo para dejar un registro objetivo" checked={formData.check1} onCheck={onCheck} name="check1" required />
        <CheckItem label="He evaluado el cumplimiento de reglas protectoras" checked={formData.check2} onCheck={onCheck} name="check2" />
        <CheckItem label="He evaluado la transparencia en la actuación" checked={formData.check3} onCheck={onCheck} name="check3" />
        <TextArea label="Evaluación general" name="evaluacion" value={formData.evaluacion || ""} onText={onText} placeholder="Escriba su evaluación..." />
      </div>
      <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
        <h3 className="font-semibold text-sm mb-3">Almacenamiento seguro</h3>
        <CheckItem label="He almacenado de forma segura todos los registros" checked={formData.check4} onCheck={onCheck} name="check4" required />
        <CheckItem label="Los registros se guardarán por mínimo 6 meses" checked={formData.check5} onCheck={onCheck} name="check5" />
        <CheckItem label="He archivado el registro de incidentes (si los hubo)" checked={formData.check6} onCheck={onCheck} name="check6" />
        <Input label="Fecha de finalización de la estadía" name="fecha_fin" value={formData.fecha_fin || ""} onText={onText} placeholder="dd/mm/aaaa" />
      </div>
      <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
        <h3 className="font-semibold text-sm mb-3">Revisión y mejora continua</h3>
        <CheckItem label="He revisado si hay aspectos por mejorar" checked={formData.check7} onCheck={onCheck} name="check7" />
        <CheckItem label="He actualizado las reglas si es necesario" checked={formData.check8} onCheck={onCheck} name="check8" />
        <TextArea label="Observaciones para mejora" name="mejora" value={formData.mejora || ""} onText={onText} />
      </div>
    </div>
  )
}
