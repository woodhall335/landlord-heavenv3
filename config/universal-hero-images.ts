export const UNIVERSAL_HERO_IMAGES = {
  homepage: '/images/section8-paid-hero-watercolor-v2.webp',
  section8Notice: '/images/heroes/universal/hero-product-section8-notice.webp',
  completeEviction: '/images/heroes/universal/hero-product-complete-eviction.webp',
  moneyClaim: '/images/heroes/universal/hero-product-money-claim.webp',
  rentIncrease: '/images/heroes/universal/hero-product-rent-increase.webp',
  tenancyEngland: '/images/heroes/universal/hero-tenancy-england.webp',
  tenancyWales: '/images/heroes/universal/hero-tenancy-wales.webp',
  tenancyScotland: '/images/heroes/universal/hero-tenancy-scotland.webp',
  tenancyNorthernIreland: '/images/heroes/universal/hero-tenancy-northern-ireland.webp',
  assistedPreparation: '/images/heroes/universal/hero-assisted-preparation.webp',
  freeLandlordTools: '/images/heroes/universal/hero-free-landlord-tools.webp',
  blogEviction: '/images/heroes/universal/hero-blog-eviction-guides.webp',
  blogTenancy: '/images/heroes/universal/hero-blog-tenancy-guides.webp',
  blogMoneyClaims: '/images/heroes/universal/hero-blog-money-claims.webp',
  tenantNotPaying: '/images/heroes/universal/hero-high-intent-tenant-not-paying.webp',
  wizardDashboard: '/images/heroes/universal/hero-action-wizard-dashboard.webp',
} as const;

export type UniversalHeroImageKey = keyof typeof UNIVERSAL_HERO_IMAGES;

export function getUniversalHeroImage(key: UniversalHeroImageKey) {
  return UNIVERSAL_HERO_IMAGES[key];
}

/** Route-family recommendation for shells and future page migrations. */
export function getUniversalHeroImageForPath(pathname: string) {
  const path = pathname.toLowerCase();

  if (path === '/' || path === '') return UNIVERSAL_HERO_IMAGES.homepage;
  if (path.includes('/wizard') || path.includes('/dashboard') || path.includes('/success/')) return UNIVERSAL_HERO_IMAGES.wizardDashboard;
  if (path.includes('northern-ireland') || path.includes('/tenancy-agreements/northern-ireland')) return UNIVERSAL_HERO_IMAGES.tenancyNorthernIreland;
  if (path.includes('scotland') || path.includes('/tenancy-agreements/scotland') || path.includes('prt-')) return UNIVERSAL_HERO_IMAGES.tenancyScotland;
  if (path.includes('wales') || path.includes('occupation-contract')) return UNIVERSAL_HERO_IMAGES.tenancyWales;
  if (path.includes('tenant-not-paying') || path.includes('tenant-stopped-paying') || path.includes('evict-tenant-not-paying')) return UNIVERSAL_HERO_IMAGES.tenantNotPaying;
  if (path.includes('complete-pack') || path.includes('court-pack') || path.includes('possession-claim')) return UNIVERSAL_HERO_IMAGES.completeEviction;
  if (path.includes('money-claim') || path.includes('rent-arrears') || path.includes('claim-rent')) return path.includes('/blog/') ? UNIVERSAL_HERO_IMAGES.blogMoneyClaims : UNIVERSAL_HERO_IMAGES.moneyClaim;
  if (path.includes('rent-increase') || path.includes('section-13')) return UNIVERSAL_HERO_IMAGES.rentIncrease;
  if (path.includes('assisted-prep')) return UNIVERSAL_HERO_IMAGES.assistedPreparation;
  if (path.includes('/tools')) return UNIVERSAL_HERO_IMAGES.freeLandlordTools;
  if (path.includes('/blog/')) {
    return path.includes('tenancy') || path.includes('agreement')
      ? UNIVERSAL_HERO_IMAGES.blogTenancy
      : UNIVERSAL_HERO_IMAGES.blogEviction;
  }
  if (path.includes('tenancy') || path.includes('agreement')) return UNIVERSAL_HERO_IMAGES.tenancyEngland;
  if (path.includes('section-8') || path.includes('eviction')) return UNIVERSAL_HERO_IMAGES.section8Notice;

  return UNIVERSAL_HERO_IMAGES.homepage;
}
