import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/assured-shorthold-tenancy-agreement-template');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement Template | Legacy AST Explainer',
  description:
    'Legacy AST explainer page for landlords searching assured shorthold tenancy agreement template.',
  keywords: [
    'assured shorthold tenancy agreement template',
    'ast template england',
    'assured shorthold tenancy agreement',
    'england tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement Template | Legacy AST Explainer',
    description:
      'Legacy AST explainer page that routes England landlords into the current Standard and Premium agreement flows.',
    url: canonicalUrl,
    type: 'article',
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
        subtitle="AST is now largely legacy search language for England. Use this explainer page to understand the terminology shift, then move into the current Standard or Premium England agreement route designed for the assured periodic framework from 1 May 2026."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        legacyNotice="Landlord Heaven keeps this AST page live for search demand, but the live England self-serve routes are now sold using current agreement wording designed for the assured periodic framework."
        introTitle="AST search intent, current England route"
        introBody={[
          'Many landlords still search for an assured shorthold tenancy agreement template because that was the familiar England label for years.',
          'From 1 May 2026 new England agreements generally move into the assured periodic model, so the live routes now use current England agreement wording rather than selling a new fixed-term AST in the old sense.',
        ]}
        highlights={[
          'Legacy AST explainer preserved for ranking',
          'Clear routing into the current Standard and Premium England agreement flows',
          'Updated page copy explains why AST is now legacy search terminology',
        ]}
        compliancePoints={[
          'AST wording kept only for legacy query capture while current-law wording leads the product journey',
          'England product messaging now centres on the assured periodic framework from 1 May 2026',
        ]}
      />
    </div>
  );
}
