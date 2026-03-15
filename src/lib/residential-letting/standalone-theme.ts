import type { CSSProperties } from 'react';

import type { ResidentialStandaloneVisualTheme } from '@/lib/residential-letting/standalone-profiles';

export function getResidentialStandaloneThemeVars(
  theme: ResidentialStandaloneVisualTheme
): CSSProperties {
  return {
    ['--standalone-page' as string]: theme.page,
    ['--standalone-page-glow' as string]: theme.pageGlow,
    ['--standalone-surface' as string]: theme.surface,
    ['--standalone-soft' as string]: theme.soft,
    ['--standalone-border' as string]: theme.border,
    ['--standalone-accent' as string]: theme.accent,
    ['--standalone-accent-strong' as string]: theme.accentStrong,
    ['--standalone-hero-start' as string]: theme.heroStart,
    ['--standalone-hero-mid' as string]: theme.heroMid,
    ['--standalone-hero-end' as string]: theme.heroEnd,
  } as CSSProperties;
}
