import { ChevronDownIcon } from '@/shared/components/icons/ChevronDownIcon'
import { appConfig } from '@/shared/config'
import type { LayerInfo } from '@/shared/context/layer/LayerContext'
import { cn } from '@/shared/lib/utils'
import { useState } from 'react'

interface Props {
  layer: LayerInfo
  onToggle: () => void
  onZoomChange?: (minZoom: number, maxZoom: number) => void
}

export const LayerItem = ({ layer, onToggle, onZoomChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const defaultMin = Math.max(14, Number(appConfig.mapMinZoom))
  const defaultMax = Number(appConfig.mapMaxZoom)
  const effectiveMin = layer.minZoom ?? defaultMin
  const effectiveMax = layer.maxZoom ?? defaultMax

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

            <div className="flex flex-col">
              <p className="font-semibold">Zoom</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center">
                  <span className="mr-2 font-semibold">Min:</span>
                  <input
                    type="number"
                    min={appConfig.mapMinZoom}
                    max={appConfig.mapMaxZoom}
                    value={effectiveMin}
                    onChange={(e) => {
                      const raw = Number(e.target.value)
                      const globalMin = Number(appConfig.mapMinZoom)
                      const globalMax = Number(appConfig.mapMaxZoom)
                      let next = Number.isNaN(raw) ? defaultMin : raw
                      if (next < globalMin) next = globalMin
                      if (next > globalMax) next = globalMax
                      let nextMax = layer.maxZoom ?? defaultMax
                      if (next > nextMax) nextMax = next
                      onZoomChange?.(next, nextMax)
                    }}
                    className="w-full bg-white p-0.5 rounded"
                  />
                </label>
                <label className="flex items-center">
                  <span className="mr-2 font-semibold">Max:</span>
                  <input
                    type="number"
                    min={appConfig.mapMinZoom}
                    max={appConfig.mapMaxZoom}
                    value={effectiveMax}
                    onChange={(e) => {
                      const raw = Number(e.target.value)
                      const globalMin = Number(appConfig.mapMinZoom)
                      const globalMax = Number(appConfig.mapMaxZoom)
                      let next = Number.isNaN(raw) ? defaultMax : raw
                      if (next < globalMin) next = globalMin
                      if (next > globalMax) next = globalMax
                      let nextMin = layer.minZoom ?? defaultMin
                      if (next < nextMin) nextMin = next
                      onZoomChange?.(nextMin, next)
                    }}
                    className="w-full bg-white p-0.5 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
