import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { LogList } from './components/LogList'

export const TileLoggerContainer = () => {
  return (
    <Card className="fixed bottom-2 right-2 w-96">
      <header className="p-2 flex justify-between items-center border-b border-b-zinc-400">
        <p className="font-semibold text-sm text-gray-800">{200} Registros</p>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="font-semibold">
            Limpiar
          </Button>
          <Button variant="danger" size="sm" className="font-semibold">
            Cerrar
          </Button>
        </div>
      </header>

      <LogList />
    </Card>
  )
}
