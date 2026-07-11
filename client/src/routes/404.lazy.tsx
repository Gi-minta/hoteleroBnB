import { Link } from "@tanstack/react-router"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF7F0]">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif text-verde mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-ink-soft mb-6">La página que buscas no existe o ha sido movida.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition">
            Ir al inicio
          </Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-5 py-2.5 border border-ink/10 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}
