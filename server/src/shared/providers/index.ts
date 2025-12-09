import { PinoLogger } from '@/shared/services/logger/pino.logger'
import { WebSocketServer } from '@/shared/services/websocket-server/ws.service'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'
import { LoggerMiddleware } from '@/shared/middlewares/logger.middleware'
import { CorsMiddleware } from '@/shared/middlewares/cors.middleware'
import { serverConfig } from '@/shared/config'

export const logger = new PinoLogger()

export const websocketSessionService = new WebSocketSessionService(logger)

export const websocketServer = new WebSocketServer(
  logger,
  websocketSessionService,
  serverConfig.basePath,
)

export const loggerMiddleware = new LoggerMiddleware(logger)

export const corsMiddleware = new CorsMiddleware(
  serverConfig.corsAllowedOrigins,
)
