import express from 'express'
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { CorsMiddleware } from '@/shared/middlewares/cors.middleware'

describe('CorsMiddleware', () => {
  it('allows requests when origin is undefined (same-origin)', async () => {
    const app = express()
    const cm = new CorsMiddleware(['https://example.com'])
    app.use(cm.handle)
    app.get('/', (_req, res) => res.send('ok'))

    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe('ok')
  })

  it('allows requests from allowed origin', async () => {
    const app = express()
    const cm = new CorsMiddleware(['https://example.com'])
    app.use(cm.handle)
    app.get('/', (_req, res) => res.send('ok'))

    const res = await request(app).get('/').set('Origin', 'https://example.com')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe(
      'https://example.com',
    )
  })

  it('blocks requests from disallowed origin', async () => {
    const app = express()
    const cm = new CorsMiddleware(['https://example.com'])
    app.use(cm.handle)
    app.get('/', (_req, res) => res.send('ok'))

    const res = await request(app).get('/').set('Origin', 'https://bad.example')
    expect(res.status).toBe(500)
  })
})
