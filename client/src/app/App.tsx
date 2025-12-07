import { MapContainer } from '@/features/map/MapContainer'
import { LayerContextProvider } from '@/shared/context/layer/LayerContextProvider'
import { SidebarContainer } from '@/features/sidebar/SidebarContainer'

export const App = () => {
  return (
    <LayerContextProvider>
      <MapContainer />
      <SidebarContainer />
    </LayerContextProvider>
  )
}
