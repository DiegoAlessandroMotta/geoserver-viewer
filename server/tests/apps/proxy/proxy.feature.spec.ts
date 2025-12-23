import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import express from 'express'
import request from 'supertest'
import { proxyRoutes } from '@/apps/proxy/providers'
import { errorHandlerMiddleware } from '@/shared/providers'
import { serverConfig } from '@/shared/config'

describe('Proxy feature tests', () => {
  let app: express.Express
  const originalAllowed = serverConfig.geoserverAllowedHosts

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/proxy', proxyRoutes.routes())
    app.use(errorHandlerMiddleware.handle)
  })

  afterEach(() => {
    serverConfig.geoserverAllowedHosts = originalAllowed
    vi.restoreAllMocks()
  })

  it('returns 400 when X-GeoServer-BaseUrl header is missing', async () => {
    const res = await request(app).get('/api/proxy/geoserver/some/path')
    expect(res.status).toBe(400)

    expect(res.body).toHaveProperty('statusCode', 400)
    expect(res.body).toHaveProperty('errorCode', 'MISSING_GEOSERVER_BASEURL')
    expect(res.body).toHaveProperty('message')
    expect(String(res.body.message)).toContain('Missing')
  })

  it('returns 403 when host is not allowed', async () => {
    serverConfig.geoserverAllowedHosts = ['localhost:8080']

    const res = await request(app)
      .get('/api/proxy/geoserver/some/path')
      .set('X-GeoServer-BaseUrl', 'http://malicious.example.com')

    expect(res.status).toBe(403)
    expect(res.body).toHaveProperty('errorCode', 'GEOSERVER_HOST_NOT_ALLOWED')
  })

  it('returns 502 when geoserver is unreachable', async () => {
    const err: any = new Error('connect refused')
    err.code = 'ECONNREFUSED'
    globalThis.fetch = vi.fn(async () => {
      throw err
    }) as any

    serverConfig.geoserverAllowedHosts = ['*']

    const res = await request(app)
      .get('/api/proxy/geoserver/some/path')
      .set('X-GeoServer-BaseUrl', 'http://localhost:8080')

    expect(res.status).toBe(502)
    expect(res.body).toHaveProperty('errorCode', 'GEOSERVER_UNREACHABLE')
  })

  it('returns 200 on successful proxy', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        ({
          status: 200,
          headers: new Headers({ 'content-type': 'text/plain' }),
          body: null,
        }) as any,
    ) as any

    serverConfig.geoserverAllowedHosts = ['*']

    const res = await request(app)
      .get('/api/proxy/geoserver/some/path')
      .set('X-GeoServer-BaseUrl', 'http://localhost:8080')

    expect(res.status).toBe(200)
  })
})
