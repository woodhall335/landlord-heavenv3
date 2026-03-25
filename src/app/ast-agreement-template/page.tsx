import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { astAgreementTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/ast-agreement-template';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'Is an AST agreement template still the right search for England landlords?',
    answer:
      'Many landlords still search for an AST agreement template because that used to be the familiar label. For new England tenancies from 1 May 2026, the stronger starting point is the current assured periodic route rather than selling the product with older AST assumptions.',
  },
  {
    question: 'Why does this page point me to /products/ast?',
    answer:
      'Because this page is built to capture AST search intent and move landlords into the main England-first product page, where the Standard and Premium options are explained more clearly and the current framework is presented directly.',
  },
  {
    question: 'Does this page apply outside England?',
    answer:
      'No. Wales, Scotland, and Northern Ireland all use different tenancy frameworks. This page is intentionally England-first because the shift from 1 May 2026 is the main reason AST searchers need clearer guidance.',
  },
  {
    question: 'What if my tenancy already started before 1 May 2026?',
    answer:
      'In many cases you will not usually start again with a brand-new agreement. Depending on the tenancy, you may instead need to provide updated written information. The main product page explains the current route and gives landlords a better starting point for choosing what to do next.',
  },
];

export const metadata: Metadata = {
  title: 'AST Agreement Template UK | England Updated for 1 May 2026',
  description:
    'Looking for an AST agreement template? This England-first page explains the 1 May 2026 change and routes landlords into the current agreement product.',
  keywords: [
    'ast agreement template',
    'ast template england',
    'assured shorthold tenancy agreement template',
    'england tenancy agreement',
    'assured periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'AST Agreement Template UK | England Updated for 1 May 2026',
    description:
      'Capture AST template search intent, explain the England shift from 1 May 2026, and move into the current tenancy agreement product.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function AstAgreementTemplatePage() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'AST Agreement Template', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'AST Agreement Template UK',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="AST Agreement Template"
      heroSubtitle="Looking for an AST agreement template? For new England tenancies from 1 May 2026, the correct starting point is now an assured periodic tenancy agreement."
      heroMediaSrc="/images/wizard-icons/12-summary-cards.png"
      heroMediaAlt="Illustration showing tenancy agreement options and summary cards"
      primaryCtaLabel="View England agreement options"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="AST is still a common search, but it is no longer the whole England story"
      intentHookParagraphs={[
        'Looking for an AST agreement template? For new England tenancies from 1 May 2026, the correct starting point is now an assured periodic tenancy agreement. That is why this page exists: to meet the search term landlords still use and then move them into the current England route rather than leaving them with an outdated mental model.',
        'A lot of landlords still search with AST language because it is familiar, quick to type, and deeply embedded in old landlord workflows. That search intent is commercially valuable, but the product journey should not stop at that phrase. If a landlord is letting a new private tenancy in England now, they need a page that explains the current position clearly and then takes them to the right product route.',
        'This page therefore captures AST template demand without pretending the live England product is still best described through older AST assumptions. Instead, it explains the shift, keeps the buying journey simple, and points landlords toward the main product page where Standard and Premium options are presented around the current England framework.',
      ]}
      currentPositionTitle="What changed for England landlords from 1 May 2026?"
      currentPositionParagraphs={[
        'For new England tenancies, the product framing needs to reflect the assured periodic route. That does not mean AST has disappeared from search behaviour. It means the product story has to separate the language people still type into Google from the way a current England agreement should be positioned when a landlord is ready to act.',
        'That distinction matters commercially as well as legally. A landlord searching for an AST template often wants speed and reassurance, not a history lesson. The strongest funnel meets that user where they are, explains the current position in plain language, and then gets them to the England-first product page before they wander off to a weak free template.',
      ]}
      sections={[
        {
          title: 'Why AST search intent still matters',
          paragraphs: [
            'AST language still brings in high-intent landlords who are ready to compare, buy, or generate a document straight away. Ignoring that search term would leave valuable traffic on the table. Keeping it alive in the URL, headline, metadata, and FAQ helps Landlord Heaven meet landlords where they already are.',
            'At the same time, the page cannot act like an old AST sales page that assumes the answer is simply a fixed-term agreement download. The safer and stronger commercial move is to explain that many landlords still search using AST language, while the current England route is now presented around the assured periodic starting point.',
            'That is also why this page should work as a bridge rather than a dead-end explainer. It should not trap the user in old terminology. It should capture the query, clarify the current position, and then send the user to /products/ast where the full England-first product story is visible.',
          ],
        },
        {
          title: 'Why old free templates often underperform',
          paragraphs: [
            'A free AST template can look attractive because it feels fast and familiar. In practice, it often shifts all the judgment back onto the landlord. The landlord still has to decide whether the wording, structure, and assumptions fit the tenancy they are actually creating, and whether the document still reflects the current England position from 1 May 2026.',
            'That hidden work creates friction at exactly the wrong point in the funnel. Instead of helping the landlord move forward, a weak template page often sends them into comparison loops, manual edits, and second-guessing. A stronger product page reduces that uncertainty by presenting the current route clearly and helping the user choose Standard or Premium with more confidence.',
            'From a conversion point of view, that is the real job of this page. It is not just to rank for AST template searches. It is to intercept high-intent landlords before they settle for outdated wording or a thin template that still leaves them unsure what to do next.',
          ],
        },
        {
          title: 'How to use this page in the funnel',
          paragraphs: [
            'This page should move landlords in three steps. First, it confirms that AST is a valid search phrase and acknowledges why they arrived here. Second, it explains in plain English that the correct starting point for new England tenancies from 1 May 2026 is the assured periodic route. Third, it gives a clear CTA to the main product page where the Standard and Premium choices sit in a stronger commercial context.',
            'That funnel structure matters because different landlords arrive in different states. Some are ready to buy. Some are still checking whether they need a new document. Some simply want reassurance that they are not using an outdated approach. A good AST template page should support all three without becoming vague or over-legalistic.',
            'The result is a page that ranks for a familiar term, answers the core question quickly, and still behaves like part of a sales system rather than a passive article. That is the right balance for an England-first tenancy funnel designed to turn search traffic into purchases.',
          ],
        },
      ]}
      ctaBlockTitle="Ready to move from AST search language into the current England route?"
      ctaBlockDescription="Use the main tenancy agreement page to compare Standard and Premium options, understand the England position from 1 May 2026, and avoid relying on outdated wording."
      faqTitle="AST agreement template FAQs"
      faqIntro="Clear answers for landlords who still search with AST language but need the current England tenancy route."
      faqs={faqs}
      finalCtaTitle="Compare the current England tenancy agreement options"
      finalCtaDescription="Move from AST search language into the main England-first product page, compare Standard and Premium, and use wording designed for the current framework instead of relying on older template assumptions."
      finalCtaLabel="Compare Standard and Premium options"
      relatedLinks={astAgreementTemplateRelatedLinks}
    />
  );
}
