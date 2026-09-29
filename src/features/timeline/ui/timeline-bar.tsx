import React, { useEffect } from 'react'
import { useLayersSelector, useLayerActions } from '@/features/layer-management'
import { TimelineLayout } from './timeline-layout'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Slider } from '@/shared/ui/slider'
import { Play, Pause, SkipBack, SkipForward, Clock, Loader2, BarChart3 } from 'lucide-react'

export const TimelineBar: React.FC = () => {
  const { selectedTimestamp, timestamps, isPlaying, playbackSpeed, layers, isAnalyticsOpen } =
    useLayersSelector((state) => ({
      selectedTimestamp: state.selectedTimestamp,
      timestamps: state.timestamps,
      isPlaying: state.isPlaying,
      playbackSpeed: state.playbackSpeed,
      layers: state.layers,
      isAnalyticsOpen: state.isAnalyticsOpen,
    }))

  const { setSelectedTimestamp, setPlayback, stepTimeline, toggleAnalyticsDrawer } =
    useLayerActions()

  const currentIndex = Math.max(0, timestamps.indexOf(selectedTimestamp))
  const isAnyLayerLoading = Object.values(layers).some(
    (l) => l.isEnabled && l.status.type === 'loading'
  )

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      stepTimeline(1)
    }, playbackSpeed)

    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed, stepTimeline])

  const handleSliderChange = (val: number | readonly number[]) => {
    const nextIndex = Array.isArray(val) ? val[0] : val
    const targetTimestamp = timestamps[nextIndex]
    if (targetTimestamp && targetTimestamp !== selectedTimestamp) {
      setSelectedTimestamp(targetTimestamp)
    }
  }

  return (
    <TimelineLayout
      controls={
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => stepTimeline(-1)}
            aria-label="Предыдущий временной интервал"
          >
            <SkipBack className="size-3" />
          </Button>

          <Button
            variant={isPlaying ? 'default' : 'secondary'}
            size="xs"
            className="gap-1.5 px-2.5 font-medium"
            onClick={() => setPlayback(!isPlaying)}
            aria-label={isPlaying ? 'Приостановить воспроизведение' : 'Воспроизвести таймлайн'}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3 fill-current" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <Play className="size-3 fill-current" />
                <span>Старт</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => stepTimeline(1)}
            aria-label="Следующий временной интервал"
          >
            <SkipForward className="size-3" />
          </Button>
        </div>
      }
      status={
        <div className="flex items-center gap-2">
          {isAnyLayerLoading ? (
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-500 text-[11px] py-0.5"
            >
              <Loader2 className="size-3 animate-spin" />
              <span>Синхронизация...</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 font-mono text-[11px] py-0.5">
              <Clock className="size-3 text-primary" />
              <span>{selectedTimestamp}</span>
            </Badge>
          )}

          <Button
            variant={isAnalyticsOpen ? 'default' : 'outline'}
            size="xs"
            className="gap-1.5 text-xs"
            onClick={() => toggleAnalyticsDrawer()}
          >
            <BarChart3 className="size-3.5" />
            <span className="hidden sm:inline">Аналитика</span>
          </Button>
        </div>
      }
      scrubber={
        <div className="space-y-2">
          <Slider
            value={[currentIndex]}
            min={0}
            max={timestamps.length - 1}
            step={1}
            onValueChange={handleSliderChange}
            aria-label="Временная шкала"
          />

          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground select-none px-0.5">
            {timestamps.map((ts) => {
              const isSelected = ts === selectedTimestamp
              return (
                <button
                  key={ts}
                  type="button"
                  onClick={() => setSelectedTimestamp(ts)}
                  className={`transition-colors cursor-pointer px-1 py-0.5 rounded text-[10px] ${
                    isSelected
                      ? 'text-primary font-bold bg-primary/10'
                      : 'hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {ts}
                </button>
              )
            })}
          </div>
        </div>
      }
    />
  )
}
