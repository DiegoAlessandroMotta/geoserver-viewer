# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile

COPY server/ ./server/

RUN pnpm build:server

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/server/dist ./server/dist

CMD ["pnpm", "start:server"]
