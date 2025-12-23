import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeoserverService } from '@/shared/services/geoserver/geoserver.service'
import * as utils from '@/shared/lib/utils'

const makeConfigManager = (overrides: any = {}) => ({
  onChange: (_cb: any) => {},
  getGeoserverUrl: () => overrides.geoserverUrl ?? 'http://g',
  getCredentials: () => overrides.credentials ?? { username: '', password: '' },
  getSessionId: () => overrides.sessionId ?? '',
})

const makeLogger = () => ({ debug: vi.fn(), warn: vi.fn(), error: vi.fn() })

describe('GeoserverService', () => {
  let svc: GeoserverService
  let logger: any
  let cfg: any

  beforeEach(() => {
    logger = makeLogger()
    cfg = makeConfigManager()
    svc = new GeoserverService({
      proxyUrl: 'http://proxy',
      logger,
      configManager: cfg,
    })
  })

  it('returns detailed layers when data present', async () => {
    const layerList = [{ name: 'ws:my_layer' }, { name: 'ws:other' }]
    ;(svc as any).layerRepo.fetchAllLayersFromREST = vi
      .fn()
      .mockResolvedValue(layerList)
    ;(svc as any).wmsCache.get = vi.fn().mockResolvedValue({})
    ;(svc as any).layerRepo.fetchLayerDetails = vi
      .fn()
      .mockImplementation(async (name: string) => ({
        layer: {
          name: name,
          title: `${name}-title`,
          resource: { '@href': '/workspaces/ws/datastores/store' },
          type: 'VECTOR',
          dateCreated: '2020',
          dateModified: '2021',
          defaultStyle: { name: 's1' },
        },
      }))
    ;(svc as any).parser.extractCRSFromXML = vi
      .fn()
      .mockReturnValue(['EPSG:4326'])

    vi.spyOn(utils, 'generateSHA1HexHash').mockResolvedValue('deadbeef')

    const res = await svc.fetchWMSLayers('ws')

    expect(res.length).toBe(2)
    expect(res[0]).toHaveProperty('name', 'ws:my_layer')
    expect(res[0]).toHaveProperty('title', 'ws:my_layer-title')
    expect(res[0]).toHaveProperty('short', 'my_layer')
    expect(res[0]).toHaveProperty('workspace', 'ws')
    expect(res[0]).toHaveProperty('store', 'store')
    expect(res[0]).toHaveProperty('type', 'VECTOR')
    expect(res[0]).toHaveProperty('fullName', 'ws:my_layer')
    expect(res[0]).toHaveProperty('defaultStyle', 's1')
    expect(res[0].crs).toEqual(['EPSG:4326'])
    expect(res[0].color).toMatch(/^#/)
  })

  it('returns empty array when no layers found and logs warning', async () => {
    ;(svc as any).layerRepo.fetchAllLayersFromREST = vi
      .fn()
      .mockResolvedValue([])
    const res = await svc.fetchWMSLayers('ws')
    expect(res).toEqual([])
    expect(logger.warn).toHaveBeenCalled()
  })

  it('skips layers with missing details', async () => {
    const layerList = [{ name: 'ws:skip' }]
    ;(svc as any).layerRepo.fetchAllLayersFromREST = vi
      .fn()
      .mockResolvedValue(layerList)
    ;(svc as any).wmsCache.get = vi.fn().mockResolvedValue({})
    ;(svc as any).layerRepo.fetchLayerDetails = vi.fn().mockResolvedValue({})
    ;(svc as any).parser.extractCRSFromXML = vi.fn().mockReturnValue([])

    const res = await svc.fetchWMSLayers('ws')
    expect(res).toEqual([])
    expect(logger.warn).toHaveBeenCalled()
  })
})
