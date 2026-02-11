/**
 * Money Claim Section Flow
 *
 * Redesigned wizard for Money Claim packs following a logical,
 * court-ready, jurisdiction-aware flow.
 *
 * Flow Structure:
 * 1. Claimant - Landlord/Company details
 * 2. Defendant - Tenant details
 * 3. Tenancy - Start date, rent amount, frequency
 * 4. Claim details - Jurisdiction-specific claim info
 * 5. Rent & arrears - Schedule of arrears breakdown
 * 6. Damages & costs - Additional claims
 * 7. Claim statement - Basis of claim and interest
 * 8. Pre-action steps - Letter before action
 * 9. Evidence - Supporting documents upload
 * 10. Review & finish - Final review and checkout
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { WizardFlowShell } from '@/components/wizard/shared/WizardFlowShell';
import { isWizardThemeV2 } from '@/components/wizard/shared/theme';
import { SmartReviewPanel } from '@/components/wizard/SmartReviewPanel';
import type { SmartReviewWarningItem, SmartReviewSummary } from '@/components/wizard/SmartReviewPanel';

// Analytics and attribution
import { trackWizardStepCompleteWithAttribution, trackMoneyClaimSectionSkipped } from '@/lib/analytics';
import { getWizardAttribution, markStepCompleted } from '@/lib/wizard/wizardAttribution';

// Validation
import { getSectionValidation, validateMoneyClaimCase } from '@/lib/validation/money-claim-case-validator';

import { ClaimantSection } from '@/components/wizard/money-claim/ClaimantSection';
import { DefendantSection } from '@/components/wizard/money-claim/DefendantSection';
import { TenancySection } from '@/components/wizard/money-claim/TenancySection';
import { ClaimDetailsSection } from '@/components/wizard/sections/money-claim/ClaimDetailsSection';
import type { ClaimReasonType } from '@/components/wizard/sections/money-claim/ClaimDetailsSection';
import { ClaimStatementSection } from '@/components/wizard/sections/money-claim/ClaimStatementSection';
import { ArrearsSection } from '@/components/wizard/money-claim/ArrearsSection';
import { DamagesSection } from '@/components/wizard/money-claim/DamagesSection';
import { PreActionSection } from '@/components/wizard/money-claim/PreActionSection';
import { EvidenceSection } from '@/components/wizard/money-claim/EvidenceSection';
import { ReviewSection } from '@/components/wizard/money-claim/ReviewSection';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface MoneyClaimSectionFlowProps {
  caseId: string;
  jurisdiction: Jurisdiction;
  /**
   * Optional: Topic from URL param (e.g. 'arrears').
   * Used to pre-select claim reasons when starting a new wizard.
   */
  topic?: string;
  /**
   * Optional: Reason(s) from URL param for SEO landing pages.
   * Comma-separated list of claim reasons (e.g. 'property_damage,cleaning').
   * Takes precedence over topic param.
   */
  reason?: string;
}

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Validation function to check if section is complete
  isComplete: (facts: any) => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: any, jurisdiction?: Jurisdiction) => string[];
  // Check if section has warnings
  hasWarnings?: (facts: any, jurisdiction?: Jurisdiction) => string[];
  // Whether section should be visible based on claim types
  isVisible?: (facts: any) => boolean;
}

// Define all sections with their validation rules
const SECTIONS: WizardSection[] = [
  {
    id: 'claimant',
    label: 'Claimant',
    description: 'Your contact details as the landlord or company',
    isComplete: (facts) =>
      Boolean(facts.landlord_full_name || (facts.landlord_is_company && facts.company_name)) &&
      Boolean(facts.landlord_address_line1) &&
      Boolean(facts.landlord_address_postcode),
    hasBlockers: (facts) => {
      const result = getSectionValidation('claimant', facts, facts.__meta?.jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts) => {
      const result = getSectionValidation('claimant', facts, facts.__meta?.jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'defendant',
    label: 'Defendant',
    description: 'Tenant details for the claim',
    isComplete: (facts) =>
      Boolean(facts.tenant_full_name) &&
      Boolean(facts.defendant_address_line1 || facts.property_address_line1),
    hasBlockers: (facts) => {
      const result = getSectionValidation('defendant', facts, facts.__meta?.jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts) => {
      const result = getSectionValidation('defendant', facts, facts.__meta?.jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'tenancy',
    label: 'Tenancy',
    description: 'Tenancy agreement details',
    isComplete: (facts) =>
      Boolean(facts.tenancy_start_date) &&
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_frequency),
    hasBlockers: (facts) => {
      const result = getSectionValidation('tenancy', facts, facts.__meta?.jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts) => {
      const result = getSectionValidation('tenancy', facts, facts.__meta?.jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'claim_details',
    label: 'Claim Details',
    description: 'What you are claiming',
    isComplete: (facts) => {
      // Must select at least one claim type
      // Interest decision moved to Claim Statement section
      const hasClaimType =
        facts.claiming_rent_arrears === true ||
        facts.claiming_damages === true ||
        facts.claiming_other === true;

      // Also require court name for England/Wales
      const jurisdiction = facts.__meta?.jurisdiction;
      const isEnglandWales = jurisdiction === 'england' || jurisdiction === 'wales';
      if (isEnglandWales) {
        const hasCourtName = !!(facts.money_claim?.court_name || facts.court_name);
        return hasClaimType && hasCourtName;
      }

      return hasClaimType;
    },
    hasBlockers: (facts, jurisdiction) => {
      const result = getSectionValidation('claim_details', facts, jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts, jurisdiction) => {
      const result = getSectionValidation('claim_details', facts, jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'arrears',
    label: 'Arrears',
    description: 'Rent arrears schedule',
    isComplete: (facts) => {
      // Only complete if user explicitly said they're NOT claiming rent arrears,
      // OR if they ARE claiming and have provided arrears items
      if (facts.claiming_rent_arrears === false) return true;
      if (facts.claiming_rent_arrears !== true) return false; // undefined = not yet answered
      const arrearsItems = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
      return Array.isArray(arrearsItems) && arrearsItems.length > 0;
    },
    hasBlockers: (facts) => {
      const result = getSectionValidation('arrears', facts, facts.__meta?.jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts) => {
      const result = getSectionValidation('arrears', facts, facts.__meta?.jurisdiction || 'england');
      return result.warnings;
    },
    // Only show if claiming rent arrears
    isVisible: (facts) => {
      // Show if claiming rent arrears OR if not yet selected any claim type (so user sees all options)
      const hasSelectedAnyClaimType =
        facts.claiming_rent_arrears !== undefined ||
        facts.claiming_damages !== undefined ||
        facts.claiming_other !== undefined;
      return !hasSelectedAnyClaimType || facts.claiming_rent_arrears === true;
    },
  },
  {
    id: 'damages',
    label: 'Damages',
    description: 'Property damage and other costs',
    isComplete: (facts) => {
      // Only complete if user explicitly said they're NOT claiming damages/other,
      // OR if they ARE claiming and have provided damage items
      if (facts.claiming_damages === false && facts.claiming_other === false) return true;
      if (facts.claiming_damages !== true && facts.claiming_other !== true) return false; // not yet answered

      // Check for damage items in money_claim object (where DamagesSection stores them)
      const damageItems = facts.money_claim?.damage_items || facts.damage_items || [];
      return Array.isArray(damageItems) && damageItems.length > 0;
    },
    hasBlockers: (facts) => {
      const result = getSectionValidation('damages', facts, facts.__meta?.jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts) => {
      const result = getSectionValidation('damages', facts, facts.__meta?.jurisdiction || 'england');
      return result.warnings;
    },
    // Only show if claiming damages or other costs
    isVisible: (facts) => {
      const hasSelectedAnyClaimType =
        facts.claiming_rent_arrears !== undefined ||
        facts.claiming_damages !== undefined ||
        facts.claiming_other !== undefined;
      return !hasSelectedAnyClaimType || facts.claiming_damages === true || facts.claiming_other === true;
    },
  },
  {
    id: 'claim_statement',
    label: 'Claim Statement',
    description: 'Statement, occupancy status, and interest',
    isComplete: (facts) => {
      // For England/Wales, must explicitly opt in/out of interest
      const jurisdiction = facts.__meta?.jurisdiction;
      const isEnglandWales = jurisdiction === 'england' || jurisdiction === 'wales';

      if (isEnglandWales) {
        // Interest must be explicitly set (true or false, not null/undefined)
        const interestDecided =
          facts.money_claim?.charge_interest === true ||
          facts.money_claim?.charge_interest === false;
        return interestDecided;
      }

      // For other jurisdictions, just check if basis_of_claim is provided
      return !!facts.money_claim?.basis_of_claim;
    },
    hasBlockers: (facts, jurisdiction) => {
      const result = getSectionValidation('claim_statement', facts, jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts, jurisdiction) => {
      const result = getSectionValidation('claim_statement', facts, jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'preaction',
    label: 'Pre-Action',
    description: 'Letter Before Claim (PAP-DEBT compliance)',
    isComplete: (facts) =>
      // Complete if user has either:
      // - Already sent a letter (letter_before_claim_sent or pap_letter_date)
      // - Chosen to have us generate the letter (generate_pap_documents)
      Boolean(facts.letter_before_claim_sent) ||
      Boolean(facts.pap_letter_date) ||
      Boolean(facts.money_claim?.generate_pap_documents),
    hasBlockers: (facts, jurisdiction) => {
      const result = getSectionValidation('preaction', facts, jurisdiction || 'england');
      return result.blockers;
    },
    hasWarnings: (facts, jurisdiction) => {
      const result = getSectionValidation('preaction', facts, jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'evidence',
    label: 'Evidence',
    description: 'Supporting documents',
    // Optional section - only complete when user has uploaded evidence or confirmed none needed
    isComplete: (facts) => Boolean(facts.evidence_reviewed || facts.uploaded_documents?.length > 0),
    hasWarnings: (facts) => {
      const result = getSectionValidation('evidence', facts, facts.__meta?.jurisdiction || 'england');
      return result.warnings;
    },
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and generate documents',
    isComplete: () => false, // Always navigable for final review
  },
];

/**
 * Valid reason param values that map to ClaimReasonType.
 * Used for SEO landing page pre-selection.
 */
const REASON_TO_CLAIM_TYPE: Record<string, ClaimReasonType> = {
  rent_arrears: 'rent_arrears',
  arrears: 'rent_arrears',
  property_damage: 'property_damage',
  damage: 'property_damage',
  cleaning: 'cleaning',
  unpaid_utilities: 'unpaid_utilities',
  utilities: 'unpaid_utilities',
  unpaid_council_tax: 'unpaid_council_tax',
  council_tax: 'unpaid_council_tax',
  other_tenant_debt: 'other_tenant_debt',
  other: 'other_tenant_debt',
};

/**
 * Maps URL params to initial claim reasons.
 * - reason param: comma-separated list of claim reasons (takes precedence)
 * - topic param: legacy support for topic=arrears
 */
function getInitialClaimReasons(reason?: string, topic?: string): ClaimReasonType[] {
  // Reason param takes precedence (from SEO landing pages)
  if (reason) {
    const reasonList = reason.split(',').map(r => r.trim().toLowerCase());
    const claimTypes: ClaimReasonType[] = [];
    for (const r of reasonList) {
      const claimType = REASON_TO_CLAIM_TYPE[r];
      if (claimType && !claimTypes.includes(claimType)) {
        claimTypes.push(claimType);
      }
    }
    if (claimTypes.length > 0) {
      return claimTypes;
    }
  }

  // Fall back to topic param (legacy support)
  switch (topic) {
    case 'arrears':
      return ['rent_arrears'];
    case 'damage':
    case 'damages':
      return ['property_damage'];
    default:
      return [];
  }
}

export const MoneyClaimSectionFlow: React.FC<MoneyClaimSectionFlowProps> = ({
  caseId,
  jurisdiction,
  topic,
  reason,
}) => {
  // Derive initial claim reasons from reason or topic param
  const initialClaimReasons = useMemo(() => getInitialClaimReasons(reason, topic), [reason, topic]);
  const router = useRouter();

  // State
  const [facts, setFacts] = useState<any>({ __meta: { product: 'money_claim', jurisdiction } });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Smart Review state (hydrated from persisted facts.__smart_review)
  const [smartReviewWarnings, setSmartReviewWarnings] = useState<SmartReviewWarningItem[]>([]);
  const [smartReviewSummary, setSmartReviewSummary] = useState<SmartReviewSummary | null>(null);

  // Ask Heaven contextual question tracking
  const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>(undefined);

  // Debounced save refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFactsRef = useRef<any>(null);

  // Load existing facts on mount
  useEffect(() => {
    const loadFacts = async () => {
      try {
        setLoading(true);
        const loadedFacts = await getCaseFacts(caseId);
        if (loadedFacts && Object.keys(loadedFacts).length > 0) {
          setFacts((prev: any) => ({
            ...prev,
            ...loadedFacts,
            __meta: {
              ...prev.__meta,
              ...loadedFacts.__meta,
              product: 'money_claim',
              jurisdiction,
            },
          }));

          // Hydrate Smart Review state from persisted data
          const sr = (loadedFacts as any).__smart_review;
          if (sr?.warnings) {
            setSmartReviewWarnings(sr.warnings);
            setSmartReviewSummary(sr.summary || null);
          }
        }
      } catch (err) {
        console.error('Failed to load facts:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadFacts();
  }, [caseId, jurisdiction]);

  // Get visible sections based on claim type selections
  const visibleSections = useMemo(() => {
    return SECTIONS.filter((section) => {
      if (!section.isVisible) return true;
      return section.isVisible(facts);
    });
  }, [facts]);

  const currentSection = visibleSections[currentSectionIndex];

  // Save facts to backend (actual save)
  const saveFactsToServer = useCallback(
    async (updatedFacts: any) => {
      try {
        setSaving(true);
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'money_claim',
          product: 'money_claim',
        });
      } catch (err) {
        console.error('Failed to save facts:', err);
        setError('Failed to save. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [caseId, jurisdiction]
  );

  // P0-2 FIX: Retry save handler - allows users to retry failed saves
  const handleRetrySave = useCallback(() => {
    // Retry with current facts state
    saveFactsToServer(facts);
  }, [facts, saveFactsToServer]);

  // Debounced save - waits 500ms before saving to reduce API calls
  const debouncedSave = useCallback(
    (updatedFacts: any) => {
      pendingFactsRef.current = updatedFacts;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout
      saveTimeoutRef.current = setTimeout(() => {
        if (pendingFactsRef.current) {
          saveFactsToServer(pendingFactsRef.current);
          pendingFactsRef.current = null;
        }
      }, 500);
    },
    [saveFactsToServer]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save any pending changes before unmount
        if (pendingFactsRef.current) {
          saveFactsToServer(pendingFactsRef.current);
        }
      }
    };
  }, [saveFactsToServer]);

  // Flush pending saves when tab is hidden (reduces debounce loss window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Clear any pending debounce timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        // Flush any pending changes when tab is hidden
        if (pendingFactsRef.current) {
          saveFactsToServer(pendingFactsRef.current);
          pendingFactsRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveFactsToServer]);

  // Update facts and save (with debouncing)
  const handleUpdate = useCallback(
    (updates: Record<string, any>) => {
      // Deep merge to preserve existing nested fields
      const next = { ...facts };

      for (const [key, value] of Object.entries(updates)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          next[key] = {
            ...(next[key] || {}),
            ...value,
          };
        } else {
          next[key] = value;
        }
      }

      // Invalidate Smart Review when facts change to prevent stale warnings
      // Only invalidate if there are actual data changes (not just __meta or __smart_review)
      const changedKeys = Object.keys(updates).filter(
        (k) => k !== '__meta' && k !== '__smart_review'
      );
      if (changedKeys.length > 0 && smartReviewWarnings.length > 0) {
        setSmartReviewWarnings([]);
        setSmartReviewSummary(null);
      }

      setFacts(next);
      debouncedSave(next);
    },
    [facts, debouncedSave, smartReviewWarnings.length]
  );

  // Helper to get current claim reasons from facts
  const getClaimReasons = useCallback((): ClaimReasonType[] => {
    const reasons: ClaimReasonType[] = [];
    if (facts.claiming_rent_arrears === true) reasons.push('rent_arrears');
    const otherTypes: string[] = facts.money_claim?.other_amounts_types || [];
    if (otherTypes.includes('property_damage')) reasons.push('property_damage');
    if (otherTypes.includes('cleaning')) reasons.push('cleaning');
    if (otherTypes.includes('unpaid_utilities')) reasons.push('unpaid_utilities');
    if (otherTypes.includes('unpaid_council_tax')) reasons.push('unpaid_council_tax');
    if (facts.claiming_other === true || otherTypes.includes('other_charges')) reasons.push('other_tenant_debt');
    return reasons;
  }, [facts]);

  // Navigate to next section with step completion tracking
  const handleNext = useCallback(() => {
    if (currentSectionIndex < visibleSections.length - 1) {
      // Track step completion if the current section is complete
      const current = visibleSections[currentSectionIndex];
      if (current && current.isComplete(facts)) {
        // Only fire if not already tracked for this step
        const shouldTrack = markStepCompleted(current.id);
        if (shouldTrack) {
          const attribution = getWizardAttribution();
          trackWizardStepCompleteWithAttribution({
            product: 'money_claim',
            jurisdiction: jurisdiction,
            step: current.id,
            stepIndex: currentSectionIndex,
            totalSteps: visibleSections.length,
            src: attribution.src,
            topic: attribution.topic,
            utm_source: attribution.utm_source,
            utm_medium: attribution.utm_medium,
            utm_campaign: attribution.utm_campaign,
            landing_url: attribution.landing_url,
            first_seen_at: attribution.first_seen_at,
          });

          // Track section skips (arrears skipped when not claiming rent, damages skipped when not claiming damages)
          const reasons = getClaimReasons();
          if (current.id === 'arrears' && facts.claiming_rent_arrears === false) {
            trackMoneyClaimSectionSkipped({
              section: 'arrears',
              reasons,
              jurisdiction,
            });
          }
          if (current.id === 'damages' && facts.claiming_damages === false && facts.claiming_other === false) {
            trackMoneyClaimSectionSkipped({
              section: 'damages',
              reasons,
              jurisdiction,
            });
          }
        }
      }

      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, visibleSections, facts, jurisdiction, getClaimReasons]);

  // Navigate to previous section
  const handleBack = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  }, [currentSectionIndex]);

  // Jump to specific section (by ID, finding in visible sections)
  const handleJumpToSection = useCallback((sectionId: string) => {
    const index = visibleSections.findIndex((s) => s.id === sectionId);
    if (index >= 0) {
      setCurrentSectionIndex(index);
      // Scroll to top after navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [visibleSections]);

  // Map validation field/section to wizard section ID
  const mapToWizardSection = useCallback((section: string): string => {
    // Direct mappings
    const sectionMap: Record<string, string> = {
      parties: 'claimant', // "parties" from validation maps to claimant section
      claimant: 'claimant',
      defendant: 'defendant',
      tenancy: 'tenancy',
      claim_details: 'claim_details',
      arrears: 'arrears',
      damages: 'damages',
      claim_statement: 'claim_statement',
      preaction: 'preaction',
      evidence: 'evidence',
      review: 'review',
    };
    return sectionMap[section] || section;
  }, []);

  // Listen for wizard:navigate custom events from ReviewSection
  useEffect(() => {
    const handleWizardNavigate = (event: CustomEvent<{ section: string }>) => {
      const targetSection = mapToWizardSection(event.detail.section);
      handleJumpToSection(targetSection);
    };

    window.addEventListener('wizard:navigate', handleWizardNavigate as EventListener);
    return () => {
      window.removeEventListener('wizard:navigate', handleWizardNavigate as EventListener);
    };
  }, [handleJumpToSection, mapToWizardSection]);

  // Handle wizard completion - redirect to review page (same as eviction flow)
  const handleComplete = useCallback(async () => {
    router.push(`/wizard/review?case_id=${caseId}&product=money_claim`);
  }, [caseId, router]);

  // Calculate progress based on visible sections
  const completedCount = visibleSections.filter((s) => s.isComplete(facts)).length;
  const progress = Math.round((completedCount / visibleSections.length) * 100);

  // Get blockers and warnings for current section (with jurisdiction)
  const currentBlockers = currentSection?.hasBlockers?.(facts, jurisdiction) || [];
  const currentWarnings = currentSection?.hasWarnings?.(facts, jurisdiction) || [];

  // Get overall case validation for review section
  const caseValidation = useMemo(() => {
    return validateMoneyClaimCase(facts, jurisdiction);
  }, [facts, jurisdiction]);

  // Jurisdiction label - Money Claim is England only
  const jurisdictionLabel = 'England Money Claim';

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'claimant':
        return <ClaimantSection facts={facts} onUpdate={handleUpdate} />;
      case 'defendant':
        return <DefendantSection facts={facts} onUpdate={handleUpdate} />;
      case 'tenancy':
        return (
          <TenancySection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'claim_details':
        return (
          <ClaimDetailsSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
            initialClaimReasons={initialClaimReasons}
          />
        );
      case 'arrears':
        return <ArrearsSection facts={facts} onUpdate={handleUpdate} />;
      case 'damages':
        return <DamagesSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'claim_statement':
        return (
          <ClaimStatementSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
            onSetCurrentQuestionId={setCurrentQuestionId}
          />
        );
      case 'preaction':
        return (
          <PreActionSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'evidence':
        return (
          <EvidenceSection
            facts={facts}
            onUpdate={handleUpdate}
            caseId={caseId}
            jurisdiction={jurisdiction}
          />
        );
      case 'review':
        return (
          <ReviewSection
            facts={facts}
            caseId={caseId}
            jurisdiction={jurisdiction}
          />
        );
      default:
        return <div>Unknown section: {currentSection.id}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <WizardFlowShell
      title={`${jurisdictionLabel} Pack`}
      completedCount={completedCount}
      totalCount={visibleSections.length}
      progress={progress}
      tabs={visibleSections.map((section, index) => ({
        id: section.id,
        label: section.label,
        isCurrent: index === currentSectionIndex,
        isComplete: section.isComplete(facts),
        hasIssue:
          (section.hasBlockers?.(facts, jurisdiction) || []).length > 0 ||
          (section.hasWarnings?.(facts, jurisdiction) || []).length > 0,
        onClick: () => setCurrentSectionIndex(index),
      }))}
      sectionTitle={currentSection?.label ?? ''}
      sectionDescription={currentSection?.description}
      banner={error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button
              type="button"
              onClick={handleRetrySave}
              disabled={saving}
              className="ml-4 px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      ) : undefined}
      sidebar={(
        <AskHeavenPanel
          caseId={caseId}
          caseType="money_claim"
          jurisdiction={jurisdiction}
          product="money_claim"
          currentQuestionId={currentQuestionId}
        />
      )}
      navigation={(
        <>
          <button
            onClick={handleBack}
            disabled={currentSectionIndex === 0}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${currentSectionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isWizardThemeV2
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-gray-500">Saving...</span>}

            {currentSection?.id === 'review' ? (
              <button
                onClick={handleComplete}
                disabled={!caseValidation.valid}
                className={`
                  px-6 py-2 text-sm font-medium rounded-md transition-colors
                  ${!caseValidation.valid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'}
                `}
              >
                Generate Documents
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentSectionIndex === visibleSections.length - 1}
                className={`
                  px-6 py-2 text-sm font-medium rounded-md transition-colors
                  ${currentSectionIndex === visibleSections.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'}
                `}
              >
                Next →
              </button>
            )}
          </div>
        </>
      )}
    >
      {currentBlockers.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-2">Cannot Proceed - Blockers:</h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {currentBlockers.map((blocker, i) => (
              <li key={i}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {currentWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Warnings:</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {currentWarnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {renderSection()}

      {(currentSection?.id === 'evidence' || currentSection?.id === 'review') &&
        smartReviewWarnings.length > 0 && (
          <div className="mt-6">
            <SmartReviewPanel
              warnings={smartReviewWarnings}
              summary={smartReviewSummary}
              defaultCollapsed={currentSection?.id !== 'evidence'}
            />
          </div>
        )}
    </WizardFlowShell>
  );
};

export default MoneyClaimSectionFlow;
