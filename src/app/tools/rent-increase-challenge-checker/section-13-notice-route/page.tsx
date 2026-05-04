import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/section-13-notice-route');

export const metadata: Metadata = {
  title: 'Section 13 Notice Route | When Landlords Should Move from Check to Notice',
  description:
    'Understand when a landlord should move from the free rent checker into the Standard Section 13 / Form 4A notice route.',
  alternates: { canonical: canonicalUrl },
};

export default function Section13NoticeRoutePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Section 13 notice route"
      title="When to move from the free rent check into the Standard Section 13 notice route"
      intro="The best time to generate the formal Section 13 notice pack is after the supportable range, the dates, and the service plan make sense together, not before."
      bullets={[
        'Use the checker before you generate Form 4A.',
        'Move into Standard when the increase is supportable.',
        'Keep the notice, evidence, and service record aligned.',
        'Use Defence instead when challenge pressure is already part of the file.',
      ]}
      sections={[
        {
          title: 'What the Standard route is really for',
          body: [
            'The Standard Section 13 route is not just there to produce a form. Its real job is to keep the notice, the market justification, and the service record telling the same story before the increase is served.',
            'That is why the checker matters commercially. It helps the landlord settle the figure first, so the paid route becomes a cleaner move from supported decision to supported notice rather than a paperwork exercise based on guesswork.',
          ],
        },
        {
          title: 'Why landlords should not jump straight to service',
          body: [
            'A rushed notice can create its own problems. If the figure is still moving, the comparables have not been reviewed, or the challenge risk is already obvious, the landlord can end up serving a notice that later needs to be defended from a weaker position than necessary.',
            'The stronger pattern is simple: run the checker, read the supportable range, decide whether the case is standard or challenge-heavy, and then choose the product route that fits that reality.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Run the checker before you serve' }}
      secondaryCta={{ href: '/rent-increase', label: 'Open the Standard Section 13 route' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/section-13-notice-route').slice(0, 4),
        { href: '/products/rent-increase', label: 'Visit the public Section 13 product page' },
      ]}
    />
  );
}
