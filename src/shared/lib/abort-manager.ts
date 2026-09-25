class LayerAbortManager {
  private controllers = new Map<string, AbortController>()
  private requestIds = new Map<string, number>()

  beginRequest(layerId: string): { signal: AbortSignal; requestId: number } {
    this.abort(layerId)

    const controller = new AbortController()
    this.controllers.set(layerId, controller)

    const nextId = (this.requestIds.get(layerId) ?? 0) + 1
    this.requestIds.set(layerId, nextId)

    return { signal: controller.signal, requestId: nextId }
  }

  isLatestRequest(layerId: string, requestId: number): boolean {
    return this.requestIds.get(layerId) === requestId
  }

  abort(layerId: string): void {
    const active = this.controllers.get(layerId)
    if (active) {
      active.abort('Cancelled by user or superseded by new request')
      this.controllers.delete(layerId)
    }
  }

  abortAll(): void {
    this.controllers.forEach((ctrl) => {
      ctrl.abort('Cancelled by global reset')
    })
    this.controllers.clear()
  }
}

export const layerAbortManager = new LayerAbortManager()

export function isAbortError(error: unknown): boolean {
  if (!error) return false
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (typeof error === 'object' && 'name' in error && error.name === 'AbortError') return true
  return false
}
