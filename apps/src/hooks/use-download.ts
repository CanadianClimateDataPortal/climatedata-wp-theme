/**
 * useDownload hook to get the map context from the DownloadProvider
 */
import { useContext } from 'react';
import { DownloadContext } from '@/context/download-provider';

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error(
      'useDownload must be used within a DownloadProvider'
    );
  }

  return context;
};
