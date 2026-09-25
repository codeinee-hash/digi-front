import React from 'react';
import type { LayerStatus } from '@/shared/model/layer-types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Loader2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

interface LayerStatusBadgeProps {
  status: LayerStatus;
  isEnabled: boolean;
  onRetry?: () => void;
}

export const LayerStatusBadge: React.FC<LayerStatusBadgeProps> = ({
  status,
  isEnabled,
  onRetry,
}) => {
  if (!isEnabled) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
        Выключен
      </Badge>
    );
  }

  switch (status.type) {
    case 'loading':
      return (
        <Badge variant="secondary" className="gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900">
          <Loader2 className="size-3 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Загрузка данных...</span>
        </Badge>
      );

    case 'success':
      return (
        <Tooltip>
          <TooltipTrigger render={
            <span className="inline-flex">
              <Badge variant="outline" className="gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 cursor-help">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Готов</span>
              </Badge>
            </span>
          } />
          <TooltipContent className="text-xs">
            <p className="font-semibold">Геоданные успешно загружены</p>
            <p className="text-muted-foreground">Точек растра: {status.dataPointsCount.toLocaleString()}</p>
            <p className="text-muted-foreground text-[10px]">
              Обновлено: {new Date(status.loadedAt).toLocaleTimeString()}
            </p>
          </TooltipContent>
        </Tooltip>
      );

    case 'error':
      return (
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger render={
              <span className="inline-flex">
                <Badge variant="destructive" className="gap-1 text-xs cursor-help">
                  <AlertTriangle className="size-3" />
                  <span>Ошибка</span>
                </Badge>
              </span>
            } />
            <TooltipContent className="text-xs max-w-64">
              <p className="font-semibold text-destructive">Сбой получения геоданных</p>
              <p className="text-muted-foreground break-words">{status.message}</p>
            </TooltipContent>
          </Tooltip>

          {status.canRetry && onRetry && (
            <Button
              variant="outline"
              size="xs"
              onClick={onRetry}
              className="h-6 gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-300 dark:border-amber-800"
            >
              <RotateCcw className="size-3" />
              <span>Повторить</span>
            </Button>
          )}
        </div>
      );

    case 'idle':
    default:
      return (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Ожидание
        </Badge>
      );
  }
};
