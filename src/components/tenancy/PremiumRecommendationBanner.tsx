/**
 * Premium Recommendation Banner
 *
 * Non-blocking recommendation shown in the tenancy wizard when signals
 * suggest Premium tier is appropriate for the landlord's situation.
 *
 * IMPORTANT: Uses legally accurate language:
 * - "strongly recommended" / "recommended" (not "required")
 * - Provides expandable legal rationale
 * - Never claims Premium is mandatory unless genuinely true
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiInformationLine, RiArrowDownSLine, RiShieldCheckLine, RiCloseLine } from 'react-icons/ri';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import type { PremiumRecommendationResult, PremiumRecommendationReason } from '@/lib/utils/premium-recommendation';
import { TenancyComparisonSummary } from './TenancyComparisonTable';
import {
  trackTenancyPremiumRecommended,
  trackTenancyRationaleExpanded,
  TenancyPremiumRecommendationReason,
} from '@/lib/analytics';

interface PremiumRecommendationBannerProps {
  /** Premium recommendation result from detection logic */
  recommendation: PremiumRecommendationResult;
  /** Current jurisdiction */
  jurisdiction: CanonicalJurisdiction;
  /** Callback when user dismisses the banner */
  onDismiss?: () => void;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Variant: 'full' for product page, 'compact' for wizard */
  variant?: 'full' | 'compact';
}

/**
 * Premium Recommendation Banner Component
 */
export const PremiumRecommendationBanner: React.FC<PremiumRecommendationBannerProps> = ({
  recommendation,
  jurisdiction,
  onDismiss,
  dismissible = true,
  variant = 'compact',
}) => {
  const [isRationaleExpanded, setIsRationaleExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasTrackedRef = useRef(false);

  // Track recommendation shown (only once)
  useEffect(() => {
    if (recommendation.isRecommended && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackTenancyPremiumRecommended({
        reasons: recommendation.reasons as TenancyPremiumRecommendationReason[],
        strength: recommendation.strength as 'strong' | 'moderate',
        jurisdiction,
      });
    }
  }, [recommendation, jurisdiction]);

  // Don't render if not recommended or dismissed
  if (!recommendation.isRecommended || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleRationaleToggle = () => {
    if (!isRationaleExpanded) {
      trackTenancyRationaleExpanded({
        feature: 'premium_recommendation',
        jurisdiction,
      });
    }
    setIsRationaleExpanded(!isRationaleExpanded);
  };

  const isStrong = recommendation.strength === 'strong';
  const borderColor = isStrong ? 'border-amber-400' : 'border-purple-300';
  const bgColor = isStrong ? 'bg-amber-50' : 'bg-purple-50';
  const iconBgColor = isStrong ? 'bg-amber-100' : 'bg-purple-100';
  const iconColor = isStrong ? 'text-amber-600' : 'text-purple-600';

  if (variant === 'compact') {
    return (
      <div
        className={`relative ${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}
        role="alert"
        aria-live="polite"
      >
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss recommendation"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start gap-3 pr-6">
          <div className={`${iconBgColor} rounded-full p-2 shrink-0`}>
            <RiShieldCheckLine className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {isStrong ? 'Premium Strongly Recommended' : 'Premium Recommended'}
            </h4>
            <p className="text-sm text-gray-700">{recommendation.message}</p>

            {/* Expandable rationale */}
            <button
              onClick={handleRationaleToggle}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark mt-2 transition-colors"
            >
              <RiInformationLine className="w-3.5 h-3.5" />
              <span>{isRationaleExpanded ? 'Hide details' : 'Why is this recommended?'}</span>
              <RiArrowDownSLine
                className={`w-3.5 h-3.5 transition-transform ${isRationaleExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isRationaleExpanded && (
              <div className="mt-3 p-3 bg-white rounded-lg text-xs text-gray-700 space-y-2 border border-gray-100">
                <p>{recommendation.rationale}</p>
                {recommendation.legalReference && (
                  <p className="text-gray-500">
                    <strong>Legal framework:</strong> {recommendation.legalReference}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full variant for product page
  return (
    <div
      className={`${bgColor} border-2 ${borderColor} rounded-xl p-6`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className={`${iconBgColor} rounded-xl p-3 shrink-0`}>
          <RiShieldCheckLine className={`w-8 h-8 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-lg">
              {isStrong ? 'Premium Strongly Recommended' : 'Premium Recommended'}
            </h3>
            {isStrong && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-200 text-amber-800 rounded-full">
                Based on your answers
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{recommendation.message}</p>

          {/* Comparison summary */}
          <TenancyComparisonSummary jurisdiction={jurisdiction} />

          {/* Expandable rationale */}
          <button
            onClick={handleRationaleToggle}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark mt-4 transition-colors font-medium"
          >
            <RiInformationLine className="w-4 h-4" />
            <span>{isRationaleExpanded ? 'Hide legal details' : 'View legal details'}</span>
            <RiArrowDownSLine
              className={`w-4 h-4 transition-transform ${isRationaleExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {isRationaleExpanded && (
            <div className="mt-4 p-4 bg-white rounded-lg text-sm text-gray-700 space-y-3 border border-gray-200">
              <p>{recommendation.rationale}</p>
              {recommendation.legalReference && (
                <p className="text-gray-500 text-xs">
                  <strong>Legal framework:</strong> {recommendation.legalReference}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Note: This is a recommendation based on common landlord requirements, not legal advice.
                For complex situations, consider consulting a solicitor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline recommendation hint (smaller, for use in form fields)
 */
export const PremiumRecommendationHint: React.FC<{
  reasons: PremiumRecommendationReason[];
}> = ({ reasons }) => {
  if (reasons.length === 0) return null;

  const hints: Record<PremiumRecommendationReason, string> = {
    multiple_tenants: 'Multiple tenants may require joint liability clauses (Premium)',
    unrelated_tenants: 'Unrelated tenants often trigger HMO requirements (Premium)',
    separate_rent_payments: 'Separate rent payments suggest room-by-room let (Premium)',
    room_by_room_let: 'Room-by-room lets need specific clauses (Premium)',
    shared_facilities: 'Shared facilities require clear rules (Premium)',
    hmo_property: 'HMO properties require specific clauses (Premium)',
    hmo_licensed: 'Licensed HMOs need compliant agreements (Premium)',
    student_let: 'Student lets benefit from guarantor clauses (Premium)',
    guarantor_needed: 'Guarantor provisions are in Premium only',
    rent_review_needed: 'Rent review clauses are in Premium only',
    high_value_property: 'High-value properties benefit from Premium protection',
  };

  const firstReason = reasons[0];
  const hint = hints[firstReason];

  if (!hint) return null;

  return (
    <div className="flex items-start gap-2 mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
      <RiInformationLine className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{hint}</span>
    </div>
  );
};

export default PremiumRecommendationBanner;
