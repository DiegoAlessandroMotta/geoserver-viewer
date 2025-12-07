import { config } from '@/shared/config'
import { useRef } from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import mapLibregl from 'maplibre-gl'
import { CustomLayers } from './components/CustomLayers'

export const MapContainer = () => {
  const mapRef = useRef(null)

  const transformRequest: mapLibregl.RequestTransformFunction = (
    url,
    _resourceType,
  ) => {
    if (url.includes('/geoserver/')) {
      const geoserverUrl = localStorage.getItem('geoserver_base_url')
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
          latitude: config.mapCenter.lat,
          longitude: config.mapCenter.lon,
          zoom: config.mapZoom,
        }}
        mapLib={mapLibregl}
        interactive={true}
        mapStyle={config.mapStyle}
        style={{ width: '100dvw', height: '100dvh' }}
        transformRequest={transformRequest}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />
        <CustomLayers />
      </Map>
    </>
  )
}
