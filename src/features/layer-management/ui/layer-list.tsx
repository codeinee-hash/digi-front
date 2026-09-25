import React, { useMemo } from 'react'
import { useLayersSelector } from '../model/layer-store'
import { useLayerActions } from '../model/use-layer-actions'
import { LayerItem } from './layer-item'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Switch } from '@/shared/ui/switch'
import { Search, SlidersHorizontal, Layers, Bug, CheckCheck, XCircle, Zap } from 'lucide-react'
import type { LayerCategory } from '@/shared/model/layer-types'

const CATEGORIES: Array<{ key: LayerCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'atmosphere', label: 'Атмосфера' },
  { key: 'energy', label: 'Энергетика' },
  { key: 'satellite', label: 'Спутники' },
  { key: 'ecology', label: 'Экология' },
]

export const LayerList: React.FC = () => {
  const { layerIds, searchQuery, selectedCategory, datasetMode, simulateErrors } =
    useLayersSelector((state) => ({
      layerIds: state.layerIds,
      searchQuery: state.searchQuery,
      selectedCategory: state.selectedCategory,
      datasetMode: state.datasetMode,
      simulateErrors: state.simulateErrors,
    }))

  const layersRecord = useLayersSelector((state) => state.layers)

  const {
    setSearchQuery,
    setSelectedCategory,
    switchDatasetMode,
    toggleSimulateErrors,
    batchToggleAll,
  } = useLayerActions()

  // Вычисляем общую статистику
  const stats = useMemo(() => {
    let active = 0
    let loading = 0
    let error = 0

    for (const id of layerIds) {
      const l = layersRecord[id]
      if (l) {
        if (l.isEnabled) active++
        if (l.status.type === 'loading') loading++
        if (l.status.type === 'error') error++
      }
    }

    return { total: layerIds.length, active, loading, error }
  }, [layerIds, layersRecord])

  // Фильтрация слоев по поиску и категории
  const filteredIds = useMemo(() => {
    return layerIds.filter((id) => {
      const layer = layersRecord[id]
      if (!layer) return false

      // Фильтр по категории
      if (selectedCategory !== 'all' && layer.metadata.category !== selectedCategory) {
        return false
      }

      // Фильтр по поисковому запросу
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = layer.metadata.name.toLowerCase().includes(q)
        const matchCode = layer.metadata.code.toLowerCase().includes(q)
        const matchDesc = layer.metadata.description.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchDesc) return false
      }

      return true
    })
  }, [layerIds, layersRecord, searchQuery, selectedCategory])

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Верхняя шапка панели управления */}
      <div className="p-4 border-b border-border space-y-3.5 shrink-0 bg-card/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                Управление слоями GIS
              </h2>
              <p className="text-xs text-muted-foreground">
                Национальная геоинформационная платформа
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
            Активно: {stats.active}/{stats.total}
          </Badge>
        </div>

        {/* Переключатель режимов датасета (3 слоя ТЗ vs 100 слоев для демонстрации масштабируемости) */}
        <div className="p-2.5 rounded-lg bg-muted/60 border border-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="size-3.5 text-amber-500" />
            <span className="font-medium text-foreground">Режим каталога:</span>
          </div>

          <div className="flex items-center gap-1 bg-background rounded-md p-0.5 border shadow-2xs">
            <Button
              variant={datasetMode === '3-layers' ? 'default' : 'ghost'}
              size="xs"
              onClick={() => switchDatasetMode('3-layers')}
              className="text-xs h-6 px-2.5"
            >
              3 слоя (ТЗ)
            </Button>
            <Button
              variant={datasetMode === '100-layers' ? 'default' : 'ghost'}
              size="xs"
              onClick={() => switchDatasetMode('100-layers')}
              className="text-xs h-6 px-2.5"
            >
              100+ слоёв
            </Button>
          </div>
        </div>

        {/* Симуляция ошибок и быстрые действия */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Bug className="size-3.5 text-rose-500" />
              <span className="text-muted-foreground text-[11px]">Имитация сбоев API:</span>
              <Switch
                checked={simulateErrors}
                onCheckedChange={toggleSimulateErrors}
                aria-label="Имитировать сетевые сбои"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => batchToggleAll(true)}
              className="h-6 text-[11px] gap-1 px-2"
              title="Включить все слои"
            >
              <CheckCheck className="size-3" />
              <span>Все</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => batchToggleAll(false)}
              className="h-6 text-[11px] gap-1 px-2"
              title="Выключить все слои"
            >
              <XCircle className="size-3" />
              <span>Сброс</span>
            </Button>
          </div>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Поиск слоя по имени, коду..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        {/* Фильтр по категориям */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.key}
              variant={selectedCategory === cat.key ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setSelectedCategory(cat.key)}
              className={`h-6 text-[11px] px-2 rounded-full whitespace-nowrap shrink-0 ${
                selectedCategory === cat.key
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Список слоев со скроллом */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredIds.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <SlidersHorizontal className="size-8 mx-auto opacity-40" />
            <p className="text-sm font-medium">Слои не найдены</p>
            <p className="text-xs">Попробуйте изменить поисковый запрос или фильтр</p>
          </div>
        ) : (
          filteredIds.map((id) => <LayerItem key={id} layerId={id} />)
        )}
      </div>

      {/* Нижний статус-бар */}
      <div className="p-2.5 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
        <span>
          Показано: {filteredIds.length} из {stats.total}
        </span>
        {stats.loading > 0 && (
          <span className="text-blue-500 font-medium animate-pulse">
            Загружается: {stats.loading}...
          </span>
        )}
        {stats.error > 0 && (
          <span className="text-destructive font-medium">Сбоев: {stats.error}</span>
        )}
      </div>
    </div>
  )
}
