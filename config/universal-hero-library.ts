export type UniversalHeroLibraryCategory =
  | 'product'
  | 'service'
  | 'tenancy'
  | 'hub'
  | 'company'
  | 'policy'
  | 'guide';

export type UniversalHeroLibraryEntry = Readonly<{
  key: string;
  src: string;
  alt: string;
  category: UniversalHeroLibraryCategory;
  routeSuggestions: readonly string[];
}>;

const hero = (
  key: string,
  filename: string,
  alt: string,
  category: UniversalHeroLibraryCategory,
  routeSuggestions: readonly string[]
): UniversalHeroLibraryEntry => ({
  key,
  src: `/images/heroes/library/${filename}.webp`,
  alt,
  category,
  routeSuggestions,
});

/**
 * Reference-led watercolor masters prepared for the site-wide hero polish pass.
 * The images contain no readable copy: headings, proof, usage counters and CTAs
 * must remain accessible HTML rendered by UniversalHero.
 */
export const UNIVERSAL_HERO_LIBRARY = [
  hero('completeEvictionPack', 'hero-complete-eviction-pack-v2', 'Complete possession and court-document pack in a Westminster legal setting', 'product', ['/products/complete-pack']),
  hero('moneyClaimPack', 'hero-money-claim-pack-v2', 'Landlord rent-debt claim file with evidence, keys and court documents', 'product', ['/products/money-claim']),
  hero('assistedPrepOverview', 'hero-assisted-prep-overview-v2', 'Organised landlord files prepared with guided professional support', 'service', ['/assisted-prep']),
  hero('assistedSection8', 'hero-assisted-section8-v2', 'Section 8 notice preparation with callback, service and validity checks', 'service', ['/section-8-notice-assisted-prep']),
  hero('assistedPossession', 'hero-assisted-possession-v2', 'Possession claim bundle prepared with callback and evidence support', 'service', ['/possession-claim-assisted-prep']),
  hero('assistedMoneyClaim', 'hero-assisted-money-claim-v2', 'Money-claim evidence and debt file prepared with callback support', 'service', ['/money-claim-assisted-prep']),
  hero('rentIncrease', 'hero-rent-increase-v2', 'Supported rent increase with property comparisons, calendar and evidence', 'product', ['/rent-increase', '/products/section-13-standard']),
  hero('rentChallenge', 'hero-rent-challenge-v2', 'Challenge-ready rent evidence bundle with scales and comparable homes', 'product', ['/products/section-13-defence']),
  hero('pricing', 'hero-pricing-v2', 'Coordinated landlord document choices with secure checkout protection', 'hub', ['/pricing']),
  hero('tenancyJurisdictionChooser', 'hero-tenancy-jurisdiction-chooser-v2', 'Tenancy agreement choices for the four UK jurisdictions served', 'tenancy', ['/standard-tenancy-agreement']),
  hero('tenancyEnglandStandard', 'hero-tenancy-england-standard-v2', 'Straightforward England tenancy agreement with home and keys', 'tenancy', ['/products/ast', '/standard-tenancy-agreement', '/assured-shorthold-tenancy-agreement']),
  hero('tenancyEnglandPremium', 'hero-tenancy-england-premium-v2', 'Detailed premium England tenancy and property-management pack', 'tenancy', ['/premium-tenancy-agreement']),
  hero('tenancyStudent', 'hero-tenancy-student-v2', 'Student tenancy pack with shared-house, guarantor and inventory themes', 'tenancy', ['/student-tenancy-agreement']),
  hero('tenancyHmoShared', 'hero-tenancy-hmo-shared-v2', 'HMO and shared-house agreement with communal-space and safety themes', 'tenancy', ['/hmo-shared-house-tenancy-agreement']),
  hero('tenancyLodger', 'hero-tenancy-lodger-v2', 'Resident-landlord lodger agreement for a shared home', 'tenancy', ['/lodger-agreement']),
  hero('tenancyWales', 'hero-tenancy-wales-v2', 'Welsh occupation contract with home, keys and Cardiff landmarks', 'tenancy', ['/tenancy-agreements/wales']),
  hero('tenancyScotland', 'hero-tenancy-scotland-v2', 'Scottish PRT agreement with tenement, thistle and Edinburgh landmarks', 'tenancy', ['/tenancy-agreements/scotland']),
  hero('tenancyNorthernIreland', 'hero-tenancy-northern-ireland-v2', 'Northern Ireland tenancy agreement with Belfast and flax motifs', 'tenancy', ['/tenancy-agreements/northern-ireland']),
  hero('toolsHub', 'hero-tools-hub-v2', 'Landlord calculators, date checks and document-building tools', 'hub', ['/tools']),
  hero('freeSamples', 'hero-free-samples-v2', 'Protected landlord document samples ready to preview', 'hub', ['/samples']),
  hero('askHeaven', 'hero-ask-heaven-v2', 'Guided landlord document questions with calm AI assistance', 'service', ['/ask-heaven']),
  hero('evictionGuides', 'hero-eviction-guides-v2', 'Eviction guide path from notice and service to evidence and court', 'hub', ['/eviction-guides']),
  hero('landlordGuides', 'hero-landlord-guides-v2', 'Organised library of practical landlord guides and compliance support', 'hub', ['/blog']),
  hero('section8Guide', 'hero-section8-guide-v2', 'Section 8 guide with grounds, dates, service and court route', 'guide', ['/section-8-notice', '/section-8-notice-guide']),
  hero('about', 'hero-about-v2', 'Landlord document preparation and protection in an England legal setting', 'company', ['/about']),
  hero('contact', 'hero-contact-v2', 'Welcoming landlord support with telephone, email and document folder', 'company', ['/contact']),
  hero('helpCentre', 'hero-help-centre-v2', 'Landlord help library with guides, support and property keys', 'company', ['/help']),
  hero('terms', 'hero-terms-v2', 'Formal terms documents with scales, pen and legal protection', 'policy', ['/terms']),
  hero('privacy', 'hero-privacy-v2', 'Private document folder protected by shield and padlock', 'policy', ['/privacy']),
  hero('cookies', 'hero-cookies-v2', 'Cookie preferences and privacy protection without embedded interface text', 'policy', ['/cookies']),
  hero('refunds', 'hero-refunds-v2', 'Purchase receipt, return path and secure refund protection', 'policy', ['/refunds']),
  hero('tenantNotPaying', 'hero-guide-tenant-not-paying-v2', 'Unpaid rent situation with ledger, calendar, key and action file', 'guide', ['/tenant-stopped-paying-rent']),
  hero('rentArrearsSchedule', 'hero-guide-rent-arrears-schedule-v2', 'Organised rent arrears ledger, calendar and evidence checks', 'guide', ['/rent-arrears-schedule']),
  hero('section8Grounds', 'hero-guide-section8-grounds-v2', 'Section 8 ground-selection paths supported by evidence files', 'guide', ['/section-8-grounds-explained']),
  hero('ground8Arrears', 'hero-guide-ground8-arrears-v2', 'Serious rent arrears evidence supporting Ground 8', 'guide', ['/section-8-ground-8']),
  hero('tenancyBreach', 'hero-guide-tenancy-breach-v2', 'Tenancy breach evidence, agreement and notice preparation', 'guide', ['/breach-of-tenancy']),
  hero('antisocialBehaviour', 'hero-guide-antisocial-behaviour-v2', 'Antisocial-behaviour incident records and landlord evidence file', 'guide', ['/antisocial-behaviour-eviction']),
  hero('propertyDamage', 'hero-guide-property-damage-v2', 'Rental-property damage, condition evidence and repair records', 'guide', ['/tenant-damaged-property']),
  hero('servingNotice', 'hero-guide-serving-notice-v2', 'Notice service routes, calendar, envelope and property door', 'guide', ['/serve-section-8-notice']),
  hero('proofOfService', 'hero-guide-proof-of-service-v2', 'Proof-of-service certificate, delivery trail and court-ready checklist', 'guide', ['/n215-certificate-of-service']),
  hero('possessionClaim', 'hero-guide-possession-claim-v2', 'Notice file progressing into a possession claim and evidence bundle', 'guide', ['/possession-claim']),
  hero('courtHearing', 'hero-guide-court-hearing-v2', 'Organised landlord hearing bundle with evidence, clock and scales', 'guide', ['/possession-hearing-guide']),
  hero('bailiffWarrant', 'hero-guide-bailiff-warrant-v2', 'Bailiff warrant, possession papers and property hand-back', 'guide', ['/warrant-of-possession-guide']),
  hero('landlordMoneyClaim', 'hero-guide-landlord-money-claim-v2', 'Landlord rent-debt claim with demand, ledger and court file', 'guide', ['/money-claim']),
  hero('letterBeforeAction', 'hero-guide-letter-before-action-v2', 'Formal letter before action with deadline and evidence file', 'guide', ['/letter-before-action-landlord']),
  hero('guarantorRecovery', 'hero-guide-guarantor-recovery-v2', 'Linked guarantor documents, rent ledger and recovery route', 'guide', ['/claim-rent-from-guarantor']),
  hero('depositProtection', 'hero-guide-deposit-protection-v2', 'Tenancy deposit records secured with certificate and shield', 'guide', ['/deposit-protection-guide']),
  hero('electricalSafety', 'hero-guide-electrical-safety-v2', 'Electrical inspection, certificate and rented-home safety checks', 'guide', ['/landlord-electrical-safety']),
  hero('gasSafety', 'hero-guide-gas-safety-v2', 'Gas-safety inspection, certificate and landlord compliance records', 'guide', ['/landlord-gas-safety']),
  hero('inventoryCheckout', 'hero-guide-inventory-checkout-v2', 'Property inventory, condition photographs, keys and check-out records', 'guide', ['/property-inventory-guide']),
] as const satisfies readonly UniversalHeroLibraryEntry[];

export const UNIVERSAL_HERO_POLISH_CONTRACT = {
  desktopMinimumHeight: '100dvh',
  desktopCopyAreaPercent: 50,
  desktopArtworkPosition: 'right',
  mobileArtworkMode: 'full-bleed artwork crop with no desktop white gutter',
  preserveExistingPrimaryButtonClass: 'hero-btn-primary',
  preserveReviewProof: true,
  preserveUsageCounter: true,
  renderTextInHtmlOnly: true,
} as const;

export function findUniversalHeroForPath(pathname: string) {
  return UNIVERSAL_HERO_LIBRARY.find((entry) =>
    entry.routeSuggestions.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  );
}
