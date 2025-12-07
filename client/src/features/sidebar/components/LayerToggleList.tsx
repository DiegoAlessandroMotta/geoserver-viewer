import useLayerContext from '@/shared/context/layer/useLayerContext'
import { LayerItem } from './LayerItem'

export const LayerToggleList = () => {
  const { layers, toggleLayer } = useLayerContext()
  const layersArray = Array.from(layers.values())

  if (layersArray.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center">
        No se encontraron capas
      </div>
    )
  }

  return (
    <>
      <p className="text-xs text-blue-500 mb-1">
        {layersArray.length} disponibles
      </p>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
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
