/**
 * useLocale hook to get the locale context from the LocaleProvider
 */
import { useContext } from 'react';
import { LocaleContext } from '@/context/locale-provider';

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error(
      'useLocale must be used within a LocaleProvider'
    );
  }

  return context;
};
