import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/guide');

export const metadata: Metadata = {
  title: 'How To Use the Rent Increase Checker | Section 13 Market Evidence Guide',
  description:
    'Learn how landlords can use the Rent Increase & Challenge Checker to test market-rent evidence, challenge risk, and the next Section 13 route before serving Form 4A.',
  alternates: { canonical: canonicalUrl },
};

export default function RentCheckerGuidePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Section 13 tool guide"
      title="How to use the Rent Increase & Challenge Checker before you serve Form 4A"
      intro="This landlord guide explains how to use the checker properly, what the market-rent result actually tells you, and when to move from the free result into the Standard or Defence Section 13 route."
      bullets={[
        'Use live local comparables before you serve anything.',
        'Read challenge risk separately from evidence strength.',
        'Move into the Standard route for normal increases.',
        'Move into the Defence route when challenge risk is already visible.',
      ]}
      sections={[
        {
          title: 'Start with the real question',
          body: [
            'The free checker is not there to replace judgment. It is there to stop landlords serving a rent increase before the figure, the evidence, and the challenge risk are clear enough to explain with confidence.',
            'That matters because a Section 13 file can look tidy on the surface while still being weak underneath. A neat form does not fix a poor figure, stale evidence, or a story that changes once the tenant pushes back.',
          ],
        },
        {
          title: 'What the result should tell you',
          body: [
            'A useful result should answer three things quickly: where the current or proposed rent sits against the local market, how strong the evidence looks, and what route makes sense next. Those are different questions and landlords make better decisions when they are kept separate.',
            'If the evidence is strong but the proposed figure sits high, the problem is not weak preparation. The problem is that the figure may be too ambitious for the market calculation. That distinction is exactly why the checker now separates evidence strength from challenge risk.',
          ],
        },
        {
          title: 'When to move into the paid route',
          body: [
            'Use the Standard Section 13 route when the figure looks supportable and you want the notice, the summary, and the service record to stay aligned. Use the Defence route when the increase may still be arguable but the tenant is likely to test it, question it, or push the matter toward tribunal.',
            'The checker is most valuable when it shortens the gap between reading and action. Once the supportable range is clear, the next move should be a product route that matches the real risk instead of forcing every landlord through the same generic workflow.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Run the free rent checker' }}
      secondaryCta={{ href: '/rent-increase', label: 'Compare the Section 13 routes' }}
      relatedLinks={[
        { href: '/tools/rent-increase-challenge-checker/market-rent-evidence', label: 'Read the market-rent evidence guide' },
        { href: '/tools/rent-increase-challenge-checker/challenge-risk', label: 'Read the challenge-risk guide' },
        { href: '/tools/rent-increase-challenge-checker/section-13-notice-route', label: 'Read the Section 13 notice guide' },
        { href: '/rent-increase', label: 'Open the main Section 13 route page' },
      ]}
    />
  );
}
