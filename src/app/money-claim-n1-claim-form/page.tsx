import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  FileText,
  Download,
  ClipboardList,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  moneyClaimGuides,
  moneyClaimForms,
  productLinks,
} from '@/lib/seo/internal-links';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

const canonical = getCanonicalUrl('/money-claim-n1-claim-form');

export const metadata: Metadata = {
  title: 'N1 Claim Form Guide | How Landlords Complete a County Court Money Claim',
  description:
    'Landlord guide to the N1 claim form. Understand what the N1 is, when landlords use it instead of MCOL, how the sections work, and what usually matters in the particulars of claim.',
  keywords: [
    'N1 claim form',
    'N1 form guide',
    'money claim form',
    'complete N1 form',
    'N1 landlord',
    'court claim form',
    'particulars of claim',
    'N1 form example',
    'fill in N1 form',
    'N1 form template',
  ],
  openGraph: {
    title: 'N1 Claim Form Guide | How Landlords Complete a County Court Money Claim',
    description:
      'Step-by-step landlord guide to the N1 claim form, including when to use it, what the sections cover, and how the particulars of claim usually work.',
    type: 'article',
    url: canonical,
  },
  alternates: {
    canonical,
  },
};

const faqs = [
  {
    question: 'What is the N1 claim form?',
    answer:
      'The N1 is the standard court form used to start a civil money claim in England and Wales. Landlords may use it where they want to pursue a debt such as unpaid rent or other money owed by a tenant.',
  },
  {
    question: 'Should I use the N1 form or Money Claim Online?',
    answer:
      'Both routes can start a money claim. In practical terms, landlords often compare them by looking at claim complexity, how much detail is needed in the particulars, and whether the online route is suitable for the structure of the case.',
  },
  {
    question: 'Where do I get the N1 form?',
    answer:
      'The N1 form is available from the official government source. Always make sure you are using the current version of the form and read any accompanying guidance notes carefully.',
  },
  {
    question: 'What are particulars of claim?',
    answer:
      'The particulars of claim explain why the defendant owes you money. For landlords, that usually means setting out the tenancy background, what the tenant was required to pay, what was not paid, and how the final figure is calculated.',
  },
  {
    question: 'Can I claim interest on the N1 form?',
    answer:
      'In many money claims, landlords may also claim interest where appropriate. The key point is that the interest basis and calculation need to be stated clearly rather than assumed.',
  },
  {
    question: 'How many copies of the N1 do I need?',
    answer:
      'The court usually needs the original claim form and enough copies for service on the defendant or defendants. The exact submission requirements should be checked carefully before issue.',
  },
  {
    question: 'What happens after I submit the N1?',
    answer:
      'Once issued, the claim is served and the defendant has the opportunity to respond. If there is no response, the landlord may consider default judgment. If the claim is defended, it usually moves into the next court stage.',
  },
  {
    question: 'Can I amend the N1 after submitting it?',
    answer:
      'Minor issues may sometimes be corrected, but more significant changes can create delay or require a more formal step. In practical terms, landlords usually do better by getting the form and supporting documents right before issue.',
  },
];

export default function MoneyClaimN1ClaimFormPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'N1 Claim Form Guide for Landlords',
          description:
            'Landlord guide to the N1 claim form, including how the sections work and what usually matters in the particulars of claim.',
          url: canonical,
          datePublished: '2026-01-15',
          dateModified: '2026-04-01',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          {
            name: 'Money Claim Guide',
            url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent',
          },
          { name: 'N1 Claim Form', url: canonical },
        ])}
      />
      <StructuredData
        data={faqPageSchema(
          faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))
        )}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-[#fcfaff]">
        <UniversalHero
          title="N1 Claim Form Guide"
          subtitle="Understand when landlords use the N1 form, what the key sections cover, and how to prepare a stronger money-claim file before issuing in court."
          primaryCta={{
            label: 'Start Money Claim Pack',
            href: '/products/money-claim?topic=debt&src=seo_money_claim_n1_claim_form',
          }}
          secondaryCta={{
            label: 'Compare with MCOL',
            href: '/money-claim-online-mcol',
          }}
          showTrustPositioningBar
          hideMedia
        >
          <p className="mt-6 text-sm text-white/90 md:text-base">
            This guide explains what the N1 claim form is, when landlords may use
            it instead of MCOL, what usually matters in the particulars of claim,
            and how to turn a tenancy debt file into a cleaner county court money
            claim.
          </p>
        </UniversalHero>

        <section className="bg-white py-8">
          <Container>
            <div className="mx-auto max-w-5xl">
              <SeoPageContextPanel pathname="/money-claim-n1-claim-form" />
            </div>
          </Container>
        </section>

        <section className="bg-white py-8">
          <Container>
            <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-[#E6DBFF] bg-white p-6">
                <h2 className="text-2xl font-semibold text-[#2a2161]">
                  N1 claim form: quick view
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    'Paper court claim route',
                    'Used for county court money claims',
                    'Particulars of claim matter most',
                    'Often compared with MCOL',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] px-4 py-3 text-sm text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <p className="mt-5 leading-7 text-gray-700">
                  In practical terms, landlords usually do best when they focus
                  less on the form itself and more on whether the debt file behind
                  it is clean, organised, and easy to explain.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E6DBFF] bg-[linear-gradient(180deg,#fbf8ff_0%,#f3ebff_100%)] p-6">
                <h3 className="text-xl font-semibold text-[#2a2161]">
                  Need the documents behind the form?
                </h3>

                <p className="mt-3 leading-7 text-gray-700">
                  The N1 only works well when the claim is supported by a clean
                  arrears file, a proper chronology, and clear particulars of
                  claim. Money Claim Pack is built to help landlords prepare that
                  supporting material properly.
                </p>

                <div className="mt-5 grid gap-3">
                  {[
                    'Particulars of claim wording',
                    'Letter before action support',
                    'Interest calculation guidance',
                    'Money claim filing workflow',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[#E6DBFF] bg-white px-4 py-3 text-sm text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/products/money-claim?topic=debt&src=seo_money_claim_n1_claim_form"
                    className="rounded-lg bg-primary px-5 py-3 text-white"
                  >
                    Generate your documents
                  </Link>
                  <Link
                    href="/money-claim-online-mcol"
                    className="rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-primary"
                  >
                    Compare with MCOL
                  </Link>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-700">
                  Need the broader debt-recovery walkthrough first?{' '}
                  <Link href="/money-claim" className="font-semibold text-primary hover:underline">
                    Read the money claim guide
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 lg:py-16">
          <Container>
            <div className="mx-auto max-w-5xl space-y-10">
              <section className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">
                  Understanding the N1 form
                </h2>

                <p className="mt-4 leading-7 text-gray-700">
                  The N1 is the standard court form used to start a civil money
                  claim in England and Wales. For landlords, that usually means a
                  debt claim arising from a tenancy file, such as unpaid rent or a
                  money figure the landlord says is still owed.
                </p>

                <p className="mt-4 leading-7 text-gray-700">
                  Many landlords now compare the N1 with Money Claim Online. In
                  practical terms, both routes are about the same underlying
                  question: can the landlord explain the debt clearly enough for a
                  court claim? The form matters, but the file behind it matters
                  more.
                </p>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> before issuing a county court
                      money claim, landlords usually need to think carefully about
                      pre-action conduct, including whether a proper warning letter
                      has been sent and whether the debt file is ready to support
                      the claim cleanly.
                    </span>
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">
                  Paper N1 vs MCOL
                </h2>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <h3 className="font-semibold text-[#2a2161]">N1 paper route</h3>
                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        More room for a structured claim file
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Useful where the claim needs more explanation
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Better fit for some more detailed particulars
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <h3 className="font-semibold text-[#2a2161]">MCOL route</h3>
                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        Online process
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        Often suits more standard claims
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        Still depends on a clean debt file
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="mt-5 leading-7 text-gray-700">
                  In practical terms, landlords usually choose between them based
                  less on the label and more on whether the claim can be presented
                  clearly, whether the particulars are straightforward, and which
                  route best fits the file.
                </p>
              </section>

              <section className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">
                  Completing the N1: section by section
                </h2>

                <div className="mt-6 space-y-6">
                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2a2161]">
                          Claimant details
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          This section identifies the person or entity bringing the
                          claim. In practical terms, landlords should make sure the
                          claimant details are accurate and consistent with the
                          tenancy documents and the debt file.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2a2161]">
                          Defendant details
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          This section identifies the tenant or former tenant. The
                          key point is usually accuracy. If the defendant details
                          are wrong or inconsistent, the claim file often becomes
                          weaker and more awkward to serve or explain.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2a2161]">
                          Brief details of claim
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          This is the short description of what the claim is about.
                          For landlords, that usually means identifying the debt in
                          broad terms, such as unpaid rent or another tenancy-linked
                          money claim.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2a2161]">Value</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          This section covers the amount claimed. In practical
                          terms, the key issue is whether the landlord can explain
                          how the figure was reached. A weak total is usually more
                          damaging than a lower but well-supported one.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2a2161]">
                          Particulars of claim
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          This is usually the most important part. The particulars
                          explain why the tenant owes the money, how the debt arose,
                          and how the final figure is calculated. In practical
                          terms, many landlord claims stand or fall on whether this
                          part is clear, disciplined, and consistent with the
                          supporting documents.
                        </p>

                        <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4">
                          <p className="text-sm text-violet-800">
                            <strong>Tip:</strong> landlords usually get better
                            results when the particulars are built from a clean
                            chronology and a proper arrears or debt schedule rather
                            than written as a rough narrative from memory.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">
                  What usually matters more than the form
                </h2>

                <p className="mt-4 leading-7 text-gray-700">
                  Many landlords focus too heavily on the form itself and not
                  enough on the debt file behind it. In practical terms, the N1 is
                  only the front end of the claim. The more important question is
                  whether the landlord can support the claim with a clean set of
                  documents and a clear explanation of the amount sought.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <h3 className="font-semibold text-[#2a2161]">
                      Stronger money claim files usually include:
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Clear arrears or debt schedule
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Payment history or supporting records
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Proper particulars of claim
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Clean chronology of how the debt arose
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                    <h3 className="font-semibold text-[#2a2161]">
                      Common weaknesses usually include:
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        Vague totals without explanation
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        Mixed categories in one unclear figure
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        Weak particulars
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        File built too late and too loosely
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#2a2161]">
                  How our Money Claim Pack helps
                </h2>

                <p className="mt-4 leading-7 text-gray-700">
                  The most useful part of a money claim workflow is usually not the
                  blank form itself. It is the supporting material that helps the
                  landlord issue with more confidence and explain the claim more
                  clearly.
                </p>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Particulars of claim support</p>
                      <p className="text-sm text-gray-500">Built for landlord debt claims</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Letter before action support</p>
                      <p className="text-sm text-gray-500">For pre-claim preparation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Debt and interest guidance</p>
                      <p className="text-sm text-gray-500">Helps you explain the figure better</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-[#E6DBFF] bg-white p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Submission workflow guidance</p>
                      <p className="text-sm text-gray-500">For N1 and MCOL routes</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/products/money-claim?topic=debt&src=seo_money_claim_n1_claim_form"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    Generate your documents - {PRODUCTS.money_claim.displayPrice}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="mt-3 text-sm text-gray-500">
                    Court fees are separate and paid to the court.
                  </p>
                </div>
              </section>
            </div>
          </Container>
        </section>

        <section className="py-12 lg:py-16 bg-white">
          <Container>
            <div className="mx-auto max-w-5xl">
              <FAQSection
                faqs={faqs}
                title="N1 claim form FAQs for landlords"
                includeSchema={false}
              />
            </div>
          </Container>
        </section>

        <section className="py-12 lg:py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <RelatedLinks
                links={[
                  moneyClaimForms.letterBeforeAction,
                  moneyClaimGuides.mcolProcess,
                  moneyClaimGuides.smallClaimsCourt,
                  productLinks.moneyClaim,
                ]}
              />
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
