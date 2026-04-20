'use client';

import { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  RiArrowRightLine,
  RiFileCheckLine,
  RiFileTextLine,
  RiHome4Line,
  RiMoneyPoundCircleLine,
  RiScales3Line,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { clsx } from 'clsx';
import {
  getPublicCardAccentClasses,
  PUBLIC_LAYOUT_CLASSES,
} from '@/lib/public-brand';
import {
  PUBLIC_PRODUCT_DESCRIPTORS,
  getPublicProductDescriptor,
  getPublicProductOwnerHref,
  getPublicTenancyProducts,
  isPubliclyStartableProduct,
} from '@/lib/public-products';
import {
  initializeAttribution,
  resetWizardFlowTracking,
  setWizardAttribution,
} from '@/lib/wizard/wizardAttribution';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { wizardHeroConfig } from '@/components/landing/heroConfigs';
import {
  trackWizardEntryViewWithAttribution,
  trackWizardIncompatibleChoice,
} from '@/lib/analytics';

type CardProps = {
  href: string;
  title: string;
  description: string;
  price: string;
  eyebrow: string;
  accent: typeof PUBLIC_PRODUCT_DESCRIPTORS.notice_only.cardAccent;
  imageSrc: string;
  imageAlt: string;
};

const routeImages: Record<string, { src: string; alt: string }> = {
  notice_only: {
    src: '/images/notice_bundles.webp',
    alt: 'Section 8 notice generator preview',
  },
  complete_pack: {
    src: '/images/eviction_packs.webp',
    alt: 'Complete eviction pack preview',
  },
  money_claim: {
    src: '/images/money_claims.webp',
    alt: 'Money claim pack preview',
  },
  section13_standard: {
    src: '/images/Statutory-change.webp',
    alt: 'Rent increase pack preview',
  },
  ast: {
    src: '/images/tenancy_agreements.webp',
    alt: 'England tenancy agreement preview',
  },
  england_standard_tenancy_agreement: {
    src: '/images/standard_tenancy.webp',
    alt: 'Standard tenancy agreement preview',
  },
  england_premium_tenancy_agreement: {
    src: '/images/premium_tenancy.webp',
    alt: 'Premium tenancy agreement preview',
  },
  england_student_tenancy_agreement: {
    src: '/images/student_tenency.webp',
    alt: 'Student tenancy agreement preview',
  },
  england_hmo_shared_house_tenancy_agreement: {
    src: '/images/hmo_tenency_agreement.webp',
    alt: 'HMO shared house tenancy agreement preview',
  },
  england_lodger_agreement: {
    src: '/images/room_let_agreement.webp',
    alt: 'Lodger agreement preview',
  },
};

const WIZARD_ENTRY_TITLE = 'Choose the landlord product you need';
const WIZARD_ENTRY_SUBTITLE =
  'Choose the product that matches the job in front of you';

function ProductCard({
  href,
  title,
  description,
  price,
  eyebrow,
  accent,
  imageSrc,
  imageAlt,
}: CardProps) {
  const accentStyles = getPublicCardAccentClasses(accent);

  return (
    <Link
      href={href}
      className={clsx(
        'group overflow-hidden rounded-[2rem] border transition duration-200',
        accentStyles.card,
        accentStyles.borderGlow,
        PUBLIC_LAYOUT_CLASSES.card
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-black/5">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={clsx('inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]', accentStyles.chip)}>
              {eyebrow}
            </p>
            <h3 className="mt-4 text-2xl font-semibold leading-tight">{title}</h3>
          </div>
          <RiArrowRightLine className="mt-1 h-5 w-5 shrink-0 opacity-60 transition group-hover:translate-x-1" />
        </div>
        <p className="mt-4 text-sm leading-7 text-[#5a516d]">{description}</p>
        <p className="mt-5 text-sm font-semibold text-[#2d2344]">{price}</p>
      </div>
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
  if (
    type === 'eviction' ||
    type === 'money_claim' ||
    type === 'rent_increase' ||
    type === 'tenancy_agreement'
  ) {
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
      topic:
        rawTopic ||
        (caseType === 'tenancy_agreement'
          ? 'tenancy'
          : caseType === 'money_claim'
            ? 'debt'
            : 'eviction'),
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
      router.replace(
        buildFlowHref(
          'tenancy_agreement',
          'tenancy_agreement',
          new URLSearchParams(searchParams.toString())
        )
      );
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
    <main className={clsx(PUBLIC_LAYOUT_CLASSES.page, 'min-h-screen text-[#1d1532]')}>
      <UniversalHero {...wizardHeroConfig} ariaLabel={WIZARD_ENTRY_TITLE}>
        <p className="sr-only">{WIZARD_ENTRY_SUBTITLE}</p>
        <div className="mt-6 max-w-[34rem] rounded-[1.6rem] border border-white/12 bg-white/10 p-5 text-white shadow-[0_20px_52px_rgba(18,8,38,0.16)] backdrop-blur-sm">
          <p className="text-sm font-semibold text-white">Before you start</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/78">
            <li className="flex items-start gap-3">
              <RiShieldCheckLine className="mt-1 h-4 w-4 shrink-0 text-[#d7c2ff]" />
              <span>Start with the exact England product you need.</span>
            </li>
            <li className="flex items-start gap-3">
              <RiShieldCheckLine className="mt-1 h-4 w-4 shrink-0 text-[#d7c2ff]" />
              <span>Eviction starts with two choices: Section 8 notice or the full court pack.</span>
            </li>
            <li className="flex items-start gap-3">
              <RiShieldCheckLine className="mt-1 h-4 w-4 shrink-0 text-[#d7c2ff]" />
              <span>Northern Ireland properties currently support tenancy agreements only.</span>
            </li>
          </ul>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-white/70">
            <p>Different rules apply in each jurisdiction. Northern Ireland shows a tenancy-agreements-only note on eviction and money-claim entry paths.</p>
            <p className="mt-2 font-semibold text-white/82">Tenancy agreements only</p>
            <p className="mt-2">If you continue from an eviction or money-claim entry point, we’ll switch you to the tenancy agreement flow.</p>
          </div>
        </div>
      </UniversalHero>

      <section id="wizard-eviction" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
          <div className="flex items-center gap-3">
            <RiScales3Line className="h-5 w-5 text-[#6b3fd1]" />
            <h2 className="text-2xl font-semibold text-[#1d1532]">Eviction in England</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a516d]">
            Choose the eviction product that fits what you need to do. The notice
            product is for serving a Section 8 notice under the post-May 2026
            rules. The court pack adds N5, N119, and the possession paperwork.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ProductCard
              href={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.wizardHref}
              title={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.shortName}
              description="Generate a Section 8 notice for England with checks on grounds, dates, service, and court-readiness before you buy."
              price={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.priceLabel}
              eyebrow="Step 1: Notice"
              accent={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.cardAccent}
              imageSrc={routeImages.notice_only.src}
              imageAlt={routeImages.notice_only.alt}
            />
            <ProductCard
              href={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.wizardHref}
              title={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.shortName}
              description="Prepare the full England possession case with the notice, N5, N119, evidence prompts, and court paperwork together."
              price={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.priceLabel}
              eyebrow="Step 2: Court"
              accent={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.cardAccent}
              imageSrc={routeImages.complete_pack.src}
              imageAlt={routeImages.complete_pack.alt}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-2 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <ProductCard
              href={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.wizardHref}
              title={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.shortName}
              description="Recover unpaid rent, damage, bills, and former-tenant debt through the England county court process."
            price={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.priceLabel}
            eyebrow="Debt recovery"
            accent={PUBLIC_PRODUCT_DESCRIPTORS.money_claim.cardAccent}
            imageSrc={routeImages.money_claim.src}
            imageAlt={routeImages.money_claim.alt}
          />
          <ProductCard
              href={PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.wizardHref}
              title="Rent Increase"
              description="Increase rent in England using Section 13 and Form 4A without mixing in eviction or debt paperwork."
            price={PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.priceLabel}
            eyebrow="Rent increase"
            accent={PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.cardAccent}
            imageSrc={routeImages.section13_standard.src}
            imageAlt={routeImages.section13_standard.alt}
          />
          <ProductCard
            href={PUBLIC_PRODUCT_DESCRIPTORS.ast.wizardHref}
            title={PUBLIC_PRODUCT_DESCRIPTORS.ast.shortName}
            description="Choose the right England tenancy agreement for Standard, Premium, Student, HMO / Shared House, or Lodger use."
            price={PUBLIC_PRODUCT_DESCRIPTORS.ast.priceLabel}
            eyebrow="Tenancy agreements"
            accent={PUBLIC_PRODUCT_DESCRIPTORS.ast.cardAccent}
            imageSrc={routeImages.ast.src}
            imageAlt={routeImages.ast.alt}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-2 sm:px-6 lg:px-8">
        <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
          <div className="flex items-center gap-3">
            <RiHome4Line className="h-5 w-5 text-[#6b3fd1]" />
            <h2 className="text-2xl font-semibold text-[#1d1532]">England tenancy agreements</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a516d]">
            If you already know the exact agreement you need, jump straight in
            below. If you want help choosing between the five agreement options, start from
            the England tenancy hub.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {tenancyCards.map((product) => (
              <ProductCard
                key={product.key}
                href={product.wizardHref}
                title={product.shortName}
                description={product.metaDescription}
                price={product.priceLabel}
                eyebrow={product.eyebrow}
                accent={product.cardAccent}
                imageSrc={routeImages[product.key].src}
                imageAlt={routeImages[product.key].alt}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <div className={clsx(PUBLIC_LAYOUT_CLASSES.darkPanel, 'px-6 py-8 sm:px-8')}>
          <div className="flex items-start gap-4">
            <RiFileTextLine className="mt-1 h-6 w-6 shrink-0 text-white/72" />
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Prefer to read about the product first?
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
                Use the product pages if you want the overview and supporting
                guides first, or go straight into the wizard if you already know
                what you need.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1d1532]"
                >
                  Eviction Notice Generator
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-semibold text-white"
                >
                  Complete Eviction Pack
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-semibold text-white"
                >
                  England tenancy agreements
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
