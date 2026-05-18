import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/challenge-risk');

export const metadata: Metadata = {
  title: 'Section 13 Challenge Risk | Rent Increase Defence',
  description:
    'See what makes a Section 13 rent increase more likely to be challenged and when landlords should move into the stronger Defence route.',
  keywords: [
    'section 13 challenge risk',
    'rent increase challenge',
    'section 13 defence pack',
    'tenant challenges rent increase',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function ChallengeRiskPage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Challenge risk"
      title="When a Section 13 rent increase becomes harder to defend"
      intro="A rent increase can be well prepared and still be too ambitious. The practical question is whether the figure, evidence, and tenant response all point to a straightforward notice or a file that needs Defence preparation."
      bullets={[
        'Strong evidence does not make every figure safe.',
        'Tenant objection changes what you should prepare.',
        'Aggressive pricing needs a different response from weak paperwork.',
        'Defence is for files that may be tested.',
      ]}
      sections={[
        {
          title: 'Separate the evidence from the risk',
          body: [
            'Evidence strength tells you whether the comparables are usable. Challenge risk tells you whether the proposed rent is likely to be questioned anyway.',
            'That distinction matters. If the evidence is strong but the figure is still high against the market position, the next decision is whether to lower the figure or prepare the file properly for challenge.',
          ],
        },
        {
          title: 'Know when Defence is the cleaner answer',
          body: [
            'The Defence route is the better fit when the tenant has already objected, the figure is ambitious, or you want the rent evidence and response materials organised before the pressure starts.',
            'The checker helps you make that call early, while you can still adjust the figure or choose the stronger route deliberately.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check challenge risk now' }}
      secondaryCta={{ href: '/rent-increase', label: 'Prepare for a rent challenge' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/challenge-risk').slice(0, 4),
        { href: '/rent-increase', label: 'Compare Standard and Defence Section 13 routes' },
      ]}
    />
  );
}
