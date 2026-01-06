import 'dotenv/config'
import { logger } from '@/shared/providers'
import { serverConfig } from '@/shared/config'
import { Server } from '@/core/server'
import { AppRoutes } from '@/core/routes/index.routes'

async function bootstrap() {
  logger.info(`Starting app: ${serverConfig.appName}`)
  const start = process.hrtime.bigint()

  try {
    const appRoutes = new AppRoutes()

    const server = new Server({
      logger,
      host: serverConfig.host,
      port: serverConfig.port,
      routes: appRoutes.routes(),
    })

    logger.info('Configuring server...')
    await server.configureServer()
    await server.start()

    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1_000_000
    logger.info(`Server started in ${durationMs.toFixed(2)}ms`)
  } catch (error) {
    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1_000_000

    logger.error({
      message: 'Error during server startup',
      context: { error },
    })
    logger.info(`Server failed to start in ${durationMs.toFixed(2)}ms`)

    process.exit(1)
  }
}

bootstrap()
