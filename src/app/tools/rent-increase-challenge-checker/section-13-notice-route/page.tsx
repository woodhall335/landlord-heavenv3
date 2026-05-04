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
      intro="Generate the formal Section 13 notice pack once the rent figure, evidence, and service plan make sense together. The checker helps you get to that point before the form is created."
      bullets={[
        'Use the checker before you generate Form 4A.',
        'Move into Standard when the increase is supportable.',
        'Keep the notice, evidence, and service record aligned.',
        'Use Defence instead when challenge pressure is already part of the file.',
      ]}
      sections={[
        {
          title: 'Use Standard when the increase looks straightforward',
          body: [
            'The Standard Section 13 pack is for landlords who have a supportable figure and want the notice, market justification, and service record to stay aligned.',
            'Run the checker first, settle the figure, then generate the pack once the evidence and the proposed rent are pointing in the same direction.',
          ],
        },
        {
          title: 'Do not rush the notice if the figure is still uncertain',
          body: [
            'If the rent is still moving, the comparables have not been reviewed, or challenge risk is already obvious, serving the notice can put you on the back foot.',
            'The cleaner pattern is simple: run the checker, read the supportable range, decide whether the case is Standard or Defence, and then generate the pack that fits.',
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
