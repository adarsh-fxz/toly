# syntax=docker/dockerfile:1
# Build from the repo root: docker build -f apps/api/Dockerfile .
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2.11.10 prune @toly/api --docker

FROM base AS build
COPY --from=prune /repo/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
RUN pnpm --filter @toly/api build

# One-off database migrations: docker compose run --rm migrate
FROM build AS migrate
CMD ["pnpm", "--filter", "@toly/db", "migrate"]

# The API bundles all of its dependencies, so the runtime image only needs dist/.
FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
