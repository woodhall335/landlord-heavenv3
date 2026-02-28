'use client';

import React from 'react';
import Link from 'next/link';
import {
  RiArrowRightLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiMailLine,
  RiQuestionLine,
} from 'react-icons/ri';
import { buildWizardLink, type WizardJurisdiction } from '@/lib/wizard/buildWizardLink';
import { type Topic, getRecommendedProduct, isComplianceTopic } from '@/lib/ask-heaven/topic-detection';
import {
  detectAskHeavenCtaIntent,
  getAskHeavenCtaCopy,
} from '@/lib/ask-heaven/cta-copy';

/**
 * CTA Mode types for NextBestActionCard
 * - action: Wizard CTA for transactional/late-funnel queries (eviction, money claim)
 * - checklist: Compliance checklist + email capture for informational queries
 * - tenancy: Tenancy agreement wizard for setup/deposit topics
 */
export type NextBestActionMode = 'action' | 'checklist' | 'tenancy';

interface NextBestActionCardProps {
  topic: Topic | null;
  jurisdiction: WizardJurisdiction;
  /** Suggested next step from API response (wizard | checklist | guide | none) */
  suggestedNextStep?: 'wizard' | 'checklist' | 'guide' | 'none' | null;
  /** Last question text for intent detection */
  lastQuestion?: string;
  /** Number of questions asked in this session */
  questionCount?: number;
  attribution?: {
    src?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  onCtaClick?: (ctaType: string, targetUrl: string, ctaLabel: string) => void;
  /** Callback to request email capture modal */
  onRequestEmailCapture?: (reason: 'compliance_checklist' | 'threshold_gate' | 'manual') => void;
}

/**
 * Transactional intent keywords - indicate user wants to take action
 */
const TRANSACTIONAL_PATTERNS =
  /serve\s+notice|evict|possession\s+order|court|tribunal|claim\s+form|mcol|n5|n1|form\s+6a|form\s+3|grounds|end\s+tenancy|terminate|notice\s+to\s+leave|section\s+173/i;

/**
 * Check if the question indicates transactional intent
 */
function hasTransactionalIntent(question?: string): boolean {
  if (!question) return false;
  return TRANSACTIONAL_PATTERNS.test(question);
}

/**
 * Determine the CTA mode based on topic, jurisdiction, and intent
 */
function determineCTAMode(
  topic: Topic | null,
  jurisdiction: WizardJurisdiction,
  lastQuestion?: string,
  suggestedNextStep?: string | null
): NextBestActionMode | null {
  if (!topic) return null;

  // NI special handling - only tenancy mode allowed
  if (jurisdiction === 'northern-ireland') {
    if (topic === 'eviction' || topic === 'arrears') {
      return null; // No CTA for eviction/arrears in NI
    }
    if (topic === 'tenancy' || topic === 'deposit') {
      return 'tenancy';
    }
    // For compliance topics in NI, show checklist
    if (isComplianceTopic(topic)) {
      return 'checklist';
    }
    return null;
  }

  // If API suggested a specific next step, respect it
  if (suggestedNextStep === 'wizard' && (topic === 'eviction' || topic === 'arrears' || topic === 'tenancy')) {
    return topic === 'tenancy' ? 'tenancy' : 'action';
  }
  if (suggestedNextStep === 'checklist') {
    return 'checklist';
  }

  // MODE 1: Action (Wizard CTA) - for eviction/arrears with transactional intent
  if ((topic === 'eviction' || topic === 'arrears') && hasTransactionalIntent(lastQuestion)) {
    return 'action';
  }

  // MODE 2: Compliance Checklist - for compliance topics with informational intent
  const complianceChecklistTopics: Topic[] = ['deposit', 'epc', 'gas_safety', 'eicr', 'smoke_alarm', 'carbon_monoxide', 'right_to_rent', 'compliance'];
  if (complianceChecklistTopics.includes(topic) && !hasTransactionalIntent(lastQuestion)) {
    return 'checklist';
  }

  // MODE 3: Tenancy/Setup - for tenancy agreement topics
  if (topic === 'tenancy') {
    return 'tenancy';
  }

  // For eviction/arrears without strong transactional intent, still show action
  if (topic === 'eviction' || topic === 'arrears') {
    return 'action';
  }

  // Default to checklist for remaining compliance topics
  if (isComplianceTopic(topic)) {
    return 'checklist';
  }

  return null;
}

/**
 * Get jurisdiction-specific copy for eviction topics
 */
function getEvictionCopy(jurisdiction: WizardJurisdiction): {
  title: string;
  description: string;
  buttonText: string;
} {
  switch (jurisdiction) {
    case 'wales':
      return {
        title: 'Serve a Section 173 Notice',
        description: 'Generate a Renting Homes Act compliant notice for Wales',
        buttonText: 'Start Section 173 Wizard',
      };
    case 'scotland':
      return {
        title: 'Serve a Notice to Leave',
        description: 'Create a compliant Notice to Leave for PRT tenancies',
        buttonText: 'Start Notice to Leave Wizard',
      };
    default:
      return {
        title: 'Serve an Eviction Notice',
        description: 'Create a compliant Section 21 or Section 8 notice',
        buttonText: 'Start Eviction Wizard',
      };
  }
}

/**
 * Get jurisdiction-specific copy for tenancy topics
 */
function getTenancyCopy(jurisdiction: WizardJurisdiction): {
  title: string;
  description: string;
  buttonText: string;
} {
  switch (jurisdiction) {
    case 'wales':
      return {
        title: 'Create an Occupation Contract',
        description: 'Generate a Renting Homes Act compliant occupation contract',
        buttonText: 'Start Contract Wizard',
      };
    case 'scotland':
      return {
        title: 'Create a PRT Agreement',
        description: 'Generate a compliant Private Residential Tenancy agreement',
        buttonText: 'Start PRT Wizard',
      };
    case 'northern-ireland':
      return {
        title: 'Create a Tenancy Agreement',
        description: 'Generate a compliant tenancy agreement for Northern Ireland',
        buttonText: 'Start Agreement Wizard',
      };
    default:
      return {
        title: 'Create a Tenancy Agreement',
        description: 'Generate a compliant Assured Shorthold Tenancy',
        buttonText: 'Start AST Wizard',
      };
  }
}

/**
 * Get compliance checklist copy based on topic
 */
function getComplianceChecklistCopy(topic: Topic): {
  title: string;
  description: string;
  buttonText: string;
  guideLink?: string;
} {
  switch (topic) {
    case 'deposit':
      return {
        title: 'Deposit Protection Checklist',
        description: 'Get a free checklist of deposit protection requirements',
        buttonText: 'Get Free Checklist',
        guideLink: '/blog/uk-deposit-protection-guide',
      };
    case 'epc':
      return {
        title: 'EPC Compliance Checklist',
        description: 'Get a free checklist of EPC rules for landlords',
        buttonText: 'Get Free Checklist',
        guideLink: '/blog/uk-epc-guide',
      };
    case 'gas_safety':
      return {
        title: 'Gas Safety Checklist',
        description: 'Get a free checklist of gas safety requirements',
        buttonText: 'Get Free Checklist',
        guideLink: '/blog/uk-gas-safety-landlords',
      };
    case 'eicr':
      return {
        title: 'EICR Checklist',
        description: 'Get a free checklist of electrical safety requirements',
        buttonText: 'Get Free Checklist',
        guideLink: '/blog/uk-electrical-safety-landlords',
      };
    case 'smoke_alarm':
    case 'carbon_monoxide':
      return {
        title: 'Smoke & CO Alarm Checklist',
        description: 'Get a free checklist of alarm requirements',
        buttonText: 'Get Free Checklist',
        guideLink: '/blog/uk-smoke-co-alarm-regulations-guide',
      };
    case 'right_to_rent':
      return {
        title: 'Right to Rent Checklist',
        description: 'Get a free checklist of right to rent requirements',
        buttonText: 'Get Free Checklist',
        guideLink: '/blog/uk-right-to-rent-checks',
      };
    default:
      return {
        title: 'Compliance Checklist',
        description: 'Get a free checklist of landlord requirements',
        buttonText: 'Get Free Checklist',
      };
  }
}

export function NextBestActionCard({
  topic,
  jurisdiction,
  suggestedNextStep,
  lastQuestion,
  questionCount = 0,
  attribution,
  onCtaClick,
  onRequestEmailCapture,
}: NextBestActionCardProps): React.ReactElement | null {
  // Don't show if no topic detected
  if (!topic) return null;

  const mode = determineCTAMode(topic, jurisdiction, lastQuestion, suggestedNextStep);

  // No mode determined - nothing to show
  if (!mode) {
    // Special NI handling for eviction/arrears - show informational notice
    if (jurisdiction === 'northern-ireland' && (topic === 'eviction' || topic === 'arrears')) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <RiCheckboxCircleLine className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-800">Northern Ireland Notice</h4>
              <p className="text-xs text-amber-700 mt-1">
                Eviction and money claim packs are not currently available for Northern Ireland.
                We recommend consulting with a local solicitor for possession proceedings.
              </p>
              <Link
                href={buildWizardLink({
                  product: 'tenancy_agreement',
                  jurisdiction: 'northern-ireland',
                  src: 'ask_heaven',
                  topic: 'tenancy',
                  utm_source: attribution?.utm_source,
                  utm_medium: attribution?.utm_medium,
                  utm_campaign: attribution?.utm_campaign,
                })}
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors"
                onClick={() => onCtaClick?.('wizard', '/wizard?product=tenancy_agreement', 'NI Tenancy Agreement')}
              >
                Need a tenancy agreement instead?
                <RiArrowRightLine className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // MODE 2: Compliance Checklist
  if (mode === 'checklist') {
    const checklistCopy = getComplianceChecklistCopy(topic);
    const showEmailCapture = questionCount >= 1 && onRequestEmailCapture;

    return (
      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-4 mt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
            <RiCheckboxCircleLine className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900">Next best step</h4>
            <p className="text-sm font-semibold text-green-700 mt-1">{checklistCopy.title}</p>
            <p className="text-xs text-gray-600 mt-1">{checklistCopy.description}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {showEmailCapture ? (
                <button
                  type="button"
                  onClick={() => onRequestEmailCapture('compliance_checklist')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <RiMailLine className="h-4 w-4" />
                  {checklistCopy.buttonText}
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                  <RiCheckboxCircleLine className="h-4 w-4" />
                  Ask a question to unlock checklist
                </span>
              )}
            </div>

            {/* Secondary CTAs */}
            <div className="mt-4 pt-3 border-t border-green-200/50">
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Focus the input - this will be handled by the parent
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    input?.focus();
                  }}
                  className="text-xs text-green-700 hover:text-green-800 hover:underline flex items-center gap-1"
                >
                  <RiQuestionLine className="h-3.5 w-3.5" />
                  Ask another question
                </button>
                {checklistCopy.guideLink && (
                  <>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={checklistCopy.guideLink}
                      className="text-xs text-green-700 hover:text-green-800 hover:underline"
                      onClick={() => onCtaClick?.('guide', checklistCopy.guideLink!, 'Read guide')}
                    >
                      Read full guide
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODE 3: Tenancy/Setup
  if (mode === 'tenancy') {
    const tenancyIntentCopy = getAskHeavenCtaCopy({
      product: 'tenancy_agreement',
      jurisdiction,
      intent: 'tenancy',
    });
    const tenancyCopy = tenancyIntentCopy ?? getTenancyCopy(jurisdiction);
    const wizardUrl = buildWizardLink({
      product: 'ast_standard',
      jurisdiction,
      src: 'ask_heaven',
      topic: 'tenancy',
      utm_source: attribution?.utm_source,
      utm_medium: attribution?.utm_medium,
      utm_campaign: attribution?.utm_campaign,
    });

    return (
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 mt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <RiFileTextLine className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900">Next best step</h4>
            <p className="text-sm font-semibold text-blue-700 mt-1">{tenancyCopy.title}</p>
            <p className="text-xs text-gray-600 mt-1">{tenancyCopy.description}</p>
            {tenancyIntentCopy?.priceNote && (
              <p className="text-[11px] text-gray-500 mt-1">{tenancyIntentCopy.priceNote}</p>
            )}
            <Link
              href={wizardUrl}
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => onCtaClick?.('next_best_action', wizardUrl, tenancyCopy.buttonText)}
            >
              {tenancyCopy.buttonText}
              <RiArrowRightLine className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Deposit protection link for England/Wales */}
        {(jurisdiction === 'england' || jurisdiction === 'wales') && topic === 'deposit' && (
          <div className="mt-4 pt-3 border-t border-blue-200/50">
            <p className="text-xs text-gray-500 mb-2">Also relevant:</p>
            <Link
              href="/tools/validators/deposit"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => onCtaClick?.('validator', '/tools/validators/deposit', 'Deposit Checker')}
            >
              Check deposit protection compliance
            </Link>
          </div>
        )}
      </div>
    );
  }

  // MODE 1: Action (Wizard CTA) - Default for eviction/arrears
  const intent = detectAskHeavenCtaIntent(topic, lastQuestion);
  const recommendation = getRecommendedProduct(topic, jurisdiction, intent ?? undefined);
  if (!recommendation) return null;

  const wizardUrl = buildWizardLink({
    product: recommendation.product,
    jurisdiction,
    src: 'ask_heaven',
    topic: topic === 'eviction' ? 'eviction' : topic === 'arrears' ? 'arrears' : 'general',
    utm_source: attribution?.utm_source,
    utm_medium: attribution?.utm_medium,
    utm_campaign: attribution?.utm_campaign,
  });

  const defaultCopy = topic === 'eviction'
    ? getEvictionCopy(jurisdiction)
    : {
        title: recommendation.label,
        description: recommendation.description,
        buttonText: 'Start Wizard',
      };
  const intentCopy = intent
    ? getAskHeavenCtaCopy({
        product: recommendation.product,
        jurisdiction,
        intent,
      })
    : null;
  const copy = intentCopy ?? defaultCopy;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <RiFileTextLine className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900">Next best step</h4>
          <p className="text-sm font-semibold text-primary mt-1">{copy.title}</p>
          <p className="text-xs text-gray-600 mt-1">{copy.description}</p>
          <Link
            href={wizardUrl}
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            onClick={() => onCtaClick?.('next_best_action', wizardUrl, copy.buttonText)}
          >
            {copy.buttonText}
            <RiArrowRightLine className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Secondary links for validators/templates if relevant */}
      {topic === 'eviction' && jurisdiction !== 'northern-ireland' && (
        <div className="mt-4 pt-3 border-t border-primary/10">
          <p className="text-xs text-gray-500 mb-2">Or check your existing notice:</p>
          <div className="flex flex-wrap gap-2">
            {jurisdiction === 'england' && (
              <>
                <Link
                  href="/tools/validators/section-21"
                  className="text-xs text-primary hover:underline"
                  onClick={() => onCtaClick?.('validator', '/tools/validators/section-21', 'Section 21 Validator')}
                >
                  Section 21 Checker
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/tools/validators/section-8"
                  className="text-xs text-primary hover:underline"
                  onClick={() => onCtaClick?.('validator', '/tools/validators/section-8', 'Section 8 Validator')}
                >
                  Section 8 Checker
                </Link>
              </>
            )}
            {jurisdiction === 'wales' && (
              <Link
                href="/wales-eviction-notices"
                className="text-xs text-primary hover:underline"
                onClick={() => onCtaClick?.('guide', '/wales-eviction-notices', 'Wales Guide')}
              >
                Wales Eviction Guide
              </Link>
            )}
            {jurisdiction === 'scotland' && (
              <Link
                href="/scotland-eviction-notices"
                className="text-xs text-primary hover:underline"
                onClick={() => onCtaClick?.('guide', '/scotland-eviction-notices', 'Scotland Guide')}
              >
                Scotland Eviction Guide
              </Link>
            )}
          </div>
        </div>
      )}

      {topic === 'arrears' && jurisdiction !== 'northern-ireland' && (
        <div className="mt-4 pt-3 border-t border-primary/10">
          <p className="text-xs text-gray-500 mb-2">Related tools:</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tools/rent-arrears-calculator"
              className="text-xs text-primary hover:underline"
              onClick={() => onCtaClick?.('tool', '/tools/rent-arrears-calculator', 'Arrears Calculator')}
            >
              Arrears Calculator
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/tools/free-rent-demand-letter"
              className="text-xs text-primary hover:underline"
              onClick={() => onCtaClick?.('template', '/tools/free-rent-demand-letter', 'Free Demand Letter')}
            >
              Free Demand Letter
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NextBestActionCard;
