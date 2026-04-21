/**
 * Wizard Flow Page
 *
 * The main structured wizard experience.
 * Public starts are England-only; hidden legacy resumes can still carry
 * historic non-England jurisdiction context through direct case access.
 */

'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StructuredWizard } from '@/components/wizard/StructuredWizard';
import { MoneyClaimSectionFlow } from '@/components/wizard/flows/MoneyClaimSectionFlow';
import { EvictionSectionFlow } from '@/components/wizard/flows/EvictionSectionFlow';
import { NoticeOnlySectionFlow } from '@/components/wizard/flows/NoticeOnlySectionFlow';
import { TenancySectionFlow } from '@/components/wizard/flows/TenancySectionFlow';
import { ResidentialStandaloneSectionFlow } from '@/components/wizard/flows/ResidentialStandaloneSectionFlow';
import { Section13WizardFlow } from '@/components/wizard/flows/Section13WizardFlow';
import { EnglandTenancyProductChooser } from '@/components/wizard/EnglandTenancyProductChooser';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { trackWizardStartWithAttribution } from '@/lib/analytics';
import {
  setWizardAttribution,
  getOrCreateWizardFlowSession,
  hasWizardStarted,
  markWizardStarted,
  extractAttributionFromUrl,
} from '@/lib/wizard/wizardAttribution';
import { getSessionTokenHeaders } from '@/lib/session-token';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { isResidentialStandaloneTenancyProduct } from '@/lib/wizard/flow-routing';
import {
  isResidentialLettingProductSku,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';
import {
  getEnglandCanonicalTenancyProduct,
  type EnglandModernTenancyProductSku,
} from '@/lib/tenancy/england-product-model';
import {
  getRetiredPublicSkuRedirectDestination,
  isRetiredPublicSku,
} from '@/lib/public-retirements';
import {
  PUBLIC_PRODUCT_DESCRIPTORS,
  getPublicProductOwnerHref,
  isPubliclyStartableProduct,
} from '@/lib/public-products';

// Feature flags: Use new section-based flows
// Set to true to enable the redesigned wizards, false to use legacy StructuredWizard
const USE_EVICTION_SECTION_FLOW = true;
const USE_NOTICE_ONLY_SECTION_FLOW = true;
const USE_TENANCY_SECTION_FLOW = true;

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement' | 'rent_increase';
type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
type AskHeavenProduct = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';
type TenancyFlowProduct =
  | 'tenancy_agreement'
  | 'ast_standard'
  | 'ast_premium'
  | ResidentialLettingProductSku;

const TENANCY_FIELD_TO_SECTION: Record<string, string> = {
  deposit_amount: 'deposit',
  tenancy_start_date: 'tenancy',
  rent_amount: 'rent',
  term_length: 'tenancy',
  landlord_full_name: 'landlord',
  tenants: 'tenants',
};

function WizardFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialQuestion, setInitialQuestion] = useState<ExtendedWizardQuestion | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const type = searchParams.get('type') as CaseType | null;
  const rawJurisdiction = searchParams.get('jurisdiction') as Jurisdiction;
  const product = searchParams.get('product'); // Specific product (notice_only, complete_pack, etc.)
  const productVariant = searchParams.get('product_variant'); // e.g. money_claim_england_wales
  const editCaseId = searchParams.get('case_id'); // Case ID to edit
  const recoveryToken = searchParams.get('recovery_token');
  const mode = searchParams.get('mode');
  const jumpTo = searchParams.get('jump_to'); // Question ID to jump to (from End Validator "Fix this" button)
  const fixMode = searchParams.get('fix_mode') === 'true'; // Single-question fix mode (returns to validation after save)
  const highlightSectionsParam = searchParams.get('highlight_sections');
  const highlightedTenancySections = (highlightSectionsParam || '')
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => TENANCY_FIELD_TO_SECTION[field] || field);
  const publicJurisdictionBlocked =
    !editCaseId && Boolean(rawJurisdiction && rawJurisdiction !== 'england');
  const jurisdiction = (editCaseId ? rawJurisdiction : rawJurisdiction ?? 'england') as Jurisdiction;

  // SAFETY GUARD: For editing paid cases, use order's product_type to prevent downgrade
  const [effectiveProduct, setEffectiveProduct] = useState<string | null>(product);
  const [orderCheckDone, setOrderCheckDone] = useState(!editCaseId); // Skip check if no editCaseId
  const [paidOrderProduct, setPaidOrderProduct] = useState<string | null>(null);

  // Check order status to get authoritative product_type for paid cases
  useEffect(() => {
    if (!editCaseId || orderCheckDone) return;

    const checkOrderProduct = async () => {
      try {
        const response = await fetch(`/api/orders/status?case_id=${editCaseId}`);
        if (response.ok) {
          const data = await response.json();
          // If this is a paid order, use its product_type (prevents downgrade)
          if (data.paid && data.product_type) {
            console.log('[WizardFlow] Paid case detected - using order product_type:', data.product_type);
            setEffectiveProduct(data.product_type);
            setPaidOrderProduct(data.product_type);
          } else {
            // Not paid, use URL product param
            setEffectiveProduct(product);
            setPaidOrderProduct(null);
          }
        } else {
          // API error or no order found, fall back to URL param
          setEffectiveProduct(product);
          setPaidOrderProduct(null);
        }
      } catch (err) {
        console.error('[WizardFlow] Failed to check order status:', err);
        setEffectiveProduct(product);
        setPaidOrderProduct(null);
      } finally {
        setOrderCheckDone(true);
      }
    };

    checkOrderProduct();
  }, [editCaseId, product, orderCheckDone]);

  const hasRequiredParams = Boolean(type && jurisdiction);

  useEffect(() => {
    if (
      editCaseId ||
      publicJurisdictionBlocked ||
      type !== 'tenancy_agreement' ||
      jurisdiction !== 'england' ||
      !product
    ) {
      return;
    }

    const canonicalProduct = getEnglandCanonicalTenancyProduct(product);
    if (!canonicalProduct || canonicalProduct === product) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('product', canonicalProduct);
    params.delete('jurisdiction');
    router.replace(`/wizard/flow?${params.toString()}`);
  }, [editCaseId, jurisdiction, product, publicJurisdictionBlocked, router, searchParams, type]);

  useEffect(() => {
    if (publicJurisdictionBlocked) {
      router.replace(getPublicProductOwnerHref(product, type));
      return;
    }

    if (!editCaseId && product && isRetiredPublicSku(product)) {
      router.replace(getRetiredPublicSkuRedirectDestination(product) ?? '/products/ast');
      return;
    }

    if (!editCaseId && product && product !== 'tenancy_agreement' && !isPubliclyStartableProduct(product)) {
      router.replace(getPublicProductOwnerHref(product, type));
      return;
    }

    if (!hasRequiredParams) {
      router.push('/wizard');
    }
  }, [editCaseId, hasRequiredParams, product, publicJurisdictionBlocked, router, type]);

  // Normalize product for Ask Heaven / wizard - use effectiveProduct (order-aware)
  const isPaidLegacyEnglandTenancy =
    paidOrderProduct === 'ast_standard' || paidOrderProduct === 'ast_premium';
  const canonicalEnglandProduct =
    jurisdiction === 'england' && !isPaidLegacyEnglandTenancy
      ? getEnglandCanonicalTenancyProduct(effectiveProduct)
      : null;
  const normalizedProduct = canonicalEnglandProduct ?? effectiveProduct;
  const isResidentialStandaloneProduct = isResidentialStandaloneTenancyProduct(
    normalizedProduct
  );
  const showEnglandTenancyChooser =
    type === 'tenancy_agreement' &&
    jurisdiction === 'england' &&
    !editCaseId &&
    effectiveProduct === 'tenancy_agreement';
  const showEnglandEvictionProductChooser =
    type === 'eviction' &&
    jurisdiction === 'england' &&
    !editCaseId &&
    mode !== 'edit' &&
    searchParams.get('entry') !== 'steps';
  const evictionFlowProduct =
    type === 'eviction'
      ? normalizedProduct === 'notice_only'
        ? 'notice_only'
        : normalizedProduct === 'complete_pack'
          ? 'complete_pack'
          : product === 'notice_only'
            ? 'notice_only'
            : 'complete_pack'
      : null;
  const tenancyFlowProduct: TenancyFlowProduct =
    normalizedProduct === 'ast_standard' ||
    normalizedProduct === 'ast_premium' ||
    normalizedProduct === 'tenancy_agreement'
      ? normalizedProduct
      : isResidentialLettingProductSku(normalizedProduct)
        ? normalizedProduct
        : 'tenancy_agreement';

  // Derive a coarse product label for Ask Heaven (its Product union)
  const askHeavenProduct: AskHeavenProduct | null = (() => {
    if (!type) return null;

    if (type === 'money_claim') return 'money_claim';
    if (type === 'tenancy_agreement') return 'tenancy_agreement';
    if (type === 'rent_increase') return null;

    if (type === 'eviction') {
      // For eviction flows, we treat Ask Heaven product as either notice_only or complete_pack
      return evictionFlowProduct;
    }

    return null;
  })();

  // Track wizard_start on mount with dedupe
  // This fires when user actually reaches the flow page (not just clicks start)
  const hasTrackedStartRef = useRef(false);

  useEffect(() => {
    // Only track once per component mount AND per session
    if (hasTrackedStartRef.current) return;
    if (!hasRequiredParams || !jurisdiction) return;
    if (showEnglandEvictionProductChooser) return;

    const trackingProduct = normalizedProduct || product;
    if (!trackingProduct) return;

    const flowTrackingContext = {
      type,
      product: trackingProduct,
      jurisdiction,
      caseId: editCaseId,
    };

    // Check if wizard_start was already fired this session (prevents duplicate on refresh)
    if (hasWizardStarted(flowTrackingContext)) {
      hasTrackedStartRef.current = true;
      return;
    }

    const { sessionId } = getOrCreateWizardFlowSession(flowTrackingContext);

    // Update attribution with URL params (in case user deep-linked directly to /wizard/flow)
    const urlAttribution = extractAttributionFromUrl(searchParams);
    const attribution = setWizardAttribution({
      ...urlAttribution,
      product: trackingProduct,
      jurisdiction,
    });

    // Track wizard_start with full attribution
    trackWizardStartWithAttribution({
      product: trackingProduct,
      jurisdiction,
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
      flowSessionId: sessionId,
    });

    // Mark as started to prevent duplicates
    markWizardStarted(flowTrackingContext);
    hasTrackedStartRef.current = true;
  }, [
    evictionFlowProduct,
    editCaseId,
    hasRequiredParams,
    jurisdiction,
    normalizedProduct,
    product,
    searchParams,
    showEnglandEvictionProductChooser,
    type,
  ]);

  // Initialize case for structured wizard / section flows
  const startStructuredWizard = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (!type || !jurisdiction) return;

    setLoading(true);
    setStartError(null);

    try {
      if (publicJurisdictionBlocked) {
        router.replace(getPublicProductOwnerHref(product, type));
        return;
      }

      if (!editCaseId && product && isRetiredPublicSku(product)) {
        router.replace(getRetiredPublicSkuRedirectDestination(product) ?? '/products/ast');
        return;
      }

      // Resume existing case if editing
      if (editCaseId) {
        if (type === 'rent_increase' && recoveryToken) {
          const recoveryResponse = await fetch('/api/section13/recover', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getSessionTokenHeaders(),
            },
            body: JSON.stringify({
              caseId: editCaseId,
              recoveryToken,
            }),
          });

          const recoveryData = await recoveryResponse.json().catch(() => ({}));
          if (!recoveryResponse.ok) {
            const message =
              recoveryData?.error || 'This recovery link could not be used. Please request a new link.';
            setStartError(message);
            throw new Error(message);
          }

          const params = new URLSearchParams(searchParams.toString());
          params.delete('recovery_token');
          router.replace(`/wizard/flow?${params.toString()}`);
        }

        setCaseId(editCaseId);
        setLoading(false);
        return;
      }

      // Prefer product_variant (from product page) then product, then sensible defaults
      const rawProduct = productVariant || product;

      let startProduct: string;

      if (type === 'money_claim') {
        // Money claim flows: use money_claim product
        startProduct = rawProduct === 'money_claim' ? rawProduct : 'money_claim';
      } else if (type === 'rent_increase') {
        startProduct =
          rawProduct === 'section13_defensive' || rawProduct === 'section13_standard'
            ? rawProduct
            : 'section13_standard';
      } else if (type === 'tenancy_agreement') {
        // Tenancy flows: keep AST tiers if provided
        if (
          rawProduct &&
          (rawProduct === 'ast_standard' ||
            rawProduct === 'ast_premium' ||
            rawProduct === 'tenancy_agreement' ||
            isResidentialStandaloneTenancyProduct(rawProduct))
        ) {
          startProduct =
            jurisdiction === 'england' && !editCaseId
              ? getEnglandCanonicalTenancyProduct(rawProduct) ?? rawProduct
              : rawProduct;
        } else {
          startProduct = 'tenancy_agreement';
        }
      } else if (type === 'eviction') {
        // Eviction flows: honour notice_only / complete_pack explicitly
        if (rawProduct === 'notice_only' || rawProduct === 'complete_pack') {
          startProduct = rawProduct;
        } else {
          // Sensible default if someone deep-links without a product
          startProduct = 'complete_pack';
        }
      } else {
        // Fallback for any other future types
        startProduct = rawProduct || type || 'tenancy_agreement';
      }

      setEffectiveProduct(startProduct);

      const response = await fetch('/api/wizard/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSessionTokenHeaders(),
        },
        body: JSON.stringify({
          product: startProduct,
          jurisdiction,
          requested_product: rawProduct || startProduct,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.redirect_to) {
          router.replace(data.redirect_to);
          return;
        }
        const message = data?.error || `Failed to start wizard: ${response.status}`;
        setStartError(message);
        throw new Error(message);
      }

      const newCaseId = data.case_id ?? data.case?.id;
      if (!newCaseId) {
        throw new Error('Missing case_id from start response');
      }

      setCaseId(newCaseId);
      setInitialQuestion(data.next_question ?? null);
    } catch (err) {
      console.error('Failed to initialize case:', err);
    } finally {
      setLoading(false);
    }
  }, [editCaseId, jurisdiction, product, productVariant, publicJurisdictionBlocked, recoveryToken, router, searchParams, type]);

  useEffect(() => {
    if (!hasRequiredParams) {
      setLoading(false);
      return;
    }

    // All supported case types now use structured / section flows
    if (showEnglandTenancyChooser || showEnglandEvictionProductChooser) {
      setLoading(false);
      return;
    }

    if (type === 'tenancy_agreement' || type === 'money_claim' || type === 'eviction' || type === 'rent_increase') {
      void startStructuredWizard();
    } else if (editCaseId) {
      setCaseId(editCaseId);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [
    editCaseId,
    hasRequiredParams,
    showEnglandEvictionProductChooser,
    showEnglandTenancyChooser,
    startStructuredWizard,
    type,
  ]);

  // Validate params
  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid parameters. Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleComplete = (completedCaseId: string) => {
    // For eviction cases, all products now go through the review page for analysis
    if (type === 'eviction') {
      const productParam = evictionFlowProduct ?? 'complete_pack';
      router.push(`/wizard/review?case_id=${completedCaseId}&product=${productParam}`);
      return;
    }

    // For money claim cases, go to review page (same as eviction complete_pack flow)
    if (type === 'money_claim') {
      router.push(`/wizard/review?case_id=${completedCaseId}&product=money_claim`);
      return;
    }

    // For tenancy agreements, go to review page for validation and obligations reminder
    if (type === 'tenancy_agreement') {
      const productParam = isResidentialStandaloneProduct
        ? normalizedProduct ?? 'tenancy_agreement'
        : askHeavenProduct ?? 'ast_standard';
      router.push(`/wizard/review?case_id=${completedCaseId}&product=${productParam}`);
      return;
    }

    if (type === 'rent_increase') {
      const previewParams = new URLSearchParams();
      const section13Product =
        normalizedProduct === 'section13_defensive' ? 'section13_defensive' : 'section13_standard';
      previewParams.set('product', section13Product);
      previewParams.set('jurisdiction', 'england');
      router.push(`/wizard/preview/${completedCaseId}?${previewParams.toString()}`);
      return;
    }

    // Navigate to preview/checkout page for any other case types
    router.push(`/wizard/preview/${completedCaseId}`);
  };

  const handleSelectEnglandProduct = (selectedProduct: EnglandModernTenancyProductSku) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', 'tenancy_agreement');
    params.set('product', selectedProduct);
    params.delete('jurisdiction');
    params.delete('case_id');
    router.push(`/wizard/flow?${params.toString()}`);
  };

  const handleStartEnglandEvictionFlow = (selectedProduct: 'notice_only' | 'complete_pack') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', 'eviction');
    params.set('product', PUBLIC_PRODUCT_DESCRIPTORS[selectedProduct].productType);
    params.set('entry', 'steps');
    params.delete('jurisdiction');
    params.delete('case_id');
    router.push(`/wizard/flow?${params.toString()}`);
  };

  const renderEnglandEvictionChooser = () => {
    if (type !== 'eviction' || jurisdiction !== 'england') {
      return null;
    }

    const activeProduct = evictionFlowProduct === 'notice_only' ? 'notice_only' : 'complete_pack';
    const productChoices = [
      {
        key: 'notice_only' as const,
        title: 'Eviction Notice Generator',
        subtitle: 'Section 8, May 2026',
        description:
          'Choose this if you need the Form 3A notice, service instructions, service and validity checklist, pre-service compliance declaration, and rent schedule / arrears statement before you serve anything.',
      },
      {
        key: 'complete_pack' as const,
        title: 'Complete Eviction Pack',
        subtitle: 'Notice through court possession',
        description:
          'Choose this if you want the Form 3A notice, N5, N119, and the full court-ready possession paperwork working together from the start.',
      },
    ];

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              England eviction wizard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Choose the pack you want to start with
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Pick the Section 8 notice generator if you need the notice-stage documents first, or
              go straight into the full court possession pack if you want the notice and court
              paperwork joined up from the start.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Your questions start on the first real step after you choose a product.
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {productChoices.map((choice) => {
                const isActive = activeProduct === choice.key;

                return (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => handleStartEnglandEvictionFlow(choice.key)}
                    className={`group rounded-[1.75rem] border p-5 text-left transition ${
                      isActive
                        ? 'border-violet-500 bg-[linear-gradient(135deg,#7C3AED_0%,#5B21B6_100%)] text-white shadow-[0_20px_50px_rgba(91,33,182,0.3)]'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold">{choice.title}</div>
                        <div className={`mt-1 text-sm ${isActive ? 'text-violet-100' : 'text-slate-500'}`}>
                          {choice.subtitle}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          isActive ? 'bg-white/15 text-white' : 'bg-violet-100 text-violet-700'
                        }`}
                      >
                        {isActive ? 'Selected' : 'Choose'}
                      </span>
                    </div>
                    <p className={`mt-4 text-sm leading-6 ${isActive ? 'text-violet-50' : 'text-slate-600'}`}>
                      {choice.description}
                    </p>
                    <div
                      className={`mt-6 inline-flex items-center text-sm font-semibold ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {isActive ? 'Continue to the first step' : 'Start with this pack'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">What changes next</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The wizard will move into the real questions after this screen. Notice Only starts
                with Section 8 notice basics. Complete Pack starts with the possession route and
                court-pack overview. The product switcher will not keep following you through every
                step.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while initializing or checking order status
  if (loading || !caseId || !orderCheckDone) {
    if (showEnglandTenancyChooser && !editCaseId) {
      return <EnglandTenancyProductChooser onSelect={handleSelectEnglandProduct} />;
    }

    if (showEnglandEvictionProductChooser) {
      return renderEnglandEvictionChooser();
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Initializing wizard...</p>
          {startError ? (
            <p className="text-sm text-red-600 text-center max-w-md">{startError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (showEnglandTenancyChooser) {
    return <EnglandTenancyProductChooser onSelect={handleSelectEnglandProduct} />;
  }

  if (showEnglandEvictionProductChooser) {
    return renderEnglandEvictionChooser();
  }

  // 🟦 NEW: For money_claim, use the section-based premium flow
  if (type === 'money_claim') {
    // Get topic param to pass to flow for pre-selecting claim reasons (legacy)
    const topicParam = searchParams.get('topic') || undefined;
    // Get reason param for SEO landing page pre-selection (e.g. reason=property_damage,cleaning)
    const reasonParam = searchParams.get('reason') || undefined;

    return (
      <MoneyClaimSectionFlow
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales' | 'scotland'}
        topic={topicParam}
        reason={reasonParam}
      />
    );
  }

  if (
    type === 'rent_increase' &&
    jurisdiction === 'england'
  ) {
    return (
      <Section13WizardFlow
        caseId={caseId}
        jurisdiction="england"
        product={
          normalizedProduct === 'section13_defensive'
            ? 'section13_defensive'
            : 'section13_standard'
        }
      />
    );
  }

  // 🟩 NEW: For eviction complete_pack in England/Wales/Scotland, use the redesigned section-based flow
  // This provides a logical, court-ready, jurisdiction-aware wizard experience.
  // Scotland support added: uses Scotland-specific sections (grounds, tribunal) and 6-month rule validation.
  if (
    type === 'eviction' &&
    evictionFlowProduct === 'complete_pack' &&
    USE_EVICTION_SECTION_FLOW &&
    (jurisdiction === 'england' || jurisdiction === 'wales' || jurisdiction === 'scotland')
  ) {
    return (
      <EvictionSectionFlow
        key={`eviction-${evictionFlowProduct}-${caseId}`}
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales' | 'scotland'}
      />
    );
  }

  // 🟨 NEW: For eviction notice_only in England/Wales/Scotland, use the redesigned section-based flow
  // This matches the EvictionSectionFlow design for UI consistency.
  if (
    type === 'eviction' &&
    evictionFlowProduct === 'notice_only' &&
    USE_NOTICE_ONLY_SECTION_FLOW &&
    (jurisdiction === 'england' || jurisdiction === 'wales' || jurisdiction === 'scotland')
  ) {
    return (
      <NoticeOnlySectionFlow
        key={`notice-only-${evictionFlowProduct}-${caseId}`}
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales' | 'scotland'}
      />
    );
  }

  if (
    type === 'tenancy_agreement' &&
    USE_TENANCY_SECTION_FLOW &&
    isResidentialStandaloneProduct &&
    jurisdiction === 'england' &&
    normalizedProduct
  ) {
    return (
      <ResidentialStandaloneSectionFlow
        caseId={caseId}
        jurisdiction="england"
        product={normalizedProduct as ResidentialLettingProductSku}
      />
    );
  }

  // 🟪 NEW: For core tenancy_agreement in England/Wales/Scotland/NI, use the redesigned section-based flow
  // This provides a consistent tab-based UI matching MoneyClaimSectionFlow design.
  if (
    type === 'tenancy_agreement' &&
    USE_TENANCY_SECTION_FLOW &&
    (jurisdiction === 'england' ||
      jurisdiction === 'wales' ||
      jurisdiction === 'scotland' ||
      jurisdiction === 'northern-ireland')
  ) {
    return (
      <TenancySectionFlow
        caseId={caseId}
        jurisdiction={jurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland'}
        product={tenancyFlowProduct}
        highlightedSections={highlightedTenancySections}
      />
    );
  }

  // Use existing StructuredWizard for NI eviction flows (tenancy agreements now use TenancySectionFlow above)
  // Note: Scotland eviction complete_pack now uses EvictionSectionFlow (above)
  if (type === 'tenancy_agreement' || type === 'eviction') {
    return (
      <StructuredWizard
        caseId={caseId}
        caseType={type}
        jurisdiction={jurisdiction}
        product={
          type === 'tenancy_agreement'
            ? (askHeavenProduct ?? 'tenancy_agreement')
            : (evictionFlowProduct === 'notice_only' ? 'notice_only' : 'complete_pack')
        }
        initialQuestion={initialQuestion ?? undefined}
        onComplete={handleComplete}
        mode={mode === 'edit' ? 'edit' : 'default'}
        jumpToQuestionId={jumpTo ?? undefined}
        fixMode={fixMode}
      />
    );
  }

  // Fallback – should rarely be hit with current routing
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Unsupported case type.</p>
      </div>
    </div>
  );
}

export default function WizardFlowPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Loading wizard...</p>
            </div>
          </div>
        }
      >
        <WizardFlowContent />
      </Suspense>
    </>
  );
}
