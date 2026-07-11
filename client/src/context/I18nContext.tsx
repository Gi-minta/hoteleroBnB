import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

const es = {
  // Nav / Layout
  "nav.dashboard": "Dashboard",
  "nav.reservations": "Reservas",
  "nav.guests": "Huéspedes",
  "nav.rooms": "Habitaciones",
  "nav.responsables": "Responsables",
  "nav.escnna": "ESCNNA",
  "nav.logout": "Cerrar sesión",
  "nav.dark": "Modo oscuro",
  "nav.lang": "EN",

  // Reservations
  "reservations.title": "Reservas",
  "reservations.new": "Nueva reserva",
  "reservations.table.guest": "Huésped",
  "reservations.table.dates": "Fechas",
  "reservations.table.rooms": "Habitaciones",
  "reservations.table.total": "Total",
  "reservations.table.status": "Estado",
  "reservations.table.actions": "Acciones",
  "reservations.empty": "No hay reservas",
  "reservations.filter.all": "Todas",

  // Landing
  "landing.hero.subtitle": "Hospedaje en Medellín",
  "landing.hero.title": "Vive Medellín desde una ubicación privilegiada",
  "landing.hero.desc": "Apartamentos cómodos y equipados cerca a Unicentro, Laureles y los mejores lugares de la ciudad.",
  "landing.hero.cta": "Reservar por WhatsApp",
  "landing.hero.see": "Ver apartamentos",
  "landing.gallery": "Galería",
  "landing.gallery.title": "Conoce tu próximo hogar",
  "landing.faq": "Preguntas frecuentes",
  "landing.contact.title": "¿Listo para reservar?",
  "landing.contact.desc": "Escríbenos por WhatsApp y te responderemos en minutos.",

  // ESCNNA
  "escnna.title": "Checklist ESCNNA",
  "escnna.subtitle": "Guía de buenas prácticas para la prevención de explotación sexual comercial de niñas, niños y adolescentes.",
  "escnna.progress": "Progreso general",
  "escnna.step1": "Promoción Responsable",
  "escnna.step2": "Reserva Segura",
  "escnna.step3": "Recepción Cuidadosa",
  "escnna.step4": "Estadía Protectora",
  "escnna.step5": "Cierre",
  "escnna.prev": "Anterior",
  "escnna.next": "Siguiente",
  "escnna.complete": "Completar Proceso",
}

const en: Record<string, string> = {
  "nav.dashboard": "Dashboard",
  "nav.reservations": "Reservations",
  "nav.guests": "Guests",
  "nav.rooms": "Rooms",
  "nav.responsables": "Billing Parties",
  "nav.escnna": "ESCNNA",
  "nav.logout": "Logout",
  "nav.dark": "Dark mode",
  "nav.lang": "ES",

  "reservations.title": "Reservations",
  "reservations.new": "New Reservation",
  "reservations.table.guest": "Guest",
  "reservations.table.dates": "Dates",
  "reservations.table.rooms": "Rooms",
  "reservations.table.total": "Total",
  "reservations.table.status": "Status",
  "reservations.table.actions": "Actions",
  "reservations.empty": "No reservations",
  "reservations.filter.all": "All",

  "landing.hero.subtitle": "Accommodation in Medellín",
  "landing.hero.title": "Live Medellín from a privileged location",
  "landing.hero.desc": "Comfortable and equipped apartments near Unicentro, Laureles and the best places in the city.",
  "landing.hero.cta": "Book via WhatsApp",
  "landing.hero.see": "View apartments",
  "landing.gallery": "Gallery",
  "landing.gallery.title": "Meet your next home",
  "landing.faq": "FAQ",
  "landing.contact.title": "Ready to book?",
  "landing.contact.desc": "Write to us on WhatsApp and we'll respond in minutes.",

  "escnna.title": "ESCNNA Checklist",
  "escnna.subtitle": "Best practice guide for the prevention of commercial sexual exploitation of children and adolescents.",
  "escnna.progress": "Overall Progress",
  "escnna.step1": "Responsible Promotion",
  "escnna.step2": "Safe Booking",
  "escnna.step3": "Careful Reception",
  "escnna.step4": "Protective Stay",
  "escnna.step5": "Closure",
  "escnna.prev": "Previous",
  "escnna.next": "Next",
  "escnna.complete": "Complete Process",
}

type Lang = "es" | "en"
const dicts: Record<Lang, Record<string, string>> = { es, en }

interface I18nContextType {
  lang: Lang
  t: (key: string) => string
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es")

  const t = useCallback((key: string) => dicts[lang][key] || key, [lang])
  const toggleLang = useCallback(() => setLang((prev) => prev === "es" ? "en" : "es"), [])

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

// Traductor en línea: el español se mantiene tal cual y el inglés es la traducción.
// Útil para textos que no viven en los diccionarios es/en de arriba.
export function useTr() {
  const { lang } = useI18n()
  return (es: string, en: string) => (lang === "es" ? es : en)
}
