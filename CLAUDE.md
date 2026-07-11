# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Hotelero is a Spanish-language hotel / B&B management app ("B&B Medellín") with a public landing page and an authenticated admin panel. It's an npm monorepo: `client/` (React 19 SPA) and `server/` (Hono API + Prisma/SQLite), orchestrated by the root `package.json`. Domain fields and most UI copy are in Spanish (`nombre`, `apellido`, `documento`, `habitacion`, `huésped`, etc.); keep new domain code in the same language.

## Commands

Run from the repo root unless noted.

- `npm run setup` — one-time bootstrap: installs all deps, runs `prisma generate`, `prisma db push`, and seeds the DB.
- `npm run dev` — runs server (`:3001`) and client (`:4200`) together via `concurrently`. The Vite dev server proxies `/api` → `localhost:3001`, so use `http://localhost:4200`.
- `npm run build` — builds client then server.
- `npm test` — runs server tests then client tests. Also `npm run test:server` / `npm run test:client`.
- `npm run db:generate` — regenerate Prisma client (**required after any `schema.prisma` change**).
- `npm run db:push` — apply schema to the SQLite file (no migrations are used).
- `npm run db:seed` — seed admin user + room types/rooms. Default login: `admin` / `admin123`.

Single test (both sides use Vitest):
- Server: `cd server && npx vitest run src/__tests__/api.test.ts -t "rejects empty body"`
- Client: `cd client && npx vitest run src/__tests__/app.test.tsx`
- Watch mode: `npm run test:watch` in either `server/` or `client/`.

## Server architecture (`server/`)

- **Hono** app in `src/index.ts` mounts one router module per domain under `/api/*` (`auth`, `guests`, `rooms`, `reservations`, `responsables`, `payments`, `dashboard`, `uploads`, `escnna`, `photos`, `landing`). To add a domain, create `src/routes/<name>.ts` exporting a `Hono()` instance and `app.route()` it in `index.ts`.
- **ESM with explicit `.js` extensions in imports**, even though the source is `.ts` (e.g. `import prisma from "../lib/prisma.js"`). Follow this — dropping the extension breaks the build/runtime.
- **Auth**: JWT via `src/middleware/auth.ts`. `authMiddleware` reads `Authorization: Bearer`, verifies, and sets `c.set("user", payload)` (read as `c.get("user")` or `c.var.user`). Apply it either router-wide (`router.use("*", authMiddleware)`) or per-route; `landing.ts` is the mixed case — public GET/POST endpoints plus `landing.use("/admin/*", authMiddleware)` guarding the admin subset.
- **Prisma** singleton in `src/lib/prisma.ts`; SQLite DB at `data/hotelero.db` (`DATABASE_URL` in `server/.env`). Config (JWT secret, port) also comes from `server/.env`.
- **Uploads**: `uploads.ts` writes multipart files to `process.cwd()/uploads`, served statically at `/uploads/*`.
- **Tests** (`src/__tests__/api.test.ts`) drive routers directly with `app.request(path, opts)` — no running server or DB needed for the unauthorized/validation cases.

## Client architecture (`client/`)

- **React 19 + Vite + Tailwind CSS v4** (via `@tailwindcss/vite`). `@` aliases `src/`.
- **Routing is manual, not file-based.** Despite `.lazy.tsx` filenames, `src/main.tsx` imports each page and wires the TanStack Router route tree by hand, with `PublicLayout` (`/`, `/login`) and `AdminLayout` (`/admin/*`, sidebar). Adding a page means creating the component **and** registering a `createRoute` + adding it to `routeTree` in `main.tsx`.
- **Data layer**: TanStack Query. One hook file per domain in `src/api/queries/*.ts` wrapping the shared Axios `client` (`src/api/client.ts`). Follow the existing pattern: `queryKey: ["<domain>", ...]`, and mutations `invalidateQueries` the affected keys (e.g. creating a reservation invalidates `reservations`, `rooms`, `dashboard`).
- **Axios client** (`src/api/client.ts`) has `baseURL: "/api"`, injects the localStorage `token` on every request, and on any `401` clears storage and redirects to `/login`.
- **Auth state**: `context/AuthContext.tsx` persists `user`/`token` in localStorage; `isAuthenticated` gates `AdminLayout`.
- **i18n**: lightweight custom `context/I18nContext.tsx` with inline `es`/`en` dictionaries and a `t(key)` lookup — no i18n library. Add keys to both dicts.
- **Theming**: the admin can recolor the whole app. The palette is stored server-side in `LandingContent` and applied at runtime via `src/lib/palette.ts` (`applyPalette` / `paletteFromLandingContent`); `PaletteSync` in `main.tsx` fetches it (public, unauthenticated) on boot. Tailwind semantic color tokens like `ink` / `ink-soft` are driven by this — don't hardcode hex values where a token exists.

## Data model notes (`server/prisma/schema.prisma`)

- A `Reservation` spans multiple rooms via the `ReservationRoom` join (each carries `pricePerNight`/`nights`), plus `Payment[]`. Booking (`POST /api/reservations`) checks date-range overlap against non-cancelled reservations and returns `409` on conflict.
- Reservation `status` flows `Pendiente` → `Confirmada` → `CheckIn` → `CheckOut`, or `Cancelada`; there are dedicated `POST /:id/{cancel,checkin,checkout}` actions rather than free-form status edits.
- `ResponsablePago` is the billing party (invoicing entity, `CUIT`/`posicionIva`) attachable to a reservation.
- `EscnnaChecklist` backs a legally-motivated child-protection (ESCNNA) compliance workflow — a stepped checklist stored as `paso` + JSON `data`.
- `PreRegistro` holds public booking requests from the landing form (status `Pendiente`/`Contactado`/`Convertido`/`Descartado`), surfaced in admin under "Solicitudes".
- Enum-like fields (`status`, `estado`, `role`, `tipoDocumento`) are plain strings — validate values in route handlers, not the schema.
