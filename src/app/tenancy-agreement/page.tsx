import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export const metadata: Metadata = {
  title: 'New England Tenancy Agreement | Standard and Premium Routes',
  description:
    'Create an updated England tenancy agreement designed for the assured periodic framework from 1 May 2026.',
  keywords: [
    'new tenancy agreement england',
    'england tenancy agreement assured periodic',
    'renters rights act tenancy agreement',
    'current england tenancy agreement',
    'england tenancy agreement 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'New England Tenancy Agreement | Standard and Premium Routes',
    description:
      'Create an updated England tenancy agreement designed for the assured periodic framework from 1 May 2026 instead of relying on outdated wording or structure.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/tenancy-agreement"
        title="New Tenancy Agreement England"
        subtitle="Create an updated England tenancy agreement designed for the assured periodic framework from 1 May 2026. Older agreements may be harder to rely on if they use outdated wording or structure, so start with Standard for straightforward lets or move to Premium when the household or risk profile is more complex."
        primaryCtaLabel="Start Standard tenancy agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium tenancy agreement"
        secondaryCtaHref={premiumWizardHref}
        introTitle="New tenancy agreement for England"
        introBody={[
          'If you need a new tenancy agreement for a property in England, this is the main Landlord Heaven route for a standard new let.',
          'Landlords still search using AST language, but from 1 May 2026 new England agreements generally move into the assured periodic model. Older agreements may be harder to rely on if they use outdated wording or structure, so this page uses current England wording instead of selling a new fixed-term AST in the old sense.',
        ]}
        highlights={[
          'Updated England agreement route for standard new lets',
          'Current England tenancy agreement wording',
          'Avoid relying on outdated wording or structure',
          'Guided setup with preview before payment',
        ]}
        compliancePoints={[
          "Designed to reflect the Renters' Rights Act changes from 1 May 2026",
          'Built for the assured periodic framework used for new England lets',
          'Using wording that does not reflect the current England framework can lead to weaker protection or complications if issues arise',
          'AST kept only as legacy search language, not the live product framing',
        ]}
        faqs={[
          {
            question: 'Is this page for a new tenancy agreement in England?',
            answer:
              'Yes. This is the main Landlord Heaven page for a standard new tenancy agreement in England.',
          },
          {
            question: 'Is this still an AST?',
            answer:
              'Landlords still search using AST language, but the live route is now framed as an England tenancy agreement designed for the assured periodic framework from 1 May 2026 rather than as a new fixed-term AST product.',
          },
          {
            question: 'Can I keep using an older tenancy agreement?',
            answer:
              'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise.',
          },
          {
            question: 'What if I need a more complex England agreement?',
            answer:
              'If the property is an HMO, a student let, or a more complex shared setup, the premium route is usually the better fit because it gives you broader wording from the start.',
          },
          {
            question: 'What if the property is not in England?',
            answer:
              'Landlord Heaven also has jurisdiction-specific routes for Wales, Scotland, and Northern Ireland. The agreement should always match where the property is located.',
          },
        ]}
      />
    </div>
  );
}


