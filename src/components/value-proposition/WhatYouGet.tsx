/**
 * WhatYouGet Component
 *
 * Clear "What you get" section showing exact documents included in each pack.
 * Uses document-configs.ts as the source of truth.
 *
 * Features:
 * - Exact document names and counts
 * - Grouped by category (Notices, Court Forms, Guidance, etc.)
 * - 1-line benefit per document
 * - Explicit messaging about preview/edit/regenerate/portal
 */

import { RiCheckboxCircleLine } from 'react-icons/ri';
import {
  FileText,
  Scale,
  BookOpen,
  FolderOpen,
  Eye,
  RefreshCw,
  Cloud,
} from 'lucide-react';

export type ProductType = 'notice_only' | 'complete_pack' | 'money_claim' | 'ast_standard' | 'ast_premium';

export interface WhatYouGetProps {
  product: ProductType;
  /** Optional jurisdiction for jurisdiction-specific document lists */
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  /** Show the differentiators (preview/edit/portal) */
  showDifferentiators?: boolean;
}

interface DocumentGroup {
  title: string;
  icon: React.ReactNode;
  documents: { name: string; benefit: string }[];
}

export function WhatYouGet({
  product,
  jurisdiction = 'england',
  showDifferentiators = true,
}: WhatYouGetProps) {
  const groups = getDocumentGroups(product, jurisdiction);
  const totalDocs = groups.reduce((sum, group) => sum + group.documents.length, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-charcoal">
          What you get ({totalDocs} documents)
        </h2>
      </div>

      {/* Document groups */}
      <div className="p-6 space-y-6">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                {group.icon}
              </div>
              <h3 className="font-semibold text-charcoal">{group.title}</h3>
              <span className="text-sm text-gray-500">({group.documents.length})</span>
            </div>
            <ul className="space-y-2 ml-10">
              {group.documents.map((doc, docIndex) => (
                <li key={docIndex} className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-800">{doc.name}</span>
                    <span className="text-gray-600"> — {doc.benefit}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Differentiators */}
      {showDifferentiators && (
        <div className="px-6 py-4 bg-purple-50 border-t border-gray-200">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-700">
                <strong>Preview</strong> before paying (watermarked)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-700">
                <strong>Edit + regenerate</strong> instantly (unlimited)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-700">
                <strong>Stored</strong> in portal for at least 12 months
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDocumentGroups(product: ProductType, jurisdiction: string): DocumentGroup[] {
  switch (product) {
    case 'notice_only':
      return getNoticeOnlyGroups(jurisdiction);
    case 'complete_pack':
      return getCompletePackGroups(jurisdiction);
    case 'money_claim':
      return getMoneyClaimGroups(jurisdiction);
    case 'ast_standard':
      return getASTStandardGroups(jurisdiction);
    case 'ast_premium':
      return getASTPremiumGroups(jurisdiction);
    default:
      return [];
  }
}

function getNoticeOnlyGroups(jurisdiction: string): DocumentGroup[] {
  const noticeDoc = getNoticeDoc(jurisdiction);

  return [
    {
      title: 'Notices',
      icon: <FileText className="w-4 h-4 text-primary" />,
      documents: [noticeDoc],
    },
    {
      title: 'Guidance',
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Service Instructions', benefit: 'How to legally serve your notice' },
        { name: 'Service & Validity Checklist', benefit: 'Pre-service compliance verification' },
      ],
    },
  ];
}

function getCompletePackGroups(jurisdiction: string): DocumentGroup[] {
  const noticeDoc = getNoticeDoc(jurisdiction);
  const courtForms = getCourtForms(jurisdiction);

  return [
    {
      title: 'Notices',
      icon: <FileText className="w-4 h-4 text-primary" />,
      documents: [noticeDoc],
    },
    {
      title: 'Court Forms',
      icon: <Scale className="w-4 h-4 text-primary" />,
      documents: courtForms,
    },
    {
      title: 'AI-Generated',
      icon: <FileText className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'AI Witness Statement', benefit: 'Court-ready statement based on your case facts' },
      ],
    },
    {
      title: 'Guidance',
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Service Instructions', benefit: 'How to legally serve your notice' },
        { name: 'Service & Validity Checklist', benefit: 'Pre-service compliance verification' },
        {
          name: jurisdiction === 'scotland' ? 'Tribunal Lodging Guide' : 'Court Filing Guide',
          benefit: `How to file your ${jurisdiction === 'scotland' ? 'tribunal application' : 'possession claim'}`,
        },
      ],
    },
    {
      title: 'Evidence',
      icon: <FolderOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Evidence Collection Checklist', benefit: 'Documents you need to support your case' },
        { name: 'Proof of Service Certificate', benefit: 'Evidence of when and how you served notice' },
      ],
    },
  ];
}

function getMoneyClaimGroups(jurisdiction: string): DocumentGroup[] {
  const courtForm = jurisdiction === 'scotland'
    ? { name: 'Form 3A (Simple Procedure)', benefit: 'Sheriff Court claim form' }
    : { name: 'Form N1 (Money Claim)', benefit: 'Official court form for money claims' };

  return [
    {
      title: 'Court Forms',
      icon: <Scale className="w-4 h-4 text-primary" />,
      documents: [courtForm],
    },
    {
      title: 'Court Documents',
      icon: <FileText className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Particulars of Claim', benefit: 'Detailed breakdown of your claim' },
        { name: 'Schedule of Arrears', benefit: 'Line-by-line arrears with dates' },
        { name: 'Interest Calculation', benefit: 'Statutory interest under Section 69' },
      ],
    },
    {
      title: 'Pre-Action Protocol',
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Letter Before Claim', benefit: 'PAP-DEBT compliant letter (required)' },
        { name: 'Defendant Information Sheet', benefit: 'Explains defendant rights' },
        { name: 'Reply Form', benefit: 'Form for defendant response' },
        { name: 'Financial Statement Form', benefit: 'Income/expenditure disclosure' },
      ],
    },
    {
      title: 'Guidance',
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Court Filing Guide', benefit: 'MCOL or paper submission instructions' },
        { name: 'Enforcement Guide', benefit: 'Bailiffs, wage attachment, charging orders' },
      ],
    },
  ];
}

function getASTStandardGroups(jurisdiction: string): DocumentGroup[] {
  const agreementName = getAgreementName(jurisdiction);

  return [
    {
      title: 'Agreement',
      icon: <FileText className="w-4 h-4 text-primary" />,
      documents: [
        { name: agreementName, benefit: 'Jurisdiction-specific compliant agreement' },
      ],
    },
    {
      title: 'Schedules',
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Terms & Conditions Schedule', benefit: 'Detailed tenancy terms and obligations' },
        { name: 'Government Model Clauses', benefit: 'Official recommended clauses' },
        { name: 'Inventory Template', benefit: 'Property contents and condition record' },
      ],
    },
  ];
}

function getASTPremiumGroups(jurisdiction: string): DocumentGroup[] {
  const standardGroups = getASTStandardGroups(jurisdiction);

  return [
    ...standardGroups,
    {
      title: 'Premium Extras',
      icon: <FolderOpen className="w-4 h-4 text-primary" />,
      documents: [
        { name: 'Key Schedule', benefit: 'Record of all keys provided to tenant' },
        { name: 'Property Maintenance Guide', benefit: 'Tenant and landlord responsibilities' },
        { name: 'Checkout Procedure', benefit: 'End of tenancy process guide' },
      ],
    },
  ];
}

function getNoticeDoc(jurisdiction: string): { name: string; benefit: string } {
  switch (jurisdiction) {
    case 'wales':
      return { name: 'Section 173 / Fault-Based Notice', benefit: 'Welsh-law compliant eviction notice' };
    case 'scotland':
      return { name: 'Notice to Leave (PRT)', benefit: 'Scottish PRT eviction notice' };
    default:
      return { name: 'Section 21 (Form 6A) or Section 8 (Form 3)', benefit: 'Court-ready eviction notice' };
  }
}

function getCourtForms(jurisdiction: string): { name: string; benefit: string }[] {
  if (jurisdiction === 'scotland') {
    return [
      { name: 'Form E (Tribunal Application)', benefit: 'First-tier Tribunal for Scotland' },
    ];
  }

  return [
    { name: 'Form N5 (Claim for Possession)', benefit: 'Official court claim form' },
    { name: 'Form N119 (Particulars of Claim)', benefit: 'Detailed grounds for your claim' },
    { name: 'Form N5B (Accelerated Possession)', benefit: 'Fast-track for Section 21/173 (no hearing)' },
  ];
}

function getAgreementName(jurisdiction: string): string {
  switch (jurisdiction) {
    case 'wales':
      return 'Standard Occupation Contract';
    case 'scotland':
      return 'Private Residential Tenancy (PRT)';
    case 'northern-ireland':
      return 'Private Tenancy Agreement';
    default:
      return 'Assured Shorthold Tenancy (AST)';
  }
}

export default WhatYouGet;
