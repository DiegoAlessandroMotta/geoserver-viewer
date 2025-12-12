import { appConfig } from '@/shared/config'
import { useRef, useState } from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'
import mapLibregl from 'maplibre-gl'
import { MapLayers } from '@/features/map/components/MapLayers'
import { geoserverService } from '@/shared/providers'

export const MapContainer = () => {
  const mapRef = useRef<MapRef>(null)
  const [currentZoom, setCurrentZoom] = useState(appConfig.mapZoom)

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

  const handleMapMove = () => {
    if (mapRef.current) {
      setCurrentZoom(mapRef.current.getMap().getZoom())
    }
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
        onMove={handleMapMove}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />

        <div
          className="fixed bottom-2.5 left-[106px] px-1 py-0.5 bg-white border-2 border-t-0 text-xs font-medium"
        >
          Zoom: {currentZoom.toFixed(2)}
        </div>

        <MapLayers />
      </Map>
    </>
  )
}
