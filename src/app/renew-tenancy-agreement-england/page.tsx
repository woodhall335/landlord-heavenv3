import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/renew-tenancy-agreement-england');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Renew Tenancy Agreement England | Existing Tenancy Update Guide',
  description:
    'England guide to updating tenancy paperwork for existing tenants. Covers auto-rolling written tenancies, when a fresh agreement is actually needed.',
  keywords: [
    'renew tenancy agreement england',
    'update tenancy agreement landlord',
    'existing tenancy agreement england',
    'new tenancy agreement existing tenant',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Renew Tenancy Agreement England | Existing Tenancy Update Guide',
    description:
      'Understand when England landlords need a new agreement, when existing written tenancies auto-roll, and how the current Standard and Premium routes fit in.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function RenewTenancyAgreementEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Renew Tenancy Agreement England', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/renew-tenancy-agreement-england"
        title="Renew Tenancy Agreement England"
        subtitle="Use this guide when you are updating England tenancy paperwork for an existing tenant, reviewing auto-rolling written tenancies, or deciding whether you need fresh paperwork designed for the current framework."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        introTitle="Existing written tenancies and the current England model"
        introBody={[
          'Existing written England tenancies generally auto-roll rather than needing a wholesale reissue, so this page explains the transition position instead of pushing landlords into a new AST or fixed-term sale.',
          'Where a landlord genuinely needs new paperwork, the live self-serve routes now use current England wording designed for the assured periodic framework from 1 May 2026.',
        ]}
        highlights={[
          'Guidance for existing written tenancies that auto-roll rather than restart',
          'Updated England wording for landlords replacing terms or issuing fresh paperwork',
          'Support for the distinction between new agreements and existing written tenancies',
          'No live Section 21 or AST-first renewal sales language on the page',
        ]}
        compliancePoints={[
          'Explains the England transition in current product language',
          'Treats existing written tenancies as a separate workflow from brand-new agreements',
          'Directs landlords into the current Standard or Premium route only where a new document is actually needed',
        ]}
        keywordTargets={[
          'renew tenancy agreement england',
          'update tenancy agreement landlord',
          'existing tenancy agreement england',
          'new tenancy agreement existing tenant',
        ]}
        faqs={[
          {
            question: 'Do I always need a new agreement for an existing tenant?',
            answer:
              'No. Existing written England tenancies commonly continue on a rolling basis, so many landlords need transition information rather than a full replacement agreement.',
          },
          {
            question: 'What if I do want to issue fresh paperwork?',
            answer:
              'If you are replacing the agreement rather than relying on the existing one, Landlord Heaven now routes you into the current Standard or Premium England agreement flow.',
          },
          {
            question: 'Does this page still promote AST renewals?',
            answer:
              'No. The page is built around existing-tenancy guidance and the current England product position rather than old AST renewal language.',
          },
        ]}
      />
    </div>
  );
}
