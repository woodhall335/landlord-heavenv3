/**
 * Wizard Selection Page
 *
 * Entry point for the conversational wizard
 * Users select document type and jurisdiction, then start the guided flow
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Container, TealHero } from '@/components/ui';
import { clsx } from 'clsx';

interface DocumentOption {
  type: 'eviction' | 'money_claim' | 'tenancy_agreement';
  title: string;
  description: string;
  icon: string;
  price: string;
  popular?: boolean;
}

interface JurisdictionOption {
  value: 'england-wales' | 'scotland' | 'northern-ireland';
  label: string;
  flag: string;
}

const documentOptions: DocumentOption[] = [
  {
    type: 'eviction',
    title: 'Eviction Pack',
    description: 'Complete eviction bundle from notice to possession order',
    icon: '🏠',
    price: 'From £29.99',
    popular: true,
  },
  {
    type: 'tenancy_agreement',
    title: 'Tenancy Agreement',
    description: 'Standard or Premium AST - create a compliant tenancy agreement',
    icon: '📝',
    price: 'From £39.99',
  },
  {
    type: 'money_claim',
    title: 'Money Claim',
    description: 'Recover rent arrears or damages - complete claim pack with all forms',
    icon: '💰',
    price: '£179.99',
  },
];

const jurisdictions: JurisdictionOption[] = [
  { value: 'england-wales', label: 'England & Wales', flag: '🏴' },
  { value: 'scotland', label: 'Scotland', flag: '🏴' },
  { value: 'northern-ireland', label: 'Northern Ireland', flag: '🇬🇧' },
];

// Map product parameter to document type
function mapProductToDocumentType(product: string): 'eviction' | 'money_claim' | 'tenancy_agreement' | null {
  switch (product) {
    case 'complete_pack':
    case 'notice_only':
      return 'eviction';
    case 'money_claim':
    case 'money_claim_england_wales':
    case 'money_claim_scotland':
      return 'money_claim';
    case 'ast_standard':
    case 'ast_premium':
      return 'tenancy_agreement';
    default:
      return null;
  }
}

function mapProductToJurisdiction(product: string): JurisdictionOption['value'] | null {
  switch (product) {
    case 'money_claim_england_wales':
      return 'england-wales';
    case 'money_claim_scotland':
      return 'scotland';
    default:
      return null;
  }
}

function normalizeProductForWizard(
  product: string | null,
  documentType: DocumentOption['type']
): string | null {
  if (documentType === 'money_claim') {
    if (product === 'money_claim_england_wales' || product === 'money_claim_scotland') {
      return 'money_claim';
    }
    return product ?? 'money_claim';
  }

  return product;
}

export default function WizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');
  const preselectedDocument = useMemo(() => {
    if (!productParam) return null;

    const docType = mapProductToDocumentType(productParam);
    return docType ? documentOptions.find((d) => d.type === docType) ?? null : null;
  }, [productParam]);

  const preselectedJurisdiction = useMemo(() => {
    if (!productParam) return null;
    const mapped = mapProductToJurisdiction(productParam);
    return mapped ? jurisdictions.find((j) => j.value === mapped) ?? null : null;
  }, [productParam]);

  const [selectedDocument, setSelectedDocument] = useState<DocumentOption | null>(preselectedDocument);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionOption | null>(preselectedJurisdiction);
  const [step, setStep] = useState<1 | 2>(preselectedDocument ? 2 : 1);

  const isJurisdictionSupported = (jur: JurisdictionOption) => {
    if (!selectedDocument) return true;

    // Money claims: Available in England & Wales and Scotland, NOT in Northern Ireland
    if (selectedDocument.type === 'money_claim' && jur.value === 'northern-ireland') {
      return false;
    }

    // Evictions: NOT available in Northern Ireland
    if (selectedDocument.type !== 'tenancy_agreement' && jur.value === 'northern-ireland') {
      return false;
    }

    return true;
  };

  const selectedComboUnsupported =
    !!selectedDocument &&
    !!selectedJurisdiction &&
    ((selectedDocument.type === 'money_claim' && selectedJurisdiction.value === 'northern-ireland') ||
      (selectedDocument.type !== 'tenancy_agreement' && selectedJurisdiction.value === 'northern-ireland'));

  const getUnsupportedCopy = (jur: JurisdictionOption) => {
    // Money claim: differentiate Scotland vs Northern Ireland
    if (selectedDocument?.type === 'money_claim' && jur.value === 'northern-ireland') {
      return 'Eviction and money claim flows are unavailable here. Tenancy agreements only.';
    }

    // Non-tenancy flows in Northern Ireland (eviction etc.)
    if (selectedDocument && selectedDocument.type !== 'tenancy_agreement' && jur.value === 'northern-ireland') {
      return 'Eviction and money claim flows are unavailable here. Tenancy agreements only.';
    }

    return '';
  };

  const selectedUnsupportedCopy = selectedJurisdiction ? getUnsupportedCopy(selectedJurisdiction) : '';

  const handleDocumentSelect = (doc: DocumentOption) => {
    setSelectedDocument(doc);
    setStep(2);
  };

  const handleJurisdictionSelect = (jur: JurisdictionOption) => {
    setSelectedJurisdiction(jur);
  };

  const handleStart = () => {
    if (selectedDocument && selectedJurisdiction) {
      if (selectedComboUnsupported) return;

      // Get product parameter to pass through
      const productParam = searchParams.get('product');
      const normalizedProduct = normalizeProductForWizard(productParam, selectedDocument.type);

      const urlParams = new URLSearchParams({
        type: selectedDocument.type,
        jurisdiction: selectedJurisdiction.value,
      });

      if (normalizedProduct) {
        urlParams.set('product', normalizedProduct);
      }

      if (
        selectedDocument.type === 'money_claim' &&
        productParam &&
        (productParam === 'money_claim_england_wales' || productParam === 'money_claim_scotland') &&
        normalizedProduct !== productParam
      ) {
        urlParams.set('product_variant', productParam);
      }

      const url = `/wizard/flow?${urlParams.toString()}`;

      router.push(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TealHero
        title="Eviction Route Checker"
        subtitle="A calm, guided workspace with guardrails for every UK jurisdiction."
        eyebrow="Wizard"
        actions={
          <Badge variant="success" size="large" className="bg-white/15 text-white">
            Conversational + compliant
          </Badge>
        }
      />
      <Container size="large" className="py-12">
        {/* Step Indicator */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex items-center justify-center gap-4">
            <div
              className={clsx(
                'flex items-center gap-2',
                step === 1 ? 'text-primary' : 'text-gray-400',
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 1 ? 'bg-primary text-white' : 'bg-gray-200',
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
                step === 2 ? 'text-primary' : 'text-gray-400',
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 2 ? 'bg-primary text-white' : 'bg-gray-200',
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
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal text-center mb-8">
              What do you need help with?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {documentOptions.map((doc) => (
                <button
                  key={doc.type}
                  onClick={() => handleDocumentSelect(doc)}
                  className={clsx(
                    'relative p-6 rounded-xl border-2 transition-all duration-200 text-left',
                    'hover:shadow-lg hover:scale-105',
                    selectedDocument?.type === doc.type
                      ? 'border-primary bg-primary-subtle shadow-md'
                      : 'border-gray-300 bg-white hover:border-primary',
                  )}
                >
                  {doc.popular && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="primary" size="small">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-4xl mb-4">{doc.icon}</div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 min-h-12">
                    {doc.description}
                  </p>
                  <div className="text-primary font-semibold">{doc.price}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Jurisdiction Selection */}
        {step === 2 && selectedDocument && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="mb-6 text-gray-600 hover:text-primary transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to document selection
            </button>

            <h2 className="text-2xl font-bold text-charcoal text-center mb-2">
              Where is the property located?
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Different rules apply in each jurisdiction
            </p>

            <div className="space-y-4">
              {jurisdictions.map((jur) => (
                <button
                  key={jur.value}
                  onClick={() => isJurisdictionSupported(jur) && handleJurisdictionSelect(jur)}
                  disabled={!isJurisdictionSupported(jur)}
                  className={clsx(
                    'w-full p-6 rounded-xl border-2 transition-all duration-200 text-left',
                    'flex items-center gap-4',
                    !isJurisdictionSupported(jur) && 'opacity-60 cursor-not-allowed',
                    selectedJurisdiction?.value === jur.value
                      ? 'border-primary bg-primary-subtle shadow-md'
                      : 'border-gray-300 bg-white hover:border-primary hover:shadow-sm',
                  )}
                >
                  <div className="text-4xl">{jur.flag}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal">{jur.label}</h3>
                    {!isJurisdictionSupported(jur) && (
                      <p className="text-sm text-red-600 mt-1">{getUnsupportedCopy(jur)}</p>
                    )}
                  </div>
                  {selectedJurisdiction?.value === jur.value && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Start Button */}
            {selectedJurisdiction && (
              <div className="mt-8 text-center">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleStart}
                  disabled={selectedComboUnsupported}
                >
                  Start Wizard →
                </Button>
                {selectedComboUnsupported && (
                  <p className="text-sm text-red-600 mt-3">{selectedUnsupportedCopy}</p>
                )}
                <p className="text-sm text-gray-600 mt-3">This will take about 5-10 minutes</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
