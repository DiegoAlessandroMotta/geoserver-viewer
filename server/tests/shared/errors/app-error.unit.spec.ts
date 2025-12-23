import { describe, it, expect } from 'vitest'
import { AppError } from '@/shared/errors/AppError'

describe('AppError', () => {
  it('toResponse returns correct shape', () => {
    const err = new AppError({
      message: 'err',
      statusCode: 400,
      errorCode: 'TEST',
    })
    const resp = err.toResponse()
    expect(resp).toEqual({ message: 'err', statusCode: 400, errorCode: 'TEST' })
  })

  it('toJSON includes previous error when present', () => {
    const prev = new Error('prev')
    const err = new AppError({
      message: 'err',
      statusCode: 500,
      errorCode: 'TEST',
      previous: prev,
    })
    const json = err.toJSON()
    expect(json.previousError).toBeDefined()
    expect(json.previousError).toHaveProperty('message', 'prev')
  })

  it('toString includes previous error when present', () => {
    const prev = new Error('prev')
    const err = new AppError({
      message: 'err',
      statusCode: 500,
      errorCode: 'TEST',
      previous: prev,
    })
    const s = err.toString()
    expect(s).toContain('Previous prev')
  })
})
