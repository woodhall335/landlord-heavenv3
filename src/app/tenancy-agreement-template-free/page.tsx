import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement-template-free');
const wizardHref = '/wizard?product=ast_standard&src=tenancy_agreement_template_free&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=tenancy_agreement_template_free&topic=tenancy';

export const metadata: Metadata = {
  title: 'Free Tenancy Agreement Template | England Comparison Guide 2026',
  description:
    'Compare free starter tenancy templates with the current England agreement flow designed for the assured periodic framework from 1 May 2026.',
  keywords: [
    'free tenancy agreement template',
    'tenancy agreement template free',
    'free tenancy agreement england',
    'england tenancy agreement 2026',
    'assured periodic tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Free Tenancy Agreement Template | England Comparison Guide 2026',
    description:
      'Use this England comparison page to understand the difference between free starter documents and the current England agreement flow.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementTemplateFreePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Free Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/tenancy-agreement-template-free"
        title="Free Tenancy Agreement Template"
        subtitle="Use this guide to compare free starter documents with the current England agreement flow before you rely on tenancy wording for a real let."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        introTitle="Free starter documents versus the current England route"
        introBody={[
          'Free starter tenancy documents can still help landlords understand structure, but they often lag behind the wording, notices, and supporting information expected in current England documentation.',
          'This page now compares free-template search intent with the live Landlord Heaven product position: a current England agreement flow designed for the assured periodic framework from 1 May 2026.',
        ]}
        highlights={[
          'Captures free-template search demand without selling outdated AST wording as the live England product story',
          'Positions the live route around the current England framework rather than a thin download',
          'Explains why landlords may want guided wording instead of adapting a bare template',
          'Connects free-template searchers to Standard and Premium England routes',
        ]}
        compliancePoints={[
          'Uses current England tenancy agreement positioning in the live CTA path',
          'Avoids presenting a new fixed-term AST as the default route',
          'Keeps the page useful for comparison search intent while pointing at the live wizard',
        ]}
        keywordTargets={[
          'free tenancy agreement template',
          'tenancy agreement template free',
          'free tenancy agreement england',
          'england tenancy agreement 2026',
        ]}
        faqs={[
          {
            question: 'Is this still a free download page?',
            answer:
              'It is now primarily a comparison guide for landlords searching free-template terms, with the main CTA pointing into the live England self-serve agreement flow.',
          },
          {
            question: 'What is the current England product route?',
            answer:
              'Landlord Heaven now positions the live England route as a current England tenancy agreement flow designed for the assured periodic framework.',
          },
          {
            question: 'Why keep a free-template page live at all?',
            answer:
              'Because free-template queries still have search demand. Keeping this page live helps capture that intent while steering landlords toward current wording and the guided wizard.',
          },
        ]}
      />
    </div>
  );
}
