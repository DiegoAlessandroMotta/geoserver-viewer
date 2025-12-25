import { ChevronDownIcon } from '@/shared/components/icons/ChevronDownIcon'
import { appConfig } from '@/shared/config'
import type { LayerInfo } from '@/shared/context/layer/LayerContext'
import { cn } from '@/shared/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { defaultMinZoom } from '@/shared/lib/consts'

interface Props {
  layer: LayerInfo
  onToggle: () => void
  onZoomChange?: (minZoom: number, maxZoom: number) => void
}

export const LayerItem = ({ layer, onToggle, onZoomChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const globalMinZoom = appConfig.mapMinZoom
  const globalMaxZoom = appConfig.mapMaxZoom

  const [minLocal, setMinLocal] = useState(
    layer.minZoom ?? Math.max(defaultMinZoom, globalMinZoom),
  )
  const [maxLocal, setMaxLocal] = useState(layer.maxZoom ?? globalMaxZoom)

  const prevLayerIdRef = useRef(layer.fullName)
  useEffect(() => {
    if (layer.fullName !== prevLayerIdRef.current) {
      prevLayerIdRef.current = layer.fullName
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMinLocal(layer.minZoom ?? globalMinZoom)
      setMaxLocal(layer.maxZoom ?? globalMaxZoom)
    }
  }, [layer.fullName, layer.minZoom, layer.maxZoom, globalMinZoom, globalMaxZoom])

  const debouncedMin = useDebounce(minLocal, 300)
  const debouncedMax = useDebounce(maxLocal, 300)


  useEffect(() => {
    const currentMin = layer.minZoom ?? globalMinZoom
    const currentMax = layer.maxZoom ?? globalMaxZoom

    if (debouncedMin !== currentMin || debouncedMax !== currentMax) {
      onZoomChange?.(debouncedMin, debouncedMax)
    }
  }, [
    debouncedMin,
    debouncedMax,
    layer.minZoom,
    layer.maxZoom,
    globalMinZoom,
    globalMaxZoom,
    onZoomChange,
  ])

  const handleMinChange = (value: number) => {
    const globalMin = Math.max(globalMinZoom, Number(appConfig.mapMinZoom))
    const globalMax = Number(globalMaxZoom)
    const next = Math.max(globalMin, Math.min(globalMax, value))
    setMinLocal(next)
    if (next > maxLocal) {
      setMaxLocal(next)
    }
  }

  const handleMaxChange = (value: number) => {
    const globalMin = Math.max(globalMinZoom, Number(appConfig.mapMinZoom))
    const globalMax = Number(globalMaxZoom)
    const next = Math.max(globalMin, Math.min(globalMax, value))
    setMaxLocal(next)
    if (next < minLocal) {
      setMinLocal(next)
    }
  }

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
            {layer.layerName ?? layer.fullName}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'shrink-0 aspect-square size-8 font-semibold rounded text-gray-800 cursor-pointer hover:bg-black/10 mr-0.5',
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
                    min={globalMinZoom}
                    max={globalMaxZoom}
                    value={minLocal}
                    onChange={(e) => handleMinChange(Number(e.target.value))}
                    className="w-full bg-white p-0.5 rounded"
                  />
                </label>
                <label className="flex items-center">
                  <span className="mr-2 font-semibold">Max:</span>
                  <input
                    type="number"
                    min={globalMinZoom}
                    max={globalMaxZoom}
                    value={maxLocal}
                    onChange={(e) => handleMaxChange(Number(e.target.value))}
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
