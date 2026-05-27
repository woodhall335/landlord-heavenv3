import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
  pricingItemListSchema,
} from '@/lib/seo/structured-data';

const pagePath = '/compare/tenancy-agreement-options-england';
const canonicalUrl = getCanonicalUrl(pagePath);

const tenancyOptions = [
  {
    label: 'Standard',
    href: '/standard-tenancy-agreement',
    sku: 'england_standard_tenancy_agreement' as const,
    fit: 'Ordinary whole-property residential lets in England where you need the usual agreement and setup documents.',
  },
  {
    label: 'Premium',
    href: '/premium-tenancy-agreement',
    sku: 'england_premium_tenancy_agreement' as const,
    fit: 'Landlords who want fuller wording on access, reporting, repairs, and hand-back built from their management facts.',
  },
  {
    label: 'Student',
    href: '/student-tenancy-agreement',
    sku: 'england_student_tenancy_agreement' as const,
    fit: 'Student sharers, guarantors, replacements, and end-of-term move-out handling with the supporting records kept together.',
  },
  {
    label: 'HMO / Shared House',
    href: '/hmo-shared-house-tenancy-agreement',
    sku: 'england_hmo_shared_house_tenancy_agreement' as const,
    fit: 'HMO or shared-house occupation with house rules, communal area wording, and shared-house management records.',
  },
  {
    label: 'Lodger',
    href: '/lodger-agreement',
    sku: 'england_lodger_agreement' as const,
    fit: 'Resident-landlord room lets where the occupier shares the landlord home and the house rules need to be clear.',
  },
];

const faqs = [
  {
    question: 'Which tenancy agreement should I use for a normal England let?',
    answer:
      'Use the Standard agreement for an ordinary whole-property residential tenancy. Choose Premium if you want fuller management wording.',
  },
  {
    question: 'Do I need the HMO agreement for shared occupation?',
    answer:
      'Use the HMO / Shared House agreement where the setup involves shared facilities, communal areas, or house rules that need clearer wording.',
  },
  {
    question: 'Is a lodger agreement the same as a tenancy agreement?',
    answer:
      'No. A lodger agreement is for resident-landlord room lets where the occupier shares the landlord home.',
  },
];

export const metadata: Metadata = {
  title: 'Which Tenancy Agreement Do I Need? England Options Compared',
  description:
    'Compare Standard, Premium, Student, HMO / Shared House, and Lodger agreements for England landlords. Choose the paperwork that matches the let.',
  keywords: [
    'which tenancy agreement do i need',
    'tenancy agreement options england',
    'compare tenancy agreements',
    'landlord tenancy agreement pack',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement Options England',
    description:
      'Compare England tenancy agreement products and choose Standard, Premium, Student, HMO / Shared House, or Lodger.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function TenancyAgreementOptionsComparisonPage() {
  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Options England', url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={pricingItemListSchema(
          tenancyOptions.map((option) => ({
            sku: option.sku,
            url: option.href,
            description: `Solicitor-approved ${option.label} tenancy agreement for England landlords. ${option.fit}`,
          }))
        )}
      />

      <UniversalHero
        badge="Compare"
        title="Which Tenancy Agreement Do I Need?"
        subtitle="Choose based on how the property is actually being let: ordinary tenancy, fuller management wording, students, shared house, or lodger."
        primaryCta={{ label: 'Choose my tenancy agreement', href: '/products/ast' }}
        secondaryCta={{ label: 'View Free Samples', href: '/samples' }}
        mediaSrc="/images/wizard-icons/10-signing.png"
        mediaAlt="Tenancy agreement comparison documents"
        showReviewPill
        showTrustPositioningBar
        trustPositioningPreset="ast"
        trustPositioningHeadline="Choose the right England agreement before you start, then preview the documents before payment."
      />

      <Container className="py-12 md:py-16">
        <section className="rounded-lg border border-[#E8E1D7] bg-white p-6">
          <h2 className="text-3xl font-bold text-[#141B2D]">Start with the occupier setup</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#546075]">
            Start with how the property will be occupied. A solicitor is better for bespoke disputes; a cheap template may be enough for very simple cases, but it will not check whether the agreement matches the tenancy you are setting up.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {tenancyOptions.map((option) => (
              <Link key={option.href} href={option.href} className="rounded-lg border border-[#E8E1D7] p-4 hover:border-[#7C3AED]">
                <span className="block text-lg font-semibold text-[#141B2D]">{option.label}</span>
                <span className="mt-2 block text-sm leading-6 text-[#546075]">{option.fit}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-lg border border-[#E8E1D7] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F2FF] text-[#2A2161]">
              <tr>
                <th className="p-4">If the let is...</th>
                <th className="p-4">Use this agreement</th>
                <th className="p-4">Next step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D7] text-[#546075]">
              {tenancyOptions.map((option) => (
                <tr key={option.href}>
                  <td className="p-4">{option.fit}</td>
                  <td className="p-4 font-semibold text-[#141B2D]">{option.label}</td>
                  <td className="p-4">
                    <Link href={option.href} className="font-semibold text-primary hover:underline">
                      Build {option.label}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-[#E8E1D7] bg-white p-5">
              <h3 className="font-semibold text-[#141B2D]">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[#546075]">{faq.answer}</p>
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}
