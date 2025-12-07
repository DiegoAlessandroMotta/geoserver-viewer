import type { ILogger } from '../interfaces/logger.interface'

export interface GeoserverCredentials {
  username: string | null
  password: string | null
}

export type GeoserverConfigChange = Partial<{
  geoserverUrl: string | null
  workspace: string | null
  credentials: GeoserverCredentials
}>

export type GeoserverConfigChangeListener = (
  change: GeoserverConfigChange,
) => void

const LOCAL_STORAGE_URL_KEY = 'geoserver_base_url'
const LOCAL_STORAGE_WORKSPACE_KEY = 'geoserver_workspace'
const LOCAL_STORAGE_USERNAME_KEY = 'geoserver_username'
const LOCAL_STORAGE_PASSWORD_KEY = 'geoserver_password'

export interface GeoserverConfigManagerOptions {
  persistCredentials?: boolean
  storage?: Storage
  logger: ILogger
}

export class GeoserverConfigManagerService {
  private readonly storage: Storage
  private readonly logger: ILogger
  private readonly persistCredentials: boolean
  private readonly listeners: Set<GeoserverConfigChangeListener>
  private credentials: GeoserverCredentials

  constructor({
    storage,
    persistCredentials,
    logger,
  }: GeoserverConfigManagerOptions) {
    this.storage = storage ?? localStorage
    this.persistCredentials = persistCredentials ?? false
    this.listeners = new Set()
    this.logger = logger

    this.credentials = {
      username: null,
      password: null,
    }

    if (this.persistCredentials) {
      const username = this.storage.getItem(LOCAL_STORAGE_USERNAME_KEY)
      const password = this.storage.getItem(LOCAL_STORAGE_PASSWORD_KEY)
      this.credentials.username = username ?? null
      this.credentials.password = password ?? null
    }
  }

  public getGeoserverUrl = (): string | null => {
    return this.storage.getItem(LOCAL_STORAGE_URL_KEY) ?? null
  }

  public setGeoserverUrl = (url: string | null) => {
    if (url == null) this.storage.removeItem(LOCAL_STORAGE_URL_KEY)
    else this.storage.setItem(LOCAL_STORAGE_URL_KEY, url)
    this.emitChange({ geoserverUrl: url })
  }

  public getWorkspace = (): string | null => {
    return this.storage.getItem(LOCAL_STORAGE_WORKSPACE_KEY) ?? null
  }

  public setWorkspace = (workspace: string | null) => {
    if (workspace == null) this.storage.removeItem(LOCAL_STORAGE_WORKSPACE_KEY)
    else this.storage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, workspace)
    this.emitChange({ workspace })
  }

  public getCredentials = (): GeoserverCredentials => {
    return { ...this.credentials }
  }

  public setCredentials = (creds: GeoserverCredentials, persist?: boolean) => {
    this.credentials = {
      username: creds.username ?? null,
      password: creds.password ?? null,
    }

    if (persist ?? this.persistCredentials) {
      if (creds.username == null)
        this.storage.removeItem(LOCAL_STORAGE_USERNAME_KEY)
      else this.storage.setItem(LOCAL_STORAGE_USERNAME_KEY, creds.username)

      if (creds.password == null)
        this.storage.removeItem(LOCAL_STORAGE_PASSWORD_KEY)
      else this.storage.setItem(LOCAL_STORAGE_PASSWORD_KEY, creds.password)
    }

    this.emitChange({ credentials: { ...this.credentials } })
  }

  public clearCredentials = () => {
    this.credentials = { username: null, password: null }
    if (this.persistCredentials) {
      this.storage.removeItem(LOCAL_STORAGE_USERNAME_KEY)
      this.storage.removeItem(LOCAL_STORAGE_PASSWORD_KEY)
    }
    this.emitChange({ credentials: { ...this.credentials } })
  }

  public onChange = (cb: GeoserverConfigChangeListener) => {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  private emitChange = (change: GeoserverConfigChange) => {
    this.listeners.forEach((l) => {
      try {
        l(change)
      } catch (error) {
        this.logger.error({
          msg: 'Error in GeoserverConfigChangeListener',
          error,
        })
      }
    })
  }
}

export default GeoserverConfigManagerService
