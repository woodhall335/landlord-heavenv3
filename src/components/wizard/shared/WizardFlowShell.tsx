'use client';

import React from 'react';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { clsx } from 'clsx';
import { isWizardThemeV2 } from './theme';

export interface WizardTab {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
}

export interface WizardFlowShellProps {
  title: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  tabs: WizardTab[];
  sectionTitle: string;
  sectionDescription?: string;
  banner?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  navigation: React.ReactNode;
}

export function WizardFlowShell({
  title,
  completedCount,
  totalCount,
  progress,
  tabs,
  sectionTitle,
  sectionDescription,
  banner,
  sidebar,
  children,
  navigation,
}: WizardFlowShellProps) {
  const completionLabel = `${completedCount} of ${totalCount} sections complete`;
  const currentTabIndex = tabs.findIndex((tab) => tab.isCurrent);
  const activeStep = currentTabIndex >= 0 ? currentTabIndex + 1 : 1;

  return (
    <div className={clsx('min-h-screen', isWizardThemeV2 ? 'bg-white' : 'bg-gray-50')}>
      <header className={clsx('border-b sticky top-0 z-10 bg-white/95 backdrop-blur', isWizardThemeV2 ? 'border-violet-200' : 'border-gray-200')}>
        <div className={clsx('mx-auto px-4 py-4', isWizardThemeV2 ? 'max-w-[1240px]' : 'max-w-6xl')}>
          <div className="mb-2.5 flex items-center justify-between">
            <h1 className={clsx('font-semibold', isWizardThemeV2 ? 'text-xl tracking-tight text-violet-950' : 'text-lg text-gray-900')}>
              {title}
            </h1>
            <p className={clsx('text-sm font-semibold', isWizardThemeV2 ? 'text-violet-900' : 'text-gray-700')}>
              {completionLabel}
            </p>
          </div>

          <div className={clsx('h-2 rounded-full overflow-hidden', isWizardThemeV2 ? 'bg-violet-100 ring-1 ring-violet-200/70' : 'bg-gray-200')}>
            <div
              className={clsx('h-full transition-all duration-300', isWizardThemeV2 ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'bg-[#7C3AED]')}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 overflow-x-auto pb-2">
            <ol className="flex min-w-max items-center gap-2">
              {tabs.map((tab, index) => (
                <li key={tab.id} className="flex items-center gap-2">
                  <button
                    onClick={tab.onClick}
                    className={clsx(
                      'px-3 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors border shrink-0 flex items-center gap-2',
                      tab.isCurrent
                        ? 'bg-violet-50 text-violet-950 border-violet-500 ring-2 ring-violet-200'
                        : 'bg-white text-violet-900 hover:bg-violet-50 border-violet-200',
                      tab.hasIssue && !tab.isCurrent && 'ring-2 ring-rose-300 border-rose-300 text-rose-900'
                    )}
                  >
                    <span className={clsx(
                      'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold',
                      tab.isCurrent ? 'bg-violet-600 text-white' : tab.isComplete ? 'bg-emerald-600 text-white' : tab.hasIssue ? 'bg-rose-600 text-white' : 'bg-violet-100 text-violet-800'
                    )}>
                      {tab.isComplete && !tab.hasIssue ? <RiCheckLine className="w-3.5 h-3.5" /> : tab.hasIssue ? <RiErrorWarningLine className="w-3.5 h-3.5" /> : index + 1}
                    </span>
                    {tab.label}
                  </button>
                  {index < tabs.length - 1 ? <span className="h-px w-4 bg-violet-200" aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <div className={clsx('mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6', isWizardThemeV2 ? 'max-w-[1240px] items-start' : 'max-w-6xl')}>
        <main className={clsx('flex-1', isWizardThemeV2 ? 'lg:max-w-[860px]' : 'lg:max-w-4xl')}>
          {banner}
          <div className={clsx('border overflow-hidden', isWizardThemeV2 ? 'bg-white rounded-2xl border-violet-200 shadow-[0_12px_28px_rgba(76,29,149,0.10)]' : 'bg-white rounded-xl shadow-sm border-gray-200')}>
            <div className="p-6 md:p-7">
              <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                Step {activeStep} of {tabs.length}
              </div>
              <div className="mb-6">
                <h2 className={clsx('text-xl font-semibold', isWizardThemeV2 ? 'tracking-tight text-violet-950' : 'text-gray-900')}>
                  {sectionTitle}
                </h2>
                {sectionDescription && (
                  <p className={clsx('text-sm mt-1', isWizardThemeV2 ? 'text-violet-700' : 'text-gray-500')}>
                    {sectionDescription}
                  </p>
                )}
              </div>
              {children}
            </div>

            <div className={clsx('px-6 md:px-7 py-4 border-t flex items-center justify-between', isWizardThemeV2 ? 'border-violet-100 bg-white min-h-[76px]' : 'border-gray-200 bg-white')}>
              {navigation}
            </div>
          </div>
        </main>

        {sidebar && (
          <aside className="lg:w-[340px] shrink-0 self-start">
            <div className="sticky top-24">{sidebar}</div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default WizardFlowShell;

