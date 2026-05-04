import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/form-4a-evidence');

export const metadata: Metadata = {
  title: 'Form 4A Evidence Guide | What Landlords Should Check Before Service',
  description:
    'See what evidence landlords should line up before serving Form 4A, then use the free checker to test whether the proposed rent sits in a supportable market range.',
  alternates: { canonical: canonicalUrl },
};

export default function Form4AEvidencePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Form 4A evidence"
      title="What evidence should a landlord check before serving Form 4A?"
      intro="Form 4A is only part of the Section 13 job. The figure, the comparables, and the service record need to hold together as one file if you want the increase to read well under scrutiny."
      bullets={[
        'Form 4A is stronger when the figure is settled first.',
        'Comparables should support the chosen rent, not just decorate it.',
        'Service planning matters before the notice is sent.',
        'The checker helps decide whether to use Standard or Defence next.',
      ]}
      sections={[
        {
          title: 'A notice without a story is weaker than it looks',
          body: [
            'Landlords sometimes treat Form 4A as the main event, but the form is only one part of the file. The more important question is whether the figure can be explained using current market evidence and then served cleanly without the supporting story changing afterwards.',
            'That is why the checker sits naturally before the paid pack. It helps you test the number and the market position before you lock them into the final notice route.',
          ],
        },
        {
          title: 'Use the checker to settle the evidence before service',
          body: [
            'The best use of the free tool is to decide whether the proposed figure belongs in the supportable range, whether challenge risk is already visible, and whether the case still looks like a Standard route or a Defence route.',
            'That makes the paid pack a cleaner follow-on step because the evidence decision has already happened before the form is generated.',
          ],
        },
      ]}
      primaryCta={{ href: '/tools/rent-increase-challenge-checker', label: 'Check the evidence before Form 4A' }}
      secondaryCta={{ href: '/rent-increase', label: 'Compare the Section 13 routes' }}
      relatedLinks={[
        ...getRentCheckerSeoLinks('/tools/rent-increase-challenge-checker/form-4a-evidence').slice(0, 5),
        { href: '/products/section-13-standard', label: 'See the Standard notice pack' },
      ]}
    />
  );
}
