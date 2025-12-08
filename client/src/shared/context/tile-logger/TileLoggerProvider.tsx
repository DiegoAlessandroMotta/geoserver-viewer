import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TileLoggerContext, type TileLogEntry } from './TileLoggerContext'
import type {
  WSMessage,
  WSProxyResponseMessage,
} from '@/shared/services/websocket-client.service'
import { websocketClient } from '@/shared/providers'

const DEFAULT_MAX_LOGS = 200

interface TileLoggerProviderProps {
  maxLogs?: number
  children?: ReactNode
}

export const TileLoggerProvider = ({
  maxLogs = DEFAULT_MAX_LOGS,
  children,
}: TileLoggerProviderProps) => {
  const [logs, setLogs] = useState<TileLogEntry[]>([])

  const addLog = useCallback(
    (msg: WSProxyResponseMessage) => {
      const entry: TileLogEntry = {
        ...msg,
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        receivedAt: Date.now(),
      }
      setLogs((prev) => {
        const next = [entry, ...prev]
        if (next.length > maxLogs) return next.slice(0, maxLogs)
        return next
      })
    },
    [maxLogs],
  )

  const clearLogs = useCallback(() => setLogs([]), [])

  useEffect(() => {
    const unsub = websocketClient.onMessage((m: WSMessage) => {
      if (m.type === 'proxy-response') {
        addLog(m as WSProxyResponseMessage)
      }
    })

    return () => unsub()
  }, [addLog])

  const value = useMemo(() => ({ logs, addLog, clearLogs }), [logs])

  useEffect(() => {
    websocketClient.connect()
  }, [])

  return (
    <TileLoggerContext.Provider value={value}>
      {children}
    </TileLoggerContext.Provider>
  )
}
