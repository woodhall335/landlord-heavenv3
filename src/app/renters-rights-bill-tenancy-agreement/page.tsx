import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/renters-rights-bill-tenancy-agreement');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export const metadata: Metadata = {
  title: 'Renters Rights Bill Tenancy Agreement | Updated England Agreement',
  description:
    'Looking for a Renters Rights Bill tenancy agreement? This page captures that older search phrase and directs landlords into the current England agreement routes designed for the assured periodic framework from 1 May 2026.',
  keywords: [
    'renters rights bill tenancy agreement',
    'renters rights act tenancy agreement',
    'england tenancy agreement 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Renters Rights Bill Tenancy Agreement | Updated England Agreement',
    description:
      'Search-intent page for landlords looking for a Renters Rights Bill tenancy agreement, now routed into the current England agreement flows.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function RentersRightsBillTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Renters Rights Bill Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/renters-rights-bill-tenancy-agreement"
        title="Renters Rights Bill Tenancy Agreement"
        subtitle="Landlords still search using Bill phrasing, but from 1 May 2026 new England agreements generally move into the assured periodic framework. This page captures the old search language and directs it into the current England agreement routes."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        introTitle="Bill keyword, current England route"
        introBody={[
          'This page intentionally targets the phrase renters rights bill tenancy agreement because that remains a live search term used by landlords.',
          'The product wording itself now focuses on the current England position from 1 May 2026 and routes landlords into the right Standard or Premium agreement flow instead of keeping them in older AST-era language.',
        ]}
        highlights={[
          'Dedicated page for the Bill-era search query',
          'Explains the terminology shift without dropping the search intent',
          'Routes users into the current England agreement flows rather than legacy AST sales pages',
        ]}
        compliancePoints={[
          'Uses current England transition wording in customer copy',
          'Keeps Bill phrasing for search-intent targeting only',
          'Supports the assured periodic framework used for new England lets from 1 May 2026',
        ]}
        keywordTargets={[
          'renters rights bill tenancy agreement',
          'renters rights act tenancy agreement',
          'england tenancy agreement 2026',
        ]}
      />
    </div>
  );
}
