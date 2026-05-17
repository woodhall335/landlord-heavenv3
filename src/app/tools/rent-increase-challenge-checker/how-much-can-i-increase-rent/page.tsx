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
      intro="The useful answer is not just the biggest increase you can ask for. It is the increase you can explain with local evidence if the tenant questions it."
      bullets={[
        'The biggest possible figure is not always the safest figure.',
        'Comparable evidence matters more than hope.',
        'A high rent can still be risky even with decent evidence.',
        'The safer figure is often closer to the market median.',
      ]}
      sections={[
        {
          title: 'Start with what you could justify',
          body: [
            'Most landlords are not looking for a theory lesson. They want to know whether the proposed rent still looks reasonable once the local market, the property details, and the chance of pushback are put together.',
            'That is why the checker starts with comparable evidence. A figure can look fine in one set of listings and too ambitious in another, even in the same wider area.',
          ],
        },
        {
          title: 'Use the range before you pick the pack',
          body: [
            'The supportable range helps you avoid anchoring on the highest advert you can find. It shows where the stronger evidence points now, which is the figure you may need to explain later.',
            'Once you have that range, the next step is clearer: Standard when the increase is straightforward, Defence when the figure or the tenant response makes the case more exposed.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the supportable rent range' }}
      secondaryCta={{ href: '/products/section-13-standard', label: 'Create my rent increase notice' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/how-much-can-i-increase-rent').slice(0, 5),
        { href: '/products/section-13-defence', label: 'View the challenge-ready Defence pack' },
      ]}
    />
  );
}
