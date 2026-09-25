import React from 'react'
import { LayerList } from '@/features/layer-management'
import { MapCanvas } from '@/features/map-viewer'
import { Badge } from '@/shared/ui/badge'
import { Globe2, ShieldCheck, Cpu } from 'lucide-react'

export const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased">
      <header className="h-13 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
            <Globe2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-foreground">DiGi GeoPlatform</h1>
              <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Интерфейс управления картографическими слоями
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground hidden md:block">
              React 19 + TypeScript + Vedro State Manager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[11px] gap-1 px-2 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hidden sm:flex"
          >
            <ShieldCheck className="size-3 text-emerald-500" />
            <span>Race Condition Safe (AbortController)</span>
          </Badge>

          <Badge
            variant="secondary"
            className="text-[11px] gap-1 px-2 py-0.5 font-mono text-muted-foreground hidden lg:flex"
          >
            <Cpu className="size-3" />
            <span>Vedro: No Unnecessary Renders</span>
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <aside className="w-full md:w-[420px] lg:w-[450px] shrink-0 h-1/2 md:h-full flex flex-col overflow-hidden">
          <LayerList />
        </aside>

        <section className="flex-1 h-1/2 md:h-full relative overflow-hidden bg-slate-950">
          <MapCanvas />
        </section>
      </main>
    </div>
  )
}
