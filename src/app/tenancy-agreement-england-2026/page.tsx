import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { tenancyAgreementEngland2026RelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreement-england-2026';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'Do I always need a brand-new tenancy agreement after 1 May 2026?',
    answer:
      'No. If the tenancy already started before 1 May 2026, you will not usually start again with a new agreement. Depending on the tenancy, you may instead need to provide updated written information.',
  },
  {
    question: 'Who is this page really for?',
    answer:
      'This page is for England landlords who are unsure whether the 1 May 2026 change means they need a new agreement, a new route, or simply clearer guidance. It is designed to reduce confusion quickly and move the user to the main product page.',
  },
  {
    question: 'Why does this page not give a full legal decision tree?',
    answer:
      'Because its job is to clarify the broad position in plain English and keep the buying journey moving. The page explains the difference between new tenancies and older tenancies without turning into a solicitor-style memo.',
  },
  {
    question: 'What should I do if I am creating a brand-new England tenancy now?',
    answer:
      'Use the current England route on the main product page. That is where the five England agreement options are presented around the assured periodic starting point, with clearer product framing than an older AST-led page.',
  },
];

export const metadata: Metadata = {
  title: 'Do I Need a New Tenancy Agreement After 1 May 2026? | England Guide',
  description:
    'England guide to whether you need a new tenancy agreement after 1 May 2026, with a clear route into the current product page.',
  keywords: [
    'do i need a new tenancy agreement after 1 May 2026',
    'tenancy agreement england 2026',
    'renters rights act tenancy agreement england',
    'england tenancy transition 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Do I Need a New Tenancy Agreement After 1 May 2026? | England Guide',
    description:
      'Transition-focused England page that clarifies the 1 May 2026 change and routes landlords into the main tenancy agreement product.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementEngland2026Page() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'England Tenancy Agreement 2026', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'Do I Need a New Tenancy Agreement After 1 May 2026?',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="Do I Need a New Tenancy Agreement After 1 May 2026?"
      heroSubtitle="England landlords often do not need to start from scratch. This page explains the broad transition position and then points you to the current product route for new agreements."
      heroMediaSrc="/images/wizard-icons/11-calendar-timeline.png"
      heroMediaAlt="Illustration showing a tenancy timeline and calendar change"
      primaryCtaLabel="See the current England agreement route"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="This is a transition question first, not a template question"
      intentHookParagraphs={[
        'If you are asking whether you need a new tenancy agreement after 1 May 2026, you are probably trying to avoid two problems at once: using the wrong document for a new tenancy or unnecessarily replacing an older tenancy that should really be handled as a transition case instead.',
        'That is why this page matters. It is designed for landlords who are confused by the change, not for lawyers trying to build a full legal flowchart. The job here is to make the broad position easy to understand and then direct new-agreement users into the current England-first product page.',
        'The key point is simple: if the tenancy already started before 1 May 2026, you will not usually start again with a new agreement. Depending on the tenancy, you may instead need to provide updated written information.',
      ]}
      currentPositionTitle="What changed, and why landlords are asking this question"
      currentPositionParagraphs={[
        'Before 1 May 2026, many landlords thought about the agreement journey in AST terms. After that date, the starting point for new England tenancies is framed around the assured periodic route. That creates a practical difference between a landlord creating a fresh agreement now and a landlord managing a tenancy that already existed before the change.',
        'The confusion comes from the fact that both groups often search the same way. They type in tenancy agreement, AST, new agreement, renewal, or update terms without knowing whether the better answer is a new product journey or a transition explanation. This page is built to catch that confusion and simplify the next step.',
      ]}
      sections={[
        {
          title: 'When the answer is usually "use the new route"',
          paragraphs: [
            'If you are creating a new private tenancy in England after 1 May 2026, the commercial answer is usually straightforward: start with the current England agreement route. That keeps the wording, product framing, and buying journey aligned with the present framework instead of forcing the landlord to reverse-engineer the change from older assumptions.',
            'This is where the main product page becomes the right destination. It compares Standard, Premium, Student, HMO / Shared House, and Lodger routes, explains the current position clearly, and helps the landlord choose the level of cover that fits the property and household setup. For a new let, that is far more useful than staying on a transition explainer page for too long.',
            'In other words, the page should reassure the landlord quickly and then get out of the way. Once the user understands that a brand-new tenancy should start on the current route, the best next step is to view the product options and move toward purchase.',
          ],
        },
        {
          title: 'When the answer is usually "do not restart the tenancy"',
          paragraphs: [
            'If the tenancy already started before 1 May 2026, landlords often assume they need to rip up the old arrangement and begin again. In many cases that is not the broad position this page should push. The safer message is that you will not usually start again with a new agreement, and depending on the tenancy you may instead need to provide updated written information.',
            'That short explanation is important for conversion too. It reduces wasted clicks from landlords who are researching a transition issue rather than buying a new agreement today. It also builds trust by showing that Landlord Heaven is not treating every tenancy as a sale that must start from zero.',
            'Once the page has done that job, it can still convert well by pointing landlords back to the product page for the current route, where they can compare the England agreement options for genuinely new tenancies or understand the broader product offer more clearly.',
          ],
        },
        {
          title: 'Why this page should stay simple',
          paragraphs: [
            'A strong transition page should not try to become a solicitor-style note covering every possible branch. That would slow the user down and weaken the commercial outcome. Instead, the page should state the broad position plainly, use the human-readable date 1 May 2026 prominently, and point landlords toward the product page once they know whether they are dealing with a new tenancy or an older one.',
            'That simplicity helps with search intent as well. A landlord searching this question usually wants clarity fast. They want to know whether they are about to make an avoidable mistake, not read a dense wall of legislation. The page should therefore prioritise readability, confidence, and next-step clarity.',
            'That makes this route highly valuable in the funnel. It catches confusion traffic that might otherwise bounce, turns it into trust, and then routes users either into the product journey or away from the wrong buying assumption before frustration sets in.',
          ],
        },
      ]}
      ctaBlockTitle="Need the current England route for a brand-new tenancy?"
      ctaBlockDescription="Use the main product page to compare the five England agreement routes, see the assured periodic starting point clearly, and avoid using outdated wording for a new agreement."
      faqTitle="England tenancy agreement 2026 FAQs"
      faqIntro="Simple transition answers for landlords asking what changed from 1 May 2026 and whether they need a new agreement."
      faqs={faqs}
      finalCtaTitle="Move from transition confusion to the right next step"
      finalCtaDescription="If you are creating a new England tenancy, use the main product page to compare the current agreement options. If you are dealing with an older tenancy, use that same page to orient yourself around the current route while keeping the transition distinction in view."
      finalCtaLabel="Open the England-first product page"
      relatedLinks={tenancyAgreementEngland2026RelatedLinks}
    />
  );
}
