import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { CustomLayer } from '@/features/map/components/CustomLayer'

export const MapLayers = () => {
  const { layers } = useLayerContext()
  const layersArray = Array.from(layers.values())

  return (
    <>
      {layersArray.map((layer) => (
        <CustomLayer key={layer.fullName} layer={layer} />
      ))}
    </>
  )
}
