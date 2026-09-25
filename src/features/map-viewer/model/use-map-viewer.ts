import { useRef, useEffect, useState, useCallback } from 'react'
import { useLayersSelector } from '@/features/layer-management'

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

  const { layerIds, layers } = useLayersSelector((state) => ({
    layerIds: state.layerIds,
    layers: state.layers,
  }))

  const [zoom, setZoom] = useState(11.2)
  const [showGrid, setShowGrid] = useState(true)
  const [cursorCoords, setCursorCoords] = useState<CursorCoords | null>(null)

  const baseLat = 42.8746
  const baseLon = 74.5698

  const windParticlesRef = useRef<WindParticle[]>([])

  useEffect(() => {
    const particles: WindParticle[] = []
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

      ctx.fillStyle = '#0f172a'
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

      layerIds.forEach((id) => {
        const layer = layers[id]
        if (!layer || !layer.isEnabled || layer.status.type !== 'success') return

        const alpha = Math.max(0, Math.min(1, layer.opacity / 100))
        ctx.save()
        ctx.globalAlpha = alpha

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
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)')
          grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.7)')
          grad.addColorStop(0.65, 'rgba(59, 130, 246, 0.5)')
          grad.addColorStop(1, 'rgba(30, 58, 138, 0)')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, width, height)

          ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(width * 0.45, height * 0.4, width * 0.25, 0, Math.PI * 2)
          ctx.stroke()
        } else if (id === 'layer-wind') {
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

            p.x += Math.cos(0.4) * p.speed
            p.y += Math.sin(0.4) * p.speed
            p.age++

            if (p.x > width || p.y > height || p.age > p.maxAge) {
              p.x = Math.random() * (width * 0.5)
              p.y = Math.random() * height
              p.age = 0
            }
          })
        } else if (id === 'layer-insolation') {
          ctx.globalCompositeOperation = 'lighter'
          const sunX = width * 0.65
          const sunY = height * 0.35
          const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, width * 0.4)
          sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
          sunGrad.addColorStop(0.4, 'rgba(217, 119, 6, 0.45)')
          sunGrad.addColorStop(1, 'rgba(180, 83, 9, 0)')
          ctx.fillStyle = sunGrad
          ctx.fillRect(0, 0, width, height)

          for (let r = 80; r < 240; r += 50) {
            ctx.strokeStyle = 'rgba(253, 230, 138, 0.25)'
            ctx.setLineDash([4, 6])
            ctx.beginPath()
            ctx.arc(sunX, sunY, r, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])
          }
        } else {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
          ctx.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6)
        }

        ctx.restore()
      })

      ctx.save()
      const bishkekX = width * 0.48
      const bishkekY = height * 0.42

      const pulseSize = 12 + Math.sin(tick * 0.05) * 4
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)'
      ctx.beginPath()
      ctx.arc(bishkekX, bishkekY, pulseSize, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0284c7'
      ctx.beginPath()
      ctx.arc(bishkekX, bishkekY, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.stroke()

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
    },
    [baseLat, baseLon]
  )

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.5, 18)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.5, 4)), [])
  const resetZoom = useCallback(() => setZoom(11.2), [])
  const toggleGrid = useCallback(() => setShowGrid((g) => !g), [])
  const handleMouseLeave = useCallback(() => setCursorCoords(null), [])

  return {
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
  }
}
