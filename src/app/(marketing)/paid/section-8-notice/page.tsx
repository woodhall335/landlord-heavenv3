import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FolderCheck,
  HelpCircle,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { CommercialSeoTrackedCta } from '@/components/seo/CommercialSeoTrackedCta';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';

const sourcePage = '/paid/section-8-notice';
const noticeHref =
  '/wizard/flow?type=eviction&product=notice_only&src=google_ads&topic=eviction';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Section 8 Notice Generator & Form 3A Pack | £39.99',
  description:
    'Prepare and preview an England Section 8 eviction notice, Form 3A, N215 service record and rent arrears schedule. One-off price £39.99.',
  keywords: [
    'Section 8 notice',
    'Section 8 eviction notice',
    'Section 8 notice generator',
    'Form 3A notice',
    'Form 3A Section 8 notice',
    'eviction notice for rent arrears',
    'landlord eviction notice England',
    'serve a Section 8 notice',
    'N215 certificate of service',
    'rent arrears schedule',
    'tenant not paying rent eviction',
  ],
  alternates: { canonical: getCanonicalUrl('/products/notice-only') },
  // This is the Google Ads variant. The product owner page remains the organic canonical.
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Prepare Your Section 8 Notice and Service File',
    description:
      `Build and preview Form 3A, the service record and supporting documents before paying ${PRODUCTS.notice_only.displayPrice}.`,
    url: getCanonicalUrl(sourcePage),
    type: 'website',
    images: [
      {
        url: getCanonicalUrl('/images/section-8-hero.webp'),
        width: 1024,
        height: 1024,
        alt: 'Section 8 notice preparation pack for England landlords',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 8 Notice Generator for England Landlords',
    description: 'Preview your Form 3A notice and service file before paying £39.99.',
    images: [getCanonicalUrl('/images/section-8-hero.webp')],
  },
};

const failureRows = [
  {
    problem: 'Dates or notice period do not match the grounds used',
    answer: 'The workflow checks the dates and notice-period inputs before the file is produced.',
  },
  {
    problem: 'The selected grounds do not fit the landlord’s facts',
    answer: 'Ground-specific questions help you record why each selected ground may apply.',
  },
  {
    problem: 'The notice is served without a clear service record',
    answer: 'Service guidance and an editable N215 help you record when, where and how service took place.',
  },
  {
    problem: 'The arrears total is unclear or inconsistent',
    answer: 'A period-by-period rent arrears schedule keeps the figures with the notice file.',
  },
  {
    problem: 'The landlord cannot reconstruct the file later',
    answer: 'The case summary, checks and next-step guide stay together with the notice documents.',
  },
];

const documents = [
  {
    icon: FileText,
    title: 'Form 3A notice',
    copy: 'The current prescribed Section 8 notice for assured tenancies in England, prepared from your answers.',
  },
  {
    icon: FileCheck2,
    title: 'N215 service record',
    copy: 'An editable certificate for recording which document was served, and when, where and how it was served.',
  },
  {
    icon: CalendarCheck2,
    title: 'Rent arrears schedule',
    copy: 'A clear period-by-period breakdown of rent due, payments received and the balance outstanding.',
  },
  {
    icon: ClipboardCheck,
    title: 'Service instructions',
    copy: 'Practical instructions explaining the service stage and the evidence you should retain.',
  },
  {
    icon: SearchCheck,
    title: 'Validity checklist',
    copy: 'A final review of the notice, grounds, dates and supporting details before anything is served.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance declaration',
    copy: 'A structured record of the key landlord and notice checks completed before service.',
  },
  {
    icon: FolderCheck,
    title: 'Case summary',
    copy: 'A concise overview of the tenancy, relevant facts, grounds and immediate next step.',
  },
  {
    icon: HelpCircle,
    title: 'What happens next guide',
    copy: 'Plain-English guidance on service, the notice period and what to consider if court papers become necessary.',
  },
];

const grounds = [
  {
    code: '8',
    title: 'Serious rent arrears',
    copy: 'For arrears that meet the current mandatory threshold when the notice is served and at the hearing.',
    image: '/images/tenant-is-not-paying-rent.webp',
    imageAlt: 'Landlord reviewing evidence of unpaid rent',
  },
  {
    code: '10',
    title: 'Rent remains unpaid',
    copy: 'A discretionary rent-arrears ground that may apply even where the mandatory threshold is not met.',
    image: '/images/the-court-looks-at-the-notice-first.webp',
    imageAlt: 'Court review of a landlord possession notice',
  },
  {
    code: '11',
    title: 'Persistent rent arrears',
    copy: 'For an evidenced history of repeatedly delayed rent payments or recurring arrears.',
    image: '/images/tenant-keeps-paying-late.webp',
    imageAlt: 'Landlord reviewing a history of late rent payments',
  },
  {
    code: '12',
    title: 'Breach of tenancy',
    copy: 'For a supported breach of a tenancy obligation other than the obligation to pay rent.',
    image: '/images/tenant-has-broken-the-tenancy-or-caused-damage.webp',
    imageAlt: 'Evidence of a broken tenancy term or property damage',
  },
  {
    code: '14',
    title: 'Antisocial behaviour',
    copy: 'For evidenced nuisance, annoyance, illegal use or antisocial behaviour connected with the property.',
    image: '/images/specialist-housing-or-employment-case.webp',
    imageAlt: 'Landlord reviewing an antisocial behaviour case',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'What is a Section 8 notice?',
    answer:
      'A Section 8 notice is a notice of possession used by an England landlord who relies on one or more statutory grounds for possession. For notices served from 1 May 2026, the current prescribed notice is Form 3A.',
  },
  {
    question: 'Does this generate the current Form 3A?',
    answer:
      'Yes. The workflow prepares the current England Form 3A notice from the information and grounds you provide. You must review the preview and ensure your answers remain accurate before serving it.',
  },
  {
    question: 'Can I use it when my tenant is not paying rent?',
    answer:
      'The workflow supports rent-arrears grounds, including Grounds 8, 10 and 11, and creates a rent arrears schedule. The facts and current thresholds must support any ground you select.',
  },
  {
    question: 'Is the N215 certificate of service included?',
    answer:
      'Yes. The pack includes an editable N215 certificate of service and service instructions. N215 records what was served and when, where and how service took place; it does not replace the need to serve correctly.',
  },
  {
    question: 'Can I preview the Section 8 notice before paying?',
    answer:
      'Yes. You can review a watermarked preview of the generated notice and supporting file before checkout. This page also contains sample PDFs showing the layout and supporting documents.',
  },
  {
    question: 'Does the £39.99 pack include court forms N5 and N119?',
    answer:
      'No. The £39.99 Notice & Service Pack covers the notice stage. Choose the Complete Court & Possession Pack if you also want N5, N119 and the court-stage possession paperwork.',
  },
  {
    question: 'Is this legal advice?',
    answer:
      'No. This is procedural document preparation based on the information you provide. Take legal advice before serving where the facts are disputed, the tenancy is unusual or you expect a defence.',
  },
];

function ctaHref(ground?: string) {
  return `${noticeHref}${ground ? `&ground=${ground}` : ''}`;
}

export default function EvictionNoticePaidLandingPage() {
  const sampleProof = getGoldenPackProofData('notice_only');
  const samplePage = getProductSamplePageByPackKey('notice_only');

  return (
    <>
      <HeaderConfig mode="solid" />

      <div className="overflow-hidden bg-white text-[#17112f]">
        <section className="relative border-b border-[#e9e2f7] bg-[linear-gradient(135deg,#ffffff_0%,#fbf9ff_48%,#f2ecff_100%)]">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_82%_18%,rgba(136,91,255,0.16),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(202,183,255,0.20),transparent_34%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-6 md:px-8 md:pb-16 lg:pb-20">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6b647c]">
              <Link href="/" className="transition hover:text-primary">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/products/notice-only" className="transition hover:text-primary">Eviction notices</Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-[#2d2447]">Section 8 notice</span>
            </nav>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6941c6]">
                  England Form 3A notice and service file
                </p>
                <h1 className="mt-4 max-w-3xl text-[2.65rem] font-bold leading-[1.04] tracking-[-0.045em] text-[#17112f] sm:text-5xl lg:text-[3.65rem]">
                  Stop losing rent money. Prepare your Section 8 notice today.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f5871]">
                  When talking has not fixed the arrears or tenancy breach, prepare the next step properly. Build your Section 8 eviction notice, Form 3A, service record and supporting file from one guided process.
                </p>
                <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#302749]">
                  Preview the generated paperwork before you pay. No subscription and no hidden document fee.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <CommercialSeoTrackedCta
                    href={ctaHref()}
                    label={`Start my Section 8 notice — ${PRODUCTS.notice_only.displayPrice}`}
                    className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6333d5,#8b35f2)] px-6 py-3.5 text-base font-bold text-white shadow-[0_14px_34px_rgba(99,51,213,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,51,213,0.30)]"
                    variant="primary"
                    sourcePage={sourcePage}
                    pageType="paid_landing_page"
                    intent="section_8_eviction_notice"
                    ctaPosition="hero"
                    recommendedProduct="notice_only"
                  >
                    Start my notice — {PRODUCTS.notice_only.displayPrice}
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                  </CommercialSeoTrackedCta>
                  <a href="#preview" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#cfc2ec] bg-white/80 px-6 py-3.5 font-bold text-[#4d2b9d] transition hover:border-[#8b65dc] hover:bg-white">
                    Preview the pack
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#6b647c]">
                  <span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-[#6b43c4]" aria-hidden /> Secure checkout</span>
                  <span>One-off purchase</span>
                  <span>Procedural preparation, not legal advice</span>
                </div>
              </div>

              <div className="relative mx-auto min-h-[370px] w-full max-w-[720px] sm:min-h-[470px] lg:min-h-[560px]">
                <div className="absolute inset-x-[8%] bottom-[3%] top-[8%] rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(187,159,255,0.44),rgba(245,241,255,0.18)_58%,transparent_72%)] blur-2xl" />
                <div className="absolute inset-x-[2%] bottom-[11%] top-[8%] z-10 overflow-hidden rounded-[1.4rem] border-[7px] border-[#261943] bg-white shadow-[0_30px_60px_rgba(49,28,92,0.24)] sm:inset-x-[4%] sm:border-[10px]">
                  <div className="flex h-11 items-center justify-between bg-[#21163d] px-4 text-white sm:h-14 sm:px-5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff7c7c]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ffd36a]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#72d69a]" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide text-white/75 sm:text-xs">LANDLORD HEAVEN · MY CASE</span>
                  </div>
                  <div className="grid h-[calc(100%-2.75rem)] grid-cols-[72px_1fr] bg-[#faf9fe] sm:h-[calc(100%-3.5rem)] sm:grid-cols-[118px_1fr]">
                    <div className="border-r border-[#e7e0f2] bg-[#f2eef9] p-3 sm:p-4">
                      <div className="h-7 rounded-lg bg-[#6b36d1]" />
                      <div className="mt-3 space-y-2.5">
                        {[1, 2, 3, 4].map((item) => <div key={item} className="h-2 rounded-full bg-[#d9d0e9]" />)}
                      </div>
                    </div>
                    <div className="min-w-0 p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7143c5] sm:text-xs">Section 8 notice file</p>
                          <p className="mt-1 text-base font-bold text-[#251a40] sm:text-xl">Your notice-stage documents</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 sm:px-3 sm:text-[11px]">Preview ready</span>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e6dff2] sm:mt-5"><div className="h-full w-[84%] rounded-full bg-[linear-gradient(90deg,#6b36d1,#9a45ef)]" /></div>
                      <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
                        {['Form 3A Section 8 notice', 'N215 service record', 'Rent arrears schedule'].map((document, index) => (
                          <div key={document} className="flex items-center justify-between gap-3 rounded-xl border border-[#e6dff2] bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eee7ff] text-xs font-bold text-[#6534c7] sm:h-8 sm:w-8">{index + 1}</span>
                              <span className="truncate text-[11px] font-semibold text-[#34284e] sm:text-sm">{document}</span>
                            </div>
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Image
                  src="/images/section-8-hero.webp"
                  alt="Section 8 notice file for an England rental property"
                  width={1024}
                  height={1024}
                  priority
                  className="absolute bottom-[-1%] right-[-3%] z-20 h-auto w-[32%] drop-shadow-[0_18px_28px_rgba(49,28,92,0.18)]"
                  sizes="(max-width: 1024px) 28vw, 230px"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e9e2f7] bg-white" aria-label="Product assurances">
          <div className="mx-auto grid max-w-7xl divide-y divide-[#eee8f8] px-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-8">
            {[
              ['England-specific Form 3A', 'Current notice workflow'],
              ['Eight-document service file', 'Notice, checks and evidence'],
              ['Preview before payment', 'Inspect the generated output'],
              ['Secure one-off checkout', 'No subscription'],
            ].map(([title, copy]) => (
              <div key={title} className="flex items-start gap-3 px-3 py-5 md:px-6">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#7040d1]" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-[#21173c]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#746d82]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7040d1]">From uncertainty to a reviewable notice file</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#17112f] md:text-4xl">You have tried talking. Now make the next step clear.</h2>
              <p className="mt-4 text-lg leading-8 text-[#655e72]">Unpaid rent, damage and repeated breaches can become more expensive while nothing changes. The answer is not rushed paperwork—it is a notice built around the facts you can support.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                ['01', 'Answer guided questions', 'Tell us about the tenancy, the issue, the grounds you are considering and the facts behind them.'],
                ['02', 'Review the legal checks', 'Check the dates, grounds, particulars, arrears figures and service assumptions before proceeding.'],
                ['03', 'Preview, pay and serve', 'Review the watermarked file before checkout, then download the purchased documents and follow the service guidance.'],
              ].map(([number, title, copy]) => (
                <article key={number} className="relative rounded-2xl border border-[#e4dcf5] bg-[#fcfbff] p-6 shadow-[0_12px_36px_rgba(76,29,149,0.06)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe8ff] text-sm font-bold text-[#6534c7]">{number}</span>
                  <h3 className="mt-5 text-xl font-bold text-[#21173c]">{title}</h3>
                  <p className="mt-3 leading-7 text-[#686174]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f5ff] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7040d1]">Get the notice stage right</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">Small inconsistencies can delay or weaken a possession claim.</h2>
              <p className="mt-4 text-lg leading-8 text-[#655e72]">Government guidance warns that an incomplete or inaccurate Form 3A may cause a later claim to be dismissed or delayed. This pack gives you one place to prepare, review and retain the notice-stage file.</p>
            </div>
            <div className="mt-9 overflow-hidden rounded-2xl border border-[#ded4f1] bg-white shadow-[0_16px_45px_rgba(76,29,149,0.07)]">
              <div className="hidden grid-cols-[0.9fr_1.1fr] bg-[#24184c] px-5 py-4 text-sm font-bold text-white md:grid md:px-7">
                <div>What can go wrong</div>
                <div>How the pack helps you check it</div>
              </div>
              {failureRows.map((row) => (
                <div key={row.problem} className="grid gap-3 border-t border-[#eee8f8] px-5 py-5 md:grid-cols-[0.9fr_1.1fr] md:px-7">
                  <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#7040d1] md:hidden">What can go wrong</span><p className="font-semibold text-[#302749]">{row.problem}</p></div>
                  <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#7040d1] md:hidden">How the pack helps</span><p className="flex gap-2.5 leading-7 text-[#655e72]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />{row.answer}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20" aria-labelledby="included-title">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7040d1]">Included for {PRODUCTS.notice_only.displayPrice}</p>
              <h2 id="included-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">Everything you need to prepare and record service</h2>
              <p className="mt-4 text-lg leading-8 text-[#655e72]">This is an eight-document Section 8 notice and service file—not a blank Form 3A download.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {documents.map(({ icon: Icon, title, copy }, index) => (
                <article key={title} className="rounded-2xl border border-[#e4dcf5] bg-white p-5 shadow-[0_10px_30px_rgba(76,29,149,0.055)]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2edff] text-[#6736c8]"><Icon className="h-5 w-5" aria-hidden /></span>
                    <span className="text-xs font-bold text-[#9a8db4]">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 font-bold text-[#21173c]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6c6579]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="grounds" className="scroll-mt-24 bg-[#faf8ff] py-16 md:py-20" aria-labelledby="grounds-title">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7040d1]">Common Section 8 grounds</p>
              <h2 id="grounds-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">Build the eviction notice around the facts you can prove.</h2>
              <p className="mt-4 text-lg leading-8 text-[#655e72]">The generator explains common grounds and helps you record the particulars and evidence. Select a ground only where the current facts support it.</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {grounds.map((ground) => (
                <article key={ground.code} className="group overflow-hidden rounded-2xl border border-[#e4dcf5] bg-white shadow-[0_12px_36px_rgba(76,29,149,0.06)]">
                  <Image src={ground.image} alt={ground.imageAlt} width={768} height={512} className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7040d1]">Ground {ground.code}</p>
                    <h3 className="mt-2 text-xl font-bold text-[#21173c]">{ground.title}</h3>
                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#6c6579]">{ground.copy}</p>
                    <CommercialSeoTrackedCta
                      href={ctaHref(ground.code)}
                      label={`Start Ground ${ground.code} notice`}
                      className="mt-4 inline-flex items-center font-bold text-[#6031bf] transition hover:text-[#441b99]"
                      variant="secondary"
                      sourcePage={sourcePage}
                      pageType="paid_landing_page"
                      intent={`section_8_ground_${ground.code}`}
                      ctaPosition="grounds"
                      recommendedProduct="notice_only"
                    >
                      Start with Ground {ground.code}<ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                    </CommercialSeoTrackedCta>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="preview" className="scroll-mt-24 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7040d1]">Document preview</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">See the real Section 8 sample pack before you pay.</h2>
              <p className="mt-4 text-lg leading-8 text-[#655e72]">Open the sample Form 3A, N215, rent schedule, validity checks and guidance directly on this page.</p>
            </div>
            <GoldenPackProof data={sampleProof} samplePageHref={samplePage?.samplePath} samplePageLabel="Open the complete sample pack" />
          </div>
        </section>

        <section className="bg-[#f8f5ff] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7040d1]">Choose the right stage</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">Do you need the notice or the court papers too?</h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="relative rounded-2xl border-2 border-[#7441da] bg-white p-7 shadow-[0_18px_50px_rgba(76,29,149,0.10)]">
                <span className="absolute right-5 top-5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Most landlords start here</span>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7040d1]">Stage 1</p>
                <h3 className="mt-3 text-2xl font-bold">Notice & Service Pack</h3>
                <p className="mt-3 text-4xl font-bold text-[#5322b3]">{PRODUCTS.notice_only.displayPrice}</p>
                <p className="mt-4 leading-7 text-[#655e72]">Choose this when your immediate job is preparing and serving the Section 8 notice correctly.</p>
                <ul className="mt-5 space-y-3 text-sm text-[#3f3750]">
                  {['Form 3A notice and selected grounds', 'N215 service record and instructions', 'Arrears schedule, checks and case summary', 'Watermarked preview before checkout'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />{item}</li>)}
                </ul>
                <CommercialSeoTrackedCta
                  href={ctaHref()}
                  label="Prepare my Section 8 notice"
                  className="mt-7 inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-[#6333d5] px-5 py-3 font-bold text-white transition hover:bg-[#4e22b2]"
                  variant="primary"
                  sourcePage={sourcePage}
                  pageType="paid_landing_page"
                  intent="section_8_eviction_notice"
                  ctaPosition="comparison"
                  recommendedProduct="notice_only"
                >Prepare my notice<ArrowRight className="ml-2 h-4 w-4" aria-hidden /></CommercialSeoTrackedCta>
              </article>

              <article className="rounded-2xl border border-[#ddd5eb] bg-white p-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#746d82]">Stage 2</p>
                <h3 className="mt-3 text-2xl font-bold">Court & Possession Pack</h3>
                <p className="mt-3 text-4xl font-bold text-[#21173c]">{PRODUCTS.complete_pack.displayPrice}</p>
                <p className="mt-4 leading-7 text-[#655e72]">Choose this if you already expect a possession claim and want the notice plus N5, N119 and court-stage file.</p>
                <ul className="mt-5 space-y-3 text-sm text-[#3f3750]">
                  {['Everything in the notice stage', 'N5 and N119 possession claim forms', 'Witness statement and evidence support', 'Court bundle and hearing preparation'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7040d1]" aria-hidden />{item}</li>)}
                </ul>
                <Link href="/products/complete-pack?src=google_ads_eviction_notice" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#bca9e2] bg-white px-5 py-3 font-bold text-[#5322b3] transition hover:border-[#7441da] hover:bg-[#faf8ff]">Compare the complete pack<ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <FAQSection faqs={faqs} title="Section 8 notice FAQs" intro="Answers about Form 3A, rent arrears, service and what is included in the £39.99 notice pack." />
          </div>
        </section>

        <section className="px-5 pb-16 md:px-8 md:pb-20">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#24124f,#4c1f8f_58%,#6f2bd1)] px-6 py-10 text-white shadow-[0_24px_60px_rgba(45,17,91,0.24)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9c9ff]">Make the next move with a clearer file</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-4xl">Do not let avoidable paperwork mistakes add to the delay.</h2>
                <p className="mt-4 text-lg leading-8 text-white/80">Prepare the Section 8 notice, supporting checks and service record together. Preview the generated file before paying {PRODUCTS.notice_only.displayPrice}.</p>
              </div>
              <CommercialSeoTrackedCta
                href={ctaHref()}
                label="Start my notice — preview first"
                className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 font-bold text-[#3e197e] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f7f2ff]"
                variant="primary"
                sourcePage={sourcePage}
                pageType="paid_landing_page"
                intent="section_8_eviction_notice"
                ctaPosition="final"
                recommendedProduct="notice_only"
              >Start my notice — preview first<ArrowRight className="ml-2 h-5 w-5" aria-hidden /></CommercialSeoTrackedCta>
            </div>
            <p className="relative mt-6 border-t border-white/15 pt-5 text-sm leading-6 text-white/65">Important: this is procedural document preparation, not legal advice. Take legal advice before serving where the facts are disputed, the tenancy is unusual or you expect a defence.</p>
          </div>
        </section>
      </div>
    </>
  );
}
