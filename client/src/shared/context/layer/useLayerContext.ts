import { useContext } from 'react'
import { LayerContext } from '@/shared/context/layer/LayerContext'

export const useLayerContext = () => useContext(LayerContext)

export default useLayerContext
