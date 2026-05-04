import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/challenge-risk');

export const metadata: Metadata = {
  title: 'Section 13 Challenge Risk | When a Rent Increase Becomes Harder to Defend',
  description:
    'See what makes a Section 13 rent increase more likely to be challenged and when landlords should move into the stronger Defence route.',
  alternates: { canonical: canonicalUrl },
};

export default function ChallengeRiskPage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Challenge risk"
      title="When a Section 13 rent increase becomes harder to defend"
      intro="Challenge risk is not the same thing as weak evidence. A landlord can have a tidy evidence file and still push the proposed rent high enough that the case becomes harder to defend."
      bullets={[
        'High challenge risk can exist even with strong evidence.',
        'Tenant objection changes the route, not just the tone.',
        'Aggressive pricing is a different problem from weak paperwork.',
        'The Defence route exists for challenge-heavy files, not as a default upsell.',
      ]}
      sections={[
        {
          title: 'Read evidence strength and challenge risk separately',
          body: [
            'Evidence strength asks whether you have enough good material to justify the calculation. Challenge risk asks whether the proposed figure, service position, and overall case posture make a dispute more likely. Those can move in different directions.',
            'A landlord can have strong comparables and still choose a figure that sits above the supported market position. In that case the answer is not "get more evidence and hope". The answer is either lower the figure or prepare the file for challenge properly.',
          ],
        },
        {
          title: 'Know when the Defence route is the honest answer',
          body: [
            'The Defence route is the better fit when the tenant has already objected, the figure is ambitious relative to the market calculation, or the landlord wants the file organised for tribunal pressure from the start. That is not fear-based selling. It is just a different kind of preparation.',
            'The checker now makes that distinction more explicit so landlords do not get the wrong message from a result that says the evidence is strong but the proposed rent is still high-risk.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check challenge risk now' }}
      secondaryCta={{ href: '/rent-increase', label: 'See the Defence route' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/challenge-risk').slice(0, 4),
        { href: '/rent-increase', label: 'Compare Standard and Defence Section 13 routes' },
      ]}
    />
  );
}
