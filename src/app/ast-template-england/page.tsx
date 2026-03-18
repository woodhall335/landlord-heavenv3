import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/ast-template-england');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_ast_template_england&topic=tenancy';

export const metadata: Metadata = {
  title: 'AST Template England | Legacy Search Page For Updated Agreement',
  description:
    'Legacy AST template England search page that now points landlords into the updated Residential Tenancy Agreement flow.',
  keywords: [
    'ast template england',
    'assured shorthold tenancy template england',
    'residential tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function ASTTemplateEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'AST Template England', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="AST Template England"
        subtitle="This legacy England search page remains live for AST template demand, but the current product route is the updated Residential Tenancy Agreement flow."
        primaryCtaLabel="Use updated England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="See England landing page"
        secondaryCtaHref="/tenancy-agreements/england"
        legacyNotice="AST template England remains a live search term, but Landlord Heaven now positions the live England product as a Residential Tenancy Agreement."
        introTitle="Template query, modern commercial route"
        introBody={[
          'We retain this page to capture AST template England search intent without continuing to sell ASTs as the live England self-serve product.',
          'The main CTA routes users into the updated England wizard and newer compliance language.',
        ]}
        highlights={[
          'Legacy template search coverage',
          'Updated England CTA path',
          'Clear explanation of why the language has changed',
        ]}
        compliancePoints={[
          'Legacy SEO page only',
          'Current England product framed around Residential Tenancy Agreement wording',
        ]}
      />
    </div>
  );
}
