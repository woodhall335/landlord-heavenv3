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
    'Legacy AST explainer for landlords still searching assured shorthold tenancy agreement template, with a clear route into the main England tenancy agreement template hub.',
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
      'Understand AST as legacy England terminology, see how APT wording now fits the current route, and move into the main tenancy agreement template hub.',
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
        subtitle="AST is now legacy search terminology for many England landlords. Keep this page as your bridge into the modern England tenancy agreement template hub rather than treating it as the final document destination."
        primaryCtaLabel="View the England tenancy agreement template"
        primaryCtaHref="/tenancy-agreement-template"
        secondaryCtaLabel="Read the assured periodic guide"
        secondaryCtaHref="/assured-periodic-tenancy-agreement"
        legacyNotice="This page stays live because landlords still search for AST wording. The live England cluster now treats AST as a legacy search entry point and routes the main template intent through the England tenancy agreement template hub."
        introTitle="Why this AST page still exists"
        introBody={[
          'Many landlords still search for assured shorthold tenancy agreement template because AST was the familiar label for years. That search behaviour matters, but it should now lead into the current England agreement structure rather than leaving landlords anchored to outdated wording.',
          'The main England template hub shows a real agreement example first, then explains how Standard and Premium fit the ordinary-residential route. This AST page works as an educational bridge for legacy terminology, not as the primary owner of broad tenancy agreement searches.',
          'If you are comparing the wording shift itself, the assured periodic guide explains why the newer framework matters. If you are trying to inspect the actual agreement structure, move to the England template hub instead.',
        ]}
        highlights={[
          'Captures legacy AST template demand without treating AST as the main England destination',
          'Explains why the broad England template hub now owns the primary tenancy agreement journey',
          'Introduces assured periodic wording as the newer framing for current England lets',
          'Keeps the path simple: legacy AST term first, real template example next',
        ]}
        compliancePoints={[
          'AST is treated here as legacy search language rather than the live public-facing England product position',
          'Current England terminology is introduced carefully so landlords can understand the transition without losing the route into the right agreement',
          'Primary internal journey now points to /tenancy-agreement-template instead of trying to make this page compete for broad head terms',
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
              'No. AST remains important as legacy search language, but the broad England tenancy agreement template journey now sits on the main hub so landlords can see a real example and then choose the right route.',
          },
          {
            question: 'Why does this page link to the tenancy agreement template hub first?',
            answer:
              'Because the hub is now the primary England template destination. It satisfies the broad template query directly, while this page exists to capture older AST wording and explain the transition.',
          },
          {
            question: 'Where does assured periodic fit?',
            answer:
              'Assured periodic wording is the newer framing for the current England route. The assured periodic support page explains that terminology, but the main template example still lives on the England hub.',
          },
        ]}
        routeComparison={[
          {
            title: 'Main England template hub',
            description:
              'See the sample agreement preview, inspect the clause structure, and then choose Standard or Premium for an ordinary residential let.',
            href: '/tenancy-agreement-template',
            ctaLabel: 'Open main hub',
          },
          {
            title: 'Assured periodic guide',
            description:
              'Read the support page that explains periodic terminology and the broader wording shift without trying to replace the main hub.',
            href: '/assured-periodic-tenancy-agreement',
            ctaLabel: 'Read APT guide',
          },
          {
            title: 'England route selection',
            description:
              'Compare Standard, Premium, Student, HMO / Shared House, and Lodger once you are ready to choose the route that fits the property.',
            href: '/products/ast',
            ctaLabel: 'Compare routes',
          },
        ]}
      />
    </div>
  );
}

