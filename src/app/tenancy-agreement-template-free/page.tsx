import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement-template-free');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Free Tenancy Agreement Template | England Comparison Guide',
  description:
    "Compare free starter tenancy templates with Landlord Heaven's updated England Residential Tenancy Agreement flow and Renters' Rights compliant positioning.",
  keywords: [
    'free tenancy agreement template',
    'tenancy agreement template free',
    'free tenancy agreement england',
    'renters rights compliant tenancy agreement',
    'new tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Free Tenancy Agreement Template | England Comparison Guide',
    description:
      'Use this England comparison page to understand the difference between free starter documents and the updated Residential Tenancy Agreement flow.',
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
        subtitle="Use this guide to compare free starter documents with the updated England Residential Tenancy Agreement flow before you rely on tenancy wording for a real let."
        primaryCtaLabel="Use the updated England flow"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View the 2026 template page"
        secondaryCtaHref="/tenancy-agreement-template"
        introTitle="Free starter documents versus the updated England flow"
        introBody={[
          'Free starter tenancy documents can still help landlords understand structure, but they often lag behind the wording, notices, and supporting information expected in current England documentation.',
          "This page now compares free-template search intent with the live Landlord Heaven product position: a Residential Tenancy Agreement flow updated for the Renters' Rights Act 2025 era.",
        ]}
        highlights={[
          'Captures free template search demand without selling outdated AST wording as current England product language',
          'Positions the live route as a Residential Tenancy Agreement with updated wizard and supporting terms',
          'Explains why landlords may want guided wording instead of adapting a bare template',
          'Connects free-template searchers to the current England tenancy flow',
        ]}
        compliancePoints={[
          "Uses Renters' Rights compliant England product positioning in the live CTA path",
          'Removes Section 21-led sales framing from the England tenancy product story',
          'Keeps the page useful for comparison search intent while pointing at the updated wizard',
        ]}
        keywordTargets={[
          'free tenancy agreement template',
          'tenancy agreement template free',
          'free tenancy agreement england',
          'new tenancy agreement england',
        ]}
        faqs={[
          {
            question: 'Is this still a free download page?',
            answer:
              'It is now primarily a comparison guide for landlords searching free template terms, with the main CTA pointing into the updated England self-serve agreement flow.',
          },
          {
            question: 'What is the current England product called?',
            answer:
              'Landlord Heaven now publicly positions the live England product as a Residential Tenancy Agreement rather than an AST-first workflow.',
          },
          {
            question: 'Why keep a free-template page live at all?',
            answer:
              'Because free-template queries still have search demand. Keeping this page live helps capture that intent while steering landlords toward the updated England wording and wizard.',
          },
        ]}
      />
    </div>
  );
}


