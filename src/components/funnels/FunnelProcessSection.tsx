'use client';

import { useEffect, useMemo, useState } from 'react';
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

const CTA_BY_PRODUCT: Record<FunnelProduct, { label: string; href: string }> = {
  notice_only: {
    label: 'Generate your notice now',
    href: 'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
  },
  complete_pack: {
    label: 'Generate your complete eviction pack now',
    href: 'https://landlordheaven.co.uk/wizard?product=complete_pack&src=product_page&topic=eviction',
  },
  money_claim: {
    label: 'Start your money claim now',
    href: 'https://landlordheaven.co.uk/wizard?product=money_claim&topic=debt&src=product_page',
  },
};

const getRouteById = (routes: FunnelProcessRoute[], id: string) => routes.find((route) => route.id === id);

const StepCard = ({ step, index }: { step: FunnelProcessStep; index: number }) => (
  <article className="rounded-2xl border border-[#E6DBFF] bg-white p-5 shadow-[0_10px_28px_rgba(76,29,149,0.08)]">
    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-semibold text-white">
      {index + 1}
    </div>
    <h4 className="text-lg font-semibold text-violet-950">{step.docTitle}</h4>
    <dl className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
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
  </article>
);

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

  useEffect(() => {
    setActiveTabId(model.defaultTabId);
  }, [model.defaultTabId]);

  const activeTab = useMemo(
    () => model.tabs.find((tab) => tab.id === activeTabId) ?? model.tabs[0],
    [activeTabId, model.tabs],
  );

  const [activeRouteId, setActiveRouteId] = useState('');
  const [desktopStepIndex, setDesktopStepIndex] = useState(0);

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

  useEffect(() => {
    setDesktopStepIndex(0);
  }, [activeRouteId]);

  const activeRoute = activeTab ? getRouteById(activeTab.routes, activeRouteId) : undefined;
  const steps = activeRoute?.steps ?? [];

  const maxDesktopStepIndex = Math.max(0, steps.length - DESKTOP_CARDS_PER_VIEW);
  const safeDesktopStepIndex = steps.length ? Math.min(desktopStepIndex, maxDesktopStepIndex) : 0;
  const canCycleDesktop = steps.length > DESKTOP_CARDS_PER_VIEW;

  useEffect(() => {
    if (!canCycleDesktop) {
      return;
    }

    const interval = window.setInterval(() => {
      setDesktopStepIndex((prev) => (prev >= maxDesktopStepIndex ? 0 : prev + 1));
    }, CAROUSEL_AUTOSCROLL_MS);

    return () => window.clearInterval(interval);
  }, [activeRoute?.id, canCycleDesktop, maxDesktopStepIndex]);

  return (
    <section className={`bg-[#f7f2ff] py-12 md:py-16 ${className ?? ''}`}>
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-violet-950 md:text-5xl">{model.heading}</h2>
            <p className="mt-4 text-base leading-7 text-violet-900/90 md:text-xl">{model.subheading}</p>
          </div>

          <div className="mt-8 flex justify-center" role="tablist" aria-label="Funnel process tabs">
            <div className="inline-flex flex-wrap items-center justify-center rounded-full border border-[#D9C6FF] bg-white p-1 shadow-sm">
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition md:px-6 md:py-2.5 md:text-base ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_8px_20px_rgba(109,40,217,0.35)]'
                        : 'text-violet-800 hover:bg-violet-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab ? (
            <div id={`funnel-panel-${activeTab.id}`} role="tabpanel" aria-labelledby={`funnel-tab-${activeTab.id}`} className="mt-8">
              <p className="text-center text-sm font-medium text-violet-900 md:text-base">{activeTab.description}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {activeTab.routes.map((route) => {
                  const isSelected = route.id === activeRoute?.id;
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
                    <div className="overflow-hidden">
                      <div
                        className="flex transition-transform duration-700 ease-out will-change-transform"
                        style={{ transform: `translateX(-${safeDesktopStepIndex * (100 / DESKTOP_CARDS_PER_VIEW)}%)` }}
                      >
                        {steps.map((step, index) => (
                          <div key={step.id} className="w-1/2 shrink-0 px-2">
                            <StepCard step={step} index={index} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 md:hidden">
                    <div
                      className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      aria-label="Funnel process documents carousel"
                    >
                      {steps.map((step, index) => (
                        <div key={step.id} className="w-[86%] shrink-0 snap-center">
                          <StepCard step={step} index={index} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <a
                      href={cta.href}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(109,40,217,0.35)] transition hover:from-violet-500 hover:to-fuchsia-500 md:px-8 md:py-3.5 md:text-base"
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
