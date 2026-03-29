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
  title: 'What Is an Assured Periodic Tenancy Agreement? | England Guide',
  description:
    'Plain-English guide to what an assured periodic tenancy agreement means in England and when to move into the main agreement comparison page.',
  keywords: [
    'assured periodic tenancy agreement',
    'what is an assured periodic tenancy agreement',
    'england tenancy agreement',
    'ast vs assured periodic',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'What Is an Assured Periodic Tenancy Agreement? | England Guide',
    description:
      'Plain-English England guide to the assured periodic route, with a clear CTA into the main tenancy agreement comparison page.',
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
        headline: 'What Is an Assured Periodic Tenancy Agreement?',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="What Is an Assured Periodic Tenancy Agreement?"
      heroSubtitle="Landlords now see this phrase more often when comparing new England tenancy agreements. This page explains what it means, why it matters from 1 May 2026, and where to go next if you are choosing an agreement."
      heroMediaSrc="/images/wizard-icons/10-signing.png"
      heroMediaAlt="Illustration of a tenancy agreement being signed"
      primaryCtaLabel="Compare England agreement options"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="Start with the term, then move to the right agreement"
      intentHookParagraphs={[
        'If you searched for assured periodic tenancy agreement, you are usually trying to work out whether this is the current England route for a new tenancy. In plain English, the answer is yes: it is the wording now used for the main England route for a straightforward new let.',
        'Most landlords do not need a theory lesson. They need to know what the phrase means, whether it fits the tenancy they are creating, and how to move from that understanding into the right agreement.',
        'This page therefore keeps the explanation short and practical. Once the terminology makes sense, the next step is to compare the England agreement options and choose the route that fits the property.',
      ]}
      currentPositionTitle="Why landlords are seeing this wording now"
      currentPositionParagraphs={[
        'For new England tenancies from 1 May 2026, the starting point is no longer best described using older fixed-term AST language. Assured periodic wording is the clearer way to describe the current route for a new let.',
        'Older AST language still appears in searches and in day-to-day conversation, but the job of this page is simply to translate the newer phrase into something useful. Once you understand the label, you can move on to choosing the right agreement.',
      ]}
      sections={[
        {
          title: 'What the phrase means in practice',
          paragraphs: [
            'An assured periodic tenancy agreement is the main England agreement route for a straightforward new let. It describes the structure of the tenancy rather than a specialist add-on or a separate premium tier.',
            'In other words, if the property is an ordinary whole-property England let and nothing about the occupier setup pushes you into Student, HMO / Shared House, or Lodger territory, this is usually the starting route you are looking for.',
            'The practical question is not just what the phrase says. It is whether the tenancy is straightforward enough for the baseline route or whether the facts justify Premium or one of the specialist products.',
          ],
        },
        {
          title: 'How it differs from older AST wording',
          paragraphs: [
            'Many landlords still search for AST because that was the language they learned first. Assured periodic wording is not there to make things harder; it is there to describe the current England route more accurately.',
            'That means older AST search language and newer assured periodic language often point toward the same next step. The difference is that assured periodic wording is the clearer label for a new England tenancy created now.',
            'If you arrived here through older terminology, that is fine. The main thing is not to get stuck on the label when the real task is choosing the right agreement for the property.',
          ],
        },
        {
          title: 'What to do next',
          paragraphs: [
            'If you now understand the phrase and simply need the right agreement, go to the main comparison page. That is where Standard, Premium, Student, HMO / Shared House, and Lodger routes are shown side by side.',
            'If the tenancy is a straightforward whole-property England let, the Standard route is usually the best place to begin. If the let is still ordinary residential but needs fuller management wording, Premium is the better fit.',
            'The aim of this page is to remove confusion, not keep you reading forever. Once the wording is clear, the useful next step is to compare the live England routes and start the right one.',
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
