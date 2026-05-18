import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/guide');

export const metadata: Metadata = {
  title: 'How To Use the Rent Increase Checker | Section 13 Guide',
  description:
    'Learn how landlords can use the Rent Increase & Challenge Checker to test market-rent evidence, challenge risk, and the next Section 13 route before serving Form 4A.',
  keywords: [
    'rent increase checker guide',
    'section 13 checker guide',
    'market rent evidence guide',
    'form 4a checker',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function RentCheckerGuidePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Section 13 tool guide"
      title="How to use the Rent Increase & Challenge Checker before you serve Form 4A"
      intro="Use the checker when you know you want to increase rent, but you still need to know whether the figure is supportable and which Section 13 pack fits the risk."
      bullets={[
        'Use live local comparables before you serve anything.',
        'Read challenge risk separately from evidence strength.',
        'Move into the Standard route for normal increases.',
        'Move into the Defence route when challenge risk is already visible.',
      ]}
      sections={[
        {
          title: 'Start with the decision in front of you',
          body: [
            'Before you serve Form 4A, you need to know whether the proposed rent is a sensible figure to stand behind. The checker gives you that first read before you commit to the paperwork.',
            'That matters because a Section 13 file can look tidy on the surface while still being weak underneath. A clean form does not fix a poor figure, stale evidence, or a story that changes once the tenant pushes back.',
          ],
        },
        {
          title: 'Read the result like a landlord decision',
          body: [
            'The useful result answers three questions quickly: where the rent sits against the local market, how strong the evidence looks, and what you should do next.',
            'If the evidence is strong but the proposed figure sits high, the issue is not weak preparation. The issue may be that the figure is too ambitious for the current market calculation.',
          ],
        },
        {
          title: 'Move into the right paid route',
          body: [
            'Use the Supported Rent Increase Pack when the figure looks supportable and you want the notice, rent summary, and service record aligned. Use the Tribunal-Ready route when the rent may still be arguable but the tenant is likely to test it.',
            'That is the point of the free tool: it turns research into a practical next step instead of leaving you with a pile of guidance and no clear route.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Run the free rent checker' }}
      secondaryCta={{ href: '/rent-increase', label: 'Compare the Section 13 routes' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/guide').slice(0, 5),
        { href: '/rent-increase', label: 'Choose my Section 13 route' },
      ]}
    />
  );
}
