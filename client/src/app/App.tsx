import { MapContainer } from '@/features/map/MapContainer'
import { LayerContextProvider } from '@/shared/context/layer/LayerContextProvider'
import { SidebarContainer } from '@/features/sidebar/SidebarContainer'
import { GeoserverConfigProvider } from '@/shared/context/geoserver-config/GeoserverConfigProvider'
import { TileLoggerContainer } from '@/features/tile-logger/TileLoggerContainer'
import { TileLoggerProvider } from '@/shared/context/tile-logger/TileLoggerProvider'

export const App = () => {
  return (
    <GeoserverConfigProvider>
      <TileLoggerProvider>
        <LayerContextProvider>
          <MapContainer />
          <SidebarContainer />
        </LayerContextProvider>
        <TileLoggerContainer />
      </TileLoggerProvider>
    </GeoserverConfigProvider>
  )
}
