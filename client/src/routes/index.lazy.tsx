import { useState, useEffect, type FormEvent } from "react"
import { useI18n } from "@/context/I18nContext"
import { useLandingContent, useLandingGallery } from "@/api/queries/useLanding"
import { useCreatePreRegistro } from "@/api/queries/usePreRegistros"
import RegistroHuespedModal from "@/components/RegistroHuespedModal"

const whatsapp = "https://wa.me/573004446421"

const DEFAULT_GALLERY = [
  "/images/habitacion1.jpg", "/images/habitacion2.jpg", "/images/habitacion3.jpg", "/images/habitacion4.jpg",
  "/images/terraza.jpg", "/images/balcon.jpg", "/images/vista-balcon.jpg", "/images/recepcion.jpg",
  "/images/bano1.jpg", "/images/bano2.jpg", "/images/bano3.jpg", "/images/escalas1.jpg",
  "/images/bnb-brand.jpg", "/images/feria-flores.png", "/images/apt-ejecutivo2.jpg", "/images/apt-familiar-cocina.jpg",
]

// Traductor en línea: el texto en español se mantiene igual al original;
// el segundo argumento es la traducción al inglés que se muestra con el toggle ES/EN.
function useTr() {
  const { lang } = useI18n()
  return (es: string, en: string) => (lang === "es" ? es : en)
}

// Firma: t(section, key, es, en). En español respeta el contenido editable del
// admin (LandingContent) y cae al texto español por defecto; en inglés usa la traducción.
type Translate = (section: string, key: string, es: string, en: string) => string

export default function HomePage() {
  const { data: landingContent } = useLandingContent()
  const { data: galleryImages } = useLandingGallery()
  const { lang } = useI18n()

  const t: Translate = (section, key, es, en) => {
    if (lang === "en") return en
    const item = landingContent?.find((c) => c.section === section && c.key === key)
    return item?.value || es
  }

  const gallery = galleryImages?.length ? galleryImages.map((g) => g.url) : DEFAULT_GALLERY
  const [registroOpen, setRegistroOpen] = useState(false)

  return (
    <div className="bnb-landing min-h-screen bg-[#FAF7F0] dark:bg-[#131C16] text-ink dark:text-[#ECF1EC]">
      <TopBar />
      <Navbar onReservar={() => setRegistroOpen(true)} />
      <Hero t={t} />
      <Apartments t={t} />
      <Services t={t} />
      <Location />
      <AddressMap />
      <Stats />
      <Pricing />
      <Gallery gallery={gallery} />
      <FAQ />
      <WhatsappCta />
      <Footer />
      <FloatingWhatsApp />
      {registroOpen && <RegistroHuespedModal onClose={() => setRegistroOpen(false)} />}
    </div>
  )
}

function TopBar() {
  const tr = useTr()
  return (
    <div className="bg-verde dark:bg-[#16241B] text-white text-sm">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between gap-4 flex-wrap">
        <span className="flex items-center gap-2 opacity-95 text-xs md:text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.4" /></svg>
          {tr("Cerca a Unicentro, Laureles y todo lo mejor de Medellín", "Near Unicentro, Laureles and all the best of Medellín")}
        </span>
        <a href="tel:+573004446421" className="flex items-center gap-2 font-bold text-xs md:text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5a2 2 0 0 1 2-2h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5Z" /></svg>
          300 444 6421
        </a>
      </div>
    </div>
  )
}

function Navbar({ onReservar }: { onReservar: () => void }) {
  const { lang, toggleLang } = useI18n()
  const tr = useTr()
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { setDark(document.documentElement.classList.contains("dark")) }, [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    tr("Inicio", "Home"), tr("Apartamentos", "Apartments"), tr("Servicios", "Services"),
    tr("Alrededores", "Surroundings"), tr("Ubicación", "Location"),
    tr("Galería", "Gallery"), tr("FAQ", "FAQ"), tr("Contacto", "Contact"),
  ]
  const ids = ["inicio", "habitaciones", "servicios", "alrededores", "ubicacion", "galeria", "faq", "contacto"]

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-[#FAF7F0]/95 dark:bg-[#131C16]/90 shadow-lg backdrop-blur-md" : "bg-[#FAF7F0]/90 dark:bg-[#131C16]/85 backdrop-blur-sm"} border-b border-ink/10 dark:border-white/8`}>
      <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-verde text-white flex items-center justify-center font-bold text-sm" style={{ fontFamily: "'Fraunces', serif" }}>B&amp;B</span>
          <div>
            <strong className="font-bold text-lg text-ink dark:text-[#ECF1EC]" style={{ fontFamily: "'Fraunces', serif" }}>B&amp;B</strong>
            <span className="block text-[10px] tracking-widest text-ink-soft dark:text-[#A7B6AB] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>Medellín</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          {links.map((l, i) => (
            <a key={ids[i]} href={`#${ids[i]}`} className="relative py-1 hover:text-fucsia transition after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-fucsia after:transition-all hover:after:w-full">
              {l}
            </a>
          ))}
          <a href="/login" className="ml-2 px-4 py-2 bg-fucsia text-white rounded-full text-xs font-bold uppercase tracking-wide hover:bg-fucsia transition shadow-md">
            Login
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { setDark(!dark); document.documentElement.classList.toggle("dark"); localStorage.setItem("darkMode", (!dark).toString()) }}
            className="w-10 h-9 border border-ink dark:border-[#ECF1EC] rounded-full text-sm flex items-center justify-center hover:bg-ink hover:text-wall dark:hover:bg-[#ECF1EC] dark:hover:text-[#131C16] transition">
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={toggleLang} className="text-xs font-bold px-3 py-1.5 border border-ink dark:border-[#ECF1EC] rounded-full hover:bg-ink hover:text-wall dark:hover:bg-[#ECF1EC] dark:hover:text-[#131C16] transition" style={{ fontFamily: "'Space Mono', monospace" }}>
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button onClick={onReservar} className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-verde text-white rounded-full text-xs font-bold uppercase tracking-wide hover:bg-verde-2 transition shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2a1 1 0 0 0-1 1v1H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V3a1 1 0 1 0-2 0v1H10V3a1 1 0 0 0-1-1Zm-3 6h12v11H6V8Zm2.5 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" /></svg>
            {tr("Reservar", "Book now")}
          </button>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 dark:border-white/8 p-4 space-y-3 bg-[#FAF7F0] dark:bg-[#131C16]">
          {links.map((l, i) => (
            <a key={ids[i]} href={`#${ids[i]}`} className="block text-sm font-semibold" onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          <a href="/login" className="block text-sm font-bold text-fucsia">Login</a>
          <button onClick={() => { setMenuOpen(false); onReservar() }} className="block text-sm font-bold text-verde text-left">{tr("Reservar", "Book now")}</button>
          <a href={whatsapp} target="_blank" rel="noopener" className="block text-sm font-bold text-ink-soft dark:text-[#A7B6AB]">{tr("Reservar por WhatsApp", "Book via WhatsApp")}</a>
        </div>
      )}
    </header>
  )
}

function Hero({ t }: { t: Translate }) {
  const tr = useTr()
  return (
    <section id="inicio" className="relative min-h-[130vh] flex items-end text-white overflow-hidden">
      <img src="/images/fachada2.png" alt="Fachada B&B Medellín" className="absolute inset-0 w-full h-full object-cover object-top z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90 z-10" />
      <div className="relative z-20 max-w-6xl mx-auto px-6 pb-20 w-full">
        <p className="text-xs tracking-widest uppercase text-mostaza flex items-center gap-2 mb-4 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
          <span className="w-5 h-0.5 bg-fucsia" /> {t("hero", "subtitle", "Hospedaje en Medellín", "Accommodation in Medellín")}
        </p>
        <h1 className="text-4xl md:text-6xl leading-tight max-w-lg mb-5" style={{ fontFamily: "'Fraunces', serif" }}
          dangerouslySetInnerHTML={{ __html: t("hero", "title", "Vive <em class=\"not-italic text-wa\">Medellín</em> desde una ubicación privilegiada", "Live <em class=\"not-italic text-wa\">Medellín</em> from a privileged location") }} />
        <p className="text-white/90 text-lg max-w-lg mb-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          {t("hero", "description", "Apartamentos cómodos y totalmente equipados cerca a Unicentro, Laureles, Pueblito Paisa y lugares turisticos de la ciudad.", "Comfortable, fully equipped apartments near Unicentro, Laureles, Pueblito Paisa and the best places in the city.")}
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={whatsapp} target="_blank" rel="noopener" className="bg-wa text-white px-7 py-3.5 rounded-full font-bold text-sm hover:brightness-110 transition shadow-lg flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
            {t("hero", "cta", "Reservar por WhatsApp", "Book via WhatsApp")}
          </a>
          <a href="#habitaciones" className="border border-white/60 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-white hover:text-ink transition">
            {t("hero", "cta_secondary", "Ver apartamentos", "View apartments")}
          </a>
        </div>
      </div>
      <div className="absolute right-6 bottom-6 hidden md:flex flex-col items-center gap-1.5 text-xs tracking-widest text-white/80" style={{ fontFamily: "'Space Mono', monospace" }}>
        {tr("BAJA", "SCROLL")}
        <div className="w-px h-8 bg-white/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-mostaza animate-drip" />
        </div>
      </div>
    </section>
  )
}

function ApartmentCard({ images, name, desc, tags, eyebrow }: { images: string[]; name: string; desc: string; tags: string[]; eyebrow?: string }) {
  const tr = useTr()
  const [idx, setIdx] = useState(0)
  return (
    <div className="bg-white dark:bg-[#1E2A22] rounded-2xl overflow-hidden shadow-xl shadow-black/5 border border-ink/5 dark:border-white/10 hover:-translate-y-1.5 hover:shadow-2xl transition duration-300">
      <div className="relative h-[270px] overflow-hidden">
        {images.map((img, i) => (
          <img key={img} src={img} alt={`${name} - foto ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === idx ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white rounded" : "w-2 bg-white/60"}`} />
          ))}
        </div>
      </div>
      <div className="p-[26px_24px]">
        {eyebrow && (
          <p className="text-xs tracking-widest uppercase text-verde flex items-center gap-2 font-bold mb-2.5" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> {eyebrow}
          </p>
        )}
        <h3 className="text-2xl text-verde mb-1.5" style={{ fontFamily: "'Fraunces', serif" }}>{name}</h3>
        <p className="text-ink-soft dark:text-[#A7B6AB] text-sm mb-3">{desc}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-verde/10 dark:bg-verde/12 text-verde dark:text-verde border border-ink/10 dark:border-white/10" style={{ fontFamily: "'Space Mono', monospace" }}>{tag}</span>
          ))}
        </div>
        <a href={`${whatsapp}?text=Hola!%20Me%20interesa%20el%20${encodeURIComponent(name)}`} target="_blank" rel="noopener"
          className="bg-verde text-white px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 hover:bg-verde-2 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
          {tr("Ver disponibilidad", "Check availability")}
        </a>
      </div>
    </div>
  )
}

function Apartments({ t }: { t: Translate }) {
  const tr = useTr()
  const roomCards = [
    { eyebrow: tr("Apartamento 01", "Apartment 01"), name: tr("Apartamento Ejecutivo", "Executive Apartment"), desc: tr("Compacto y funcional, perfecto para viajeros de negocios o parejas. Cocina equipada y salón con televisor, wifi, cafe y aromatica de cortesia.", "Compact and functional, perfect for business travelers or couples. Equipped kitchen and private living room."), tags: [tr("1 habitación", "1 bedroom"), tr("2 personas", "2 guests"), tr("Cocina equipada", "Equipped kitchen")], images: ["/images/apt-ejecutivo.jpg", "/images/apt-ejecutivo-sala.jpg", "/images/apt-ejecutivo2.jpg"] },
    { eyebrow: tr("Apartamento 02", "Apartment 02"), name: tr("Apartamento Familiar", "Family Apartment"), desc: tr("Amplio y luminoso, con dos habitaciones y cocina equipada, patio con zona de ropas, wifi, cafe y aromatica de cortesia. Ideal para familias o grupos pequeños.", "Spacious and bright, with two bedrooms and an island kitchen. Ideal for families or small groups."), tags: [tr("2 habitaciones", "2 bedrooms"), tr("6 personas", "6 guests"), tr("Cocina equipada", "Equipped kitchen")], images: ["/images/apt-familiar1.jpg", "/images/apt-familiar2.jpg", "/images/apt-familiar-cocina.jpg"] },
  ]

  return (
    <section id="habitaciones" className="py-20 bg-[#F1EBDD] dark:bg-[#1A251D]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-verde dark:text-verde flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> {t("services", "subtitle", "Nuestros apartamentos", "Our apartments")}
          </p>
          <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>{t("services", "title", "Familiar o Ejecutivo, tú eliges.", "Family or Executive, you choose.")}</h2>
          <p className="text-ink-soft dark:text-[#A7B6AB] text-sm mt-2 max-w-xl mx-auto">{tr("Dos apartamentos completamente equipados, pensados para viajeros de negocios y para familias. Reserva directa, sin intermediarios.", "Two fully equipped apartments, designed for business travelers and families. Direct booking, no middlemen.")}</p>
        </div>
        <div className={`grid ${roomCards.length === 1 ? "md:grid-cols-1 max-w-md" : "md:grid-cols-2"} gap-8 mx-auto`} style={{ maxWidth: roomCards.length === 1 ? "400px" : "900px" }}>
          {roomCards.map((card, i) => (
            <ApartmentCard key={i} images={card.images} name={card.name} desc={card.desc} tags={card.tags} eyebrow={card.eyebrow} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Services({ t }: { t: Translate }) {
  const tr = useTr()
  const items = [
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/></svg>`, title: tr("Apartamentos Amplios", "Spacious Apartments"), desc: tr("Espacios amplios, con baño privado o compartido. Camas dobles con posibilidad de camas sencillas adicionales.", "Spacious rooms with private or shared bathrooms. Double beds with the option of additional single beds.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/></svg>`, title: tr("Baños privados y compartidos", "Private and shared bathrooms"), desc: tr("Cada apartamento cuenta con su baño completo con agua fría y caliente.", "Each apartment has a complete bathroom with cold and hot water.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2"/><path d="M5 11v11"/><path d="M17 22V2c1.7 0 3 1.3 3 3v6h-3"/></svg>`, title: tr("Cocina equipada", "Equipped kitchen"), desc: tr("Cocina con los electrodomesticos básico para la preparación de tus alimentos.", "A large kitchen fitted with all the appliances you need to prepare your meals.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a3 3 0 0 1 0 6h-1"/><path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><path d="M6 1v3"/><path d="M10 1v3"/><path d="M14 1v3"/></svg>`, title: tr("Desayuno y lavandería", "Breakfast and laundry"), desc: tr("Ofrecemos estos servicios con costo adicional.", "We offer these services at an additional cost.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/></svg>`, title: tr("Salón - Segundo piso", "Lounge - Second floor"), desc: tr("Salón de descanso para compartir con la comunidad multicultural que nos visita.", "Lounge area to share with the multicultural community that visits us.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>`, title: tr("Balcón - Segundo piso", "Balcony - Second floor"), desc: tr("Amplio balcón para un buen un café en las tardes.", "Spacious balcony perfect for enjoying a coffee in the afternoons.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M2 9a15 15 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1"/></svg>`, title: tr("WiFi gratis", "Free WiFi"), desc: tr("WiFi gratis de 100 MB en todos los espacios para tus computadores y dispositivos móviles.", "Free 100 MB WiFi in every space for your computers and mobile devices.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>`, title: tr("Amigables con mascotas", "Pet friendly"), desc: tr("Puedes venir con tu mascota (hasta 30 libras) por un módico precio adicional.", "You can bring your pet (up to 30 lb) for a small additional fee.") },
    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-5 9 5v12"/><path d="M3 21h18"/><path d="M8 21v-6h8v6"/></svg>`, title: tr("Parqueadero de motos/carros", "Motorcycle/Cars parking"), desc: tr("NO ofrecemos servicios de Parqueadero para motos y carros, te recomendaremos los que hay disponibles cerca.", "We do NOT offer parking services for motorcycles and cars; we will recommend those that are available nearby.") },
  ]
  return (
    <section id="servicios" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-verde dark:text-verde flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> {t("services", "subtitle", "Todo incluido en casa", "All included at home")}
          </p>
          <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>{t("services", "title", "Nuestros servicios", "Our services")}</h2>
          <p className="text-ink-soft dark:text-[#A7B6AB] text-sm mt-2 max-w-xl mx-auto">{tr("Una casa paisa pensada para que te sientas como en el hogar, con todo lo necesario para tu estadía.", "A paisa house designed to make you feel at home, with everything you need for your stay.")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <div key={item.title} className="bg-white dark:bg-[#1E2A22] rounded-xl p-5 border border-ink/5 dark:border-white/10 hover:-translate-y-1.5 hover:shadow-xl transition text-center" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-verde/10 dark:bg-verde/14 text-verde dark:text-verde flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{item.title}</h3>
              <p className="text-xs text-ink-soft dark:text-[#A7B6AB]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Location() {
  const tr = useTr()
  const places = [
    { name: "Unicentro", time: "0.2 km", icon: "🛍️", desc: tr("Centro comercial a media cuadra (2 min a pie)", "Shopping mall half a block away (2 min walk)"), img: "/images/unicentro.png" },
    { name: "Pueblito Paisa", time: "1.9 km", icon: "🏘️", desc: tr("En el Cerro Nutibara, un pueblito tradicional con vistas panorámicas de la ciudad.", "On Cerro Nutibara, a traditional little town with panoramic views of the city."), img: "/images/pueblito-paisa.png" },
    { name: "Laureles", time: "1.4 km", icon: "🌳", desc: tr("Calles circulares, Avenida 70 y los dos parques de Laureles con cafés y restaurantes.", "Circular streets, Avenida 70 and the two Laureles parks with cafés and restaurants."), img: "/images/laureles.png" },
    { name: "Carrera 70", time: "1.4 km", icon: "🚶", desc: tr("Zona Rosa Laureles — bares y vida nocturna", "Laureles Zona Rosa — bars and nightlife"), img: "/images/carrera70.png" },
    { name: "Plaza Mayor", time: "2.9 km", icon: "🏛️", desc: tr("Centro de Convenciones y eventos de Medellín", "Medellín's Convention and events center"), img: "/images/plaza-mayor.png" },
    { name: "Parques del Río", time: "1.2 km", icon: "🌿", desc: tr("Malecón junto al río Medellín, con zonas verdes, restaurantes y ciclorrutas.", "A riverfront promenade along the Medellín River, with green areas, restaurants and bike paths."), img: "/images/parques-del-rio.jpg" },
    { name: "Universidad Pontificia Bolivariana", time: "0.5 km", icon: "🎓", desc: tr("El barrio Conquistadores se desarrolló alrededor de la Universidad Pontificia Bolivariana.", "The Conquistadores neighborhood grew up around Universidad Pontificia Bolivariana."), img: "/images/upb.jpg" },
    { name: tr("Centro de Medellín", "Downtown Medellín"), time: "0.5 km", icon: "🎓", desc: tr("Centro administrativo y cultural de la ciudad.", "The city's administrative and cultural center."), img: "/images/centro-medellin.jpg" },
    { name: "Plaza Botero", time: "3.5 km", icon: "🎓", desc: tr("Museo de Antioquia, Parque Berrio", "Antioquia Museum, Parque Berrío"), img: "/images/plaza-botero.png" },
  ]
  return (
    <section id="ubicacion" className="py-20 bg-[#F1EBDD] dark:bg-[#1A251D]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-verde dark:text-verde flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> {tr("Los alrededores", "The surroundings")}
          </p>
          <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Lo que te rodea, a pocos pasos", "What's around you, just steps away")}</h2>
          <p className="text-ink-soft dark:text-[#A7B6AB] text-sm mt-2 max-w-2xl mx-auto">{tr("Estamos en el barrio residencial Conquistadores (sector Laureles–Estadio), estamos ubicados cerca de la Universidad Pontificia Bolivariana y lleno de parques y zonas verdes para disfrutar.", "We are located in the Conquistadores residential neighborhood (Laureles-Estadio sector), near the Pontifical Bolivarian University, and surrounded by parks and green areas to enjoy.")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {places.map((p) => (
            <div key={p.img} className="bg-white dark:bg-[#1E2A22] rounded-xl overflow-hidden border border-ink/5 dark:border-white/10 hover:-translate-y-1.5 transition shadow-md">
              <div className="h-40 overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{p.icon}</span>
                  <strong className="text-sm">{p.name}</strong>
                  <span className="ml-auto text-xs font-bold text-fucsia" style={{ fontFamily: "'Space Mono', monospace" }}>{p.time}</span>
                </div>
                <p className="text-xs text-ink-soft dark:text-[#A7B6AB]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="https://www.google.com/maps?q=Transversal+35A+%2366A-88,+Medell%C3%ADn,+Antioquia,+Colombia" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 border border-ink dark:border-[#ECF1EC] text-ink dark:text-[#ECF1EC] px-6 py-3 rounded-full text-sm font-bold hover:bg-ink hover:text-wall dark:hover:bg-[#ECF1EC] dark:hover:text-[#131C16] transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.4" /></svg>
            {tr("Ver en Google Maps", "View on Google Maps")}
          </a>
        </div>
      </div>
    </section>
  )
}

function AddressMap() {
  const tr = useTr()
  return (
    <section id="mapa" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 items-stretch">
          <div className="bg-white dark:bg-[#1E2A22] border border-ink/10 dark:border-white/10 rounded-lg p-8 flex flex-col justify-center gap-5">
            <p className="text-xs tracking-widest uppercase text-verde dark:text-verde flex items-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
              <span className="w-5 h-0.5 bg-mostaza" /> {tr("Ubicación", "Location")}
            </p>
            <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Encuéntranos en Medellín", "Find us in Medellín")}</h2>
            <div className="flex gap-3.5 items-start">
              <svg className="w-5 h-5 text-verde shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.4" /></svg>
              <div><strong className="text-sm block mb-0.5">{tr("Dirección", "Address")}</strong><span className="text-sm text-ink-soft dark:text-[#A7B6AB]">Transversal 35A #66A-88, Medellín, Antioquia, Colombia</span></div>
            </div>
            <div className="flex gap-3.5 items-start">
              <svg className="w-5 h-5 text-verde shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5a2 2 0 0 1 2-2h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5Z" /></svg>
              <div><strong className="text-sm block mb-0.5">WhatsApp</strong><span className="text-sm text-ink-soft dark:text-[#A7B6AB]">+57 300 444 6421</span></div>
            </div>
            <div className="flex gap-3.5 items-start">
              <svg className="w-5 h-5 text-verde shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h16v16H4z" opacity="0" /><path d="M3 6l9 7 9-7M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
              <div><strong className="text-sm block mb-0.5">{tr("Correo", "Email")}</strong><span className="text-sm text-ink-soft dark:text-[#A7B6AB]">reservas@bnbmedellin.com</span></div>
            </div>
            <a href={whatsapp} target="_blank" rel="noopener"
              className="self-start mt-1.5 inline-flex items-center gap-2 bg-verde text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-verde-2 transition shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
              {tr("Escríbenos ahora", "Message us now")}
            </a>
          </div>
          <div className="rounded-lg overflow-hidden border border-ink/10 dark:border-white/10 min-h-[340px]">
            <iframe loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Transversal+35A+%2366A-88,+Medell%C3%ADn,+Antioquia,+Colombia&output=embed"
              width="100%" height="100%" className="border-0 min-h-[340px]" title="Ubicación B&B Medellín" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const tr = useTr()
  const cards = [
    { star: "★★★★★", label: tr("Excelente ubicación", "Great location") },
    { star: "★★★★★", label: tr("Apartamento impecable", "Impeccable apartment") },
    { star: "★★★★★", label: tr("Atención excepcional", "Exceptional service") },
    { star: "★★★★★", label: tr("Muy recomendado", "Highly recommended") },
  ]
  return (
    <section className="py-20 bg-verde dark:bg-[#16241B] text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-mostaza flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-white" /> {tr("Opiniones", "Reviews")}
          </p>
          <h2 className="text-3xl md:text-4xl mt-3 text-white" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Lo que dicen nuestros huéspedes", "What our guests say")}</h2>
          <p className="text-white/80 text-sm mt-2">{tr("Más de 100 huéspedes nos han calificado con la máxima puntuación.", "Over 100 guests have given us the highest rating.")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((s) => (
            <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 hover:-translate-y-1.5 transition">
              <div className="text-mostaza tracking-wider text-lg mb-2">{s.star}</div>
              <p className="font-bold text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const tr = useTr()
  return (
    <section id="tarifas" className="py-20 bg-[#F1EBDD] dark:bg-[#1A251D]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-mostaza flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> {tr("Tarifas especiales", "Special rates")}
          </p>
          <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Tarifa desde", "Rates from")}</h2>
        </div>
        <div className="max-w-lg mx-auto bg-gradient-to-br from-[#AD2758] to-[#D6336C] text-white rounded-2xl p-10 md:p-14 text-center shadow-xl shadow-black/20 relative">
          <p className="text-xs tracking-widest uppercase text-mostaza flex items-center justify-center gap-2 font-bold mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-4 h-0.5 bg-white" /> {tr("Desde", "From")}
          </p>
          <div className="text-4xl md:text-6xl mt-3 mb-2 font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
            $80.000 <sup className="text-sm font-normal opacity-85" style={{ fontFamily: "'Work Sans', sans-serif" }}>{tr("COP / persona / noche", "COP / person / night")}</sup>
          </div>
          <p className="opacity-90 mb-7 text-sm">{tr("Incluye wifi, café de cortesía y atención personalizada. Consulta tarifas especiales para estancias largas y temporada de Feria de las Flores.", "Includes wifi, complimentary coffee and personalized service. Ask about special rates for long stays and the Flower Festival season.")}</p>
          <a href={whatsapp} target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 bg-white text-[#215E3B] px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-95 transition shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
            {tr("Reservar ahora", "Book now")}
          </a>
        </div>
      </div>
    </section>
  )
}

function Gallery({ gallery }: { gallery: string[] }) {
  const tr = useTr()
  return (
    <section id="galeria" className="py-20 bg-[#F1EBDD] dark:bg-[#1A251D]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-verde dark:text-verde flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> {tr("Galería", "Gallery")}
          </p>
          <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Conoce tu próximo hogar", "Meet your next home")}</h2>
        </div>
        <div className="columns-2 md:columns-3 gap-4">
          {gallery.map((src) => (
            <figure key={src} className="break-inside-avoid mb-4 rounded-xl overflow-hidden shadow-lg group relative">
              <img src={src} alt="" className="w-full object-cover group-hover:scale-105 transition duration-500" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const tr = useTr()
  const faqs = [
    { q: tr("¿Tienen parqueadero?", "Do you have parking?"), a: tr("No contamos con parqueadero propio, pero hay parqueaderos públicos muy cerca del edificio.", "We don't have our own parking, but there are public parking lots very close to the building.") },
    { q: tr("¿La cocina está equipada?", "Is the kitchen equipped?"), a: tr("Sí, contamos con estufa, nevera, utensilios de cocina, hervidora eléctrica y menaje básico.", "Yes, we have a stove, fridge, cookware, an electric kettle and basic tableware.") },
    { q: tr("¿Ofrecen WiFi?", "Do you offer WiFi?"), a: tr("Sí, WiFi de alta velocidad incluido sin costo adicional durante toda tu estancia.", "Yes, high-speed WiFi is included at no extra cost throughout your stay.") },
    { q: tr("¿Cómo puedo reservar?", "How can I book?"), a: tr("Puedes reservar directamente por WhatsApp al 300 444 6421. Sin intermediarios ni comisiones.", "You can book directly on WhatsApp at 300 444 6421. No middlemen, no commissions.") },
    { q: tr("¿Cuál es el horario de check-in y check-out?", "What are the check-in and check-out times?"), a: tr("El check-in es desde las 15:00 y el check-out hasta las 11:00. Coordinamos horarios flexibles.", "Check-in is from 3:00 p.m. and check-out until 11:00 a.m. We can arrange flexible times.") },
    { q: tr("¿Hay recepción 24 horas?", "Is there 24-hour reception?"), a: tr("Sí, tenemos personal disponible para atenderte en todo momento durante tu estancia.", "Yes, we have staff available to assist you at any time during your stay.") },
    { q: tr("¿Se permite fumar?", "Is smoking allowed?"), a: tr("No se permite fumar dentro de los apartamentos. Hay áreas designadas en las zonas comunes.", "Smoking is not allowed inside the apartments. There are designated areas in the common spaces.") },
  ]
  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-verde dark:text-verde flex items-center justify-center gap-2 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-5 h-0.5 bg-mostaza" /> FAQ
          </p>
          <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Preguntas frecuentes", "Frequently asked questions")}</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="bg-white dark:bg-[#1E2A22] rounded-xl border border-ink/5 dark:border-white/10 overflow-hidden group">
              <summary className="px-6 py-4 font-semibold text-sm cursor-pointer flex items-center justify-between list-none">
                {faq.q}
                <span className="text-verde dark:text-verde text-lg group-open:rotate-45 transition" style={{ fontFamily: "'Space Mono', monospace" }}>+</span>
              </summary>
              <p className="px-6 pb-4 text-sm text-ink-soft dark:text-[#A7B6AB]">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhatsappCta() {
  const tr = useTr()
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <section id="contacto" className="py-20 bg-gradient-to-br from-[#2E7D4F] to-[#215E3B] text-white text-center relative overflow-hidden">
      <div className="max-w-xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: "'Fraunces', serif" }}>{tr("¿Listo para tu estadía?", "Ready for your stay?")}</h2>
        <p className="text-white/90 mb-2">{tr("Escríbenos por WhatsApp o regístrate directamente, sin salir de la página.", "Message us on WhatsApp or register directly, without leaving the page.")}</p>
        <div className="text-2xl font-bold my-4 flex items-center justify-center gap-3" style={{ fontFamily: "'Space Mono', monospace" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
          300 444 6421
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={whatsapp} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-white text-[#215E3B] px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-95 transition shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
            {tr("Escribir ahora", "Message now")}
          </a>
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white hover:text-[#215E3B] transition shadow-lg">
            {tr("Regístrate sin WhatsApp", "Register without WhatsApp")}
          </button>
        </div>
        <p className="mt-5 text-sm text-white/80">{tr("Respuesta inmediata, reserva directa sin comisiones", "Immediate response, direct booking with no commissions")}</p>
      </div>
      {modalOpen && <PreRegistroModal onClose={() => setModalOpen(false)} />}
    </section>
  )
}

function PreRegistroModal({ onClose }: { onClose: () => void }) {
  const tr = useTr()
  const createPreRegistro = useCreatePreRegistro()
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    checkIn: "", checkOut: "", personas: 1, mensaje: "",
  })

  const update = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) return
    createPreRegistro.mutate({
      nombre: form.nombre, apellido: form.apellido, email: form.email, telefono: form.telefono,
      checkInDate: form.checkIn || undefined, checkOutDate: form.checkOut || undefined,
      personas: form.personas, mensaje: form.mensaje,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white text-ink dark:bg-[#1E2A22] dark:text-[#ECF1EC] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {createPreRegistro.isSuccess ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-verde/10 text-verde flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Fraunces', serif" }}>{tr("¡Solicitud recibida!", "Request received!")}</h3>
            <p className="text-sm text-ink-soft dark:text-[#A7B6AB] mb-5">
              {tr(`Gracias, ${form.nombre}. Te contactaremos muy pronto a ${form.email} o ${form.telefono} para confirmar tu reserva.`, `Thank you, ${form.nombre}. We'll contact you very soon at ${form.email} or ${form.telefono} to confirm your booking.`)}
            </p>
            <button onClick={onClose} className="bg-verde text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-verde-2 transition">{tr("Cerrar", "Close")}</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ fontFamily: "'Fraunces', serif" }}>{tr("Solicita tu reserva", "Request your booking")}</h3>
              <button onClick={onClose} className="text-ink-soft hover:text-fucsia text-xl leading-none">✕</button>
            </div>
            <p className="text-sm text-ink-soft dark:text-[#A7B6AB] mb-4">
              {tr("Déjanos tus datos y te contactaremos para confirmar disponibilidad. No necesitas WhatsApp para reservar.", "Leave us your details and we'll get in touch to confirm availability. You don't need WhatsApp to book.")}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={tr("Nombre", "First name")} value={form.nombre} onChange={(e) => update("nombre", e.target.value)}
                  className="px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
                <input placeholder={tr("Apellido", "Last name")} value={form.apellido} onChange={(e) => update("apellido", e.target.value)}
                  className="px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
              </div>
              <input required type="email" placeholder={tr("Correo electrónico", "Email")} value={form.email} onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
              <input required placeholder={tr("Teléfono / celular", "Phone / mobile")} value={form.telefono} onChange={(e) => update("telefono", e.target.value)}
                className="w-full px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Entrada", "Check-in")}</label>
                  <input type="date" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)}
                    className="w-full px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("Salida", "Check-out")}</label>
                  <input type="date" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)}
                    className="w-full px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-soft dark:text-[#A7B6AB] block mb-1">{tr("N° de personas", "No. of guests")}</label>
                <input type="number" min={1} value={form.personas} onChange={(e) => update("personas", Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm" />
              </div>
              <textarea placeholder={tr("Mensaje (opcional)", "Message (optional)")} value={form.mensaje} onChange={(e) => update("mensaje", e.target.value)}
                rows={2} className="w-full px-3 py-2 border border-ink/15 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm resize-none" />
              {createPreRegistro.isError && (
                <p className="text-xs text-rojo">{tr("Ocurrió un error al enviar tu solicitud. Intenta de nuevo.", "Something went wrong sending your request. Please try again.")}</p>
              )}
              <button type="submit" disabled={createPreRegistro.isPending}
                className="w-full bg-verde text-white py-3 rounded-full text-sm font-bold hover:bg-verde-2 transition disabled:opacity-50">
                {createPreRegistro.isPending ? tr("Enviando...", "Sending...") : tr("Enviar solicitud", "Send request")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Footer() {
  const tr = useTr()
  return (
    <footer className="bg-verde-2 dark:bg-[#0E1712] text-white/85 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-verde text-white flex items-center justify-center font-bold text-sm" style={{ fontFamily: "'Fraunces', serif" }}>B&amp;B</span>
              <div>
                <strong className="text-lg text-white" style={{ fontFamily: "'Fraunces', serif" }}>B&amp;B Medellín</strong>
                <span className="block text-[10px] tracking-widest text-mostaza uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>Bed &amp; Breakfast</span>
              </div>
            </div>
            <p className="text-white/65 text-sm max-w-xs">{tr("Apartamentos en Medellín, cerca a Unicentro y Laureles. Reserva directa, sin intermediarios.", "Apartments in Medellín, near Unicentro and Laureles. Direct booking, no middlemen.")}</p>
          </div>
          <div>
            <h5 className="text-xs tracking-widest uppercase text-mostaza mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>{tr("Contacto", "Contact")}</h5>
            <ul className="text-sm space-y-2">
              <li>300 444 6421</li>
              <li>info@bbmedellin.com</li>
              <li>Medellín, Antioquia</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs tracking-widest uppercase text-mostaza mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>{tr("Enlaces", "Links")}</h5>
            <ul className="text-sm space-y-2">
              <li><a href="#habitaciones" className="hover:text-mostaza transition">{tr("Apartamentos", "Apartments")}</a></li>
              <li><a href="/login" className="hover:text-mostaza transition">Admin</a></li>
              <li><a href="#faq" className="hover:text-mostaza transition">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 pt-5 text-xs text-white/55 flex flex-wrap justify-between gap-4">
          <span>{tr("© 2026 B&B Medellín. Todos los derechos reservados.", "© 2026 B&B Medellín. All rights reserved.")}</span>
          <span>Medellín, Antioquia, Colombia</span>
        </div>
      </div>
    </footer>
  )
}

function FloatingWhatsApp() {
  return (
    <a href={whatsapp} target="_blank" rel="noopener"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-wa rounded-full flex items-center justify-center shadow-xl shadow-wa/40 hover:scale-105 transition animate-pulse-shadow">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" /></svg>
    </a>
  )
}
