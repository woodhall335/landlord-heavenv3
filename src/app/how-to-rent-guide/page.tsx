import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { Container } from '@/components/ui/Container';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { CommercialBridge } from '@/components/marketing/CommercialBridge';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { howToRentGuideFAQs } from '@/data/faqs';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'How to Rent Guide 2026: Compliance Check Before Notice',
  description:
    'Check the latest How to Rent guide before a new tenancy or possession notice, then choose the right tenancy agreement or notice pack with evidence of service.',
  keywords: [
    'how to rent guide',
    'how to rent checklist',
    'how to rent landlord',
    'how to rent guide 2026',
    'how to rent section 21',
    'prescribed information tenants',
  ],
  openGraph: {
    title: 'How to Rent Guide 2026: Compliance Check Before Notice',
    description:
      'Landlord guide to the latest How to Rent PDF, evidence of service, and the right next step before a tenancy or possession notice.',
    type: 'article',
    url: getCanonicalUrl('/how-to-rent-guide'),
  },
  alternates: {
    canonical: getCanonicalUrl('/how-to-rent-guide'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'How to Rent Guide', url: '/how-to-rent-guide' },
];
const noticeOnlyHref = '/products/notice-only';
const tenancyProductHref = '/products/ast';

const actionChooserItems = [
  {
    title: 'Increase rent',
    body: 'Check whether the proposed rent is supportable before serving notice.',
    href: '/tools/rent-increase-challenge-checker',
    label: 'Check rent increase risk',
    product: undefined,
  },
  {
    title: 'Serve notice',
    body: 'Prepare the notice route, grounds, dates, and service record.',
    href: '/products/notice-only',
    label: 'Create my Section 8 notice',
    product: 'notice_only',
  },
  {
    title: 'Create tenancy agreement',
    body: 'Use an England tenancy pack that fits the property and letting setup.',
    href: '/products/ast',
    label: 'Create tenancy agreement',
    product: 'ast_standard',
  },
  {
    title: 'Recover rent arrears',
    body: 'Turn unpaid rent into a structured money claim pack.',
    href: '/products/money-claim',
    label: 'Create money claim pack',
    product: 'money_claim',
  },
] as const;

export default function HowToRentGuidePage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <SeoLandingWrapper
        pagePath="/how-to-rent-guide"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <UniversalHero
          badge="Landlord Guide"
          title="How to Rent compliance check before notice or tenancy"
          subtitle="Check the latest How to Rent guide, keep evidence of service, and choose the right tenancy agreement or notice pack before the file is relied on."
          primaryCta={{ label: 'Create tenancy agreement', href: tenancyProductHref }}
          secondaryCta={{ label: 'Start Notice Only', href: noticeOnlyHref }}
          align="center"
          showTrustPositioningBar
        />

        <section className="border-b border-gray-200 bg-white py-8">
          <Container>
            <div className="mx-auto max-w-4xl">
              <SeoPageContextPanel pathname="/how-to-rent-guide" />
              <CommercialBridge
                sourcePage="/how-to-rent-guide"
                intent="tenancy_agreement"
                headline="Checking How to Rent before a new tenancy or notice?"
                primaryProduct="ast_standard"
                primaryHref={tenancyProductHref}
                primaryLabel="Create the right tenancy agreement"
                secondaryProduct="notice_only"
                secondaryHref={noticeOnlyHref}
                secondaryLabel="Checking before notice? Start Notice Only"
                ctaPosition="top"
                riskMessage="Missing compliance evidence can delay the next step"
                proofPoints={[
                  'Create an England tenancy pack for the property setup',
                  'Keep How to Rent evidence with the tenancy file',
                  'Use Notice Only if you are checking compliance before serving notice',
                ]}
                body="If you are setting up a new tenancy, start with the tenancy agreement. If you are checking How to Rent because you may serve notice, use Notice Only so the compliance record and notice file are checked together."
              />
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>Quick answer for landlords</h2>
                <p>
                  Use this page as a compliance checklist before a new tenancy, notice review, or
                  possession route. The practical steps are simple: get the latest How to Rent guide,
                  serve it at the right time, keep evidence of service, and check the rest of the
                  tenancy file before you rely on any notice.
                </p>
                <p>
                  Example: if you emailed the guide before move-in, keep the email, attachment,
                  delivery record, and version date. If you handed it over in person, keep a signed
                  acknowledgement or a clear move-in checklist showing what was provided.
                </p>

                <h2>What is the How to Rent Guide?</h2>
                <p>
                  The &quot;How to Rent: the checklist for renting in England&quot; is a government-published
                  document that explains:
                </p>
                <p>
                  If you are preparing the written statement of terms at the same time, you can{' '}
                  <Link href="/products/ast">
                    create a Renters' Rights Act compliant tenancy agreement
                  </Link>{' '}
                  for the tenancy file before you serve the How to Rent guide, or choose the{' '}
                  <Link href="/premium-tenancy-agreement">
                    upgraded premium periodic tenancy agreement builder
                  </Link>{' '}
                  if you need stronger management wording.
                </p>
                <ul>
                  <li>What tenants should look for before renting</li>
                  <li>What to expect during the tenancy</li>
                  <li>Tenant rights and responsibilities</li>
                  <li>What happens at the end of a tenancy</li>
                  <li>Where to get help if things go wrong</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                  <p className="text-blue-800 font-semibold mb-2">Latest How to Rent guide PDF</p>
                  <p className="text-blue-700 text-sm">
                    Always check gov.uk for the current version of the How to Rent guide. The
                    government updates it periodically.
                  </p>
                </div>

                <h2>Why Does It Matter for Landlords?</h2>
                <p>
                  The How to Rent guide is part of the wider compliance file landlords should keep
                  for an England tenancy. If you cannot show what was given to the tenant and when,
                  later notice or court work becomes harder to evidence.
                </p>
                <ul>
                  <li>
                    A weak compliance record can slow down a possession case
                  </li>
                  <li>
                    Missing service evidence creates avoidable questions if the tenant challenges the file
                  </li>
                  <li>
                    New-tenancy paperwork is easier to defend when the guide, agreement, and setup records match
                  </li>
                </ul>
                <p>
                  If you are reviewing the file before service, use the{' '}
                  <Link href={noticeOnlyHref}>Notice Only route</Link> to check the compliance record,
                  notice dates, grounds, and service evidence together. If you are setting up a new
                  let, start with the <Link href={tenancyProductHref}>England tenancy agreement pack</Link>
                  so the tenancy file is clean from day one.
                </p>

                <h2>When to Provide It</h2>
                <p>
                  Provide the How to Rent guide to tenants at the start of a new England private
                  tenancy. Best practice:
                </p>
                <ol>
                  <li>
                    <strong>New tenancies:</strong> Provide before or on the day the tenancy starts
                  </li>
                  <li>
                    <strong>Renewals (same tenant):</strong> Only required if a new version has been
                    published since you last provided it
                  </li>
                  <li>
                    <strong>New tenants in existing properties:</strong> Always provide to new tenants
                  </li>
                </ol>

                <h2>How to Provide It</h2>
                <p>You can provide the How to Rent guide by:</p>
                <ul>
                  <li>
                    <strong>Email:</strong> Send as a PDF attachment or link to the gov.uk page
                  </li>
                  <li>
                    <strong>Hard copy:</strong> Print and hand to the tenant
                  </li>
                  <li>
                    <strong>Post:</strong> Send by post before the tenancy starts
                  </li>
                </ul>

                <h2>Proving You Provided It</h2>
                <p>
                  Keep evidence that you provided the guide. If you go to court, you may need to
                  prove this. Options include:
                </p>
                <ul>
                  <li>Email with delivery/read receipt</li>
                  <li>Signed acknowledgment from the tenant</li>
                  <li>Clause in tenancy agreement confirming receipt</li>
                  <li>Text message confirmation</li>
                </ul>

                <h2>Other Prescribed Requirements</h2>
                <p>
                  The How to Rent guide is only one part of the wider landlord compliance record.
                  You should also keep clear evidence that you:
                </p>
                <ul>
                  <li>Protect the deposit in a government-approved scheme</li>
                  <li>Serve the deposit prescribed information within 30 days</li>
                  <li>Provide a valid Gas Safety Certificate</li>
                  <li>Provide a valid Energy Performance Certificate (EPC)</li>
                </ul>
                <p>
                  <Link href={noticeOnlyHref}>
                    Start Notice Only once the compliance file is ready for notice checks
                  </Link>
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={howToRentGuideFAQs}
                title="How to Rent Guide FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* Action chooser */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Choose the landlord action you need next
              </h2>
              <p className="mt-3 text-gray-600">
                Use the compliance check as a starting point, then move into the task that actually needs doing.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {actionChooserItems.map((item) => (
                  <div key={item.title} className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-600">{item.body}</p>
                    <TrackedLink
                      href={item.href}
                      pagePath="/how-to-rent-guide"
                      pageType="guide"
                      ctaLabel={item.label}
                      ctaPosition="bottom"
                      eventName="entry_page_secondary_cta_click"
                      routeIntent={item.title.toLowerCase().replace(/\s+/g, '_')}
                      product={item.product}
                      className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                    >
                      {item.label}
                    </TrackedLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
