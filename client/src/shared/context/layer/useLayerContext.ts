import { useContext } from 'react'
import { LayerContext } from './LayerContext'

export const useLayerContext = () => useContext(LayerContext)

export default useLayerContext
