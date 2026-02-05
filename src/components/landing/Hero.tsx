'use client';

import { UniversalHero } from './UniversalHero';

const FEATURES = [
  'Download instant UK notices & forms',
  'Covers Section 21, Section 8',
  'England, Wales & Scotland',
];

export function Hero() {
  return (
    <UniversalHero
      trustText="Trusted by UK Landlords"
      title="Legal Documents"
      highlightTitle="in Minutes, Not Days"
      subtitle={
        <>
          Generate compliant eviction notices, court forms, and tenancy agreements —
          <span className="font-semibold"> save 80%+ vs solicitor</span>
        </>
      }
      primaryCta={{ label: 'Generate Your Documents →', href: '/generate' }}
      secondaryCta={{ label: 'View Pricing →', href: '/pricing' }}
      features={FEATURES}
      mascotSrc="/images/mascots/landlord-heaven-owl-tenancy-tools.png"
      mascotAlt="Landlord Heaven owl mascot holding a pen and shield"
    />
  );
}
