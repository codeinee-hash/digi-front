import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useLayersSelector } from '@/features/layer-management'
import { MapLegend } from './map-legend'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, Compass, Grid, Crosshair, MapPin } from 'lucide-react'

export const MapCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { layerIds, layers } = useLayersSelector((state) => ({
    layerIds: state.layerIds,
    layers: state.layers,
  }))

  const [zoom, setZoom] = useState(11.2)
  const [showGrid, setShowGrid] = useState(true)
  const [cursorCoords, setCursorCoords] = useState<{
    lat: number
    lon: number
    screenX: number
    screenY: number
  } | null>(null)

  // Центр карты: Бишкек / Чуйская долина (как раз офис и регион DiGi)
  const baseLat = 42.8746
  const baseLon = 74.5698

  // Анимация частиц ветра
  const windParticlesRef = useRef<
    Array<{ x: number; y: number; speed: number; length: number; age: number; maxAge: number }>
  >([])

  // Инициализация частиц ветра
  useEffect(() => {
    const particles = []
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: Math.random() * 2 + 1.2,
        length: Math.random() * 18 + 12,
        age: Math.random() * 60,
        maxAge: Math.random() * 80 + 40,
      })
    }
    windParticlesRef.current = particles
  }, [])

  // Отрисовка геопространственного холста и слоев
  useEffect(() => {
    let animationFrameId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let tick = 0

    const render = () => {
      tick++
      const width = canvas.width
      const height = canvas.height

      // 1. Очистка и отрисовка GIS-базовой карты (Dark Topo Basemap)
      ctx.fillStyle = '#0f172a' // глубокий темно-синий slate
      ctx.fillRect(0, 0, width, height)

      // Сетка координат (WGS 84 / Web Mercator)
      if (showGrid) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
        ctx.lineWidth = 1
        const step = 60
        for (let x = 0; x < width; x += step) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y < height; y += step) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
      }

      // Топографические контуры (рельеф гор Ала-Тоо на юге Бишкека)
      ctx.save()
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        const yOffset = height * 0.55 + i * 25
        ctx.moveTo(0, yOffset)
        for (let x = 0; x <= width; x += 40) {
          const elevationNoise = Math.sin(x * 0.008 + i) * 30 + Math.cos(x * 0.015) * 15
          ctx.lineTo(x, yOffset + elevationNoise)
        }
        ctx.stroke()
      }
      ctx.restore()

      // 2. Отрисовка активных слоев с учетом прозрачности (opacity)
      layerIds.forEach((id) => {
        const layer = layers[id]
        if (!layer || !layer.isEnabled || layer.status.type !== 'success') return

        const alpha = Math.max(0, Math.min(1, layer.opacity / 100))
        ctx.save()
        ctx.globalAlpha = alpha

        // Слой Температуры (Тепловая матрица / Thermal Heatmap)
        if (id === 'layer-temperature') {
          ctx.globalCompositeOperation = 'screen'
          const grad = ctx.createRadialGradient(
            width * 0.45,
            height * 0.4,
            30,
            width * 0.5,
            height * 0.45,
            width * 0.45
          )
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)') // горячий центр
          grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.7)')
          grad.addColorStop(0.65, 'rgba(59, 130, 246, 0.5)')
          grad.addColorStop(1, 'rgba(30, 58, 138, 0)')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, width, height)

          // Изотермы
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(width * 0.45, height * 0.4, width * 0.25, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Слой Ветра (Векторные потоки частиц / Streamlines)
        else if (id === 'layer-wind') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
          ctx.lineWidth = 1.8
          ctx.lineCap = 'round'

          windParticlesRef.current.forEach((p) => {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            const dx = Math.cos(0.4) * p.length
            const dy = Math.sin(0.4) * p.length
            ctx.lineTo(p.x + dx, p.y + dy)
            ctx.stroke()

            // Движение частиц
            p.x += Math.cos(0.4) * p.speed
            p.y += Math.sin(0.4) * p.speed
            p.age++

            if (p.x > width || p.y > height || p.age > p.maxAge) {
              p.x = Math.random() * (width * 0.5)
              p.y = Math.random() * height
              p.age = 0
            }
          })
        }

        // Слой Инсоляции (Солнечная радиация GHI / Интенсивность)
        else if (id === 'layer-insolation') {
          ctx.globalCompositeOperation = 'lighter'
          const sunX = width * 0.65
          const sunY = height * 0.35
          const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, width * 0.4)
          sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
          sunGrad.addColorStop(0.4, 'rgba(217, 119, 6, 0.45)')
          sunGrad.addColorStop(1, 'rgba(180, 83, 9, 0)')
          ctx.fillStyle = sunGrad
          ctx.fillRect(0, 0, width, height)

          // Концентрические круги радиационного потока
          for (let r = 80; r < 240; r += 50) {
            ctx.strokeStyle = 'rgba(253, 230, 138, 0.25)'
            ctx.setLineDash([4, 6])
            ctx.beginPath()
            ctx.arc(sunX, sunY, r, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }

        // Прочие 100+ слои (Спутниковые растры / NDVI / Зоны)
        else {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
          ctx.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6)
        }

        ctx.restore()
      })

      // 3. Маркер центра (Бишкек)
      ctx.save()
      const bishkekX = width * 0.48
      const bishkekY = height * 0.42

      // Пульсирующий ореол
      const pulseSize = 12 + Math.sin(tick * 0.05) * 4
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)'
      ctx.beginPath()
      ctx.arc(bishkekX, bishkekY, pulseSize, 0, Math.PI * 2)
      ctx.fill()

      // Точка центра
      ctx.fillStyle = '#0284c7'
      ctx.beginPath()
      ctx.arc(bishkekX, bishkekY, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Подпись города
      ctx.fillStyle = '#f8fafc'
      ctx.font = '11px sans-serif'
      ctx.fillText('Бишкек (Bishkek HQ)', bishkekX + 8, bishkekY - 6)
      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [layerIds, layers, showGrid])

  // Подгонка размера Canvas под контейнер
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        canvasRef.current.width = clientWidth
        canvasRef.current.height = clientHeight
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Инспектор координат при движении мыши
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Конвертируем координаты пикселей в географические градусы
      const latOffset = ((rect.height / 2 - y) / rect.height) * 0.4
      const lonOffset = ((x - rect.width / 2) / rect.width) * 0.6

      setCursorCoords({
        lat: Number((baseLat + latOffset).toFixed(4)),
        lon: Number((baseLon + lonOffset).toFixed(4)),
        screenX: x,
        screenY: y,
      })
    },
    [baseLat, baseLon]
  )

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursorCoords(null)}
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />

      {/* Верхний инфобар HUD геодезии */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
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
      </div>

      {/* Инспектор курсора в реальном времени */}
      {cursorCoords && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-md border border-border/80 text-foreground text-xs gap-2 font-mono shadow-md px-3 py-1"
          >
            <Crosshair className="size-3 text-primary" />
            <span>Lat: {cursorCoords.lat}° N</span>
            <span>Lon: {cursorCoords.lon}° E</span>
          </Badge>
        </div>
      )}

      {/* Кнопки управления масштабом и сеткой карты */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <div className="bg-background/90 backdrop-blur-md border border-border/80 rounded-lg p-1 shadow-lg flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.min(z + 0.5, 18))}
            className="size-7 hover:bg-muted text-foreground"
            title="Приблизить"
            aria-label="Приблизить карту"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.max(z - 0.5, 4))}
            className="size-7 hover:bg-muted text-foreground"
            title="Отдалить"
            aria-label="Отдалить карту"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(11.2)}
            className="size-7 hover:bg-muted text-foreground"
            title="Сбросить масштаб"
            aria-label="Сбросить масштаб"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant={showGrid ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setShowGrid((g) => !g)}
            className="size-7 text-foreground"
            title="Вкл/выкл сетку координат"
            aria-label="Сетка координат"
          >
            <Grid className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Легенда активных слоев в правом нижнем углу */}
      <div className="absolute bottom-4 right-4 z-10">
        <MapLegend />
      </div>
    </div>
  )
}
