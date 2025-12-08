import { appConfig } from '@/shared/config'
import { useRef } from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import mapLibregl from 'maplibre-gl'
import { MapLayers } from '@/features/map/components/MapLayers'
import { geoserverService } from '@/shared/providers'

export const MapContainer = () => {
  const mapRef = useRef(null)

  const transformRequest: mapLibregl.RequestTransformFunction = (
    url,
    _resourceType,
  ) => {
    if (url.includes('/geoserver/')) {
      return {
        url,
        headers: geoserverService.getDefaultHeaders(),
      }
    }

    return { url }
  }

  return (
    <>
      <Map
        ref={mapRef}
        attributionControl={false}
        initialViewState={{
          latitude: appConfig.mapCenter.lat,
          longitude: appConfig.mapCenter.lon,
          zoom: appConfig.mapZoom,
        }}
        mapLib={mapLibregl}
        interactive={true}
        mapStyle={appConfig.mapStyle}
        style={{ width: '100dvw', height: '100dvh' }}
        transformRequest={transformRequest}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />
        <MapLayers />
      </Map>
    </>
  )
}
