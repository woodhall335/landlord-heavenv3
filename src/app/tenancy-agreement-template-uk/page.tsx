import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { tenancyAgreementTemplateUkRelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreement-template-uk';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'Is there one tenancy agreement template for the whole UK?',
    answer:
      'No. England, Wales, Scotland, and Northern Ireland use different tenancy frameworks. This page captures UK-wide search intent, but it keeps England dominant because that is where the 1 May 2026 shift changes how landlords think about new tenancy agreements.',
  },
  {
    question: 'Why is England the focus on a UK template page?',
    answer:
      'Because England has the highest commercial search intent in this funnel and the biggest terminology gap between what landlords still search for and how a current tenancy agreement should be positioned. The page still supports the rest of the UK, but England leads the journey.',
  },
  {
    question: 'Does this page still route me to a UK-wide product?',
    answer:
      'Yes. The main product supports Wales, Scotland, and Northern Ireland as well. The reason the CTA points to /products/ast is that it remains the best central comparison page for landlords who want to choose the right tenancy agreement route by jurisdiction.',
  },
  {
    question: 'What is the simplest next step after reading this page?',
    answer:
      'Use the main product page to compare Standard and Premium, then choose the route that matches the property location and the complexity of the let. That keeps the buying journey simple while still respecting jurisdiction differences.',
  },
];

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template UK | England Updated for 1 May 2026',
  description:
    'Compare tenancy agreement template options across the UK, with England-first guidance for the changes from 1 May 2026 and a clear route into the main product page.',
  keywords: [
    'tenancy agreement template uk',
    'uk tenancy agreement',
    'residential tenancy agreement uk',
    'england tenancy agreement',
    'assured periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement Template UK | England Updated for 1 May 2026',
    description:
      'Broad UK tenancy template intent with England-first guidance and a direct route into the main tenancy agreement product.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementTemplateUkPage() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'Tenancy Agreement Template UK', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'Tenancy Agreement Template UK',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="Tenancy Agreement Template UK"
      heroSubtitle="Looking for a UK tenancy agreement template? Start with the property location first, then choose the England-first route that reflects the current position from 1 May 2026."
      heroMediaSrc="/images/wizard-icons/44-terms.png"
      heroMediaAlt="Illustration of tenancy terms and agreement clauses"
      primaryCtaLabel="Compare England tenancy agreement options"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="UK template searchers usually need a jurisdiction answer first"
      intentHookParagraphs={[
        'If you searched for a tenancy agreement template UK, the real question is not just which template to use. It is which legal framework applies to the property. England, Wales, Scotland, and Northern Ireland do not use one interchangeable tenancy document, so the strongest starting point is to identify the location and then move into the right route.',
        'This page is therefore broad enough to capture UK template intent, but it is deliberately England-first. England is where landlords still arrive with AST language, where the shift from 1 May 2026 creates the most confusion, and where the funnel has the biggest commercial upside when the current route is explained clearly.',
        'The goal is not to turn the site England-only. It is to make England dominant while still giving landlords in Wales, Scotland, and Northern Ireland a credible path into the same main product page.',
      ]}
      currentPositionTitle="Why the UK page still needs an England-first message"
      currentPositionParagraphs={[
        'The England change from 1 May 2026 affects how landlords understand the starting point for a new agreement. That makes England the most commercially important jurisdiction to explain clearly, even on a broad UK page. Wales still uses occupation contracts, Scotland still uses private residential tenancy agreements, and Northern Ireland still uses its own private tenancy route.',
        'By putting England first without excluding the rest of the UK, this page can rank for broad template intent and still push the highest-intent users toward the current England product story. That gives the site better commercial focus without confusing landlords in other parts of the UK.',
      ]}
      sections={[
        {
          title: 'Why broad UK template pages often underconvert',
          paragraphs: [
            'A weak UK template page tries to be all things to all landlords. It lists every jurisdiction, uses repetitive wording, and never makes a clear recommendation. The result is traffic without conviction. Users land, skim, and leave because nothing on the page feels like the obvious next step.',
            'A stronger UK template page behaves differently. It acknowledges that the property location controls the agreement route, then gives England the lead because that is where the current search-volume opportunity and the current framework change overlap most strongly. That gives the page a clearer commercial spine.',
            'Landlord Heaven can still support Wales, Scotland, and Northern Ireland from the same central product page. The difference is that the marketing message no longer sounds generic. It starts with the highest-intent and highest-confusion route, then keeps the other jurisdictions visible as secondary but real options.',
          ],
        },
        {
          title: 'How to think about the four jurisdictions',
          paragraphs: [
            'England now needs the clearest explanation because landlords still search with AST language while the product needs to reflect the current assured periodic route for new tenancies from 1 May 2026. That makes England the lead story on this page.',
            'Wales should still be visible, but as an occupation contract route rather than a side note hidden in a long paragraph. Scotland should still be visible as the private residential tenancy route, and Northern Ireland should still be visible as its own private tenancy framework. The point is not to bury those jurisdictions, only to stop them diluting the main commercial message.',
            'That is why the main CTA still goes to /products/ast. It is the simplest place for a landlord to compare options after understanding that the right agreement depends on where the property is and how complex the let will be.',
          ],
        },
        {
          title: 'Why /products/ast is still the best next step',
          paragraphs: [
            'This page is designed to capture the broad search term, but the product page is where the real conversion work happens. It puts Standard and Premium side by side, gives England the strongest current framing, and still keeps the rest of the UK supported lower on the page.',
            'That matters because a landlord who starts with a broad UK query is often still deciding how they want to buy. Some want a quick answer. Some want to compare product levels. Some want reassurance that the page they found is not just another generic template article. /products/ast handles those needs better than a broad landing page ever can on its own.',
            'So the role of this page is to match the search term immediately, explain the current position simply, and then send the visitor to the main commercial destination with more confidence and less friction.',
          ],
        },
      ]}
      ctaBlockTitle="Ready to choose the right tenancy agreement by jurisdiction?"
      ctaBlockDescription="Use the main product page to compare Standard and Premium, see the England-first framing from 1 May 2026, and keep Wales, Scotland, and Northern Ireland available lower in the journey."
      faqTitle="UK tenancy agreement template FAQs"
      faqIntro="Simple answers for landlords who started with a broad UK template search but need the right route for the property location."
      faqs={faqs}
      finalCtaTitle="Move from a broad UK search into the right agreement route"
      finalCtaDescription="Use the main product page to compare the tenancy agreement options, see England positioned around the current framework, and still keep Wales, Scotland, and Northern Ireland in view."
      finalCtaLabel="Open the main tenancy agreement page"
      relatedLinks={tenancyAgreementTemplateUkRelatedLinks}
    />
  );
}
