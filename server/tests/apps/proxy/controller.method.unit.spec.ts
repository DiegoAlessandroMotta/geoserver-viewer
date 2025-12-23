import express from 'express'
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { proxyRoutes } from '@/apps/proxy/providers'
import { errorHandlerMiddleware } from '@/shared/providers'

describe('Proxy controller methods', () => {
  it('returns 405 for unsupported methods (POST)', async () => {
    const app = express()
    app.use(express.json())
    app.use('/api/proxy', proxyRoutes.routes())
    app.use(errorHandlerMiddleware.handle)

    const res = await request(app)
      .post('/api/proxy/geoserver/some/path')
      .set('X-GeoServer-BaseUrl', 'http://localhost:8080')

    expect(res.status).toBe(405)
    expect(res.body).toHaveProperty('message')
    expect(String(res.body.message)).toContain('Only GET and HEAD')
  })
})
