import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { assuredPeriodicTenancyAgreementRelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/assured-periodic-tenancy-agreement';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'What is an assured periodic tenancy agreement in plain English?',
    answer:
      'It is the current England-first way to describe the starting route for a new tenancy after 1 May 2026. Many landlords still search with AST language, but the live product framing is now built around the assured periodic route.',
  },
  {
    question: 'Why do landlords still search for AST if the product uses assured periodic wording?',
    answer:
      'Because AST is the language many landlords learned first. Search behaviour changes more slowly than product positioning, so a strong funnel needs both: AST for capture, assured periodic for the current England route.',
  },
  {
    question: 'Does this page replace the main product page?',
    answer:
      'No. This page is an explainer and bridge page. Its job is to help landlords understand the new terminology and then move them to /products/ast, where the full England product range is compared properly.',
  },
  {
    question: 'Is assured periodic wording only relevant to England?',
    answer:
      'Yes in this funnel context. Wales, Scotland, and Northern Ireland use different tenancy frameworks. This page exists to help England landlords understand the newer terminology without losing the buying journey.',
  },
];

export const metadata: Metadata = {
  title: 'Assured Periodic Tenancy Agreement | England Explainer',
  description:
    'Learn what an assured periodic tenancy agreement means in England from 1 May 2026 and move into the main product page.',
  keywords: [
    'assured periodic tenancy agreement',
    'what is an assured periodic tenancy agreement',
    'england tenancy agreement',
    'ast vs assured periodic',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Periodic Tenancy Agreement | England Explainer',
    description:
      'Plain-English England explainer for the assured periodic route, with a clear CTA into the main tenancy agreement product.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function AssuredPeriodicTenancyAgreementPage() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'Assured Periodic Tenancy Agreement', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'Assured Periodic Tenancy Agreement',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="Assured Periodic Tenancy Agreement"
      heroSubtitle="This is the current England-first terminology for new tenancies from 1 May 2026, even though many landlords still arrive using older AST search language."
      heroMediaSrc="/images/wizard-icons/10-signing.png"
      heroMediaAlt="Illustration of a tenancy agreement being signed"
      primaryCtaLabel="Compare England agreement options"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="This page translates the new terminology into a buying decision"
      intentHookParagraphs={[
        'If you searched for assured periodic tenancy agreement, you are probably trying to understand the current England route without getting lost in old AST terminology. This page is here to make that easy. It explains what the phrase means, why it matters from 1 May 2026, and where to go next if you are ready to choose an agreement product.',
        'The key commercial opportunity here is educational intent that is close to purchase intent. These users are not casually browsing. They are often one or two steps away from buying, but they need reassurance that the newer terminology maps onto a practical product journey they can actually use.',
        'That is why this page should not stay purely educational. It should explain the concept quickly and then route the user into the main product page where the full England route comparison is easier to understand.',
      ]}
      currentPositionTitle="Why assured periodic wording matters in the England funnel"
      currentPositionParagraphs={[
        'For new England tenancies from 1 May 2026, the product framing has moved away from selling an older AST-style starting point. Assured periodic wording is the clearer way to describe the current route while keeping the buying journey consistent with the present England position.',
        'That does not mean older AST language disappears from the funnel. It means the funnel has to do two jobs at once: capture landlords who still search the old way and educate landlords who are now starting to search using the newer assured periodic wording.',
      ]}
      sections={[
        {
          title: 'Why this term needs a dedicated page',
          paragraphs: [
            'Search terminology changes slowly. Even after a framework shift, landlords keep using the phrases they already know until a new label becomes normal. Assured periodic tenancy agreement is therefore a growing search term that deserves its own clear landing page rather than being hidden inside a longer product page.',
            'From an SEO point of view, that makes the page valuable because it can target a specific educational-intent cluster. From a conversion point of view, it matters because the people searching this phrase are often already aware that something changed and simply want a trustworthy route forward.',
            'That is why the page should behave as a bridge. It should answer the terminology question, explain the shift from 1 May 2026 in plain English, and then move the user to /products/ast so the commercial choice becomes obvious.',
          ],
        },
        {
          title: 'How it differs from AST search intent',
          paragraphs: [
            'AST pages and assured periodic pages serve related but slightly different users. AST searchers usually arrive with old terminology and need to be reoriented. Assured periodic searchers often arrive already aware that the position has changed and want confirmation that they are looking at the current England route.',
            'That difference is useful in the funnel because it lets Landlord Heaven speak more directly to both mindsets. The AST page captures familiarity. The assured periodic page captures current-awareness intent. Both then converge on the same main product page, where the buying decision happens.',
            'This approach is stronger than forcing every user through the same old AST framing. It keeps search capture broad while making the live product story sharper, more current, and easier to trust.',
          ],
        },
        {
          title: 'Why the product page remains the destination',
          paragraphs: [
            'No matter which wording the landlord searched for, the main product page is still where the comparison happens. That page now shows Standard, Premium, Student, HMO / Shared House, and Lodger routes, explains the England-first positioning, and helps the landlord avoid using outdated agreements when the current framework should be reflected more clearly.',
            'This page therefore should not become too self-contained. Its value comes from making the newer terminology understandable and then handing the user off to the commercial page with more confidence than they had when they arrived.',
            'That keeps the funnel tight: one page captures newer terminology, one page captures older AST terminology, and both routes feed the same conversion destination.',
          ],
        },
      ]}
      ctaBlockTitle="Want the current England route, not just the terminology?"
      ctaBlockDescription="Use the main product page to compare the five England agreement routes, see the England-first framing directly, and move from explanation into action."
      faqTitle="Assured periodic tenancy agreement FAQs"
      faqIntro="Short answers for landlords who want to understand the newer England terminology and then move into the right agreement route."
      faqs={faqs}
      finalCtaTitle="Use the current England agreement page"
      finalCtaDescription="Once the assured periodic term makes sense, the next step is simple: compare the live product options and choose the route that fits the property and the complexity of the let."
      finalCtaLabel="Go to the main tenancy agreement page"
      relatedLinks={assuredPeriodicTenancyAgreementRelatedLinks}
    />
  );
}
