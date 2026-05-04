import type { Metadata } from 'next';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { RentIncreaseChallengeChecker } from '@/components/tools/rent-checker';

export const metadata: Metadata = {
  title: 'Rent Increase & Challenge Checker | Landlord Heaven',
  description:
    'Free England Section 13 checker for landlords. Compare the proposed rent against local market evidence, see challenge risk, and move into the right paid Section 13 route before you serve Form 4A.',
};

export default function RentIncreaseChallengeCheckerPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <RentIncreaseChallengeChecker />
    </>
  );
}
