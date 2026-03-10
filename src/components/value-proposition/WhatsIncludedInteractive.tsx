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

const NOTICE_ONLY_CONFIG: Record<JurisdictionKey, JurisdictionConfig> = {
  england: {
    label: 'England',
    legalNote: 'Housing Act 1988 compliant',
    noticeVariants: [
      {
        key: 'section21',
        label: 'Section 21',
        description: 'Form 6A no-fault possession notice.',
      },
      {
        key: 'section8',
        label: 'Section 8',
        description: 'Form 3 grounds-based possession notice.',
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

const jurisdictionOrder: JurisdictionKey[] = ['england', 'wales', 'scotland'];

const COMPLETE_PACK_VARIANTS: NoticeVariant[] = [
  {
    key: 'section21',
    label: 'Section 21',
    description: 'No-fault eviction route for England.',
  },
  {
    key: 'section8',
    label: 'Section 8',
    description: 'Grounds-based eviction route for arrears or breach.',
  },
];

const getDefaultTitle = (product: WhatsIncludedInteractiveProps['product']) => {
  if (product === 'notice_only') {
    return "What's included in your notice";
  }
  if (product === 'complete_pack') {
    return "What's included in your eviction pack";
  }
  return "What's included in your money claim pack";
};

const getDefaultSubtitle = (product: WhatsIncludedInteractiveProps['product']) => {
  if (product === 'notice_only') {
    return 'Select your jurisdiction, then preview every document in the pack.';
  }
  if (product === 'complete_pack') {
    return 'England-only pack. Choose Section 8 or Section 21, then preview every document.';
  }
  return 'England-only pack. Preview every document before you buy.';
};

const getDocumentDescription = (document: PreviewDoc) => {
  const haystack = `${document.key} ${document.title}`.toLowerCase();
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
  if (haystack.includes('section') || haystack.includes('notice') || haystack.includes('form-6a') || haystack.includes('form-3')) {
    return 'Primary legal notice generated from your case details.';
  }
  return 'Included document in your generated pack.';
};

const getDocumentIcon = (document: PreviewDoc) => {
  const haystack = `${document.key} ${document.title}`.toLowerCase();
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
  const showIntro = props.showIntro ?? true;
  const initialJurisdiction = isNoticeOnly ? props.defaultJurisdiction ?? 'england' : 'england';
  const initialPackVariant = isCompletePack ? props.defaultVariant ?? 'section21' : 'section21';

  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionKey>(initialJurisdiction);
  const defaultNoticeVariantKey = NOTICE_ONLY_CONFIG[selectedJurisdiction].noticeVariants[0].key;
  const [selectedNoticeVariant, setSelectedNoticeVariant] = useState<NoticeVariantKey>(defaultNoticeVariantKey);
  const [selectedPackVariant, setSelectedPackVariant] = useState<CompletePackVariantKey>(initialPackVariant);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDocKey, setSelectedDocKey] = useState<string>(() => {
    if (product === 'notice_only') {
      const noticePreviews = previews as NoticeOnlyPreviewData;
      return noticePreviews[initialJurisdiction]?.[defaultNoticeVariantKey]?.[0]?.key ?? 'preview-placeholder';
    }
    if (isCompletePack) {
      const packPreviews = previews as CompletePackPreviewData;
      return packPreviews[initialPackVariant]?.[0]?.key ?? 'preview-placeholder';
    }
    const moneyClaimPreviews = previews as MoneyClaimPreviewData;
    return moneyClaimPreviews[0]?.key ?? 'preview-placeholder';
  });

  const jurisdictionConfig = isNoticeOnly ? NOTICE_ONLY_CONFIG[selectedJurisdiction] : null;
  const noticeVariants = jurisdictionConfig?.noticeVariants ?? [];
  const effectiveNoticeVariant = noticeVariants.some((variant) => variant.key === selectedNoticeVariant)
    ? selectedNoticeVariant
    : noticeVariants[0]?.key;

  const documents = isNoticeOnly
    ? (previews as NoticeOnlyPreviewData)[selectedJurisdiction]?.[effectiveNoticeVariant ?? 'section21'] ?? []
    : isCompletePack
      ? (previews as CompletePackPreviewData)[selectedPackVariant] ?? []
      : (previews as MoneyClaimPreviewData);

  const effectiveDocKey = documents.some((document) => document.key === selectedDocKey)
    ? selectedDocKey
    : documents[0]?.key ?? 'preview-placeholder';
  const activeDoc = documents.find((document) => document.key === effectiveDocKey) ?? documents[0];

  const title = props.titleOverride ?? getDefaultTitle(product);
  const subtitle = props.subtitleOverride ?? getDefaultSubtitle(product);
  const showNoticeTypeSelector = isCompletePack || (isNoticeOnly && selectedJurisdiction !== 'scotland');

  const ctaDefaults = {
    notice_only: {
      href: 'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=evictio',
      label: 'Generate my notice bundle →',
    },
    complete_pack: {
      href: 'https://landlordheaven.co.uk/wizard?product=complete_pack&src=product_page&topic=eviction',
      label: 'Start your complete pack →',
    },
    money_claim: {
      href: 'https://landlordheaven.co.uk/wizard?product=money_claim&topic=debt&src=product_page',
      label: 'Start my money claim pack →',
    },
  } as const;

  const ctaHref = props.ctaHref ?? ctaDefaults[product].href;
  const ctaLabel = props.ctaLabel ?? ctaDefaults[product].label;

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
    <section className="py-12 md:py-14">
      <Container>
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#E6DBFF] bg-gradient-to-b from-[#fcfaff] to-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.08)] md:p-8">
          {showIntro ? (
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-[#2f0d68] md:text-4xl">{title}</h2>
              <p className="mt-3 text-base text-[#5b4b7a] md:text-lg">{subtitle}</p>
            </div>
          ) : null}

          <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 rounded-2xl border border-[#E9E2FF] bg-white p-4 md:p-6">
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
                          className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
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
                          <p className="text-base font-semibold text-[#2f0d68]">{variant.label}</p>
                          <p className="mt-1 text-sm text-gray-600">{variant.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#eee7ff] bg-[#fcfbff] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[#2f0d68]">Documents included in your pack</h3>
                  <span className="rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-semibold text-[#6f3dd6]">
                    {isNoticeOnly ? jurisdictionConfig?.legalNote : 'England only'}
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
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${
                          isActive
                            ? 'border-[#7c3aed]/55 bg-[#f4efff] shadow-sm'
                            : 'border-gray-200 bg-white hover:border-[#7c3aed]/35'
                        }`}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <span className="mt-0.5 shrink-0 rounded-lg border border-[#e8ddff] bg-white p-2">
                          <Image src={document.icon} alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#2f0d68]">{document.title}</span>
                          <span className="mt-1 block text-xs text-gray-600">{document.description}</span>
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

            <div className="rounded-2xl border border-[#E9E2FF] bg-white p-4 shadow-sm md:p-6">
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

          <div className="mt-6 rounded-2xl border border-[#E9E2FF] bg-white px-5 py-6 text-center md:px-8">
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
