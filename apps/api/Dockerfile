# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
ENV HUSKY=0 CI=true
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/contrato/package.json packages/contrato/
COPY packages/nucleo/package.json packages/nucleo/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @sequencias/api... --filter .
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @sequencias/api build

FROM base AS runtime
ENV NODE_ENV=production PORTA=3333 HOST=0.0.0.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/contrato/package.json packages/contrato/
COPY packages/nucleo/package.json packages/nucleo/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --prod --filter @sequencias/api... --ignore-scripts
COPY --from=build /app/apps/api/dist ./apps/api/dist
USER node
EXPOSE 3333
CMD ["node", "--expose-gc", "apps/api/dist/servidor.js"]
