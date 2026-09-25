/**
 * Менеджер управления сигналами отмены (AbortController) для слоев карты.
 * Решает проблему Race Condition при частых переключениях (toggle on -> off -> on)
 * и повторных запросах (retry).
 */
class LayerAbortManager {
  private controllers = new Map<string, AbortController>();
  private requestIds = new Map<string, number>();

  /**
   * Начинает новый сетевой цикл для слоя.
   * Если предыдущий запрос еще выполняется, он немедленно отменяется.
   */
  beginRequest(layerId: string): { signal: AbortSignal; requestId: number } {
    this.abort(layerId);

    const controller = new AbortController();
    this.controllers.set(layerId, controller);

    const nextId = (this.requestIds.get(layerId) ?? 0) + 1;
    this.requestIds.set(layerId, nextId);

    return { signal: controller.signal, requestId: nextId };
  }

  /**
   * Проверяет, является ли requestId актуальным (не устарел ли ответ)
   */
  isLatestRequest(layerId: string, requestId: number): boolean {
    return this.requestIds.get(layerId) === requestId;
  }

  /**
   * Отменяет текущий активный запрос для конкретного слоя
   */
  abort(layerId: string): void {
    const active = this.controllers.get(layerId);
    if (active) {
      active.abort('Cancelled by user or superseded by new request');
      this.controllers.delete(layerId);
    }
  }

  /**
   * Отменяет все запросы (например, при переключении датасета или размонтировании)
   */
  abortAll(): void {
    this.controllers.forEach((ctrl) => {
      ctrl.abort('Cancelled by global reset');
    });
    this.controllers.clear();
  }
}

export const layerAbortManager = new LayerAbortManager();

/**
 * Проверка на отмену запроса
 */
export function isAbortError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (typeof error === 'object' && 'name' in error && error.name === 'AbortError') return true;
  return false;
}
