import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { LayerToggleList } from '@/features/sidebar/components/LayerToggleList'
import { useTileLoggerContext } from '@/shared/context/tile-logger/useTileLogger'
import { useState } from 'react'
import { ChevronDownIcon } from '@/shared/components/icons/ChevronDownIcon'
import { cn } from '@/shared/lib/utils'

export const LayerToggleCard = () => {
  const { refreshLayers, loading, isConfigured } = useLayerContext()
  const { toggle, visible } = useTileLoggerContext()
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card
      className={cn(
        'shrink max-h-full flex flex-col pointer-events-auto overflow-hidden',
        isExpanded ? 'pb-2' : undefined,
      )}
      semiTransparent
    >
      <header className="p-0.5">
        <Button
          onClick={() => setIsExpanded((prev) => !prev)}
          variant="ghost"
          fullWidth
          className="py-1 justify-between"
        >
          <span className="font-semibold">Capas</span>
          <ChevronDownIcon
            className={cn(
              'size-6 aspect-square ml-2 transition-[rotate] duration-300',
              isExpanded ? 'rotate-180' : 'rotate-0',
            )}
          />
        </Button>

        {isExpanded && (
          <div className="px-2 my-2 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshLayers()}
              className="font-semibold"
              disabled={loading || !isConfigured}
            >
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggle}
              className="font-semibold"
            >
              {visible ? 'Ocultar logs' : 'Mostrar logs'}
            </Button>
          </div>
        )}
      </header>

      {isExpanded && <LayerToggleList />}
    </Card>
  )
}
