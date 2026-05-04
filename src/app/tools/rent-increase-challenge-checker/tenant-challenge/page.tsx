import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/tenant-challenge');

export const metadata: Metadata = {
  title: 'Tenant Challenging a Rent Increase | What Landlords Should Do Next',
  description:
    'See what changes when a tenant challenges a rent increase and when landlords should move from the free checker into the stronger Section 13 Defence route.',
  alternates: { canonical: canonicalUrl },
};

export default function TenantChallengePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Tenant challenge"
      title="What should a landlord do when a tenant challenges the rent increase?"
      intro="Once challenge pressure is already visible, the job changes. The question is no longer just whether the increase can be served, but whether the file is ready to be defended with the same clarity."
      bullets={[
        'Challenge pressure changes the route, not just the messaging.',
        'Strong evidence can still point to a lower safer figure.',
        'The Defence route is for pressure-tested files.',
        'Use the checker to see whether the pricing itself is the problem.',
      ]}
      sections={[
        {
          title: 'Find out whether the issue is pricing or preparation',
          body: [
            'A tenant challenge can come from different places. Sometimes the evidence is thin. Sometimes the dates or service plan are messy. Sometimes the evidence is strong but the proposed figure still sits too high against the market calculation.',
            'The checker helps separate those problems before you invest in the next document step. That matters because the best response to a pricing problem is not always more paperwork.',
          ],
        },
        {
          title: 'Why this usually points toward the Defence route',
          body: [
            'If the tenant is already pushing back, the landlord usually benefits from the stronger Section 13 Defence route because the pack is built to keep the response materials, argument structure, and supporting evidence coherent under pressure.',
            'The checker and the Defence route work best together when the first tool answers where the figure sits and the second route answers how the file should be prepared if the dispute continues.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the challenge position first' }}
      secondaryCta={{ href: '/products/section-13-defence', label: 'Open the Defence route' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/tenant-challenge').slice(0, 5),
        { href: '/rent-increase', label: 'Compare Standard and Defence routes' },
      ]}
    />
  );
}
