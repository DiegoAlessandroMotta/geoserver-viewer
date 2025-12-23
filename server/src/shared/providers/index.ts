import { ProviderFactory } from './factory'
import { WebSocketServer } from '@/shared/services/websocket-server/ws.service'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'
import { LoggerMiddleware } from '@/shared/middlewares/logger.middleware'
import { CorsMiddleware } from '@/shared/middlewares/cors.middleware'
import { serverConfig } from '@/shared/config'
import { ErrorHandlerMiddleware } from '@/shared/middlewares/error-handler.middleware'

export const logger = ProviderFactory.getLogger()

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

export const errorHandlerMiddleware = new ErrorHandlerMiddleware(logger)
