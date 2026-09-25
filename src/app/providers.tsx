import React from 'react';
import { LayersStoreProvider } from '@/features/layer-management';
import { TooltipProvider } from '@/shared/ui/tooltip';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <LayersStoreProvider>
      <TooltipProvider delay={200}>
        {children}
      </TooltipProvider>
    </LayersStoreProvider>
  );
};
