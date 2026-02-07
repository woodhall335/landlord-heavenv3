'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@/components/ui';
import type {
  JurisdictionKey,
  NoticeOnlyPreviewData,
  NoticeVariantKey,
} from '@/lib/previews/noticeOnlyPreviews';

type WhatsIncludedInteractiveProps = {
  product: 'notice_only';
  defaultJurisdiction?: JurisdictionKey;
  previews: NoticeOnlyPreviewData;
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
        label: 'Section 21 (Form 6A) — no-fault eviction',
        description: 'Court-ready no-fault possession notice for England.',
      },
      {
        key: 'section8',
        label: 'Section 8 (Form 3) — grounds-based eviction',
        description: 'Grounds-based possession notice for rent arrears / breach.',
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
      },
      {
        key: 'rhw23',
        label: 'Fault-based Notice (RHW23)',
        description: 'Fault-based notice for breach / arrears / ASB in Wales.',
      },
    ],
  },
  scotland: {
    label: 'Scotland',
    legalNote: 'Private Housing (Tenancies) (Scotland) Act 2016 compliant',
    noticeVariants: [
      {
        key: 'notice-to-leave',
        label: 'Notice to Leave (PRT) — selected grounds',
        description: 'Notice to Leave for Scotland private residential tenancies.',
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

  useEffect(() => {
    setHasError(false);
  }, [src]);

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

const PreviewThumbnail = ({ src, alt, title, width, height, className }: PreviewImageProps) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-2 text-center ${
          className ?? ''
        }`}
      >
        <p className="text-[11px] font-medium text-gray-500">Preview</p>
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
  previews,
}: WhatsIncludedInteractiveProps) => {
  if (product !== 'notice_only') {
    return null;
  }

  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionKey>(defaultJurisdiction);
  const defaultVariantKey = NOTICE_ONLY_CONFIG[defaultJurisdiction].noticeVariants[0].key;
  const [selectedNoticeVariant, setSelectedNoticeVariant] = useState<NoticeVariantKey>(defaultVariantKey);
  const [selectedDocKey, setSelectedDocKey] = useState<string>(
    previews[defaultJurisdiction]?.[defaultVariantKey]?.[0]?.key ?? 'preview-placeholder',
  );

  const jurisdictionConfig = NOTICE_ONLY_CONFIG[selectedJurisdiction];
  const noticeVariants = jurisdictionConfig.noticeVariants;

  useEffect(() => {
    const nextVariant = NOTICE_ONLY_CONFIG[selectedJurisdiction].noticeVariants[0];
    setSelectedNoticeVariant(nextVariant.key);
  }, [selectedJurisdiction]);

  useEffect(() => {
    const docs = previews[selectedJurisdiction]?.[selectedNoticeVariant] ?? [];
    setSelectedDocKey((previous) => (docs.some((doc) => doc.key === previous) ? previous : docs[0]?.key ?? 'preview-placeholder'));
  }, [previews, selectedJurisdiction, selectedNoticeVariant]);

  const activeVariant = useMemo(
    () => noticeVariants.find((variant) => variant.key === selectedNoticeVariant) ?? noticeVariants[0],
    [noticeVariants, selectedNoticeVariant],
  );

  const documents = previews[selectedJurisdiction]?.[activeVariant.key] ?? [];
  const activeDoc = documents.find((document) => document.key === selectedDocKey) ?? documents[0];
  const activeIndex = useMemo(() => {
    if (!documents.length) {
      return -1;
    }
    const index = documents.findIndex((document) => document.key === selectedDocKey);
    return index === -1 ? 0 : index;
  }, [documents, selectedDocKey]);

  const goPrev = () => {
    if (documents.length < 2 || activeIndex === -1) {
      return;
    }
    const nextIndex = (activeIndex - 1 + documents.length) % documents.length;
    setSelectedDocKey(documents[nextIndex].key);
  };

  const goNext = () => {
    if (documents.length < 2 || activeIndex === -1) {
      return;
    }
    const nextIndex = (activeIndex + 1) % documents.length;
    setSelectedDocKey(documents[nextIndex].key);
  };

  const evictionNoticeDocuments = useMemo(() => {
    const matchers = [
      /section[-\s]?8/,
      /section[-\s]?21/,
      /section[-\s]?173/,
      /rhw23/,
      /notice[-\s]?to[-\s]?leave/,
      /eviction[-\s]?notice/,
      /form[-\s]?6a/,
      /form[-\s]?3/,
    ];

    return documents.filter((document) => {
      const haystack = `${document.title} ${document.key}`.toLowerCase();
      return matchers.some((matcher) => matcher.test(haystack));
    });
  }, [documents]);

  const guidanceDocuments = useMemo(
    () => documents.filter((document) => !evictionNoticeDocuments.some((notice) => notice.key === document.key)),
    [documents, evictionNoticeDocuments],
  );

  const orderedDocuments = useMemo(() => {
    if (!activeDoc) {
      return [];
    }
    const remaining = documents.filter((document) => document.key !== activeDoc.key);
    return [activeDoc, ...remaining];
  }, [activeDoc, documents]);

  const maxVisibleDocuments = 10;
  const visibleDocuments = orderedDocuments.slice(0, maxVisibleDocuments);
  const extraDocumentCount = Math.max(0, orderedDocuments.length - visibleDocuments.length);
  const hasDocuments = documents.length > 0;
  const stackContainerRef = useRef<HTMLDivElement | null>(null);
  const [stackWidth, setStackWidth] = useState(0);
  const stackCardRef = useRef<HTMLButtonElement | null>(null);
  const [stackCardSize, setStackCardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = stackContainerRef.current;
    if (!container) {
      return;
    }

    const updateMeasurements = () => {
      setStackWidth(container.getBoundingClientRect().width);
      if (stackCardRef.current) {
        const rect = stackCardRef.current.getBoundingClientRect();
        setStackCardSize({ width: rect.width, height: rect.height });
      }
    };

    updateMeasurements();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateMeasurements);
      return () => window.removeEventListener('resize', updateMeasurements);
    }

    const observer = new ResizeObserver(updateMeasurements);
    observer.observe(container);
    if (stackCardRef.current) {
      observer.observe(stackCardRef.current);
    }
    return () => observer.disconnect();
  }, [visibleDocuments.length]);

  const stackLayout = useMemo(() => {
    const count = visibleDocuments.length;
    if (!count) {
      return {
        count,
        maxX: 0,
        yStep: 0,
        positions: [],
      };
    }

    const cardWidth = stackCardSize.width || 0;
    const maxX = Math.max(stackWidth - cardWidth, 0);
    const yStep = count > 1 ? Math.min(12, maxX * 0.06) : 0;
    const positions = visibleDocuments.map((_, index) => {
      if (count === 1) {
        return { x: 0, y: 0 };
      }
      const ratio = index / (count - 1);
      return {
        x: ratio * maxX,
        y: index * yStep,
      };
    });

    return {
      count,
      maxX,
      yStep,
      positions,
    };
  }, [stackCardSize.width, stackWidth, visibleDocuments]);

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
              What&apos;s included in your eviction notice only bundle
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
                        {evictionNoticeDocuments.length ? (
                          evictionNoticeDocuments.map((document) => (
                            <li key={document.key} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-[#7c3aed]" />
                              <span>{document.title}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">Previews coming soon.</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#7c3aed]">Guidance Documents</p>
                      <ul className="mt-2 space-y-2 text-sm text-gray-700">
                        {guidanceDocuments.length ? (
                          guidanceDocuments.map((document) => (
                            <li key={document.key} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-[#7c3aed]/60" />
                              <span>{document.title}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">Previews coming soon.</li>
                        )}
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
                  <div
                    className="space-y-3 focus-visible:outline-none"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        goPrev();
                      }
                      if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        goNext();
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#7c3aed]">Active preview</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={documents.length < 2}
                          aria-label="Previous preview"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#7c3aed] transition hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:text-gray-300 disabled:hover:border-transparent disabled:hover:bg-transparent"
                        >
                          <span aria-hidden="true">←</span>
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={documents.length < 2}
                          aria-label="Next preview"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#7c3aed] transition hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:text-gray-300 disabled:hover:border-transparent disabled:hover:bg-transparent"
                        >
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-charcoal">
                      {activeDoc?.title ?? 'Preview coming soon'}
                    </h4>
                    <div className="relative w-full overflow-hidden rounded-2xl border border-[#7c3aed]/15 bg-[#7c3aed]/5">
                      {activeDoc ? (
                        <PreviewImage
                          src={activeDoc.src}
                          alt={activeDoc.alt}
                          title={activeDoc.title}
                          width={640}
                          height={860}
                          className="h-auto w-full object-cover"
                        />
                      ) : (
                        <div className="flex min-h-[360px] items-center justify-center px-6 py-12 text-center">
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#7c3aed]">Previews coming soon</p>
                            <p className="text-xs text-gray-600">
                              We&apos;re preparing watermarked previews for this notice type.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-charcoal">Preview stack</p>
                      <span className="text-xs text-gray-500">Click a document to preview</span>
                    </div>
                    <div className="mt-4 overflow-visible">
                      <div
                        className="relative min-h-[240px] sm:min-h-[260px] overflow-visible"
                        ref={stackContainerRef}
                        style={{
                          minHeight: Math.max(
                            240,
                            stackCardSize.height + stackLayout.yStep * Math.max(stackLayout.count - 1, 0),
                          ),
                        }}
                      >
                        {!hasDocuments ? (
                          <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
                            Previews coming soon.
                          </div>
                        ) : null}
                        {visibleDocuments.map((document, index) => {
                          const isActive = document.key === activeDoc?.key;
                          const stackIndex = index;
                          const position = stackLayout.positions[stackIndex] ?? { x: 0, y: 0 };
                          const rotations = [0, -2, 1, -1, 2, -1, 1, -2, 1, -1];
                          const scales = [1, 0.985, 0.97, 0.96, 0.95, 0.94, 0.94, 0.93, 0.93, 0.92];
                          const rotate = rotations[stackIndex] ?? 0;
                          const scale = scales[stackIndex] ?? 1;
                          return (
                            <button
                              key={document.key}
                              ref={index === 0 ? stackCardRef : null}
                              type="button"
                              onClick={() => setSelectedDocKey(document.key)}
                              className={`absolute left-0 top-0 flex w-36 flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-40 ${
                                isActive
                                  ? 'border-[#7c3aed]/60 bg-[#7c3aed]/10 shadow'
                                  : 'border-gray-200 bg-white hover:border-[#7c3aed]/40'
                              }`}
                              style={{
                                zIndex: visibleDocuments.length - index,
                                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate}deg) scale(${scale})`,
                              }}
                            >
                              <div className="w-full overflow-hidden rounded-xl border border-[#7c3aed]/15 bg-[#7c3aed]/5">
                                <PreviewThumbnail
                                  src={document.src}
                                  alt={document.alt}
                                  title={document.title}
                                  width={180}
                                  height={240}
                                  className="h-auto w-full object-cover"
                                />
                              </div>
                              <span className="sr-only">{document.title}</span>
                            </button>
                          );
                        })}
                        {extraDocumentCount > 0 ? (
                          <div className="absolute left-0 top-[190px] flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-white px-3 py-1 text-xs font-semibold text-[#7c3aed] shadow-sm">
                            +{extraDocumentCount} more
                          </div>
                        ) : null}
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
