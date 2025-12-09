// src/components/wizard/SectionContainer.tsx

'use client';

import React from 'react';
import { Button, Card } from '@/components/ui';

interface SectionContainerProps {
  title: string;
  stepIndex: number;
  totalSteps: number;
  isFirst?: boolean;
  isLast?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  stepIndex,
  totalSteps,
  isFirst = false,
  isLast = false,
  onNext,
  onBack,
  children,
}) => {
  const stepLabel = `Step ${stepIndex + 1} of ${totalSteps}`;

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Money claim wizard
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
          <span className="text-xs text-gray-500">{stepLabel}</span>
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          {!isFirst && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {!isLast && (
            <Button onClick={onNext}>
              Continue
            </Button>
          )}
          {isLast && (
            <Button variant="primary" onClick={onNext}>
              Finish review
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
