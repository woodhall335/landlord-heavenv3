import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/assured-shorthold-tenancy-agreement-template');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement Template | AST Legacy Guide',
  description:
    'Legacy AST guide for landlords still searching assured shorthold tenancy agreement template, with a clear route into the current England agreement example page.',
  keywords: [
    'assured shorthold tenancy agreement template',
    'ast template england',
    'ast tenancy agreement template',
    'assured shorthold tenancy agreement',
    'tenancy agreement template england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement Template | AST Legacy Guide',
    description:
      'Understand AST as legacy England terminology, see how newer England wording fits, and move into the current agreement example page.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AssuredShortholdTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Assured Shorthold Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />

      <EnglandTenancyPage
        pagePath="/assured-shorthold-tenancy-agreement-template"
        title="Assured Shorthold Tenancy Agreement Template"
        subtitle="AST is now older wording for many England landlords. This guide explains the change and points you to the current agreement example and product comparison."
        primaryCtaLabel="View the England agreement example"
        primaryCtaHref="/tenancy-agreement-template"
        secondaryCtaLabel="Read the assured periodic guide"
        secondaryCtaHref="/assured-periodic-tenancy-agreement"
        legacyNotice="Landlords still search for AST wording, so this page explains the term and directs them to the current England agreements."
        introTitle="Why this AST page still exists"
        introBody={[
          'Many landlords still search for assured shorthold tenancy agreement template because AST was the familiar label for years. That search behaviour matters, but it should now lead into the current England agreement structure rather than leaving landlords anchored to outdated wording.',
          'The England agreement example page shows a worked document, then explains how Standard and Premium fit ordinary residential lets. Use this guide when the older AST term is the part you need clarified.',
          'If you are comparing the wording shift itself, the assured periodic guide explains why the newer framework matters. If you are trying to inspect the actual agreement structure, move to the England agreement example page instead.',
        ]}
        highlights={[
          'Captures legacy AST template demand without treating AST as the main England destination',
          'Explains where to inspect and compare the current England agreements',
          'Introduces assured periodic wording as the newer framing for current England lets',
          'Keeps the path simple: legacy AST term first, real agreement example next',
        ]}
        compliancePoints={[
          'AST is explained as older terminology rather than the default name for a new England agreement',
          'Current terminology is introduced without obscuring the agreement landlords need',
          'The worked example and comparison links provide clear next steps',
        ]}
        keywordTargets={[
          'assured shorthold tenancy agreement template',
          'ast template england',
          'ast tenancy agreement template',
          'assured shorthold tenancy agreement',
        ]}
        faqs={[
          {
            question: 'Is AST still the main England tenancy product?',
            answer:
              'No. Landlords still use the AST name, but new lets need current England wording. Inspect the worked example and then choose the agreement that fits the property and occupiers.',
          },
          {
            question: 'Why does this page link to the England agreement example first?',
            answer:
              'Because the example page shows the agreement itself. This guide explains the older AST wording, while the example lets you inspect the current document.',
          },
          {
            question: 'Where does assured periodic fit?',
            answer:
              'Assured periodic is the current wording used for new England tenancies. The assured periodic guide explains the term, while the agreement example shows the document itself.',
          },
        ]}
        routeComparison={[
          {
            title: 'England agreement example',
            description:
              'See the sample agreement preview, inspect the clause structure, and then choose Standard or Premium for an ordinary residential let.',
            href: '/tenancy-agreement-template',
            ctaLabel: 'View agreement example',
          },
          {
            title: 'Assured periodic guide',
            description:
              'Read the support page that explains periodic terminology and the broader wording shift without trying to replace the main agreement pages.',
            href: '/assured-periodic-tenancy-agreement',
            ctaLabel: 'Read APT guide',
          },
          {
            title: 'Compare England agreements',
            description:
              'Compare Standard, Premium, Student, HMO / Shared House and Lodger once you are ready to choose.',
            href: '/products/ast',
            ctaLabel: 'Compare England agreements',
          },
        ]}
      />
    </div>
  );
}
