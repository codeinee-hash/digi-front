import { useCallback } from 'react'
import { useLayersStore, layerActions } from './layer-store'
import type { LayerCategory } from '@/shared/model/layer-types'

export function useLayerActions() {
  const store = useLayersStore()

  const toggleLayer = useCallback(
    (layerId: string, enabled: boolean) => {
      layerActions.toggleLayer(store, layerId, enabled)
    },
    [store]
  )

  const retryLayer = useCallback(
    (layerId: string) => {
      layerActions.retryLayer(store, layerId)
    },
    [store]
  )

  const setOpacity = useCallback(
    (layerId: string, opacity: number) => {
      layerActions.setOpacity(store, layerId, opacity)
    },
    [store]
  )

  const setSearchQuery = useCallback(
    (query: string) => {
      layerActions.setSearchQuery(store, query)
    },
    [store]
  )

  const setSelectedCategory = useCallback(
    (category: LayerCategory | 'all') => {
      layerActions.setSelectedCategory(store, category)
    },
    [store]
  )

  const toggleSimulateErrors = useCallback(
    (simulate: boolean) => {
      layerActions.toggleSimulateErrors(store, simulate)
    },
    [store]
  )

  const switchDatasetMode = useCallback(
    (mode: '3-layers' | '100-layers') => {
      layerActions.switchDatasetMode(store, mode)
    },
    [store]
  )

  const batchToggleAll = useCallback(
    (enable: boolean) => {
      layerActions.batchToggleAll(store, enable)
    },
    [store]
  )

  return {
    toggleLayer,
    retryLayer,
    setOpacity,
    setSearchQuery,
    setSelectedCategory,
    toggleSimulateErrors,
    switchDatasetMode,
    batchToggleAll,
  }
}
