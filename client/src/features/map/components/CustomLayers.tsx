import { geoserverService } from '@/shared/providers'
import { Layer, Source } from 'react-map-gl/maplibre'

export const CustomLayers = () => {
  const tilesUrl = geoserverService.getVectorTileUrl(
    'osp_pangeaco:DEPARTAMENTO',
  )

  return (
    <>
      <Source
        key={'DEPARTAMENTO'}
        id={'DEPARTAMENTO'}
        type="vector"
        tiles={[tilesUrl]}
        scheme="tms"
      >
        <Layer
          key={'osp_pangeaco:DEPARTAMENTO'}
          id={'osp_pangeaco:DEPARTAMENTO'}
          type={'fill'}
          source={'DEPARTAMENTO'}
          source-layer={'DEPARTAMENTO'}
          layout={{
            visibility: 'visible',
          }}
          paint={{
            'fill-color': '#5c318c30',
          }}
          minzoom={0}
          maxzoom={20}
        />
      </Source>
    </>
  )
}
