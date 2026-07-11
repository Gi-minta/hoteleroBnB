// Módulo central de la paleta de colores del sitio.
// Se usa tanto en /admin/settings (editor) como en el arranque de la app
// (main.tsx) para que los colores guardados se apliquen en TODAS las
// páginas (landing pública + admin), no solo al visitar Configuración.

export type PaletteColors = Record<string, string>

export const PALETTE_STORAGE_KEY = "hotelero_palette_v1"

// key = nombre usado en la BD (LandingContent.section="palette")
// cssVar = variable CSS real definida en index.css / @theme
// ¡Importante!: deben coincidir exactamente con las variables de index.css.
export const PALETTE_KEYS: { key: string; cssVar: string; label: string; default: string }[] = [
  { key: "verde", cssVar: "--color-verde", label: "Barra navegación, títulos, botones primarios", default: "#3F6B4B" },
  { key: "verde2", cssVar: "--color-verde-2", label: "Hover estados, bordes activos", default: "#2F5540" },
  { key: "fucsia", cssVar: "--color-fucsia", label: "Enlaces, íconos acento, badges", default: "#D6336C" },
  { key: "mostaza", cssVar: "--color-mostaza", label: "Call-to-action, estrellas, ofertas", default: "#E8A73E" },
  { key: "wa", cssVar: "--color-wa", label: "Botón flotante WhatsApp", default: "#25D366" },
  { key: "rojo", cssVar: "--color-rojo", label: "Alertas, errores, precios tachados", default: "#DB5461" },
  { key: "gris", cssVar: "--color-gris", label: "Texto secundario, bordes neutrales", default: "#686963" },
  { key: "grisazul", cssVar: "--color-gris-azul", label: "Fondos suaves, secciones alternas", default: "#8AA29E" },
  { key: "azul", cssVar: "--color-azul", label: "Encabezados oscuros, footer", default: "#3D5467" },
  { key: "hueso", cssVar: "--color-hueso", label: "Fondo de página principal", default: "#F1EDEE" },
]

export const PALETTE_GROUPS: { name: string; desc: string; colors: PaletteColors }[] = [
  {
    name: "B&B Original",
    desc: "Verdes bosque + rosa + dorado",
    colors: { verde: "#3F6B4B", verde2: "#2F5540", fucsia: "#D6336C", mostaza: "#E8A73E", wa: "#25D366", rojo: "#DB5461", gris: "#686963", grisazul: "#8AA29E", azul: "#3D5467", hueso: "#F1EDEE" },
  },
  {
    name: "Elegante",
    desc: "Rojo coral + grises + azul profundo",
    colors: { verde: "#3D5467", verde2: "#2C3E50", fucsia: "#DB5461", mostaza: "#8AA29E", wa: "#25D366", rojo: "#DB5461", gris: "#686963", grisazul: "#8AA29E", azul: "#3D5467", hueso: "#F1EDEE" },
  },
  {
    name: "Oscuro",
    desc: "Tonos oscuros elegantes",
    colors: { verde: "#1A1A2E", verde2: "#16213E", fucsia: "#E94560", mostaza: "#F5A623", wa: "#25D366", rojo: "#E94560", gris: "#4A4A5A", grisazul: "#6C7A89", azul: "#16213E", hueso: "#EAEAEA" },
  },
  {
    name: "Playero",
    desc: "Azules claros + arena",
    colors: { verde: "#2C7865", verde2: "#1E6B5E", fucsia: "#FF6B6B", mostaza: "#FFD93D", wa: "#25D366", rojo: "#FF6B6B", gris: "#6C7A89", grisazul: "#A8D8EA", azul: "#4A90D9", hueso: "#FFF8E7" },
  },
  {
    name: "Terroso",
    desc: "Tonos tierra cálidos",
    colors: { verde: "#5C4033", verde2: "#4A3428", fucsia: "#C84B31", mostaza: "#D4A24E", wa: "#25D366", rojo: "#C84B31", gris: "#7D6B5D", grisazul: "#A89F91", azul: "#5C4033", hueso: "#F5EDE3" },
  },
]

export function getDefaultPalette(): PaletteColors {
  const d: PaletteColors = {}
  for (const p of PALETTE_KEYS) d[p.key] = p.default
  return d
}

/** Aplica la paleta a las variables CSS del documento y (opcionalmente) la cachea en localStorage
 *  para que se pueda pintar instantáneamente en la próxima carga, sin esperar la respuesta del API. */
export function applyPalette(colors: PaletteColors, persist = true) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const cssVarMap: Record<string, string> = {}
  for (const p of PALETTE_KEYS) {
    const value = colors[p.key] || p.default
    root.style.setProperty(p.cssVar, value)
    cssVarMap[p.cssVar] = value
  }
  if (persist) {
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(cssVarMap))
    } catch {
      // localStorage puede fallar en modo privado; no es crítico
    }
  }
}

/** Lee la paleta cacheada (formato cssVar -> valor) y la aplica de inmediato, sin re-escribir el caché. */
export function applyCachedPalette() {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (!raw) return
    const cssVarMap = JSON.parse(raw) as Record<string, string>
    const root = document.documentElement
    for (const [cssVar, value] of Object.entries(cssVarMap)) {
      root.style.setProperty(cssVar, value)
    }
  } catch {
    // ignorar caché corrupto
  }
}

/** Convierte la respuesta de /landing/content (section="palette") a un objeto PaletteColors completo. */
export function paletteFromLandingContent(items: { section: string; key: string; value: string }[]): PaletteColors {
  const colors = getDefaultPalette()
  for (const p of PALETTE_KEYS) {
    const item = items.find((c) => c.section === "palette" && c.key === p.key)
    if (item?.value) colors[p.key] = item.value
  }
  return colors
}
