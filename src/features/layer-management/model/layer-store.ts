import { createVedro } from 'vedro'
import type { LayerCategory, LayersStoreState } from '@/shared/model/layer-types'
import {
  INITIAL_PRIMARY_LAYERS_RECORD,
  INITIAL_PRIMARY_LAYER_IDS,
  generateLayersDataset,
} from '@/shared/model/initial-layers'
import { fetchLayerMock } from '@/shared/api/mock-layers-api'
import { layerAbortManager, isAbortError } from '@/shared/lib/abort-manager'

export interface ExtendedLayersStoreState extends LayersStoreState {
  datasetMode: '3-layers' | '100-layers'
}

const initialStoreState: ExtendedLayersStoreState = {
  layers: { ...INITIAL_PRIMARY_LAYERS_RECORD },
  layerIds: [...INITIAL_PRIMARY_LAYER_IDS],
  searchQuery: '',
  selectedCategory: 'all',
  simulateErrors: false,
  datasetMode: '3-layers',
}

export const {
  Context: LayersStoreContext,
  Provider: LayersStoreProvider,
  useStore: useLayersStore,
  useDispatch: useLayersDispatch,
  useSelector: useLayersSelector,
} = createVedro<ExtendedLayersStoreState>(initialStoreState)

/**
 * Сервисные действия над хранилищем (инкапсулируют бизнес-логику и работу с сетью)
 */
export const layerActions = {
  /**
   * Включение / выключение слоя с защитой от Race Condition через AbortController
   */
  toggleLayer: (store: ReturnType<typeof useLayersStore>, layerId: string, enabled: boolean) => {
    const state = store.get()
    const currentLayer = state.layers[layerId]
    if (!currentLayer) return

    if (!enabled) {
      // 1. Отменяем активный сетевой запрос, если он шел
      layerAbortManager.abort(layerId)

      // 2. Выключаем слой в стейте
      store.dispatch((s) => ({
        layers: {
          ...s.layers,
          [layerId]: {
            ...s.layers[layerId],
            isEnabled: false,
            // Если запрос оборвался в полете, возвращаем idle
            status:
              s.layers[layerId].status.type === 'loading'
                ? { type: 'idle' }
                : s.layers[layerId].status,
          },
        },
      }))
      return
    }

    // Включение слоя:
    // Инициируем запрос с новым AbortSignal
    const { signal, requestId } = layerAbortManager.beginRequest(layerId)

    // Устанавливаем статус loading и флаг включен
    store.dispatch((s) => ({
      layers: {
        ...s.layers,
        [layerId]: {
          ...s.layers[layerId],
          isEnabled: true,
          status: { type: 'loading', startedAt: Date.now() },
        },
      },
    }))

    // Вызываем асинхронный mock API
    fetchLayerMock(layerId, {
      signal,
      forceError: store.get().simulateErrors,
    })
      .then((data) => {
        // Проверяем, что ответ принадлежит именно текущему запросу и слой все еще включен
        if (!layerAbortManager.isLatestRequest(layerId, requestId)) return
        const latestState = store.get()
        if (!latestState.layers[layerId]?.isEnabled) return

        store.dispatch((s) => ({
          layers: {
            ...s.layers,
            [layerId]: {
              ...s.layers[layerId],
              status: {
                type: 'success',
                loadedAt: Date.now(),
                dataPointsCount: data.featuresCount,
              },
              data,
            },
          },
        }))
      })
      .catch((error: unknown) => {
        // Если запрос был отменен (пользователь быстро выключил слой или перезапустил) — игнорируем ошибку
        if (isAbortError(error)) {
          return
        }

        // Если это устаревший запрос — игнорируем
        if (!layerAbortManager.isLatestRequest(layerId, requestId)) return

        const errorMessage =
          error instanceof Error ? error.message : 'Неизвестная ошибка загрузки геослоя'

        store.dispatch((s) => ({
          layers: {
            ...s.layers,
            [layerId]: {
              ...s.layers[layerId],
              status: {
                type: 'error',
                message: errorMessage,
                canRetry: true,
                failedAt: Date.now(),
              },
            },
          },
        }))
      })
  },

  /**
   * Повторная загрузка слоя после ошибки (Retry)
   */
  retryLayer: (store: ReturnType<typeof useLayersStore>, layerId: string) => {
    const state = store.get()
    const currentLayer = state.layers[layerId]
    if (!currentLayer) return

    const { signal, requestId } = layerAbortManager.beginRequest(layerId)

    store.dispatch((s) => ({
      layers: {
        ...s.layers,
        [layerId]: {
          ...s.layers[layerId],
          isEnabled: true,
          status: { type: 'loading', startedAt: Date.now() },
        },
      },
    }))

    fetchLayerMock(layerId, {
      signal,
      forceError: store.get().simulateErrors,
    })
      .then((data) => {
        if (!layerAbortManager.isLatestRequest(layerId, requestId)) return
        const latestState = store.get()
        if (!latestState.layers[layerId]?.isEnabled) return

        store.dispatch((s) => ({
          layers: {
            ...s.layers,
            [layerId]: {
              ...s.layers[layerId],
              status: {
                type: 'success',
                loadedAt: Date.now(),
                dataPointsCount: data.featuresCount,
              },
              data,
            },
          },
        }))
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        if (!layerAbortManager.isLatestRequest(layerId, requestId)) return

        const errorMessage =
          error instanceof Error ? error.message : 'Неизвестная ошибка загрузки геослоя'

        store.dispatch((s) => ({
          layers: {
            ...s.layers,
            [layerId]: {
              ...s.layers[layerId],
              status: {
                type: 'error',
                message: errorMessage,
                canRetry: true,
                failedAt: Date.now(),
              },
            },
          },
        }))
      })
  },

  /**
   * Регулировка прозрачности (0 - 100)
   */
  setOpacity: (store: ReturnType<typeof useLayersStore>, layerId: string, opacity: number) => {
    store.dispatch((s) => ({
      layers: {
        ...s.layers,
        [layerId]: {
          ...s.layers[layerId],
          opacity,
        },
      },
    }))
  },

  /**
   * Поиск по имени и коду слоя
   */
  setSearchQuery: (store: ReturnType<typeof useLayersStore>, query: string) => {
    store.dispatch({ searchQuery: query })
  },

  /**
   * Фильтрация по категории
   */
  setSelectedCategory: (
    store: ReturnType<typeof useLayersStore>,
    category: LayerCategory | 'all'
  ) => {
    store.dispatch({ selectedCategory: category })
  },

  /**
   * Переключение симуляции ошибок (для тестирования кнопки повтора)
   */
  toggleSimulateErrors: (store: ReturnType<typeof useLayersStore>, simulate: boolean) => {
    store.dispatch({ simulateErrors: simulate })
  },

  /**
   * Переключение между базовыми 3 слоями и 100+ слоями для проверки масштабируемости
   */
  switchDatasetMode: (
    store: ReturnType<typeof useLayersStore>,
    mode: '3-layers' | '100-layers'
  ) => {
    layerAbortManager.abortAll()

    if (mode === '3-layers') {
      store.dispatch({
        layers: { ...INITIAL_PRIMARY_LAYERS_RECORD },
        layerIds: [...INITIAL_PRIMARY_LAYER_IDS],
        datasetMode: '3-layers',
      })
    } else {
      const generated = generateLayersDataset(100)
      store.dispatch({
        layers: generated.layers,
        layerIds: generated.layerIds,
        datasetMode: '100-layers',
      })
    }
  },

  /**
   * Массовое включение / выключение (тест одновременных запросов)
   */
  batchToggleAll: (store: ReturnType<typeof useLayersStore>, enable: boolean) => {
    const state = store.get()
    state.layerIds.forEach((id) => {
      layerActions.toggleLayer(store, id, enable)
    })
  },
}
