'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type HeaderMode = 'solid' | 'transparent' | 'autoOnScroll';

interface HeaderModeContextValue {
  headerMode: HeaderMode;
  setHeaderMode: (mode: HeaderMode) => void;
  scrollThreshold: number;
  setHeaderTransparentThreshold: (threshold: number) => void;
}

const DEFAULT_HEADER_MODE: HeaderMode = 'solid';
const DEFAULT_SCROLL_THRESHOLD = 32;

const HeaderModeContext = createContext<HeaderModeContextValue | null>(null);

export function HeaderModeProvider({ children }: { children: ReactNode }) {
  const [headerMode, setHeaderMode] = useState<HeaderMode>(DEFAULT_HEADER_MODE);
  const [scrollThreshold, setHeaderTransparentThreshold] = useState<number>(DEFAULT_SCROLL_THRESHOLD);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('page-header-solid', 'page-header-overlay');
    body.classList.add(headerMode === 'solid' ? 'page-header-solid' : 'page-header-overlay');

    return () => {
      body.classList.remove('page-header-solid', 'page-header-overlay');
      body.classList.add('page-header-solid');
    };
  }, [headerMode]);

  const value = useMemo(
    () => ({
      headerMode,
      setHeaderMode,
      scrollThreshold,
      setHeaderTransparentThreshold,
    }),
    [headerMode, scrollThreshold],
  );

  return <HeaderModeContext.Provider value={value}>{children}</HeaderModeContext.Provider>;
}

export function useHeaderMode() {
  const context = useContext(HeaderModeContext);

  if (!context) {
    throw new Error('useHeaderMode must be used inside HeaderModeProvider');
  }

  return context;
}

export const headerModeDefaults = {
  mode: DEFAULT_HEADER_MODE,
  threshold: DEFAULT_SCROLL_THRESHOLD,
};
