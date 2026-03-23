import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/rolling-tenancy-agreement');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export const metadata: Metadata = {
  title: 'Rolling Tenancy Agreement England 2026 | Periodic Guide',
  description:
    'Guide to rolling tenancy agreement and periodic tenancy wording in England, updated for the assured periodic framework used for new England agreements from 1 May 2026. Older agreements may not be legally enforceable in the way landlords expect if they rely on outdated wording or structure.',
  keywords: [
    'rolling tenancy agreement',
    'periodic tenancy agreement',
    'england tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function RollingTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Rolling Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/rolling-tenancy-agreement"
        title="Rolling Tenancy Agreement"
        subtitle="Periodic tenancy remains a strong search term. This page supports that demand while aligning landlords with the current England agreement routes designed for the assured periodic framework from 1 May 2026. Older rolling or fixed-term wording may not be legally enforceable in the way landlords expect if it relies on outdated structure."
        primaryCtaLabel="Start Standard periodic agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium periodic agreement"
        secondaryCtaHref={premiumWizardHref}
        introTitle="Periodic tenancy demand now aligns with the live England route"
        introBody={[
          'Of the older England tenancy search terms, rolling tenancy agreement is the closest to the assured periodic model now used in the live self-serve flow.',
          'This page therefore acts as both an explainer and a forward path into the current England agreement routes instead of keeping landlords stuck in older fixed-term wording. Using an agreement that does not reflect the current England framework can lead to weaker protection or complications if issues arise.',
        ]}
        highlights={[
          'Strong alignment between periodic search demand and the current England product',
          'Clear current-law positioning in the CTA path',
          'Avoid relying on outdated rolling or fixed-term wording',
        ]}
        compliancePoints={[
          'Designed for the assured periodic framework used for new England lets from 1 May 2026',
          'Periodic and rolling concepts used as education, not as legacy AST sales language',
          'Older agreements may not be legally enforceable in the way landlords expect if they rely on outdated wording or structure',
        ]}
        faqs={[
          {
            question: 'Can I keep using an older rolling tenancy agreement?',
            answer:
              'While many older tenancy agreements still exist, they may not be legally enforceable in the way landlords expect if they rely on outdated structures or wording. Using an agreement that does not reflect the current England framework can lead to weaker protection or complications if issues arise.',
          },
        ]}
      />
    </div>
  );
}
