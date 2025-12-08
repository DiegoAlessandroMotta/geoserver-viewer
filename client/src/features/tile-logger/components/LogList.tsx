import { useTileLoggerContext } from '@/shared/context/tile-logger/useTileLogger'
import { LogItem } from '@/features/tile-logger/components/LogItem'

export const LogList = () => {
  const { logs } = useTileLoggerContext()

  if (logs.length === 0) {
    return (
      <div className="text-xs text-gray-500 p-2 font-medium">No hay registros aún</div>
    )
  }

  return (
    <ul className="flex flex-col px-2 max-h-96 overflow-auto">
      {logs.map((l) => (
        <LogItem key={l.id} item={l} />
      ))}
    </ul>
  )
}
