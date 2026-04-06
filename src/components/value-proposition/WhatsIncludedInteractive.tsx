'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Container } from '@/components/ui';
import type {
  JurisdictionKey,
  NoticeOnlyPreviewData,
  NoticeVariantKey,
  PreviewDoc,
} from '@/lib/previews/noticeOnlyPreviews';
import type { CompletePackPreviewData, CompletePackVariantKey } from '@/lib/previews/completePackPreviews';
import type { MoneyClaimPreviewData } from '@/lib/previews/moneyClaimPreviews';
import type {
  TenancyAgreementPreviewData,
  TenancyPreviewJurisdiction,
  TenancyPreviewTier,
} from '@/lib/previews/tenancyAgreementPreviews';

type WhatsIncludedInteractiveProps =
  | {
      product: 'notice_only';
      defaultJurisdiction?: JurisdictionKey;
      previews: NoticeOnlyPreviewData;
      titleOverride?: string;
      subtitleOverride?: string;
      showIntro?: boolean;
      ctaHref?: string;
      ctaLabel?: string;
    }
  | {
      product: 'complete_pack';
      defaultVariant?: CompletePackVariantKey;
      previews: CompletePackPreviewData;
      titleOverride?: string;
      subtitleOverride?: string;
      showIntro?: boolean;
      ctaHref?: string;
      ctaLabel?: string;
    }
  | {
      product: 'money_claim';
      previews: MoneyClaimPreviewData;
      titleOverride?: string;
      subtitleOverride?: string;
      showIntro?: boolean;
      ctaHref?: string;
      ctaLabel?: string;
    }
  | {
      product: 'ast';
      defaultJurisdiction?: TenancyPreviewJurisdiction;
      defaultTier?: TenancyPreviewTier;
      previews: TenancyAgreementPreviewData;
      titleOverride?: string;
      subtitleOverride?: string;
      showIntro?: boolean;
      ctaHref?: string;
      ctaLabel?: string;
      lockJurisdiction?: boolean;
    };

type NoticeVariant = {
  key: NoticeVariantKey;
  label: string;
  description: string;
};

type JurisdictionConfig = {
  label: string;
  legalNote: string;
  noticeVariants: NoticeVariant[];
};

type TenancyTierOption = {
  key: TenancyPreviewTier;
  label: string;
  description: string;
};

type TenancyJurisdictionConfig = {
  label: string;
  legalNote: string;
  tierOptions: TenancyTierOption[];
};

type InteractiveJurisdictionKey = JurisdictionKey | TenancyPreviewJurisdiction;

const NOTICE_ONLY_CONFIG: Record<JurisdictionKey, JurisdictionConfig> = {
  england: {
    label: 'England',
    legalNote: 'Housing Act 1988 compliant',
    noticeVariants: [
      {
        key: 'section8',
        label: 'Current England possession route',
        description: 'Form 3A possession notice with current grounds-based guidance.',
      },
    ],
  },
  wales: {
    label: 'Wales',
    legalNote: 'Renting Homes (Wales) Act 2016 compliant',
    noticeVariants: [
      {
        key: 'section173',
        label: 'Section 173 Notice',
        description: 'No-fault possession notice for Wales.',
      },
      {
        key: 'rhw23',
        label: 'Fault-based Notice (RHW23)',
        description: 'Fault-based notice for breach, arrears, or ASB.',
      },
    ],
  },
  scotland: {
    label: 'Scotland',
    legalNote: 'Private Housing (Tenancies) (Scotland) Act 2016 compliant',
    noticeVariants: [
      {
        key: 'notice-to-leave',
        label: 'Notice to Leave (PRT)',
        description: 'Notice to Leave for private residential tenancies.',
      },
    ],
  },
};

const TENANCY_CONFIG: Record<TenancyPreviewJurisdiction, TenancyJurisdictionConfig> = {
  england: {
    label: 'England',
    legalNote: 'Assured periodic tenancy pack for England',
    tierOptions: [
      {
        key: 'standard',
        label: 'Standard',
        description: 'Core 5-document pack for straightforward England lets.',
      },
      {
        key: 'premium',
        label: 'Premium',
        description: 'Core pack plus support documents and broader drafting for complex lets.',
      },
    ],
  },
  wales: {
    label: 'Wales',
    legalNote: 'Occupation contract pack for Wales',
    tierOptions: [
      {
        key: 'standard',
        label: 'Standard',
        description: 'Core pack for straightforward Welsh occupation contracts.',
      },
      {
        key: 'premium',
        label: 'Premium',
        description: 'Core pack plus support documents for more complex Welsh lets.',
      },
    ],
  },
  scotland: {
    label: 'Scotland',
    legalNote: 'Private Residential Tenancy pack for Scotland',
    tierOptions: [
      {
        key: 'standard',
        label: 'Standard',
        description: 'Core pack including Easy Read Notes for straightforward Scottish lets.',
      },
      {
        key: 'premium',
        label: 'Premium',
        description: 'Core Scottish pack plus support documents for more complex lets.',
      },
    ],
  },
  'northern-ireland': {
    label: 'Northern Ireland',
    legalNote: 'Private tenancy pack for Northern Ireland',
    tierOptions: [
      {
        key: 'standard',
        label: 'Standard',
        description: 'Core pack for straightforward Northern Ireland lets.',
      },
      {
        key: 'premium',
        label: 'Premium',
        description: 'Core pack plus support documents for more complex Northern Ireland lets.',
      },
    ],
  },
};

const jurisdictionOrder: JurisdictionKey[] = ['england', 'wales', 'scotland'];
const tenancyJurisdictionOrder: TenancyPreviewJurisdiction[] = [
  'england',
  'wales',
  'scotland',
  'northern-ireland',
];

const COMPLETE_PACK_VARIANTS: NoticeVariant[] = [
  {
    key: 'section8',
    label: 'Current England possession pack',
    description: 'Form 3A, N5, and N119 workflow for the current England route.',
  },
];

const getDefaultTitle = (product: WhatsIncludedInteractiveProps['product']) => {
  if (product === 'notice_only') {
    return "What's included in your notice";
  }
  if (product === 'complete_pack') {
    return "What's included in your eviction pack";
  }
  if (product === 'ast') {
    return "What's included in your tenancy agreement pack";
  }
  return "What's included in your money claim pack";
};

const getDefaultSubtitle = (product: WhatsIncludedInteractiveProps['product']) => {
  if (product === 'notice_only') {
    return 'Select your jurisdiction, then preview every document in the pack.';
  }
  if (product === 'complete_pack') {
    return 'England-only pack. Preview the current notice-to-claim workflow before you buy.';
  }
  if (product === 'ast') {
    return 'Select your jurisdiction and product level, then preview every document in the pack.';
  }
  return 'England-only pack. Preview every document before you buy.';
};

const getDocumentDescription = (document: PreviewDoc) => {
  if (document.description) return document.description;

  const haystack = `${document.key} ${document.title}`.toLowerCase();

  if (haystack.includes('agreement') || haystack.includes('contract') || haystack.includes('tenancy')) {
    return 'Core agreement document generated from your property and tenancy details.';
  }
  if (haystack.includes('inventory')) return 'Record of condition, contents, and handover evidence for check-in.';
  if (haystack.includes('deposit')) return 'Deposit-compliance document included in the tenancy pack.';
  if (haystack.includes('key')) return 'Key and access handover record for the tenancy file.';
  if (haystack.includes('maintenance')) return 'Practical guidance for repairs, reporting, and property care.';
  if (haystack.includes('checkout')) return 'End-of-tenancy handback and checkout process guidance.';
  if (haystack.includes('service')) return 'How to serve your documents correctly.';
  if (haystack.includes('validity') || haystack.includes('checklist')) return 'Checks to reduce avoidable compliance mistakes.';
  if (haystack.includes('witness')) return 'AI-assisted draft witness statement for court.';
  if (haystack.includes('enforcement')) return 'Next steps to enforce a successful judgment.';
  if (haystack.includes('court-filing') || haystack.includes('filing')) return 'Step-by-step guide for filing your claim in court.';
  if (haystack.includes('schedule') || haystack.includes('arrears')) return 'Clear rent arrears breakdown supporting your claim.';
  if (haystack.includes('particulars')) return 'Detailed legal basis for your claim.';
  if (haystack.includes('financial-statement')) return 'PAP-DEBT financial statement template.';
  if (haystack.includes('reply-form')) return 'Tenant response form under the pre-action protocol.';
  if (haystack.includes('information-sheet')) return 'Defendant information sheet for PAP-DEBT.';
  if (haystack.includes('letter-before-claim')) return 'Pre-action letter template before issuing proceedings.';
  if (haystack.includes('interest')) return 'Interest calculation worksheet for the court claim.';
  if (haystack.includes('n1') || haystack.includes('claim-form')) return 'Core claim form template for issuing proceedings.';
  if (haystack.includes('section') || haystack.includes('notice') || haystack.includes('form-3a') || haystack.includes('form-3')) {
    return 'Primary legal notice generated from your case details.';
  }

  return 'Included document in your generated pack.';
};

const getDocumentIcon = (document: PreviewDoc) => {
  const haystack = `${document.key} ${document.title}`.toLowerCase();

  if (haystack.includes('agreement') || haystack.includes('contract') || haystack.includes('tenancy')) {
    return '/images/wizard-icons/06-notice-details.png';
  }
  if (haystack.includes('inventory') || haystack.includes('condition')) {
    return '/images/wizard-icons/38-evidence-pack.png';
  }
  if (haystack.includes('deposit') || haystack.includes('prescribed')) {
    return '/images/wizard-icons/05-compliance.png';
  }
  if (haystack.includes('key')) return '/images/wizard-icons/17-service-proof.png';
  if (haystack.includes('maintenance') || haystack.includes('checkout')) {
    return '/images/wizard-icons/20-enforcement.png';
  }
  if (haystack.includes('service')) return '/images/wizard-icons/17-service-proof.png';
  if (haystack.includes('validity') || haystack.includes('checklist')) return '/images/wizard-icons/05-compliance.png';
  if (haystack.includes('witness') || haystack.includes('evidence')) return '/images/wizard-icons/38-evidence-pack.png';
  if (haystack.includes('enforcement')) return '/images/wizard-icons/20-enforcement.png';
  if (haystack.includes('court') || haystack.includes('n1') || haystack.includes('n5')) return '/images/wizard-icons/09-court.png';
  if (haystack.includes('arrears') || haystack.includes('rent')) return '/images/wizard-icons/15-rent-arrears.png';
  if (haystack.includes('financial')) return '/images/wizard-icons/37-payment-plan.png';

  return '/images/wizard-icons/06-notice-details.png';
};

type PreviewImageProps = {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  className?: string;
};

const PreviewImage = ({ src, alt, title, width, height, className }: PreviewImageProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-[#7c3aed]/20 bg-[#f3e8ff] px-4 text-center ${
          className ?? ''
        }`}
      >
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#2f0d68]">Preview coming soon</p>
          <p className="text-xs text-[#7c3aed]/90">{title}</p>
          <p className="text-[11px] text-[#7c3aed]/70">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
};

export const WhatsIncludedInteractive = (props: WhatsIncludedInteractiveProps) => {
  const { product, previews } = props;
  const isNoticeOnly = product === 'notice_only';
  const isCompletePack = product === 'complete_pack';
  const isAst = product === 'ast';
  const showIntro = props.showIntro ?? true;
  const initialJurisdiction: InteractiveJurisdictionKey = isNoticeOnly
    ? props.defaultJurisdiction ?? 'england'
    : isAst
      ? props.defaultJurisdiction ?? 'england'
      : 'england';
  const initialPackVariant = isCompletePack ? props.defaultVariant ?? 'section8' : 'section8';
  const initialTenancyTier = isAst ? props.defaultTier ?? 'standard' : 'standard';

  const [selectedJurisdiction, setSelectedJurisdiction] = useState<InteractiveJurisdictionKey>(initialJurisdiction);
  const defaultNoticeVariantKey = isNoticeOnly
    ? NOTICE_ONLY_CONFIG[selectedJurisdiction as JurisdictionKey].noticeVariants[0].key
    : 'section8';
  const [selectedNoticeVariant, setSelectedNoticeVariant] = useState<NoticeVariantKey>(defaultNoticeVariantKey);
  const [selectedPackVariant, setSelectedPackVariant] = useState<CompletePackVariantKey>(initialPackVariant);
  const [selectedTenancyTier, setSelectedTenancyTier] = useState<TenancyPreviewTier>(initialTenancyTier);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDocKey, setSelectedDocKey] = useState<string>(() => {
    if (product === 'notice_only') {
      const noticePreviews = previews as NoticeOnlyPreviewData;
      return noticePreviews[initialJurisdiction as JurisdictionKey]?.[defaultNoticeVariantKey]?.[0]?.key
        ?? 'preview-placeholder';
    }
    if (isCompletePack) {
      const packPreviews = previews as CompletePackPreviewData;
      return packPreviews[initialPackVariant]?.[0]?.key ?? 'preview-placeholder';
    }
    if (isAst) {
      const tenancyPreviews = previews as TenancyAgreementPreviewData;
      return tenancyPreviews[initialJurisdiction as TenancyPreviewJurisdiction]?.[initialTenancyTier]?.[0]?.key
        ?? 'preview-placeholder';
    }

    const moneyClaimPreviews = previews as MoneyClaimPreviewData;
    return moneyClaimPreviews[0]?.key ?? 'preview-placeholder';
  });

  const jurisdictionConfig = isNoticeOnly ? NOTICE_ONLY_CONFIG[selectedJurisdiction as JurisdictionKey] : null;
  const tenancyConfig = isAst ? TENANCY_CONFIG[selectedJurisdiction as TenancyPreviewJurisdiction] : null;
  const noticeVariants = jurisdictionConfig?.noticeVariants ?? [];
  const effectiveNoticeVariant = noticeVariants.some((variant) => variant.key === selectedNoticeVariant)
    ? selectedNoticeVariant
    : noticeVariants[0]?.key;

  const documents = isNoticeOnly
    ? (previews as NoticeOnlyPreviewData)[selectedJurisdiction as JurisdictionKey]?.[effectiveNoticeVariant ?? 'section8'] ?? []
    : isCompletePack
      ? (previews as CompletePackPreviewData)[selectedPackVariant] ?? []
      : isAst
        ? (previews as TenancyAgreementPreviewData)[selectedJurisdiction as TenancyPreviewJurisdiction]?.[selectedTenancyTier] ?? []
        : (previews as MoneyClaimPreviewData);

  const effectiveDocKey = documents.some((document) => document.key === selectedDocKey)
    ? selectedDocKey
    : documents[0]?.key ?? 'preview-placeholder';
  const activeDoc = documents.find((document) => document.key === effectiveDocKey) ?? documents[0];

  const title = props.titleOverride ?? getDefaultTitle(product);
  const subtitle = props.subtitleOverride ?? getDefaultSubtitle(product);
  const showNoticeTypeSelector = isCompletePack
    ? COMPLETE_PACK_VARIANTS.length > 1
    : isNoticeOnly && selectedJurisdiction !== 'scotland' && noticeVariants.length > 1;
  const lockJurisdiction = isAst ? props.lockJurisdiction ?? false : false;
  const legalNote = isNoticeOnly ? jurisdictionConfig?.legalNote : isAst ? tenancyConfig?.legalNote : 'England only';

  let defaultCtaHref = 'https://landlordheaven.co.uk/wizard?product=money_claim&topic=debt&src=product_page';
  let defaultCtaLabel = 'Start my money claim pack ->';

  if (product === 'notice_only') {
    defaultCtaHref = 'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction';
    defaultCtaLabel = 'Generate my notice bundle ->';
  } else if (product === 'complete_pack') {
    defaultCtaHref = 'https://landlordheaven.co.uk/wizard?product=complete_pack&src=product_page&topic=eviction';
    defaultCtaLabel = 'Start your complete pack ->';
  } else if (product === 'ast') {
    defaultCtaHref = `https://landlordheaven.co.uk/wizard?product=${selectedTenancyTier === 'premium' ? 'ast_premium' : 'ast_standard'}&jurisdiction=${selectedJurisdiction}&src=product_page&topic=tenancy`;
    defaultCtaLabel =
      selectedTenancyTier === 'premium' ? 'Start my premium tenancy pack ->' : 'Start my standard tenancy pack ->';
  }

  const ctaHref = props.ctaHref ?? defaultCtaHref;
  const ctaLabel = props.ctaLabel ?? defaultCtaLabel;

  const documentEntries = documents.map((document) => ({
    ...document,
    description: getDocumentDescription(document),
    icon: getDocumentIcon(document),
  }));

  useEffect(() => {
    if (!isPreviewModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPreviewModalOpen]);

  return (
    <section className="overflow-x-clip py-12 md:py-14">
      <Container>
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-b from-[#fcfaff] to-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.08)] sm:p-5 md:p-8">
          {showIntro ? (
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-[#2f0d68] md:text-4xl">{title}</h2>
              <p className="mt-3 text-base text-[#5b4b7a] md:text-lg">{subtitle}</p>
            </div>
          ) : null}

          <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
            <div className="min-w-0 space-y-5 rounded-2xl border border-[#E9E2FF] bg-white p-4 md:p-6">
              {isNoticeOnly ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5b4b7a]">Jurisdiction</h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {jurisdictionOrder.map((jurisdiction) => {
                      const isActive = selectedJurisdiction === jurisdiction;
                      return (
                        <button
                          key={jurisdiction}
                          type="button"
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
                            isActive
                              ? 'border-[#7c3aed]/60 bg-[#f4efff] text-[#2f0d68]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#7c3aed]/35'
                          }`}
                          aria-pressed={isActive}
                          onClick={() => setSelectedJurisdiction(jurisdiction)}
                        >
                          {NOTICE_ONLY_CONFIG[jurisdiction].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {isAst && !lockJurisdiction ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5b4b7a]">Jurisdiction</h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tenancyJurisdictionOrder.map((jurisdiction) => {
                      const isActive = selectedJurisdiction === jurisdiction;
                      return (
                        <button
                          key={jurisdiction}
                          type="button"
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
                            isActive
                              ? 'border-[#7c3aed]/60 bg-[#f4efff] text-[#2f0d68]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#7c3aed]/35'
                          }`}
                          aria-pressed={isActive}
                          onClick={() => setSelectedJurisdiction(jurisdiction)}
                        >
                          {TENANCY_CONFIG[jurisdiction].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {showNoticeTypeSelector ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5b4b7a]">Notice type</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(isNoticeOnly ? noticeVariants : COMPLETE_PACK_VARIANTS).map((variant) => {
                      const isActive = (isNoticeOnly ? effectiveNoticeVariant : selectedPackVariant) === variant.key;
                      return (
                        <button
                          key={variant.key}
                          type="button"
                          className={`min-w-0 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
                            isActive
                              ? 'border-[#7c3aed]/60 bg-[#f4efff] shadow-sm'
                              : 'border-gray-200 bg-white hover:border-[#7c3aed]/35'
                          }`}
                          aria-pressed={isActive}
                          onClick={() => {
                            if (isNoticeOnly) {
                              setSelectedNoticeVariant(variant.key as NoticeVariantKey);
                            } else {
                              setSelectedPackVariant(variant.key as CompletePackVariantKey);
                            }
                          }}
                        >
                          <p className="text-base font-semibold text-[#2f0d68] break-words">{variant.label}</p>
                          <p className="mt-1 text-sm text-gray-600 break-words">{variant.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {isAst ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5b4b7a]">Product level</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {tenancyConfig?.tierOptions.map((tier) => {
                      const isActive = selectedTenancyTier === tier.key;
                      return (
                        <button
                          key={tier.key}
                          type="button"
                          className={`min-w-0 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
                            isActive
                              ? 'border-[#7c3aed]/60 bg-[#f4efff] shadow-sm'
                              : 'border-gray-200 bg-white hover:border-[#7c3aed]/35'
                          }`}
                          aria-pressed={isActive}
                          onClick={() => setSelectedTenancyTier(tier.key)}
                        >
                          <p className="text-base font-semibold text-[#2f0d68] break-words">{tier.label}</p>
                          <p className="mt-1 text-sm text-gray-600 break-words">{tier.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#eee7ff] bg-[#fcfbff] p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 sm:items-center sm:gap-3">
                  <h3 className="min-w-0 text-lg font-semibold text-[#2f0d68]">Documents included in your pack</h3>
                  <span className="max-w-full whitespace-normal break-words rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-semibold text-[#6f3dd6] sm:text-right">
                    {legalNote}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {documentEntries.map((document) => {
                    const isActive = effectiveDocKey === document.key;
                    return (
                      <button
                        key={document.key}
                        type="button"
                        onClick={() => setSelectedDocKey(document.key)}
                        className={`flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
                          isActive
                            ? 'border-[#7c3aed]/55 bg-[#f4efff] shadow-sm'
                            : 'border-gray-200 bg-white hover:border-[#7c3aed]/35'
                        }`}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <span className="mt-0.5 shrink-0 rounded-lg border border-[#e8ddff] bg-white p-2">
                          <Image src={document.icon} alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-[#2f0d68] break-words">{document.title}</span>
                          <span className="mt-1 block text-xs text-gray-600 break-words">{document.description}</span>
                        </span>
                      </button>
                    );
                  })}
                  {!documentEntries.length ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                      Previews unavailable in this environment.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-[#E9E2FF] bg-white p-4 shadow-sm md:p-6">
              <h3 className="text-lg font-semibold text-[#2f0d68]">Document Preview</h3>
              <p className="mt-1 text-sm text-gray-600">Click a document on the left to preview it here.</p>

              <button
                type="button"
                className="mt-4 block w-full overflow-hidden rounded-2xl border border-[#e8ddff] bg-[#f8f5ff] text-left transition hover:border-[#cdb8ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2"
                onClick={() => {
                  if (activeDoc) {
                    setIsPreviewModalOpen(true);
                  }
                }}
                aria-label={activeDoc ? `Open larger preview for ${activeDoc.title}` : 'Document preview unavailable'}
              >
                {activeDoc ? (
                  <PreviewImage
                    src={activeDoc.src}
                    alt={activeDoc.alt}
                    title={activeDoc.title}
                    width={720}
                    height={960}
                    className="h-auto w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center px-6 py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#2f0d68]">Previews coming soon</p>
                      <p className="text-xs text-gray-600">We&apos;re preparing watermarked previews for this pack.</p>
                    </div>
                  </div>
                )}
              </button>
              <p className="mt-2 text-xs text-[#5b4b7a]">Click the preview to enlarge.</p>
            </div>
          </div>

          <div className="mt-6 min-w-0 rounded-2xl border border-[#E9E2FF] bg-white px-4 py-6 text-center sm:px-5 md:px-8">
            <h3 className="text-xl font-semibold text-[#2f0d68] md:text-2xl">Ready to start?</h3>
            <p className="mt-2 text-sm text-[#5b4b7a] md:text-base">Continue to the guided wizard and generate your pack.</p>
            <div className="mt-4">
              <Link href={ctaHref} className="hero-btn-primary">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {isPreviewModalOpen && activeDoc ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#12072bcc]/90 p-3 backdrop-blur-sm md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Large preview for ${activeDoc.title}`}
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="relative h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-[#cdb8ff] bg-[#f8f5ff] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full border border-[#dccbff] bg-white p-2 text-[#2f0d68] shadow-sm transition hover:bg-[#f6f1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
              onClick={() => setIsPreviewModalOpen(false)}
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 pr-12">
              <h4 className="text-base font-semibold text-[#2f0d68] md:text-lg">{activeDoc.title}</h4>
              <p className="text-xs text-[#5b4b7a] md:text-sm">Press ESC or click outside to close.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#e8ddff] bg-white">
              <PreviewImage
                src={activeDoc.src}
                alt={activeDoc.alt}
                title={activeDoc.title}
                width={1200}
                height={1600}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
