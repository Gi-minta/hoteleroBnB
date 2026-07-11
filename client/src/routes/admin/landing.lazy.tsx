import { useState } from "react"
import { useLandingContent, useUpsertLandingContent, useLandingGallery, useAddGalleryImage, useDeleteGalleryImage } from "@/api/queries/useLanding"
import { useUpload } from "@/api/queries/useUploads"
import { Save, Plus, Trash2, Image } from "lucide-react"

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "services", label: "Servicios" },
  { id: "location", label: "Ubicación" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contacto" },
  { id: "footer", label: "Footer" },
]

export default function LandingEditorPage() {
  const { data: content, isLoading } = useLandingContent()
  const { data: gallery } = useLandingGallery()
  const upsert = useUpsertLandingContent()
  const addImage = useAddGalleryImage()
  const removeImage = useDeleteGalleryImage()
  const upload = useUpload()

  const [selectedSection, setSelectedSection] = useState("hero")
  const [uploading, setUploading] = useState(false)

  const sectionContent = content?.filter((c) => c.section === selectedSection) || []

  const handleSave = async (key: string, value: string) => {
    await upsert.mutateAsync({ section: selectedSection, key, value })
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await upload.mutateAsync(file)
      await addImage.mutateAsync({ url: uploaded.url, caption: file.name })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editor de Landing Page</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSelectedSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${selectedSection === s.id ? "bg-verde text-white border-verde" : "bg-white border-ink/10 text-ink-soft hover:border-verde"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-ink-soft">Contenido</h3>
          {isLoading ? (
            <p className="text-sm text-ink-soft">Cargando...</p>
          ) : (
            <>
              {["title", "subtitle", "description", "cta"].filter((k) => !sectionContent.find((c) => c.key === k)).map((k) => (
                <ContentEditor key={k} sectionKey={k} value="" onSave={handleSave} />
              ))}
              {sectionContent.map((c) => (
                <ContentEditor key={c.id} sectionKey={c.key} value={c.value} onSave={handleSave} />
              ))}
            </>
          )}
        </div>

        {selectedSection === "hero" && (
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-ink-soft mb-4">Galería de imágenes</h3>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition cursor-pointer mb-4">
              <Plus size={16} /> {uploading ? "Subiendo..." : "Agregar imagen"}
              <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" disabled={uploading} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {gallery?.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-ink/10">
                  <img src={img.url} alt={img.caption} className="w-full h-28 object-cover" />
                  <button onClick={() => removeImage.mutate(img.id)}
                    className="absolute top-1 right-1 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={14} />
                  </button>
                  {img.caption && <p className="text-[10px] text-ink-soft px-2 py-1 truncate">{img.caption}</p>}
                </div>
              ))}
              {(!gallery || gallery.length === 0) && (
                <p className="text-sm text-ink-soft col-span-2">Sin imágenes en la galería</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ContentEditor({ sectionKey, value, onSave }: { sectionKey: string; value: string; onSave: (key: string, value: string) => Promise<void> }) {
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)

  const label = sectionKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(sectionKey, val)
    } finally {
      setSaving(false)
    }
  }

  const isLong = val.length > 80

  return (
    <div className="bg-white rounded-xl border border-ink/5 p-4">
      <label className="text-xs font-medium text-ink-soft block mb-1">{label}</label>
      {isLong ? (
        <textarea value={val} onChange={(e) => setVal(e.target.value)}
          className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm resize-none" rows={3} />
      ) : (
        <input value={val} onChange={(e) => setVal(e.target.value)}
          className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" />
      )}
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-1 px-3 py-1.5 mt-2 text-xs font-medium bg-verde text-white rounded-lg hover:bg-verde-2 transition disabled:opacity-50">
        <Save size={12} /> {saving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  )
}
