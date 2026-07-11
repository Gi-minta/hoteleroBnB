import { Link } from "@tanstack/react-router"

export default function ErrorBoundary({ error }: { error?: Error }) {
  const title = "Error inesperado"
  const message = error?.message || "Ocurrió un error al cargar esta página."

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4 font-serif text-verde">!</div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-ink-soft mb-6">{message}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-verde text-white rounded-lg text-sm font-bold hover:bg-verde-2 transition">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
