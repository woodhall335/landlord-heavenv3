'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui';
import {
  buildFunnelProcessSectionModel,
  type FunnelProduct,
  type FunnelProcessRoute,
  type FunnelProcessStep,
} from '@/lib/marketing/funnelProcessSection';
import type { NoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import type { CompletePackPreviewData } from '@/lib/previews/completePackPreviews';
import type { MoneyClaimPreviewData } from '@/lib/previews/moneyClaimPreviews';

export type FunnelProcessSectionProps = {
  product: FunnelProduct;
  noticePreviews?: NoticeOnlyPreviewData;
  completePackPreviews?: CompletePackPreviewData;
  moneyClaimPreviews?: MoneyClaimPreviewData;
  className?: string;
};

const DESKTOP_CARDS_PER_VIEW = 2;
const CAROUSEL_AUTOSCROLL_MS = 4500;
const CAROUSEL_PAUSE_AFTER_INTERACTION_MS = 9000;

const CTA_BY_PRODUCT: Record<FunnelProduct, { label: string; href: string }> = {
  notice_only: {
    label: 'Generate my notice bundle \u2192',
    href: 'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  complete_pack: {
    label: 'Generate my complete pack \u2192',
    href: 'https://landlordheaven.co.uk/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  money_claim: {
    label: 'Start my money claim pack \u2192',
    href: 'https://landlordheaven.co.uk/wizard?product=money_claim&topic=debt&src=product_page',
  },
};

const ROUTE_IMAGE_BY_ID: Record<string, { src: string; alt: string }> = {
  section8: {
    src: '/images/faultbasedeviction.webp',
    alt: 'Fault based eviction',
  },
  rhw23: {
    src: '/images/faultbasedeviction.webp',
    alt: 'Fault based eviction',
  },
  section21: {
    src: '/images/nofaulteviction.webp',
    alt: 'No fault eviction',
  },
  section173: {
    src: '/images/nofaulteviction.webp',
    alt: 'No fault eviction',
  },
  'notice-to-leave': {
    src: '/images/nofaulteviction.webp',
    alt: 'No fault eviction',
  },
  'money-claim-route': {
    src: '/images/moneyclaims.webp',
    alt: 'Money claims',
  },
};

type StepImageMatcher = {
  pattern: RegExp;
  src: string;
  alt: string;
};

const STEP_IMAGE_MATCHERS: StepImageMatcher[] = [
  { pattern: /arrears_engagement/, src: '/images/whyitmatters/arrears_engagement.png', alt: 'Arrears engagement' },
  { pattern: /case_summary/, src: '/images/whyitmatters/case_summary.png', alt: 'Case summary' },
  { pattern: /compliance_declaration/, src: '/images/whyitmatters/compliance_declaration.png', alt: 'Compliance declaration' },
  { pattern: /court_bundle_index/, src: '/images/whyitmatters/court_bundle_index.png', alt: 'Court bundle index' },
  { pattern: /court_filing_guide/, src: '/images/whyitmatters/court_filing_guide.png', alt: 'Court filing guide' },
  {
    pattern: /defendant_information_sheet/,
    src: '/images/whyitmatters/defendant_information_sheet.png',
    alt: 'Defendant information sheet',
  },
  { pattern: /enforcement_guide/, src: '/images/whyitmatters/enforcement_guide.png', alt: 'Enforcement guide' },
  { pattern: /evidence_checklist/, src: '/images/whyitmatters/evidence_checklist.png', alt: 'Evidence checklist' },
  {
    pattern: /financial_statement|financial_information/,
    src: '/images/whyitmatters/financial_information.png',
    alt: 'Financial information',
  },
  { pattern: /hearing_checklist/, src: '/images/whyitmatters/hearing_checklist.png', alt: 'Hearing checklist' },
  {
    pattern: /interest_calculation/,
    src: '/images/whyitmatters/interest_calculation.png',
    alt: 'Interest calculation',
  },
  { pattern: /letter_before_claim/, src: '/images/whyitmatters/letter_before_claim.png', alt: 'Letter before claim' },
  { pattern: /particulars_of_claim/, src: '/images/whyitmatters/case_summary.png', alt: 'Particulars of claim' },
  { pattern: /(^|_)n1(_|$)|form_n1/, src: '/images/whyitmatters/n1.png', alt: 'Form N1' },
  { pattern: /(^|_)n119(_|$)/, src: '/images/whyitmatters/n119.png', alt: 'Form N119' },
  { pattern: /(^|_)n5(_|$)/, src: '/images/whyitmatters/n5.png', alt: 'Form N5' },
  { pattern: /(^|_)n5b(_|$)/, src: '/images/whyitmatters/n5b.png', alt: 'Form N5B' },
  { pattern: /notice_to_leave/, src: '/images/whyitmatters/notice_to_leave.png', alt: 'Notice to Leave' },
  {
    pattern: /pre_service_compliance_checklist/,
    src: '/images/whyitmatters/pre_service_compliance_checklist.png',
    alt: 'Pre-service compliance checklist',
  },
  { pattern: /proof_of_service/, src: '/images/whyitmatters/proof_of_service.png', alt: 'Proof of service' },
  {
    pattern: /rent_arrears_schedule/,
    src: '/images/whyitmatters/rent_arrears_schedule.png',
    alt: 'Rent arrears schedule',
  },
  { pattern: /reply_form/, src: '/images/whyitmatters/reply_form.png', alt: 'Reply form' },
  { pattern: /rhw23/, src: '/images/whyitmatters/rhw23_notice.png', alt: 'RHW23 notice' },
  {
    pattern: /schedule_of_arrears|rent_schedule/,
    src: '/images/whyitmatters/schedule_of_arrears.png',
    alt: 'Schedule of arrears',
  },
  { pattern: /section_173/, src: '/images/whyitmatters/section_173_notice.png', alt: 'Section 173 notice' },
  {
    pattern: /section_21|form_6a/,
    src: '/images/whyitmatters/section_21_eviction_notice.png',
    alt: 'Section 21 eviction notice',
  },
  {
    pattern: /section_8|form_3/,
    src: '/images/whyitmatters/section_8_eviction_notice.png',
    alt: 'Section 8 eviction notice',
  },
  {
    pattern: /service_instructions|serving_instructions/,
    src: '/images/whyitmatters/service_instructions.png',
    alt: 'Service instructions',
  },
  { pattern: /validity_checklist/, src: '/images/whyitmatters/validity_checklist.png', alt: 'Validity checklist' },
  {
    pattern: /witness_statement/,
    src: '/images/whyitmatters/witness_statement.png',
    alt: 'Witness statement',
  },
];

const getRouteById = (routes: FunnelProcessRoute[], id: string) => routes.find((route) => route.id === id);

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_');

const getStepImage = (step: FunnelProcessStep, routeId: string) => {
  const normalized = normalizeText(`${step.docKey} ${step.docTitle}`);

  const match = STEP_IMAGE_MATCHERS.find((matcher) => matcher.pattern.test(normalized));
  if (match) {
    return { src: match.src, alt: match.alt };
  }

  if (normalized.includes('notice') || normalized.includes('eviction')) {
    if (routeId === 'section21') {
      return { src: '/images/whyitmatters/section_21_eviction_notice.png', alt: 'Section 21 eviction notice' };
    }

    if (routeId === 'section8') {
      return { src: '/images/whyitmatters/section_8_eviction_notice.png', alt: 'Section 8 eviction notice' };
    }

    if (routeId === 'section173') {
      return { src: '/images/whyitmatters/section_173_notice.png', alt: 'Section 173 notice' };
    }

    if (routeId === 'rhw23') {
      return { src: '/images/whyitmatters/rhw23_notice.png', alt: 'RHW23 notice' };
    }

    if (routeId === 'notice-to-leave') {
      return { src: '/images/whyitmatters/notice_to_leave.png', alt: 'Notice to Leave' };
    }
  }

  return undefined;
};

const StepCard = ({
  step,
  index,
  routeId,
}: {
  step: FunnelProcessStep;
  index: number;
  routeId: string;
}) => {
  const image = getStepImage(step, routeId);

  return (
    <article className="flex flex-col rounded-2xl border border-[#E6DBFF] bg-white p-5 shadow-[0_10px_28px_rgba(76,29,149,0.08)] md:h-full">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-semibold text-white">
        {index + 1}
      </div>
      <h4 className="text-lg font-semibold text-violet-950">{step.docTitle}</h4>

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        <dl className="space-y-3 text-sm leading-6 text-gray-700">
          <div>
            <dt className="font-semibold text-violet-900">What it does</dt>
            <dd>{step.whatItDoes}</dd>
          </div>
          <div>
            <dt className="font-semibold text-violet-900">Why this matters</dt>
            <dd>{step.whyItMatters}</dd>
          </div>
          {step.whenUsed ? (
            <div>
              <dt className="font-semibold text-violet-900">Used at this stage</dt>
              <dd>{step.whenUsed}</dd>
            </div>
          ) : null}
        </dl>

        <div className="self-start overflow-hidden rounded-xl border border-[#E6DBFF] bg-violet-50/50 md:h-full md:self-auto">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={640}
              height={420}
              className="block h-auto w-full bg-white p-2 object-contain"
              sizes="(max-width: 767px) 92vw, 40vw"
              loading="lazy"
            />
          ) : (
            <div className="flex min-h-[190px] items-center justify-center px-4 text-center text-xs font-medium text-violet-900/70 md:h-full">
              Court-ready workflow document stage
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export function FunnelProcessSection({
  product,
  noticePreviews,
  completePackPreviews,
  moneyClaimPreviews,
  className,
}: FunnelProcessSectionProps) {
  const model = useMemo(
    () =>
      buildFunnelProcessSectionModel({
        product,
        noticePreviews,
        completePackPreviews,
        moneyClaimPreviews,
      }),
    [product, noticePreviews, completePackPreviews, moneyClaimPreviews],
  );

  const cta = CTA_BY_PRODUCT[product];
  const [activeTabId, setActiveTabId] = useState(model.defaultTabId);

  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const pauseUntilRef = useRef(0);
  const dragStateRef = useRef({ active: false, startX: 0, startScrollLeft: 0 });

  useEffect(() => {
    setActiveTabId(model.defaultTabId);
  }, [model.defaultTabId]);

  const activeTab = useMemo(
    () => model.tabs.find((tab) => tab.id === activeTabId) ?? model.tabs[0],
    [activeTabId, model.tabs],
  );

  const [activeRouteId, setActiveRouteId] = useState('');

  useEffect(() => {
    if (!activeTab) {
      setActiveRouteId('');
      return;
    }

    if (activeTab.routes.length === 0) {
      setActiveRouteId('');
      return;
    }

    const selectedRoute = getRouteById(activeTab.routes, activeRouteId);
    if (selectedRoute) {
      return;
    }

    if (activeTab.routes.length === 1) {
      setActiveRouteId(activeTab.routes[0].id);
      return;
    }

    setActiveRouteId('');
  }, [activeTab, activeRouteId]);

  const activeRoute = activeTab ? getRouteById(activeTab.routes, activeRouteId) : undefined;
  const steps = activeRoute?.steps ?? [];

  const canCycleDesktop = steps.length > DESKTOP_CARDS_PER_VIEW;

  const scrollTrackTo = (track: HTMLDivElement, left: number, behavior: ScrollBehavior) => {
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior });
      return;
    }
    track.scrollLeft = left;
  };

  const pauseDesktopAutoscroll = () => {
    pauseUntilRef.current = Date.now() + CAROUSEL_PAUSE_AFTER_INTERACTION_MS;
  };

  useEffect(() => {
    const desktopTrack = desktopTrackRef.current;
    const mobileTrack = mobileTrackRef.current;

    if (desktopTrack) {
      scrollTrackTo(desktopTrack, 0, 'auto');
    }

    if (mobileTrack) {
      scrollTrackTo(mobileTrack, 0, 'auto');
    }
  }, [activeRoute?.id]);

  useEffect(() => {
    if (!canCycleDesktop) {
      return;
    }

    const interval = window.setInterval(() => {
      const desktopTrack = desktopTrackRef.current;
      if (!desktopTrack) {
        return;
      }

      if (Date.now() < pauseUntilRef.current) {
        return;
      }

      const stepWidth = desktopTrack.clientWidth / DESKTOP_CARDS_PER_VIEW;
      if (stepWidth <= 0) {
        return;
      }

      const maxIndex = Math.max(0, steps.length - DESKTOP_CARDS_PER_VIEW);
      const currentIndex = Math.round(desktopTrack.scrollLeft / stepWidth);
      const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      scrollTrackTo(desktopTrack, nextIndex * stepWidth, 'smooth');
    }, CAROUSEL_AUTOSCROLL_MS);

    return () => window.clearInterval(interval);
  }, [activeRoute?.id, canCycleDesktop, steps.length]);

  const handleDesktopPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const desktopTrack = desktopTrackRef.current;
    if (!desktopTrack) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: desktopTrack.scrollLeft,
    };

    pauseDesktopAutoscroll();
    desktopTrack.setPointerCapture(event.pointerId);
  };

  const handleDesktopPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) {
      return;
    }

    const desktopTrack = desktopTrackRef.current;
    if (!desktopTrack) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    desktopTrack.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
  };

  const handleDesktopPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const desktopTrack = desktopTrackRef.current;
    dragStateRef.current.active = false;

    if (desktopTrack && desktopTrack.hasPointerCapture(event.pointerId)) {
      desktopTrack.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className={`bg-[#f7f2ff] py-12 md:py-16 ${className ?? ''}`}>
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-violet-950 md:text-5xl">{model.heading}</h2>
            <p className="mt-4 text-base leading-7 text-violet-900/90 md:text-xl">{model.subheading}</p>
          </div>

          <div className="mt-8 flex justify-center" role="tablist" aria-label="Funnel process tabs">
            <div className="pill-selector">
              {model.tabs.map((tab) => {
                const isActive = tab.id === activeTab?.id;
                return (
                  <button
                    key={tab.id}
                    id={`funnel-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`funnel-panel-${tab.id}`}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`pill-selector-btn ${isActive ? 'pill-selector-btn-active' : 'pill-selector-btn-inactive'}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab ? (
            <div
              id={`funnel-panel-${activeTab.id}`}
              role="tabpanel"
              aria-labelledby={`funnel-tab-${activeTab.id}`}
              className="mt-8"
            >
              <p className="text-center text-sm font-medium text-violet-900 md:text-base">{activeTab.description}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {activeTab.routes.map((route) => {
                  const isSelected = route.id === activeRoute?.id;
                  const routeImage = ROUTE_IMAGE_BY_ID[route.id];

                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setActiveRouteId(route.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        isSelected
                          ? 'border-violet-400 bg-violet-100/70 shadow-[0_10px_24px_rgba(124,58,237,0.16)]'
                          : 'border-[#E6DBFF] bg-white hover:border-violet-300 hover:bg-violet-50'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {routeImage ? (
                        <div className="mb-4 overflow-hidden rounded-xl border border-[#E6DBFF]">
                          <Image
                            src={routeImage.src}
                            alt={routeImage.alt}
                            width={720}
                            height={288}
                            className="h-32 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      <h3 className="text-xl font-semibold text-violet-950">{route.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700">{route.subtitle}</p>
                      <p className="mt-3 inline-flex rounded-full bg-violet-200/60 px-3 py-1 text-xs font-semibold text-violet-900">
                        {route.steps.length} generated document{route.steps.length === 1 ? '' : 's'} explained
                      </p>
                    </button>
                  );
                })}
              </div>

              {activeRoute ? (
                <>
                  <div className="mt-8 hidden md:block">
                    <div
                      ref={desktopTrackRef}
                      className="-mx-1 flex cursor-grab select-none items-stretch snap-x snap-mandatory gap-0 overflow-x-scroll overscroll-x-contain no-scrollbar px-1 pb-2"
                      aria-label="Desktop funnel process carousel"
                      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                      onPointerDown={handleDesktopPointerDown}
                      onPointerMove={handleDesktopPointerMove}
                      onPointerUp={handleDesktopPointerUp}
                      onPointerCancel={handleDesktopPointerUp}
                      onMouseEnter={pauseDesktopAutoscroll}
                      onWheel={pauseDesktopAutoscroll}
                    >
                      {steps.map((step, index) => (
                        <div key={step.id} className="h-full w-1/2 shrink-0 snap-start px-2">
                          <StepCard step={step} index={index} routeId={activeRoute.id} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 md:hidden">
                    <div
                      ref={mobileTrackRef}
                      className="-mx-1 flex items-start snap-x snap-mandatory gap-4 overflow-x-scroll overscroll-x-contain no-scrollbar px-1 pb-2"
                      aria-label="Funnel process documents carousel"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      {steps.map((step, index) => (
                        <div key={step.id} className="w-[86%] shrink-0 snap-start">
                          <StepCard step={step} index={index} routeId={activeRoute.id} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <a
                      href={cta.href}
                      className="hero-btn-primary inline-flex items-center justify-center"
                    >
                      {cta.label}
                    </a>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

