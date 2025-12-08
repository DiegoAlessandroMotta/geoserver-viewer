import { MapContainer } from '@/features/map/MapContainer'
import { LayerContextProvider } from '@/shared/context/layer/LayerContextProvider'
import { SidebarContainer } from '@/features/sidebar/SidebarContainer'
import { GeoserverConfigProvider } from '@/shared/context/geoserver-config/GeoserverConfigProvider'
import { TileLoggerContainer } from '@/features/tile-logger/TileLoggerContainer'

export const App = () => {
  return (
    <GeoserverConfigProvider>
      <LayerContextProvider>
        <MapContainer />
        <SidebarContainer />
      </LayerContextProvider>
      <TileLoggerContainer />
    </GeoserverConfigProvider>
  )
}
