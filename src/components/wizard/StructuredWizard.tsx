/**
 * Structured Wizard - MQS-Powered
 *
 * Form-based wizard using MQS backend for all products
 * Now unified with the MQS system for consistency across all wizards
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '@/components/ui';

interface ExtendedWizardQuestion {
  id: string;
  section?: string;
  question: string;
  inputType: string;
  helperText?: string;
  suggestion_prompt?: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  dependsOn?: {
    questionId: string;
    value: any;
  };
  fields?: Array<{
    id: string;
    label: string;
    inputType: string;
    placeholder?: string;
    options?: string[];
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    };
    width?: 'full' | 'half' | 'third';
  }>;
  maps_to?: string[];
}

interface StructuredWizardProps {
  caseId: string;
  caseType: string;
  jurisdiction: string;
  onComplete: (caseId: string) => void;
}

export const StructuredWizard: React.FC<StructuredWizardProps> = ({
  caseId,
  caseType,
  jurisdiction,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<ExtendedWizardQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [askHeavenSuggestion, setAskHeavenSuggestion] = useState<string | null>(null);

  // Load first question on mount
  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    setLoading(true);
    setError(null);
    setAskHeavenSuggestion(null);

    try {
      const response = await fetch('/api/wizard/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load question: ${response.status}`);
      }

      const data = await response.json();

      if (data.is_complete) {
        setIsComplete(true);
        await handleComplete();
      } else if (data.next_question) {
        setCurrentQuestion(data.next_question);
        setCurrentAnswer(null); // Reset answer for new question
        setProgress(data.progress || 0);
      } else {
        throw new Error('No question returned from API');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
      console.error('Load question error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentAnswerValid = (): boolean => {
    if (!currentQuestion) return false;

    // For grouped inputs, validate all fields
    if (currentQuestion.inputType === 'group' && currentQuestion.fields) {
      for (const field of currentQuestion.fields) {
        const fieldValue = currentAnswer?.[field.id];

        if (field.validation?.required && !fieldValue) {
          setError(`Please fill in ${field.label.toLowerCase()}`);
          return false;
        }

        // Validate pattern (e.g., postcode)
        if (field.validation?.pattern && fieldValue) {
          const regex = new RegExp(field.validation.pattern, 'i');
          if (!regex.test(fieldValue)) {
            setError(`Invalid format for ${field.label.toLowerCase()}`);
            return false;
          }
        }

        // Validate number range
        if ((field.inputType === 'number' || field.inputType === 'currency') && fieldValue) {
          const num = parseFloat(fieldValue);
          if (isNaN(num)) {
            setError(`${field.label} must be a valid number`);
            return false;
          }
          if (field.validation?.min !== undefined && num < field.validation.min) {
            setError(`${field.label} must be at least ${field.validation.min}`);
            return false;
          }
          if (field.validation?.max !== undefined && num > field.validation.max) {
            setError(`${field.label} must be at most ${field.validation.max}`);
            return false;
          }
        }
      }
      return true;
    }

    // For single inputs
    if (currentQuestion.validation?.required && !currentAnswer) {
      setError('This field is required');
      return false;
    }

    // Validate numbers and currency
    if (
      (currentQuestion.inputType === 'currency' || currentQuestion.inputType === 'number') &&
      currentAnswer
    ) {
      const num = parseFloat(currentAnswer);
      if (isNaN(num)) {
        setError('Please enter a valid number');
        return false;
      }
      if (currentQuestion.validation?.min !== undefined && num < currentQuestion.validation.min) {
        setError(`Must be at least ${currentQuestion.validation.min}`);
        return false;
      }
      if (currentQuestion.validation?.max !== undefined && num > currentQuestion.validation.max) {
        setError(`Must be at most ${currentQuestion.validation.max}`);
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!isCurrentAnswerValid()) {
      if (!error) {
        setError('Please provide a valid answer to continue');
      }
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Save answer to backend
      const response = await fetch('/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: currentQuestion!.id,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save answer: ${response.status}`);
      }

      const data = await response.json();

      // Check for Ask Heaven suggestions
      if (data.suggested_wording) {
        setAskHeavenSuggestion(data.suggested_wording);
      }

      // Update progress
      setProgress(data.progress || 0);

      // Check if complete
      if (data.is_complete) {
        setIsComplete(true);
        await handleComplete();
      } else {
        // Load next question
        await loadNextQuestion();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save answer');
      console.error('Save answer error:', err);
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Call analyze endpoint
      await fetch('/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
        }),
      });

      // Navigate to completion
      onComplete(caseId);
    } catch (err: any) {
      setError(err.message || 'Failed to complete wizard');
      setLoading(false);
    }
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    const value = currentAnswer ?? '';

    switch (currentQuestion.inputType) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- Select an option --</option>
            {currentQuestion.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentAnswer(true)}
              variant={value === true ? 'primary' : 'secondary'}
              disabled={loading}
            >
              Yes
            </Button>
            <Button
              onClick={() => setCurrentAnswer(false)}
              variant={value === false ? 'primary' : 'secondary'}
              disabled={loading}
            >
              No
            </Button>
          </div>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option);
                    setCurrentAnswer(newValues);
                  }}
                  className="w-4 h-4 text-primary"
                  disabled={loading}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">£</span>
            <Input
              type="number"
              value={value}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="pl-8"
              min={currentQuestion.validation?.min}
              max={currentQuestion.validation?.max}
              disabled={loading}
            />
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={loading}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );

      case 'tel':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            min={currentQuestion.validation?.min}
            max={currentQuestion.validation?.max}
            disabled={loading}
          />
        );

      case 'group':
        // Render multiple fields in a grouped layout
        if (!currentQuestion.fields) return null;

        const groupValue = currentAnswer || {};

        return (
          <div className="flex flex-wrap gap-4">
            {currentQuestion.fields.map((field) => {
              const fieldValue = groupValue[field.id] || '';
              const widthClass =
                field.width === 'full'
                  ? 'w-full'
                  : field.width === 'half'
                  ? 'w-full md:w-[calc(50%-0.5rem)]'
                  : 'w-full md:w-[calc(33.333%-0.5rem)]';

              return (
                <div key={field.id} className={widthClass}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.inputType === 'select' ? (
                    <select
                      value={fieldValue}
                      onChange={(e) =>
                        setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">-- Select --</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.inputType === 'currency' ? (
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">£</span>
                      <Input
                        type="number"
                        value={fieldValue}
                        onChange={(e) =>
                          setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        className="pl-8 w-full"
                        min={field.validation?.min}
                        max={field.validation?.max}
                        disabled={loading}
                      />
                    </div>
                  ) : field.inputType === 'textarea' ? (
                    <textarea
                      value={fieldValue}
                      onChange={(e) =>
                        setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]"
                      rows={3}
                    />
                  ) : (
                    <Input
                      type={field.inputType}
                      value={fieldValue}
                      onChange={(e) =>
                        setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full"
                      min={field.validation?.min}
                      max={field.validation?.max}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Wizard Complete!</h2>
        <p className="text-gray-600">Redirecting to preview...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentQuestion.section || 'Question'}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h2>

        {currentQuestion.helperText && (
          <p className="text-sm text-gray-600 mb-6">{currentQuestion.helperText}</p>
        )}

        <div className="mb-6">{renderInput()}</div>

        {/* Ask Heaven Suggestion */}
        {askHeavenSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-sm font-semibold">💡 Suggestion:</div>
              <p className="text-sm text-blue-800 flex-1">{askHeavenSuggestion}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={handleNext}
            variant="primary"
            size="large"
            className="flex-1"
            disabled={loading || !currentAnswer}
          >
            {loading ? 'Saving...' : 'Next →'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
