import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, Link } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { I18nProvider, useI18n } from "@/context/I18nContext"
import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { LayoutDashboard, CalendarDays, Users, DoorOpen, Building2, LogOut, Menu, Shield, PenLine, UserCog, CalendarRange, Settings, ClipboardList, FileText } from "lucide-react"
import { useState } from "react"
import client from "@/api/client"
import { applyPalette, applyCachedPalette, paletteFromLandingContent } from "@/lib/palette"
import "./index.css"

import HomePage from "./routes/index.lazy"
import LoginPage from "./routes/login.lazy"
import DashboardPage from "./routes/admin/index.lazy"
import ReservationsPage from "./routes/admin/reservations.lazy"
import GuestsPage from "./routes/admin/guests.lazy"
import RoomsPage from "./routes/admin/rooms.lazy"
import ResponsablesPage from "./routes/admin/responsables.lazy"
import EscnnaPage from "./routes/admin/escnna.lazy"
import NewReservationPage from "./routes/admin/reservations-new.lazy"
import LandingEditorPage from "./routes/admin/landing.lazy"
import UsersPage from "./routes/admin/users.lazy"
import CalendarPage from "./routes/admin/calendar.lazy"
import SettingsPage from "./routes/admin/settings.lazy"
import PreRegistrosPage from "./routes/admin/pre-registros.lazy"
import RegistrosPage from "./routes/admin/registros.lazy"
import NotFoundPage from "./routes/404.lazy"
import ErrorBoundary from "./components/ErrorBoundary"

// Aplica de inmediato la paleta cacheada (además del script inline de index.html,
// cubre el caso de recarga completa vía React antes del primer paint del árbol).
applyCachedPalette()

// ── Sincronización global de la paleta ──────────────
// Se monta una sola vez en el árbol raíz. Trae la paleta guardada en el
// servidor (pública, sin auth) y la aplica en TODAS las páginas —landing
// pública y admin— no solo cuando se visita /admin/settings.
function PaletteSync() {
  const { data } = useQuery({
    queryKey: ["palette-boot"],
    queryFn: async () => {
      const { data } = await client.get("/landing/content")
      return data as { section: string; key: string; value: string }[]
    },
    staleTime: 60_000,
  })

  useEffect(() => {
    if (data) applyPalette(paletteFromLandingContent(data))
  }, [data])

  return null
}

// ── Layouts ──────────────────────────────────────────
function PublicLayout() {
  return (
    <>
      <PaletteSync />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/reservations", icon: CalendarDays, label: "Reservas" },
  { to: "/admin/pre-registros", icon: ClipboardList, label: "Solicitudes" },
  { to: "/admin/registros", icon: FileText, label: "Registros" },
  { to: "/admin/guests", icon: Users, label: "Huéspedes" },
  { to: "/admin/rooms", icon: DoorOpen, label: "Habitaciones" },
  { to: "/admin/responsables", icon: Building2, label: "Responsables" },
  { to: "/admin/escnna", icon: Shield, label: "ESCNNA" },
  { to: "/admin/landing", icon: PenLine, label: "Landing Page" },
  { to: "/admin/users", icon: UserCog, label: "Usuarios" },
  { to: "/admin/calendar", icon: CalendarRange, label: "Calendario" },
  { to: "/admin/settings", icon: Settings, label: "Configuración" },
]

function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth()
  const { t, toggleLang } = useI18n()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("darkMode", dark ? "true" : "false")
  }, [dark])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-soft">Redirigiendo al login...</p>
        <div className="hidden">{/* using Link to trigger redirect */}<Link to="/login">Login</Link></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="font-serif text-xl font-bold">B&B Medellín</h1>
          <p className="text-sm text-white/60 mt-1">{user?.username}</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              activeProps={{ className: "text-white bg-white/10 font-medium" }}
              onClick={() => setSidebarOpen(false)}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <button onClick={() => setDark(!dark)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition w-full mt-2">
            {dark ? "☀️" : "🌙"} {t("nav.dark")}
          </button>
          <button onClick={toggleLang}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition w-full mt-2">
            🌐 {t("nav.lang")}
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition w-full mt-2">
            <LogOut size={18} />
            {t("nav.logout")}
          </button>
        </nav>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={20} /></button>
          <h2 className="font-semibold">B&B Medellín</h2>
        </header>
        <main className="flex-1 overflow-auto p-6"><Outlet /></main>
      </div>
    </div>
  )
}

// ── Routes ───────────────────────────────────────────
const rootRoute = createRootRoute({ component: PublicLayout, errorComponent: ErrorBoundary, notFoundComponent: NotFoundPage })

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage })

const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: AdminLayout })
const adminIndexRoute = createRoute({ getParentRoute: () => adminRoute, path: "/", component: DashboardPage })
const adminReservationsRoute = createRoute({ getParentRoute: () => adminRoute, path: "/reservations", component: ReservationsPage })
const adminReservationsNewRoute = createRoute({ getParentRoute: () => adminRoute, path: "/reservations/new", component: NewReservationPage })
const adminPreRegistrosRoute = createRoute({ getParentRoute: () => adminRoute, path: "/pre-registros", component: PreRegistrosPage })
const adminRegistrosRoute = createRoute({ getParentRoute: () => adminRoute, path: "/registros", component: RegistrosPage })
const adminGuestsRoute = createRoute({ getParentRoute: () => adminRoute, path: "/guests", component: GuestsPage })
const adminRoomsRoute = createRoute({ getParentRoute: () => adminRoute, path: "/rooms", component: RoomsPage })
const adminResponsablesRoute = createRoute({ getParentRoute: () => adminRoute, path: "/responsables", component: ResponsablesPage })
const adminEscnnaRoute = createRoute({ getParentRoute: () => adminRoute, path: "/escnna", component: EscnnaPage })
const adminLandingRoute = createRoute({ getParentRoute: () => adminRoute, path: "/landing", component: LandingEditorPage })
const adminUsersRoute = createRoute({ getParentRoute: () => adminRoute, path: "/users", component: UsersPage })
const adminCalendarRoute = createRoute({ getParentRoute: () => adminRoute, path: "/calendar", component: CalendarPage })
const adminSettingsRoute = createRoute({ getParentRoute: () => adminRoute, path: "/settings", component: SettingsPage })

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminReservationsRoute,
    adminReservationsNewRoute,
    adminPreRegistrosRoute,
    adminRegistrosRoute,
    adminGuestsRoute,
    adminRoomsRoute,
    adminResponsablesRoute,
    adminEscnnaRoute,
    adminLandingRoute,
    adminUsersRoute,
    adminCalendarRoute,
    adminSettingsRoute,
  ]),
])

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } })

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: { auth: undefined },
})

declare module "@tanstack/react-router" {
  interface Register { router: typeof router }
}

function App() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
)
