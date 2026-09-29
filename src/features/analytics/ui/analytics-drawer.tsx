import React, { useState } from 'react'
import { useLayersSelector, useLayerActions } from '@/features/layer-management'
import {
  TIMELINE_SERIES,
  BISHKEK_TELEPORT_STATION,
  type TimePoint,
} from '@/shared/model/timeline-types'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/drawer'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import {
  Thermometer,
  Wind,
  Sun,
  Activity,
  Radio,
  Clock,
  Sparkles,
  MousePointerClick,
} from 'lucide-react'

type MetricView = 'all' | 'temperature' | 'wind' | 'insolation'

export const AnalyticsDrawer: React.FC = () => {
  const { selectedTimestamp, isAnalyticsOpen, layers } = useLayersSelector((state) => ({
    selectedTimestamp: state.selectedTimestamp,
    isAnalyticsOpen: state.isAnalyticsOpen,
    layers: state.layers,
  }))

  const { setSelectedTimestamp, toggleAnalyticsDrawer } = useLayerActions()
  const [metricView, setMetricView] = useState<MetricView>('all')

  const currentSeriesPoint =
    TIMELINE_SERIES.find((p) => p.time === selectedTimestamp) || TIMELINE_SERIES[3]

  const isTempActive = layers['layer-temperature']?.isEnabled ?? true
  const isWindActive = layers['layer-wind']?.isEnabled ?? true
  const isInsolationActive = layers['layer-insolation']?.isEnabled ?? true

  const handleChartClick = (state: { activeLabel?: string | number }) => {
    if (state && state.activeLabel) {
      const clickedTime = String(state.activeLabel) as TimePoint
      setSelectedTimestamp(clickedTime)
    }
  }

  return (
    <Drawer open={isAnalyticsOpen} onOpenChange={(open) => toggleAnalyticsDrawer(open)}>
      <DrawerContent className="overflow-y-auto max-w-xl">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Activity className="size-4" />
              </div>
              <div>
                <DrawerTitle>Аналитика временных рядов</DrawerTitle>
                <DrawerDescription>
                  Recharts • Двусторонняя синхронизация с картой
                </DrawerDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs gap-1 py-0.5">
              <Clock className="size-3 text-primary" />
              <span>{selectedTimestamp}</span>
            </Badge>
          </div>
        </DrawerHeader>

        <div className="space-y-6 pt-4 pb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
              <Button
                variant={metricView === 'all' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setMetricView('all')}
              >
                Все слои
              </Button>
              <Button
                variant={metricView === 'temperature' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setMetricView('temperature')}
              >
                Температура
              </Button>
              <Button
                variant={metricView === 'wind' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setMetricView('wind')}
              >
                Ветер
              </Button>
              <Button
                variant={metricView === 'insolation' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setMetricView('insolation')}
              >
                Инсоляция
              </Button>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MousePointerClick className="size-3 text-primary" />
              <span>Клик по графику меняет время на карте</span>
            </div>
          </div>

          <div className="h-64 w-full rounded-xl border border-border/80 bg-card/60 p-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={TIMELINE_SERIES}
                onClick={handleChartClick}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorInsolation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-foreground font-mono">Время: {label}</p>
                          {payload.map((entry, idx) => (
                            <div
                              key={String(entry.dataKey || idx)}
                              className="flex items-center justify-between gap-4"
                            >
                              <span className="font-medium" style={{ color: entry.color }}>
                                {entry.name}:
                              </span>
                              <span className="font-mono font-semibold text-foreground">
                                {entry.value}{' '}
                                {entry.dataKey === 'temperature'
                                  ? '°C'
                                  : entry.dataKey === 'wind'
                                    ? 'м/с'
                                    : 'Вт/м²'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />

                <ReferenceLine
                  x={selectedTimestamp}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `Выбрано: ${selectedTimestamp}`,
                    position: 'top',
                    fill: '#38bdf8',
                    fontSize: 10,
                  }}
                />

                {(metricView === 'all' || metricView === 'temperature') && (
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Температура"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                    strokeWidth={isTempActive ? 2 : 1}
                    opacity={isTempActive ? 1 : 0.4}
                  />
                )}

                {(metricView === 'all' || metricView === 'wind') && (
                  <Area
                    type="monotone"
                    dataKey="wind"
                    name="Скорость ветра"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorWind)"
                    strokeWidth={isWindActive ? 2 : 1}
                    opacity={isWindActive ? 1 : 0.4}
                  />
                )}

                {(metricView === 'all' || metricView === 'insolation') && (
                  <Area
                    type="monotone"
                    dataKey="insolation"
                    name="Инсоляция GHI"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorInsolation)"
                    strokeWidth={isInsolationActive ? 2 : 1}
                    opacity={isInsolationActive ? 1 : 0.4}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Card className="p-3 border-border/70 bg-card/60 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium">Температура</span>
                <Thermometer className="size-3.5 text-red-500" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                  {currentSeriesPoint.temperature}°C
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Пик: 32.5°C (14:00)</div>
              </div>
            </Card>

            <Card className="p-3 border-border/70 bg-card/60 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium">Ветер</span>
                <Wind className="size-3.5 text-sky-500" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                  {currentSeriesPoint.wind} м/с
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Порывы: до 9.1 м/с</div>
              </div>
            </Card>

            <Card className="p-3 border-border/70 bg-card/60 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium">Инсоляция</span>
                <Sun className="size-3.5 text-amber-500" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                  {currentSeriesPoint.insolation}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Вт/м² (GHI индекс)</div>
              </div>
            </Card>
          </div>

          <Card className="p-4 border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                  <Radio className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {BISHKEK_TELEPORT_STATION.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    3D Телеметрический комплекс на карте
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-mono py-0.5"
              >
                {BISHKEK_TELEPORT_STATION.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-primary/10">
              <div>
                <span className="text-[10px] text-muted-foreground block">Координаты:</span>
                <span className="font-mono text-foreground">
                  {BISHKEK_TELEPORT_STATION.lat}°N, {BISHKEK_TELEPORT_STATION.lon}°E
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Спутниковый канал:</span>
                <span className="font-mono text-foreground">
                  {BISHKEK_TELEPORT_STATION.activeSatellite}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Качество сигнала:</span>
                <span className="font-mono text-emerald-500 font-semibold">
                  {BISHKEK_TELEPORT_STATION.signalStrength}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Пропускная способность:
                </span>
                <span className="font-mono text-foreground">
                  {BISHKEK_TELEPORT_STATION.bandwidthMbps} Мбит/с
                </span>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
            <Sparkles className="size-3.5 text-amber-500 shrink-0" />
            <span>
              Данные графика и растровые слои карты динамически синхронизируются через Vedro Store
              без промежуточных ререндеров.
            </span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
