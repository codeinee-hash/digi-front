import React from 'react'
import { SlidersHorizontal } from 'lucide-react'

export function LayerListLayout({
  header,
  controls,
  filters,
  children,
  footer,
}: {
  header: React.ReactNode
  controls?: React.ReactNode
  filters?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="p-4 border-b border-border space-y-3.5 shrink-0 bg-card/40">
        {header}
        {controls}
        {filters}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">{children}</div>
      {footer && (
        <div className="p-2.5 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}

export function LayerListLayoutHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {badge}
    </div>
  )
}

export function LayerListLayoutControls({
  modeSwitch,
  errorToggle,
  actions,
}: {
  modeSwitch: React.ReactNode
  errorToggle?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="p-2.5 rounded-lg bg-muted/60 border border-border/80 flex items-center justify-between text-xs">
        {modeSwitch}
      </div>
      {(errorToggle || actions) && (
        <div className="flex items-center justify-between text-xs pt-0.5">
          {errorToggle}
          {actions}
        </div>
      )}
    </div>
  )
}

export function LayerListLayoutFilters({
  search,
  categories,
}: {
  search: React.ReactNode
  categories: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      {search}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
        {categories}
      </div>
    </div>
  )
}

export function LayerListLayoutContent({
  isEmpty,
  emptyState,
  renderList,
}: {
  isEmpty: boolean
  emptyState?: React.ReactNode
  renderList: () => React.ReactNode
}) {
  if (isEmpty) {
    return (
      emptyState ?? (
        <div className="py-12 text-center text-muted-foreground space-y-2">
          <SlidersHorizontal className="size-8 mx-auto opacity-40" />
          <p className="text-sm font-medium">Слои не найдены</p>
          <p className="text-xs">Попробуйте изменить поисковый запрос или фильтр</p>
        </div>
      )
    )
  }
  return <>{renderList()}</>
}
