import { useState } from "react"
import { useRooms, useCreateRoom, useDeleteRoom, useUpdateRoom, useRoomTypes } from "@/api/queries/useRooms"
import { useRoomPhotos, useCreateRoomPhoto, useDeleteRoomPhoto } from "@/api/queries/useRoomPhotos"
import { useUpload } from "@/api/queries/useUploads"
import { DoorOpen, Plus, Trash2, X, Image, Save } from "lucide-react"
import { CardSkeleton } from "@/components/Skeletons"

export default function RoomsPage() {
  const [filter, setFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [photosForRoom, setPhotosForRoom] = useState<number | null>(null)

  const { data: rooms, isLoading } = useRooms(filter)
  const { data: roomTypes } = useRoomTypes()
  const createRoom = useCreateRoom()
  const deleteRoom = useDeleteRoom()

  const statusColors: Record<string, string> = {
    Disponible: "bg-green-50 text-green-700",
    Ocupada: "bg-blue-50 text-blue-700",
    Mantenimiento: "bg-yellow-50 text-yellow-700",
    Reservada: "bg-amber-50 text-amber-700",
    Limpieza: "bg-gray-50 text-gray-600",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Habitaciones</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition">
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "Disponible", "Ocupada", "Mantenimiento", "Reservada", "Limpieza"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition ${filter === s ? "bg-verde text-white border-verde" : "bg-white border-ink/10 text-ink-soft hover:border-verde"}`}>
            {s || "Todas"}
          </button>
        ))}
      </div>

      {showForm && (
        <RoomForm
          roomId={editingId}
          roomTypes={roomTypes || []}
          onClose={() => { setShowForm(false); setEditingId(null) }}
          onSaved={() => { setShowForm(false); setEditingId(null) }}
        />
      )}

      {photosForRoom && (
        <PhotoManager
          roomId={photosForRoom}
          roomName={rooms?.find((r) => r.id === photosForRoom)?.numero || ""}
          onClose={() => setPhotosForRoom(null)}
        />
      )}

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : rooms?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-ink/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-verde/10 text-verde flex items-center justify-center">
                    <DoorOpen size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold">Habitación {r.numero}</h3>
                    <p className="text-xs text-ink-soft">Piso {r.piso}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[r.estado] || "bg-gray-50 text-gray-600"}`}>{r.estado}</span>
              </div>
              <div className="text-sm text-ink-soft space-y-1 mb-3">
                <p>Tipo: {r.roomType.nombre}</p>
                <RoomPrice room={r} />
                <p>Capacidad: {r.roomType.capacidadMaxima} pers.</p>
                {r.notas && <p className="text-xs italic">{r.notas}</p>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-ink/5">
                <button onClick={() => setPhotosForRoom(r.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-ink/10 hover:bg-gray-50 transition">
                  <Image size={14} /> Fotos
                </button>
                <button onClick={() => { deleteRoom.mutate(r.id) }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition ml-auto">
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-ink-soft bg-white rounded-xl border border-ink/5">
          <DoorOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay habitaciones</p>
        </div>
      )}
    </div>
  )
}

function RoomForm({ roomId, roomTypes, onClose, onSaved }: { roomId: number | null; roomTypes: { id: number; nombre: string }[]; onClose: () => void; onSaved: () => void }) {
  const [numero, setNumero] = useState("")
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id || 0)
  const [estado, setEstado] = useState("Disponible")
  const [piso, setPiso] = useState(1)
  const [notas, setNotas] = useState("")
  const createRoom = useCreateRoom()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!numero) return
    setSaving(true)
    try {
      await createRoom.mutateAsync({ numero, roomTypeId, estado, piso, notas })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-ink/5 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Nueva Habitación</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="text-xs font-medium text-ink-soft block mb-1">Número</label>
          <input value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" placeholder="101" />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-soft block mb-1">Tipo</label>
          <select value={roomTypeId} onChange={(e) => setRoomTypeId(Number(e.target.value))} className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm bg-white">
            {roomTypes.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-ink-soft block mb-1">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm bg-white">
            {["Disponible", "Ocupada", "Mantenimiento", "Reservada", "Limpieza"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-ink-soft block mb-1">Piso</label>
          <input type="number" value={piso} onChange={(e) => setPiso(Number(e.target.value))} className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={handleSubmit} disabled={saving || !numero}
            className="w-full px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium text-ink-soft block mb-1">Notas</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full px-3 py-2 border border-ink/10 rounded-lg text-sm resize-none" rows={2} />
      </div>
    </div>
  )
}

function PhotoManager({ roomId, roomName, onClose }: { roomId: number; roomName: string; onClose: () => void }) {
  const { data: photos, isLoading } = useRoomPhotos(roomId)
  const createPhoto = useCreateRoomPhoto()
  const deletePhoto = useDeleteRoomPhoto()
  const upload = useUpload()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await upload.mutateAsync(file)
      await createPhoto.mutateAsync({ roomId, url: uploaded.url, caption: file.name })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-ink/5 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Fotos - Habitación {roomName}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
      </div>

      <label className="inline-flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition cursor-pointer mb-4">
        <Plus size={16} /> {uploading ? "Subiendo..." : "Agregar foto"}
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Cargando...</p>
      ) : photos?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden border border-ink/10">
              <img src={p.url} alt={p.caption} className="w-full h-32 object-cover" />
              <button onClick={() => deletePhoto.mutate(p.id)}
                className="absolute top-1 right-1 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={14} />
              </button>
              {p.caption && <p className="text-[10px] text-ink-soft px-2 py-1 truncate">{p.caption}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">Sin fotos aún</p>
      )}
    </div>
  )
}

function RoomPrice({ room }: { room: { id: number; precioPersonalizado: number | null; roomType: { precioBase: number } } }) {
  const updateRoom = useUpdateRoom()
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(room.precioPersonalizado ?? room.roomType.precioBase)

  const displayPrice = room.precioPersonalizado ?? room.roomType.precioBase

  if (!editing) {
    return (
      <p className="cursor-pointer hover:text-verde group" onClick={() => { setPrice(displayPrice); setEditing(true) }}>
        Precio: <strong>${displayPrice.toLocaleString()}</strong>/noche
        {room.precioPersonalizado && <span className="text-[10px] text-fucsia ml-1">*personalizado</span>}
        <span className="text-[10px] text-verde ml-2 opacity-0 group-hover:opacity-100 transition">✏️</span>
      </p>
    )
  }

  const handleSave = async () => {
    const val = Number(price)
    if (isNaN(val) || val <= 0) return
    await updateRoom.mutateAsync({ id: room.id, precioPersonalizado: val === room.roomType.precioBase ? null : val })
    setEditing(false)
  }

  return (
    <p className="flex items-center gap-2">
      <span>Precio:</span>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))}
        className="w-28 px-2 py-1 border border-verde/30 rounded text-sm" step={1000} min={0} />
      <span>/noche</span>
      <button onClick={handleSave} disabled={updateRoom.isPending}
        className="p-1 bg-verde text-white rounded hover:bg-verde-2 transition">
        <Save size={14} />
      </button>
    </p>
  )
}
