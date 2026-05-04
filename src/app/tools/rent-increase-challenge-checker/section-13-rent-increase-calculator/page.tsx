import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/section-13-rent-increase-calculator');

export const metadata: Metadata = {
  title: 'Section 13 Rent Increase Calculator | Free Landlord Market-Check Tool',
  description:
    'Use the free Section 13 rent increase calculator to compare your current and proposed rent against local market evidence before serving Form 4A.',
  alternates: { canonical: canonicalUrl },
};

export default function Section13RentIncreaseCalculatorPage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Section 13 calculator"
      title="Use a Section 13 rent increase calculator before you serve Form 4A"
      intro="Landlords often search for a Section 13 rent increase calculator when what they really need is a market-checking step before they commit to the figure. The free checker is built for that exact job."
      bullets={[
        'Check the rent before you generate the notice.',
        'Use live comparable evidence instead of guesswork.',
        'Separate supportable pricing from challenge risk.',
        'Move into the right paid route once the figure is clear.',
      ]}
      sections={[
        {
          title: 'A calculator should do more than add numbers',
          body: [
            'A simple calculator can tell you the difference between the current rent and the proposed rent, but it cannot tell you whether that figure is commercially supportable in the local market. That is why this tool uses comparable-rent evidence and challenge-risk logic rather than acting like a plain arithmetic widget.',
            'For landlords, the key question is not just how much more rent you want. It is whether the market evidence and the Section 13 route can support that figure cleanly before the notice goes out.',
          ],
        },
        {
          title: 'Why the checker is a better first step',
          body: [
            'The checker gives you a supportable range, a market median, evidence strength, and the likely challenge posture. That turns the free result into a decision tool rather than a vague estimate.',
            'Once the result is clear, the next move becomes much easier. Lower-risk files can move into the Standard Section 13 route, while higher-pressure cases can move straight into the Defence route.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Open the free calculator' }}
      secondaryCta={{ href: '/rent-increase', label: 'Compare the Section 13 landlord routes' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/section-13-rent-increase-calculator').slice(0, 5),
        { href: '/products/section-13-standard', label: 'View the Standard Section 13 pack' },
      ]}
    />
  );
}
