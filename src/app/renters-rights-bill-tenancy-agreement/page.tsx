import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/renters-rights-bill-tenancy-agreement');
const standardAgreementHref = '/standard-tenancy-agreement';
const premiumAgreementHref = '/premium-tenancy-agreement';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Renters Rights Act Tenancy Agreement | England 2026',
  description:
    'Looking for a Renters Rights Act tenancy agreement? Compare current England Standard and Premium agreement routes for post-May 2026 landlord paperwork.',
  keywords: [
    'renters rights bill tenancy agreement',
    'renters rights act tenancy agreement',
    'england tenancy agreement 2026',
    'updated england tenancy agreement',
    'post may 2026 tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Renters Rights Act Tenancy Agreement | England 2026',
    description:
      'Understand what the Renters Rights Act means for new England tenancy agreements and compare the current Standard and Premium options.',
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
        subtitle="The Renters Rights Bill is now an Act. For new England tenancies from 1 May 2026, choose an agreement written for the assured periodic framework."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumAgreementHref}
        introTitle="What landlords need for a new tenancy"
        introBody={[
          'You may still see the change described as the Renters Rights Bill, but the practical question is whether your agreement reflects the rules now in force.',
          'For a new England tenancy, compare Standard and Premium agreements written for the assured periodic framework rather than adapting an old AST.',
        ]}
        highlights={[
          'Explains the change from the Bill to the Act',
          'Clarifies the move away from old fixed-term AST wording',
          'Links directly to current Standard and Premium agreements',
        ]}
        compliancePoints={[
          'Confirm that the rental property is in England',
          'Use the current assured periodic framework for a new England let from 1 May 2026',
          'Review the generated agreement against the actual property and occupier details',
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
