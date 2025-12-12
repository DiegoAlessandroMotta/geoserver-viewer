import { appConfig } from '@/shared/config'
import type { LayerInfo } from '@/shared/context/layer/LayerContext'
import { defaultMinZoom } from '@/shared/lib/consts'
import { geoserverService } from '@/shared/providers'
import { Layer, Source } from 'react-map-gl/maplibre'

interface Props {
  layer: LayerInfo
}

export const CustomLayer = ({ layer }: Props) => {
  if (layer.type && layer.type.toLowerCase() !== 'vector') {
    return null
  }

  const tilesUrl = geoserverService.getVectorTileUrl(layer.name)

  const shortName = layer.short
  const sourceId = layer.name
  const visibility = layer.enabled ? 'visible' : 'none'
  const baseColor = layer.color
  const outlineColor = '#000000'

  const minZoom =
    layer.minZoom ?? Math.max(defaultMinZoom, appConfig.mapMinZoom)
  const maxZoom = layer.maxZoom ?? appConfig.mapMaxZoom

  return (
    <Source id={sourceId} type="vector" tiles={[tilesUrl]} scheme="tms">
      <Layer
        key={`${shortName}-fill`}
        id={`${shortName}-fill`}
        type="fill"
        source={sourceId}
        source-layer={shortName}
        layout={{ visibility }}
        paint={{
          'fill-color': layer.color,
          'fill-opacity': 0.4,
          'fill-outline-color': outlineColor,
        }}
        filter={['==', '$type', 'Polygon']}
        minzoom={minZoom}
        maxzoom={maxZoom}
      />

      <Layer
        key={`${shortName}-line`}
        id={`${shortName}-line`}
        type="line"
        source={sourceId}
        source-layer={shortName}
        layout={{ visibility }}
        paint={{
          'line-color': baseColor,
          'line-width': 3,
          'line-opacity': 0.4,
        }}
        filter={['==', '$type', 'LineString']}
        minzoom={minZoom}
        maxzoom={maxZoom}
      />

      <Layer
        key={`${shortName}-point`}
        id={`${shortName}-point`}
        type="circle"
        source={sourceId}
        source-layer={shortName}
        layout={{ visibility }}
        paint={{
          'circle-color': baseColor,
          'circle-radius': 5,
          'circle-stroke-color': outlineColor,
          'circle-stroke-width': 2,
          'circle-opacity': 0.4,
        }}
        filter={['==', '$type', 'Point']}
        minzoom={minZoom}
        maxzoom={maxZoom}
      />
    </Source>
  )
}
