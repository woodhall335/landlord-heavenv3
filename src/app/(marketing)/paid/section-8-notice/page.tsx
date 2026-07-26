import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, FileCheck2, ShieldCheck } from 'lucide-react';

import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { CommercialSeoTrackedCta } from '@/components/seo/CommercialSeoTrackedCta';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';

const sourcePage = '/paid/section-8-notice';
const noticeHref =
  '/wizard/flow?type=eviction&product=notice_only&src=google_ads&topic=eviction';

export const metadata: Metadata = {
  title: 'Section 8 Eviction Notice for Landlords | LandlordHeaven',
  description:
    'Create a solicitor-approved Section 8 eviction notice and service file for England. Covers rent arrears, persistent late rent, tenancy breaches and antisocial behaviour.',
  alternates: { canonical: getCanonicalUrl('/products/notice-only') },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Create Your Section 8 Eviction Notice',
    description:
      `Build and preview Form 3A, an arrears schedule and service file before paying ${PRODUCTS.notice_only.displayPrice}.`,
  },
};

const grounds = [
  {
    code: '8',
    title: 'Serious rent arrears',
    copy: 'For arrears that meet the current mandatory threshold at service and at the hearing.',
    image: '/images/tenant-is-not-paying-rent.webp',
    imageAlt: 'Landlord reviewing a case where a tenant is not paying rent',
  },
  {
    code: '10',
    title: 'Some rent remains unpaid',
    copy: 'A discretionary arrears ground that may support the notice where Ground 8 is unavailable.',
    image: '/images/the-court-looks-at-the-notice-first.webp',
    imageAlt: 'Court review of a landlord possession notice',
  },
  {
    code: '11',
    title: 'Persistent late payment',
    copy: 'For an evidenced history of late rent, even if arrears fluctuate.',
    image: '/images/tenant-keeps-paying-late.webp',
    imageAlt: 'Landlord tracking a tenant history of late rent payments',
  },
  {
    code: '12',
    title: 'Breach of tenancy',
    copy: 'For a supported breach of a tenancy obligation other than paying rent.',
    image: '/images/tenant-has-broken-the-tenancy-or-caused-damage.webp',
    imageAlt: 'Evidence of a broken tenancy term or property damage',
  },
  {
    code: '14',
    title: 'Antisocial behaviour',
    copy: 'For evidenced nuisance, annoyance, illegal use or antisocial behaviour.',
    image: '/images/specialist-housing-or-employment-case.webp',
    imageAlt: 'Housing officer assessing a specialist housing case',
  },
];

function ctaHref(ground?: string) {
  return `${noticeHref}${ground ? `&ground=${ground}` : ''}`;
}

export default function EvictionNoticePaidLandingPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <section className="bg-[#20164f] py-12 text-white md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8c8ff]">
              England landlords · Section 8 notice
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              Create your eviction notice and service file
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Answer guided questions, select the grounds supported by your facts and preview
              your Form 3A Section 8 notice before paying.
            </p>
            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              {[
                'Solicitor-approved document workflow',
                'Form 3A and N215 service record',
                'Rent arrears schedule included',
                'Preview before secure payment',
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#c9ff72]" aria-hidden />
                  {item}
                </span>
              ))}
            </div>
            <CommercialSeoTrackedCta
              href={ctaHref()}
              label={`Create my eviction notice — ${PRODUCTS.notice_only.displayPrice}`}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-[#20164f] shadow-lg transition hover:bg-[#f4efff]"
              variant="primary"
              sourcePage={sourcePage}
              pageType="paid_landing_page"
              intent="section_8_eviction_notice"
              ctaPosition="hero"
              recommendedProduct="notice_only"
            >
              Create my eviction notice — {PRODUCTS.notice_only.displayPrice}
              <ChevronRight className="ml-2 h-5 w-5" aria-hidden />
            </CommercialSeoTrackedCta>
            <p className="mt-3 text-sm text-white/70">
              One-off payment. No subscription. Procedural document preparation, not legal advice.
            </p>
          </div>

          <div className="relative">
            <Image
              src="/images/eviction_packs.webp"
              alt="Landlord Heaven eviction pack shown on a laptop"
              width={1536}
              height={1024}
              className="h-auto w-full drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[#e6dbff] bg-[#f8f4ff] py-6">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Solicitor-approved', copy: 'Built around the current England Section 8 workflow.' },
            { icon: FileCheck2, title: '8-document file', copy: 'Notice, service, arrears and next-step documents together.' },
            { icon: Check, title: 'Check before paying', copy: 'Review the watermarked output before checkout.' },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-bold text-gray-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="grounds" className="scroll-mt-24 bg-white py-14" aria-labelledby="grounds-title">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-3xl">
            <p className="font-semibold text-primary">Common Section 8 grounds</p>
            <h2 id="grounds-title" className="mt-2 text-3xl font-bold text-gray-950">
              Build the notice around the facts you can prove
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              The guided builder explains the grounds and helps you record the particulars and
              evidence. Only select a ground that fits your situation.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grounds.map((ground) => (
              <div
                key={ground.code}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <Image
                  src={ground.image}
                  alt={ground.imageAlt}
                  width={768}
                  height={512}
                  className="aspect-[3/2] w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">
                    Ground {ground.code}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-gray-950">{ground.title}</h3>
                  <p className="mt-2 min-h-20 text-sm leading-6 text-gray-600">{ground.copy}</p>
                  <CommercialSeoTrackedCta
                    href={ctaHref(ground.code)}
                    label={`Start Ground ${ground.code} notice`}
                    className="mt-4 inline-flex items-center font-bold text-primary hover:underline"
                    variant="secondary"
                    sourcePage={sourcePage}
                    pageType="paid_landing_page"
                    intent={`section_8_ground_${ground.code}`}
                    ctaPosition="grounds"
                    recommendedProduct="notice_only"
                  >
                    Start Ground {ground.code} notice
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </CommercialSeoTrackedCta>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f4ff] py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-primary bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Most landlords start here</p>
            <h2 className="mt-2 text-2xl font-bold">Notice & Service Pack</h2>
            <p className="mt-2 text-3xl font-bold">{PRODUCTS.notice_only.displayPrice}</p>
            <ul className="mt-5 space-y-2 text-sm text-gray-700">
              <li>Form 3A Section 8 notice</li>
              <li>N215 service record and instructions</li>
              <li>Arrears schedule, checks and case summary</li>
            </ul>
            <CommercialSeoTrackedCta
              href={ctaHref()}
              label="Create and preview"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-[#5424aa]"
              variant="primary"
              sourcePage={sourcePage}
              pageType="paid_landing_page"
              intent="section_8_eviction_notice"
              ctaPosition="pricing"
              recommendedProduct="notice_only"
            >
              Create and preview
            </CommercialSeoTrackedCta>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Need court papers as well?</p>
            <h2 className="mt-2 text-2xl font-bold">Court & Possession Pack</h2>
            <p className="mt-2 text-3xl font-bold">{PRODUCTS.complete_pack.displayPrice}</p>
            <p className="mt-5 leading-7 text-gray-600">
              Choose the complete pack if you expect to issue a possession claim and want the
              notice, N5, N119 and court-stage paperwork in one workflow.
            </p>
            <Link
              href="/products/complete-pack?src=google_ads_eviction_notice"
              className="mt-6 inline-flex items-center font-bold text-primary hover:underline"
            >
              Compare the complete pack
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
