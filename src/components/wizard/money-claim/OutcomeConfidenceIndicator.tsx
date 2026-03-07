'use client';

import React, { useMemo, useState } from 'react';
import {
  RiShieldCheckLine,
  RiAlertLine,
  RiCloseLine,
  RiCheckLine,
  RiExpandUpDownLine,
  RiArrowRightLine,
  RiFileTextLine,
  RiFolderOpenLine,
  RiScalesLine,
} from 'react-icons/ri';
import {
  calculateOutcomeConfidence,
  getPackQualityLevelLabel,
  getPackQualityLevelColor,
  type ConfidenceScore,
  type CaseFactsForScoring,
} from '@/lib/money-claim/outcome-confidence';

interface OutcomeConfidenceIndicatorProps {
  /** Case facts for scoring */
  facts: CaseFactsForScoring;
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Callback when user clicks to view improvements */
  onViewImprovements?: () => void;
}

/**
 * Visual progress bar component
 */
function ScoreBar({
  score,
  maxScore,
  label,
  colorClass,
}: {
  score: number;
  maxScore: number;
  label: string;
  colorClass: string;
}) {
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Outcome Confidence Indicator Component
 *
 * Displays a rules-based confidence score for the money claim case.
 * Uses scoring based on evidence, claim clarity, and PAP compliance.
 */
export function OutcomeConfidenceIndicator({
  facts,
  showDetails = true,
  compact = false,
  onViewImprovements,
}: OutcomeConfidenceIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const confidence = useMemo(() => calculateOutcomeConfidence(facts), [facts]);

  // Use pack quality score as the PRIMARY display (document drafting readiness)
  const packQualityColors = getPackQualityLevelColor(confidence.packQualityLevel);
  const packQualityLabel = getPackQualityLevelLabel(confidence.packQualityLevel);

  // Get icon based on pack quality level
  const LevelIcon =
    confidence.packQualityLevel === 'excellent'
      ? RiShieldCheckLine
      : confidence.packQualityLevel === 'good'
      ? RiCheckLine
      : RiAlertLine;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${packQualityColors.bg} ${packQualityColors.border} border`}>
        <LevelIcon className={`w-5 h-5 ${packQualityColors.text}`} />
        <div>
          <span className={`text-sm font-semibold ${packQualityColors.text}`}>{packQualityLabel} Pack Quality</span>
          <span className="text-xs text-gray-500 ml-2">({confidence.packQualityScore}/100)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 ${packQualityColors.border} ${packQualityColors.bg} overflow-hidden`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${packQualityColors.bg} border ${packQualityColors.border}`}>
              <LevelIcon className={`w-6 h-6 ${packQualityColors.text}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${packQualityColors.text}`}>
                {packQualityLabel} Document Pack Quality
              </h3>
              <p className="text-sm text-gray-600">
                Completeness and consistency of your claim details
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${packQualityColors.text}`}>{confidence.packQualityScore}</p>
            <p className="text-xs text-gray-500">out of 100</p>
          </div>
        </div>

        {/* Quick summary - based on pack quality level */}
        <div className="mt-4 flex flex-wrap gap-2">
          {confidence.packQualityLevel === 'excellent' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <RiCheckLine className="w-3 h-3" />
              Ready to generate
            </span>
          )}
          {confidence.packQualityLevel === 'good' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              <RiCheckLine className="w-3 h-3" />
              Documents well-prepared
            </span>
          )}
          {confidence.packQualityLevel === 'needs_work' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
              <RiAlertLine className="w-3 h-3" />
              Complete more details
            </span>
          )}
          {confidence.filingReadinessImprovements.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {confidence.filingReadinessImprovements.length} filing step{confidence.filingReadinessImprovements.length !== 1 ? 's' : ''} remaining
            </span>
          )}
        </div>
      </div>

      {/* Expandable details */}
      {showDetails && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-2 border-t border-gray-200 bg-white/50 flex items-center justify-between hover:bg-white/70 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Score Breakdown</span>
            <RiExpandUpDownLine
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 bg-white/70 space-y-4">
              {/* Score bars - Pack Quality Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <RiFileTextLine className="w-4 h-4" />
                  <span className="font-medium">Claim Clarity (60%)</span>
                </div>
                <ScoreBar
                  score={confidence.packQualityBreakdown.claimClarity.score}
                  maxScore={confidence.packQualityBreakdown.claimClarity.maxScore}
                  label="Basis of claim, arrears schedule, amounts"
                  colorClass={
                    confidence.packQualityBreakdown.claimClarity.score >= 45
                      ? 'bg-green-500'
                      : confidence.packQualityBreakdown.claimClarity.score >= 30
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }
                />

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 mt-4">
                  <RiFolderOpenLine className="w-4 h-4" />
                  <span className="font-medium">Document Completeness (25%)</span>
                </div>
                <ScoreBar
                  score={confidence.packQualityBreakdown.documentCompleteness.score}
                  maxScore={confidence.packQualityBreakdown.documentCompleteness.maxScore}
                  label="Required fields & tenancy details"
                  colorClass={
                    confidence.packQualityBreakdown.documentCompleteness.score >= 18
                      ? 'bg-green-500'
                      : confidence.packQualityBreakdown.documentCompleteness.score >= 12
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }
                />

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 mt-4">
                  <RiScalesLine className="w-4 h-4" />
                  <span className="font-medium">PAP Documents Ready (15%)</span>
                </div>
                <ScoreBar
                  score={confidence.packQualityBreakdown.papPreparedness.score}
                  maxScore={confidence.packQualityBreakdown.papPreparedness.maxScore}
                  label="Letter Before Claim & forms"
                  colorClass={
                    confidence.packQualityBreakdown.papPreparedness.score >= 12
                      ? 'bg-green-500'
                      : confidence.packQualityBreakdown.papPreparedness.score >= 8
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }
                />
              </div>

              {/* Positive factors from pack quality */}
              {confidence.packQualityFactors.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">What&apos;s complete:</p>
                  <div className="flex flex-wrap gap-1">
                    {confidence.packQualityFactors.slice(0, 5).map((factor, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                      >
                        <RiCheckLine className="w-3 h-3" />
                        {factor}
                      </span>
                    ))}
                    {confidence.packQualityFactors.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{confidence.packQualityFactors.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Filing readiness improvements - shown separately */}
              {confidence.filingReadinessImprovements.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">To be ready to file your claim:</p>
                  <ul className="space-y-1">
                    {confidence.filingReadinessImprovements.slice(0, 4).map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <RiArrowRightLine className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                  {confidence.filingReadinessImprovements.length > 4 && onViewImprovements && (
                    <button
                      type="button"
                      onClick={onViewImprovements}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all {confidence.filingReadinessImprovements.length} filing steps →
                    </button>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                This score reflects the completeness of your document pack. When you&apos;re ready to
                file, you&apos;ll also need evidence (tenancy agreement, rent records) to submit with
                your claim.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OutcomeConfidenceIndicator;
