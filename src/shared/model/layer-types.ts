export type LayerStatusType = 'idle' | 'loading' | 'success' | 'error'

export type LayerStatus =
  | { type: 'idle' }
  | { type: 'loading'; startedAt: number }
  | { type: 'success'; loadedAt: number; dataPointsCount: number }
  | { type: 'error'; message: string; canRetry: boolean; failedAt: number }

export type LayerCategory = 'atmosphere' | 'energy' | 'satellite' | 'ecology'

export type LayerColorScheme = 'temperature' | 'wind' | 'solar' | 'satellite' | 'default'

export interface LayerMetadata {
  id: string
  name: string
  code: string
  description: string
  category: LayerCategory
  unit: string
  minVal: number
  maxVal: number
  colorScheme: LayerColorScheme
}

export interface LayerDataPayload {
  layerId: string
  timestamp: string
  gridResolution: string
  featuresCount: number
  min: number
  max: number
  unit: string
  legendGradient: string[]
}

export interface LayerState {
  id: string
  metadata: LayerMetadata
  isEnabled: boolean
  opacity: number // 0 to 100
  status: LayerStatus
  data: LayerDataPayload | null
}

export interface LayersStoreState {
  layers: Record<string, LayerState>
  layerIds: string[]
  searchQuery: string
  selectedCategory: LayerCategory | 'all'
  simulateErrors: boolean // Dev toggle to demonstrate retry & error states
}
