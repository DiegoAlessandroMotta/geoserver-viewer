import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const get = (name: string, defaultValue: any = '') => {
  const val =
    loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')[name] ??
    defaultValue

  if (val === '') {
    return
  }

  return val
}

// https://vite.dev/config/
export default defineConfig({
  base: (() => {
    const raw = get('VITE_BASE_PATH') ?? ''
    let base = raw.trim()

    if (base.length === 0) {
      return '/'
    }

    if (!base.startsWith('/')) {
      base = `/${base}`
    }

    base = base.replace(/\/+$/, '')

    return `${base}/`
  })(),
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
