import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { hmoTenancyAgreementTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/hmo-tenancy-agreement-template';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'Why is Premium the focus on this page?',
    answer:
      'Because HMO, sharer, student, and guarantor-backed lets are usually where landlords need broader wording and stronger supporting documents from the start. This page is built to move complex buyers toward the Premium path instead of a thin standard template.',
  },
  {
    question: 'Can I still use the main /products/ast page from here?',
    answer:
      'Yes. The CTA points to /products/ast because that is where the Standard and Premium options are compared. The difference is that this page frames Premium as the likely better fit for complex lets.',
  },
  {
    question: 'Is this page only for licensed HMOs?',
    answer:
      'No. It is also relevant to shared houses, student lets, guarantor-backed arrangements, and any tenancy setup where broader wording and more operational detail are helpful from day one.',
  },
  {
    question: 'What if my let is straightforward after all?',
    answer:
      'You can still use the main product page to compare both options. This page exists because complex buyers often want a clearer signal that Premium is the stronger route when the tenancy setup is not simple.',
  },
];

export const metadata: Metadata = {
  title: 'HMO Tenancy Agreement Template | Premium England Route',
  description:
    'Premium-focused page for HMO, sharer, student, and guarantor-backed England lets, with a direct route into the main product page.',
  keywords: [
    'hmo tenancy agreement template',
    'student tenancy agreement england',
    'shared house tenancy agreement',
    'premium tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'HMO Tenancy Agreement Template | Premium England Route',
    description:
      'Premium-led page for landlords who need broader wording for HMOs, sharers, students, or guarantors.',
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
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="HMO Tenancy Agreement Template"
      heroSubtitle="If the tenancy is more complex, Premium is usually the better route. Use this page to understand why HMOs, sharers, guarantors, and student lets often need broader wording from the start."
      heroMediaSrc="/images/wizard-icons/46-premium.png"
      heroMediaAlt="Illustration showing premium tenancy agreement features"
      primaryCtaLabel="Compare Premium tenancy agreement options"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="Complex lets need a stronger product signal"
      intentHookParagraphs={[
        'Landlords searching for an HMO tenancy agreement template are usually not looking for the same thing as a landlord with a single straightforward household let. They are often dealing with sharers, students, guarantors, extra house rules, or a setup where broader drafting matters from the start. That is why this page should push Premium clearly rather than treating all tenancies as if they sit on the same level of complexity.',
        'This does not mean Standard disappears. It means the funnel should stop pretending complex buyers can be served well by the same light-touch message as everyone else. Premium deserves a dedicated entry page because it speaks to a landlord who is already aware that the tenancy is more operationally involved and wants a route that feels built for that reality.',
        'The goal here is simple: match the intent immediately, explain why Premium is often the better fit, and move the user into the main product page where they can still compare both options before buying.',
      ]}
      currentPositionTitle="Why Premium should lead for HMOs and higher-complexity lets"
      currentPositionParagraphs={[
        'Complex tenancy arrangements create more room for avoidable gaps if the landlord starts from thin wording or a template that was really designed for a simpler let. That is why this page should frame Premium as the stronger starting point for HMOs, shared houses, student occupation, guarantor-backed lets, and other setups where broader drafting matters.',
        'From a conversion perspective, that stronger signal is helpful because it reduces hesitation. Instead of making the landlord decode which product level sounds safer, the page can say clearly that Premium is usually the better choice when the tenancy structure is more demanding.',
      ]}
      sections={[
        {
          title: 'When Premium is the better choice',
          paragraphs: [
            'Premium becomes the stronger route when the landlord already knows the let is not simple. HMOs, multiple sharers, student households, and guarantor-backed arrangements all add practical and drafting complexity that deserves more than the lightest possible agreement path.',
            'That does not mean every complex tenancy is risky in the dramatic sense. It simply means the product should be matched to the reality of the arrangement. A landlord who already knows there will be multiple occupants, more operational detail, or more moving parts does not benefit from a page that hides the Premium route in small print.',
            'By surfacing Premium early, this page gives that landlord permission to choose the more suitable route without feeling upsold for the sake of it. That is good for trust and good for conversion.',
          ],
        },
        {
          title: 'Why a generic HMO template is often a weak answer',
          paragraphs: [
            'A generic HMO or shared-house template can look convenient, but it often leaves the landlord doing most of the hard work. The landlord still has to figure out whether the wording is broad enough, whether the operational detail is clear enough, and whether the overall structure really suits the tenancy they are about to grant.',
            'That is where a Premium-led funnel performs better. Instead of pushing a one-size-fits-all file, it starts from the assumption that complexity deserves a stronger product route. That helps the buyer feel understood and cuts down on the doubt that often follows a cheap template download.',
            'In practice, that means this page should keep repeating a simple idea: if the tenancy is more complex, the stronger route is usually to compare the Premium option directly on the main product page rather than settle for the lightest document because it is quicker to click.',
          ],
        },
        {
          title: 'How this page fits the wider England-first funnel',
          paragraphs: [
            'This page sits at the bottom of the search-intent pyramid. The landlord is no longer just looking for a tenancy agreement in the abstract. They are looking for something that feels suitable for a more demanding setup. That makes them one of the most commercially valuable users in the funnel.',
            'The page therefore should not drift into broad educational copy. It should stay practical, buyer-focused, and product-led. Explain why Premium often fits better, acknowledge England\'s current framework from 1 May 2026, and then get the landlord to the main product page where the purchase decision is close.',
            'That gives Landlord Heaven a better chance of lifting average order value as well as conversion. It matches the buyer to the product level they are more likely to need, which is exactly what a Premium use-case page should do.',
          ],
        },
      ]}
      ctaBlockTitle="Need broader wording for a more complex tenancy?"
      ctaBlockDescription="Use the main product page to compare Standard and Premium, then choose the stronger route for HMOs, sharers, students, guarantors, and higher-complexity England lets."
      faqTitle="HMO tenancy agreement template FAQs"
      faqIntro="Straight answers for landlords who want a clearer Premium route for complex England tenancies."
      faqs={faqs}
      finalCtaTitle="Compare Premium on the main product page"
      finalCtaDescription="If the let is more complex than a straightforward single-household tenancy, move to the main product page and compare the Premium route directly instead of relying on a thin HMO template."
      finalCtaLabel="View Premium-led tenancy agreement options"
      relatedLinks={hmoTenancyAgreementTemplateRelatedLinks}
    />
  );
}
