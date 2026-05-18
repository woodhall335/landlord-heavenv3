import type { Metadata } from 'next';

import { RentCheckerSeoPage } from '@/components/tools/rent-checker/RentCheckerSeoPage';
import { getRentCheckerSeoLinks } from '@/components/tools/rent-checker/seo-links';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tools/rent-increase-challenge-checker/form-4a-evidence');

export const metadata: Metadata = {
  title: 'Form 4A Evidence Guide | What Landlords Should Check Before Service',
  description:
    'See what evidence landlords should line up before serving Form 4A, then use the free checker to test whether the proposed rent sits in a supportable market range.',
  keywords: [
    'form 4a evidence',
    'section 13 evidence',
    'rent increase evidence',
    'market rent comparables',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function Form4AEvidencePage() {
  return (
    <RentCheckerSeoPage
      eyebrow="Form 4A evidence"
      title="What evidence should a landlord check before serving Form 4A?"
      intro="Before you serve Form 4A, make sure the rent figure and the evidence behind it are telling the same story. The form is much easier to stand behind when the number has been checked first."
      bullets={[
        'Settle the rent figure before you generate the form.',
        'Use comparables that genuinely support the rent.',
        'Keep the service record lined up with the notice.',
        'Use Standard or Defence based on the risk shown.',
      ]}
      sections={[
        {
          title: 'The form is not the whole file',
          body: [
            'Form 4A matters, but it does not make a weak figure stronger by itself. If the tenant asks why the rent is going up, the answer has to come from the comparables and the way the file has been put together.',
            'That is why the checker belongs before the paid pack. It helps you test the number and the market position before those details are locked into the final notice.',
          ],
        },
        {
          title: 'Check the evidence before service',
          body: [
            'Use the free tool to see whether the proposed figure is in the supportable range and whether challenge risk is already visible.',
            'Then the paid pack becomes a cleaner follow-on step: Standard if the file is straightforward, Defence if the rent or the likely response needs more preparation.',
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
