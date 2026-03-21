import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/6-month-tenancy-agreement-template');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: '6 Month Tenancy Agreement Template | Legacy England Explainer',
  description:
    'Legacy 6 month tenancy agreement search page for England. The live product is now an updated Residential Tenancy Agreement flow rather than a 6-month AST-first route.',
  keywords: [
    '6 month tenancy agreement',
    '6 month tenancy agreement template',
    'new tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function SixMonthTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: '6 Month Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/6-month-tenancy-agreement-template"
        title="6 Month Tenancy Agreement Template"
        subtitle="This page remains live for search demand, but the current England tenancy product no longer positions a 6-month AST as the main self-serve route."
        primaryCtaLabel="Use updated England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Main England tenancy page"
        secondaryCtaHref="/tenancy-agreement"
        legacyNotice="6-month AST search demand still exists, so this page stays live as an explainer. The live England product now centres on an updated Residential Tenancy Agreement flow."
        introTitle="Short-term query, modern England route"
        introBody={[
          'This page captures landlords searching for 6 month tenancy agreement wording while making the commercial position clear.',
          'The England product itself has moved to Residential Tenancy Agreement positioning updated for the Renters’ Rights Act 2025 flow.',
        ]}
        highlights={[
          'Legacy six-month keyword coverage',
          'Forward CTA into the updated England agreement flow',
          'No live AST-first sales positioning on the page itself',
        ]}
        compliancePoints={[
          'Legacy query coverage only',
          'Updated England product language used in the current CTA path',
        ]}
      />
    </div>
  );
}


