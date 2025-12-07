import { MapContainer } from '@/features/map/MapContainer'
import { LayerContextProvider } from '@/shared/context/layer/LayerContextProvider'
import { SidebarContainer } from '@/features/sidebar/SidebarContainer'
import { GeoserverConfigProvider } from '@/shared/context/geoserver-config/GeoserverConfigProvider'

export const App = () => {
  return (
    <GeoserverConfigProvider>
      <LayerContextProvider>
        <MapContainer />
        <SidebarContainer />
      </LayerContextProvider>
    </GeoserverConfigProvider>
  )
}
