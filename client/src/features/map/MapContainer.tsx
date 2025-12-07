import { appConfig } from '@/shared/config'
import { useRef } from 'react'
import { useGeoserverConfig } from '@/shared/context/geoserver-config/useGeoserverConfig'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import mapLibregl from 'maplibre-gl'
import { MapLayers } from './components/MapLayers'

export const MapContainer = () => {
  const mapRef = useRef(null)
  const { geoserverUrl } = useGeoserverConfig()

  const transformRequest: mapLibregl.RequestTransformFunction = (
    url,
    _resourceType,
  ) => {
    if (url.includes('/geoserver/')) {
      const sessionId = localStorage.getItem('session_id')
      const headers: Record<string, string> = {}

      if (geoserverUrl) {
        headers['X-GeoServer-BaseUrl'] = geoserverUrl
      }

      if (sessionId) {
        headers['X-Session-Id'] = sessionId
      }

      return {
        url,
        headers,
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
