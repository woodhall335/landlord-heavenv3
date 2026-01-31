/**
 * What's Included Component
 *
 * Displays what's included in a tenancy agreement product.
 * Used across product pages, wizard review, and preview pages.
 *
 * This component uses the canonical included-features mapping as the
 * single source of truth to ensure consistency between UI and PDF contents.
 */

'use client';

import React from 'react';
import {
  getIncludedFeatures,
  getIncludedSummary,
  getInventoryBehaviour,
  JURISDICTION_AGREEMENT_INFO,
  COMPLIANCE_CHECKLIST_INFO,
  type TenancyJurisdiction,
  type TenancyTier,
  type IncludedFeature,
} from '@/lib/tenancy/included-features';
import { CheckCircle, FileText, List, Shield, ClipboardCheck } from 'lucide-react';

interface WhatsIncludedProps {
  /** The jurisdiction for the agreement */
  jurisdiction: TenancyJurisdiction;
  /** The product tier (standard or premium) */
  tier: TenancyTier;
  /** Display variant */
  variant?: 'compact' | 'full' | 'inline';
  /** Optional custom title */
  title?: string;
  /** Show upgrade CTA for standard tier */
  showUpgradeCTA?: boolean;
  /** Optional class name */
  className?: string;
}

/**
 * Get icon for a feature category
 */
function getCategoryIcon(category: string) {
  switch (category) {
    case 'agreement':
      return <FileText className="w-4 h-4" />;
    case 'schedule':
      return <List className="w-4 h-4" />;
    case 'compliance':
      return <Shield className="w-4 h-4" />;
    case 'guidance':
      return <ClipboardCheck className="w-4 h-4" />;
    default:
      return <CheckCircle className="w-4 h-4" />;
  }
}

/**
 * Compact variant - simple list with checkmarks
 */
function CompactVariant({
  jurisdiction,
  tier,
}: {
  jurisdiction: TenancyJurisdiction;
  tier: TenancyTier;
}) {
  const summary = getIncludedSummary(jurisdiction, tier);

  return (
    <div className="space-y-2">
      {summary.headline.map((item, index) => (
        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Inline variant - single line description
 */
function InlineVariant({
  jurisdiction,
  tier,
}: {
  jurisdiction: TenancyJurisdiction;
  tier: TenancyTier;
}) {
  const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];
  const inventoryInfo = getInventoryBehaviour(tier);

  return (
    <p className="text-sm text-gray-600">
      Includes {tier === 'premium' ? 'HMO ' : ''}
      {agreementInfo.agreementName}, {inventoryInfo.label.toLowerCase()}, and
      jurisdiction-specific compliance checklist.
    </p>
  );
}

/**
 * Full variant - detailed breakdown with categories
 */
function FullVariant({
  jurisdiction,
  tier,
  showUpgradeCTA,
}: {
  jurisdiction: TenancyJurisdiction;
  tier: TenancyTier;
  showUpgradeCTA?: boolean;
}) {
  const features = getIncludedFeatures(jurisdiction, tier);
  const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];
  const inventoryInfo = getInventoryBehaviour(tier);

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, IncludedFeature[]>);

  const categoryLabels: Record<string, string> = {
    agreement: 'Agreement',
    schedule: 'Embedded Schedules',
    compliance: 'Compliance',
    guidance: 'Guidance',
  };

  return (
    <div className="space-y-6">
      {/* Header with key info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">
          {tier === 'premium' ? 'Premium' : 'Standard'} {agreementInfo.agreementShortName}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {agreementInfo.legalReference}
        </p>
        <div className="flex items-start gap-2 text-sm">
          {tier === 'premium' ? (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Wizard-completed inventory
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              <FileText className="w-3 h-3" />
              Blank inventory template
            </span>
          )}
        </div>
      </div>

      {/* Grouped features */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <div key={category}>
          <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            {getCategoryIcon(category)}
            {categoryLabels[category] || category}
          </h5>
          <ul className="space-y-2">
            {categoryFeatures.map((feature) => (
              <li
                key={feature.id}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900">{feature.label}</span>
                  {feature.isPremiumOnly && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                      Premium
                    </span>
                  )}
                  <p className="text-gray-500 text-xs mt-0.5">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Upgrade CTA for standard tier */}
      {showUpgradeCTA && tier === 'standard' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 mb-1">
            Need wizard-completed inventory?
          </p>
          <p className="text-xs text-purple-700">
            Upgrade to Premium to complete your inventory via the wizard, plus get HMO-specific
            clauses, guarantor provisions, and more.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Main What's Included component
 */
export function WhatsIncluded({
  jurisdiction,
  tier,
  variant = 'compact',
  title,
  showUpgradeCTA = false,
  className = '',
}: WhatsIncludedProps) {
  const defaultTitle = "What's Included in This Agreement";

  return (
    <div className={className}>
      {title !== null && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title || defaultTitle}
        </h3>
      )}

      {variant === 'compact' && (
        <CompactVariant jurisdiction={jurisdiction} tier={tier} />
      )}

      {variant === 'inline' && (
        <InlineVariant jurisdiction={jurisdiction} tier={tier} />
      )}

      {variant === 'full' && (
        <FullVariant
          jurisdiction={jurisdiction}
          tier={tier}
          showUpgradeCTA={showUpgradeCTA}
        />
      )}
    </div>
  );
}

/**
 * Simple list variant for sidebars and summaries
 */
export function WhatsIncludedList({
  jurisdiction,
  tier,
  maxItems,
  className = '',
}: {
  jurisdiction: TenancyJurisdiction;
  tier: TenancyTier;
  maxItems?: number;
  className?: string;
}) {
  const summary = getIncludedSummary(jurisdiction, tier);
  const items = maxItems ? summary.headline.slice(0, maxItems) : summary.headline;

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
      {maxItems && summary.headline.length > maxItems && (
        <li className="text-sm text-gray-500 pl-6">
          + {summary.headline.length - maxItems} more...
        </li>
      )}
    </ul>
  );
}

/**
 * Inventory badge component showing tier-specific inventory behaviour
 */
export function InventoryBadge({
  tier,
  size = 'default',
}: {
  tier: TenancyTier;
  size?: 'small' | 'default';
}) {
  const inventoryInfo = getInventoryBehaviour(tier);
  const sizeClasses = size === 'small' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  if (tier === 'premium') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-purple-100 text-purple-800 rounded-full font-medium ${sizeClasses}`}
      >
        <CheckCircle className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
        {inventoryInfo.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full font-medium ${sizeClasses}`}
    >
      <FileText className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
      {inventoryInfo.label}
    </span>
  );
}

/**
 * Compliance checklist info component
 */
export function ComplianceChecklistInfo({
  jurisdiction,
  className = '',
}: {
  jurisdiction: TenancyJurisdiction;
  className?: string;
}) {
  const checklistInfo = COMPLIANCE_CHECKLIST_INFO[jurisdiction];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-gray-900 text-sm">{checklistInfo.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{checklistInfo.description}</p>
        <p className="text-xs text-gray-400 mt-1 italic">
          Non-contractual guidance only
        </p>
      </div>
    </div>
  );
}

/**
 * Tier comparison panel showing what's different between tiers
 */
export function TierComparisonPanel({
  jurisdiction,
  currentTier,
  onUpgrade,
}: {
  jurisdiction: TenancyJurisdiction;
  currentTier: TenancyTier;
  onUpgrade?: () => void;
}) {
  const standardSummary = getIncludedSummary(jurisdiction, 'standard');
  const premiumSummary = getIncludedSummary(jurisdiction, 'premium');

  if (currentTier === 'premium') {
    return null; // No upgrade needed
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-3">Upgrade to Premium?</h4>
      <p className="text-sm text-gray-600 mb-4">
        {premiumSummary.tierDifference}
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
            Standard Includes
          </p>
          <ul className="space-y-1">
            {standardSummary.headline.slice(0, 3).map((item, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-gray-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-purple-700 mb-2 uppercase">
            Premium Adds
          </p>
          <ul className="space-y-1">
            <li className="text-xs text-purple-700 flex items-start gap-1">
              <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              Wizard-completed inventory
            </li>
            <li className="text-xs text-purple-700 flex items-start gap-1">
              <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              HMO-specific clauses
            </li>
            <li className="text-xs text-purple-700 flex items-start gap-1">
              <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              Guarantor provisions
            </li>
          </ul>
        </div>
      </div>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="mt-4 w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Upgrade to Premium
        </button>
      )}
    </div>
  );
}

export default WhatsIncluded;
