import type { LayerMetadata, LayerState } from './layer-types'

export const PRIMARY_LAYERS: LayerMetadata[] = [
  {
    id: 'layer-temperature',
    name: 'Температура поверхности',
    code: 'TEMP_SURFACE_2M',
    description:
      'Тепловой растр поверхности на высоте 2м по данным реанализа и спутниковой радиометрии',
    category: 'atmosphere',
    unit: '°C',
    minVal: -25,
    maxVal: 45,
    colorScheme: 'temperature',
  },
  {
    id: 'layer-wind',
    name: 'Векторное поле ветра',
    code: 'WIND_VECTORS_10M',
    description: 'Скорость и направление ветра на высоте 10м (векторные потоки частиц и изолинии)',
    category: 'atmosphere',
    unit: 'м/с',
    minVal: 0,
    maxVal: 35,
    colorScheme: 'wind',
  },
  {
    id: 'layer-insolation',
    name: 'Солнечная инсоляция',
    code: 'SOLAR_GHI_IRRADIANCE',
    description:
      'Суммарная глобальная горизонтальная радиация (GHI) для экологии и солнечной энергетики',
    category: 'energy',
    unit: 'Вт/м²',
    minVal: 0,
    maxVal: 1100,
    colorScheme: 'solar',
  },
]

export const createDefaultLayerState = (metadata: LayerMetadata): LayerState => ({
  id: metadata.id,
  metadata,
  isEnabled: false,
  opacity: 80,
  status: { type: 'idle' },
  data: null,
})

export const INITIAL_PRIMARY_LAYERS_RECORD: Record<string, LayerState> = PRIMARY_LAYERS.reduce(
  (acc, meta) => {
    acc[meta.id] = createDefaultLayerState(meta)
    return acc
  },
  {} as Record<string, LayerState>
)

export const INITIAL_PRIMARY_LAYER_IDS = PRIMARY_LAYERS.map((l) => l.id)

export function generateLayersDataset(totalCount: number = 100): {
  layers: Record<string, LayerState>
  layerIds: string[]
} {
  const layers: Record<string, LayerState> = { ...INITIAL_PRIMARY_LAYERS_RECORD }
  const layerIds: string[] = [...INITIAL_PRIMARY_LAYER_IDS]

  const categories: Array<LayerMetadata['category']> = [
    'atmosphere',
    'energy',
    'satellite',
    'ecology',
  ]
  const prefixes = [
    'Влажность почвы',
    'Осадки радарные',
    'Индекс вегетации NDVI',
    'Аэрозоли PM2.5',
    'Облачный покров',
    'Тепловые аномалии MODIS',
    'Концентрация CO2',
    'Атмосферное давление',
    'УФ-индекс',
    'Снежный покров',
  ]

  for (let i = layerIds.length; i < totalCount; i++) {
    const prefix = prefixes[i % prefixes.length]
    const zoneNum = Math.floor(i / prefixes.length) + 1
    const id = `layer-gis-${i + 1}`
    const category = categories[i % categories.length]

    const meta: LayerMetadata = {
      id,
      name: `${prefix} (Зона ${zoneNum})`,
      code: `GIS_LAYER_${(i + 1).toString().padStart(3, '0')}`,
      description: `Геопространственный растр высокого разрешения для сектора #${zoneNum}`,
      category,
      unit: i % 2 === 0 ? 'индекс' : '%',
      minVal: 0,
      maxVal: 100,
      colorScheme: i % 3 === 0 ? 'satellite' : 'default',
    }

    layers[id] = createDefaultLayerState(meta)
    layerIds.push(id)
  }

  return { layers, layerIds }
}
