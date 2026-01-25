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
  getConfidenceLevelLabel,
  getConfidenceLevelColor,
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
  const colors = getConfidenceLevelColor(confidence.level);
  const levelLabel = getConfidenceLevelLabel(confidence.level);

  // Get icon based on level
  const LevelIcon =
    confidence.level === 'strong'
      ? RiShieldCheckLine
      : confidence.level === 'moderate'
      ? RiAlertLine
      : RiCloseLine;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}>
        <LevelIcon className={`w-5 h-5 ${colors.text}`} />
        <div>
          <span className={`text-sm font-semibold ${colors.text}`}>{levelLabel} Case</span>
          <span className="text-xs text-gray-500 ml-2">({confidence.score}/100)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${colors.bg} border ${colors.border}`}>
              <LevelIcon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${colors.text}`}>
                {levelLabel} Case Confidence
              </h3>
              <p className="text-sm text-gray-600">
                Based on evidence, clarity, and PAP compliance
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${colors.text}`}>{confidence.score}</p>
            <p className="text-xs text-gray-500">out of 100</p>
          </div>
        </div>

        {/* Quick summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          {confidence.level === 'strong' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <RiCheckLine className="w-3 h-3" />
              Well-evidenced
            </span>
          )}
          {confidence.level === 'moderate' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
              <RiAlertLine className="w-3 h-3" />
              Could be stronger
            </span>
          )}
          {confidence.level === 'weak' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              <RiCloseLine className="w-3 h-3" />
              Needs attention
            </span>
          )}
          {confidence.improvements.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {confidence.improvements.length} improvement{confidence.improvements.length !== 1 ? 's' : ''} available
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
              {/* Score bars */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <RiFolderOpenLine className="w-4 h-4" />
                  <span className="font-medium">Evidence (40%)</span>
                </div>
                <ScoreBar
                  score={confidence.breakdown.evidence.score}
                  maxScore={confidence.breakdown.evidence.maxScore}
                  label="Supporting documents"
                  colorClass={
                    confidence.breakdown.evidence.score >= 28
                      ? 'bg-green-500'
                      : confidence.breakdown.evidence.score >= 16
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }
                />

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 mt-4">
                  <RiFileTextLine className="w-4 h-4" />
                  <span className="font-medium">Claim Clarity (35%)</span>
                </div>
                <ScoreBar
                  score={confidence.breakdown.claimClarity.score}
                  maxScore={confidence.breakdown.claimClarity.maxScore}
                  label="Completeness & detail"
                  colorClass={
                    confidence.breakdown.claimClarity.score >= 25
                      ? 'bg-green-500'
                      : confidence.breakdown.claimClarity.score >= 14
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }
                />

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 mt-4">
                  <RiScalesLine className="w-4 h-4" />
                  <span className="font-medium">PAP Compliance (25%)</span>
                </div>
                <ScoreBar
                  score={confidence.breakdown.papCompliance.score}
                  maxScore={confidence.breakdown.papCompliance.maxScore}
                  label="Pre-action protocol"
                  colorClass={
                    confidence.breakdown.papCompliance.score >= 20
                      ? 'bg-green-500'
                      : confidence.breakdown.papCompliance.score >= 12
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }
                />
              </div>

              {/* Positive factors */}
              {confidence.positiveFactors.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Strengths:</p>
                  <div className="flex flex-wrap gap-1">
                    {confidence.positiveFactors.slice(0, 5).map((factor, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                      >
                        <RiCheckLine className="w-3 h-3" />
                        {factor}
                      </span>
                    ))}
                    {confidence.positiveFactors.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{confidence.positiveFactors.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {confidence.improvements.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">To strengthen your case:</p>
                  <ul className="space-y-1">
                    {confidence.improvements.slice(0, 4).map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <RiArrowRightLine className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                  {confidence.improvements.length > 4 && onViewImprovements && (
                    <button
                      type="button"
                      onClick={onViewImprovements}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all {confidence.improvements.length} improvements →
                    </button>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                This score is based on the information provided and does not guarantee court
                outcomes. Courts consider many factors including evidence quality, tenant
                defences, and judicial discretion.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OutcomeConfidenceIndicator;
