import React, { useRef, useEffect } from 'react'
import { useLayersSelector } from '../model/layer-store'
import { useLayerActions } from '../model/use-layer-actions'
import { Card, CardContent } from '@/shared/ui/card'
import { Switch } from '@/shared/ui/switch'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { LayerStatusBadge } from './layer-status-badge'
import { Thermometer, Wind, Sun, Layers, Activity } from 'lucide-react'
import type { LayerCategory } from '@/shared/model/layer-types'

interface LayerItemProps {
  layerId: string
  showRenderCount?: boolean
}

const CATEGORY_NAMES: Record<LayerCategory, string> = {
  atmosphere: 'Атмосфера',
  energy: 'Энергетика',
  satellite: 'Спутники',
  ecology: 'Экология',
}

const getLayerIcon = (id: string, category: LayerCategory) => {
  if (id === 'layer-temperature') return <Thermometer className="size-4 text-orange-500" />
  if (id === 'layer-wind') return <Wind className="size-4 text-sky-500" />
  if (id === 'layer-insolation') return <Sun className="size-4 text-amber-500" />
  if (category === 'satellite') return <Activity className="size-4 text-purple-500" />
  return <Layers className="size-4 text-slate-500" />
}

export const LayerItem: React.FC<LayerItemProps> = React.memo(
  ({ layerId, showRenderCount = true }) => {
    // Выбираем только данные конкретного слоя из Vedro Store.
    // Благодаря JSON-сравнению в Vedro, изменения других слоев не вызывают ререндер этого компонента.
    const layer = useLayersSelector((state) => state.layers[layerId])
    const { toggleLayer, setOpacity, retryLayer } = useLayerActions()

    // Счетчик рендеров для наглядной демонстрации отсутствия лишних render'ов
    const renderCountRef = useRef(1)
    useEffect(() => {
      renderCountRef.current += 1
    })

    if (!layer) return null

    const { isEnabled, opacity, status, metadata } = layer

    const handleToggle = (checked: boolean) => {
      toggleLayer(layerId, checked)
    }

    const handleOpacityChange = (value: number | readonly number[]) => {
      const val = Array.isArray(value) ? value[0] : (value as number)
      setOpacity(layerId, val)
    }

    const handleRetry = () => {
      retryLayer(layerId)
    }

    return (
      <Card
        className={`transition-all duration-200 border ${
          isEnabled
            ? 'bg-card/90 shadow-sm border-primary/20 ring-1 ring-primary/10'
            : 'bg-muted/30 opacity-75 border-border/60 hover:opacity-100'
        }`}
      >
        <CardContent className="p-4 space-y-3.5">
          {/* Заголовок и переключатель */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-background border shadow-2xs shrink-0 mt-0.5">
                {getLayerIcon(layerId, metadata.category)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm leading-tight tracking-tight text-foreground truncate">
                    {metadata.name}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground"
                  >
                    {CATEGORY_NAMES[metadata.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {metadata.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                aria-label={`Включить слой ${metadata.name}`}
              />
            </div>
          </div>

          {/* Статус и метрика рендеров */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[11px]">Статус:</span>
              <LayerStatusBadge status={status} isEnabled={isEnabled} onRetry={handleRetry} />
            </div>

            {showRenderCount && (
              <div
                title="Количество повторных рендеров этого компонента. Доказывает отсутствие лишних render при обновлении других слоев!"
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40 cursor-help"
              >
                renders:{' '}
                <span className="font-semibold text-foreground">{renderCountRef.current}</span>
              </div>
            )}
          </div>

          {/* Контрол прозрачности (активен только если слой включен) */}
          {isEnabled && (
            <div className="space-y-1.5 pt-1 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px] font-medium">
                  Прозрачность (Opacity)
                </span>
                <span className="font-mono text-xs font-semibold text-primary">{opacity}%</span>
              </div>
              <Slider
                value={[opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
                className="py-1 cursor-pointer"
                aria-label={`Прозрачность слоя ${metadata.name}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

LayerItem.displayName = 'LayerItem'
