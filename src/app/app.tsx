import React from 'react'
import { LayerList, useLayersSelector, useLayerActions } from '@/features/layer-management'
import { MapCanvas } from '@/features/map-viewer'
import { TimelineBar } from '@/features/timeline'
import { AnalyticsDrawer } from '@/features/analytics'
import { AppLayout } from './app-layout'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Globe2, ShieldCheck, Cpu, BarChart3, Clock } from 'lucide-react'

export const App: React.FC = () => {
  const { selectedTimestamp, isAnalyticsOpen } = useLayersSelector((state) => ({
    selectedTimestamp: state.selectedTimestamp,
    isAnalyticsOpen: state.isAnalyticsOpen,
  }))

  const { toggleAnalyticsDrawer } = useLayerActions()

  return (
    <AppLayout
      header={
        <header className="h-13 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
              <Globe2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-foreground">
                  DiGi GeoPlatform
                </h1>
                <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Интерфейс управления картографическими слоями
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden md:block">
                React 19 + TypeScript + Vedro State Manager + Recharts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[11px] gap-1 px-2 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hidden md:flex"
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

            <Button
              variant={isAnalyticsOpen ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs font-medium"
              onClick={() => toggleAnalyticsDrawer()}
            >
              <BarChart3 className="size-3.5" />
              <span>Графики Recharts</span>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] px-1 py-0 ml-0.5 hidden sm:inline-flex"
              >
                <Clock className="size-2.5 mr-0.5 inline" />
                {selectedTimestamp}
              </Badge>
            </Button>
          </div>
        </header>
      }
      sidebar={<LayerList />}
      drawer={<AnalyticsDrawer />}
    >
      <MapCanvas timeline={<TimelineBar />} />
    </AppLayout>
  )
}
