import type { LayerDataPayload } from '../model/layer-types'

export interface FetchLayerOptions {
  signal?: AbortSignal
  delayMs?: number
  forceError?: boolean
}

const GRADIENTS: Record<string, string[]> = {
  'layer-temperature': ['#313695', '#4575b4', '#74add1', '#fee090', '#f46d43', '#a50026'],
  'layer-wind': ['#08519c', '#3182bd', '#6baed6', '#bdd7e7', '#eff3ff'],
  'layer-insolation': ['#7a0177', '#c51b8a', '#f768a1', '#fbb4b9', '#feebe2', '#fff7bc', '#d95f0e'],
  default: ['#00441b', '#238b45', '#66c2a4', '#b2e2e2', '#edf8fb'],
}

export async function fetchLayerMock(
  layerId: string,
  options: FetchLayerOptions = {}
): Promise<LayerDataPayload> {
  const { signal, delayMs = Math.floor(Math.random() * 500) + 700, forceError = false } = options

  if (signal?.aborted) {
    throw new DOMException('The user aborted a request.', 'AbortError')
  }

  await new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const onAbort = () => {
      if (timer) clearTimeout(timer)
      if (signal) signal.removeEventListener('abort', onAbort)
      reject(new DOMException('The user aborted a request.', 'AbortError'))
    }

    if (signal) {
      signal.addEventListener('abort', onAbort)
    }

    timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort)

      if (forceError) {
        const errorMessages = [
          '504 Gateway Timeout: GIS WMS-сервер геопривязки не отвечает',
          '503 Service Unavailable: Спутниковый кластер временно перегружен',
          'ERR_NETWORK: Ошибка передачи NetCDF растровых матриц',
          '429 Too Many Requests: Превышен лимит запросов к тайловому сервису',
        ]
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)]
        reject(new Error(randomError))
      } else {
        resolve()
      }
    }, delayMs)
  })

  const gradient = GRADIENTS[layerId] || GRADIENTS.default

  return {
    layerId,
    timestamp: new Date().toISOString(),
    gridResolution: '0.05° x 0.05° (~5.5 км)',
    featuresCount: Math.floor(Math.random() * 1500) + 2400,
    min: layerId === 'layer-temperature' ? -15 : layerId === 'layer-wind' ? 0 : 120,
    max: layerId === 'layer-temperature' ? 38 : layerId === 'layer-wind' ? 28 : 980,
    unit: layerId === 'layer-temperature' ? '°C' : layerId === 'layer-wind' ? 'м/с' : 'Вт/м²',
    legendGradient: gradient,
  }
}
