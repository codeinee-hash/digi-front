import { useRef, useEffect, useState, useCallback } from 'react'
import { useLayersSelector, useLayerActions } from '@/features/layer-management'
import { TIMELINE_SERIES, BISHKEK_TELEPORT_STATION } from '@/shared/model/timeline-types'

interface WindParticle {
  x: number
  y: number
  speed: number
  length: number
  age: number
  maxAge: number
}

interface CursorCoords {
  lat: number
  lon: number
  screenX: number
  screenY: number
}

export function useMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stationPosRef = useRef({ x: 0, y: 0, radius: 30 })

  const { layerIds, layers, selectedTimestamp } = useLayersSelector((state) => ({
    layerIds: state.layerIds,
    layers: state.layers,
    selectedTimestamp: state.selectedTimestamp,
  }))

  const { selectStation, toggleAnalyticsDrawer } = useLayerActions()

  const [zoom, setZoom] = useState(11.2)
  const [showGrid, setShowGrid] = useState(true)
  const [cursorCoords, setCursorCoords] = useState<CursorCoords | null>(null)
  const [isStationHovered, setIsStationHovered] = useState(false)

  const baseLat = 42.8746
  const baseLon = 74.5698

  const windParticlesRef = useRef<WindParticle[]>([])

  useEffect(() => {
    const particles: WindParticle[] = []
    for (let i = 0; i < 110; i++) {
      particles.push({
        x: Math.random() * 900,
        y: Math.random() * 700,
        speed: Math.random() * 2 + 1.2,
        length: Math.random() * 20 + 12,
        age: Math.random() * 60,
        maxAge: Math.random() * 80 + 40,
      })
    }
    windParticlesRef.current = particles
  }, [])

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

      const currentMetrics =
        TIMELINE_SERIES.find((t) => t.time === selectedTimestamp) || TIMELINE_SERIES[3]

      ctx.fillStyle = '#0b1120'
      ctx.fillRect(0, 0, width, height)

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

      ctx.save()
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.22)'
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

      layerIds.forEach((id) => {
        const layer = layers[id]
        if (!layer || !layer.isEnabled || layer.status.type !== 'success') return

        const alpha = Math.max(0, Math.min(1, layer.opacity / 100))
        ctx.save()
        ctx.globalAlpha = alpha

        if (id === 'layer-temperature') {
          ctx.globalCompositeOperation = 'screen'
          const tempRatio = Math.max(0.3, Math.min(1.2, currentMetrics.temperature / 30))
          const radRadius = width * 0.38 * tempRatio

          const grad = ctx.createRadialGradient(
            width * 0.46,
            height * 0.42,
            15,
            width * 0.48,
            height * 0.44,
            radRadius
          )

          if (currentMetrics.temperature > 28) {
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.9)')
            grad.addColorStop(0.35, 'rgba(249, 115, 22, 0.75)')
            grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.4)')
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)')
          } else if (currentMetrics.temperature > 20) {
            grad.addColorStop(0, 'rgba(245, 158, 11, 0.8)')
            grad.addColorStop(0.4, 'rgba(59, 130, 246, 0.6)')
            grad.addColorStop(0.8, 'rgba(14, 165, 233, 0.3)')
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)')
          } else {
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.75)')
            grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.5)')
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)')
          }

          ctx.fillStyle = grad
          ctx.fillRect(0, 0, width, height)

          ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(width * 0.46, height * 0.42, radRadius * 0.65, 0, Math.PI * 2)
          ctx.stroke()
        } else if (id === 'layer-wind') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
          ctx.lineWidth = 1.8
          ctx.lineCap = 'round'

          const windVelocity = Math.max(0.6, currentMetrics.wind / 3.5)
          const angle = 0.38 + currentMetrics.wind / 40

          windParticlesRef.current.forEach((p) => {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            const dx = Math.cos(angle) * p.length * windVelocity
            const dy = Math.sin(angle) * p.length * windVelocity
            ctx.lineTo(p.x + dx, p.y + dy)
            ctx.stroke()

            p.x += Math.cos(angle) * p.speed * windVelocity
            p.y += Math.sin(angle) * p.speed * windVelocity
            p.age++

            if (p.x > width || p.y > height || p.age > p.maxAge) {
              p.x = Math.random() * (width * 0.4)
              p.y = Math.random() * height
              p.age = 0
            }
          })
        } else if (id === 'layer-insolation') {
          const solarIntensity = Math.min(1, currentMetrics.insolation / 960)

          if (solarIntensity > 0.05) {
            ctx.globalCompositeOperation = 'lighter'
            const sunX = width * 0.62
            const sunY = height * 0.32
            const sunRadius = width * 0.42 * solarIntensity

            const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius)
            sunGrad.addColorStop(0, `rgba(251, 191, 36, ${0.85 * solarIntensity})`)
            sunGrad.addColorStop(0.4, `rgba(245, 158, 11, ${0.5 * solarIntensity})`)
            sunGrad.addColorStop(1, 'rgba(180, 83, 9, 0)')
            ctx.fillStyle = sunGrad
            ctx.fillRect(0, 0, width, height)

            for (let r = 70; r < 240; r += 45) {
              ctx.strokeStyle = `rgba(253, 230, 138, ${0.25 * solarIntensity})`
              ctx.setLineDash([4, 6])
              ctx.beginPath()
              ctx.arc(sunX, sunY, r * solarIntensity, 0, Math.PI * 2)
              ctx.stroke()
              ctx.setLineDash([])
            }
          }
        } else {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
          ctx.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6)
        }

        ctx.restore()
      })

      const bishkekX = width * 0.48
      const bishkekY = height * 0.42
      stationPosRef.current = { x: bishkekX, y: bishkekY, radius: 32 }

      ctx.save()
      ctx.fillStyle = 'rgba(2, 6, 23, 0.6)'
      ctx.beginPath()
      ctx.ellipse(bishkekX, bishkekY + 12, 34, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      const pHeight = 8
      const hexRadius = 24
      const hexAngles = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180)

      ctx.fillStyle = '#1e293b'
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      for (let i = 0; i < 3; i++) {
        const a1 = hexAngles[i]
        const a2 = hexAngles[i + 1]
        const x1 = bishkekX + Math.cos(a1) * hexRadius
        const y1 = bishkekY + Math.sin(a1) * hexRadius * 0.5
        const x2 = bishkekX + Math.cos(a2) * hexRadius
        const y2 = bishkekY + Math.sin(a2) * hexRadius * 0.5

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x2, y2 + pHeight)
        ctx.lineTo(x1, y1 + pHeight)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      ctx.fillStyle = '#334155'
      ctx.beginPath()
      hexAngles.forEach((a, idx) => {
        const px = bishkekX + Math.cos(a) * hexRadius
        const py = bishkekY + Math.sin(a) * hexRadius * 0.5
        if (idx === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      const mastTopY = bishkekY - 38
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1.5

      ctx.beginPath()
      ctx.moveTo(bishkekX - 8, bishkekY)
      ctx.lineTo(bishkekX - 2, mastTopY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(bishkekX + 8, bishkekY)
      ctx.lineTo(bishkekX + 2, mastTopY)
      ctx.stroke()

      ctx.lineWidth = 1
      ctx.strokeStyle = '#64748b'
      for (let s = 1; s <= 3; s++) {
        const sy = bishkekY - s * 9
        const span = 8 - s * 1.5
        ctx.beginPath()
        ctx.moveTo(bishkekX - span, sy)
        ctx.lineTo(bishkekX + span, sy)
        ctx.moveTo(bishkekX - span, sy + 4)
        ctx.lineTo(bishkekX + span, sy - 4)
        ctx.stroke()
      }

      const dishAngle = Math.sin(tick * 0.02) * 0.4
      const dishCenterX = bishkekX
      const dishCenterY = mastTopY - 6

      ctx.save()
      ctx.translate(dishCenterX, dishCenterY)
      ctx.rotate(dishAngle)

      const dishGrad = ctx.createLinearGradient(-14, -14, 14, 14)
      dishGrad.addColorStop(0, '#f8fafc')
      dishGrad.addColorStop(0.5, '#cbd5e1')
      dishGrad.addColorStop(1, '#64748b')

      ctx.fillStyle = dishGrad
      ctx.strokeStyle = '#0284c7'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(0, 0, 16, 7, -0.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(5, -12)
      ctx.stroke()

      ctx.fillStyle = '#0284c7'
      ctx.beginPath()
      ctx.arc(5, -12, 2.5, 0, Math.PI * 2)
      ctx.fill()

      const wavePhase = (tick * 0.04) % 1
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - wavePhase})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(5, -12, 8 + wavePhase * 20, -1.2, -0.2)
      ctx.stroke()

      ctx.restore()

      const beaconBlink = Math.sin(tick * 0.1) > 0
      if (beaconBlink) {
        ctx.fillStyle = '#ef4444'
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(dishCenterX, mastTopY - 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('3D DiGi SatCom Teleport', bishkekX + 16, bishkekY - 14)

      ctx.fillStyle = '#38bdf8'
      ctx.font = '10px monospace'
      ctx.fillText(
        `${BISHKEK_TELEPORT_STATION.status.toUpperCase()} • 42.87°N, 74.57°E`,
        bishkekX + 16,
        bishkekY - 1
      )

      if (isStationHovered) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 1
        const tipX = bishkekX + 16
        const tipY = bishkekY + 14
        ctx.beginPath()
        ctx.roundRect(tipX, tipY, 190, 24, 6)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#38bdf8'
        ctx.font = '10px sans-serif'
        ctx.fillText('Кликните для телеметрии (Recharts)', tipX + 8, tipY + 16)
      }

      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [layerIds, layers, showGrid, selectedTimestamp, isStationHovered])

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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const latOffset = ((rect.height / 2 - y) / rect.height) * 0.4
      const lonOffset = ((x - rect.width / 2) / rect.width) * 0.6

      setCursorCoords({
        lat: Number((baseLat + latOffset).toFixed(4)),
        lon: Number((baseLon + lonOffset).toFixed(4)),
        screenX: x,
        screenY: y,
      })

      const dx = x - stationPosRef.current.x
      const dy = y - stationPosRef.current.y
      const dist = Math.hypot(dx, dy)
      setIsStationHovered(dist <= stationPosRef.current.radius)
    },
    [baseLat, baseLon]
  )

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - stationPosRef.current.x
      const dy = y - stationPosRef.current.y
      if (Math.hypot(dx, dy) <= stationPosRef.current.radius) {
        selectStation('digi-teleport-01')
        toggleAnalyticsDrawer(true)
      }
    },
    [selectStation, toggleAnalyticsDrawer]
  )

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.5, 18)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.5, 4)), [])
  const resetZoom = useCallback(() => setZoom(11.2), [])
  const toggleGrid = useCallback(() => setShowGrid((g) => !g), [])
  const handleMouseLeave = useCallback(() => {
    setCursorCoords(null)
    setIsStationHovered(false)
  }, [])

  return {
    canvasRef,
    containerRef,
    zoom,
    showGrid,
    cursorCoords,
    isStationHovered,
    handleMouseMove,
    handleMouseLeave,
    handleMapClick,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
  }
}
