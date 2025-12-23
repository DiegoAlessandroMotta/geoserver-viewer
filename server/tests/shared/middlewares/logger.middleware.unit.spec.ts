import express from 'express'
import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'
import { LoggerMiddleware } from '@/shared/middlewares/logger.middleware'

describe('LoggerMiddleware', () => {
  it('logs incoming and completed requests', async () => {
    const info = vi.fn()
    const logger: any = { info }

    const app = express()
    const lm = new LoggerMiddleware(logger)

    app.use(express.json())
    app.use(lm.handle)
    app.get('/', (_req, res) => res.status(201).send('ok'))

    const res = await request(app).get('/').set('user-agent', 'vitest')
    expect(res.status).toBe(201)

    expect(info.mock.calls.length).toBeGreaterThanOrEqual(2)
    const secondCall = info.mock.calls[1][0]
    expect(secondCall).toHaveProperty('message')
    expect(secondCall).toHaveProperty('context')
    expect(secondCall.context).toHaveProperty('statusCode')
    expect(secondCall.context).toHaveProperty('durationMs')
  })
})
