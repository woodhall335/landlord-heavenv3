/**
 * JurisdictionAccordion Component
 *
 * Shows jurisdiction-specific documents/forms for each product.
 * Helps users understand exactly what they get for their jurisdiction.
 *
 * JURISDICTION COVERAGE (as of Jan 2026):
 *
 * NOTICE ONLY:
 * - England: Section 21 (Form 6A) OR Section 8 (Form 3)
 * - Wales: Section 173 Notice + fault-based notice (RHW23)
 * - Scotland: Notice to Leave (PRT)
 *
 * COMPLETE PACK:
 * - England: N5 + N119 (+ N5B for accelerated) - ENGLAND ONLY
 *
 * MONEY CLAIM:
 * - England: N1 + PAP-DEBT documents - ENGLAND ONLY
 *
 * AST:
 * - England: AST
 * - Wales: Standard Occupation Contract
 * - Scotland: PRT
 * - Northern Ireland: Private Tenancy Agreement
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RiCheckboxCircleLine, RiCloseLine } from 'react-icons/ri';

export type ProductType = 'notice_only' | 'complete_pack' | 'money_claim' | 'ast';

export interface JurisdictionAccordionProps {
  product: ProductType;
  /** Show expanded by default */
  defaultExpanded?: boolean;
  /** Optional title override */
  title?: string;
}

interface JurisdictionInfo {
  name: string;
  flag: string;
  available: boolean;
  documents: string[];
  notes?: string;
}

export function JurisdictionAccordion({
  product,
  defaultExpanded = false,
  title = 'Jurisdictions Covered',
}: JurisdictionAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const jurisdictions = getJurisdictionInfo(product);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-gray-100">
          {jurisdictions.map((jurisdiction) => (
            <div key={jurisdiction.name} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={jurisdiction.flag}
                  alt={jurisdiction.name}
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <h4 className="text-lg font-semibold text-charcoal">{jurisdiction.name}</h4>
                {!jurisdiction.available && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Not available
                  </span>
                )}
              </div>

              {jurisdiction.available ? (
                <ul className="space-y-2">
                  {jurisdiction.documents.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-gray-700">{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-start gap-2 text-gray-500">
                  <RiCloseLine className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>{jurisdiction.notes || 'This product is not available for this jurisdiction.'}</span>
                </div>
              )}

              {jurisdiction.notes && jurisdiction.available && (
                <p className="text-sm text-gray-500 mt-3 italic">{jurisdiction.notes}</p>
              )}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

function getJurisdictionInfo(product: ProductType): JurisdictionInfo[] {
  switch (product) {
    case 'notice_only':
      return [
        {
          name: 'England',
          flag: '/gb-eng.svg',
          available: true,
          documents: [
            'Section 21 Notice (Form 6A) — no-fault eviction',
            'Section 8 Notice (Form 3) — grounds-based eviction',
            'Service Instructions',
            'Service & Validity Checklist',
          ],
          notes: 'Housing Act 1988 framework',
        },
        {
          name: 'Wales',
          flag: '/gb-wls.svg',
          available: true,
          documents: [
            'Section 173 Notice — no-fault possession (6 months)',
            'Fault-Based Notice (RHW23) — contract breach, arrears, ASB',
            'Service Instructions (Wales)',
            'Service & Validity Checklist (Wales)',
          ],
          notes: 'Renting Homes (Wales) Act 2016 framework',
        },
        {
          name: 'Scotland',
          flag: '/gb-sct.svg',
          available: true,
          documents: [
            'Notice to Leave (PRT) — with your selected grounds',
            'Service Instructions (Scotland)',
            'Service & Validity Checklist (Scotland)',
          ],
          notes: 'Private Housing (Tenancies) (Scotland) Act 2016 framework',
        },
      ];

    case 'complete_pack':
      return [
        {
          name: 'England',
          flag: '/gb-eng.svg',
          available: true,
          documents: [
            'All Notice Only documents (3)',
            'Form N5 — Claim for Possession',
            'Form N119 — Particulars of Claim',
            'Form N5B — Accelerated Possession (Section 21 only)',
            'AI Witness Statement',
            'Court Filing Guide',
            'Evidence Collection Checklist',
            'Proof of Service Certificate',
          ],
          notes: '7-9 documents total depending on route',
        },
      ];

    case 'money_claim':
      return [
        {
          name: 'England',
          flag: '/gb-eng.svg',
          available: true,
          documents: [
            'Form N1 — Money Claim Form (official PDF)',
            'Particulars of Claim',
            'Schedule of Arrears',
            'Interest Calculation',
            'Letter Before Claim (PAP-DEBT)',
            'Defendant Information Sheet',
            'Reply Form',
            'Financial Statement Form',
            'Court Filing Guide',
            'Enforcement Guide',
          ],
          notes: '11 documents total',
        },
      ];

    case 'ast':
      return [
        {
          name: 'England',
          flag: '/gb-eng.svg',
          available: true,
          documents: [
            'Assured Shorthold Tenancy Agreement',
            'Terms & Conditions Schedule',
            'Government Model Clauses',
            'Inventory Template',
            '+ Premium: Key Schedule, Maintenance Guide, Checkout Procedure',
          ],
          notes: 'Standard: 4 documents, Premium: 7 documents',
        },
        {
          name: 'Wales',
          flag: '/gb-wls.svg',
          available: true,
          documents: [
            'Standard Occupation Contract',
            'Terms & Conditions Schedule',
            'Government Model Clauses',
            'Inventory Template',
            '+ Premium: Key Schedule, Maintenance Guide, Checkout Procedure',
          ],
          notes: 'Renting Homes (Wales) Act 2016 compliant',
        },
        {
          name: 'Scotland',
          flag: '/gb-sct.svg',
          available: true,
          documents: [
            'Private Residential Tenancy Agreement',
            'Terms & Conditions Schedule',
            'Government Model Clauses',
            'Inventory Template',
            '+ Premium: Key Schedule, Maintenance Guide, Checkout Procedure',
          ],
          notes: 'Open-ended PRT (no fixed term)',
        },
        {
          name: 'Northern Ireland',
          flag: '/gb-nir.svg',
          available: true,
          documents: [
            'Private Tenancy Agreement',
            'Terms & Conditions Schedule',
            'Government Model Clauses',
            'Inventory Template',
            '+ Premium: Key Schedule, Maintenance Guide, Checkout Procedure',
          ],
          notes: 'Private Tenancies (NI) Order 2006 compliant',
        },
      ];
  }
}

export default JurisdictionAccordion;
