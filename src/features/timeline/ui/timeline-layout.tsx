import React from 'react'

export interface TimelineLayoutProps {
  controls: React.ReactNode
  scrubber: React.ReactNode
  status: React.ReactNode
}

export function TimelineLayout({ controls, scrubber, status }: TimelineLayoutProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card/90 backdrop-blur-md p-3 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">{controls}</div>
        <div className="flex items-center gap-2">{status}</div>
      </div>
      <div className="w-full pt-1 pb-1">{scrubber}</div>
    </div>
  )
}
