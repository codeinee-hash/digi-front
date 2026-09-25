import React from 'react'
import { useMapViewer } from '../model/use-map-viewer'
import { MapLegend } from './map-legend'
import { MapViewerLayout } from './map-viewer-layout'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, Compass, Grid, Crosshair, MapPin } from 'lucide-react'

export const MapCanvas: React.FC = () => {
  const {
    canvasRef,
    containerRef,
    zoom,
    showGrid,
    cursorCoords,
    handleMouseMove,
    handleMouseLeave,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
  } = useMapViewer()

  return (
    <MapViewerLayout
      containerRef={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      hud={
        <>
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-md border border-border/80 text-foreground text-xs gap-1.5 shadow-md px-2.5 py-1"
          >
            <Compass className="size-3.5 text-primary animate-pulse" />
            <span className="font-mono">WGS 84 / EPSG:3857</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-mono text-[11px]">Z: {zoom.toFixed(1)}</span>
          </Badge>

          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-md border border-border/80 text-foreground text-xs gap-1 shadow-md px-2.5 py-1"
          >
            <MapPin className="size-3 text-sky-500" />
            <span>Чуйский регион, КР</span>
          </Badge>
        </>
      }
      cursor={
        cursorCoords && (
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-md border border-border/80 text-foreground text-xs gap-2 font-mono shadow-md px-3 py-1"
          >
            <Crosshair className="size-3 text-primary" />
            <span>Lat: {cursorCoords.lat}° N</span>
            <span>Lon: {cursorCoords.lon}° E</span>
          </Badge>
        )
      }
      controls={
        <div className="bg-background/90 backdrop-blur-md border border-border/80 rounded-lg p-1 shadow-lg flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            className="size-7 hover:bg-muted text-foreground"
            title="Приблизить"
            aria-label="Приблизить карту"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            className="size-7 hover:bg-muted text-foreground"
            title="Отдалить"
            aria-label="Отдалить карту"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            className="size-7 hover:bg-muted text-foreground"
            title="Сбросить масштаб"
            aria-label="Сбросить масштаб"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant={showGrid ? 'secondary' : 'ghost'}
            size="icon"
            onClick={toggleGrid}
            className="size-7 text-foreground"
            title="Вкл/выкл сетку координат"
            aria-label="Сетка координат"
          >
            <Grid className="size-3.5" />
          </Button>
        </div>
      }
      legend={<MapLegend />}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
    </MapViewerLayout>
  )
}
