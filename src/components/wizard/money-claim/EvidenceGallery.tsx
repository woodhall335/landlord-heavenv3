'use client';

import React, { useState } from 'react';
import {
  RiImageLine,
  RiFileTextLine,
  RiMoneyPoundCircleLine,
  RiExpandUpDownLine,
  RiCheckLine,
  RiCloseLine,
  RiInformationLine,
} from 'react-icons/ri';

interface EvidenceExample {
  id: string;
  title: string;
  category: 'rent_ledger' | 'damage_photos' | 'invoice';
  goodExample: {
    description: string;
    features: string[];
  };
  badExample: {
    description: string;
    issues: string[];
  };
  tips: string[];
}

const EVIDENCE_EXAMPLES: EvidenceExample[] = [
  {
    id: 'rent_ledger',
    title: 'Rent Ledger / Payment Record',
    category: 'rent_ledger',
    goodExample: {
      description: 'Clear spreadsheet showing each rental period with dates, amounts due, amounts paid, and running balance.',
      features: [
        'Date range clearly shown (e.g., "1 Jan 2025 - 31 Jan 2025")',
        'Rent due amount matches tenancy agreement',
        'Payments received with exact dates',
        'Running balance calculated correctly',
        'Matches bank statement entries',
        'Tenant name and property address included',
      ],
    },
    badExample: {
      description: 'Handwritten notes with approximate dates and rounded figures.',
      issues: [
        'No specific dates ("around March")',
        'Rounded amounts ("about £500")',
        'No reference to bank records',
        'Missing periods or gaps',
        'Doesn\'t match stated rent amount',
      ],
    },
    tips: [
      'Export from property management software if you use one',
      'Cross-reference with bank statements',
      'Include partial payments - don\'t just show zeros',
      'Courts prefer itemised schedules to lump sum statements',
    ],
  },
  {
    id: 'damage_photos',
    title: 'Property Damage Photos',
    category: 'damage_photos',
    goodExample: {
      description: 'Clear, well-lit photos showing the specific damage with context, dated and labelled.',
      features: [
        'Taken in good lighting - damage clearly visible',
        'Shows the whole item/area plus close-up detail',
        'Date stamped or file metadata preserved',
        'Location in property is clear (e.g., "Master bedroom carpet")',
        'Comparison with check-in photo if available',
        'Multiple angles where helpful',
      ],
    },
    badExample: {
      description: 'Blurry, poorly lit photos with no context or dating.',
      issues: [
        'Dark or blurry - damage not visible',
        'Too close - can\'t tell what you\'re looking at',
        'No date or location information',
        'Single photo of a large area',
        'Photos taken months after checkout',
      ],
    },
    tips: [
      'Take photos immediately at checkout - same day',
      'Include a ruler or common object for scale',
      'Photograph the room first, then zoom in on damage',
      'Enable date stamps on your camera app',
      'Compare directly with check-in inventory photos',
    ],
  },
  {
    id: 'invoice',
    title: 'Repair Invoices & Quotes',
    category: 'invoice',
    goodExample: {
      description: 'Professional invoice from a registered tradesperson with itemised costs and clear descriptions.',
      features: [
        'Business name, address, and contact details',
        'Invoice number and date',
        'Clear description of work done',
        'Itemised costs (labour, materials)',
        'VAT registration number if applicable',
        'Property address referenced',
      ],
    },
    badExample: {
      description: 'Handwritten receipt with just a total amount and no business details.',
      issues: [
        'No business name or contact details',
        'Just a total - no breakdown',
        'Vague description ("repair work")',
        'No date or invoice number',
        'Can\'t verify it\'s genuine',
      ],
    },
    tips: [
      'Get at least one professional quote for each repair',
      'Ask for itemised invoices, not just totals',
      'Keep receipts for materials you bought yourself',
      'If claiming cleaning, get from a professional company',
      'Courts prefer invoices to estimates where possible',
    ],
  },
];

const CATEGORY_ICONS = {
  rent_ledger: RiFileTextLine,
  damage_photos: RiImageLine,
  invoice: RiMoneyPoundCircleLine,
};

const CATEGORY_COLORS = {
  rent_ledger: 'bg-blue-50 border-blue-200 text-blue-700',
  damage_photos: 'bg-purple-50 border-purple-200 text-purple-700',
  invoice: 'bg-green-50 border-green-200 text-green-700',
};

interface EvidenceExampleCardProps {
  example: EvidenceExample;
  defaultExpanded?: boolean;
}

function EvidenceExampleCard({ example, defaultExpanded = false }: EvidenceExampleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = CATEGORY_ICONS[example.category];
  const colorClass = CATEGORY_COLORS[example.category];

  return (
    <div className={`rounded-lg border ${colorClass} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="font-medium text-sm">{example.title}</span>
        </div>
        <RiExpandUpDownLine className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 bg-white/70">
          {/* Good Example */}
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <RiCheckLine className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-800 text-sm">Good Example</span>
            </div>
            <p className="text-sm text-green-900 mb-2">{example.goodExample.description}</p>
            <ul className="space-y-1">
              {example.goodExample.features.map((feature, i) => (
                <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                  <RiCheckLine className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bad Example */}
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <RiCloseLine className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-800 text-sm">Weak Example</span>
            </div>
            <p className="text-sm text-red-900 mb-2">{example.badExample.description}</p>
            <ul className="space-y-1">
              {example.badExample.issues.map((issue, i) => (
                <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                  <RiCloseLine className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <RiInformationLine className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-800 text-sm">Tips</span>
            </div>
            <ul className="space-y-1">
              {example.tips.map((tip, i) => (
                <li key={i} className="text-xs text-amber-800">• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface EvidenceGalleryProps {
  /** Filter to show only specific categories */
  filterCategories?: ('rent_ledger' | 'damage_photos' | 'invoice')[];
  /** Start with all cards expanded */
  defaultExpanded?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
}

/**
 * Evidence Gallery Component
 *
 * Shows static examples of good vs weak evidence to help landlords
 * understand what makes strong supporting documentation.
 *
 * Can be filtered by category and used in compact mode for inline hints.
 */
export function EvidenceGallery({
  filterCategories,
  defaultExpanded = false,
  compact = false,
}: EvidenceGalleryProps) {
  const examples = filterCategories
    ? EVIDENCE_EXAMPLES.filter((ex) => filterCategories.includes(ex.category))
    : EVIDENCE_EXAMPLES;

  if (compact) {
    return (
      <div className="space-y-2">
        {examples.map((example) => (
          <EvidenceExampleCard key={example.id} example={example} defaultExpanded={defaultExpanded} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <RiImageLine className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Evidence Examples</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Strong evidence significantly improves your chances of success. Click each category to see
        what makes good vs weak evidence.
      </p>
      <div className="space-y-3">
        {examples.map((example) => (
          <EvidenceExampleCard key={example.id} example={example} defaultExpanded={defaultExpanded} />
        ))}
      </div>
    </div>
  );
}

/**
 * Get relevant evidence categories for claim types
 */
export function getRelevantEvidenceCategories(
  claimTypes: string[]
): ('rent_ledger' | 'damage_photos' | 'invoice')[] {
  const categories: Set<'rent_ledger' | 'damage_photos' | 'invoice'> = new Set();

  if (claimTypes.includes('rent_arrears')) {
    categories.add('rent_ledger');
  }

  if (
    claimTypes.includes('property_damage') ||
    claimTypes.includes('cleaning')
  ) {
    categories.add('damage_photos');
    categories.add('invoice');
  }

  if (
    claimTypes.includes('unpaid_utilities') ||
    claimTypes.includes('unpaid_council_tax') ||
    claimTypes.includes('other_tenant_debt')
  ) {
    categories.add('invoice');
  }

  return Array.from(categories);
}

export default EvidenceGallery;
