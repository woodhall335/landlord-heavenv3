import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/how-much-can-i-increase-rent');

export const metadata: Metadata = {
  title: 'How Much Can I Increase Rent in England? | Landlord Guide',
  description:
    'Read how landlords should judge how much rent they can increase under Section 13, then use the free checker to test the supportable range before serving Form 4A.',
  alternates: { canonical: canonicalUrl },
};

export default function HowMuchCanIIncreaseRentPage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Landlord guide"
      title="How much can I increase rent in England before it becomes harder to defend?"
      intro="There is no useful commercial answer to that question without looking at the market evidence. A landlord can usually increase rent further than is comfortable to defend, which is exactly why the checker exists."
      bullets={[
        'The legally possible figure is not always the commercially supportable figure.',
        'Comparable evidence matters more than optimism.',
        'Higher pricing can still be high-risk even with strong evidence.',
        'The safer range is often nearer the market median than the top advert.',
      ]}
      sections={[
        {
          title: 'The question is really about supportability',
          body: [
            'Most landlords do not need a lecture on whether a rent increase is possible in theory. They need to know whether the proposed figure still looks supportable once the local market, the dates, and the risk of challenge are all looked at together.',
            'That is why the strongest answer is evidence-led rather than absolute. A proposed rent can look fine in one cluster of comparables and too ambitious in another.',
          ],
        },
        {
          title: 'Why the supportable range matters',
          body: [
            'A supportable range helps you see where the stronger evidence currently points instead of anchoring on the highest listing in the area. That protects both the quality of the notice and the quality of the story behind it if the tenant questions the figure.',
            'The checker turns that into a practical next step by showing the range, the evidence strength, and the route that fits the case before you generate the paid paperwork.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the supportable rent range' }}
      secondaryCta={{ href: '/products/section-13-standard', label: 'Open the Standard Section 13 pack' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/how-much-can-i-increase-rent').slice(0, 5),
        { href: '/products/section-13-defence', label: 'View the challenge-ready Defence pack' },
      ]}
    />
  );
}
