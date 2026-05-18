import type { Metadata } from 'next';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { RentIncreaseChallengeChecker } from '@/components/tools/rent-checker';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, softwareApplicationSchema } from '@/lib/seo/structured-data';

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
  ],
  alternates: { canonical: canonicalUrl },
};

export default function RentIncreaseChallengeCheckerPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <StructuredData data={softwareApplicationSchema()} />
      <RentIncreaseChallengeChecker />
    </>
  );
}
