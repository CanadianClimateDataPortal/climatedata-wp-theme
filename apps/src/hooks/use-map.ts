/**
 * useMap hook to get the map context from the MapProvider
 */
import { useContext } from 'react';
import { MapContext } from '@/context/map-provider';

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }

  return context;
};
