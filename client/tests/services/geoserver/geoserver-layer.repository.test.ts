import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeoserverLayerRepository } from '@/shared/services/geoserver/geoserver-layer.repository'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'

const makeHttp = (impl: any = {}) => ({ fetchJson: vi.fn(impl.fetchJson) })
const makeLogger = () => ({ error: vi.fn() })

describe('GeoserverLayerRepository', () => {
  let http: any
  let logger: any
  let repo: GeoserverLayerRepository

  beforeEach(() => {
    http = makeHttp()
    logger = makeLogger()
    repo = new GeoserverLayerRepository(http as any, logger as any)
  })

  it('returns an array when layers are an array', async () => {
    http.fetchJson.mockResolvedValue({
      layers: { layer: [{ name: 'a' }, { name: 'b' }] },
    })
    const res = await repo.fetchAllLayersFromREST()
    expect(res).toHaveLength(2)
  })

  it('wraps single layer into array', async () => {
    http.fetchJson.mockResolvedValue({ layers: { layer: { name: 'single' } } })
    const res = await repo.fetchAllLayersFromREST()
    expect(res).toEqual([{ name: 'single' }])
  })

  it('propagates GeoserverAuthRequiredError', async () => {
    http.fetchJson.mockRejectedValue(new GeoserverAuthRequiredError())
    await expect(repo.fetchAllLayersFromREST()).rejects.toBeInstanceOf(
      GeoserverAuthRequiredError,
    )
  })

  it('logs and returns empty array on generic error', async () => {
    http.fetchJson.mockRejectedValue(new Error('fail'))
    const res = await repo.fetchAllLayersFromREST()
    expect(res).toEqual([])
    expect(logger.error).toHaveBeenCalled()
  })

  it('fetchLayerDetails returns data and encodes colon in name', async () => {
    http.fetchJson.mockResolvedValue({ layer: { name: 'n' } })
    const res = await repo.fetchLayerDetails('ws:my:layer')
    expect(res).toEqual({ layer: { name: 'n' } })
    expect(http.fetchJson).toHaveBeenCalledWith(
      'rest/layers/ws%3Amy:layer.json',
      true,
    )
  })

  it('propagates GeoserverAuthRequiredError on details', async () => {
    http.fetchJson.mockRejectedValue(new GeoserverAuthRequiredError())
    await expect(repo.fetchLayerDetails('a:b')).rejects.toBeInstanceOf(
      GeoserverAuthRequiredError,
    )
  })

  it('logs and returns null on generic error when fetching details', async () => {
    http.fetchJson.mockRejectedValue(new Error('boom'))
    const res = await repo.fetchLayerDetails('a:b')
    expect(res).toBeNull()
    expect(logger.error).toHaveBeenCalled()
  })
})
