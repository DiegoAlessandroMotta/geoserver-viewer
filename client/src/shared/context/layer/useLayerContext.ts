import { useContext } from 'react'
import { LayerContext } from '@/shared/context/layer/LayerContext'

export const useLayerContext = () => {
  const ctx = useContext(LayerContext)

  if (!ctx) {
    throw new Error(
      'useLayerContext must be used within a LayerContextProvider',
    )
  }

  return ctx
}
