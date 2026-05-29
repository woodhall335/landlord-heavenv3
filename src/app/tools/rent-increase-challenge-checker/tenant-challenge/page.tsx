import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/tenant-challenge');

export const metadata: Metadata = {
  title: 'Tenant Pushing Back on a Rent Increase | Landlord Section 13 Guide',
  description:
    'See what changes when a tenant pushes back on a rent increase and when landlords should move from the free checker into the stronger Section 13 Defence route.',
  keywords: [
    'tenant pushing back rent increase',
    'tenant challenges rent increase',
    'section 13 defence',
    'rent increase challenge',
    'tenant objected to rent increase',
    'section 13 tenant challenge',
    'rent increase tribunal evidence',
    'landlord rent challenge response',
    'form 4a challenge response',
    'section 13 defence pack',
    'market rent dispute landlord',
    'rent increase pushback guide',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function TenantChallengePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Tenant pushback"
      title="What should a landlord do when the tenant pushes back on the rent increase?"
      intro="If the tenant is already questioning the increase, treat that as a signal to check the figure and the evidence before the dispute hardens. The goal is to know whether the rent is the problem, or whether the file just needs stronger preparation."
      bullets={[
        'Check whether the figure is too ambitious.',
        'Keep the comparables and service record together.',
        'Use Defence when pushback is already likely.',
        'Avoid rebuilding the file after the argument starts.',
      ]}
      sections={[
        {
          title: 'Work out what the pushback is really about',
          body: [
            'A tenant can push back for different reasons. The evidence might be thin, the dates might be messy, or the proposed rent might simply sit too high compared with the strongest local listings.',
            'The checker helps separate those problems before you pay for the next document step. That matters because a pricing problem usually needs a pricing decision, not just more paperwork.',
          ],
        },
        {
          title: 'When the Defence route becomes the better fit',
          body: [
            'If pushback is already likely, the Defence route is often the more sensible paid step because it keeps the response materials, argument structure, and supporting evidence together from the start.',
            'Used together, the checker answers where the figure sits and the Defence route helps prepare the file if the tenant keeps pressing the point.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the rent position first' }}
      secondaryCta={{ href: '/products/section-13-defence', label: 'Prepare for a rent challenge' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/tenant-challenge').slice(0, 5),
        { href: '/rent-increase', label: 'Compare Standard and Defence routes' },
      ]}
    />
  );
}
