import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { Card } from './components/Card'
import { Button } from '@/shared/components/Button'
import { LayerToggleList } from './components/LayerToggleList'
import { GeoserverConfigForm } from './components/GeoserverConfigForm'

export const SidebarContainer = () => {
  const { refreshLayers } = useLayerContext()

  return (
    <aside className="fixed top-0 left-0 w-72 h-dvh flex flex-col gap-2 py-2 pl-2 pb-10 overflow-y-auto">
      <GeoserverConfigForm />
      <Card className="max-h-full min-h-fit flex flex-col py-2">
        <header className="mb-2 px-2">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-gray-800">Capas</h2>
            <Button variant="ghost" size="sm" onClick={() => refreshLayers()}>
              Actualizar
            </Button>
          </div>

          <Button className="w-full">Mostrar logs</Button>
        </header>

        <LayerToggleList />
      </Card>
    </aside>
  )
}
