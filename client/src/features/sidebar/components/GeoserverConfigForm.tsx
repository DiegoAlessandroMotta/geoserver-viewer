import { useState } from 'react'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useGeoserverConfig } from '@/shared/context/geoserver-config/useGeoserverConfig'
import { ChevronDownIcon } from '@/shared/components/icons/ChevronDownIcon'
import { cn } from '@/shared/lib/utils'

export const GeoserverConfigForm = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    geoserverUrl,
    workspace,
    setConfig,
    setCredentials,
    clearConfig,
    clearCredentials,
    areCredentialsPersisted,
    credentials,
  } = useGeoserverConfig()

  const [url, setUrl] = useState(geoserverUrl ?? '')
  const [ws, setWs] = useState(workspace ?? '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [persistCredentials, setPersistCredentials] = useState(() =>
    areCredentialsPersisted(),
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setConfig({
      geoserverUrl: url.trim() || null,
      workspace: ws.trim() || null,
    })

    setCredentials(
      { username: username.trim() || null, password: password.trim() || null },
      persistCredentials,
    )

    setUsername('')
    setPassword('')
    setIsExpanded(false)
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
    <Card className="pointer-events-auto">
      <header className="p-0.5">
        <Button
          className="flex items-center w-full"
          onClick={() => setIsExpanded((prev) => !prev)}
          variant="ghost"
          size="sm"
        >
          <span className="font-semibold">
            {isExpanded ? 'Ocultar configuración' : 'Mostrar configuración'}
          </span>
          <ChevronDownIcon
            className={cn(
              'size-6 aspect-square ml-2 transition-[rotate] duration-300',
              isExpanded ? 'rotate-180' : 'rotate-0',
            )}
          />
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
                Usuario:{' '}
                {credentials.username != null && (
                  <span className="text-xs text-green-600">(guardado)</span>
                )}
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
                Contraseña:{' '}
                {credentials.password != null && (
                  <span className="text-xs text-green-600">(guardado)</span>
                )}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="geo_password"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <label className="text-xs text-gray-700 select-none font-semibold flex gap-1">
              <input
                type="checkbox"
                checked={persistCredentials}
                onChange={(e) => setPersistCredentials(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Recordar credenciales
            </label>
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
