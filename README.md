# GeoServer Viewer

Aplicación web para explorar capas GeoServer con un backend que actúa como proxy.

## Requisitos

- Docker & Docker Compose (o Docker Compose V2 `docker compose`)
- Node >= 24 (si usas desarrollo local con pnpm)
- pnpm (recomendado) - https://pnpm.io/

## Desarrollo local (pnpm)

Si prefieres ejecutar la aplicación sin contenedores:

1. Instala dependencias:

   ```bash
   npm i -g pnpm     # si no tienes pnpm
   pnpm install
   ```

2. Copia las variables de entorno

   Ejecuta los pasos siguientes para preparar los `.env` y arrancar cliente y servidor en modo desarrollo en un solo comando:

   ```bash
   pnpm install
   pnpm copy-env
   pnpm dev
   ```

   > Nota: el comando `pnpm dev` ejecuta el servidor y el cliente con `concurrently`. Verás las salidas en consola coloreadas y etiquetadas como `server` y `client` para facilitar la lectura de logs.

   **Opción:** Si prefieres ejecutarlos en terminales separadas en vez de `pnpm dev`:

   ```bash
   # Terminal A - servidor
   pnpm dev:server

   # Terminal B - cliente (Vite)
   pnpm dev:client
   ```

3. Abre el cliente (Vite) en:

   - http://localhost:5173 (Vite) y debería usar por defecto `VITE_PROXY_URL=http://localhost:3001/api/proxy` para la API

## Docker

Para probar la app con Docker Compose.

1. Copia variables de entorno:

   ```bash
   cp .env.template .env
   ```

2. (Opcional) Edita `.env` para cambiar el puerto de la app (`APP_PORT`) o ajustes de la API (cliente/servidor).

3. Inicia la app con Docker Compose:

   ```bash
   docker compose up --build
   ```

4. Abre la aplicación en el navegador:

   - Cliente (nginx): http://localhost:4000 (o el puerto configurado en `APP_PORT` en `.env`)

> Nota: El cliente usa `VITE_PROXY_URL` para comunicarse con el backend. Si estás ejecutando la app localmente sin Docker, actualiza `VITE_PROXY_URL` en `client/.env.template`.

## Build & Run

- Build server: `pnpm build:server`
- Start server: `pnpm start:server`
- Build client: `pnpm build:client`
- Preview client: `pnpm preview:client`

## Variables de entorno

- Usa las plantillas `.env.template` en la raíz y en `client/.env.template` y `server/.env.template`.
- Algunas variables comunes:
  - `APP_PORT` — Puerto en host donde se sirve la aplicación completa usando docker
  - `APP_NAME` - Nombre de la aplicación que se mostrará en los logs y web
  - `CORS_ENABLED` - Activar configuración de cors (permite que el navegador se comunique con el backend)
  - `CORS_ALLOWED_ORIGINS` - Dominios que el servidor aceptará separados por coma (ej, 'https://example.com,https://www.example.com')
  - `VITE_PROXY_URL` — URL base para que el cliente alcance el API (ej. http://localhost:3001/api/proxy)
  - `VITE_MAP_CENTER`, `VITE_MAP_ZOOM`, `VITE_MAP_STYLE` — configuración del mapa

## Linters & Formato

- Lint client: `pnpm lint:client`  
- Lint server: `pnpm lint:server`  
- Formatear: `pnpm format:client` / `pnpm format:server`

## Notas útiles

- La versión por defecto del workspace utiliza `pnpm` como package manager.
- Si usas Docker, los contenedores se construyen usando los Dockerfile en `client/` y `server/`.
- En modo desarrollo, asegúrate que `VITE_PROXY_URL` apunte al servidor (por defecto `http://localhost:3001/api/proxy`).
