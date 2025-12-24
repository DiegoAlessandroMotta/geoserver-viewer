import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GeoserverConfigForm } from '@/features/sidebar/components/GeoserverConfigForm'

const makeCtx = (overrides: any = {}) => ({
  geoserverUrl: overrides.geoserverUrl ?? null,
  workspace: overrides.workspace ?? null,
  setConfig: overrides.setConfig ?? vi.fn(),
  setCredentials: overrides.setCredentials ?? vi.fn(),
  clearConfig: overrides.clearConfig ?? vi.fn(),
  clearCredentials: overrides.clearCredentials ?? vi.fn(),
  areCredentialsPersisted: overrides.areCredentialsPersisted ?? (() => false),
  credentials: overrides.credentials ?? { username: null, password: null },
})

import * as geoserverHook from '@/shared/context/geoserver-config/useGeoserverConfig'
vi.mock('@/shared/context/geoserver-config/useGeoserverConfig', () => ({
  useGeoserverConfig: () => makeCtx(),
}))

describe('GeoserverConfigForm', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('expands and submits form calling setConfig and setCredentials, then collapses', () => {
    const setConfig = vi.fn()
    const setCredentials = vi.fn()

    vi.spyOn(geoserverHook, 'useGeoserverConfig').mockReturnValue(
      makeCtx({ setConfig, setCredentials }) as any,
    )

    render(<GeoserverConfigForm />)

    const toggle = screen.getByRole('button', { name: /Configuración/i })
    fireEvent.click(toggle)

    const urlInput = screen.getByPlaceholderText(
      'http://localhost:8080/geoserver',
    )
    const wsInput = screen.getByPlaceholderText('geoserver_workspace')
    const userInput = screen.getByPlaceholderText('geo_user')
    const passInput = screen.getByPlaceholderText('geo_password')

    fireEvent.change(urlInput, { target: { value: '  http://g  ' } })
    fireEvent.change(wsInput, { target: { value: ' ws1 ' } })
    fireEvent.change(userInput, { target: { value: 'u' } })
    fireEvent.change(passInput, { target: { value: 'p' } })

    const submitBtn = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitBtn)

    expect(setConfig).toHaveBeenCalledWith({
      geoserverUrl: 'http://g',
      workspace: 'ws1',
    })
    expect(setCredentials).toHaveBeenCalledWith(
      { username: 'u', password: 'p' },
      false,
    )

    expect(
      screen.queryByPlaceholderText('http://localhost:8080/geoserver'),
    ).toBeNull()
  })

  it('clear button resets fields and calls clearConfig / clearCredentials', () => {
    const clearConfig = vi.fn()
    const clearCredentials = vi.fn()

    vi.spyOn(geoserverHook, 'useGeoserverConfig').mockReturnValue(
      makeCtx({
        clearConfig,
        clearCredentials,
        geoserverUrl: 'http://x',
        workspace: 'w',
      }) as any,
    )

    render(<GeoserverConfigForm />)

    const toggle = screen.getByRole('button', { name: /Configuración/i })
    fireEvent.click(toggle)

    const urlInput = screen.getByPlaceholderText(
      'http://localhost:8080/geoserver',
    )
    const wsInput = screen.getByPlaceholderText('geoserver_workspace')

    fireEvent.change(urlInput, { target: { value: 'http://x' } })
    fireEvent.change(wsInput, { target: { value: 'w' } })

    const clearBtn = screen.getByRole('button', { name: /Limpiar/i })
    fireEvent.click(clearBtn)

    expect(clearConfig).toHaveBeenCalled()
    expect(clearCredentials).toHaveBeenCalled()

    const urlInputEl = screen.getByPlaceholderText(
      'http://localhost:8080/geoserver',
    ) as HTMLInputElement
    const wsInputEl = screen.getByPlaceholderText(
      'geoserver_workspace',
    ) as HTMLInputElement
    expect(urlInputEl.value).toBe('')
    expect(wsInputEl.value).toBe('')
  })
})
