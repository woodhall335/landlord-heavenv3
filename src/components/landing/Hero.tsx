'use client';

import { UniversalHero } from './UniversalHero';
import { homeHeroConfig } from './heroConfigs';

export function Hero() {
  return <UniversalHero {...homeHeroConfig} />;
}
