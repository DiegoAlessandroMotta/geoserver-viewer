import type { LayerInfo } from '@/shared/context/layer/LayerContext'
import { useState } from 'react'

interface Props {
  layer: LayerInfo
  onToggle: () => void
}

export const LayerItem = ({ layer, onToggle }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="flex items-center gap-2 p-1 rounded-md border overflow-hidden"
      style={{ borderColor: layer.color, borderWidth: 2 }}
    >
      <label className="flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={layer.enabled}
          onChange={() => onToggle()}
          title={layer.enabled ? 'Ocultar capa' : 'Mostrar capa'}
          className="w-4 h-4 cursor-pointer accent-blue-500"
        />
      </label>

      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-sm font-medium text-gray-800 truncate flex-1 max-w-44"
            onClick={() => onToggle()}
          >
            {layer.short}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 px-3 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            title={isExpanded ? 'Contraer detalles' : 'Expandir detalles'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>

        {isExpanded && (
          <div className="text-xs text-gray-600 mt-2 space-y-1">
            {layer.workspace && (
              <p className="truncate">
                <span className="font-semibold">Workspace:</span>{' '}
                {layer.workspace}
              </p>
            )}
            {layer.store && (
              <p className="truncate">
                <span className="font-semibold">Store:</span> {layer.store}
              </p>
            )}
            {layer.crs && layer.crs.length > 0 && (
              <p className="truncate">
                <span className="font-semibold">CRS:</span>{' '}
                {layer.crs.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
