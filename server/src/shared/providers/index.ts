import { PinoLogger } from '@/shared/services/logger/pino.logger'
import { WebSocketServer } from '@/shared/services/websocket-server/ws.service'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

export const logger = new PinoLogger()

export const websocketSessionService = new WebSocketSessionService(logger)

export const websocketServer = new WebSocketServer(
  logger,
  websocketSessionService,
)
