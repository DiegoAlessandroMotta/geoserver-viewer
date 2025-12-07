import type { ILogger } from '../interfaces/logger.interface'

export interface GeoserverCredentials {
  username: string | null
  password: string | null
}

export type GeoserverConfigChange = Partial<{
  geoserverUrl: string | null
  workspace: string | null
  credentials: GeoserverCredentials
  sessionId: string | null
}>

export type GeoserverConfigChangeListener = (
  change: GeoserverConfigChange,
) => void

const LOCAL_STORAGE_URL_KEY = 'geoserver_base_url'
const LOCAL_STORAGE_WORKSPACE_KEY = 'geoserver_workspace'
const LOCAL_STORAGE_USERNAME_KEY = 'geoserver_username'
const LOCAL_STORAGE_PASSWORD_KEY = 'geoserver_password'

export interface GeoserverConfigManagerOptions {
  storage?: Storage
  logger: ILogger
}

export class GeoserverConfigManagerService {
  private readonly storage: Storage
  private readonly logger: ILogger
  private readonly persistCredentials: boolean
  private readonly listeners: Set<GeoserverConfigChangeListener>
  private credentials: GeoserverCredentials
  private geoserverUrl: string | null
  private workspace: string | null
  private sessionId: string

  constructor({ storage, logger }: GeoserverConfigManagerOptions) {
    this.storage = storage ?? localStorage
    const storedUsername = this.storage.getItem(LOCAL_STORAGE_USERNAME_KEY)
    const storedPassword = this.storage.getItem(LOCAL_STORAGE_PASSWORD_KEY)
    const hasStoredCreds = Boolean(storedUsername || storedPassword)
    this.persistCredentials = hasStoredCreds
    this.listeners = new Set()
    this.logger = logger

    this.geoserverUrl = this.storage.getItem(LOCAL_STORAGE_URL_KEY) ?? null
    this.workspace = this.storage.getItem(LOCAL_STORAGE_WORKSPACE_KEY) ?? null
    this.sessionId = crypto.randomUUID()
    this.credentials = {
      username: null,
      password: null,
    }

    if (this.persistCredentials) {
      this.credentials.username = storedUsername ?? null
      this.credentials.password = storedPassword ?? null
    }
  }

  public getGeoserverUrl = (): string | null => {
    return this.geoserverUrl
  }

  public setGeoserverUrl = (url: string | null) => {
    if (url == null) this.storage.removeItem(LOCAL_STORAGE_URL_KEY)
    else this.storage.setItem(LOCAL_STORAGE_URL_KEY, url)
    this.geoserverUrl = url
    this.emitChange({ geoserverUrl: url })
  }

  public getWorkspace = (): string | null => {
    return this.workspace
  }

  public setWorkspace = (workspace: string | null) => {
    if (workspace == null) this.storage.removeItem(LOCAL_STORAGE_WORKSPACE_KEY)
    else this.storage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, workspace)
    this.workspace = workspace
    this.emitChange({ workspace })
  }

  public setConfig = (
    cfg: Partial<{
      geoserverUrl: string | null
      workspace: string | null
      sessionId: string
    }>,
  ) => {
    const emitted: any = {}

    if (cfg.geoserverUrl !== undefined) {
      if (cfg.geoserverUrl == null)
        this.storage.removeItem(LOCAL_STORAGE_URL_KEY)
      else this.storage.setItem(LOCAL_STORAGE_URL_KEY, cfg.geoserverUrl)
      this.geoserverUrl = cfg.geoserverUrl ?? null
      emitted.geoserverUrl = cfg.geoserverUrl ?? null
    }

    if (cfg.workspace !== undefined) {
      if (cfg.workspace == null)
        this.storage.removeItem(LOCAL_STORAGE_WORKSPACE_KEY)
      else this.storage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, cfg.workspace)
      this.workspace = cfg.workspace ?? null
      emitted.workspace = cfg.workspace ?? null
    }

    if (cfg.sessionId !== undefined) {
      this.sessionId = cfg.sessionId
      emitted.sessionId = cfg.sessionId ?? null
    }

    if (Object.keys(emitted).length > 0) {
      this.emitChange(emitted)
    }
  }

  public getSessionId = (): string => {
    return this.sessionId
  }

  public setSessionId = (sessionId: string) => {
    this.sessionId = sessionId
    this.emitChange({ sessionId })
  }

  public getCredentials = (): GeoserverCredentials => {
    return { ...this.credentials }
  }

  public areCredentialsPersisted = (): boolean => {
    return this.persistCredentials
  }

  public setCredentials = (creds: GeoserverCredentials, persist?: boolean) => {
    this.credentials = {
      username: creds.username ?? null,
      password: creds.password ?? null,
    }

    const willPersist = persist ?? this.persistCredentials
    if (willPersist) {
      if (creds.username == null)
        this.storage.removeItem(LOCAL_STORAGE_USERNAME_KEY)
      else this.storage.setItem(LOCAL_STORAGE_USERNAME_KEY, creds.username)

      if (creds.password == null)
        this.storage.removeItem(LOCAL_STORAGE_PASSWORD_KEY)
      else this.storage.setItem(LOCAL_STORAGE_PASSWORD_KEY, creds.password)
    } else {
      this.storage.removeItem(LOCAL_STORAGE_USERNAME_KEY)
      this.storage.removeItem(LOCAL_STORAGE_PASSWORD_KEY)
    }

    this.emitChange({ credentials: { ...this.credentials } })
  }

  public clearCredentials = () => {
    this.credentials = { username: null, password: null }
    this.storage.removeItem(LOCAL_STORAGE_USERNAME_KEY)
    this.storage.removeItem(LOCAL_STORAGE_PASSWORD_KEY)
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
