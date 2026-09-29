import React from 'react'

export function MapViewerLayout({
  children,
  hud,
  cursor,
  controls,
  legend,
  timeline,
  containerRef,
  onMouseMove,
  onMouseLeave,
  onClick,
}: {
  children: React.ReactNode
  hud?: React.ReactNode
  cursor?: React.ReactNode
  controls?: React.ReactNode
  legend?: React.ReactNode
  timeline?: React.ReactNode
  containerRef?: React.RefObject<HTMLDivElement | null>
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: () => void
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 select-none"
    >
      {children}

      {hud && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none flex-wrap">
          {hud}
        </div>
      )}

      {cursor && <div className="absolute bottom-28 left-4 z-10 pointer-events-none">{cursor}</div>}

      {controls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">{controls}</div>
      )}

      {legend && <div className="absolute bottom-28 right-4 z-10">{legend}</div>}

      {timeline && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-8 md:right-8 max-w-2xl mx-auto z-20 pointer-events-auto">
          {timeline}
        </div>
      )}
    </div>
  )
}
