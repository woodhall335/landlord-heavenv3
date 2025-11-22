/**
 * Structured Wizard - Fixed Question Flow
 *
 * Reliable, form-based wizard that guarantees all required fields are collected
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { TENANCY_AGREEMENT_QUESTIONS, WizardQuestion } from '@/lib/wizard/tenancy-questions';

interface StructuredWizardProps {
  caseId: string;
  caseType: 'tenancy_agreement';
  jurisdiction: string;
  onComplete: (caseId: string) => void;
}

export const StructuredWizard: React.FC<StructuredWizardProps> = ({
  caseId,
  caseType,
  jurisdiction,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all questions (filter out conditional questions that don't apply)
  const getVisibleQuestions = (): WizardQuestion[] => {
    return TENANCY_AGREEMENT_QUESTIONS.filter((q) => {
      if (!q.dependsOn) return true;

      const dependentValue = answers[q.dependsOn.questionId];
      if (Array.isArray(q.dependsOn.value)) {
        return q.dependsOn.value.includes(dependentValue);
      }
      return dependentValue === q.dependsOn.value;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;
  const currentSection = currentQuestion?.section || '';

  // Check if current answer is valid
  const isCurrentAnswerValid = (): boolean => {
    const answer = answers[currentQuestion.id];

    if (currentQuestion.validation?.required && !answer) {
      return false;
    }

    if (currentQuestion.inputType === 'currency' || currentQuestion.inputType === 'number') {
      const num = parseFloat(answer);
      if (isNaN(num)) return false;
      if (currentQuestion.validation?.min !== undefined && num < currentQuestion.validation.min) {
        return false;
      }
      if (currentQuestion.validation?.max !== undefined && num > currentQuestion.validation.max) {
        return false;
      }
    }

    // Validate deposit amount against rent (Tenant Fees Act 2019)
    if (currentQuestion.id === 'deposit_amount') {
      const rentAmount = parseFloat(answers.rent_amount);
      const depositAmount = parseFloat(answer);

      if (rentAmount && depositAmount) {
        const weeklyRent = rentAmount / 4.33;
        const maxDeposit = weeklyRent * 5; // 5 weeks for England & Wales

        if (depositAmount > maxDeposit + 0.01) {
          setError(`❌ ILLEGAL DEPOSIT: £${depositAmount} exceeds legal maximum of £${maxDeposit.toFixed(2)} (5 weeks rent). Tenant Fees Act 2019 violation.`);
          return false;
        }
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

    // Save answer to database
    try {
      setLoading(true);
      await fetch('/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: currentQuestion.id,
          question_text: currentQuestion.question,
          answer: answers[currentQuestion.id],
        }),
      });

      if (currentQuestionIndex < visibleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered - mark as complete
        await handleComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save answer');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError(null);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Transform answers into format expected by AST generator
      const transformedData = transformAnswersToASTData(answers);

      // Analyze the case
      await fetch('/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          case_type: caseType,
          jurisdiction,
          collected_facts: transformedData,
        }),
      });

      onComplete(caseId);
    } catch (err: any) {
      setError(err.message || 'Failed to complete wizard');
      setLoading(false);
    }
  };

  const renderInput = () => {
    const value = answers[currentQuestion.id] || '';

    switch (currentQuestion.inputType) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
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
              onClick={() => setAnswers({ ...answers, [currentQuestion.id]: 'yes' })}
              variant={value === 'yes' ? 'primary' : 'secondary'}
              disabled={loading}
            >
              Yes
            </Button>
            <Button
              onClick={() => setAnswers({ ...answers, [currentQuestion.id]: 'no' })}
              variant={value === 'no' ? 'primary' : 'secondary'}
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
                      : selectedValues.filter((v) => v !== option);
                    setAnswers({ ...answers, [currentQuestion.id]: newValues });
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
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
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
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            disabled={loading}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );

      case 'tel':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder={currentQuestion.placeholder}
            min={currentQuestion.validation?.min}
            max={currentQuestion.validation?.max}
            disabled={loading}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentSection}</span>
          <span>
            Question {currentQuestionIndex + 1} of {visibleQuestions.length}
          </span>
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <Button onClick={handleBack} variant="secondary" disabled={currentQuestionIndex === 0 || loading}>
            ← Back
          </Button>
          <Button onClick={handleNext} variant="primary" className="flex-1" disabled={loading}>
            {currentQuestionIndex === visibleQuestions.length - 1
              ? 'Complete →'
              : 'Next →'}
          </Button>
        </div>
      </Card>

      {/* Summary Sidebar */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Sections</h3>
        <div className="space-y-1 text-sm">
          {Array.from(new Set(visibleQuestions.map((q) => q.section))).map((section) => (
            <div
              key={section}
              className={`${section === currentSection ? 'text-primary font-semibold' : 'text-gray-600'}`}
            >
              {section}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Transform answers to AST data format
function transformAnswersToASTData(answers: Record<string, any>): any {
  // Build tenants array
  const numberOfTenants = parseInt(answers.number_of_tenants) || 1;
  const tenants = [];

  for (let i = 1; i <= numberOfTenants; i++) {
    tenants.push({
      full_name: answers[`tenant_${i}_full_name`],
      email: answers[`tenant_${i}_email`],
      phone: answers[`tenant_${i}_phone`],
      dob: answers[`tenant_${i}_dob`],
    });
  }

  return {
    // Property
    property_address: answers.property_address,
    property_type: answers.property_type,
    furnished_status: answers.furnished_status?.toLowerCase(),
    number_of_bedrooms: answers.number_of_bedrooms,

    // Landlord
    landlord_full_name: answers.landlord_full_name,
    landlord_address: answers.landlord_address,
    landlord_email: answers.landlord_email,
    landlord_phone: answers.landlord_phone,

    // Tenants
    tenants,

    // Term
    tenancy_start_date: answers.tenancy_start_date,
    is_fixed_term: answers.is_fixed_term === 'Fixed term (set end date)',
    tenancy_end_date: answers.tenancy_end_date,
    term_length: answers.term_length,

    // Rent
    rent_amount: parseFloat(answers.rent_amount),
    rent_due_day: answers.rent_due_day,
    payment_method: answers.payment_method,
    payment_details: `${answers.bank_account_name}\nSort Code: ${answers.bank_sort_code}\nAccount: ${answers.bank_account_number}`,

    // Deposit
    deposit_amount: parseFloat(answers.deposit_amount),
    deposit_scheme_name: answers.deposit_scheme?.split(' ')[0], // Extract 'DPS', 'MyDeposits', or 'TDS'

    // Bills
    council_tax_responsibility: answers.council_tax_responsibility,
    utilities_responsibility: answers.utilities_responsibility,
    internet_responsibility: answers.internet_responsibility,

    // Property rules
    pets_allowed: answers.pets_allowed === 'yes',
    approved_pets: answers.approved_pets?.join(', '),
    smoking_allowed: answers.smoking_allowed === 'yes',
    parking: answers.parking_available === 'yes',
    parking_details: answers.parking_details,

    // Metadata
    agreement_date: new Date().toISOString().split('T')[0],
  };
}
