import express from 'express'
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { errorHandlerMiddleware } from '@/shared/providers'
import { AppError } from '@/shared/errors/AppError'

describe('ErrorHandlerMiddleware', () => {
  it('formats AppError responses consistently', async () => {
    const app = express()

    app.get('/app-error', (_req, _res) => {
      throw new AppError({
        message: 'test-error',
        statusCode: 418,
        errorCode: 'TEST_ERROR',
      })
    })

    app.use(errorHandlerMiddleware.handle)

    const res = await request(app).get('/app-error')
    expect(res.status).toBe(418)
    expect(res.body).toHaveProperty('statusCode', 418)
    expect(res.body).toHaveProperty('errorCode', 'TEST_ERROR')
    expect(res.body).toHaveProperty('message', 'test-error')
  })

  it('returns 500 for generic errors', async () => {
    const app = express()

    app.get('/generic', (_req, _res) => {
      throw new Error('something went wrong')
    })

    app.use(errorHandlerMiddleware.handle)

    const res = await request(app).get('/generic')
    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('statusCode', 500)
    expect(res.body).toHaveProperty('errorCode')
  })
})
