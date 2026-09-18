# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
ENV HUSKY=0 CI=true VITE_USAR_MOCKS=false
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/contrato/package.json packages/contrato/
COPY packages/nucleo/package.json packages/nucleo/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter @sequencias/web... --filter .
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm --filter @sequencias/web build

FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
