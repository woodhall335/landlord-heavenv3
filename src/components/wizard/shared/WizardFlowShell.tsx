'use client';

import React from 'react';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { clsx } from 'clsx';
import { isWizardThemeV2 } from './theme';

interface WizardTab {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
}

interface WizardFlowShellProps {
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

  return (
    <div
      className={clsx(
        'min-h-screen pt-20',
        isWizardThemeV2
          ? 'bg-gradient-to-b from-violet-100/55 via-violet-50/35 to-[#FAFAFC]'
          : 'bg-gray-50'
      )}
    >
      <header
        className={clsx(
          'border-b sticky top-20 z-10',
          isWizardThemeV2
            ? 'bg-white/90 backdrop-blur-md border-violet-200'
            : 'bg-white border-gray-200'
        )}
      >
        <div className={clsx('mx-auto px-4 py-4', isWizardThemeV2 ? 'max-w-[1240px]' : 'max-w-6xl')}>
          <div className="flex items-center justify-between mb-3 gap-4">
            <h1
              className={clsx(
                'font-semibold',
                isWizardThemeV2 ? 'text-xl tracking-tight text-violet-950' : 'text-lg text-gray-900'
              )}
            >
              {title}
            </h1>
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <p
              className={clsx(
                'text-[12px] font-semibold uppercase tracking-wide',
                isWizardThemeV2 ? 'text-violet-700/90' : 'text-gray-500'
              )}
            >
              Progress
            </p>
            <p className={clsx('text-sm font-semibold', isWizardThemeV2 ? 'text-violet-900' : 'text-gray-700')}>
              {completionLabel}
            </p>
          </div>

          <div
            className={clsx(
              'h-2 rounded-full overflow-hidden',
              isWizardThemeV2 ? 'bg-violet-100 ring-1 ring-violet-200/70' : 'bg-gray-200'
            )}
          >
            <div
              className={clsx(
                'h-full transition-all duration-300',
                isWizardThemeV2 ? 'bg-violet-600' : 'bg-[#7C3AED]'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors border shrink-0',
                  tab.isCurrent
                    ? isWizardThemeV2
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-[#7C3AED] text-white border-[#7C3AED]'
                    : isWizardThemeV2
                    ? 'bg-white text-violet-900 hover:bg-violet-50 border-violet-200 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.08)]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
                  tab.hasIssue && !tab.isCurrent && (isWizardThemeV2 ? 'ring-2 ring-rose-300' : 'ring-2 ring-red-300')
                )}
              >
                <span className="flex items-center gap-1.5">
                  {tab.isComplete && !tab.hasIssue && (
                    <RiCheckLine
                      className={clsx('w-4 h-4', isWizardThemeV2 ? 'text-violet-500' : 'text-green-500')}
                    />
                  )}
                  {tab.hasIssue && (
                    <RiErrorWarningLine
                      className={clsx('w-4 h-4', isWizardThemeV2 ? 'text-rose-600' : 'text-red-500')}
                    />
                  )}
                  {tab.label}
                </span>
              </button>
            ))}
            </div>
          </div>
        </div>
      </header>

      <div className={clsx('mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6', isWizardThemeV2 ? 'max-w-[1240px] items-start' : 'max-w-6xl')}>
        <main className={clsx('flex-1', isWizardThemeV2 ? 'lg:max-w-[860px]' : 'lg:max-w-4xl')}>
          {banner}
          <div
            className={clsx(
              'border overflow-hidden',
              isWizardThemeV2
                ? 'bg-white rounded-xl border-violet-200 shadow-[0_8px_22px_rgba(31,41,55,0.08)]'
                : 'bg-white rounded-xl shadow-sm border-gray-200'
            )}
          >
            <div className="p-6 md:p-7">
              <div className="mb-6">
                <h2
                  className={clsx(
                    'text-xl font-semibold',
                    isWizardThemeV2 ? 'tracking-tight text-violet-950' : 'text-gray-900'
                  )}
                >
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

            <div
              className={clsx(
                'px-6 md:px-7 py-4 border-t flex items-center justify-between',
                isWizardThemeV2 ? 'border-violet-100 bg-violet-50/30 min-h-[76px]' : 'border-gray-200 bg-white'
              )}
            >
              {navigation}
            </div>
          </div>
        </main>

        {sidebar && (
          <aside className="lg:w-[340px] shrink-0 self-start">
            <div className="sticky top-40">{sidebar}</div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default WizardFlowShell;
