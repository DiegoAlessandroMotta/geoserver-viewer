import type { TileLogEntry } from '../../../shared/context/tile-logger/TileLoggerContext'

export const LogItem: React.FC<{ item: TileLogEntry }> = ({ item }) => {
  let workspace: string | null = null
  let layer: string | null = null
  let z: string | null = null
  let x: string | null = null
  let y: string | null = null

  try {
    const url = new URL(item.target)
    const parts = url.pathname.split('/')
    const layerSeg = parts.find((p) => p.includes(':') && p.includes('@'))
    if (layerSeg) {
      const [ws, rest] = layerSeg.split(':')
      workspace = ws
      layer = rest.split('@')[0]
    }
    const numericParts = parts.slice(-3)
    if (numericParts.length === 3) {
      z = numericParts[0]
      x = numericParts[1]
      y = numericParts[2].replace('.pbf', '')
    }
  } catch {
    // ignore parse errors
  }

  const fromCache = item.cacheResult === 'HIT'

  return (
    <li className="py-2 flex flex-col border-b last:border-b-0 border-b-gray-300">
      <div className="flex gap-2">
        <span className="text-xs font-medium bg-cyan-50 text-cyan-600 rounded py-0.5 px-1">
          {new Date(item.receivedAt).toLocaleTimeString()}
        </span>

        {workspace && (
          <span className="text-xs font-medium bg-indigo-50 text-indigo-600 rounded py-0.5 px-1">
            {workspace}
          </span>
        )}

        {fromCache ? (
          <span className="text-xs font-medium bg-green-100 text-green-700 rounded py-0.5 px-1">
            cache
          </span>
        ) : (
          <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded py-0.5 px-1">
            no cache
          </span>
        )}
      </div>

      <div>
        <span className="text-xs font-medium text-gray-600">Tile: </span>
        <span className="text-xs font-semibold text-gray-800">
          {layer} {z && x && y ? ` (${z},${x},${y})` : ''}
        </span>
      </div>
    </li>
  )
}
