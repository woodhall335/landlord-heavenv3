import { UniversalHero } from './UniversalHero';
import { homeHeroConfig } from './heroConfigs';

// TODO(hero-consolidation): Migrate duplicated inline heroes in
// /app/(marketing)/help/page.tsx, /app/(marketing)/contact/page.tsx,
// and /app/section-21-ban/page.tsx to UniversalHero + heroConfigs.
export function Hero() {
  return <UniversalHero {...homeHeroConfig} />;
}
