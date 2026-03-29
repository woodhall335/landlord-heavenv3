import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement-template');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_template&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_template&topic=tenancy';

const faqs = [
  {
    question: 'Is this a downloadable blank tenancy agreement template?',
    answer:
      'No. This page is for landlords who searched for a tenancy agreement template but need a stronger route than a static blank file. Instead of editing a generic download yourself, you answer guided questions and generate the agreement through the live England workflow.',
  },
  {
    question: 'Why does this page use Residential Tenancy Agreement wording instead of only saying AST?',
    answer:
      'Because many landlords still search using AST language, but the stronger current public-facing position for new England agreements is Residential Tenancy Agreement wording. This page captures legacy AST search demand while directing landlords into the more current England product route.',
  },
  {
    question: "Does this page reflect the Renters' Rights reforms?",
    answer:
      "Yes. This page is written to reflect current England Renters' Rights reform messaging carefully. It recognises that landlords still search using older AST wording and older Bill wording, but routes that demand into the current England agreement workflow and the main tenancy agreement product at /products/ast.",
  },
  {
    question: "I searched for a Renters' Rights Bill tenancy agreement template. Is this still the right page?",
    answer:
      "Yes. Many landlords still use older Bill wording in search. This page is intended to capture that search behaviour and route it into the current England tenancy agreement journey.",
  },
  {
    question: 'Why should I use this instead of a free tenancy agreement template?',
    answer:
      'Because a static template still leaves the landlord to choose wording, structure, and setup themselves. A guided route is usually stronger for live lets because it helps create the document around the actual tenancy rather than forcing the landlord to adapt a generic blank draft.',
  },
  {
    question: 'What is the difference between this page and /products/ast?',
    answer:
      'This page is a template-intent landing page built for landlords who search in template language. The main core tenancy agreement product route is /products/ast, which should be treated as the stronger main destination for landlords ready to compare or use the full England agreement workflow.',
  },
  {
    question: 'Can I use this page if the property is outside England?',
    answer:
      'No. This page is for England template-intent traffic. Wales, Scotland, and Northern Ireland use different legal frameworks and different agreement terminology, so landlords should always use the route that matches the property location.',
  },
  {
    question: 'Is this page educational as well as commercial?',
    answer:
      'Yes. A strong tenancy agreement template page should explain what template searchers are really looking for, how current England reform messaging affects terminology, why guided generation is usually stronger than editing a blank file, and how the page relates to the main product at /products/ast.',
  },
  {
    question: 'What should a modern England tenancy agreement usually include?',
    answer:
      'A modern England tenancy agreement usually needs accurate landlord and tenant details, the property address, rent and payment terms, deposit terms, occupation terms, use restrictions, repair responsibilities, notice provisions, and wording that is suitable for the actual tenancy structure rather than copied blindly from a static template.',
  },
  {
    question: 'Who is this page really for?',
    answer:
      'This page is for high-intent England landlords who searched for template language but actually need a stronger creation route, better current terminology, and a clear path into the main tenancy agreement product.',
  },
];

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Tenancy Agreement Template 2026',
  url: canonicalUrl,
  description:
    "England tenancy agreement template landing page for landlords looking for a current Residential Tenancy Agreement route aligned with Renters' Rights reform messaging.",
  inLanguage: 'en-GB',
};

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title:
    'Tenancy Agreement Template 2026 | England Residential Tenancy Agreement',
  description:
    'Start with our England tenancy agreement template route and move into a current England agreement designed for the assured periodic framework from 1 May 2026.',
  keywords: [
    '2026 tenancy agreement',
    'tenancy agreement template 2026',
    'new tenancy agreement template england',
    'residential tenancy agreement england',
    'renters rights bill tenancy agreement',
    'renters rights act tenancy agreement',
    'england tenancy agreement template',
    'landlord tenancy agreement template england',
    'ast template england',
    'residential tenancy agreement template',
    'products ast',
    'tenancy agreement product landlord heaven',
    'england tenancy agreement landlord heaven',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title:
      'Tenancy Agreement Template 2026 | England Residential Tenancy Agreement',
    description:
      'Create an updated England Residential Tenancy Agreement from our template-intent route and continue to the main tenancy agreement product at /products/ast.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Tenancy Agreement Template 2026 | England Residential Tenancy Agreement',
    description:
      'Template-style England tenancy agreement search intent routed into the current guided workflow and /products/ast.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={articleSchema({
          headline: 'Tenancy Agreement Template 2026',
          description: metadata.description as string,
          url: canonicalUrl,
          datePublished: '2026-03-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData data={webPageSchema} />

      <EnglandTenancyPage
        pagePath="/tenancy-agreement-template"
        title="2026 Tenancy Agreement Template"
        subtitle="Start here if you searched for a 2026 template, an AST template, or a Renters’ Rights Act-era agreement. This page keeps that legacy search intent visible, but moves landlords into the current England agreement routes designed for the assured periodic framework from 1 May 2026."
        primaryCtaLabel="Start Standard template flow"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium template flow"
        secondaryCtaHref={premiumWizardHref}
        legacyNotice="Many landlords still search for AST template, tenancy agreement template 2026, assured shorthold tenancy template, or Renters’ Rights Bill wording. This page keeps that search intent visible, but routes landlords into the current England agreement paths instead of a thin fixed-term AST template sale."
        introTitle="Looking for a tenancy agreement template in England?"
        introBody={[
          'If you searched for a tenancy agreement template, a 2026 tenancy agreement, a new AST template, an assured shorthold tenancy agreement template, or a Renters’ Rights-era landlord contract for England, this is the right starting point. But a high-intent page like this should not just hand you a thin blank file and hope for the best. The stronger route for most landlords is no longer downloading a static document and editing it manually. It is using a guided England agreement workflow that reflects current product positioning, current landlord search behaviour, and current reform messaging much more clearly than old-style template pages do.',
          'A lot of competing pages in this market are weak because they misunderstand what landlords actually mean when they search for a tenancy agreement template. The phrase sounds simple, but the user intent is often much richer than “give me a blank document.” Many landlords are really asking for a reliable starting point. They want to know they are using the right England agreement route, the right terminology, and a version that makes sense in the current reform climate. They do not necessarily want to become the person who has to manually patch an old file together, compare multiple free documents, and guess which clauses still make commercial sense.',
          'That is why this page needs to do more than chase template keywords. It needs to explain what a tenancy agreement template is really for, why guided generation is usually stronger than static editing, how the current England product language fits alongside legacy AST search language, and why the main tenancy agreement product at /products/ast should still be treated as the clearest core destination for landlords who want the broader England agreement route.',
          'This page also has to do an important search-language job. England landlords still search using AST-led phrases such as assured shorthold tenancy template, AST agreement template, or landlord AST form. Those phrases remain commercially important because real people still use them. But the stronger current public-facing position for new England agreements is Residential Tenancy Agreement wording, supported by current Renters’ Rights reform messaging rather than old AST-first sales copy. That means this page has to hold both ideas at once: the user still searches in older language, while the product itself is being positioned in a more current way.',
          'The strongest SEO landing pages in legal-template markets do exactly that. They meet the searcher where they are, but they do not stay trapped there. They capture the old phrase, explain the current meaning, and then move the visitor toward the right product route. That is exactly what this page should do for tenancy agreement template searches in England.',
          'That also means the page should not behave like a passive download page. It should behave like a template-intent landing page that turns search behaviour into a stronger commercial journey. The primary route is the guided flow for landlords who are ready to start building the agreement. The secondary but very important route is /products/ast, because that is the main tenancy agreement product path and should remain visible for users who want the broader core product page before they commit.',
          'This internal-link logic matters because not every template searcher arrives in the same state of mind. Some are ready to start immediately. Some are still comparing options and want to see the main product framing first. Some searched for template language out of habit and do not yet realise that the better route for a modern England agreement is not a static file at all. A strong page should support all three of those journeys rather than forcing everybody down a single path.',
          'The page also needs to reflect the England reform transition carefully. Searchers still use phrases such as Renters’ Rights Bill tenancy agreement template even where the stronger current language is Renters’ Rights Act messaging or more general reform-era terminology. Searchers still use AST language even when the live England product is better framed through Residential Tenancy Agreement wording. A high-quality page does not get confused by that. It simply recognises that legacy search behaviour and current product positioning are not the same thing, and it uses that difference intelligently.',
          'There is another reason this page needs real depth: many template pages are too vague to rank well or convert well. They say “download your template,” mention a few generic clauses, and then stop. That is not enough for high-intent users and it is not enough to outperform weak legal-template competitors. A stronger page has to explain what a tenancy agreement template actually is, what a modern England tenancy agreement should usually include, why guided generation is often safer than self-editing, what current reform messaging means for terminology, and how the landlord should choose between starting the template flow and visiting /products/ast.',
          'That educational-commercial blend is exactly what better competition pages do. They do not become academic legal essays, but they do enough practical explanation that the user feels guided, not pushed. The landlord should come away knowing why this page exists, why it is stronger than a blank-template page, why the wording may look different from older AST-first sites, and what to do next.',
          'This page also needs to be explicit that it is England-only. That sounds basic, but a surprising number of poor competitors recycle near-identical copy across England, Wales, Scotland, and Northern Ireland and only switch a few labels. That weakens trust, causes confusion, and usually leads to worse SEO and worse conversion. An England template-intent page should look and feel like an England page. It should not sound like a generic UK agreement page with England dropped in as an afterthought.',
          'From a landlord point of view, the biggest weakness of a free static tenancy agreement template is not just that it may be out of date. The bigger issue is that it pushes all of the judgment back onto the landlord. Which sections are still appropriate? What wording should be adjusted? Is the structure right for the actual let? Does the document still match the current England product position the landlord wants to use? Does the landlord now need more detail because the tenancy is more complex than expected? Static files look easy, but they often push hidden work downstream.',
          'A guided product route solves much more of that. Instead of handing the landlord a blank page with generic wording, it helps create the agreement around the specific tenancy. That is usually a much better commercial answer to the search intent behind “tenancy agreement template” than pretending the user only wants a passive free file.',
          'That is why the phrase template on this page should really be understood as route language rather than just file language. The landlord searched using template intent. The page captures that intent. But the stronger outcome is not a thin download. It is a guided England agreement creation path and a clear connection to the main product at /products/ast.',
          'This page should also explain what a modern England tenancy agreement usually needs to do. It should set out the core commercial and operational terms of the let clearly enough that both parties understand the structure of the arrangement. That usually means accurate party details, property details, rent and payment timing, deposit wording, occupation terms, practical use restrictions, repair expectations, and clauses that reflect the actual tenancy setup rather than a generic one-size-fits-all assumption. A strong page does not need to turn that into a legal textbook, but it should explain that the agreement is more than a title and a signature block.',
          'That explanation helps with search intent too. Some users arrive here ready to buy. Others still want reassurance that they are not missing something important by choosing a guided route over a blank template. The page should answer both types of user. It should reassure the research-stage user while still giving the ready-to-act user a clear CTA path.',
          'From a pure SEO perspective, this page should be able to serve a broad cluster of related England searches: tenancy agreement template 2026, england tenancy agreement template, landlord tenancy template england, AST template england, Residential Tenancy Agreement England, and Renters’ Rights tenancy agreement searches. The way to do that well is not by cramming the keywords into headings. It is by writing enough useful content that the page genuinely covers the intent behind those terms.',
          'From a conversion perspective, the page works best when it gives two clean options. The first is the direct template-intent route into the guided builder. That is the primary CTA because most users arriving here still want to start the agreement process. The second is a clear route into /products/ast, because many users will want to view the core tenancy agreement product page before deciding how they want to proceed. Both routes are valuable, and the page should support both without confusion.',
          'A strong category structure always makes room for both the search-led route and the core product route. That is what this page is for. It meets the landlord where they are — searching in template language — and then gives them a more current, more commercial, and more England-specific route than a generic free template ever could.',
          'The page also needs to say clearly what it is not. It is not just a generic “what is a tenancy agreement” article. It is not just a free legal-document repository. It is not just a legacy AST page with a new title. It is a high-intent England landing page for landlords whose search language still sounds like “template,” but whose actual need is a stronger agreement route now.',
          'Ultimately, landlords searching for a tenancy agreement template in England are not really searching for a phrase. They are searching for confidence that they can use the right agreement route for the tenancy they are about to grant. This page should therefore do more than mirror their keywords back to them. It should explain what the template search means in the current market, why guided generation is stronger, how Renters’ Rights reform messaging affects terminology, and why /products/ast is the main product path when the landlord wants the clearest full tenancy agreement destination.',
          'That is what makes this page competition-ready. It does not just capture template traffic. It uses that traffic to support a clearer England product journey, a better internal-link path, a more current terminology position, and a stronger commercial outcome for the landlord who arrives here ready to move forward.'
        ]}
        highlights={[
          'Captures tenancy agreement template and 2026 template-style England search intent',
          'Explains why guided agreement creation is stronger than editing a static blank file',
          'Uses Residential Tenancy Agreement wording while still covering strong AST template demand',
          "Reflects current England Renters' Rights reform messaging throughout the page",
          'Links clearly and repeatedly to /products/ast as the main tenancy agreement product',
          'Supports both quick-start users and landlords who want to compare the broader product route first',
          'Stays England-specific and avoids weak cross-jurisdiction template confusion',
          'Adds real educational depth so the page can compete with thin template-only competitors',
          'Turns template-style searches into stronger commercial product intent',
          'Improves SEO and conversion by making the route purpose much clearer than a basic download page',
        ]}
        compliancePoints={[
          'England-only wording and page purpose, with no Wales, Scotland, or Northern Ireland carryover terminology',
          "Current Renters' Rights reform messaging reflected carefully rather than through brittle overclaims",
          'Legacy AST and older Bill wording treated as search-language entry points, not the whole live product story',
          'Residential Tenancy Agreement framing used for the current England route while preserving AST search capture',
          'Template-intent traffic routed into the live workflow and linked clearly to /products/ast as the main product destination',
          'Commercial positioning kept strong without pretending that a blank template is always sufficient for modern landlord use',
          'Search-intent coverage expanded through useful explanatory copy rather than repetitive keyword stuffing',
          'Clear England-specific next-step journey from template search into either the builder or the main tenancy agreement product',
        ]}
        keywordTargets={[
          'tenancy agreement template 2026',
          'england tenancy agreement template',
          'residential tenancy agreement england',
          'renters rights bill tenancy agreement',
          'products ast',
        ]}
        faqs={faqs}
      />
    </div>
  );
}

