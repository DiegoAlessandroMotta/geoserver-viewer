import express from 'express'
import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'
import { proxyRoutes } from '@/apps/proxy/providers'
import { errorHandlerMiddleware } from '@/shared/providers'

function createFakeBody(chunks: Uint8Array[]) {
  let i = 0
  return {
    getReader: () => ({
      read: async () => {
        if (i >= chunks.length) return { done: true, value: undefined }
        const v = chunks[i++]
        return { done: false, value: v }
      },
      releaseLock: () => {},
    }),
  } as any
}

describe('Proxy controller streaming', () => {
  it('streams response body from GeoServer to client', async () => {
    const chunk1 = new Uint8Array([65, 66])
    const chunk2 = new Uint8Array([67])

    globalThis.fetch = vi.fn(
      async () =>
        ({
          status: 200,
          headers: new Headers({ 'content-type': 'application/octet-stream' }),
          body: createFakeBody([chunk1, chunk2]),
        }) as any,
    ) as any

    const app = express()
    app.use(express.json())
    app.use('/api/proxy', proxyRoutes.routes())
    app.use(errorHandlerMiddleware.handle)

    const res = await request(app)
      .get('/api/proxy/geoserver/some/path')
      .set('X-GeoServer-BaseUrl', 'http://localhost:8080')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(Buffer.from([65, 66, 67]))
  })
})
