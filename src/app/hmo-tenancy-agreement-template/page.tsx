import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { hmoTenancyAgreementTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/hmo-tenancy-agreement-template';
const canonicalUrl = getCanonicalUrl(pagePath);
const canonicalProductPage = '/hmo-shared-house-tenancy-agreement';

const faqs = [
  {
    question: 'Is HMO still handled through Premium?',
    answer:
      'No. England HMOs and shared houses now have their own dedicated HMO / Shared House product instead of being bundled into Premium.',
  },
  {
    question: 'Should I use this page for ordinary residential lets?',
    answer:
      'Usually no. This page is for shared-house and HMO intent. Straightforward whole-property residential lets should use Standard or Premium instead.',
  },
  {
    question: 'What if the landlord lives in the property?',
    answer:
      'If the landlord is resident and sharing the home with the occupier, compare the Lodger route instead of the HMO / Shared House product.',
  },
  {
    question: 'Does this page replace the main England chooser?',
    answer:
      'No. It is a focused entry page for HMO and shared-house intent. You can still use the main England chooser if you want to compare all five product routes.',
  },
];

export const metadata: Metadata = {
  title: 'HMO Tenancy Agreement Template | England HMO / Shared House Route',
  description:
    'England HMO / Shared House tenancy agreement guidance with a direct route into the dedicated HMO/shared-house product.',
  keywords: [
    'hmo tenancy agreement template',
    'hmo tenancy agreement england',
    'shared house tenancy agreement',
    'hmo shared house agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'HMO Tenancy Agreement Template | England HMO / Shared House Route',
    description:
      'England HMO / Shared House tenancy agreement guidance with a direct route into the dedicated HMO/shared-house product.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function HmoTenancyAgreementTemplatePage() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'HMO Tenancy Agreement Template', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'HMO Tenancy Agreement Template',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-27',
        dateModified: '2026-03-27',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="HMO Tenancy Agreement Template"
      heroSubtitle="England HMO and shared-house cases now have a dedicated product route. Use this page when the real need is communal-area and sharer-specific drafting, not just a higher-priced ordinary tenancy agreement."
      heroMediaSrc="/images/wizard-icons/46-premium.png"
      heroMediaAlt="Illustration showing HMO and shared-house agreement setup"
      primaryCtaLabel="Start HMO / Shared House agreement"
      primaryCtaHref={canonicalProductPage}
      pagePath={pagePath}
      intentHookTitle="Match HMO intent to the HMO product"
      intentHookParagraphs={[
        'Landlords searching for an HMO tenancy agreement template are usually trying to solve a shared-house problem, not just buy a more detailed version of an ordinary tenancy agreement.',
        'That is why the England HMO / Shared House route now stands on its own. It captures communal areas, sharer expectations, and house-management detail directly instead of assuming Premium can cover every higher-complexity case.',
        'This page should move HMO intent straight to the dedicated HMO/shared-house product so the product model and the public funnel tell the same story.',
      ]}
      currentPositionTitle="Why this is no longer a Premium page"
      currentPositionParagraphs={[
        'The old funnel treated Premium as the practical home for HMOs, shared houses, student lets, and other complex arrangements. That blurred together materially different England products and made it harder to route users cleanly.',
        'The revised product system separates HMO / Shared House from Premium. Premium is now an ordinary-residential premium agreement, while HMO / Shared House handles communal sharers and shared-house-specific drafting.',
      ]}
      sections={[
        {
          title: 'When the HMO / Shared House route is the better fit',
          paragraphs: [
            'Use the dedicated HMO / Shared House product when the tenancy involves communal areas, sharers, HMO-style management detail, or a setup where room-by-room or shared-house practicalities need to be recorded explicitly.',
            'This is different from choosing Premium for a fuller ordinary-residential agreement. The point is not just that the tenancy feels more complex. The point is that the shared-house structure itself needs a different product identity and drafting path.',
          ],
        },
        {
          title: 'Why a dedicated HMO route matters',
          paragraphs: [
            'When HMO cases are funnelled through an ordinary premium product, users have to infer whether the agreement really matches communal sharers, shared facilities, and house-management expectations.',
            'A dedicated HMO / Shared House route removes that guesswork. It names the use case directly and keeps the drafting path aligned with the actual occupation setup from the start.',
          ],
        },
        {
          title: 'How this page fits the wider England chooser',
          paragraphs: [
            'This page is an intent-specific entry point, not a replacement for the wider England tenancy chooser. Standard, Premium, Student, HMO / Shared House, and Lodger all remain available from the main chooser.',
            'If the user already knows the property is an HMO or shared house, this page should reduce friction by sending them straight into the dedicated HMO/shared-house path.',
          ],
        },
      ]}
      ctaBlockTitle="Need HMO or shared-house drafting?"
      ctaBlockDescription="Go straight to the dedicated England HMO / Shared House product instead of comparing it as a Premium variant."
      faqTitle="HMO tenancy agreement template FAQs"
      faqIntro="Short answers for landlords trying to route HMO and shared-house cases correctly in the new England product model."
      faqs={faqs}
      finalCtaTitle="Open the dedicated HMO / Shared House product"
      finalCtaDescription="If the real issue is communal sharers, shared facilities, or HMO-style occupation, use the HMO / Shared House route directly."
      finalCtaLabel="View HMO / Shared House agreement"
      relatedLinks={hmoTenancyAgreementTemplateRelatedLinks}
    />
  );
}
