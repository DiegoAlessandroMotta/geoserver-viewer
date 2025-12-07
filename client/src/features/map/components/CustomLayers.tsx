import { geoserverService } from '@/shared/providers'
import { Layer, Source } from 'react-map-gl/maplibre'
import { useLayerContext } from '@/shared/context/layer/useLayerContext'

export const CustomLayers = () => {
  const { layers } = useLayerContext()
  const layersArray = Array.from(layers.values())

  return (
    <>
      {layersArray.map((layer) => {
        const name = layer.name
        if (layer.type && layer.type.toLowerCase() !== 'vector') return null
        const short = layer.short
        const tilesUrl = geoserverService.getVectorTileUrl(name)

        return (
          <Source
            key={short}
            id={short}
            type="vector"
            tiles={[tilesUrl]}
            scheme="tms"
          >
            <Layer
              key={name}
              id={name}
              type="fill"
              source={short}
              source-layer={short}
              layout={{ visibility: layer.enabled ? 'visible' : 'none' }}
              paint={{
                'fill-color': layer.color,
                'fill-opacity': 0.4,
                'fill-outline-color': '#000000',
              }}
              minzoom={0}
              maxzoom={20}
            />
          </Source>
        )
      })}
    </>
  )
}
