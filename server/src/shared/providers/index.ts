import { PinoLogger } from '@/shared/services/logger/pino.logger'
import { WebSocketServer } from '@/shared/services/websocket-server/ws.service'

export const logger = new PinoLogger()

export const websocketServer = new WebSocketServer()
