// Helpers de rutas para soportar el despliegue en un subdirectorio de GitHub
// Pages (https://gi-minta.github.io/hoteleroBnB/).
//
// En build, Vite fija `import.meta.env.BASE_URL` a "/hoteleroBnB/"; en dev es "/".
// BASE se guarda SIN barra final ("/hoteleroBnB" en prod, "" en dev) para poder
// anteponerlo a rutas absolutas sin generar dobles barras. En dev BASE queda ""
// y los helpers son transparentes (nada cambia localmente).
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

/** Antepone BASE a una ruta absoluta. Ej.: "/login" → "/hoteleroBnB/login". */
export function withBase(path: string): string {
  return `${BASE}${path}`
}

/** Redirección dura del navegador respetando el subdirectorio de despliegue. */
export function hardRedirect(path: string): void {
  window.location.href = withBase(path)
}
