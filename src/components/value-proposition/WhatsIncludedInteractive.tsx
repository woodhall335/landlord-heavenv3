'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/ui';

export type JurisdictionKey = 'england' | 'wales' | 'scotland';
export type NoticeVariantKey = 'section21' | 'section8' | 'section173' | 'rhw23' | 'notice_to_leave';

type WhatsIncludedInteractiveProps = {
  product: 'notice_only';
  defaultJurisdiction?: JurisdictionKey;
};

type NoticeDocument = {
  key: string;
  title: string;
  filename: string;
  alt: string;
  isPrimary?: boolean;
};

type NoticeVariant = {
  key: NoticeVariantKey;
  label: string;
  description: string;
  documents: NoticeDocument[];
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
        label: 'Section 21 (Form 6A) — no-fault eviction',
        description: 'Court-ready no-fault possession notice for England.',
        documents: [
          {
            key: 'section-21-form-6a',
            title: 'Section 21 Notice (Form 6A)',
            filename: 'section-21-form-6a-preview.webp',
            alt: 'Landlord Heaven England Section 21 Form 6A notice preview document',
            isPrimary: true,
          },
          {
            key: 'section-21-compliance-declaration',
            title: 'Section 21 Compliance Declaration',
            filename: 'section-21-compliance-declaration-preview.webp',
            alt: 'Landlord Heaven England Section 21 compliance declaration preview document',
          },
          {
            key: 'section-21-service-instructions',
            title: 'Service Instructions (Section 21)',
            filename: 'service-instructions-preview.webp',
            alt: 'Landlord Heaven England Section 21 service instructions preview document',
          },
          {
            key: 'section-21-validity-checklist',
            title: 'Validity Checklist (Section 21)',
            filename: 'validity-checklist-preview.webp',
            alt: 'Landlord Heaven England Section 21 validity checklist preview document',
          },
        ],
      },
      {
        key: 'section8',
        label: 'Section 8 (Form 3) — grounds-based eviction',
        description: 'Grounds-based possession notice for rent arrears / breach.',
        documents: [
          {
            key: 'section-8-form-3',
            title: 'Section 8 Notice (Form 3)',
            filename: 'section-8-form-3-preview.webp',
            alt: 'Landlord Heaven England Section 8 Form 3 notice preview document',
            isPrimary: true,
          },
          {
            key: 'section-8-compliance-declaration',
            title: 'Compliance Declaration (general)',
            filename: 'compliance-declaration-preview.webp',
            alt: 'Landlord Heaven England Section 8 compliance declaration preview document',
          },
          {
            key: 'section-8-rent-schedule',
            title: 'Rent Schedule / Arrears Statement',
            filename: 'rent-schedule-arrears-statement-preview.webp',
            alt: 'Landlord Heaven England Section 8 rent schedule arrears statement preview document',
          },
          {
            key: 'section-8-service-instructions',
            title: 'Service Instructions (Section 8)',
            filename: 'service-instructions-preview.webp',
            alt: 'Landlord Heaven England Section 8 service instructions preview document',
          },
          {
            key: 'section-8-validity-checklist',
            title: 'Validity Checklist (Section 8)',
            filename: 'validity-checklist-preview.webp',
            alt: 'Landlord Heaven England Section 8 validity checklist preview document',
          },
        ],
      },
    ],
  },
  wales: {
    label: 'Wales',
    legalNote: 'Renting Homes (Wales) Act 2016 compliant',
    noticeVariants: [
      {
        key: 'section173',
        label: 'Section 173 Notice — no-fault possession',
        description: 'No-fault possession notice for Wales.',
        documents: [
          {
            key: 'section-173-notice',
            title: 'Section 173 Notice',
            filename: 'section-173-notice-preview.webp',
            alt: 'Landlord Heaven Wales Section 173 notice preview document',
            isPrimary: true,
          },
          {
            key: 'wales-service-instructions',
            title: 'Service Instructions (Wales)',
            filename: 'service-instructions-preview.webp',
            alt: 'Landlord Heaven Wales service instructions preview document',
          },
          {
            key: 'wales-validity-checklist',
            title: 'Validity Checklist (Wales)',
            filename: 'validity-checklist-preview.webp',
            alt: 'Landlord Heaven Wales validity checklist preview document',
          },
        ],
      },
      {
        key: 'rhw23',
        label: 'Fault-based Notice (RHW23)',
        description: 'Fault-based notice for breach / arrears / ASB in Wales.',
        documents: [
          {
            key: 'rhw23-notice',
            title: 'RHW23 Notice',
            filename: 'rhw23-notice-preview.webp',
            alt: 'Landlord Heaven Wales RHW23 fault based notice preview document',
            isPrimary: true,
          },
          {
            key: 'wales-service-instructions-rhw23',
            title: 'Service Instructions (Wales)',
            filename: 'service-instructions-preview.webp',
            alt: 'Landlord Heaven Wales service instructions preview document',
          },
          {
            key: 'wales-validity-checklist-rhw23',
            title: 'Validity Checklist (Wales)',
            filename: 'validity-checklist-preview.webp',
            alt: 'Landlord Heaven Wales validity checklist preview document',
          },
        ],
      },
    ],
  },
  scotland: {
    label: 'Scotland',
    legalNote: 'Private Housing (Tenancies) (Scotland) Act 2016 compliant',
    noticeVariants: [
      {
        key: 'notice_to_leave',
        label: 'Notice to Leave (PRT) — selected grounds',
        description: 'Notice to Leave for Scotland private residential tenancies.',
        documents: [
          {
            key: 'notice-to-leave-prt',
            title: 'Notice to Leave (PRT)',
            filename: 'notice-to-leave-preview.webp',
            alt: 'Landlord Heaven Scotland Notice to Leave PRT preview document',
            isPrimary: true,
          },
          {
            key: 'scotland-service-instructions',
            title: 'Service Instructions (Scotland)',
            filename: 'service-instructions-preview.webp',
            alt: 'Landlord Heaven Scotland service instructions preview document',
          },
          {
            key: 'scotland-validity-checklist',
            title: 'Validity Checklist (Scotland)',
            filename: 'validity-checklist-preview.webp',
            alt: 'Landlord Heaven Scotland validity checklist preview document',
          },
        ],
      },
    ],
  },
};

const differentiators = [
  'Preview before paying (watermarked)',
  'Edit + regenerate instantly (unlimited)',
  'Stored in your portal for at least 12 months',
];

const jurisdictionOrder: JurisdictionKey[] = ['england', 'wales', 'scotland'];

const getPrimaryDocument = (variant: NoticeVariant) =>
  variant.documents.find((document) => document.isPrimary) ?? variant.documents[0];

const buildPreviewSrc = (jurisdiction: JurisdictionKey, variantKey: NoticeVariantKey, filename: string) =>
  `/images/previews/notice-only/${jurisdiction}/${variantKey}/${filename}`;

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
        className={`flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-[#7c3aed]/20 bg-[#7c3aed]/10 px-4 text-center ${
          className ?? ''
        }`}
      >
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#7c3aed]">Preview coming soon</p>
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
    />
  );
};

export const WhatsIncludedInteractive = ({
  product,
  defaultJurisdiction = 'england',
}: WhatsIncludedInteractiveProps) => {
  if (product !== 'notice_only') {
    return null;
  }

  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionKey>(defaultJurisdiction);
  const [selectedNoticeVariant, setSelectedNoticeVariant] = useState<NoticeVariantKey>(
    NOTICE_ONLY_CONFIG[defaultJurisdiction].noticeVariants[0].key,
  );
  const [selectedDocKey, setSelectedDocKey] = useState<string>(
    getPrimaryDocument(NOTICE_ONLY_CONFIG[defaultJurisdiction].noticeVariants[0]).key,
  );

  const jurisdictionConfig = NOTICE_ONLY_CONFIG[selectedJurisdiction];
  const noticeVariants = jurisdictionConfig.noticeVariants;

  useEffect(() => {
    const nextVariant = NOTICE_ONLY_CONFIG[selectedJurisdiction].noticeVariants[0];
    setSelectedNoticeVariant(nextVariant.key);
    setSelectedDocKey(getPrimaryDocument(nextVariant).key);
  }, [selectedJurisdiction]);

  useEffect(() => {
    const activeVariant = noticeVariants.find((variant) => variant.key === selectedNoticeVariant) ?? noticeVariants[0];
    setSelectedDocKey(getPrimaryDocument(activeVariant).key);
  }, [noticeVariants, selectedNoticeVariant]);

  const activeVariant = useMemo(
    () => noticeVariants.find((variant) => variant.key === selectedNoticeVariant) ?? noticeVariants[0],
    [noticeVariants, selectedNoticeVariant],
  );

  const activeDoc =
    activeVariant.documents.find((document) => document.key === selectedDocKey) ??
    getPrimaryDocument(activeVariant);

  const orderedDocuments = useMemo(() => {
    const remaining = activeVariant.documents.filter((document) => document.key !== activeDoc.key);
    return [activeDoc, ...remaining];
  }, [activeDoc, activeVariant.documents]);

  const guidanceDocuments = activeVariant.documents.filter((document) => !document.isPrimary);

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
              What&apos;s included in your eviction notice pack
            </h2>
            <p className="mt-3 text-gray-600">
              Select your jurisdiction, then preview every document in the pack.
            </p>
          </div>

          <div className="flex justify-center mb-10" role="tablist" aria-label="Jurisdiction">
            <div className="inline-flex rounded-full border border-[#7c3aed]/20 bg-white p-1 shadow-sm">
              {jurisdictionOrder.map((jurisdiction) => {
                const isActive = selectedJurisdiction === jurisdiction;
                return (
                  <button
                    key={jurisdiction}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={`jurisdiction-panel-${jurisdiction}`}
                    className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                      isActive
                        ? 'bg-[#7c3aed] text-white shadow'
                        : 'text-[#7c3aed] hover:bg-[#7c3aed]/10'
                    }`}
                    onClick={() => setSelectedJurisdiction(jurisdiction)}
                  >
                    {NOTICE_ONLY_CONFIG[jurisdiction].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="tabpanel"
            id={`jurisdiction-panel-${selectedJurisdiction}`}
            aria-label={`${jurisdictionConfig.label} notice pack details`}
          >
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div className="order-2 md:order-1 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">Notice type</h3>
                  <div className="grid gap-3">
                    {noticeVariants.map((variant) => {
                      const isActive = selectedNoticeVariant === variant.key;
                      return (
                        <button
                          key={variant.key}
                          type="button"
                          className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                            isActive
                              ? 'border-[#7c3aed]/60 bg-[#7c3aed]/10 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-[#7c3aed]/40'
                          }`}
                          onClick={() => setSelectedNoticeVariant(variant.key)}
                        >
                          <p className="font-semibold text-charcoal">{variant.label}</p>
                          <p className="text-sm text-gray-600 mt-1">{variant.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-charcoal">
                      {jurisdictionConfig.label} — What you receive
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-[#7c3aed]/10 px-3 py-1 text-xs font-semibold text-[#7c3aed]">
                      {jurisdictionConfig.legalNote}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-[#7c3aed]">Eviction Notices</p>
                      <ul className="mt-2 space-y-2 text-sm text-gray-700">
                        {activeVariant.documents
                          .filter((document) => document.isPrimary)
                          .map((document) => (
                            <li key={document.key} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-[#7c3aed]" />
                              <span>{document.title}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#7c3aed]">Guidance Documents</p>
                      <ul className="mt-2 space-y-2 text-sm text-gray-700">
                        {guidanceDocuments.map((document) => (
                          <li key={document.key} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#7c3aed]/60" />
                            <span>{document.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7c3aed]/15 bg-[#7c3aed]/10 p-5">
                  <ul className="space-y-2 text-sm text-[#7c3aed]/90">
                    {differentiators.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed] text-white text-xs">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="rounded-3xl border border-[#7c3aed]/15 bg-white p-6 shadow-lg">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#7c3aed]">Active preview</p>
                    <h4 className="text-xl font-semibold text-charcoal">{activeDoc.title}</h4>
                    <div className="relative w-full overflow-hidden rounded-2xl border border-[#7c3aed]/15 bg-[#7c3aed]/5">
                      <PreviewImage
                        src={buildPreviewSrc(selectedJurisdiction, activeVariant.key, activeDoc.filename)}
                        alt={activeDoc.alt}
                        title={activeDoc.title}
                        width={640}
                        height={860}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-charcoal">Preview stack</p>
                      <span className="text-xs text-gray-500">Click a document to preview</span>
                    </div>
                    <div className="mt-4">
                      <div className="relative min-h-[240px] sm:min-h-[260px]">
                        {orderedDocuments.map((document, index) => {
                          const isActive = document.key === activeDoc.key;
                          const stackIndex = Math.min(index, 4);
                          const offsets = [
                            { x: 0, y: 0, rotate: 0, scale: 1 },
                            { x: 18, y: 10, rotate: -3, scale: 0.98 },
                            { x: 32, y: 20, rotate: 2, scale: 0.96 },
                            { x: 44, y: 30, rotate: -2, scale: 0.94 },
                            { x: 56, y: 38, rotate: 3, scale: 0.92 },
                          ];
                          const { x, y, rotate, scale } = offsets[stackIndex];
                          return (
                            <button
                              key={document.key}
                              type="button"
                              onClick={() => setSelectedDocKey(document.key)}
                              className={`absolute left-1/2 top-0 flex w-36 flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-40 ${
                                isActive
                                  ? 'border-[#7c3aed]/60 bg-[#7c3aed]/10 shadow'
                                  : 'border-gray-200 bg-white hover:border-[#7c3aed]/40'
                              }`}
                              style={{
                                zIndex: orderedDocuments.length - index,
                                transform: `translate(calc(-50% + ${x}px), ${y}px) rotate(${rotate}deg) scale(${scale})`,
                              }}
                            >
                              <div className="w-full overflow-hidden rounded-xl border border-[#7c3aed]/15 bg-[#7c3aed]/5">
                                <PreviewImage
                                  src={buildPreviewSrc(selectedJurisdiction, activeVariant.key, document.filename)}
                                  alt={document.alt}
                                  title={document.title}
                                  width={180}
                                  height={240}
                                  className="h-auto w-full object-cover"
                                />
                              </div>
                              <p className="text-[11px] font-medium text-gray-700 text-center">
                                {document.title}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
