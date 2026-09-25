import React from 'react'
import { useLayersSelector } from '@/features/layer-management'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Layers } from 'lucide-react'

export const MapLegend: React.FC = () => {
  const { layerIds, layers } = useLayersSelector((state) => ({
    layerIds: state.layerIds,
    layers: state.layers,
  }))

  const activeLayers = layerIds
    .map((id) => layers[id])
    .filter((l) => l && l.isEnabled && l.status.type === 'success')

  if (activeLayers.length === 0) {
    return (
      <Card className="p-3 bg-background/85 backdrop-blur-md border-border/80 shadow-lg text-xs space-y-1.5 max-w-xs pointer-events-auto">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Layers className="size-3.5" />
          <span>Легенда карты</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Включите слой в панели слева для отображения геопространственных данных
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-3 bg-background/90 backdrop-blur-md border-border/80 shadow-lg text-xs space-y-2.5 max-w-xs pointer-events-auto">
      <div className="flex items-center justify-between border-b pb-1.5 border-border/60">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Layers className="size-3.5 text-primary" />
          <span>Активные слои ({activeLayers.length})</span>
        </div>
        <Badge variant="outline" className="text-[10px] h-4 px-1">
          WMS Raster
        </Badge>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {activeLayers.map((l) => {
          const gradient = l.data?.legendGradient || ['#3182bd', '#fee090', '#a50026']
          return (
            <div key={l.id} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-foreground truncate max-w-36">
                  {l.metadata.name}
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">{l.opacity}%</span>
              </div>

              <div
                className="h-2 rounded-full border border-black/10 shadow-2xs"
                style={{
                  background: `linear-gradient(to right, ${gradient.join(', ')})`,
                }}
              />

              <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                <span>
                  {l.data?.min ?? l.metadata.minVal} {l.metadata.unit}
                </span>
                <span>
                  {l.data?.max ?? l.metadata.maxVal} {l.metadata.unit}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
