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
    'Legacy 6 month tenancy agreement search page for England.',
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
        subtitle="This page remains live for search demand, but the current England agreement routes no longer sell a new 6-month AST as the default self-serve product."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumAgreementHref}
        legacyNotice="6-month AST search demand still exists, so this page stays live as an explainer. The live England product now centres on current wording designed for the assured periodic framework."
        introTitle="Short fixed-term search, modern England route"
        introBody={[
          'This page captures landlords searching for 6 month tenancy agreement wording while making the current product position clear.',
          'From 1 May 2026 new England agreements generally move into the assured periodic model, so Landlord Heaven now guides landlords into current Standard or Premium routes instead of selling a new 6-month AST in the old sense.',
        ]}
        highlights={[
          'Legacy six-month keyword coverage',
          'Forward CTA into the current England agreement routes',
          'No live AST-first sales positioning on the page itself',
        ]}
        compliancePoints={[
          'Legacy query coverage only',
          'Current England wording designed around the assured periodic framework from 1 May 2026',
        ]}
      />
    </div>
  );
}
