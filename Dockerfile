FROM node:26-trixie-slim AS base
RUN npm install -g pnpm@11.9.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json

# Estágio próprio: só muda quando o lockfile muda, e não a cada commit de código.
FROM base AS prod-deps
RUN CI=true pnpm install --prod --frozen-lockfile --filter "@expense-tracker/api..."

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26-trixie-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY package.json ./
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/drizzle ./apps/api/drizzle
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

# As migrations usam o caminho relativo ./drizzle.
WORKDIR /app/apps/api
USER node
EXPOSE 3000
CMD ["sh", "-c", "node dist/database/migrate.js && exec node dist/server.js"]
