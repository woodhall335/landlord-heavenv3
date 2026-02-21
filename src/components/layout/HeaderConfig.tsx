'use client';

import { useEffect } from 'react';
import { headerModeDefaults, type HeaderMode, useHeaderMode } from './HeaderModeContext';

interface HeaderConfigProps {
  mode: HeaderMode;
  threshold?: number;
}

export function HeaderConfig({ mode, threshold }: HeaderConfigProps) {
  const { setHeaderMode, setHeaderTransparentThreshold } = useHeaderMode();

  useEffect(() => {
    setHeaderMode(mode);
    setHeaderTransparentThreshold(threshold ?? headerModeDefaults.threshold);

    return () => {
      setHeaderMode(headerModeDefaults.mode);
      setHeaderTransparentThreshold(headerModeDefaults.threshold);
    };
  }, [mode, setHeaderMode, setHeaderTransparentThreshold, threshold]);

  return null;
}
