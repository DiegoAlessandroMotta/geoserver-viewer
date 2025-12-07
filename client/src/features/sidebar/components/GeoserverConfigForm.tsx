import { useState } from 'react'
import { Card } from './Card'
import { Button } from '@/shared/components/Button'
import { useGeoserverConfig } from '@/shared/context/geoserver-config/useGeoserverConfig'

export const GeoserverConfigForm = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    geoserverUrl,
    workspace,
    setConfig,
    setCredentials,
    clearConfig,
    clearCredentials,
  } = useGeoserverConfig()

  const [url, setUrl] = useState(geoserverUrl ?? '')
  const [ws, setWs] = useState(workspace ?? '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [persistCredentials, setPersistCredentials] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setConfig({ geoserverUrl: url || null, workspace: ws || null })

    setCredentials(
      { username: username || null, password: password || null },
      persistCredentials,
    )

    setUsername('')
    setPassword('')
  }

  const handleClear = () => {
    clearConfig()
    clearCredentials()
    setUrl('')
    setWs('')
    setUsername('')
    setPassword('')
    setPersistCredentials(false)
  }

  return (
    <Card>
      <header className="p-0.5">
        <Button
          className="flex justify-between items-center p-2 w-full"
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? 'Ocultar configuración' : 'Mostar configuración'}
          variant="ghost"
          size="sm"
        >
          <h2 className="font-semibold">
            {isExpanded ? 'Ocultar configuración' : 'Mostrar configuración'}
          </h2>
          <span className="text-blue-600 ml-4 w-5 aspect-square">
            {isExpanded ? '▼' : '▶'}
          </span>
        </Button>
      </header>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-3 p-2">
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                URL de GeoServer:
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://localhost:8080/geoserver"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Workspace:
                <input
                  type="text"
                  value={ws}
                  onChange={(e) => setWs(e.target.value)}
                  placeholder="geoserver_workspace"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Usuario:
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="geo_user"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Contraseña:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="geo_password"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleClear}
              variant="danger"
              size="sm"
              className="grow font-semibold"
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="grow font-semibold"
            >
              Guardar
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
