# Dockerfile del backend (Hono + Prisma + SQLite).
# Contexto de build: la carpeta `server/`.
#   docker build -t hotelero-server ./server
#   docker run -p 3001:3001 \
#     -e DATABASE_URL="file:/data/hotelero.db" \
#     -e JWT_SECRET="pon-un-secreto-fuerte" \
#     -e CORS_ORIGINS="https://gi-minta.github.io" \
#     -v hotelero_data:/data -v hotelero_uploads:/app/uploads \
#     hotelero-server
#
# Notas:
# - SQLite es un archivo: monta un volumen para /data (DATABASE_URL) y para
#   /app/uploads (fotos de documentos) o perderás los datos en cada redeploy.
# - Al arrancar se aplica el esquema con `prisma db push` (idempotente). El
#   primer arranque NO crea el usuario admin; para sembrarlo ejecuta una vez:
#     docker run --rm -e DATABASE_URL=... -v hotelero_data:/data \
#       hotelero-server npx tsx src/seed.ts

# ---- Etapa de build ----
FROM node:22-slim AS build
WORKDIR /app
# OpenSSL es requerido por los motores de Prisma.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Etapa de runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
# Copiamos node_modules ya resueltos (incluye el cliente Prisma generado y el
# CLI de prisma que usa el arranque para `db push`).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 3001
# Aplica el esquema (crea la DB si no existe) y arranca la API.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
