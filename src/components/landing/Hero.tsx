import { UniversalHero } from './UniversalHero';
import { homeHeroConfig } from './heroConfigs';
import { TrustPositioningBar } from '@/components/marketing/TrustPositioningBar';

// TODO(hero-consolidation): Migrate duplicated inline heroes in
// /app/(marketing)/help/page.tsx, /app/(marketing)/contact/page.tsx,
// and /app/section-21-ban/page.tsx to UniversalHero + heroConfigs.
export function Hero() {
  return <UniversalHero {...homeHeroConfig}><TrustPositioningBar variant="compact" className="max-w-5xl" /></UniversalHero>;
}
