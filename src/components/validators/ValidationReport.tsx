/**
 * Validation Report Component
 *
 * Displays a court-ready validation report with:
 * - Overall status with clear visual indicator
 * - Rule results categorized by severity
 * - Provenance metadata showing source of each fact
 * - Ruleset version for audit trail
 * - Next steps and recommendations
 */

'use client';

import React, { useState } from 'react';
import {
  RiCheckboxCircleFill,
  RiAlertFill,
  RiCloseCircleFill,
  RiQuestionFill,
  RiInformationLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { getWizardCta, type Cta } from '@/lib/checkout/cta-mapper';
import { trackValidatorCtaClick } from '@/lib/analytics';

interface ValidationIssue {
  code: string;
  message: string;
  severity?: 'blocking' | 'warning';
}

interface ProvenanceItem {
  factKey: string;
  value: unknown;
  provenance: string;
  sourceLabel?: string;
}

interface ExtractedFields {
  date_served?: string;
  service_date?: string;
  expiry_date?: string;
  property_address?: string;
  tenant_names?: string | string[];
  landlord_name?: string;
  signature_present?: boolean;
  form_6a_used?: boolean;
  section_21_detected?: boolean;
  grounds_cited?: string[];
  [key: string]: any;
}

interface ValidationReportProps {
  status: string;
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
  info?: ValidationIssue[];
  missingFacts?: string[];
  rulesetVersion?: string;
  provenanceMetadata?: ProvenanceItem[];
  extractedFields?: ExtractedFields;
  validatorKey: string;
  /** Case ID for wizard flow continuation - required for proper CTA routing */
  caseId?: string;
  /** Jurisdiction for pricing/routing - defaults to 'england' */
  jurisdiction?: string;
  /** Upsell product recommendation from validation */
  upsell?: { product: string; reason: string } | null;
  onAnswerQuestions?: () => void;
  className?: string;
}

type StatusType = 'pass' | 'warning' | 'invalid' | 'needs_info' | 'unknown';

const STATUS_CONFIG: Record<StatusType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  pass: {
    label: 'Valid',
    description: 'No blocking issues found. Your notice appears compliant.',
    icon: <RiCheckboxCircleFill className="h-6 w-6 text-green-600" />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-900',
    borderColor: 'border-green-200',
  },
  warning: {
    label: 'Valid with Warnings',
    description: 'Your notice appears valid but has potential risks.',
    icon: <RiAlertFill className="h-6 w-6 text-amber-600" />,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-200',
  },
  invalid: {
    label: 'Invalid',
    description: 'Critical issues found that will likely invalidate your notice.',
    icon: <RiCloseCircleFill className="h-6 w-6 text-red-600" />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-900',
    borderColor: 'border-red-200',
  },
  needs_info: {
    label: 'More Info Needed',
    description: 'Answer some questions to complete the validation.',
    icon: <RiQuestionFill className="h-6 w-6 text-blue-600" />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200',
  },
  unknown: {
    label: 'Unknown',
    description: 'Unable to determine validity.',
    icon: <RiInformationLine className="h-6 w-6 text-gray-600" />,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-200',
  },
};

const PROVENANCE_LABELS: Record<string, { label: string; color: string }> = {
  user_confirmed: { label: 'You confirmed', color: 'text-green-700 bg-green-100' },
  evidence_verified: { label: 'From document', color: 'text-blue-700 bg-blue-100' },
  extracted: { label: 'AI extracted', color: 'text-purple-700 bg-purple-100' },
  missing: { label: 'Not provided', color: 'text-gray-600 bg-gray-100' },
};

function formatFactKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFactValue(value: unknown): string {
  if (value === null || value === undefined) return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export function ValidationReport({
  status,
  blockers,
  warnings,
  info = [],
  missingFacts = [],
  rulesetVersion,
  provenanceMetadata = [],
  extractedFields,
  validatorKey,
  caseId,
  jurisdiction = 'england',
  upsell,
  onAnswerQuestions,
  className = '',
}: ValidationReportProps) {
  const [showProvenance, setShowProvenance] = useState(false);

  const normalizedStatus = (STATUS_CONFIG[status as StatusType] ? status : 'unknown') as StatusType;
  const config = STATUS_CONFIG[normalizedStatus];

  const hasBlockers = blockers.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasInfo = info.length > 0;
  const needsAnswers = missingFacts.length > 0;

  // Generate dynamic CTAs using getWizardCta when case_id is available
  // Falls back to null if no caseId (CTAs won't render without case context)
  const ctas: { primary: Cta; secondary?: Cta } | null = caseId
    ? getWizardCta({
        jurisdiction,
        validator_key: validatorKey,
        validation_summary: {
          status: normalizedStatus,
          blockers,
          warnings,
          upsell,
        },
        caseId,
        source: 'validator',
      })
    : null;

  const handleCtaClick = (cta: Cta, ctaType: 'primary' | 'secondary') => {
    trackValidatorCtaClick(validatorKey, ctaType, cta.productKey, normalizedStatus);
  };

  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden ${className}`}>
      {/* Status Header */}
      <div className={`${config.bgColor} ${config.borderColor} border-b p-6`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{config.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-bold ${config.textColor}`}>{config.label}</h3>
              {rulesetVersion && (
                <span className="text-xs text-gray-500 bg-white/50 px-2 py-0.5 rounded">
                  v{rulesetVersion}
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm ${config.textColor} opacity-80`}>{config.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-black/10">
          <div className="flex items-center gap-2 text-sm">
            <RiCloseCircleFill className={`h-4 w-4 ${hasBlockers ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={hasBlockers ? 'text-red-700 font-medium' : 'text-gray-500'}>
              {blockers.length} blocker{blockers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiAlertFill className={`h-4 w-4 ${hasWarnings ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className={hasWarnings ? 'text-amber-700 font-medium' : 'text-gray-500'}>
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiInformationLine className={`h-4 w-4 ${hasInfo ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={hasInfo ? 'text-blue-700 font-medium' : 'text-gray-500'}>
              {info.length} note{info.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Needs Info Section */}
        {needsAnswers && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <RiQuestionFill className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Additional Information Required</h4>
                <p className="text-sm text-blue-800 mt-1">
                  We need you to confirm {missingFacts.length} item{missingFacts.length !== 1 ? 's' : ''} to complete the validation.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingFacts.slice(0, 5).map((fact) => (
                    <span
                      key={fact}
                      className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-xs text-blue-800"
                    >
                      {formatFactKey(fact)}
                    </span>
                  ))}
                  {missingFacts.length > 5 && (
                    <span className="text-xs text-blue-600">+{missingFacts.length - 5} more</span>
                  )}
                </div>
                {onAnswerQuestions && (
                  <button
                    type="button"
                    onClick={onAnswerQuestions}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                  >
                    Answer questions <RiArrowRightLine className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blockers */}
        {hasBlockers && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-red-900 mb-3">
              <RiCloseCircleFill className="h-5 w-5" />
              Critical Issues (Blockers)
            </h4>
            <ul className="space-y-2">
              {blockers.map((issue, idx) => (
                <li
                  key={`${issue.code}-${idx}`}
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-red-200 text-red-800 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm text-red-900">{issue.message}</p>
                    <p className="text-xs text-red-600 mt-1 font-mono">{issue.code}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
              <RiAlertFill className="h-5 w-5" />
              Potential Risks (Warnings)
            </h4>
            <ul className="space-y-2">
              {warnings.map((issue, idx) => (
                <li
                  key={`${issue.code}-${idx}`}
                  className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
                >
                  <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm text-amber-900">{issue.message}</p>
                    <p className="text-xs text-amber-600 mt-1 font-mono">{issue.code}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info */}
        {hasInfo && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
              <RiInformationLine className="h-5 w-5" />
              Additional Notes
            </h4>
            <ul className="space-y-2">
              {info.map((issue, idx) => (
                <li
                  key={`${issue.code}-${idx}`}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-gray-400">•</span>
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success State */}
        {normalizedStatus === 'pass' && !hasBlockers && !hasWarnings && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <RiShieldCheckLine className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900">All Checks Passed</h4>
              <p className="text-sm text-green-800 mt-1">
                Your notice appears to meet all legal requirements based on the information provided.
                Consider our eviction packs for additional support and court-ready documents.
              </p>
            </div>
          </div>
        )}

        {/* Extracted Fields Summary */}
        {extractedFields && Object.keys(extractedFields).length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 font-semibold text-gray-700">
                <RiFileTextLine className="h-5 w-5" />
                Extracted Information
              </h4>
              <button
                type="button"
                onClick={() => setShowProvenance(!showProvenance)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {showProvenance ? (
                  <>
                    <RiEyeOffLine className="h-4 w-4" /> Hide sources
                  </>
                ) : (
                  <>
                    <RiEyeLine className="h-4 w-4" /> Show sources
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {(extractedFields.date_served || extractedFields.service_date) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Date:</span>
                  <span className="font-medium text-gray-900">
                    {extractedFields.date_served || extractedFields.service_date}
                  </span>
                </div>
              )}
              {extractedFields.expiry_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-medium text-gray-900">{extractedFields.expiry_date}</span>
                </div>
              )}
              {extractedFields.property_address && (
                <div className="flex justify-between col-span-full">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">
                    {extractedFields.property_address}
                  </span>
                </div>
              )}
              {extractedFields.tenant_names && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenant(s):</span>
                  <span className="font-medium text-gray-900">
                    {Array.isArray(extractedFields.tenant_names)
                      ? extractedFields.tenant_names.join(', ')
                      : extractedFields.tenant_names}
                  </span>
                </div>
              )}
              {extractedFields.landlord_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Landlord:</span>
                  <span className="font-medium text-gray-900">{extractedFields.landlord_name}</span>
                </div>
              )}
              {extractedFields.signature_present !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Signature:</span>
                  <span className={`font-medium ${extractedFields.signature_present ? 'text-green-700' : 'text-amber-700'}`}>
                    {extractedFields.signature_present ? 'Present' : 'Not detected'}
                  </span>
                </div>
              )}
              {extractedFields.grounds_cited && extractedFields.grounds_cited.length > 0 && (
                <div className="flex justify-between col-span-full">
                  <span className="text-gray-600">Grounds:</span>
                  <span className="font-medium text-gray-900">
                    {extractedFields.grounds_cited.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Provenance Details */}
        {showProvenance && provenanceMetadata.length > 0 && (
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Fact Provenance (Audit Trail)</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {provenanceMetadata.map((item, idx) => {
                const prov = PROVENANCE_LABELS[item.provenance] || PROVENANCE_LABELS.missing;
                return (
                  <div key={`${item.factKey}-${idx}`} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{formatFactKey(item.factKey)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatFactValue(item.value)}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${prov.color}`}>
                        {prov.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t bg-gray-50 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            {normalizedStatus === 'invalid'
              ? 'Our Complete Eviction Pack includes expert review and guidance.'
              : normalizedStatus === 'warning'
                ? 'Consider our eviction packs for additional compliance checks.'
                : 'Get court-ready documents with our eviction packs.'}
          </p>
          {ctas ? (
            <div className="flex gap-3">
              {ctas.secondary && (
                <a
                  href={ctas.secondary.href}
                  onClick={() => handleCtaClick(ctas.secondary!, 'secondary')}
                  className="inline-flex items-center gap-1 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                >
                  {ctas.secondary.label}
                  <span className="text-xs text-purple-500">(£{ctas.secondary.price.toFixed(2)})</span>
                </a>
              )}
              <a
                href={ctas.primary.href}
                onClick={() => handleCtaClick(ctas.primary, 'primary')}
                className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                {ctas.primary.label}
                <span className="text-xs text-purple-200">(£{ctas.primary.price.toFixed(2)})</span>
                <RiArrowRightLine className="h-4 w-4" />
              </a>
            </div>
          ) : (
            /* Fallback: No CTA when caseId is missing - show informational message */
            <p className="text-xs text-gray-400 italic">
              Upload a document to get personalized recommendations
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
