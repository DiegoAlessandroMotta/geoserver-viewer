import { get } from 'env-var'

export const getServerConfig = () => {
  const environment = get('NODE_ENV').default('production').asString()
  const isProduction = environment === 'production'

  return {
    appName: get('APP_NAME').default('proxy-geoserver-viewer').asString(),
    environment,
    isProduction,
    host: get('SERVER_HOST').default('0.0.0.0').asString(),
    port: get('SERVER_PORT').default(3001).asPortNumber(),
    corsEnabled: get('CORS_ENABLED').default('true').asBool(),
    corsAllowedOrigins: get('CORS_ALLOWED_ORIGINS').default('*').asArray(','),
    logLevel: get('LOG_LEVEL').default('info').asString(),
  }
}
