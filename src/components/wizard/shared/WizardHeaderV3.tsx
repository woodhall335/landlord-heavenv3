import React from 'react';

interface WizardHeaderV3Props {
  title: string;
  completedCount: number;
  totalCount: number;
  progress: number;
}

export function WizardHeaderV3({ title, completedCount, totalCount, progress }: WizardHeaderV3Props) {
  return (
    <header className="sticky top-20 z-20 border-b border-violet-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-violet-950">{title}</h1>
        <div className="mb-2 mt-3 flex items-center justify-between text-sm">
          <span className="font-semibold uppercase tracking-wide text-violet-700">Progress</span>
          <span className="font-semibold text-violet-900">{completedCount} of {totalCount} sections complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-violet-100 ring-1 ring-violet-200/70">
          <div className="h-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </header>
  );
}
