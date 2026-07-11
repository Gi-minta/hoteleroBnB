import { useRef, useState, useEffect, type MouseEvent, type TouchEvent } from "react"

interface SignaturePadProps {
  value: string
  onChange: (dataUrl: string) => void
  label?: string
}

export default function SignaturePad({ value, onChange, label }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = value
    } else {
      ctx.fillStyle = "#FAFAF5"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const getPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = "#1B2E22"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current!
    onChange(canvas.toDataURL())
  }

  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#FAFAF5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onChange("")
  }

  return (
    <div>
      {label && <label className="text-xs font-medium text-ink-soft block mb-1">{label}</label>}
      <div className="border border-ink/10 rounded-lg overflow-hidden bg-[#FAFAF5]">
        <canvas ref={canvasRef} width={400} height={120}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
          className="w-full touch-none cursor-crosshair" />
      </div>
      <button type="button" onClick={clear} className="mt-1 text-xs text-ink-soft hover:text-red-600 transition">
        Limpiar firma
      </button>
    </div>
  )
}
