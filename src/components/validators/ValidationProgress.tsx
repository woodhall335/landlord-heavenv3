/**
 * Validation Progress Component
 *
 * Shows an animated progress indicator during document analysis.
 * Displays step-by-step progress to keep users informed.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { RiLoader4Line, RiCheckLine, RiFileSearchLine, RiRobot2Line, RiShieldCheckLine } from 'react-icons/ri';

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ANALYSIS_STEPS: ProgressStep[] = [
  { id: 'upload', label: 'Uploading document', icon: <RiLoader4Line className="h-4 w-4" /> },
  { id: 'extract', label: 'Extracting text and fields', icon: <RiFileSearchLine className="h-4 w-4" /> },
  { id: 'classify', label: 'Classifying document type', icon: <RiRobot2Line className="h-4 w-4" /> },
  { id: 'validate', label: 'Running validation rules', icon: <RiShieldCheckLine className="h-4 w-4" /> },
];

interface ValidationProgressProps {
  isActive: boolean;
  className?: string;
}

export function ValidationProgress({ isActive, className = '' }: ValidationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Simulate progress through steps
    const timers: NodeJS.Timeout[] = [];

    // Step through each stage
    ANALYSIS_STEPS.forEach((_, index) => {
      const delay = index * 1500 + 500; // Stagger by 1.5s, start at 0.5s
      const timer = setTimeout(() => {
        setCurrentStep(index);
        if (index > 0) {
          setCompletedSteps((prev) => new Set([...prev, index - 1]));
        }
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={`rounded-lg border border-purple-200 bg-purple-50 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
            <RiLoader4Line className="h-5 w-5 text-white animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-purple-400 animate-ping" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-900">Analysing your document</h3>
          <p className="text-sm text-purple-700">This usually takes 5-10 seconds</p>
        </div>
      </div>

      <div className="space-y-2">
        {ANALYSIS_STEPS.map((step, index) => {
          const activeStep = isActive ? currentStep : 0;
          const activeCompletedSteps = isActive ? completedSteps : new Set<number>();
          const isCompleted = activeCompletedSteps.has(index);
          const isCurrent = activeStep === index;
          const isPending = index > activeStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : isCurrent
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-purple-400'
              }`}
            >
              <div className={`flex-shrink-0 ${isCurrent ? 'animate-pulse' : ''}`}>
                {isCompleted ? (
                  <RiCheckLine className="h-4 w-4 text-green-600" />
                ) : isCurrent ? (
                  <div className="text-purple-600">{step.icon}</div>
                ) : (
                  <div className="text-purple-300">{step.icon}</div>
                )}
              </div>
              <span className={`text-sm ${isCompleted ? 'font-medium' : isPending ? 'opacity-50' : 'font-medium'}`}>
                {step.label}
                {isCurrent && <span className="ml-1 animate-pulse">...</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1.5 bg-purple-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(((isActive ? currentStep : 0) + 1) / ANALYSIS_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
