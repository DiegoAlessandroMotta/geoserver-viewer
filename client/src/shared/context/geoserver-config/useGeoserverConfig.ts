import { useContext } from 'react'
import { GeoserverConfigContext } from '@/shared/context/geoserver-config/GeoserverConfigContext'

export const useGeoserverConfig = () => {
  const ctx = useContext(GeoserverConfigContext)

  if (!ctx) {
    throw new Error(
      'useGeoserverConfig must be used within a GeoserverConfigProvider',
    )
  }

  return ctx
}
