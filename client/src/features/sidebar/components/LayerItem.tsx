import { ChevronDownIcon } from '@/shared/components/icons/ChevronDownIcon'
import type { LayerInfo } from '@/shared/context/layer/LayerContext'
import { cn } from '@/shared/lib/utils'
import { useState } from 'react'

interface Props {
  layer: LayerInfo
  onToggle: () => void
}

export const LayerItem = ({ layer, onToggle }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="flex items-center rounded-md overflow-hidden"
      style={{
        backgroundColor: `${layer.color}22`,
        borderColor: layer.color,
        borderStyle: 'solid',
        borderWidth: 1,
      }}
    >
      <label className="flex items-center cursor-pointer shrink-0 pl-2 py-2 pr-2">
        <input
          type="checkbox"
          checked={layer.enabled}
          onChange={() => onToggle()}
          title={layer.enabled ? 'Ocultar capa' : 'Mostrar capa'}
          className="w-4 h-4 cursor-pointer"
          style={{ accentColor: layer.color }}
        />
      </label>

      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-sm font-medium text-gray-800 truncate flex-1 max-w-44 py-2 cursor-pointer"
            onClick={() => onToggle()}
          >
            {layer.short}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              `shrink-0 aspect-square size-8 font-semibold rounded text-gray-800 cursor-pointer hover:bg-black/10 mr-0.5`,
            )}
            title={isExpanded ? 'Mostrar detalles' : 'Ocultar detalles'}
          >
            <ChevronDownIcon
              className={cn(
                'size-6 aspect-square transition-[rotate] duration-300 mx-auto',
                isExpanded ? 'rotate-180' : 'rotate-0',
              )}
            />
          </button>
        </div>

        {isExpanded && (
          <div className="text-xs text-gray-800 space-y-1 pb-1 border-t border-gray-400 mr-1">
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
