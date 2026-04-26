'use client';

import React from 'react';
import { WizardMainCardV3 } from './WizardMainCardV3';
import { GuidancePanelV3 } from './GuidancePanelV3';
import { WizardFooterNavV3 } from './WizardFooterNavV3';
import { WizardTopBarV3 } from './WizardTopBarV3';
import { WizardPackSummaryRail } from './WizardPackSummaryRail';
import {
  getStepMetadata,
  resolveStepIconPath,
  type StepMetadata,
  type WizardJurisdiction,
  type WizardProduct,
} from './stepMetadata';
import { getEnglandPossessionScreenMeta } from './englandPossessionScreenConfig';

interface WizardTab {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
}

interface EnglandPossessionWorkspaceShellProps {
  title: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  tabs: WizardTab[];
  sectionTitle: string;
  sectionDescription?: string;
  banner?: React.ReactNode;
  sidebar?: React.ReactNode;
  guidancePanel?: React.ReactNode;
  children: React.ReactNode;
  navigation?: React.ReactNode;
  navigationLeft?: React.ReactNode;
  navigationCenter?: React.ReactNode;
  navigationRight?: React.ReactNode;
  product: Extract<WizardProduct, 'notice_only' | 'complete_pack'>;
  jurisdiction: Extract<WizardJurisdiction, 'england'>;
  currentStepId?: string;
  saveState?: 'idle' | 'saving' | 'saved';
  saveStatusLabel?: string;
}

function StepFocusPanel({
  title,
  eyebrow,
  helper,
  focusTitle,
  focusItems,
  outputTitle,
  outputs,
  legalChecks,
  compact = false,
}: {
  title: string;
  eyebrow: string;
  helper: string;
  focusTitle: string;
  focusItems: string[];
  outputTitle: string;
  outputs: string[];
  legalChecks?: string[];
  compact?: boolean;
}) {
  return (
    <section className={`rounded-[1.4rem] border border-[#e7dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,240,255,0.96))] shadow-[0_18px_46px_rgba(76,29,149,0.08)] ${compact ? 'p-4' : 'p-5'}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b56d8]">
        {eyebrow}
      </p>
      <h3 className={`mt-2 font-semibold tracking-tight text-[#20103f] ${compact ? 'text-base' : 'text-lg'}`}>
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#5e5872]">{helper}</p>

      <div className={`mt-4 grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.9fr)]'}`}>
        <div className="rounded-[1.1rem] border border-[#ece4ff] bg-white/88 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f54c8]">{focusTitle}</p>
          <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[#4f4768]">
            {focusItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#7c3aed]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="rounded-[1.1rem] border border-[#ece4ff] bg-white/88 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f54c8]">{outputTitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {outputs.map((output) => (
                <span
                  key={output}
                  className="rounded-full border border-[#ddd0ff] bg-[#faf7ff] px-3 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm"
                >
                  {output}
                </span>
              ))}
            </div>
          </div>

          {legalChecks && legalChecks.length > 0 ? (
            <div className="rounded-[1.1rem] border border-[#dff2e3] bg-[#f5fff7] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1f7a40]">Legal checks in play</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {legalChecks.map((check) => (
                  <span
                    key={check}
                    className="rounded-full border border-[#cdeed4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f7a40] shadow-sm"
                  >
                    {check}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function EnglandPossessionWorkspaceShell({
  title,
  completedCount,
  totalCount,
  progress,
  tabs,
  sectionTitle,
  sectionDescription,
  banner,
  sidebar,
  guidancePanel,
  children,
  navigation,
  navigationLeft,
  navigationCenter,
  navigationRight,
  product,
  jurisdiction,
  currentStepId,
  saveState = 'idle',
  saveStatusLabel,
}: EnglandPossessionWorkspaceShellProps) {
  const currentMeta: StepMetadata | undefined = currentStepId
    ? getStepMetadata(product, jurisdiction, currentStepId)
    : undefined;
  const currentScreenMeta = getEnglandPossessionScreenMeta(product, currentStepId);
  const currentTabIndex = tabs.findIndex((tab) => tab.isCurrent);
  const activeStepIndex = currentTabIndex >= 0 ? currentTabIndex : 0;
  const currentTab = tabs[activeStepIndex];
  const issueCount = tabs.filter((tab) => tab.hasIssue).length;
  const completionLabel = `${completedCount} of ${totalCount} sections complete`;
  const percentageLabel = `${Math.round(progress)}% complete`;
  const resolvedSaveLabel =
    saveStatusLabel ||
    (saveState === 'saving'
      ? 'Saving your answers...'
      : saveState === 'saved'
        ? 'Saved just now'
        : 'Auto-save is on');
  const resolvedGuidancePanel = guidancePanel ?? <GuidancePanelV3 metadata={currentMeta} askHeaven={sidebar} />;
  const compactMobileGuidancePanel =
    guidancePanel ?? <GuidancePanelV3 metadata={currentMeta} askHeaven={sidebar} compact />;

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: '#f7f4ff',
        backgroundImage:
          "radial-gradient(circle at top, rgba(234,221,255,0.92) 0%, rgba(248,244,255,0.98) 34%, rgba(255,255,255,1) 74%), linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(247,242,255,0.98) 100%), url('/images/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <WizardTopBarV3
        tabs={tabs}
        getStepMetadataForId={(stepId) => getStepMetadata(product, jurisdiction, stepId)}
      />

      <div style={{ height: 'calc(var(--site-header-height) + var(--s21-banner-height) + var(--wizard-topbar-height))' }} aria-hidden="true" />

      <div className="mx-auto max-w-[1240px] space-y-3 px-4 pt-3 lg:hidden">
        <section className="rounded-[1.25rem] border border-[#e6dcff] bg-white/92 px-3.5 py-3 shadow-[0_12px_28px_rgba(76,29,149,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b56d8]">
                Progress
              </p>
              <p className="mt-1 text-[15px] font-semibold tracking-tight text-[#20103f]">
                {percentageLabel}
              </p>
            </div>
            <span className="rounded-full border border-[#ddd0ff] bg-white px-3 py-1 text-[11px] font-semibold text-[#5b36b3] shadow-sm">
              Step {activeStepIndex + 1} of {tabs.length}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#5e5872]">{completionLabel}</p>
          {currentTab ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#d9cafe] bg-[#faf7ff] px-3 py-1 text-[11px] font-semibold text-[#5b36b3] shadow-sm">
                Current: {currentTab.label}
              </span>
              {issueCount > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-900 shadow-sm">
                  {issueCount} need attention
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#ede4ff]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#5b21b6)] shadow-[0_8px_24px_rgba(91,33,182,0.28)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-[1rem] border border-[#ece4ff] bg-[#fcfbff] px-3 py-2 shadow-sm">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                saveState === 'saving'
                  ? 'animate-pulse bg-amber-500'
                  : saveState === 'saved'
                    ? 'bg-emerald-500'
                    : 'bg-[#8b5cf6]'
              }`}
            />
            <p className="text-xs font-medium text-[#4f4768]">{resolvedSaveLabel}</p>
          </div>
        </section>

        <WizardPackSummaryRail
          product={product}
          tabs={tabs}
          currentStepId={currentStepId}
          currentStepLabel={sectionTitle}
          mobile
        />

        {currentScreenMeta ? (
          <StepFocusPanel
            compact
            title={sectionTitle}
            eyebrow={currentScreenMeta.eyebrow}
            helper={currentScreenMeta.helper}
            focusTitle={currentScreenMeta.focusTitle}
            focusItems={currentScreenMeta.focusItems}
            outputTitle={currentScreenMeta.outputTitle}
            outputs={currentScreenMeta.outputs}
            legalChecks={currentScreenMeta.legalChecks}
          />
        ) : null}

        <details className="group">
          <summary className="list-none cursor-pointer rounded-[1.25rem] border border-[#e6dcff] bg-white/92 px-3.5 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#241247]">Step help and checklist</p>
                <p className="mt-1 text-[11px] leading-4.5 text-[#60597a]">
                  Ask Heaven, what you need, and why it matters.
                </p>
              </div>
              <span className="text-sm font-medium text-[#7650cd] transition group-open:rotate-180">⌄</span>
            </div>
          </summary>
          <div className="mt-2.5">{compactMobileGuidancePanel}</div>
        </details>
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-stretch gap-6 px-4 pb-12 pt-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <WizardMainCardV3
          shellTitle={title}
          sectionTitle={sectionTitle}
          sectionDescription={sectionDescription}
          stepIconPath={resolveStepIconPath(currentMeta)}
          stepNumber={activeStepIndex + 1}
          totalSteps={tabs.length}
          stepMotionKey={currentStepId || sectionTitle}
          banner={banner}
          navigation={
            navigation ? (
              <WizardFooterNavV3>{navigation}</WizardFooterNavV3>
            ) : (
              <WizardFooterNavV3
                leftSlot={navigationLeft}
                centerSlot={navigationCenter}
                rightSlot={navigationRight}
              />
            )
          }
        >
          {currentScreenMeta ? (
            <StepFocusPanel
              title={sectionTitle}
              eyebrow={currentScreenMeta.eyebrow}
              helper={currentScreenMeta.helper}
              focusTitle={currentScreenMeta.focusTitle}
              focusItems={currentScreenMeta.focusItems}
              outputTitle={currentScreenMeta.outputTitle}
              outputs={currentScreenMeta.outputs}
              legalChecks={currentScreenMeta.legalChecks}
            />
          ) : null}

          {children}
        </WizardMainCardV3>

        <aside className="hidden w-full min-h-0 shrink-0 lg:block lg:self-start lg:w-[360px]">
          <div className="lg:sticky lg:top-[calc(var(--site-header-height)+var(--s21-banner-height)+var(--wizard-topbar-height)+8px)]">
            <div className="space-y-4">
              <section className="rounded-[1.8rem] border border-[#e7dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,242,255,0.94))] p-5 shadow-[0_20px_60px_rgba(76,29,149,0.10)] backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b56d8]">
                      Progress
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#20103f]">
                      {percentageLabel}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#ddd0ff] bg-white px-3 py-1 text-xs font-semibold text-[#5b36b3] shadow-sm">
                    Step {activeStepIndex + 1} of {tabs.length}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5e5872]">{completionLabel}</p>
                {currentTab ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#d9cafe] bg-[#faf7ff] px-3 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm">
                      Current: {currentTab.label}
                    </span>
                    {issueCount > 0 ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm">
                        {issueCount} need attention
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#ede4ff]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#5b21b6)] shadow-[0_8px_24px_rgba(91,33,182,0.28)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#ece4ff] bg-white/85 px-3.5 py-2.5 shadow-sm">
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      saveState === 'saving'
                        ? 'animate-pulse bg-amber-500'
                        : saveState === 'saved'
                          ? 'bg-emerald-500'
                          : 'bg-[#8b5cf6]'
                    }`}
                  />
                  <p className="text-sm font-medium text-[#4f4768]">{resolvedSaveLabel}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[#61597a]">
                  <span className="rounded-full border border-[#e5dcff] bg-white px-3 py-1.5 shadow-sm">
                    Post-May 2026 route
                  </span>
                  <span className="rounded-full border border-[#e5dcff] bg-white px-3 py-1.5 shadow-sm">
                    Preview before payment
                  </span>
                  <span className="rounded-full border border-[#e5dcff] bg-white px-3 py-1.5 shadow-sm">
                    Save answers as you go
                  </span>
                </div>
              </section>

              <WizardPackSummaryRail
                product={product}
                tabs={tabs}
                currentStepId={currentStepId}
                currentStepLabel={sectionTitle}
              />

              {resolvedGuidancePanel}
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pb-8 text-center text-sm text-[#6f6788]">
        This service provides document preparation assistance. It does not provide legal advice.
      </div>
    </div>
  );
}

export default EnglandPossessionWorkspaceShell;
