'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  RiArrowRightLine,
  RiFileCheckLine,
  RiFileTextLine,
  RiHome4Line,
  RiMoneyPoundCircleLine,
  RiScales3Line,
} from 'react-icons/ri';
import { clsx } from 'clsx';
import {
  PUBLIC_PRODUCT_DESCRIPTORS,
  getPublicProductDescriptor,
  getPublicProductOwnerHref,
  getPublicTenancyProducts,
  isPubliclyStartableProduct,
} from '@/lib/public-products';
import { initializeAttribution, resetWizardFlowTracking, setWizardAttribution } from '@/lib/wizard/wizardAttribution';
import { trackWizardEntryViewWithAttribution, trackWizardIncompatibleChoice } from '@/lib/analytics';

type CardProps = {
  href: string;
  title: string;
  description: string;
  price: string;
  eyebrow: string;
  accent: 'blue' | 'gold' | 'green' | 'slate';
};

const accentClasses: Record<CardProps['accent'], string> = {
  blue: 'border-blue-200 bg-blue-50/70 text-blue-950',
  gold: 'border-amber-200 bg-amber-50/80 text-amber-950',
  green: 'border-emerald-200 bg-emerald-50/80 text-emerald-950',
  slate: 'border-slate-200 bg-white text-slate-950',
};

function ProductCard({ href, title, description, price, eyebrow, accent }: CardProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'group rounded-3xl border p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md',
        accentClasses[accent]
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">{title}</h3>
        </div>
        <RiArrowRightLine className="mt-1 h-5 w-5 shrink-0 opacity-60 transition group-hover:translate-x-1" />
      </div>
      <p className="text-sm leading-6 opacity-85">{description}</p>
      <p className="mt-5 text-sm font-semibold">{price}</p>
    </Link>
  );
}

function buildFlowHref(
  product: string,
  baseType: 'eviction' | 'money_claim' | 'rent_increase' | 'tenancy_agreement',
  searchParams: URLSearchParams
): string {
  const params = new URLSearchParams();
  params.set('type', baseType);
  params.set('product', product);

  for (const key of ['src', 'topic', 'utm_source', 'utm_medium', 'utm_campaign']) {
    const value = searchParams.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  return `/wizard/flow?${params.toString()}`;
}

function getCaseTypeFromTopicOrProduct(
  product: string | null,
  type: string | null,
  topic: string | null
): 'eviction' | 'money_claim' | 'rent_increase' | 'tenancy_agreement' | null {
  if (type === 'eviction' || type === 'money_claim' || type === 'rent_increase' || type === 'tenancy_agreement') {
    return type;
  }

  switch (product) {
    case 'notice_only':
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
      return 'money_claim';
    case 'section13_standard':
    case 'section13_defensive':
      return 'rent_increase';
    case 'tenancy_agreement':
    case 'england_standard_tenancy_agreement':
    case 'england_premium_tenancy_agreement':
    case 'england_student_tenancy_agreement':
    case 'england_hmo_shared_house_tenancy_agreement':
    case 'england_lodger_agreement':
      return 'tenancy_agreement';
    default:
      return topic === 'tenancy'
        ? 'tenancy_agreement'
        : topic === 'debt'
          ? 'money_claim'
          : topic === 'rent-increase'
            ? 'rent_increase'
            : topic === 'eviction'
              ? 'eviction'
              : null;
  }
}

export default function WizardClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  const rawProduct = searchParams.get('product');
  const rawType = searchParams.get('type');
  const rawTopic = searchParams.get('topic');
  const rawJurisdiction = searchParams.get('jurisdiction');

  const tenancyCards = useMemo(() => getPublicTenancyProducts(), []);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    handledRef.current = true;
    resetWizardFlowTracking();

    const baseAttribution = initializeAttribution();
    const caseType = getCaseTypeFromTopicOrProduct(rawProduct, rawType, rawTopic);
    const productDescriptor = getPublicProductDescriptor(rawProduct);

    const attribution = setWizardAttribution({
      ...baseAttribution,
      product: rawProduct || undefined,
      jurisdiction: 'england',
      topic: rawTopic || (caseType === 'tenancy_agreement' ? 'tenancy' : caseType === 'money_claim' ? 'debt' : 'eviction'),
      src: searchParams.get('src') || undefined,
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
    });

    trackWizardEntryViewWithAttribution({
      product: rawProduct || 'wizard_home',
      jurisdiction: 'england',
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
    });

    if (rawJurisdiction && rawJurisdiction !== 'england') {
      trackWizardIncompatibleChoice({
        attemptedProduct: rawProduct || caseType || 'wizard',
        jurisdiction: rawJurisdiction,
        resolvedProduct: rawProduct || 'notice_only',
        action: 'redirect',
        src: attribution.src,
        topic: attribution.topic,
      });

      router.replace(getPublicProductOwnerHref(rawProduct, caseType));
      return;
    }

    if (rawProduct === 'tenancy_agreement') {
      router.replace(buildFlowHref('tenancy_agreement', 'tenancy_agreement', new URLSearchParams(searchParams.toString())));
      return;
    }

    if (rawProduct && productDescriptor) {
      router.replace(
        buildFlowHref(
          productDescriptor.productType,
          productDescriptor.category === 'tenancy'
            ? 'tenancy_agreement'
            : productDescriptor.category,
          new URLSearchParams(searchParams.toString())
        )
      );
      return;
    }

    if (rawProduct && !isPubliclyStartableProduct(rawProduct)) {
      router.replace(getPublicProductOwnerHref(rawProduct, caseType));
    }
  }, [rawJurisdiction, rawProduct, rawTopic, rawType, router, searchParams]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Landlord Heaven Wizard
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Start the right landlord product without a jurisdiction chooser.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Public starts currently cover properties in England. Choose the landlord task you
                need and we take you straight into the matching workflow under the current rules.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">What to expect</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Public starts currently cover England.</li>
                <li>Historic Wales, Scotland, and Northern Ireland cases still work through direct account access.</li>
                <li>Eviction entry starts with two clear routes: notice or full court pack.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <RiScales3Line className="h-5 w-5 text-slate-500" />
          <h2 className="text-2xl font-semibold">Eviction in England</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Start with the route you actually need. The notice product is for serving a Section 8
          notice under the post-May 2026 rules. The court pack takes you from notice through N5,
          N119, and the possession claim route.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ProductCard
            href={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.wizardHref}
            title={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.shortName}
            description="Generate a Section 8 notice for England with checks on grounds, dates, service, and court-readiness before you buy."
            price={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.priceLabel}
            eyebrow="Step 1: Notice"
            accent="blue"
          />
          <ProductCard
            href={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.wizardHref}
            title={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.shortName}
            description="Prepare the full England possession route with notice, N5, N119, evidence prompts, and a clearer court handoff."
            price={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.priceLabel}
            eyebrow="Step 2: Court"
            accent="gold"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <ProductCard
            href={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.wizardHref}
            title={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.shortName}
            description="Recover unpaid rent, damage, bills, and former-tenant debt through the England money claim route."
            price={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.priceLabel}
            eyebrow="Debt Recovery"
            accent="green"
          />
          <ProductCard
            href={PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.wizardHref}
            title={PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.shortName}
            description="Increase rent in England using the Section 13 and Form 4A route without mixing in eviction or debt copy."
            price={PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.priceLabel}
            eyebrow="Rent Increase"
            accent="slate"
          />
          <ProductCard
            href={PUBLIC_PRODUCT_DESCRIPTORS.ast.wizardHref}
            title={PUBLIC_PRODUCT_DESCRIPTORS.ast.shortName}
            description="Choose the right England tenancy agreement for Standard, Premium, Student, HMO / Shared House, or Lodger use."
            price={PUBLIC_PRODUCT_DESCRIPTORS.ast.priceLabel}
            eyebrow="Tenancy Agreements"
            accent="slate"
          />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <RiHome4Line className="h-5 w-5 text-slate-500" />
            <h2 className="text-2xl font-semibold">England tenancy agreements</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            These exact products now own their own landlord intent. Use the tenancy hub if you want
            help choosing, or jump straight into the matching agreement below.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {tenancyCards.map((product) => (
              <Link
                key={product.key}
                href={product.wizardHref}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <RiFileCheckLine className="mt-1 h-5 w-5 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {product.priceLabel}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-6">{product.shortName}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{product.metaDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white sm:px-8">
          <div className="flex items-start gap-4">
            <RiFileTextLine className="mt-1 h-6 w-6 shrink-0 text-slate-300" />
            <div>
              <h2 className="text-2xl font-semibold">Need the England route first?</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Use the public product pages if you want the SEO guide first, or go straight into
                the wizard if you already know the route you need.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Section 8 product page
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Court pack product page
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Tenancy agreement hub
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
