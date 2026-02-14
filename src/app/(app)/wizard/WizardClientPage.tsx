/**
 * Wizard Selection Client Component
 *
 * Interactive entry point for the conversational wizard
 * Users select document type and jurisdiction, then start the guided flow
 *
 * Supports URL params:
 * - product: notice_only, complete_pack, money_claim, ast_standard, ast_premium, tenancy_agreement
 * - jurisdiction: england, wales, scotland, northern-ireland
 * - src: tracking source (product_page, template, validator, tool, blog, ask_heaven, nav, footer)
 * - topic: eviction, arrears, tenancy, deposit, compliance
 * - utm_source, utm_medium, utm_campaign: UTM tracking
 */

'use client';

import React, { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button, Container, TealHero } from '@/components/ui';
import { clsx } from 'clsx';
import { RiArrowDownLine, RiArrowLeftLine, RiCheckLine, RiAlertLine } from 'react-icons/ri';
import {
  trackWizardEntryViewWithAttribution,
  trackWizardStartWithAttribution,
  trackWizardIncompatibleChoice,
} from '@/lib/analytics';
import type { WizardJurisdiction, WizardSource, WizardTopic } from '@/lib/wizard/buildWizardLink';
import {
  isProductSupportedInJurisdiction,
  getUnsupportedProductMessage,
  getFallbackProduct,
} from '@/lib/wizard/buildWizardLink';
import {
  initializeAttribution,
  setWizardAttribution,
  getWizardAttribution,
  resetCompletedSteps,
} from '@/lib/wizard/wizardAttribution';

// Product-specific hero content (jurisdiction-neutral)
interface HeroContent {
  title: string;
  subtitle: string;
  eyebrow: string;
}

function getHeroContent(product: string | null, jurisdiction: string | null): HeroContent {
  switch (product) {
    case 'notice_only':
      return {
        title: 'Generate an Eviction Notice Bundle',
        subtitle: jurisdiction === 'scotland'
          ? 'Notice to Leave for Scottish Private Residential Tenancies'
          : jurisdiction === 'wales'
            ? 'Renting Homes (Wales) Act Compliant Notices'
            : 'Section 21/8 (England), Section 173 (Wales), Notice to Leave (Scotland)',
        eyebrow: 'Notice Only',
      };
    case 'complete_pack':
      return {
        title: 'Complete Eviction Pack',
        subtitle: 'England-only bundle: Section 21/8 routes with N5 / N5B / N119, witness statement draft, evidence checklist, and filing guidance',
        eyebrow: 'Complete Pack',
      };
    case 'ast_standard':
      return {
        title: 'Standard Tenancy Agreement',
        subtitle: jurisdiction === 'scotland'
          ? 'Private Residential Tenancy (PRT) for Scotland'
          : jurisdiction === 'wales'
            ? 'Standard Occupation Contract for Wales'
            : jurisdiction === 'northern-ireland'
              ? 'Private Tenancy Agreement for NI'
              : 'Create a Compliant Tenancy Agreement',
        eyebrow: jurisdiction === 'scotland' ? 'PRT' : jurisdiction === 'wales' ? 'Occupation Contract' : 'Standard AST',
      };
    case 'ast_premium':
      return {
        title: 'Premium Tenancy Agreement',
        subtitle: 'AST (England), Occupation Contract (Wales), PRT (Scotland), NI private tenancy with compliance checklist',
        eyebrow: 'Premium',
      };
    case 'money_claim':
      return {
        title: 'Money Claim Pack',
        subtitle: 'England-only (County Court / MCOL-ready). Recover unpaid rent or tenancy-related debt with guided claim structuring.',
        eyebrow: 'Money Claim',
      };
    default:
      return {
        title: 'Legal Document Wizard',
        subtitle: 'Guided Document Creation for UK Landlords',
        eyebrow: 'Wizard',
      };
  }
}

interface DocumentOption {
  type: 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';
  title: string;
  description: string;
  icon: string;
  price: string;
  regionBadge?: string;
}

interface JurisdictionOption {
  value: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  label: string;
  flag: string;
}

// Jurisdiction-neutral document descriptions
// Regional availability (January 2026):
// - notice_only: England, Wales, Scotland
// - complete_pack: England only
// - money_claim: England only
// - tenancy_agreement: All UK regions
const documentOptions: DocumentOption[] = [
  {
    type: 'notice_only',
    title: 'Eviction Notices',
    description: 'Jurisdiction-specific notice bundles: Section 21/8 (England), Section 173 (Wales), Notice to Leave (Scotland)',
    icon: '📄',
    price: 'From £49.99',
  },
  {
    type: 'complete_pack',
    title: 'Complete Eviction Pack',
    description: 'England-only case bundle with N5 / N5B / N119 routes, witness statement draft, and filing guide',
    icon: '⚖️',
    price: '£199.99',
    regionBadge: 'England only',
  },
  {
    type: 'money_claim',
    title: 'Money Claims',
    description: 'England-only money claim bundle for rent arrears and tenancy debts (County Court / MCOL-ready)',
    icon: '💰',
    price: '£99.99',
    regionBadge: 'England only',
  },
  {
    type: 'tenancy_agreement',
    title: 'Tenancy Agreements',
    description: 'AST (England), Occupation Contract (Wales), PRT (Scotland), or NI private tenancy agreement pack',
    icon: '📝',
    price: 'From £14.99',
  },
];

// All available jurisdictions (canonical)
const allJurisdictions: JurisdictionOption[] = [
  { value: 'england', label: 'England', flag: '/gb-eng.svg' },
  { value: 'wales', label: 'Wales', flag: '/gb-wls.svg' },
  { value: 'scotland', label: 'Scotland', flag: '/gb-sct.svg' },
  { value: 'northern-ireland', label: 'Northern Ireland', flag: '/gb-nir.svg' },
];

// Check if a jurisdiction is enabled for a document type
// Regional product restrictions (January 2026):
// - complete_pack and money_claim: England only
// - notice_only: England, Wales, Scotland (not NI)
// - tenancy_agreement: All UK regions
function isJurisdictionEnabled(
  jurisdiction: string,
  documentType: DocumentOption['type'] | null
): boolean {
  if (!documentType) {
    return true;
  }

  // Northern Ireland: tenancy agreements only (eviction notices planned).
  if (jurisdiction === 'northern-ireland') {
    return documentType === 'tenancy_agreement';
  }

  // Wales and Scotland only support notice_only and tenancy_agreement
  // complete_pack and money_claim are England-only
  if (jurisdiction === 'wales' || jurisdiction === 'scotland') {
    return documentType === 'notice_only' || documentType === 'tenancy_agreement';
  }

  return true;
}

// Check if a product is available for a jurisdiction (inverse of isJurisdictionEnabled)
// Used to filter products when jurisdiction is already selected
function isProductAvailableForJurisdiction(
  documentType: DocumentOption['type'],
  jurisdiction: string | null
): boolean {
  if (!jurisdiction) {
    return true; // Show all products if no jurisdiction selected
  }

  return isJurisdictionEnabled(jurisdiction, documentType);
}

// Get available document options for a given jurisdiction
function getAvailableDocumentOptions(jurisdiction: string | null): DocumentOption[] {
  if (!jurisdiction) {
    return documentOptions; // Return all if no jurisdiction selected
  }

  return documentOptions.filter((doc) =>
    isProductAvailableForJurisdiction(doc.type, jurisdiction)
  );
}

// Map product parameter to document type
function mapProductToDocumentType(
  product: string
): DocumentOption['type'] | null {
  switch (product) {
    case 'complete_pack':
      return 'complete_pack';
    case 'notice_only':
      return 'notice_only';
    case 'money_claim':
      return 'money_claim';
    case 'ast_standard':
    case 'ast_premium':
    case 'tenancy_agreement':
      return 'tenancy_agreement';
    default:
      return null;
  }
}

// Map document type to the wizard flow type
function getWizardFlowType(documentType: DocumentOption['type']): string {
  switch (documentType) {
    case 'notice_only':
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
      return 'money_claim';
    case 'tenancy_agreement':
      return 'tenancy_agreement';
    default:
      return 'eviction';
  }
}

// Validate jurisdiction param
function isValidJurisdiction(value: string | null): value is WizardJurisdiction {
  return value === 'england' || value === 'wales' || value === 'scotland' || value === 'northern-ireland';
}

/**
 * NOTE:
 * useSearchParams() must be rendered under a <Suspense> boundary in Next 15/16
 * to avoid prerender/export build failures ("missing-suspense-with-csr-bailout").
 */
function WizardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params
  const productParam = searchParams.get('product');
  const jurisdictionParam = searchParams.get('jurisdiction');
  const srcParam = searchParams.get('src') as WizardSource | null;
  const topicParam = searchParams.get('topic') as WizardTopic | null;
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');

  const documentSectionRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);

  // Pre-select document based on product param
  const preselectedDocument = useMemo(() => {
    if (!productParam) return null;
    const docType = mapProductToDocumentType(productParam);
    return docType ? documentOptions.find((d) => d.type === docType) ?? null : null;
  }, [productParam]);

  // Pre-select jurisdiction if valid and compatible
  const preselectedJurisdiction = useMemo(() => {
    if (!isValidJurisdiction(jurisdictionParam)) return null;
    const docType = preselectedDocument?.type ?? null;
    // Check compatibility
    if (docType && !isJurisdictionEnabled(jurisdictionParam, docType)) {
      return null; // Don't preselect if incompatible
    }
    return allJurisdictions.find((j) => j.value === jurisdictionParam) ?? null;
  }, [jurisdictionParam, preselectedDocument]);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentOption | null>(preselectedDocument);
  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState<JurisdictionOption | null>(preselectedJurisdiction);

  // Determine initial step
  const initialStep = useMemo(() => {
    if (preselectedDocument && preselectedJurisdiction) return 2; // Both selected, show jurisdiction (confirmation)
    if (preselectedDocument) return 2; // Product selected, need jurisdiction
    return 1; // Need product selection
  }, [preselectedDocument, preselectedJurisdiction]);

  const [step, setStep] = useState<1 | 2>(initialStep);

  // Show incompatibility warning if URL params are incompatible
  const [showIncompatibilityWarning, setShowIncompatibilityWarning] = useState(false);
  const incompatibilityMessage = useMemo(() => {
    if (!productParam || !jurisdictionParam) return null;
    if (!isValidJurisdiction(jurisdictionParam)) return null;
    const docType = mapProductToDocumentType(productParam);
    if (!docType) return null;
    return getUnsupportedProductMessage(
      productParam as any,
      jurisdictionParam
    );
  }, [productParam, jurisdictionParam]);

  // Handle NI incompatibility with auto-fallback
  const [autoSwitchedProduct, setAutoSwitchedProduct] = useState<string | null>(null);

  useEffect(() => {
    if (incompatibilityMessage) {
      setShowIncompatibilityWarning(true);

      // Auto-switch to tenancy agreement for NI
      if (jurisdictionParam === 'northern-ireland' && productParam) {
        const fallbackProduct = getFallbackProduct(productParam as any, 'northern-ireland');

        // Track the incompatible choice
        trackWizardIncompatibleChoice({
          attemptedProduct: productParam,
          jurisdiction: 'northern-ireland',
          resolvedProduct: fallbackProduct,
          action: 'auto_switch',
          src: srcParam || undefined,
          topic: topicParam || undefined,
        });

        // Auto-select tenancy agreement
        const tenancyDoc = documentOptions.find((d) => d.type === 'tenancy_agreement');
        if (tenancyDoc) {
          setSelectedDocument(tenancyDoc);
          setAutoSwitchedProduct(fallbackProduct);
        }
      }
    }
  }, [incompatibilityMessage, jurisdictionParam, productParam, srcParam, topicParam]);

  // Initialize attribution and track entry view on mount
  useEffect(() => {
    // Initialize attribution from URL params
    const attribution = initializeAttribution();

    // Reset completed steps for fresh wizard session
    resetCompletedSteps();

    // Track entry view with full attribution
    trackWizardEntryViewWithAttribution({
      product: productParam || 'not_selected',
      jurisdiction: jurisdictionParam || 'not_selected',
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get product-specific hero content
  const heroContent = getHeroContent(productParam, jurisdictionParam);

  // Filter jurisdictions to only show those available for the selected document type
  const availableJurisdictions = useMemo(() => {
    if (!selectedDocument) {
      return allJurisdictions;
    }
    return allJurisdictions.filter((jur) =>
      isJurisdictionEnabled(jur.value, selectedDocument.type)
    );
  }, [selectedDocument]);

  // Handle Start My Case Bundle button - scroll to the appropriate section based on current step
  const handleStartNowClick = () => {
    setTimeout(() => {
      if (step === 2) {
        locationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        documentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDocumentSelect = (doc: DocumentOption) => {
    setSelectedDocument(doc);
    // Reset jurisdiction if not compatible
    if (selectedJurisdiction && !isJurisdictionEnabled(selectedJurisdiction.value, doc.type)) {
      setSelectedJurisdiction(null);
    }
    setStep(2);
  };

  const handleJurisdictionSelect = (jur: JurisdictionOption) => {
    setSelectedJurisdiction(jur);
  };

  const handleStart = () => {
    if (selectedDocument && selectedJurisdiction) {
      const flowType = getWizardFlowType(selectedDocument.type);

      // Get the product to use (may have been auto-switched)
      const effectiveProduct = autoSwitchedProduct || productParam || selectedDocument.type;

      // Update attribution with selected product and jurisdiction
      const attribution = setWizardAttribution({
        product: effectiveProduct,
        jurisdiction: selectedJurisdiction.value,
      });

      // Track wizard start with full attribution
      // Note: The actual wizard_start will fire on /wizard/flow mount with dedupe
      // This is click-based tracking for backwards compatibility
      trackWizardStartWithAttribution({
        product: effectiveProduct,
        jurisdiction: selectedJurisdiction.value,
        src: attribution.src,
        topic: attribution.topic,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        landing_url: attribution.landing_url,
        first_seen_at: attribution.first_seen_at,
      });

      // Build URL with tracking params preserved
      const urlParams = new URLSearchParams({
        type: flowType,
        jurisdiction: selectedJurisdiction.value,
        product: effectiveProduct,
      });

      // Preserve tracking params for the flow page
      if (srcParam) urlParams.set('src', srcParam);
      if (topicParam) urlParams.set('topic', topicParam);
      if (utmSource) urlParams.set('utm_source', utmSource);
      if (utmMedium) urlParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlParams.set('utm_campaign', utmCampaign);

      const url = `/wizard/flow?${urlParams.toString()}`;
      router.push(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TealHero
        title={heroContent.title}
        subtitle={heroContent.subtitle}
        eyebrow={heroContent.eyebrow}
        actions={
          <button
            onClick={handleStartNowClick}
            className="group flex items-center gap-2 px-6 py-3 rounded-full border-2 border-black bg-transparent text-black font-semibold hover:border-purple-600 hover:text-purple-600 hover:shadow-lg transition-all duration-300 animate-subtle-pulse cursor-pointer"
          >
            Start My Case Bundle
            <RiArrowDownLine className="w-5 h-5 animate-bounce-slow group-hover:translate-y-1 transition-transform text-[#7C3AED]" />
          </button>
        }
      />
      <Container size="large" className="py-12">
        {/* Incompatibility Warning */}
        {showIncompatibilityWarning && incompatibilityMessage && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <RiAlertLine className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">Product Not Available for Northern Ireland</p>
                <p className="text-amber-700 text-sm mt-1">{incompatibilityMessage}</p>
                {autoSwitchedProduct && (
                  <p className="text-amber-700 text-sm mt-2">
                    <strong>We&apos;ve automatically selected Tenancy Agreements</strong> which is available for Northern Ireland properties.
                  </p>
                )}
                <button
                  onClick={() => setShowIncompatibilityWarning(false)}
                  className="text-amber-600 text-sm underline mt-2 hover:text-amber-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex items-center justify-center gap-4">
            <div
              className={clsx(
                'flex items-center gap-2',
                step === 1 ? 'text-primary' : 'text-gray-400'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 1 ? 'bg-primary text-white' : 'bg-gray-200'
                )}
              >
                1
              </div>
              <span className="text-sm font-medium">Choose Document</span>
            </div>

            <div className="w-12 h-0.5 bg-gray-300" />

            <div
              className={clsx(
                'flex items-center gap-2',
                step === 2 ? 'text-primary' : 'text-gray-400'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 2 ? 'bg-primary text-white' : 'bg-gray-200'
                )}
              >
                2
              </div>
              <span className="text-sm font-medium">Choose Location</span>
            </div>
          </div>
        </div>

        {/* Step 1: Document Type Selection */}
        {step === 1 && (
          <div ref={documentSectionRef} className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal text-center mb-8">
              What do you need help with?
            </h2>

            {/* Filter products based on pre-selected jurisdiction (from URL param) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getAvailableDocumentOptions(selectedJurisdiction?.value ?? null).map((doc) => (
                <button
                  key={doc.type}
                  onClick={() => handleDocumentSelect(doc)}
                  className={clsx(
                    'relative p-6 rounded-xl border-2 transition-all duration-200 text-left',
                    'hover:shadow-lg hover:scale-105',
                    selectedDocument?.type === doc.type
                      ? 'border-primary bg-primary-subtle shadow-md'
                      : 'border-gray-300 bg-white hover:border-primary'
                  )}
                >
                  <div className="h-12 flex items-center mb-4">
                    <span className="text-4xl">{doc.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 min-h-12">{doc.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-semibold">{doc.price}</span>
                    {doc.regionBadge && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {doc.regionBadge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Jurisdiction Selection */}
        {step === 2 && selectedDocument && (
          <div ref={locationSectionRef} className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="mb-6 text-gray-600 hover:text-primary transition-colors flex items-center gap-2"
            >
              <RiArrowLeftLine className="w-5 h-5 text-[#7C3AED]" />
              Back to document selection
            </button>

            <h2 className="text-2xl font-bold text-charcoal text-center mb-2">
              Where is the property located?
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Different rules apply in each jurisdiction
            </p>

            <div className="space-y-4">
              {availableJurisdictions.map((jur) => (
                <button
                  key={jur.value}
                  onClick={() => handleJurisdictionSelect(jur)}
                  className={clsx(
                    'w-full p-6 rounded-xl border-2 transition-all duration-200 text-left',
                    'flex items-center gap-4',
                    selectedJurisdiction?.value === jur.value
                      ? 'border-primary bg-primary-subtle shadow-md'
                      : 'border-gray-300 bg-white hover:border-primary hover:shadow-sm'
                  )}
                >
                  <div>
                    <Image
                      src={jur.flag}
                      alt={jur.label}
                      width={48}
                      height={32}
                      className="w-12 h-8 border border-gray-200 rounded-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal">{jur.label}</h3>
                  </div>
                  {selectedJurisdiction?.value === jur.value && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <RiCheckLine className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Start Button */}
            {selectedJurisdiction && (
              <div className="mt-8 text-center">
                <Button variant="primary" size="large" onClick={handleStart}>
                  Start Wizard →
                </Button>
                <p className="text-sm text-gray-600 mt-3">
                  This will take about 5-10 minutes
                </p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

export default function WizardClientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <WizardPageInner />
    </Suspense>
  );
}
