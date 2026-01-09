'use client';

import React from 'react';
import Link from 'next/link';
import { RiArrowRightLine, RiFileTextLine, RiCheckboxCircleLine } from 'react-icons/ri';
import { buildWizardLink, type WizardJurisdiction } from '@/lib/wizard/buildWizardLink';
import {
  type Topic,
  getRecommendedProduct,
  isComplianceTopic,
  getTopicCTAs,
} from '@/lib/ask-heaven/topic-detection';

interface NextBestActionCardProps {
  topic: Topic | null;
  jurisdiction: WizardJurisdiction;
  attribution?: {
    src?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  onCtaClick?: (ctaType: string, targetUrl: string, ctaLabel: string) => void;
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

export function NextBestActionCard({
  topic,
  jurisdiction,
  attribution,
  onCtaClick,
}: NextBestActionCardProps): React.ReactElement | null {
  // Don't show if no topic detected
  if (!topic) return null;

  // Northern Ireland special handling - only show for tenancy topics
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

  const recommendation = getRecommendedProduct(topic, jurisdiction);
  const isCompliance = isComplianceTopic(topic);

  // For compliance topics, show validators first
  if (isCompliance && topic !== 'tenancy' && topic !== 'deposit') {
    const complianceCTAs = getTopicCTAs([topic], jurisdiction);
    if (complianceCTAs.length > 0) {
      return (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <RiCheckboxCircleLine className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Next best step</h4>
              <p className="text-xs text-gray-600 mt-1">
                Check your compliance with our free validators
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {complianceCTAs.slice(0, 2).map((cta, idx) => (
                  <Link
                    key={idx}
                    href={cta.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-primary text-xs font-medium rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors"
                    onClick={() => onCtaClick?.('validator', cta.href, cta.label)}
                  >
                    <RiFileTextLine className="h-3.5 w-3.5" />
                    {cta.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // For product topics, show wizard CTA
  if (!recommendation) return null;

  // Build the wizard link with full attribution
  const wizardUrl = buildWizardLink({
    product: recommendation.product,
    jurisdiction,
    src: 'ask_heaven',
    topic: topic === 'eviction' ? 'eviction' : topic === 'arrears' ? 'arrears' : topic === 'tenancy' ? 'tenancy' : 'general',
    utm_source: attribution?.utm_source,
    utm_medium: attribution?.utm_medium,
    utm_campaign: attribution?.utm_campaign,
  });

  // Get jurisdiction-specific copy
  const copy = topic === 'eviction'
    ? getEvictionCopy(jurisdiction)
    : topic === 'tenancy'
    ? getTenancyCopy(jurisdiction)
    : {
        title: recommendation.label,
        description: recommendation.description,
        buttonText: 'Start Wizard',
      };

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
