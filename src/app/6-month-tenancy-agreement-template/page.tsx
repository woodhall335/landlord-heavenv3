import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/6-month-tenancy-agreement-template');
const standardAgreementHref = '/standard-tenancy-agreement';
const premiumAgreementHref = '/premium-tenancy-agreement';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: '6 Month Tenancy Agreement Template | Legacy England Explainer',
  description:
    'Legacy 6 month tenancy agreement template guide for England landlords, explaining current assured periodic routes and which pack to use now.',
  keywords: [
    '6 month tenancy agreement',
    '6 month tenancy agreement template',
    'england tenancy agreement',
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
        subtitle="A six-month AST is no longer the default agreement for a new England tenancy. Use this guide to understand the change and choose a current Standard or Premium agreement."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumAgreementHref}
        legacyNotice="Many landlords still recognise the six-month AST format. For a new England tenancy, use current wording designed for the assured periodic framework instead."
        introTitle="From a six-month AST to the current England agreement"
        introBody={[
          'If you were expecting a six-month tenancy agreement, start by checking how the current England framework changes the agreement you should create.',
          'From 1 May 2026 new England agreements generally move into the assured periodic model, so Landlord Heaven now guides landlords into current Standard or Premium routes instead of selling a new 6-month AST in the old sense.',
        ]}
        highlights={[
          'A clear explanation of the older six-month AST wording',
          'Direct routes to the current Standard and Premium agreements',
          'Guidance on choosing an agreement for a new England tenancy',
        ]}
        compliancePoints={[
          'Older six-month wording is explained rather than sold as a new fixed-term AST',
          'Current England wording designed around the assured periodic framework from 1 May 2026',
        ]}
      />
    </div>
  );
}
