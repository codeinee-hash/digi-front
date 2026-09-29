import React, { useState } from 'react'
import { useLayersSelector } from '@/features/layer-management'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Layers, ChevronDown, ChevronUp } from 'lucide-react'

export const MapLegend: React.FC = () => {
  const { layerIds, layers } = useLayersSelector((state) => ({
    layerIds: state.layerIds,
    layers: state.layers,
  }))

  const [isExpanded, setIsExpanded] = useState(true)

  const activeLayers = layerIds
    .map((id) => layers[id])
    .filter((l) => l && l.isEnabled && l.status.type === 'success')

  if (activeLayers.length === 0) {
    return (
      <Badge
        variant="secondary"
        className="bg-background/85 backdrop-blur-md border border-border/80 text-muted-foreground text-xs gap-1.5 shadow-md px-2.5 py-1 pointer-events-auto"
      >
        <Layers className="size-3" />
        <span>Легенда: слои не выбраны</span>
      </Badge>
    )
  }

  if (!isExpanded) {
    return (
      <Button
        variant="secondary"
        size="xs"
        onClick={() => setIsExpanded(true)}
        className="bg-background/90 backdrop-blur-md border border-border/80 text-foreground text-xs shadow-md gap-1.5 px-2.5 py-1 pointer-events-auto"
      >
        <Layers className="size-3 text-primary" />
        <span>Легенда ({activeLayers.length})</span>
        <ChevronUp className="size-3 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <Card className="p-2.5 bg-background/90 backdrop-blur-md border-border/80 shadow-lg text-xs space-y-2 max-w-xs pointer-events-auto">
      <div className="flex items-center justify-between border-b pb-1 border-border/60 gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Layers className="size-3.5 text-primary" />
          <span>Легенда ({activeLayers.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[9px] h-4 px-1 font-mono">
            WMS
          </Badge>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsExpanded(false)}
            className="size-5 hover:bg-muted text-muted-foreground"
            title="Свернуть легенду"
            aria-label="Свернуть легенду"
          >
            <ChevronDown className="size-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
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
                className="h-1.5 rounded-full border border-black/10 shadow-2xs"
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
