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
      intro="If you already have a rent figure in mind, check it against the market before you serve it. The free checker shows whether the increase looks supportable, borderline, or likely to need stronger preparation."
      bullets={[
        'Check the proposed rent before you generate the notice.',
        'Use local comparable evidence instead of a guess.',
        'See whether the issue is pricing, evidence, or challenge risk.',
        'Choose the paid pack after the figure makes sense.',
      ]}
      sections={[
        {
          title: 'The rent figure needs a reality check',
          body: [
            'It is easy to calculate the monthly uplift. The harder question is whether that uplift still looks sensible when it is compared with similar homes nearby.',
            'Before you serve Form 4A, you want to know whether the market evidence supports the proposed rent and whether the file should stay on the Standard route or move into the Defence route.',
          ],
        },
        {
          title: 'What to do with the result',
          body: [
            'If the rent sits in a supportable range, you can move into the Standard Section 13 pack with more confidence. If the figure is high against the evidence, the safer move is to prepare for challenge before the notice goes out.',
            'That keeps the paid step practical. You are not buying a pack because the page says so; you are choosing the pack that matches the risk in front of you.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check my rent increase' }}
      secondaryCta={{ href: '/rent-increase', label: 'Compare the Section 13 landlord routes' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/section-13-rent-increase-calculator').slice(0, 5),
        { href: '/products/section-13-standard', label: 'View the Standard Section 13 pack' },
      ]}
    />
  );
}
