'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useAppState();

  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (state.darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  return <>{children}</>;
}