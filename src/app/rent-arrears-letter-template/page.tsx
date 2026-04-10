import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  productLinks,
  toolLinks,
  blogLinks,
  landingPageLinks,
} from '@/lib/seo/internal-links';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FunnelCta } from '@/components/funnels';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  FileText,
  AlertTriangle,
  X,
  Gavel,
  PoundSterling,
  Mail,
  ArrowRight,
  Download,
  Scale,
  Clock,
  Shield,
} from 'lucide-react';

const moneyClaimProductHref = '/products/money-claim';
const noticeOnlyProductHref = '/products/notice-only';
const completePackProductHref = '/products/complete-pack';
const moneyClaimPrice = PRODUCTS.money_claim.displayPrice;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Rent Arrears Letter Template UK | Free Demand Letter + Legal Next Steps',
  description:
    'Plain-English landlord guide to writing a rent arrears letter, asking for payment clearly, and deciding when to escalate to a money claim or Section 8 notice.',
  keywords: [
    'rent arrears letter template',
    'rent arrears letter uk',
    'rent demand letter',
    'late rent letter',
    'unpaid rent letter',
    'formal rent demand letter',
    'rent arrears notice',
    'tenant rent arrears letter',
    'letter before action rent arrears',
    'mcol rent arrears',
    'section 8 rent arrears',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/rent-arrears-letter-template',
  },
  openGraph: {
    title: 'Rent Arrears Letter Template UK | Free Demand Letter + Legal Next Steps',
    description:
      'Landlord guide to writing a rent arrears letter properly and deciding when to move into a money claim or Section 8 route.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/rent-arrears-letter-template',
  },
};

const faqs = [
  {
    question: 'When should I send a rent arrears letter?',
    answer:
      'Send a rent arrears letter as soon as rent is overdue. Many landlords use a polite reminder first, then a formal demand, then a final warning before escalating to a money claim or Section 8 notice.',
  },
  {
    question: 'What should a rent arrears letter include?',
    answer:
      'A rent arrears letter should include the tenant name, property address, the amount owed, the rental period missed, a payment deadline, how to pay, and what happens if payment is not made.',
  },
  {
    question: 'Can I recover unpaid rent without evicting the tenant?',
    answer:
      'Yes. You can usually pursue unpaid rent through a county court money claim without seeking possession. This is often suitable where your main priority is recovering the debt.',
  },
  {
    question: 'Can I evict a tenant for rent arrears?',
    answer:
      'Yes. Rent arrears are commonly dealt with using Section 8 in England, often relying on Grounds 8, 10 and 11 where appropriate. The route you choose should match the arrears level and the wider tenancy file.',
  },
  {
    question: 'Should I offer a payment plan for rent arrears?',
    answer:
      'A payment plan can help if the tenant is engaging and can realistically catch up. Keep any agreement in writing and record what is due, by when, and what will happen if the plan is broken.',
  },
  {
    question: 'Can I send rent arrears letters by email and post?',
    answer:
      'Yes. Dual service can be sensible. Check the tenancy agreement service clause and keep proof of sending for every channel you use.',
  },
  {
    question: 'What evidence should I prepare before MCOL?',
    answer:
      'Prepare a signed tenancy agreement, a clear rent schedule, payment records, correspondence history, and proof of service for any arrears letters or pre-action communications.',
  },
  {
    question: 'How much rent arrears do I need before taking legal action?',
    answer:
      'Any arrears justify chasing payment, but the legal route depends on the facts. For Section 8 rent arrears claims in England, the arrears level can affect which grounds are available and how strong the claim is.',
  },
];

export default function RentArrearsLetterTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Rent Arrears Letter Template UK',
    description:
      'Rent arrears letter guidance for landlords with demand letter wording, escalation steps, and debt recovery routes.',
    url: 'https://landlordheaven.co.uk/rent-arrears-letter-template',
  };

  return (
    <>
      <SeoLandingWrapper
        pagePath="/rent-arrears-letter-template"
        pageTitle={metadata.title as string}
        pageType="money"
        jurisdiction="uk"
      />
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          {
            name: 'Rent Arrears Letter Template',
            url: 'https://landlordheaven.co.uk/rent-arrears-letter-template',
          },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main>
        <UniversalHero
          badge="Rent Arrears Recovery"
          badgeIcon={<PoundSterling className="w-4 h-4" />}
          title="Rent Arrears Letter Template UK"
          subtitle="If a tenant has fallen behind, start with a letter that sets out the arrears clearly, asks for payment properly, and leaves you in a stronger position if you need to escalate."
          primaryCta={{ label: 'Start money claim', href: moneyClaimProductHref }}
          secondaryCta={{ label: 'Start Section 8 notice', href: noticeOnlyProductHref }}
          showTrustPositioningBar
          hideMedia
        />

        <section className="border-y border-gray-100 bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <SeoPageContextPanel pathname="/rent-arrears-letter-template" />
              <p className="text-gray-700">
                Use this letter-stage guide alongside the wider{' '}
                <Link href="/tenant-not-paying-rent" className="font-medium text-primary hover:underline">
                  tenant not paying rent guide
                </Link>
                , the court-focused{' '}
                <Link href="/money-claim-unpaid-rent" className="font-medium text-primary hover:underline">
                  money claim for unpaid rent route
                </Link>
                , and the{' '}
                <Link href={moneyClaimProductHref} className="font-medium text-primary hover:underline">
                  money claim product
                </Link>{' '}
                once reminder letters are no longer enough.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Turn arrears letters into the right next step"
                subtitle="If the tenant still does not pay, move into a money claim for debt recovery or choose eviction support if you also need possession."
                primaryHref={moneyClaimProductHref}
                primaryText="Recover unpaid rent"
                primaryDataCta="money-claim"
                location="above-fold"
                secondaryLinks={[
                  {
                    href: completePackProductHref,
                    text: "If the tenant won't leave / eviction support",
                    dataCta: 'complete-pack',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Rent Arrears Letter?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A rent arrears letter is a formal written demand telling the tenant that rent is overdue,
                what amount is outstanding, and what happens next if payment is not made. It is often the
                first serious step in the recovery process and can become useful evidence later.
              </p>

              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  Landlords usually do best when they treat rent arrears letters as part of a wider
                  recovery workflow rather than as isolated reminders. A good arrears letter does more
                  than ask for payment. It records the arrears position, sets a deadline, keeps the
                  communication professional, and helps preserve a clean chronology if the matter later
                  becomes a money claim or a possession case.
                </p>
                <p>
                  The strongest arrears letters are factual and specific. They identify the property,
                  the tenant, the missed rent period, the exact amount owed, how payment should be made,
                  and the next step if payment is not received. That is why a well-structured letter is
                  worth using even where the tenant already knows they are behind.
                </p>
                <p>
                  In practice, this page is designed to help with three things: sending a better arrears
                  letter now, keeping the evidence record cleaner, and choosing the right escalation route
                  if the tenant still does not pay.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Types of Rent Arrears Letters
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Use the right letter at the right stage. Different arrears situations call for different
                levels of pressure.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Friendly Reminder</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Best when rent has just gone overdue and the tenant may simply be late or disorganised.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Low-conflict tone
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Good for early engagement
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Formal Demand</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Best when reminders have not worked and you need a clearer deadline and stronger wording.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Sets a payment deadline
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Useful pre-action evidence
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Final Warning</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Best where the tenant still has not paid and you are now preparing for legal escalation.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Final chance wording
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Stronger debt-recovery positioning
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="No response to your rent arrears letter?"
                subtitle="Escalate with a money claim pack and keep your arrears evidence organised from the start."
                primaryHref={moneyClaimProductHref}
                primaryText="Start money claim"
                primaryDataCta="money-claim"
                location="mid"
                secondaryLinks={[
                  {
                    href: completePackProductHref,
                    text: 'Tenant still in the property? Get eviction support',
                    dataCta: 'complete-pack',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What a Good Rent Arrears Letter Should Include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A rent arrears letter should be clear enough for the tenant to understand and structured
                enough to support you later if the matter escalates.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Core details</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenant name and full property address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rental period missed and amount owed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Date by which payment must be made</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>How the tenant can make payment</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Protective wording</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Reference to previous reminders where relevant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clear statement of next steps if unpaid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Invitation to discuss a payment arrangement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Professional, factual tone with no threats or abuse</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
                <p className="text-amber-900">
                  <strong>Important:</strong> a rent arrears letter is not the same thing as a possession
                  notice or a Letter Before Claim. It is often the right early-stage document, but later
                  stages may require a different formal route.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Rent Arrears Letter Template UK</h2>
              <p>
                A rent arrears letter template UK landlords use should clearly state the tenant details,
                amount owed, missed payment dates, payment deadline, and next steps if payment is not made.
                It should be dated, factual, and supported by a rent schedule to avoid later disputes.
              </p>

              <h2>Rent Demand Letter</h2>
              <p>
                A rent demand letter is a formal written request for overdue rent. It tells the tenant how
                much is outstanding, when payment is due, and how to pay. A clear demand letter can support
                negotiation and provides useful evidence if the matter later proceeds to court.
              </p>

              <h2>Final Rent Demand Letter</h2>
              <p>
                A final rent demand letter is the last warning before legal escalation. It should set a short,
                clear payment deadline, confirm previous reminders, and explain intended next action such as
                a Section 8 notice or money claim. Keep proof of service for every letter sent.
              </p>

              <h2>Claiming Rent Arrears Through Court</h2>
              <p>
                Claiming rent arrears through court usually involves a Letter Before Claim, a clear arrears
                schedule, and issuing a county court claim if payment is not made. The claim should match
                tenancy records and bank evidence to reduce defence risk.
              </p>

              <h3>How to escalate a rent arrears letter</h3>
              <ol>
                <li>Send a reminder letter as soon as rent becomes overdue.</li>
                <li>Issue a formal demand with a specific payment deadline.</li>
                <li>Serve a final warning letter if arrears remain unpaid.</li>
                <li>Prepare a rent schedule and supporting tenancy documents.</li>
                <li>Move to a money claim or possession route if payment is still not made.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What To Do If the Tenant Still Does Not Pay
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                If rent arrears letters do not work, landlords usually move into one of two directions:
                recover the debt, recover possession, or coordinate both routes carefully.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <PoundSterling className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Money Claim</h3>
                      <span className="text-sm text-gray-500">Recover the unpaid rent</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Use this route where your priority is recovering the debt. This is often suitable if
                    the tenant has left already or where you do not need possession as the main objective.
                  </p>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter Before Claim route
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      County Court / MCOL workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Judgment and enforcement options
                    </li>
                  </ul>
                  <Link
                    href={moneyClaimProductHref}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Money Claim Pack
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 8 Possession Route</h3>
                      <span className="text-sm text-gray-500">Where arrears support possession</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Use this route where rent arrears are part of a possession strategy. The correct
                    grounds and the exact arrears position matter, so the file needs to be prepared carefully.
                  </p>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Commonly uses Grounds 8, 10 and 11
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Suitable for rent arrears possession cases
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Can sit alongside wider recovery planning
                    </li>
                  </ul>
                  <Link
                    href={noticeOnlyProductHref}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Section 8 Notice Support
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                <p className="text-blue-900">
                  <strong>England note:</strong> many landlords are also reviewing how long they should rely
                  on older no-fault assumptions. If arrears are the live issue, a properly prepared arrears-led
                  route is often the more natural place to start.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Starter Document vs Money Claim Pack
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Start with a free demand letter if you need a first formal step. Upgrade if the tenant
                still does not pay and the case now needs a proper debt-recovery workflow.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Free Starter Document
                    </span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£0</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Basic rent demand wording</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Immediate first-step document</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Useful for early arrears follow-up</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No court claim workflow</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No full pre-action debt route</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No money-claim escalation pack</span>
                    </li>
                  </ul>
                  <Link
                    href="/tools/free-rent-demand-letter"
                    className="hero-btn-secondary block w-full text-center"
                  >
                    Try Free Starter Document
                  </Link>
                </div>

                <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Full Recovery Route
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">
                      Money Claim Pack
                    </span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">{moneyClaimPrice}</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Structured debt-claim route</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Better pre-action progression</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Court-focused arrears workflow</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Useful where payment is still outstanding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Helps turn arrears into a recoverable file</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Email support</span>
                    </li>
                  </ul>
                  <Link
                    href={moneyClaimProductHref}
                    className="hero-btn-primary block w-full text-center"
                  >
                    Get Money Claim Pack
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Use a Rent Arrears Letter Properly
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Good landlords use arrears letters as part of one clear evidence trail.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Confirm the arrears</h3>
                  <p className="text-gray-600 text-sm">
                    Check the tenancy, rent due date, missed periods, and exact balance before sending anything.
                  </p>
                </div>

                <div className="text-center bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Send the right letter</h3>
                  <p className="text-gray-600 text-sm">
                    Match the tone and pressure level to the stage of the case: reminder, demand, or final warning.
                  </p>
                </div>

                <div className="text-center bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Preserve the evidence</h3>
                  <p className="text-gray-600 text-sm">
                    Keep copies, proof of service, tenant replies, and an up-to-date rent schedule for next steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-amber-500 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Do Not Let Arrears Drift Without a Paper Trail
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                The earlier you start documenting arrears properly, the easier it is to recover rent,
                negotiate from strength, or move into a cleaner legal route later.
              </p>
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold">Early</div>
                  <div className="text-white/80 text-sm">formal letters improve chronology</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">Clear</div>
                  <div className="text-white/80 text-sm">rent schedules reduce disputes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">Strong</div>
                  <div className="text-white/80 text-sm">service evidence supports escalation</div>
                </div>
              </div>
              <Link
                href="/tools/free-rent-demand-letter"
                className="hero-btn-secondary inline-flex items-center gap-2"
              >
                Send Your Demand Letter Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">
                Use this resource when you need more than a template. It covers the practical arrears
                workflow from first reminder to debt claim or possession support.
              </p>

              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <a href="#legal-framework" className="p-3 rounded-lg border border-gray-200 hover:border-primary">
                  Legal framework
                </a>
                <a href="#step-by-step-guide" className="p-3 rounded-lg border border-gray-200 hover:border-primary">
                  Step-by-step process
                </a>
                <a href="#mistakes" className="p-3 rounded-lg border border-gray-200 hover:border-primary">
                  Common mistakes
                </a>
                <a href="#evidence-checklist" className="p-3 rounded-lg border border-gray-200 hover:border-primary">
                  Evidence checklist
                </a>
                <a href="#timeline-breakdown" className="p-3 rounded-lg border border-gray-200 hover:border-primary">
                  Timeline breakdown
                </a>
                <a href="#comparison-table" className="p-3 rounded-lg border border-gray-200 hover:border-primary">
                  Comparison table
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="legal-framework">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Legal framework explained for landlords</h2>
              <p>
                Landlords get better outcomes when they treat document generation as one part of a full
                legal workflow. Courts are not only checking whether you used sensible wording, but also
                whether the dates, arrears figures, service method, and escalation steps were handled
                properly. In practice, failures usually happen because a landlord sends a demand letter
                without a clean rent schedule or escalates without preserving proof of service.
              </p>
              <p>
                The strongest approach is to work from facts to action: confirm the tenancy, confirm the
                rent due dates, reconcile the ledger, then choose the next document. Doing this once in a
                structured way reduces avoidable resets and helps you keep the debt and possession options
                separate where needed.
              </p>
              <p>
                Jurisdiction matters. This page is written for England-focused landlord workflows. If you
                manage property elsewhere in the UK, do not assume the same routes, notice logic, or
                terminology apply.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="step-by-step-guide">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Step-by-step landlord process for rent arrears</h2>
              <ol>
                <li><strong>Confirm the arrears position:</strong> check the rent schedule against bank evidence.</li>
                <li><strong>Decide your objective:</strong> recover the money, recover possession, or preserve both options.</li>
                <li><strong>Send the right arrears letter:</strong> reminder, formal demand, or final warning.</li>
                <li><strong>Keep proof of service:</strong> preserve posting, email, and delivery records.</li>
                <li><strong>Update the chronology:</strong> log each payment, promise, breach, and letter sent.</li>
                <li><strong>Escalate properly:</strong> move to money claim or Section 8 with the evidence file already prepared.</li>
              </ol>
              <p>
                The best arrears workflows are usually not the most aggressive. They are the ones where
                each document, date, and figure lines up cleanly from the first overdue payment onward.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="mistakes">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Common mistakes that weaken arrears recovery</h2>
              <ul>
                <li>Sending a vague demand letter without a clear arrears figure.</li>
                <li>Using emotional or threatening wording instead of factual language.</li>
                <li>Failing to keep copies and proof of service.</li>
                <li>Mixing up debt recovery and possession strategy without a plan.</li>
                <li>Letting the ledger drift without reconciling each payment.</li>
                <li>Waiting too long to formalise the arrears record.</li>
              </ul>
              <p>
                Most of these problems are preventable. One clean rent schedule and one reliable chronology
                usually do more for a landlord than sending louder letters.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="evidence-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Evidence checklist before you escalate</h2>
              <ul>
                <li>Signed tenancy agreement and any renewal terms.</li>
                <li>Rent ledger or arrears schedule showing running balance.</li>
                <li>Copies of all reminder letters and formal demands.</li>
                <li>Proof of service for every letter and notice sent.</li>
                <li>Relevant tenant communications about payment or payment plans.</li>
                <li>One chronology document matching dates to documents.</li>
              </ul>
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                Need a faster route from template to action? Use our{' '}
                <Link href={moneyClaimProductHref} className="text-primary underline">
                  Money Claim pathway
                </Link>{' '}
                to move from arrears letters into a cleaner recovery workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="timeline-breakdown">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Timeline breakdown</h2>
              <p>
                <strong>Days 1-7:</strong> verify the missed payment and decide whether a reminder is enough.
                <strong> Days 7-21:</strong> send a more formal demand if the tenant still has not paid.
                <strong> After repeated non-payment:</strong> finalise the arrears file and decide whether the
                case is now best handled through a money claim or an arrears-led possession route.
              </p>
              <p>
                Where you rely on post, allow sensible service margins. Where you rely on email, keep
                full sent records. The aim is not just speed. It is building a sequence you can prove.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="comparison-table">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy comparison table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left">Route</th>
                      <th className="border border-gray-200 p-3 text-left">Best for</th>
                      <th className="border border-gray-200 p-3 text-left">Main risk</th>
                      <th className="border border-gray-200 p-3 text-left">Evidence priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Free starter letter</td>
                      <td className="border border-gray-200 p-3">Early-stage formal reminder</td>
                      <td className="border border-gray-200 p-3">Stopping too early</td>
                      <td className="border border-gray-200 p-3">Copy letter + service proof</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Money claim route</td>
                      <td className="border border-gray-200 p-3">Debt recovery focus</td>
                      <td className="border border-gray-200 p-3">Weak arrears calculation</td>
                      <td className="border border-gray-200 p-3">Ledger + pre-action file</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Section 8 route</td>
                      <td className="border border-gray-200 p-3">Arrears linked to possession</td>
                      <td className="border border-gray-200 p-3">Wrong ground or weak evidence</td>
                      <td className="border border-gray-200 p-3">Arrears schedule + notice file</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <FAQSection
                faqs={faqs}
                title="Rent arrears letter FAQs for landlords"
                showContactCTA={false}
                variant="white"
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Get Your Rent Arrears Letter and Next-Step Route
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start with a professional rent demand letter now, then escalate cleanly if payment is still outstanding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/free-rent-demand-letter"
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Try Free Starter Document
                </Link>
                <Link
                  href={moneyClaimProductHref}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Get Money Claim Pack
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Demand Letter • Debt Recovery Route • Cleaner Evidence Trail
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-4xl">☁️</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Questions about dealing with rent arrears?
                  </p>
                  <p className="text-gray-600">
                    Our free{' '}
                    <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                      Ask Heaven landlord Q&amp;A tool
                    </Link>{' '}
                    can help you understand your options — from payment plans to money claims and
                    rent-arrears possession routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={[
                  productLinks.moneyClaim,
                  productLinks.completePack,
                  toolLinks.rentArrearsCalculator,
                  toolLinks.section8Generator,
                  blogLinks.rentArrearsEviction,
                  landingPageLinks.section8Template,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
