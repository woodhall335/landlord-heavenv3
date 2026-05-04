import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
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
      intro="Most weak Section 13 files are not weak because the landlord forgot the form. They are weak because the figure was chosen before the comparables were read properly."
      bullets={[
        'Look for the supportable cluster, not the highest advert.',
        'Fresh comparables matter more than random old listings.',
        'Bedroom count and property type still matter even within the same postcode.',
        'A strong evidence file can still support a lower figure than you hoped.',
      ]}
      sections={[
        {
          title: 'Do not treat every nearby advert as equal',
          body: [
            'Comparable evidence is not just a pile of listings. Some comparables genuinely support the market calculation, some only give context, and some are too stale or too mismatched to carry real weight. Landlords lose trust in the result when all of those listings are shown as though they mean the same thing.',
            'That is why the checker now separates comparables used in the market calculation from context-only or excluded listings. It lets landlords see the real calculation basis instead of guessing why the median looks different from the noisiest listing on the page.',
          ],
        },
        {
          title: 'Supportable does not mean maximum',
          body: [
            'A supportable figure is not always the highest figure you can find in the area. It is the figure you can explain calmly using the best available comparables, the freshest evidence, and a clean story about why the property belongs in that part of the range.',
            'If the strongest comparables point closer to the lower or middle part of the range, the commercially safer answer may be to serve a lower increase and keep the file cleaner rather than squeezing for the top end and inviting challenge.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the market-rent range now' }}
      secondaryCta={{ href: '/rent-increase', label: 'See the Section 13 landlord routes' }}
      relatedLinks={[
        { href: '/tools/rent-increase-challenge-checker/guide', label: 'How to use the checker' },
        { href: '/tools/rent-increase-challenge-checker/challenge-risk', label: 'How challenge risk changes the route' },
        { href: '/products/rent-increase', label: 'View the paid Section 13 product page' },
      ]}
    />
  );
}
