import React, { useMemo } from 'react'
import { useLayersSelector } from '../model/layer-store'
import { useLayerActions } from '../model/use-layer-actions'
import { LayerItem } from './layer-item'
import {
  LayerListLayout,
  LayerListLayoutHeader,
  LayerListLayoutControls,
  LayerListLayoutFilters,
  LayerListLayoutContent,
} from './layer-list-layout'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Switch } from '@/shared/ui/switch'
import { Search, Layers, Bug, CheckCheck, XCircle, Zap } from 'lucide-react'
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

  const filteredIds = useMemo(() => {
    return layerIds.filter((id) => {
      const layer = layersRecord[id]
      if (!layer) return false

      if (selectedCategory !== 'all' && layer.metadata.category !== selectedCategory) {
        return false
      }

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
    <LayerListLayout
      header={
        <LayerListLayoutHeader
          icon={<Layers className="size-4" />}
          title="Управление слоями GIS"
          subtitle="Национальная геоинформационная платформа"
          badge={
            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
              Активно: {stats.active}/{stats.total}
            </Badge>
          }
        />
      }
      controls={
        <LayerListLayoutControls
          modeSwitch={
            <>
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
            </>
          }
          errorToggle={
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Bug className="size-3.5 text-rose-500" />
              <span className="text-muted-foreground text-[11px]">Имитация сбоев API:</span>
              <Switch
                checked={simulateErrors}
                onCheckedChange={toggleSimulateErrors}
                aria-label="Имитировать сетевые сбои"
              />
            </div>
          }
          actions={
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
          }
        />
      }
      filters={
        <LayerListLayoutFilters
          search={
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Поиск слоя по имени, коду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          }
          categories={CATEGORIES.map((cat) => (
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
        />
      }
      footer={
        <>
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
        </>
      }
    >
      <LayerListLayoutContent
        isEmpty={filteredIds.length === 0}
        renderList={() => filteredIds.map((id) => <LayerItem key={id} layerId={id} />)}
      />
    </LayerListLayout>
  )
}
