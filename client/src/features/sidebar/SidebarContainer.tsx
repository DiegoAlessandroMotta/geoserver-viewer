import { GeoserverConfigForm } from '@/features/sidebar/components/GeoserverConfigForm'
import { LayerToggleCard } from '@/features/sidebar/components/LayerToggleCard'

export const SidebarContainer = () => {
  return (
    <aside className="fixed top-0 left-0 w-72 h-dvh flex flex-col gap-2 py-2 pl-2 overflow-y-auto pointer-events-none">
      <GeoserverConfigForm />
      <LayerToggleCard />
    </aside>
  )
}
