import type { Metadata } from 'next';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { RentIncreaseChallengeChecker } from '@/components/tools/rent-checker';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, softwareApplicationSchema } from '@/lib/seo/structured-data';
import { UniversalHero } from '@/components/landing/UniversalHero';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker');

export const metadata: Metadata = {
  title: 'Section 13 Rent Increase Checker | Free Landlord Market Rent Tool',
  description:
    'Free England Section 13 checker for landlords. Compare proposed rent with market evidence, see challenge risk, and choose the right Form 4A route.',
  keywords: [
    'section 13 rent increase calculator',
    'rent increase checker landlord',
    'form 4a checker',
    'rent increase challenge checker',
    'market rent evidence landlord',
    'section 13 market rent checker',
    'form 4a rent increase tool',
    'tenant rent challenge risk',
    'supportable rent increase',
    'rent increase evidence checker',
    'england landlord rent tool',
    'section 13 tribunal risk',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function RentIncreaseChallengeCheckerPage() {
  const sampleProof = getGoldenPackProofData('section13_standard');
  const samplePage = getProductSamplePageByPackKey('section13_standard');

  return (
    <>
      <HeaderConfig mode="solid" />
      <StructuredData data={softwareApplicationSchema()} />
      <UniversalHero
        preset="content_index"
        preTitleLabel="Free Section 13 tool"
        title="Section 13 Rent Increase Checker"
        highlightTitle="for England landlords"
        subtitle="Check the market range, evidence strength and challenge risk before you serve Form 4A or choose the Standard or Tribunal-Ready rent increase pack."
        primaryCta={{ label: 'Run the free rent checker', href: '#rent-increase-checker' }}
        secondaryCta={{ label: 'Compare Section 13 routes', href: '/rent-increase' }}
        trustText="Free market-rent evidence check before you prepare Form 4A"
      />
      <div id="rent-increase-checker" className="scroll-mt-28">
      <RentIncreaseChallengeChecker />
      </div>
      {sampleProof ? (
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <GoldenPackProof data={sampleProof} samplePageHref={samplePage?.samplePath} />
          </div>
        </section>
      ) : null}
    </>
  );
}
