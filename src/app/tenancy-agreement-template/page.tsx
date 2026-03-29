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
const standardWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_standard_tenancy_agreement&src=england_tenancy_template&topic=tenancy';
const premiumWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=england_tenancy_template&topic=tenancy';

const faqs = [
  {
    question: 'Is this a downloadable blank tenancy agreement template?',
    answer:
      'No. This page is for landlords who searched for a tenancy agreement template but need a stronger route than a static blank file. Instead of editing a generic download yourself, you answer guided questions and generate the agreement through the live England workflow.',
  },
  {
    question: 'Why does this page use England tenancy agreement wording instead of only saying AST?',
    answer:
      'Because many landlords still search using AST language, but the current England route is better explained using current tenancy agreement wording. This page keeps older search language visible while guiding landlords into the live England agreement path.',
  },
  {
    question: 'Does this page reflect the current England position?',
    answer:
      "Yes. The page is written around the current England position for new lets while still recognising that landlords often search using older AST and Renters' Rights Bill wording.",
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
      'This page is for template-style searches. /products/ast is the main England comparison page for landlords who want to look across the live agreement routes before they choose one.',
  },
  {
    question: 'Can I use this page if the property is outside England?',
    answer:
      'No. This page is for England template-intent traffic. Wales, Scotland, and Northern Ireland use different legal frameworks and different agreement terminology, so landlords should always use the route that matches the property location.',
  },
  {
    question: 'I searched for a rent agreement template or tenancy contract template. Is this still the right page?',
    answer:
      'Yes. Landlords often use tenancy agreement template, rent agreement template, and tenancy contract template interchangeably. This page is built to serve that same England template intent.',
  },
  {
    question: 'What should a modern England tenancy agreement usually include?',
    answer:
      'A modern England tenancy agreement usually needs accurate landlord and tenant details, the property address, rent and payment terms, deposit terms, occupation terms, use restrictions, repair responsibilities, notice provisions, and wording that is suitable for the actual tenancy structure rather than copied blindly from a static template.',
  },
  {
    question: 'Who is this page really for?',
    answer:
      'This page is for England landlords who searched in template language but actually need a stronger creation route, current terminology, and a clear path into the main tenancy agreement product.',
  },
];

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Tenancy Agreement Template for England',
  url: canonicalUrl,
  description:
    'England tenancy agreement template page for landlords who want a guided builder instead of adapting a generic blank file.',
  inLanguage: 'en-GB',
};

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template for England | Guided Builder',
  description:
    'Start with a tenancy agreement template for England, then answer guided questions to build the right agreement, rent agreement, or tenancy contract for the let.',
  keywords: [
    'tenancy agreement template',
    'england tenancy agreement template',
    'landlord tenancy agreement template england',
    'rent agreement template',
    'tenancy contract template',
    'ast template england',
    'assured shorthold tenancy agreement template',
    'renters rights bill tenancy agreement',
    'renters rights act tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement Template for England | Guided Builder',
    description:
      'Use the England tenancy agreement template page to start a guided builder or move to the main England agreement comparison page.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenancy Agreement Template for England | Guided Builder',
    description:
      'England tenancy agreement template page for landlords who want a guided builder instead of a thin blank file.',
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
          headline: 'Tenancy Agreement Template for England',
          description: metadata.description as string,
          url: canonicalUrl,
          datePublished: '2026-03-01',
          dateModified: '2026-03-29',
        })}
      />
      <StructuredData data={webPageSchema} />

      <EnglandTenancyPage
        pagePath="/tenancy-agreement-template"
        title="Tenancy Agreement Template for England"
        subtitle="Start here if you searched for a tenancy agreement template, rent agreement template, or tenancy contract template for England. Instead of adapting a thin blank file, you can answer guided questions and build the right agreement for the let."
        primaryCtaLabel="Start Standard template flow"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium template flow"
        secondaryCtaHref={premiumWizardHref}
        legacyNotice="Landlords still search for AST template, rent agreement template, or tenancy contract template. This page keeps that language visible, but routes you into the current England agreement journey rather than leaving you to edit a generic download on your own."
        introTitle="Looking for a tenancy agreement template in England?"
        introBody={[
          'If you searched for a tenancy agreement template, rent agreement template, tenancy contract template, or an older AST-style template for England, you are usually looking for a reliable starting point for a real tenancy rather than a document to patch together on your own.',
          'That is why this page focuses on a guided route instead of a thin blank file. You answer questions about the property and the let, and the builder helps shape the agreement around the tenancy you are actually creating.',
          'Many landlords still search using older AST language, while others search in broader template language. This page keeps both habits in view without forcing the live England product back into outdated wording.',
          'The page is England-only on purpose. Wales, Scotland, and Northern Ireland use different legal frameworks and different agreement terminology, so a generic UK template is often the wrong place to begin.',
          'If you are ready to start now, use the template flow and build the agreement around the actual tenancy. If you would rather compare the live England routes first, move to /products/ast and review Standard, Premium, Student, HMO / Shared House, and Lodger side by side.',
          'A modern England agreement still needs the basics done properly: the parties, the property, the rent, the deposit terms, occupation terms, practical use restrictions, repair responsibilities, and wording that matches the occupier setup instead of relying on a one-size-fits-all file.',
        ]}
        highlights={[
          'Built for landlords who searched for a tenancy agreement template, rent agreement template, or tenancy contract template',
          'Guided builder instead of a blank file left for manual editing',
          'Keeps older AST wording visible without forcing outdated product labels',
          'England-only wording and route selection',
          'Clear path to /products/ast if you want to compare all England routes first',
          'Explains what a modern England agreement should usually cover',
          'Better fit than adapting a generic UK template',
          'Supports both quick-start and comparison journeys',
        ]}
        compliancePoints={[
          'England-only wording and route selection, with no Wales, Scotland, or Northern Ireland carryover terminology',
          "Current England reform messaging reflected carefully rather than through overclaims",
          'Legacy AST and older Bill wording treated as search-language entry points, not the whole live product story',
          'Template-style searches routed into the live workflow and linked clearly to /products/ast as the main comparison page',
          'Built around the actual tenancy setup instead of pretending a blank template is always enough',
          'Clear next-step journey from template search into either the builder or the broader England comparison page',
        ]}
        keywordTargets={[
          'tenancy agreement template',
          'england tenancy agreement template',
          'rent agreement template',
          'tenancy contract template',
          'assured shorthold tenancy agreement template',
          'renters rights bill tenancy agreement',
        ]}
        faqs={faqs}
      />
    </div>
  );
}
