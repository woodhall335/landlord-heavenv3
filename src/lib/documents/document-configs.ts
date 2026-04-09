import { DocumentInfo } from '@/components/preview/DocumentCard';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '@/lib/tenancy/england-agreement-constants';
import {
  ENGLAND_SECTION8_NOTICE_NAME,
  ENGLAND_SECTION8_NOTICE_TITLE,
} from '@/lib/england-possession/section8-terminology';
import { normalizeEnglandTenancyPurpose } from '@/lib/tenancy/england-reform';

// ============================================
// NOTICE ONLY DOCUMENTS
// ============================================

/**
 * Options for notice-only document list generation
 */
export interface NoticeOnlyDocumentOptions {
  /** If true, includes rent schedule document for arrears grounds (8/10/11) */
  includeArrearsSchedule?: boolean;
}

export function getNoticeOnlyDocuments(
  jurisdiction: string,
  noticeRoute: string,
  options: NoticeOnlyDocumentOptions = {}
): DocumentInfo[] {
  const documents: DocumentInfo[] = [];

  // ENGLAND
  if (jurisdiction === 'england') {
    documents.push(
      {
        id: 'notice-form-3a',
        title: ENGLAND_SECTION8_NOTICE_TITLE,
        description: 'Official England possession notice for the current Section 8 route',
        icon: 'notice',
        pages: '10 pages',
        category: 'Notice',
      },
      {
        id: 'service-instructions-form-3a',
        title: 'Service Instructions',
        description: `Step-by-step guide on how to legally serve your ${ENGLAND_SECTION8_NOTICE_NAME}`,
        icon: 'guidance',
        pages: '2 pages',
        category: 'Guidance',
      },
      {
        id: 'cover-letter-form-3a',
        title: 'Cover Letter to Tenant',
        description: `Non-statutory covering letter to send alongside your ${ENGLAND_SECTION8_NOTICE_NAME}`,
        icon: 'guidance',
        pages: '1 page',
        category: 'Guidance',
      },
      {
        id: 'validity-checklist-form-3a',
        title: 'Service & Compliance Checklist',
        description: `Pre-service checklist for ${ENGLAND_SECTION8_NOTICE_NAME} validity, timing, and compliance`,
        icon: 'checklist',
        pages: '2 pages',
        category: 'Checklists',
      },
      {
        id: 'evidence-checklist-form-3a',
        title: 'Ground-Specific Evidence Checklist',
        description: 'Evidence prompts tailored to the possession grounds in your notice',
        icon: 'checklist',
        pages: '2 pages',
        category: 'Checklists',
      },
      {
        id: 'proof-of-service-form-3a',
        title: 'Proof of Service Support',
        description: `Editable support form for recording how and when your ${ENGLAND_SECTION8_NOTICE_NAME} was served`,
        icon: 'evidence',
        pages: '1-2 pages',
        category: 'Evidence',
      }
    );
  }

  // WALES
  if (jurisdiction === 'wales') {
    if (noticeRoute === 'section_173' || noticeRoute === 'section-173' || noticeRoute === 'wales_section_173') {
      documents.push(
        {
          id: 'notice-section-173',
          title: "Section 173 Landlord's Notice",
          description: 'No-fault possession notice under the Renting Homes (Wales) Act 2016',
          icon: 'notice',
          pages: '3-4 pages',
          category: 'Notice',
        },
        {
          id: 'service-instructions-s173',
          title: 'Service Instructions (Wales)',
          description: 'How to properly serve your Section 173 notice',
          icon: 'guidance',
          pages: '2 pages',
          category: 'Guidance',
        },
        {
          id: 'validity-checklist-s173',
          title: 'Service & Validity Checklist (Wales)',
          description: 'Welsh law compliance checklist for your notice',
          icon: 'checklist',
          pages: '2 pages',
          category: 'Checklists',
        }
      );
    } else if (noticeRoute === 'fault_based' || noticeRoute === 'fault-based' || noticeRoute === 'wales_fault_based') {
      documents.push(
        {
          id: 'notice-fault-based',
          title: 'Fault-Based Notice (RHW23)',
          description: 'Notice before making a possession claim for breach of contract',
          icon: 'notice',
          pages: '3-4 pages',
          category: 'Notice',
        },
        {
          id: 'pre-service-checklist-fault',
          title: 'Pre-Service Compliance Checklist (Wales)',
          description: 'Wales compliance checklist to verify before serving notice',
          icon: 'checklist',
          pages: '2-3 pages',
          category: 'Checklists',
        },
        {
          id: 'service-instructions-fault',
          title: 'Service Instructions (Wales)',
          description: 'How to properly serve your fault-based notice',
          icon: 'guidance',
          pages: '2 pages',
          category: 'Guidance',
        },
        {
          id: 'validity-checklist-fault',
          title: 'Service & Validity Checklist (Wales)',
          description: 'Welsh law compliance checklist for fault-based notices',
          icon: 'checklist',
          pages: '2 pages',
          category: 'Checklists',
        }
      );
    }
  }

  // SCOTLAND
  if (jurisdiction === 'scotland') {
    documents.push(
      {
        id: 'notice-to-leave',
        title: 'Notice to Leave (PRT)',
        description: 'Private Residential Tenancy eviction notice with your selected grounds',
        icon: 'notice',
        pages: '3-4 pages',
        category: 'Notice',
      },
      {
        id: 'service-instructions-ntl',
        title: 'Service Instructions (Scotland)',
        description: 'How to properly serve your Notice to Leave',
        icon: 'guidance',
        pages: '2 pages',
        category: 'Guidance',
      },
      {
        id: 'validity-checklist-ntl',
        title: 'Service & Validity Checklist (Scotland)',
        description: 'Scottish tenancy law compliance checklist',
        icon: 'checklist',
        pages: '2 pages',
        category: 'Checklists',
      }
    );
  }

  // Optional: Include arrears schedule for arrears grounds
  // This is required for Section 8 notices with rent arrears grounds (8/10/11)
  // and Wales fault-based notices with rent arrears grounds (Section 157/159)
  const isSection8 = noticeRoute === 'section_8' || noticeRoute === 'section-8';
  const isWalesFaultBased = noticeRoute === 'fault_based' || noticeRoute === 'fault-based' || noticeRoute === 'wales_fault_based';

  if (options.includeArrearsSchedule && (isSection8 || isWalesFaultBased)) {
    documents.push({
      id: 'arrears-schedule',
      title: 'Rent Schedule / Arrears Statement',
      description: 'Detailed breakdown of rent owed with dates and payment history',
      icon: 'schedule',
      pages: '1-3 pages',
      category: 'Evidence',
    });
  }

  return documents;
}

// ============================================
// COMPLETE EVICTION PACK DOCUMENTS
// ============================================

export function getCompletePackDocuments(jurisdiction: string, noticeRoute: string): DocumentInfo[] {
  const documents: DocumentInfo[] = [];

  // Start with Notice Only documents
  const noticeOnlyDocs = getNoticeOnlyDocuments(jurisdiction, noticeRoute);
  documents.push(...noticeOnlyDocs);

  // Add court forms - route-specific (aligned with pack-contents.ts single source of truth)
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    if (jurisdiction === 'england') {
      documents.push({
        id: 'form-n5',
        title: 'Form N5 - Claim for Possession',
        description: 'Official court form to start a standard possession claim',
        icon: 'court-form',
        pages: '8 pages',
        category: 'Court Forms',
      });
      documents.push(
        {
          id: 'form-n119',
          title: 'Form N119 - Particulars of Claim',
          description: 'Detailed grounds and particulars for your possession claim',
          icon: 'court-form',
          pages: '4-6 pages',
          category: 'Court Forms',
        }
      );
    } else {
      // Wales routes continue to use the standard N5 + N119 paper route.
      documents.push(
        {
          id: 'form-n5',
          title: 'Form N5 - Claim for Possession',
          description: 'Official court form to start possession proceedings',
          icon: 'court-form',
          pages: '8 pages',
          category: 'Court Forms',
        },
        {
          id: 'form-n119',
          title: 'Form N119 - Particulars of Claim',
          description: 'Detailed grounds and particulars for your possession claim',
          icon: 'court-form',
          pages: '4-6 pages',
          category: 'Court Forms',
        }
      );
    }
  }

  if (jurisdiction === 'scotland') {
    documents.push({
      id: 'form-e',
      title: 'Form E - Tribunal Application',
      description: 'First-tier Tribunal for Scotland application for possession',
      icon: 'court-form',
      pages: '6 pages',
      category: 'Court Forms',
    });
  }

  // Court filing guide based on jurisdiction
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    documents.push({
      id: 'court-filing-guide',
      title: 'Court Filing Guide',
      description: jurisdiction === 'england'
        ? 'How to file your England possession claim using N5/N119, including when rent-only claims may also be filed online'
        : 'How to file your possession claim at the county court',
      icon: 'guidance',
      pages: '3 pages',
      category: 'Guidance',
    });
  }

  if (jurisdiction === 'scotland') {
    documents.push({
      id: 'tribunal-lodging-guide',
      title: 'Tribunal Lodging Guide',
      description: 'How to lodge your application with the First-tier Tribunal',
      icon: 'guidance',
      pages: '3 pages',
      category: 'Guidance',
    });
  }

  // Evidence Tools
  documents.push(
    {
      id: 'evidence-checklist',
      title: 'Evidence Collection Checklist',
      description: 'Complete list of documents you need to support your case in court',
      icon: 'evidence',
      pages: '2 pages',
      category: 'Evidence',
    },
    {
      id: 'proof-of-service',
      title: 'Proof of Service Certificate',
      description: 'Template to evidence when and how you served the notice',
      icon: 'evidence',
      pages: '1 page',
      category: 'Evidence',
    }
  );

  return documents;
}

// ============================================
// MONEY CLAIM PACK DOCUMENTS
// ============================================

export function getMoneyClaimDocuments(jurisdiction: string): DocumentInfo[] {
  const documents: DocumentInfo[] = [];

  // Court Form - Money Claim is ENGLAND-ONLY
  // Scotland uses Simple Procedure (sc_money_claim) product with separate configs
  if (jurisdiction === 'england') {
    documents.push({
      id: 'form-n1',
      title: 'Form N1 - Money Claim Form',
      description: 'Official HMCTS court form to claim unpaid rent and other sums',
      icon: 'court-form',
      pages: '5 pages',
      category: 'Court Forms',
    });
  }

  // Particulars and Schedule
  documents.push(
    {
      id: 'particulars-of-claim',
      title: 'Particulars of Claim',
      description: 'Detailed breakdown of your claim against the tenant',
      icon: 'court-form',
      pages: '3-4 pages',
      category: 'Court Documents',
    },
    {
      id: 'schedule-of-arrears',
      title: 'Schedule of Arrears',
      description: 'Line-by-line breakdown of all rent owed with dates',
      icon: 'schedule',
      pages: '2-4 pages',
      category: 'Court Documents',
    },
    {
      id: 'interest-calculation',
      title: 'Interest Calculation',
      description: 'Statutory interest calculation under Section 69 County Courts Act',
      icon: 'schedule',
      pages: '1-2 pages',
      category: 'Court Documents',
    }
  );

  // Pre-Action Protocol
  documents.push(
    {
      id: 'letter-before-claim',
      title: 'Letter Before Claim',
      description: 'PAP-DEBT compliant letter before action (required before court)',
      icon: 'notice',
      pages: '2 pages',
      category: 'Pre-Action Protocol',
    },
    {
      id: 'information-sheet',
      title: 'Defendant Information Sheet',
      description: 'Required information sheet explaining defendant rights',
      icon: 'guidance',
      pages: '2 pages',
      category: 'Pre-Action Protocol',
    },
    {
      id: 'reply-form',
      title: 'Reply Form',
      description: 'Form for defendant to respond to your claim',
      icon: 'checklist',
      pages: '2 pages',
      category: 'Pre-Action Protocol',
    },
    {
      id: 'financial-statement',
      title: 'Financial Statement Form',
      description: 'Income and expenditure disclosure form for defendant',
      icon: 'schedule',
      pages: '2 pages',
      category: 'Pre-Action Protocol',
    }
  );

  // Guidance
  // Note: pack-summary, hearing-prep, and evidence-index removed as of Jan 2026 pack restructure
  documents.push(
    {
      id: 'filing-guide',
      title: 'Court Filing Guide',
      description: 'How to file via MCOL online or paper submission',
      icon: 'guidance',
      pages: '3 pages',
      category: 'Guidance',
    },
    {
      id: 'enforcement-guide',
      title: 'Enforcement Guide',
      description: "Options for enforcing judgment if tenant doesn't pay",
      icon: 'guidance',
      pages: '3 pages',
      category: 'Guidance',
    }
  );

  return documents;
}

// ============================================
// SECTION 13 RENT INCREASE PACK DOCUMENTS
// ============================================

export function getSection13Documents(product: 'section13_standard' | 'section13_defensive'): DocumentInfo[] {
  const standardDocuments: DocumentInfo[] = [
    {
      id: 'section13-form-4a',
      title: 'Form 4A Rent Increase Notice',
      description: 'Official assured tenancy rent increase notice for England.',
      icon: 'notice',
      pages: '9 pages',
      category: 'Notice',
    },
    {
      id: 'section13-cover-letter',
      title: 'Section 13 Cover Letter',
      description: 'Practical service guidance and immediate next steps for issuing the notice pack.',
      icon: 'guidance',
      pages: '1 page',
      category: 'Guidance',
    },
    {
      id: 'section13-justification-report',
      title: 'Rent Increase Justification Report',
      description: 'Comparable-led market positioning report with challenge and evidence bands.',
      icon: 'evidence',
      pages: '2-4 pages',
      category: 'Evidence',
    },
    {
      id: 'section13-proof-of-service-record',
      title: 'Proof of Service Record',
      description: 'Service record to document how and when Form 4A was served.',
      icon: 'checklist',
      pages: '1 page',
      category: 'Evidence',
    },
  ];

  if (product === 'section13_standard') {
    return standardDocuments;
  }

  return [
    ...standardDocuments,
    {
      id: 'section13-tribunal-argument-summary',
      title: 'Tribunal Argument Summary',
      description: 'One-page case-specific argument brief for the landlord response position.',
      icon: 'guidance',
      pages: '1 page',
      category: 'Defensive',
    },
    {
      id: 'section13-tribunal-defence-guide',
      title: 'Tribunal Defence Guide',
      description: 'Step-by-step hearing preparation guidance for Section 13 rent challenges.',
      icon: 'guidance',
      pages: '2-3 pages',
      category: 'Defensive',
    },
    {
      id: 'section13-landlord-response-template',
      title: 'Landlord Response Template',
      description: 'Response template aligned to the current tribunal market-rent process.',
      icon: 'court-form',
      pages: '1-2 pages',
      category: 'Defensive',
    },
    {
      id: 'section13-legal-briefing',
      title: 'Tribunal Legal Briefing',
      description: 'Concise legal context for hearings, evidence expectations, and positioning.',
      icon: 'guidance',
      pages: '2 pages',
      category: 'Defensive',
    },
    {
      id: 'section13-evidence-checklist',
      title: 'Evidence Checklist',
      description: 'Checklist for uploaded exhibits and bundle-readiness checks.',
      icon: 'checklist',
      pages: '1-2 pages',
      category: 'Defensive',
    },
    {
      id: 'section13-negotiation-email-template',
      title: 'Negotiation Email Template',
      description: 'Structured wording template for pre-hearing negotiation correspondence.',
      icon: 'guidance',
      pages: '1 page',
      category: 'Defensive',
    },
    {
      id: 'section13-tribunal-bundle-pdf',
      title: 'Merged Tribunal Bundle PDF',
      description: 'Deterministic merged bundle with cover, index, core docs, and exhibits.',
      icon: 'court-form',
      pages: 'Variable',
      category: 'Bundle',
    },
    {
      id: 'section13-tribunal-bundle-zip',
      title: 'Tribunal Bundle ZIP Export',
      description: 'ZIP export containing bundle assets and supporting documents.',
      icon: 'evidence',
      pages: 'Download',
      category: 'Bundle',
    },
  ];
}

// ============================================
// AST DOCUMENTS
// ============================================

/**
 * Options for tenancy agreement document generation
 */
export interface ASTDocumentOptions {
  /** Was inventory data completed via wizard? */
  hasInventoryData?: boolean;
  /** England transition branch for conditional support documents */
  englandTenancyPurpose?: string;
}

/**
 * TENANCY AGREEMENT DOCUMENTS
 *
 * Product tiers:
 * - 'standard': Tenancy agreement with blank inventory template, compliance checklist, and deposit-support docs
 * - 'premium': HMO-specific tenancy agreement with wizard-completed inventory, compliance checklist, and deposit-support docs
 *
 * INTEGRATION LAYER REQUIREMENTS:
 * - Inventory: Always included (blank for standard, wizard-completed for premium)
 * - Compliance Checklist: Always included (jurisdiction-specific, non-contractual guidance)
 * - Deposit Support: England includes standalone deposit protection certificate and prescribed information pack
 * - Embedded Schedules: Property, Rent, Utilities, Inventory, House Rules
 *
 * Jurisdiction handling:
 * - England: Assured periodic tenancy (Housing Act 1988 as amended)
 * - Wales: Standard Occupation Contract (Renting Homes (Wales) Act 2016)
 * - Scotland: Private Residential Tenancy (Private Housing (Tenancies) (Scotland) Act 2016)
 * - NI: Private Tenancy Agreement (Private Tenancies Act (NI) 2022)
 */
export function getASTDocuments(
  jurisdiction: string,
  tier: 'standard' | 'premium',
  options: ASTDocumentOptions = {}
): DocumentInfo[] {
  const documents: DocumentInfo[] = [];
  const { hasInventoryData } = options;
  const englandTenancyPurpose = normalizeEnglandTenancyPurpose(options.englandTenancyPurpose);

  // Agreement name based on jurisdiction
  const agreementNames: Record<string, { standard: { title: string; description: string }; hmo: { title: string; description: string } }> = {
    'england': {
      standard: {
        title: ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
        description: 'Solicitor-grade England assured periodic tenancy agreement with all embedded schedules.'
      },
      hmo: {
        title: ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
        description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, and other more complex England tenancy arrangements.'
      }
    },
    'wales': {
      standard: {
        title: 'Standard Occupation Contract',
        description: 'Solicitor-grade occupation contract with all embedded schedules. Compliant with Renting Homes (Wales) Act 2016.'
      },
      hmo: {
        title: 'Premium Occupation Contract',
        description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, students, and other more complex Welsh occupation arrangements.'
      }
    },
    'scotland': {
      standard: {
        title: 'Private Residential Tenancy Agreement',
        description: 'Solicitor-grade PRT agreement with all embedded schedules. Compliant with Private Housing (Tenancies) (Scotland) Act 2016.'
      },
      hmo: {
        title: 'Premium Private Residential Tenancy Agreement',
        description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, students, and other more complex Scottish tenancy arrangements.'
      }
    },
    'northern-ireland': {
      standard: {
        title: 'Private Tenancy Agreement',
        description: 'Solicitor-grade tenancy agreement with all embedded schedules. Compliant with Private Tenancies Act (NI) 2022.'
      },
      hmo: {
        title: 'Premium Private Tenancy Agreement',
        description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, and other more complex Northern Ireland tenancy arrangements.'
      }
    },
  };

  const agreementConfig = agreementNames[jurisdiction] || agreementNames['england'];

  // 1. Main Agreement
  if (tier === 'standard') {
    documents.push({
      id: 'tenancy-agreement',
      title: agreementConfig.standard.title,
      description: agreementConfig.standard.description,
      icon: 'agreement',
      pages: '15-20 pages',
      category: 'Agreement',
    });
  } else {
    documents.push({
      id: 'tenancy-agreement-hmo',
      title: agreementConfig.hmo.title,
      description: agreementConfig.hmo.description,
      icon: 'agreement',
      pages: '20-25 pages',
      category: 'Agreement',
    });
  }

  // 2. Inventory Schedule - tier and context-specific
  // Standard: always blank template
  // Premium + hasInventoryData: wizard-completed
  // Premium + no data: ready to complete
  const inventoryTitle = tier === 'standard'
    ? 'Inventory & Schedule of Condition (Blank Template)'
    : hasInventoryData
      ? 'Inventory & Schedule of Condition (Wizard-Completed)'
      : 'Inventory & Schedule of Condition (Ready to Complete)';

  const inventoryDescription = tier === 'standard'
    ? 'Included as Schedule 4 inside the tenancy agreement (blank template)'
    : hasInventoryData
      ? 'Included as Schedule 4 inside the tenancy agreement (wizard-completed)'
      : 'Included as Schedule 4 inside the tenancy agreement (ready to complete)';

  documents.push({
    id: 'inventory-schedule',
    title: inventoryTitle,
    description: inventoryDescription,
    icon: 'checklist',
    pages: tier === 'premium' && hasInventoryData ? '3-8 pages' : '4-6 pages',
    category: 'Schedule',
  });

  // 3. Pre-Tenancy Compliance Checklist - jurisdiction-specific
  const checklistInfo: Record<string, { title: string; description: string }> = {
    'england': {
      title: 'Pre-Tenancy Compliance Checklist (England)',
      description: 'Non-contractual guidance covering deposit protection, gas safety, EPC, EICR, Right to Rent, and England written-information or government-guidance duties.',
    },
    'wales': {
      title: 'Pre-Tenancy Compliance Checklist (Wales)',
      description: 'Non-contractual guidance covering Rent Smart Wales, deposit protection, gas safety, EPC, and EICR requirements',
    },
    'scotland': {
      title: 'Pre-Tenancy Compliance Checklist (Scotland)',
      description: 'Non-contractual guidance covering landlord registration, deposit protection, Repairing Standard, and fire alarms',
    },
    'northern-ireland': {
      title: 'Pre-Tenancy Compliance Checklist (Northern Ireland)',
      description: 'Non-contractual guidance covering landlord registration, deposit protection, gas safety, and electrical safety',
    },
  };

  const checklist = checklistInfo[jurisdiction] || checklistInfo['england'];
  documents.push({
    id: 'compliance-checklist',
    title: checklist.title,
    description: checklist.description,
    icon: 'guidance',
    pages: '2-3 pages',
    category: 'Guidance',
  });

  if (jurisdiction === 'england' && englandTenancyPurpose === 'existing_written_tenancy') {
    documents.push({
      id: 'renters-rights-information-sheet-2026',
      title: 'Renters\' Rights Act Information Sheet 2026',
      description: 'Exact government PDF for existing written England tenancies transitioning into the new regime.',
      icon: 'guidance',
      pages: '4 pages',
      category: 'Guidance',
    });
  }

  if (jurisdiction === 'england') {
    documents.push(
      {
        id: 'deposit-protection-certificate',
        title: 'Deposit Protection Certificate',
        description: 'Standalone certificate covering the England tenancy deposit protection scheme details.',
        icon: 'guidance',
        pages: '3-4 pages',
        category: 'Guidance',
      },
      {
        id: 'prescribed-information-pack',
        title: 'Prescribed Information Pack',
        description: 'Standalone tenancy deposit prescribed information pack for England compliance and tenant service.',
        icon: 'guidance',
        pages: '4-6 pages',
        category: 'Guidance',
      }
    );
  }

  if (jurisdiction === 'scotland') {
    documents.push({
      id: 'easy-read-notes-scotland',
      title: 'Easy Read Notes',
      description: 'Plain-language guidance included with the Scotland tenancy pack.',
      icon: 'guidance',
      pages: '2-4 pages',
      category: 'Guidance',
    });
  }

  if (tier === 'premium') {
    documents.push(
      {
        id: 'key-schedule',
        title: 'Key Receipt & Handover Schedule',
        description: 'Record of keys, access devices, and handover arrangements for the tenancy setup.',
        icon: 'guidance',
        pages: '1-3 pages',
        category: 'Guidance',
      },
      {
        id: 'property-maintenance-guide',
        title: 'Property Maintenance Guide',
        description: 'Practical maintenance, reporting, and care guidance to support the tenancy after move-in.',
        icon: 'guidance',
        pages: '2-4 pages',
        category: 'Guidance',
      },
      {
        id: 'checkout-procedure',
        title: 'Checkout Procedure',
        description: 'End-of-tenancy checkout steps, records, and handback guidance for the tenancy file.',
        icon: 'guidance',
        pages: '2-4 pages',
        category: 'Guidance',
      }
    );
  }

  return documents;
}

// ============================================
// PRODUCT METADATA
// ============================================

export interface ProductMeta {
  name: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  features: string[];
}

export function getProductMeta(product: string): ProductMeta {
  const products: Record<string, ProductMeta> = {
    'notice_only': {
      name: 'Notice Only Pack',
      price: PRODUCTS.notice_only.displayPrice,
      originalPrice: '£150+',
      savings: 'Save £120+ vs solicitors',
      features: [
        'Legally compliant eviction notice',
        'Service instructions',
        'Service & validity checklist',
        'Pre-service compliance declaration',
        'Instant PDF download',
      ],
    },
    'complete_pack': {
      name: 'Complete Eviction Pack',
      price: PRODUCTS.complete_pack.displayPrice,
      originalPrice: '£2,500+',
      savings: 'Save £2,400+ vs solicitors',
      features: [
        'Everything in Notice Only',
        'Court forms (N5, N119, N5B)',
        'AI witness statement',
        'Court filing guide',
        'Evidence checklist',
        'Proof of service template',
      ],
    },
    'money_claim': {
      name: 'Money Claim Pack',
      price: PRODUCTS.money_claim.displayPrice,
      originalPrice: '£3,000+',
      savings: 'Save £2,900+ vs solicitors',
      features: [
        'Form N1 money claim',
        'Particulars of claim',
        'Schedule of arrears',
        'Interest calculation',
        'Letter before claim',
        'Pre-action protocol docs',
        'Filing guide',
        'Enforcement guide',
      ],
    },
    'sc_money_claim': {
      name: 'Simple Procedure Pack',
      price: PRODUCTS.money_claim.displayPrice,
      originalPrice: '£3,000+',
      savings: 'Save £2,850+ vs solicitors',
      features: [
        'Form 3A simple procedure claim',
        'Particulars of claim',
        'Schedule of arrears',
        'Interest calculation',
        'Pre-action letter',
        'Filing guide',
        'Enforcement guide',
      ],
    },
    'section13_standard': {
      name: 'Section 13 Standard Pack',
      price: PRODUCTS.section13_standard.displayPrice,
      originalPrice: '£350+',
      savings: 'Save £300+ vs ad hoc legal drafting',
      features: [
        'Official Form 4A notice',
        'Case-specific cover letter and service guidance',
        'Comparable-led justification report',
        'Proof of service record',
      ],
    },
    'section13_defensive': {
      name: 'Section 13 Defensive Pack',
      price: PRODUCTS.section13_defensive.displayPrice,
      originalPrice: '£900+',
      savings: 'Save £850+ vs solicitor-led prep',
      features: [
        'Everything in Standard',
        'Tribunal Argument Summary',
        'Defence guide, legal briefing, and response template',
        'Evidence checklist and negotiation wording',
        'Merged tribunal bundle PDF and ZIP export',
      ],
    },
    // STANDARD TENANCY AGREEMENT - agreement plus support pack
    'ast_standard': {
      name: 'Tenancy Agreement',
      price: PRODUCTS.ast_standard.displayPrice,
      originalPrice: '£100+',
      savings: 'Save £85+ vs solicitors',
      features: [
        'Residential tenancy agreement with embedded schedules',
        'Jurisdiction-specific compliance checklist',
        'England packs include deposit protection certificate and prescribed information pack',
        'Jurisdiction-compliant (England/Wales/Scotland/NI)',
        'Legally valid and court-ready',
        'Instant PDF download',
      ],
    },
    'tenancy_agreement': {
      name: 'Tenancy Agreement',
      price: PRODUCTS.ast_standard.displayPrice,
      originalPrice: '£100+',
      savings: 'Save £85+ vs solicitors',
      features: [
        'Residential tenancy agreement with embedded schedules',
        'Jurisdiction-specific compliance checklist',
        'England packs include deposit protection certificate and prescribed information pack',
        'Jurisdiction-compliant (England/Wales/Scotland/NI)',
        'Legally valid and court-ready',
        'Instant PDF download',
      ],
    },
    // PREMIUM HMO TENANCY AGREEMENT - HMO-specific clauses
    'ast_premium': {
      name: 'HMO Tenancy Agreement',
      price: PRODUCTS.ast_premium.displayPrice,
      originalPrice: '£200+',
      savings: 'Save £175+ vs solicitors',
      features: [
        'Includes HMO-specific clauses for multi-occupancy properties',
        'Jurisdiction-specific compliance checklist',
        'England packs include deposit protection certificate and prescribed information pack',
        'Multiple occupants & joint liability clauses',
        'Shared facilities obligations',
        'Fire safety & licensing acknowledgement',
        'House rules and occupancy limits',
      ],
    },
  };

  return products[product] || products['notice_only'];
}


