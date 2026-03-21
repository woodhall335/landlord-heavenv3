import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/renew-tenancy-agreement-england');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Renew Tenancy Agreement England | Existing Tenancy Update Guide',
  description:
    "England guide to updating tenancy paperwork for existing tenants. Covers auto-rolling written tenancies, the updated Residential Tenancy Agreement flow, and current Renters' Rights compliant positioning.",
  keywords: [
    'renew tenancy agreement england',
    'update tenancy agreement landlord',
    'existing tenancy agreement england',
    'new tenancy agreement existing tenant',
    'renters rights compliant tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Renew Tenancy Agreement England | Existing Tenancy Update Guide',
    description:
      "Understand when England landlords need a new agreement, when existing written tenancies auto-roll, and how the updated Residential Tenancy Agreement flow fits in.",
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
        subtitle="Use this guide when you are updating England tenancy paperwork for an existing tenant, reviewing auto-rolling written tenancies, or deciding whether you need a fresh Residential Tenancy Agreement."
        primaryCtaLabel="Open England tenancy wizard"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View the main England agreement page"
        secondaryCtaHref="/tenancy-agreement"
        introTitle="Existing written tenancies and the updated England model"
        introBody={[
          'Existing written England tenancies generally auto-roll rather than needing a wholesale reissue, so this page now explains the transition position instead of pushing landlords into a new AST or fixed-term sale.',
          "Where a landlord genuinely needs new paperwork, the live self-serve product now uses Residential Tenancy Agreement wording and Renters' Rights compliant England positioning.",
        ]}
        highlights={[
          'Guidance for existing written tenancies that auto-roll rather than restart',
          'Updated England wording for landlords replacing terms or issuing fresh paperwork',
          'Support for the wizard distinction between new agreement, existing written tenancy, and existing verbal tenancy',
          'No live Section 21 or AST-first renewal sales language on the page',
        ]}
        compliancePoints={[
          "Explains the England transition in current Renters' Rights compliant product language",
          'Treats existing written tenancies as a separate workflow from brand-new agreements',
          'Directs landlords into the updated Residential Tenancy Agreement path only where a new document is actually needed',
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
              "If you are replacing the agreement rather than relying on the existing one, Landlord Heaven now routes you into the updated Residential Tenancy Agreement flow for England.",
          },
          {
            question: 'Does this page still promote AST renewals?',
            answer:
              'No. The page has been rewritten around existing-tenancy guidance and the updated England Residential Tenancy Agreement product position.',
          },
        ]}
      />
    </div>
  );
}


