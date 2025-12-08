import { createContext } from 'react'
import type { WSProxyResponseMessage } from '@/shared/services/websocket-client.service'

export interface TileLogEntry extends WSProxyResponseMessage {
  id: string
  receivedAt: number
}

export interface TileLoggerContextValue {
  logs: TileLogEntry[]
  addLog: (message: WSProxyResponseMessage) => void
  clearLogs: () => void
}

export const TileLoggerContext = createContext<TileLoggerContextValue | null>(
  null,
)
