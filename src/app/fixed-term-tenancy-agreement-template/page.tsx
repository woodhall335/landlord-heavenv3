import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/fixed-term-tenancy-agreement-template');
const standardAgreementHref = '/standard-tenancy-agreement';
const premiumAgreementHref = '/premium-tenancy-agreement';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Fixed Term Tenancy Agreement Template | Legacy England Explainer',
  description:
    'Legacy fixed term tenancy agreement template explainer for England landlords, with current assured periodic wording and route choices.',
  keywords: [
    'fixed term tenancy agreement',
    'fixed term tenancy agreement template',
    'england tenancy agreement',
    'fixed term tenancy template england',
    'legacy ast fixed term agreement',
    'assured periodic tenancy agreement',
    'standard tenancy agreement england',
    'premium tenancy agreement england',
    'renters rights act tenancy agreement',
    'landlord tenancy agreement template',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function FixedTermTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Fixed Term Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/fixed-term-tenancy-agreement-template"
        title="Fixed Term Tenancy Agreement Template"
        subtitle="Fixed-term AST wording is familiar to many landlords, but new England tenancies from 1 May 2026 generally use the assured periodic framework."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumAgreementHref}
        legacyNotice="If you are creating a new England tenancy, do not copy an old fixed-term AST. Choose a current Standard or Premium agreement instead."
        introTitle="What replaced the old fixed-term starting point?"
        introBody={[
          'Fixed-term tenancy agreements were the familiar starting point for many England landlords before the 2026 changes.',
          'For a new tenancy, Standard and Premium agreements now use the current assured periodic framework. Choose between them according to the level of management detail you need.',
        ]}
        highlights={[
          'Explains why old fixed-term AST wording is no longer the default',
          'Shows where Standard and Premium differ',
          'Directs new-tenancy landlords to current England agreements',
        ]}
        compliancePoints={[
          'Check whether the tenancy began before or after 1 May 2026',
          'Use an agreement written for the current England framework when creating a new tenancy',
        ]}
      />
    </div>
  );
}
