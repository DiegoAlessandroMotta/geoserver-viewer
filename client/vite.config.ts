import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: (() => {
    const raw = process.env.VITE_BASE_PATH ?? ''
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
