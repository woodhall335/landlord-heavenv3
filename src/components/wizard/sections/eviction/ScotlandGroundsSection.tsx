/**
 * Scotland Grounds Section - Eviction Wizard
 *
 * Allows selection of Scotland eviction grounds.
 * ALL GROUNDS IN SCOTLAND ARE DISCRETIONARY - the First-tier Tribunal has discretion on all grounds.
 *
 * Ground data is loaded DYNAMICALLY from config - NEVER hardcode ground numbers or labels.
 *
 * Fields:
 * - scotland_eviction_ground: The selected ground number
 * - scotland_evidence_description: Evidence description text with Ask Heaven enhancement
 */

'use client';

import React, { useMemo, useEffect, useCallback } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  getScotlandGrounds,
  getGroundsByNoticePeriod,
  type ScotlandGround,
} from '@/lib/scotland/grounds';
import { buildScotlandEvidenceSummary } from '@/lib/scotland/noticeNarrativeBuilder';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import { useValidationContextSafe } from '@/components/wizard/ValidationContext';

interface ScotlandGroundsSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Optional callback to set the current question ID for Ask Heaven context */
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
  /** Case ID for Ask Heaven API calls */
  caseId?: string;
}

export const ScotlandGroundsSection: React.FC<ScotlandGroundsSectionProps> = ({
  facts,
  onUpdate,
  onSetCurrentQuestionId,
  caseId,
}) => {
  // Load grounds dynamically from config
  const grounds = useMemo(() => getScotlandGrounds(), []);
  const { shortNotice, standardNotice } = useMemo(() => getGroundsByNoticePeriod(), []);

  const selectedGround = facts.scotland_eviction_ground as number | undefined;
  const evidenceDescription = (facts.scotland_evidence_description as string) || '';

  // Pre-action requirements state (for Ground 1 - rent arrears)
  const preActionLetterSent = facts.issues?.rent_arrears?.pre_action_letter_sent === true;
  const preActionSignposted = facts.issues?.rent_arrears?.debt_advice_signposted === true;
  const preActionConfirmed = facts.issues?.rent_arrears?.pre_action_confirmed === true;

  // Validation context for registering blocking errors
  const validation = useValidationContextSafe();

  // Ground 1 (rent arrears) requires pre-action protocol compliance
  const isGround1Selected = selectedGround === 1;

  // Validate pre-action requirements for Ground 1
  useEffect(() => {
    if (!validation) return;

    if (isGround1Selected) {
      // Pre-action letter is required for Ground 1
      if (!preActionLetterSent) {
        validation.setFieldError('scotland_pre_action_letter', {
          field: 'scotland_pre_action_letter',
          message: 'Pre-action letter must be sent before Ground 1 Notice to Leave',
          severity: 'error',
          section: 'scotland_grounds',
        });
      } else {
        validation.clearFieldError('scotland_pre_action_letter');
      }

      // Pre-action signposting is a warning (recommended but not strictly blocking)
      if (!preActionSignposted) {
        validation.setFieldError('scotland_pre_action_signposting', {
          field: 'scotland_pre_action_signposting',
          message: 'Pre-action requirements include signposting tenant to debt advice',
          severity: 'warning',
          section: 'scotland_grounds',
        });
      } else {
        validation.clearFieldError('scotland_pre_action_signposting');
      }

      // Overall pre-action confirmation
      if (!preActionConfirmed) {
        validation.setFieldError('scotland_pre_action_confirmed', {
          field: 'scotland_pre_action_confirmed',
          message: 'You must confirm pre-action requirements are complete',
          severity: 'error',
          section: 'scotland_grounds',
        });
      } else {
        validation.clearFieldError('scotland_pre_action_confirmed');
      }
    } else {
      // Clear all pre-action errors when Ground 1 is not selected
      validation.clearFieldError('scotland_pre_action_letter');
      validation.clearFieldError('scotland_pre_action_signposting');
      validation.clearFieldError('scotland_pre_action_confirmed');
    }
  }, [isGround1Selected, preActionLetterSent, preActionSignposted, preActionConfirmed, validation]);

  // Handler for pre-action checkbox updates
  const handlePreActionUpdate = useCallback(
    (field: string, value: boolean) => {
      const updates: Record<string, unknown> = {
        issues: {
          ...facts.issues,
          rent_arrears: {
            ...facts.issues?.rent_arrears,
            [field]: value,
          },
        },
      };

      // If both letter sent and signposted, auto-confirm
      if (field === 'pre_action_letter_sent' && value && preActionSignposted) {
        updates.issues = {
          ...updates.issues as Record<string, unknown>,
          rent_arrears: {
            ...(updates.issues as Record<string, unknown>).rent_arrears as Record<string, unknown>,
            pre_action_confirmed: true,
          },
        };
      } else if (field === 'debt_advice_signposted' && value && preActionLetterSent) {
        updates.issues = {
          ...updates.issues as Record<string, unknown>,
          rent_arrears: {
            ...(updates.issues as Record<string, unknown>).rent_arrears as Record<string, unknown>,
            pre_action_confirmed: true,
          },
        };
      }

      onUpdate(updates);
    },
    [facts.issues, preActionLetterSent, preActionSignposted, onUpdate]
  );

  // Set current question ID for Ask Heaven context when section renders
  useEffect(() => {
    if (onSetCurrentQuestionId) {
      onSetCurrentQuestionId('scotland_eviction_ground');
    }
    return () => {
      if (onSetCurrentQuestionId) {
        onSetCurrentQuestionId(undefined);
      }
    };
  }, [onSetCurrentQuestionId]);

  // Handler for evidence textarea focus - switches Ask Heaven context
  const handleEvidenceFocus = useCallback(() => {
    onSetCurrentQuestionId?.('scotland_evidence_description');
  }, [onSetCurrentQuestionId]);

  // Handler for ground selection focus - switches Ask Heaven context back
  const handleGroundsFocus = useCallback(() => {
    onSetCurrentQuestionId?.('scotland_eviction_ground');
  }, [onSetCurrentQuestionId]);

  // "Use gathered details as starting point" handler
  const handleUseGatheredDetails = useCallback(() => {
    const { suggestedText } = buildScotlandEvidenceSummary(facts as any);
    onUpdate({ scotland_evidence_description: suggestedText });
  }, [facts, onUpdate]);

  const handleGroundSelect = (groundNumber: number) => {
    const ground = grounds.find(g => g.number === groundNumber);
    // Write both Scotland-specific fields AND generic ground_codes for requirements validation
    // ground_codes is expected by the notice_only preview requirements validator
    const groundCode = ground?.code || `Ground ${groundNumber}`;
    onUpdate({
      scotland_eviction_ground: groundNumber,
      scotland_ground_notice_period: ground?.noticePeriodDays || 84,
      scotland_ground_name: ground?.name || '',
      scotland_ground_type: 'discretionary', // All Scotland grounds are discretionary
      // Also set ground_codes for compatibility with requirements validator
      ground_codes: [groundCode],
    });
  };

  const renderGroundOption = (ground: ScotlandGround) => (
    <label
      key={ground.number}
      className={`
        flex items-start p-4 border rounded-lg cursor-pointer transition-all
        ${selectedGround === ground.number
          ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
      `}
    >
      <input
        type="radio"
        name="scotland_eviction_ground"
        value={ground.number}
        checked={selectedGround === ground.number}
        onChange={() => handleGroundSelect(ground.number)}
        className="mt-1 mr-3"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-gray-900">
            {ground.code}: {ground.name}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 shrink-0">
            {ground.noticePeriodDays} days notice
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{ground.description}</p>
        {ground.notes && (
          <p className="text-xs text-gray-500 mt-2 italic">{ground.notes}</p>
        )}
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Important notice about discretionary grounds */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          All Scotland Grounds are Discretionary
        </h4>
        <p className="text-amber-700 text-sm mt-2">
          Unlike England, Scotland has <strong>no mandatory grounds</strong> for eviction.
          The First-tier Tribunal has discretion on all grounds and will consider whether
          it is reasonable to grant the eviction order, even if the ground is proven.
        </p>
      </div>

      {/* Ground selection */}
      <div className="space-y-3" onFocusCapture={handleGroundsFocus}>
        <label className="block text-sm font-medium text-gray-700">
          Select Ground for Notice to Leave
          <span className="text-red-500 ml-1">*</span>
        </label>

        {/* Standard notice grounds (84 days) */}
        {standardNotice.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                84 days notice
              </span>
              Landlord Circumstance Grounds
            </h4>
            <div className="space-y-2">
              {standardNotice.map(renderGroundOption)}
            </div>
          </div>
        )}

        {/* Short notice grounds (28 days) */}
        {shortNotice.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                28 days notice
              </span>
              Tenant Conduct Grounds
            </h4>
            <div className="space-y-2">
              {shortNotice.map(renderGroundOption)}
            </div>
          </div>
        )}
      </div>

      {/* Selected ground details */}
      {selectedGround && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800">Selected Ground</h4>
          {(() => {
            const ground = grounds.find(g => g.number === selectedGround);
            if (!ground) return null;
            return (
              <div className="mt-2 space-y-3">
                <p className="text-blue-700">
                  <strong>{ground.code}: {ground.name}</strong>
                </p>
                <p className="text-sm text-blue-600">{ground.fullText}</p>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-blue-800 font-medium">Notice Period</p>
                    <p className="text-blue-700">{ground.noticePeriodDays} days</p>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">Ground Type</p>
                    <p className="text-blue-700">Discretionary</p>
                  </div>
                </div>

                {ground.requiredEvidence.length > 0 && (
                  <div className="mt-4">
                    <p className="text-blue-800 font-medium text-sm">Required Evidence:</p>
                    <ul className="mt-1 space-y-1">
                      {ground.requiredEvidence.map((ev, i) => (
                        <li key={i} className="text-sm text-blue-600 flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pre-action requirements for Ground 1 (Rent Arrears) */}
                {isGround1Selected && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h5 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                      <span className="text-lg">⚠️</span>
                      Pre-Action Requirements (Ground 1)
                    </h5>
                    <p className="text-sm text-amber-700 mb-4">
                      The Pre-Action Requirements (Notice to Leave and Notice of Proceedings) (Scotland)
                      Regulations 2020 require specific steps before serving a Notice to Leave for rent arrears.
                      You must confirm these steps have been completed.
                    </p>

                    <div className="space-y-3">
                      {/* Pre-action letter sent */}
                      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        preActionLetterSent
                          ? 'border-green-300 bg-green-50'
                          : 'border-amber-200 bg-white hover:bg-amber-25'
                      }`}>
                        <input
                          type="checkbox"
                          checked={preActionLetterSent}
                          onChange={(e) => handlePreActionUpdate('pre_action_letter_sent', e.target.checked)}
                          className="mt-0.5"
                        />
                        <div>
                          <span className={`font-medium ${preActionLetterSent ? 'text-green-800' : 'text-amber-800'}`}>
                            Pre-action letter sent
                            <span className="text-red-500 ml-1">*</span>
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            I have sent a letter to the tenant setting out the arrears, giving 28 days to respond,
                            and explaining their rights before serving the Notice to Leave.
                          </p>
                        </div>
                      </label>

                      {/* Debt advice signposting */}
                      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        preActionSignposted
                          ? 'border-green-300 bg-green-50'
                          : 'border-amber-200 bg-white hover:bg-amber-25'
                      }`}>
                        <input
                          type="checkbox"
                          checked={preActionSignposted}
                          onChange={(e) => handlePreActionUpdate('debt_advice_signposted', e.target.checked)}
                          className="mt-0.5"
                        />
                        <div>
                          <span className={`font-medium ${preActionSignposted ? 'text-green-800' : 'text-amber-800'}`}>
                            Signposted to debt advice
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            I have provided the tenant with information about free debt advice services
                            (e.g., Citizens Advice Scotland, StepChange, Money Advice Service).
                          </p>
                        </div>
                      </label>

                      {/* Validation error message */}
                      {!preActionLetterSent && (
                        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>Pre-action letter is required before you can proceed with Ground 1.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Evidence description input with Ask Heaven enhancement */}
                <div
                  className="mt-4 pt-4 border-t border-blue-200"
                  onFocusCapture={handleEvidenceFocus}
                >
                  <label htmlFor="evidence_description" className="block text-sm font-medium text-blue-800 mb-2">
                    Describe the evidence you have for this ground
                  </label>

                  {/* "Use gathered details" button */}
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={handleUseGatheredDetails}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Use gathered details as starting point
                    </button>
                  </div>

                  <textarea
                    id="evidence_description"
                    className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] bg-white"
                    rows={6}
                    value={evidenceDescription}
                    onChange={(e) => onUpdate({ scotland_evidence_description: e.target.value })}
                    placeholder="Briefly describe the evidence you have to support this ground. For example: 'I have 3 months of rent statements showing continuous arrears, emails requesting payment, and records of the tenant's partial payment attempts.'"
                  />

                  <p className="text-xs text-blue-500 mt-1">
                    This helps prepare your case for the First-tier Tribunal.
                  </p>

                  {/* Ask Heaven inline enhancer */}
                  <div className="mt-3">
                    <AskHeavenInlineEnhancer
                      caseId={caseId}
                      questionId="scotland_evidence_description"
                      answer={evidenceDescription}
                      onApply={(newText) => onUpdate({ scotland_evidence_description: newText })}
                      questionText="Describe the evidence you have to support this eviction ground"
                      context={{
                        jurisdiction: 'scotland',
                        ground_number: selectedGround,
                        ground_name: ground?.name,
                        field_type: 'evidence_description',
                      }}
                      apiMode="generic"
                      minChars={20}
                      buttonLabel="Enhance with Ask Heaven"
                      helperText="AI will improve clarity and tribunal-readiness"
                      compact
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
