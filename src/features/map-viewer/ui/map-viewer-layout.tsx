import React from 'react'

export function MapViewerLayout({
  children,
  hud,
  cursor,
  controls,
  legend,
  containerRef,
  onMouseMove,
  onMouseLeave,
}: {
  children: React.ReactNode
  hud?: React.ReactNode
  cursor?: React.ReactNode
  controls?: React.ReactNode
  legend?: React.ReactNode
  containerRef?: React.RefObject<HTMLDivElement | null>
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: () => void
}) {
  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 select-none"
    >
      {children}

      {hud && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          {hud}
        </div>
      )}

      {cursor && <div className="absolute bottom-4 left-4 z-10 pointer-events-none">{cursor}</div>}

      {controls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">{controls}</div>
      )}

      {legend && <div className="absolute bottom-4 right-4 z-10">{legend}</div>}
    </div>
  )
}
