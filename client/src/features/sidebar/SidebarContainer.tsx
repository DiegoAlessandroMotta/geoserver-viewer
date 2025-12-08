import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { LayerToggleList } from '@/features/sidebar/components/LayerToggleList'
import { GeoserverConfigForm } from '@/features/sidebar/components/GeoserverConfigForm'

export const SidebarContainer = () => {
  const { refreshLayers, loading } = useLayerContext()

  return (
    <aside className="fixed top-0 left-0 w-72 h-dvh flex flex-col gap-2 py-2 pl-2 pb-10 overflow-y-auto pointer-events-none">
      <GeoserverConfigForm />
      <Card className="max-h-full min-h-fit flex flex-col py-2 pointer-events-auto">
        <header className="mb-2 px-2">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold text-gray-800">Capas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshLayers()}
              className="font-semibold"
              disabled={loading}
            >
              Actualizar
            </Button>
          </div>

          <Button fullWidth>Mostrar logs</Button>
        </header>

        <LayerToggleList />
      </Card>
    </aside>
  )
}
