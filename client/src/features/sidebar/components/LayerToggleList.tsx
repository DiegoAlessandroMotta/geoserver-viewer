import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { Spin } from '@/shared/components/Spin'
import { LayerItem } from '@/features/sidebar/components/LayerItem'

export const LayerToggleList = () => {
  const { layers, toggleLayer, loading, isConfigured } = useLayerContext()
  const layersArray = Array.from(layers.values())

  if (!isConfigured) {
    return (
      <div className="px-2">
        <div className="p-4 bg-orange-50 border border-orange-300 rounded text-sm text-orange-800 text-center">
          Debes configurar la URL de GeoServer y el workspace antes de cargar
          capas.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <p className="text-xs text-blue-500 mb-1 px-2 font-medium">
          Cargando...
        </p>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1 px-2">
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Spin size="md" />
            <p className="text-sm text-gray-600">Obteniendo capas...</p>
          </div>
        </div>
      </>
    )
  }

  if (layersArray.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center px-2">
        No se encontraron capas
      </div>
    )
  }

  return (
    <>
      <p className="text-xs text-blue-500 mb-1 px-2 font-medium">
        {layersArray.length} disponibles
      </p>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 px-2">
        {layersArray.map((l) => (
          <LayerItem
            key={l.name}
            layer={l}
            onToggle={() => toggleLayer(l.name)}
          />
        ))}
      </div>
    </>
  )
}
