import type { Metadata } from 'next';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { RentIncreaseChallengeChecker } from '@/components/tools/rent-checker';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker');

export const metadata: Metadata = {
  title: 'Section 13 Rent Increase Checker | Free Landlord Market Rent Tool',
  description:
    'Free England Section 13 checker for landlords. Compare the proposed rent against local market evidence, see challenge risk, and move into the right paid Section 13 route before you serve Form 4A.',
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
      <RentIncreaseChallengeChecker />
    </>
  );
}
