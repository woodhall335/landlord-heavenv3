import { UniversalHero } from './UniversalHero';
import { homeHeroConfig } from './heroConfigs';
import { TrackedLink } from '@/components/analytics/TrackedLink';

// TODO(hero-consolidation): Migrate duplicated inline heroes in
// /app/(marketing)/help/page.tsx, /app/(marketing)/contact/page.tsx,
// and /app/section-21-ban/page.tsx to UniversalHero + heroConfigs.
export function Hero() {
  const primaryCta = homeHeroConfig.primaryCta;
  const heroProps = {
    ...homeHeroConfig,
    primaryCta: undefined,
    secondaryCta: undefined,
  };

  return (
    <UniversalHero
      {...heroProps}
      actionsSlot={
        primaryCta ? (
          <div className="w-full sm:w-auto">
            <TrackedLink
              href={primaryCta.href}
              pagePath="/"
              pageType="homepage"
              ctaLabel={primaryCta.label}
              ctaPosition="hero"
              eventName="homepage_primary_cta_click"
              className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
            >
              {primaryCta.label}
            </TrackedLink>
          </div>
        ) : undefined
      }
    />
  );
}
