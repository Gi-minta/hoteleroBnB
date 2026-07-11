# Hotelero

## Stack

React 19 + TanStack Router/Query + Tailwind CSS 4 — Hono + Prisma (SQLite) — JWT + bcryptjs

## Commands

| Command | What it runs |
|---------|-------------|
| `npm run dev` | concurrently → server (:3001) + client (:4200, proxy `/api` → :3001) |
| `npm run dev:server` | `tsx watch src/index.ts` (from `server/`) |
| `npm run dev:client` | `vite` (from `client/`) |
| `npm test` | server vitest then client vitest |
| `npm run test:server` | `vitest run` in `server/` — node env, `src/**/*.test.ts` |
| `npm run test:client` | `vitest run` in `client/` — jsdom env, `src/**/*.test.{ts,tsx}`, setup file at `src/__tests__/setup.ts` |
| `npm run setup` | install all deps → prisma generate → db push → seed |
| `npm run db:generate` | `prisma generate` |
| `npm run db:push` | `prisma db push` (no migration files, schema-driven) |
| `npm run db:seed` | `tsx src/seed.ts` |

No linter or formatter configured in the repo.

## Architecture

```
Hotelero/
├── server/           → API (Hono + Prisma, ESM)
│   ├── prisma/       → schema.prisma (SQLite)
│   ├── src/
│   │   ├── index.ts  → app entry, mounts all route modules
│   │   ├── routes/   → auth, guests, rooms, reservations, responsables, payments, dashboard, escnna, landing, photos, uploads
│   │   ├── middleware/auth.ts
│   │   ├── lib/prisma.ts  → PrismaClient singleton
│   │   └── seed.ts
│   └── uploads/      → file upload destination (gitignored)
├── client/           → SPA (Vite, ESM, `@/` alias → `src/`)
│   └── src/
│       ├── main.tsx  → bootstraps router + QueryClient + providers
│       ├── api/      → TanStack Query hooks + axios client
│       ├── context/  → AuthContext (JWT), I18nContext (ES/EN)
│       └── routes/   → TanStack Router pages (manual route file tree)
└── data/             → SQLite DB file (gitignored .db)
```

## Key conventions

- UI in Spanish; i18n via `I18nContext` with flat dotted keys
- JWT stored in `localStorage`, sent as `Authorization: Bearer` via axios interceptor
- Demo login: `admin` / `admin123`
- Dark mode: class `.dark` on `<html>`, persisted in `localStorage`
- `@/` path alias resolves to `client/src/`
- DB at `data/hotelero.db`, env vars in `server/.env` (`DATABASE_URL`, `JWT_SECRET`, `PORT`)
- File uploads POST `/api/uploads` → `server/uploads/` (gitignored, not in CI)

## API structure

All routes mounted under `/api/*`. Auth routes (`/api/auth/*`) are unauthenticated; all others require JWT middleware (Bearer token). Health check at `GET /api/health`.

## Frontend routes

| Route | Page |
|-------|------|
| `/` | Landing (hero, gallery, FAQ, pre-registro form) |
| `/login` | Login + register (tab toggle) |
| `/admin` | Dashboard (stats, revenue chart, occupancy, upcoming check-in/out) |
| `/admin/reservations` | Reservation list + filters + payment modal |
| `/admin/reservations/new` | 5-step wizard (prefillable via `sessionStorage("prefillGuest")`) |
| `/admin/pre-registros` | Pre-registro request management |
| `/admin/guests` | Guest list |
| `/admin/rooms` | Room grid |
| `/admin/responsables` | Payment responsables |
| `/admin/escnna` | ESCNNA 5-step checklist (localStorage) |
