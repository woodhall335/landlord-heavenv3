import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/ast-tenancy-agreement-template');
const wizardHref =
  '/wizard?product=ast_standard&jurisdiction=england&src=seo_ast_tenancy_agreement_template&topic=tenancy';

export const metadata: Metadata = {
  title: 'AST Tenancy Agreement Template | Legacy England Search Guide',
  description:
    "Legacy England AST template guide for landlords who still search old terminology. The live Landlord Heaven product is now a Renters' Rights compliant Residential Tenancy Agreement flow.",
  keywords: [
    'ast tenancy agreement template',
    'ast template england',
    'assured shorthold tenancy template',
    'renters rights compliant tenancy agreement',
    'new tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'AST Tenancy Agreement Template | Legacy England Search Guide',
    description:
      "AST remains a legacy England search term, but the live Landlord Heaven route is now the updated Residential Tenancy Agreement flow.",
    url: canonicalUrl,
    type: 'website',
  },
};

export default function AstTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'AST Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="AST Tenancy Agreement Template"
        subtitle="This legacy England search page stays live for AST template demand, but the current Landlord Heaven product is the updated Residential Tenancy Agreement flow."
        primaryCtaLabel="Start England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View the updated product page"
        secondaryCtaHref="/tenancy-agreement"
        legacyNotice="AST is now legacy England search terminology on Landlord Heaven. We keep this page live for rankings, but we no longer sell ASTs as the live England self-serve route."
        introTitle="Legacy AST query, updated England route"
        introBody={[
          "Landlords still search for an AST tenancy agreement template, so this page preserves that search intent while redirecting users into the live England Residential Tenancy Agreement flow.",
          "The body copy now reflects the Renters' Rights Act 2025 product position: new England agreements are sold through the updated Residential Tenancy Agreement path rather than AST-first language.",
        ]}
        highlights={[
          'Legacy AST query coverage retained for England search demand',
          'Forward CTA into the updated Residential Tenancy Agreement wizard',
          'No live AST-first England sales positioning on the page itself',
          "Aligned to Landlord Heaven's Renters' Rights compliant public positioning",
        ]}
        compliancePoints={[
          'Explains that AST is legacy terminology for England searchers',
          'Routes users into the updated England tenancy wizard instead of selling ASTs directly',
          "Supports the wider Renters' Rights compliant England tenancy rollout",
        ]}
        keywordTargets={[
          'ast tenancy agreement template',
          'ast template england',
          'assured shorthold tenancy template',
          'new tenancy agreement england',
        ]}
        faqs={[
          {
            question: 'Why does this page still say AST?',
            answer:
              'Because AST remains a meaningful England search term. The page exists to capture that demand while explaining that the live Landlord Heaven route now uses Residential Tenancy Agreement wording.',
          },
          {
            question: 'Is the live England product still sold as an AST?',
            answer:
              "No. The live England self-serve product is now positioned as a Residential Tenancy Agreement updated for the Renters' Rights Act 2025 era.",
          },
          {
            question: 'Where should I go to create the current England agreement?',
            answer:
              'Use the CTA on this page to enter the updated England tenancy wizard, which now uses Residential Tenancy Agreement terminology throughout the public flow.',
          },
        ]}
      />
    </div>
  );
}
