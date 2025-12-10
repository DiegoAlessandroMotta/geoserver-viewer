# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile

COPY client/ ./client/

ARG VITE_PROXY_URL
ARG VITE_MAP_CENTER
ARG VITE_MAP_ZOOM
ARG VITE_MAP_MIN_ZOOM
ARG VITE_MAP_MAX_ZOOM
ARG VITE_MAP_STYLE
ARG VITE_BASE_PATH

RUN VITE_PROXY_URL=$VITE_PROXY_URL \
    VITE_MAP_CENTER=$VITE_MAP_CENTER \
    VITE_MAP_ZOOM=$VITE_MAP_ZOOM \
    VITE_MAP_MIN_ZOOM=$VITE_MAP_MIN_ZOOM \
    VITE_MAP_MAX_ZOOM=$VITE_MAP_MAX_RZOOM \
    VITE_MAP_STYLE=$VITE_MAP_STYLE \
    VITE_BASE_PATH=$VITE_BASE_PATH \
    pnpm build:client

RUN pnpm build:client

# Stage 2: Serve
FROM nginx:alpine

# COPY client/nginx.conf /etc/nginx/nginx.conf

# COPY --from=builder /app/client/dist /usr/share/nginx/html

# CMD ["nginx", "-g", "daemon off;"]

COPY nginx.conf /etc/nginx/nginx.conf
COPY client/nginx.conf /etc/nginx/conf.d/client.conf
COPY server/nginx.conf /etc/nginx/conf.d/server.conf

COPY --from=builder /app/client/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
