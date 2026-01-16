/**
 * AskHeavenSection Component
 *
 * Consistent "Ask Heaven — Your Landlord Legal Assistant" section
 * used across product, template, and tool pages.
 *
 * CONCRETE FEATURES (as of Jan 2026):
 * - Helps choose the correct route/notice for your jurisdiction
 * - Explains what you can/can't do legally (plain English)
 * - Highlights common compliance blockers
 * - Auto-calculates notice periods and dates
 * - Explains what to do next and what evidence courts/tribunals require
 *
 * DISCLAIMER (always included):
 * "Ask Heaven provides guidance and document-preparation support.
 * It is not a solicitor and does not provide legal representation."
 */

import { Sparkles, Compass, ShieldCheck, Calendar, FileText, AlertCircle } from 'lucide-react';

export interface AskHeavenSectionProps {
  /** Variant: full for product pages, compact for tools/validators */
  variant?: 'full' | 'compact' | 'banner';
  /** Optional custom title */
  title?: string;
  /** Product context for tailored messaging */
  product?: 'notice_only' | 'complete_pack' | 'money_claim' | 'ast' | 'general';
}

export function AskHeavenSection({
  variant = 'full',
  title = 'Ask Heaven — Your Landlord Legal Assistant',
  product = 'general',
}: AskHeavenSectionProps) {
  const features = getProductFeatures(product);

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-primary/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-charcoal mb-2">
              Ask Heaven Legal Assistant (Included)
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              Get guidance on choosing the correct route, avoiding compliance blockers, and
              understanding what evidence courts require.
            </p>
            <p className="text-xs text-gray-500 italic">
              Ask Heaven provides guidance and document-preparation support. It is not a solicitor
              and does not provide legal representation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-purple-50 rounded-lg border border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-charcoal">{title}</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700 mb-4">
          {features.slice(0, 4).map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 italic">
          Ask Heaven provides guidance and document-preparation support. It is not a solicitor and
          does not provide legal representation.
        </p>
      </div>
    );
  }

  // Full variant
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">{title}</h2>
          <p className="text-xl text-gray-700">
            AI-powered guidance throughout your landlord journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-charcoal">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="bg-white/80 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <strong>Important:</strong> Ask Heaven provides guidance and document-preparation
            support. It is not a solicitor and does not provide legal representation. For complex
            legal matters, consult a qualified solicitor.
          </p>
        </div>
      </div>
    </section>
  );
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function getProductFeatures(product: string): Feature[] {
  const commonFeatures: Feature[] = [
    {
      icon: <Compass className="w-5 h-5 text-primary" />,
      title: 'Route Selection',
      text: 'Helps choose the correct route and notice type for your jurisdiction (England, Wales, or Scotland)',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      title: 'Compliance Blockers',
      text: 'Highlights common issues like missing deposit protection, EPC, gas safety certificates, or How to Rent',
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      title: 'Date Calculation',
      text: 'Auto-calculates notice periods, earliest possession dates, and deadline reminders',
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: 'Evidence Guidance',
      text: 'Explains what evidence courts and tribunals require for your specific case and grounds',
    },
  ];

  if (product === 'notice_only') {
    return [
      ...commonFeatures,
      {
        icon: <Sparkles className="w-5 h-5 text-primary" />,
        title: 'Ground Selection',
        text: 'Recommends the strongest eviction grounds based on your situation and jurisdiction',
      },
    ];
  }

  if (product === 'complete_pack') {
    return [
      ...commonFeatures,
      {
        icon: <Sparkles className="w-5 h-5 text-primary" />,
        title: 'Court Form Guidance',
        text: 'Explains which court forms are needed and how to fill them correctly for your jurisdiction',
      },
    ];
  }

  if (product === 'money_claim') {
    return [
      {
        icon: <Compass className="w-5 h-5 text-primary" />,
        title: 'Claim Strategy',
        text: 'Helps structure your money claim with clear particulars and accurate interest calculations',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-primary" />,
        title: 'PAP-DEBT Compliance',
        text: 'Ensures your pre-action documents meet Pre-Action Protocol requirements',
      },
      {
        icon: <Calendar className="w-5 h-5 text-primary" />,
        title: 'Timeline Guidance',
        text: 'Explains court timelines, response deadlines, and enforcement options',
      },
      {
        icon: <FileText className="w-5 h-5 text-primary" />,
        title: 'Enforcement Options',
        text: 'Guides you through bailiffs, wage attachment, and charging orders after judgment',
      },
    ];
  }

  if (product === 'ast') {
    return [
      {
        icon: <Compass className="w-5 h-5 text-primary" />,
        title: 'Agreement Type',
        text: 'Selects the correct agreement type for your jurisdiction (AST, Occupation Contract, PRT, or NI Private Tenancy)',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-primary" />,
        title: 'Compliance Requirements',
        text: 'Highlights deposit protection rules, prescribed information, and mandatory documents',
      },
      {
        icon: <Calendar className="w-5 h-5 text-primary" />,
        title: 'Term Configuration',
        text: 'Helps configure tenancy terms, rent amounts, and payment schedules',
      },
      {
        icon: <FileText className="w-5 h-5 text-primary" />,
        title: 'Clause Selection',
        text: 'Recommends appropriate clauses for your property type and tenancy situation',
      },
    ];
  }

  return commonFeatures;
}

export default AskHeavenSection;
