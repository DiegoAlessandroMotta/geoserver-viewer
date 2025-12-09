import { get } from 'env-var'

function normalizeBasePath(value: string): string {
  const intialValue = value.trim() ?? ''

  if (intialValue.length === 0) {
    return ''
  }

  const normalized = `/${value.replace(/^\/+|\/+$/g, '')}`

  return normalized
}

export const getServerConfig = () => {
  const environment = get('NODE_ENV').default('production').asString()
  const isProduction = environment === 'production'
  const basePath = normalizeBasePath(get('BASE_PATH').default('').asString())

  return {
    appName: get('APP_NAME').default('proxy-geoserver-viewer').asString(),
    environment,
    isProduction,
    host: get('SERVER_HOST').default('0.0.0.0').asString(),
    port: get('SERVER_PORT').default(3001).asPortNumber(),
    basePath,
    corsEnabled: get('CORS_ENABLED').default('true').asBool(),
    corsAllowedOrigins: get('CORS_ALLOWED_ORIGINS').default('*').asArray(','),
    logLevel: get('LOG_LEVEL').default('info').asString(),
  }
}
