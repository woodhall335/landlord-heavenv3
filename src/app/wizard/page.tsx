/**
 * Wizard Selection Page
 *
 * Entry point for the conversational wizard
 * Users select document type and jurisdiction, then start the guided flow
 */

'use client';

import React, { Suspense, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button, Container, TealHero } from '@/components/ui';
import { clsx } from 'clsx';
import { RiArrowDownLine, RiArrowLeftLine, RiCheckLine } from 'react-icons/ri';

// Product-specific hero content
interface HeroContent {
  title: string;
  subtitle: string;
  eyebrow: string;
}

function getHeroContent(product: string | null): HeroContent {
  switch (product) {
    case 'notice_only':
      return {
        title: 'Serve the Right Possession Notice',
        subtitle: 'Jurisdiction Specific & Validated Notices',
        eyebrow: 'Notice Only',
      };
    case 'complete_pack':
      return {
        title: 'Complete Eviction Pack',
        subtitle: 'From Notice to Possession Order - Everything You Need',
        eyebrow: 'Complete Pack',
      };
    case 'ast_standard':
      return {
        title: 'Standard Tenancy Agreement',
        subtitle: 'Create a Compliant AST for Your Property',
        eyebrow: 'Standard AST',
      };
    case 'ast_premium':
      return {
        title: 'Premium Tenancy Agreement',
        subtitle: 'Comprehensive AST with Enhanced Clauses & Schedules',
        eyebrow: 'Premium AST',
      };
    case 'money_claim':
      return {
        title: 'Money Claim Pack',
        subtitle: 'Recover Rent Arrears & Damages Through the Courts',
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
}

interface JurisdictionOption {
  value: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  label: string;
  flag: string;
}

const documentOptions: DocumentOption[] = [
  {
    type: 'notice_only',
    title: 'Eviction Notices',
    description: 'Section 8, Section 21, and devolved equivalents with service instructions',
    icon: '📄',
    price: 'From £29.99',
  },
  {
    type: 'complete_pack',
    title: 'Complete Eviction Pack',
    description: 'Full bundle from notice to possession order with court forms and guidance',
    icon: '⚖️',
    price: '£149.99',
  },
  {
    type: 'money_claim',
    title: 'Money Claims',
    description: 'Rent arrears claims with evidence checklists and POC templates',
    icon: '💰',
    price: '£179.99',
  },
  {
    type: 'tenancy_agreement',
    title: 'Tenancy Agreements',
    description: 'Compliant ASTs with optional clauses for HMOs and students',
    icon: '📝',
    price: 'From £9.99',
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
function isJurisdictionEnabled(
  jurisdiction: string,
  documentType: DocumentOption['type'] | null
): boolean {
  if (!documentType) {
    return true;
  }

  // Northern Ireland is only supported for tenancy agreements
  if (jurisdiction === 'northern-ireland') {
    return documentType === 'tenancy_agreement';
  }

  return true;
}

// Get disabled reason for a jurisdiction
function getDisabledReason(
  jurisdiction: string,
  documentType: DocumentOption['type'] | null
): string | null {
  if (!documentType) {
    return null;
  }

  if (jurisdiction === 'northern-ireland' && documentType !== 'tenancy_agreement') {
    return 'Eviction and money claim flows are unavailable here. Tenancy agreements only.';
  }

  return null;
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

/**
 * NOTE:
 * useSearchParams() must be rendered under a <Suspense> boundary in Next 15/16
 * to avoid prerender/export build failures ("missing-suspense-with-csr-bailout").
 */
function WizardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');
  const documentSectionRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);

  const preselectedDocument = useMemo(() => {
    if (!productParam) return null;

    const docType = mapProductToDocumentType(productParam);
    return docType ? documentOptions.find((d) => d.type === docType) ?? null : null;
  }, [productParam]);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentOption | null>(preselectedDocument);
  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState<JurisdictionOption | null>(null);
  const [step, setStep] = useState<1 | 2>(preselectedDocument ? 2 : 1);

  // Get product-specific hero content
  const heroContent = getHeroContent(productParam);

  // All jurisdictions are shown, but some may be disabled
  const availableJurisdictions = allJurisdictions;

  // Handle Start Now button - scroll to document selection section
  const handleStartNowClick = () => {
    // Scroll to document selection section
    setTimeout(() => {
      documentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDocumentSelect = (doc: DocumentOption) => {
    setSelectedDocument(doc);
    setStep(2);
  };

  const handleJurisdictionSelect = (jur: JurisdictionOption) => {
    setSelectedJurisdiction(jur);
  };

  const handleStart = () => {
    if (selectedDocument && selectedJurisdiction) {
      const flowType = getWizardFlowType(selectedDocument.type);

      const urlParams = new URLSearchParams({
        type: flowType,
        jurisdiction: selectedJurisdiction.value,
        product: selectedDocument.type,
      });

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
            Start Now
            <RiArrowDownLine className="w-5 h-5 animate-bounce-slow group-hover:translate-y-1 transition-transform text-[#7C3AED]" />
          </button>
        }
      />
      <Container size="large" className="py-12">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {documentOptions.map((doc) => (
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
                  <div className="text-primary font-semibold">{doc.price}</div>
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
              {availableJurisdictions.map((jur) => {
                const enabled = isJurisdictionEnabled(jur.value, selectedDocument?.type ?? null);
                const disabledReason = getDisabledReason(jur.value, selectedDocument?.type ?? null);

                return (
                  <div key={jur.value}>
                    <button
                      onClick={() => enabled && handleJurisdictionSelect(jur)}
                      disabled={!enabled}
                      className={clsx(
                        'w-full p-6 rounded-xl border-2 transition-all duration-200 text-left',
                        'flex items-center gap-4',
                        !enabled && 'opacity-50 cursor-not-allowed',
                        enabled && selectedJurisdiction?.value === jur.value
                          ? 'border-primary bg-primary-subtle shadow-md'
                          : enabled
                            ? 'border-gray-300 bg-white hover:border-primary hover:shadow-sm'
                            : 'border-gray-300 bg-gray-50'
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
                      {enabled && selectedJurisdiction?.value === jur.value && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <RiCheckLine className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                    {!enabled && disabledReason && (
                      <p className="text-sm text-gray-600 mt-2 ml-4">{disabledReason}</p>
                    )}
                  </div>
                );
              })}
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

export default function WizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <WizardPageInner />
    </Suspense>
  );
}
