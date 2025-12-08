import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { LogList } from './components/LogList'
import { useTileLoggerContext } from '../../shared/context/tile-logger/useTileLogger'

export const TileLoggerContainer = () => {
  const { logs, clearLogs } = useTileLoggerContext()

  return (
    <Card className="fixed bottom-2 right-2 w-96">
      <header className="p-2 flex justify-between items-center border-b border-b-zinc-400">
        <p className="font-semibold text-sm text-gray-800">
          {logs.length} Registros
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="font-semibold"
            onClick={clearLogs}
          >
            Limpiar
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="font-semibold"
            // onClick={/* should use the context state */}
          >
            Cerrar
          </Button>
        </div>
      </header>

      <LogList />
    </Card>
  )
}
