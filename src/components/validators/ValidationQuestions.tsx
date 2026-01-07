/**
 * Validation Questions Component
 *
 * Renders follow-up questions for missing facts in the validation process.
 * Uses the fact keys system to display appropriate input types.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { RiQuestionLine, RiCheckLine, RiLoader4Line } from 'react-icons/ri';
import type { FactKey } from '@/lib/validators/facts/factKeys';
import { FACT_QUESTIONS, type FactQuestionConfig } from '@/lib/validators/facts/factKeys';

interface ValidationQuestionsProps {
  missingFacts: string[];
  validatorKey: 'section_21' | 'section_8';
  caseId: string;
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

type QuestionInputType = 'yes_no' | 'date' | 'currency' | 'select' | 'multi_select' | 'text' | 'number';

interface QuestionOption {
  value: string;
  label: string;
}

// Map fact keys to question configurations
function getQuestionConfig(factKey: string): FactQuestionConfig | undefined {
  return FACT_QUESTIONS.find((q) => q.factKey === factKey);
}

// Input component based on question type
function QuestionInput({
  factKey,
  config,
  value,
  onChange,
  error,
}: {
  factKey: string;
  config?: FactQuestionConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}) {
  const baseClassName =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent';
  const errorClassName = error ? 'border-red-300 focus:ring-red-500' : '';

  const type = config?.type || 'text';

  switch (type) {
    case 'yes_no':
      return (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange('yes')}
            className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
              value === 'yes'
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange('no')}
            className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
              value === 'no'
                ? 'bg-red-100 border-red-500 text-red-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            No
          </button>
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          className={`${baseClassName} ${errorClassName}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'currency':
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`${baseClassName} ${errorClassName} pl-7`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
          />
        </div>
      );

    case 'number':
      return (
        <input
          type="number"
          className={`${baseClassName} ${errorClassName}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <select
          className={`${baseClassName} ${errorClassName}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option...</option>
          {config?.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'multi_select':
      return (
        <div className="space-y-2">
          {config?.options?.map((opt) => {
            const isSelected = Array.isArray(value) && value.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-purple-50 border-purple-300'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...current, opt.value]);
                    } else {
                      onChange(current.filter((v: string) => v !== opt.value));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    default:
      return (
        <input
          type="text"
          className={`${baseClassName} ${errorClassName}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config?.placeholder || ''}
        />
      );
  }
}

export function ValidationQuestions({
  missingFacts,
  validatorKey,
  caseId,
  onSubmit,
  isSubmitting = false,
  className = '',
}: ValidationQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter to questions that have configurations
  const questionsToShow = missingFacts
    .map((factKey) => ({ factKey, config: getQuestionConfig(factKey) }))
    .filter(({ config }) => config !== undefined);

  const currentQuestion = questionsToShow[currentIndex];
  const isLastQuestion = currentIndex === questionsToShow.length - 1;
  const progress = ((currentIndex + 1) / questionsToShow.length) * 100;

  const updateAnswer = (factKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [factKey]: value }));
    setErrors((prev) => ({ ...prev, [factKey]: '' }));
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const { factKey, config } = currentQuestion;
    const value = answers[factKey];

    // Basic validation
    if (config?.required && (value === undefined || value === '' || value === null)) {
      setErrors((prev) => ({ ...prev, [factKey]: 'This field is required' }));
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(answers);
    } catch (err) {
      console.error('Failed to submit answers:', err);
    }
  };

  if (questionsToShow.length === 0) {
    return null;
  }

  if (!currentQuestion) {
    return null;
  }

  const { factKey, config } = currentQuestion;

  return (
    <div className={`rounded-xl border border-blue-200 bg-blue-50 overflow-hidden ${className}`}>
      {/* Progress Bar */}
      <div className="h-1 bg-blue-100">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <RiQuestionLine className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">
              Question {currentIndex + 1} of {questionsToShow.length}
            </p>
            <h3 className="font-semibold text-blue-900">Additional Information Needed</h3>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {config?.question}
            {config?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {config?.helpText && (
            <p className="text-sm text-gray-600 mb-3">{config.helpText}</p>
          )}
          <QuestionInput
            factKey={factKey}
            config={config}
            value={answers[factKey]}
            onChange={(value) => updateAnswer(factKey, value)}
            error={errors[factKey]}
          />
          {errors[factKey] && (
            <p className="mt-2 text-sm text-red-600">{errors[factKey]}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <RiLoader4Line className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : isLastQuestion ? (
              <>
                <RiCheckLine className="h-4 w-4" />
                Complete & Validate
              </>
            ) : (
              'Next →'
            )}
          </button>
        </div>
      </div>

      {/* Quick answers indicator */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {questionsToShow.map((q, idx) => {
            const hasAnswer = answers[q.factKey] !== undefined && answers[q.factKey] !== '';
            return (
              <button
                key={q.factKey}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentIndex
                    ? 'bg-blue-600'
                    : hasAnswer
                      ? 'bg-green-500'
                      : 'bg-blue-200'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
