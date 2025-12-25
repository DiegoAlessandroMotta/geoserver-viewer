import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeoserverParser } from '@/shared/services/geoserver/geoserver-parser'

const makeLogger = () => ({ error: vi.fn() })

describe('GeoserverParser', () => {
  let parser: GeoserverParser
  let logger: any

  beforeEach(() => {
    logger = makeLogger()
    parser = new GeoserverParser(logger)
  })

  it('parses valid XML', () => {
    const xml = `<?xml version="1.0"?>
    <WMS_Capabilities>
      <Capability>
        <Layer>
          <Layer>
            <Name>layer1</Name>
            <CRS>EPSG:4326</CRS>
          </Layer>
        </Layer>
      </Capability>
    </WMS_Capabilities>`

    const parsed = parser.parseXML(xml)
    expect(parsed).toBeTruthy()
    expect(parsed!.WMS_Capabilities.Capability.Layer.Layer.Name).toBe('layer1')
  })

  it('returns null and logs on invalid XML', () => {
    const parsed = parser.parseXML('<not-xml')
    expect(parsed).toBeNull()
    expect(logger.error).toHaveBeenCalled()
  })

  it('extracts CRS from parsed XML (single and array)', () => {
    const parsedSingle = {
      WMS_Capabilities: {
        Capability: {
          Layer: { Layer: { Name: 'l1', CRS: 'EPSG:3857' } },
        },
      },
    }

    const parsedArray = {
      WMS_Capabilities: {
        Capability: {
          Layer: {
            Layer: [
              { Name: 'l1', CRS: ['EPSG:3857', 'EPSG:4326'] },
              { Name: 'l2', CRS: 'EPSG:4326' },
            ],
          },
        },
      },
    }

    expect(parser.extractCRSFromXML(parsedSingle as any, 'l1')).toEqual([
      'EPSG:3857',
    ])

    expect(parser.extractCRSFromXML(parsedArray as any, 'l1')).toEqual([
      'EPSG:3857',
      'EPSG:4326',
    ])

    expect(parser.extractCRSFromXML(parsedArray as any, 'notfound')).toEqual([])
  })

  it('returns empty array and logs when extract throws', () => {
    const badLayer = {
      get Name() {
        throw new Error('boom')
      },
      CRS: 'EPSG:4326',
    }

    const parsed = {
      WMS_Capabilities: {
        Capability: {
          Layer: { Layer: badLayer },
        },
      },
    }

    const res = parser.extractCRSFromXML(parsed as any, 'l1')
    expect(res).toEqual([])
    expect(logger.error).toHaveBeenCalled()
  })

  it('returns empty array when parsed XML is null or CRS missing', () => {
    expect(parser.extractCRSFromXML(null, 'l1')).toEqual([])

    const parsedNoCRS = {
      WMS_Capabilities: {
        Capability: {
          Layer: { Layer: { Name: 'l1' } },
        },
      },
    }

    expect(parser.extractCRSFromXML(parsedNoCRS as any, 'l1')).toEqual([])
  })
})
