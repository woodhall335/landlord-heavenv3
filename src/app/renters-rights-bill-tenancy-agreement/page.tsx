import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/renters-rights-bill-tenancy-agreement');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_renters_rights_bill_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Renters Rights Bill Tenancy Agreement | Updated England Agreement',
  description:
    'Looking for a Renters Rights Bill tenancy agreement? This page explains the law is now the Renters’ Rights Act 2025 and links into the updated England Residential Tenancy Agreement flow.',
  keywords: [
    'renters rights bill tenancy agreement',
    'renters rights act tenancy agreement',
    'renters rights compliant tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Renters Rights Bill Tenancy Agreement | Updated England Agreement',
    description:
      'Search-intent page for landlords looking for a Renters Rights Bill tenancy agreement, now updated to the Act wording and England Residential Tenancy Agreement flow.',
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
        title="Renters Rights Bill Tenancy Agreement"
        subtitle="Landlords still search for the Bill phrasing, but the law is now the Renters’ Rights Act 2025. This page directs that search intent into the updated England Residential Tenancy Agreement flow."
        primaryCtaLabel="Start updated England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Read the main England page"
        secondaryCtaHref="/tenancy-agreement"
        introTitle="Bill keyword, Act wording"
        introBody={[
          'This page intentionally targets the keyword renters rights bill tenancy agreement because that is still a live search term used by landlords.',
          'In the body copy and product messaging, we use the correct current wording: Renters’ Rights Act 2025 and England Residential Tenancy Agreement.',
        ]}
        highlights={[
          'Dedicated page for the renters rights bill tenancy agreement search query',
          'Explains the Bill phrasing has become Act wording in current public copy',
          'Routes users into the updated England tenancy wizard rather than legacy AST sales pages',
        ]}
        compliancePoints={[
          'Uses Act terminology in legal/customer copy',
          'Keeps Bill phrasing for search-intent targeting only',
          'Supports the updated England Residential Tenancy Agreement position',
        ]}
        keywordTargets={[
          'renters rights bill tenancy agreement',
          'renters rights act tenancy agreement',
          'renters rights compliant tenancy agreement',
        ]}
      />
    </div>
  );
}
