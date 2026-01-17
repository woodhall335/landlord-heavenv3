import { DocumentInfo } from '@/components/preview/DocumentCard';

// ============================================
// NOTICE ONLY DOCUMENTS (4 per jurisdiction)
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
    if (noticeRoute === 'section_21' || noticeRoute === 'section-21' || noticeRoute === 'accelerated_possession' || noticeRoute === 'accelerated_section21') {
      documents.push(
        {
          id: 'notice-section-21',
          title: 'Section 21 Notice (Form 6A)',
          description: 'Official no-fault eviction notice for assured shorthold tenancies',
          icon: 'notice',
          pages: '3-4 pages',
          category: 'Notice',
        },
        {
          id: 'service-instructions-s21',
          title: 'Service Instructions',
          description: 'Step-by-step guide on how to legally serve your Section 21 notice',
          icon: 'guidance',
          pages: '2 pages',
          category: 'Guidance',
        },
        {
          id: 'validity-checklist-s21',
          title: 'Service & Validity Checklist',
          description: 'Pre-service checklist to ensure your notice meets all legal requirements',
          icon: 'checklist',
          pages: '2 pages',
          category: 'Checklists',
        }
      );
    } else if (noticeRoute === 'section_8' || noticeRoute === 'section-8') {
      documents.push(
        {
          id: 'notice-section-8',
          title: 'Section 8 Notice (Form 3)',
          description: 'Grounds-based possession notice with your selected eviction grounds',
          icon: 'notice',
          pages: '4-5 pages',
          category: 'Notice',
        },
        {
          id: 'service-instructions-s8',
          title: 'Service Instructions',
          description: 'Step-by-step guide on how to legally serve your Section 8 notice',
          icon: 'guidance',
          pages: '2 pages',
          category: 'Guidance',
        },
        {
          id: 'validity-checklist-s8',
          title: 'Service & Validity Checklist',
          description: 'Pre-service checklist to ensure your notice meets all legal requirements',
          icon: 'checklist',
          pages: '2 pages',
          category: 'Checklists',
        }
      );
    }
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
    // Wales Section 8 (still available under Housing Act until property becomes occupation contract)
    if (noticeRoute === 'section_8' || noticeRoute === 'section-8') {
      documents.push(
        {
          id: 'notice-section-8',
          title: 'Section 8 Notice (Form 3)',
          description: 'Grounds-based possession notice with your selected eviction grounds',
          icon: 'notice',
          pages: '4-5 pages',
          category: 'Notice',
        },
        {
          id: 'service-instructions-s8',
          title: 'Service Instructions',
          description: 'Step-by-step guide on how to legally serve your Section 8 notice',
          icon: 'guidance',
          pages: '2 pages',
          category: 'Guidance',
        },
        {
          id: 'validity-checklist-s8',
          title: 'Service & Validity Checklist',
          description: 'Pre-service checklist to ensure your notice meets all legal requirements',
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

  // Add court forms
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
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

    // N5B only for Section 21/Section 173 (no-fault)
    if (noticeRoute?.includes('21') || noticeRoute?.includes('173') || noticeRoute === 'accelerated_possession' || noticeRoute === 'accelerated_section21') {
      documents.push({
        id: 'form-n5b',
        title: 'Form N5B - Accelerated Possession',
        description: 'Fast-track possession claim (usually no court hearing required)',
        icon: 'court-form',
        pages: '6 pages',
        category: 'Court Forms',
      });
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

  // AI-Generated Documents
  // Note: Compliance Audit and Risk Assessment removed as of Jan 2026 pack restructure
  documents.push(
    {
      id: 'witness-statement',
      title: 'AI Witness Statement',
      description: 'Court-ready witness statement drafted by AI based on your specific case facts',
      icon: 'ai-generated',
      pages: '3-5 pages',
      category: 'AI-Generated',
    }
  );

  // Guidance Documents
  // Note: Eviction Roadmap removed as of Jan 2026 pack restructure

  // Court filing guide based on jurisdiction
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    documents.push({
      id: 'court-filing-guide',
      title: 'Court Filing Guide',
      description: 'How to file your possession claim at the county court',
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

  // Court Form
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    documents.push({
      id: 'form-n1',
      title: 'Form N1 - Money Claim Form',
      description: 'Official court form to claim unpaid rent and other sums',
      icon: 'court-form',
      pages: '8 pages',
      category: 'Court Forms',
    });
  }

  if (jurisdiction === 'scotland') {
    documents.push({
      id: 'form-3a',
      title: 'Form 3A - Simple Procedure Claim',
      description: 'Sheriff Court simple procedure claim form',
      icon: 'court-form',
      pages: '6 pages',
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
// AST DOCUMENTS
// ============================================

export function getASTDocuments(jurisdiction: string, tier: 'standard' | 'premium'): DocumentInfo[] {
  const documents: DocumentInfo[] = [];

  // Agreement name based on jurisdiction
  const agreementNames: Record<string, { title: string; description: string }> = {
    'england': {
      title: 'Assured Shorthold Tenancy Agreement',
      description: 'Comprehensive AST compliant with Housing Act 1988'
    },
    'wales': {
      title: 'Standard Occupation Contract',
      description: 'Compliant with Renting Homes (Wales) Act 2016'
    },
    'scotland': {
      title: 'Private Residential Tenancy Agreement',
      description: 'PRT compliant with Private Housing (Tenancies) (Scotland) Act 2016'
    },
    'northern-ireland': {
      title: 'Private Tenancy Agreement',
      description: 'Compliant with Private Tenancies (Northern Ireland) Order 2006'
    },
  };

  const agreement = agreementNames[jurisdiction] || agreementNames['england'];

  documents.push({
    id: 'tenancy-agreement',
    title: agreement.title,
    description: agreement.description,
    icon: 'agreement',
    pages: '15-25 pages',
    category: 'Agreement',
  });

  // Standard Tier Documents
  // Note: certificate-of-curation, legal-validity-summary, and deposit-protection-cert
  // removed as of Jan 2026 pack restructure
  documents.push(
    {
      id: 'terms-and-conditions',
      title: 'Terms & Conditions Schedule',
      description: 'Detailed tenancy terms, obligations, and conditions',
      icon: 'checklist',
      pages: '6-8 pages',
      category: 'Schedules',
    },
    {
      id: 'government-model-clauses',
      title: 'Government Model Clauses',
      description: 'Recommended clauses from official government guidance',
      icon: 'guidance',
      pages: '3-4 pages',
      category: 'Schedules',
    },
    {
      id: 'inventory-template',
      title: 'Inventory Template',
      description: 'Comprehensive property contents and condition record',
      icon: 'checklist',
      pages: '4-6 pages',
      category: 'Schedules',
    }
  );

  // Premium Tier Additional Documents
  // Note: welcome-pack and condition-report removed as of Jan 2026 pack restructure
  if (tier === 'premium') {
    documents.push(
      {
        id: 'key-schedule',
        title: 'Key Schedule',
        description: 'Detailed record of all keys provided to tenant',
        icon: 'checklist',
        pages: '1 page',
        category: 'Premium Extras',
      },
      {
        id: 'maintenance-guide',
        title: 'Property Maintenance Guide',
        description: 'Clear breakdown of tenant and landlord responsibilities',
        icon: 'guidance',
        pages: '3-4 pages',
        category: 'Premium Extras',
      },
      {
        id: 'checkout-procedure',
        title: 'Checkout Procedure',
        description: 'End of tenancy process and expectations guide',
        icon: 'guidance',
        pages: '2-3 pages',
        category: 'Premium Extras',
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
      price: '£39.99',
      originalPrice: '£150+',
      savings: 'Save £110+ vs solicitors',
      features: [
        'Legally compliant eviction notice',
        'Service instructions',
        'Validity checklist',
        'Instant PDF download',
      ],
    },
    'complete_pack': {
      name: 'Complete Eviction Pack',
      price: '£199.99',
      originalPrice: '£2,500+',
      savings: 'Save £2,300+ vs solicitors',
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
      price: '£199.99',
      originalPrice: '£3,000+',
      savings: 'Save £2,800+ vs solicitors',
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
      price: '£199.99',
      originalPrice: '£3,000+',
      savings: 'Save £2,800+ vs solicitors',
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
    'ast_standard': {
      name: 'Tenancy Agreement - Standard',
      price: '£9.99',
      originalPrice: '£100+',
      savings: 'Save £90+ vs solicitors',
      features: [
        'Legally compliant agreement',
        'Terms & conditions',
        'Inventory template',
        'Government model clauses',
      ],
    },
    'tenancy_agreement': {
      name: 'Tenancy Agreement - Standard',
      price: '£9.99',
      originalPrice: '£100+',
      savings: 'Save £90+ vs solicitors',
      features: [
        'Legally compliant agreement',
        'Terms & conditions',
        'Inventory template',
        'Government model clauses',
      ],
    },
    'ast_premium': {
      name: 'Tenancy Agreement - Premium',
      price: '£14.99',
      originalPrice: '£200+',
      savings: 'Save £185+ vs solicitors',
      features: [
        'Everything in Standard',
        'Property maintenance guide',
        'Key schedule',
        'Checkout procedure',
      ],
    },
  };

  return products[product] || products['notice_only'];
}
