import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/market-rent-evidence');

export const metadata: Metadata = {
  title: 'Section 13 Market Rent Evidence | How Landlords Should Judge the Figure',
  description:
    'Understand how landlords should read market-rent comparables before serving a Section 13 / Form 4A rent increase in England.',
  alternates: { canonical: canonicalUrl },
};

export default function MarketRentEvidencePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Market-rent evidence"
      title="How to judge market-rent evidence before a Section 13 rent increase"
      intro="The figure matters more than the form at the start. Before you serve Form 4A, check whether the comparables actually support the rent you want to charge."
      bullets={[
        'Look for the supportable cluster, not the highest advert.',
        'Fresh comparables matter more than random old listings.',
        'Bedroom count and property type still matter even within the same postcode.',
        'A strong evidence file can still support a lower figure than you hoped.',
      ]}
      sections={[
        {
          title: 'Not every nearby advert carries the same weight',
          body: [
            'Some listings genuinely support the market calculation. Others are useful context. Some are too old, too different, or too extreme to carry much weight.',
            'The checker separates those groups so you can see which comparables actually affected the median and which ones were shown for context only.',
          ],
        },
        {
          title: 'Supportable is not the same as maximum',
          body: [
            'A supportable rent is not always the highest advert you can find nearby. It is the figure you can explain calmly using the best available comparables.',
            'If the strongest listings point closer to the middle of the range, the more sensible move may be to serve a lower increase and keep the file cleaner.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the market-rent range now' }}
      secondaryCta={{ href: '/rent-increase', label: 'See the Section 13 landlord routes' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/market-rent-evidence').slice(0, 4),
        { href: '/products/rent-increase', label: 'View the paid Section 13 product page' },
      ]}
    />
  );
}
