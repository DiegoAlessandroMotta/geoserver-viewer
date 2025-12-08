export class GeoserverAuthRequiredError extends Error {
  public status: number

  constructor(message?: string) {
    super(message ?? 'Authentication required')
    this.name = 'GeoserverAuthRequiredError'
    this.status = 401
  }
}
