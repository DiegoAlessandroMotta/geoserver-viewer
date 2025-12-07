import { useContext } from 'react'
import { GeoserverConfigContext } from './GeoserverConfigContext'

export const useGeoserverConfig = () => {
  const ctx = useContext(GeoserverConfigContext)
  if (!ctx) {
    throw new Error(
      'useGeoserverConfig must be used within a GeoserverConfigProvider',
    )
  }
  return ctx
}

export default useGeoserverConfig
