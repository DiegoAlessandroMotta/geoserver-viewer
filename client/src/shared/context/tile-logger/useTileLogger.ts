import { useContext } from 'react'
import { TileLoggerContext } from '@/shared/context/tile-logger/TileLoggerContext'

export const useTileLoggerContext = () => {
  const ctx = useContext(TileLoggerContext)

  if (!ctx)
    throw new Error(
      'useTileLoggerContext must be used within a TileLoggerProvider',
    )

  return ctx
}
