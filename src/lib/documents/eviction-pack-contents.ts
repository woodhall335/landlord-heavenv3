/**
 * Eviction Pack Contents Configuration
 *
 * Defines what documents are included in eviction packs based on:
 * - Jurisdiction (England, Wales, Scotland)
 * - Route (Section 8, Section 21, accelerated, etc.)
 * - Pack type (notice_only, complete_pack)
 */

export interface PackDocument {
  id: string;
  title: string;
  description: string;
  category: 'notice' | 'court_form' | 'ai_generated' | 'guidance' | 'evidence_tool';
  icon: string;
  /** Document type for generation API */
  documentType?: string;
  /** Whether this document is premium/AI-generated */
  isPremium?: boolean;
  /** Conditions for when this document is included */
  conditions?: {
    routes?: string[];
    jurisdictions?: string[];
    requiresArrears?: boolean;
    isAccelerated?: boolean;
  };
}

export interface PackCategory {
  id: string;
  title: string;
  icon: string;
  documents: PackDocument[];
}

// =============================================================================
// ENGLAND & WALES - Section 8 Documents
// =============================================================================

const SECTION_8_NOTICE: PackDocument = {
  id: 'section8_notice',
  title: 'Section 8 Notice (Form 3)',
  description: 'Official grounds-based possession notice with auto-calculated expiry dates',
  category: 'notice',
  icon: '📜',
  documentType: 'section8_notice',
  conditions: {
    routes: ['section_8'],
    jurisdictions: ['england', 'wales'],
  },
};

const SECTION_21_NOTICE: PackDocument = {
  id: 'section21_notice',
  title: 'Section 21 Notice (Form 6A)',
  description: 'Official no-fault possession notice with compliance verification',
  category: 'notice',
  icon: '📜',
  documentType: 'section21_notice',
  conditions: {
    routes: ['section_21', 'accelerated_possession', 'accelerated_section21'],
    jurisdictions: ['england', 'wales'],
  },
};

// =============================================================================
// ENGLAND & WALES - Court Forms
// =============================================================================

const N5_CLAIM: PackDocument = {
  id: 'n5_claim',
  title: 'Form N5 - Claim for Possession',
  description: 'Standard possession claim form for County Court',
  category: 'court_form',
  icon: '⚖️',
  documentType: 'n5_claim',
  conditions: {
    routes: ['section_8', 'section_21'],
    jurisdictions: ['england', 'wales'],
    isAccelerated: false,
  },
};

const N119_PARTICULARS: PackDocument = {
  id: 'n119_particulars',
  title: 'Form N119 - Particulars of Claim',
  description: 'Detailed particulars supporting the possession claim',
  category: 'court_form',
  icon: '⚖️',
  documentType: 'n119_particulars',
  conditions: {
    routes: ['section_8', 'section_21'],
    jurisdictions: ['england', 'wales'],
  },
};

const N5B_ACCELERATED: PackDocument = {
  id: 'n5b_claim',
  title: 'Form N5B - Accelerated Possession Claim',
  description: 'Accelerated procedure for Section 21 (no hearing required)',
  category: 'court_form',
  icon: '⚖️',
  documentType: 'n5b_claim',
  conditions: {
    routes: ['section_21', 'accelerated_possession', 'accelerated_section21'],
    jurisdictions: ['england', 'wales'],
    isAccelerated: true,
  },
};

// =============================================================================
// SCOTLAND - Documents
// =============================================================================

const NOTICE_TO_LEAVE: PackDocument = {
  id: 'notice_to_leave',
  title: 'Notice to Leave',
  description: 'Private Residential Tenancy eviction notice with auto-calculated notice period',
  category: 'notice',
  icon: '📜',
  documentType: 'notice_to_leave',
  conditions: {
    routes: ['notice_to_leave'],
    jurisdictions: ['scotland'],
  },
};

const FORM_E_TRIBUNAL: PackDocument = {
  id: 'form_e_tribunal',
  title: 'Form E - Tribunal Application',
  description: 'First-tier Tribunal for Scotland application form',
  category: 'court_form',
  icon: '⚖️',
  documentType: 'form_e_tribunal',
  conditions: {
    jurisdictions: ['scotland'],
  },
};

// =============================================================================
// AI-GENERATED PREMIUM DOCUMENTS
// =============================================================================

const WITNESS_STATEMENT: PackDocument = {
  id: 'witness_statement',
  title: 'AI-Drafted Witness Statement',
  description: 'Professional witness statement drafted by Ask Heaven AI (saves £200-500)',
  category: 'ai_generated',
  icon: '☁️',
  documentType: 'witness_statement',
  isPremium: true,
};

const COMPLIANCE_AUDIT: PackDocument = {
  id: 'compliance_audit',
  title: 'Compliance Audit Report',
  description: '8 critical legal compliance checks by Ask Heaven AI',
  category: 'ai_generated',
  icon: '☁️',
  documentType: 'compliance_audit',
  isPremium: true,
};

const RISK_ASSESSMENT: PackDocument = {
  id: 'risk_assessment',
  title: 'Risk Assessment Report',
  description: 'Case strength analysis and risk factors by Ask Heaven AI',
  category: 'ai_generated',
  icon: '☁️',
  documentType: 'risk_assessment',
  isPremium: true,
};

// =============================================================================
// GUIDANCE DOCUMENTS
// =============================================================================

const EVICTION_ROADMAP: PackDocument = {
  id: 'eviction_roadmap',
  title: 'Step-by-Step Eviction Roadmap',
  description: 'Complete guide from notice to possession order',
  category: 'guidance',
  icon: '🗺️',
  documentType: 'eviction_roadmap',
};

const EXPERT_GUIDANCE: PackDocument = {
  id: 'expert_guidance',
  title: 'Expert Eviction Guidance',
  description: 'Professional tips and common pitfalls to avoid',
  category: 'guidance',
  icon: '💡',
  documentType: 'expert_guidance',
};

const TIMELINE_EXPECTATIONS: PackDocument = {
  id: 'timeline_expectations',
  title: 'Eviction Timeline & Expectations',
  description: 'Realistic timelines and what to expect at each stage',
  category: 'guidance',
  icon: '📅',
  documentType: 'eviction_timeline',
};

const CASE_SUMMARY: PackDocument = {
  id: 'case_summary',
  title: 'Eviction Case Summary',
  description: 'Overview of your case facts and key details',
  category: 'guidance',
  icon: '📄',
  documentType: 'case_summary',
};

const COURT_FILING_GUIDE: PackDocument = {
  id: 'court_filing_guide',
  title: 'Court Filing Guide',
  description: 'How to file your claim at County Court or online (PCOL)',
  category: 'guidance',
  icon: '📋',
  documentType: 'court_filing_guide',
  conditions: {
    jurisdictions: ['england', 'wales'],
  },
};

const TRIBUNAL_LODGING_GUIDE: PackDocument = {
  id: 'tribunal_lodging_guide',
  title: 'Tribunal Lodging Guide',
  description: 'How to lodge your application with the First-tier Tribunal',
  category: 'guidance',
  icon: '📋',
  documentType: 'tribunal_lodging_guide',
  conditions: {
    jurisdictions: ['scotland'],
  },
};

const SERVICE_INSTRUCTIONS: PackDocument = {
  id: 'service_instructions',
  title: 'Service Instructions',
  description: 'Legal requirements for serving notice correctly',
  category: 'guidance',
  icon: '📬',
  documentType: 'service_instructions',
};

const SERVICE_VALIDITY_CHECKLIST: PackDocument = {
  id: 'service_validity_checklist',
  title: 'Service & Validity Checklist',
  description: 'Route-specific compliance verification checklist',
  category: 'guidance',
  icon: '☑️',
  documentType: 'service_checklist',
};

// =============================================================================
// EVIDENCE TOOLS
// =============================================================================

const ARREARS_SCHEDULE: PackDocument = {
  id: 'arrears_schedule',
  title: 'Rent Arrears Schedule',
  description: 'Detailed breakdown of rent owed with payment history',
  category: 'evidence_tool',
  icon: '📊',
  documentType: 'arrears_schedule',
  conditions: {
    requiresArrears: true,
  },
};

const EVIDENCE_CHECKLIST: PackDocument = {
  id: 'evidence_checklist',
  title: 'Evidence Checklist',
  description: 'What documents and evidence you need for court',
  category: 'evidence_tool',
  icon: '✅',
  documentType: 'evidence_checklist',
};

const PROOF_OF_SERVICE: PackDocument = {
  id: 'proof_of_service',
  title: 'Proof of Service Template',
  description: 'Certificate of service / proof of posting template',
  category: 'evidence_tool',
  icon: '📝',
  documentType: 'proof_of_service',
};

// =============================================================================
// PACK CONTENTS RESOLVER
// =============================================================================

export interface PackContentsOptions {
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  route: string;
  packType: 'notice_only' | 'complete_pack';
  hasArrears?: boolean;
  isAccelerated?: boolean;
}

/**
 * Get the list of documents included in an eviction pack
 */
export function getEvictionPackContents(options: PackContentsOptions): PackCategory[] {
  const { jurisdiction, route, packType, hasArrears = false, isAccelerated = false } = options;

  // Helper to check if a document should be included
  const shouldInclude = (doc: PackDocument): boolean => {
    const conds = doc.conditions;
    if (!conds) return true;

    // Check jurisdiction
    if (conds.jurisdictions && !conds.jurisdictions.includes(jurisdiction)) {
      return false;
    }

    // Check route
    if (conds.routes && !conds.routes.includes(route)) {
      return false;
    }

    // Check arrears requirement
    if (conds.requiresArrears && !hasArrears) {
      return false;
    }

    // Check accelerated requirement
    if (conds.isAccelerated !== undefined && conds.isAccelerated !== isAccelerated) {
      return false;
    }

    return true;
  };

  const categories: PackCategory[] = [];

  // ==========================================================================
  // NOTICE CATEGORY
  // ==========================================================================
  const notices: PackDocument[] = [];

  if (jurisdiction === 'scotland') {
    if (shouldInclude(NOTICE_TO_LEAVE)) notices.push(NOTICE_TO_LEAVE);
  } else {
    // England/Wales
    if (route === 'section_8') {
      if (shouldInclude(SECTION_8_NOTICE)) notices.push(SECTION_8_NOTICE);
    } else if (['section_21', 'accelerated_possession', 'accelerated_section21'].includes(route)) {
      if (shouldInclude(SECTION_21_NOTICE)) notices.push(SECTION_21_NOTICE);
    }
  }

  if (notices.length > 0) {
    categories.push({
      id: 'notices',
      title: 'Notices',
      icon: '📜',
      documents: notices,
    });
  }

  // ==========================================================================
  // COURT FORMS CATEGORY (Complete Pack only)
  // ==========================================================================
  if (packType === 'complete_pack') {
    const courtForms: PackDocument[] = [];

    if (jurisdiction === 'scotland') {
      if (shouldInclude(FORM_E_TRIBUNAL)) courtForms.push(FORM_E_TRIBUNAL);
    } else {
      // England/Wales
      // For Section 21, include both N5B (accelerated) and N5/N119 for flexibility
      if (['section_21', 'accelerated_possession', 'accelerated_section21'].includes(route)) {
        courtForms.push(N5B_ACCELERATED);
        courtForms.push(N5_CLAIM);
        courtForms.push(N119_PARTICULARS);
      } else if (route === 'section_8') {
        courtForms.push(N5_CLAIM);
        courtForms.push(N119_PARTICULARS);
      }
    }

    if (courtForms.length > 0) {
      categories.push({
        id: 'court_forms',
        title: jurisdiction === 'scotland' ? 'Tribunal Forms' : 'Court Forms',
        icon: '⚖️',
        documents: courtForms,
      });
    }
  }

  // ==========================================================================
  // AI-GENERATED DOCUMENTS (Complete Pack only)
  // ==========================================================================
  if (packType === 'complete_pack') {
    categories.push({
      id: 'ai_generated',
      title: 'Ask Heaven AI Documents',
      icon: '☁️',
      documents: [WITNESS_STATEMENT, COMPLIANCE_AUDIT, RISK_ASSESSMENT],
    });
  }

  // ==========================================================================
  // GUIDANCE DOCUMENTS
  // ==========================================================================
  const guidance: PackDocument[] = [SERVICE_INSTRUCTIONS, SERVICE_VALIDITY_CHECKLIST];

  if (packType === 'complete_pack') {
    // Add all guidance documents for complete pack
    guidance.unshift(EVICTION_ROADMAP);
    guidance.push(EXPERT_GUIDANCE);
    guidance.push(TIMELINE_EXPECTATIONS);
    guidance.push(CASE_SUMMARY);

    if (jurisdiction === 'scotland') {
      guidance.push(TRIBUNAL_LODGING_GUIDE);
    } else {
      guidance.push(COURT_FILING_GUIDE);
    }
  }

  categories.push({
    id: 'guidance',
    title: 'Guidance Documents',
    icon: '📋',
    documents: guidance,
  });

  // ==========================================================================
  // EVIDENCE TOOLS (Complete Pack only)
  // ==========================================================================
  if (packType === 'complete_pack') {
    const evidenceTools: PackDocument[] = [EVIDENCE_CHECKLIST, PROOF_OF_SERVICE];

    // Add arrears schedule if claiming rent arrears
    if (hasArrears || route === 'section_8') {
      evidenceTools.unshift(ARREARS_SCHEDULE);
    }

    categories.push({
      id: 'evidence_tools',
      title: 'Evidence Tools',
      icon: '📂',
      documents: evidenceTools,
    });
  }

  return categories;
}

/**
 * Get total document count for a pack
 */
export function getPackDocumentCount(options: PackContentsOptions): number {
  const categories = getEvictionPackContents(options);
  return categories.reduce((total, cat) => total + cat.documents.length, 0);
}

/**
 * Get human-readable route name
 */
export function getRouteName(route: string, jurisdiction: string): string {
  if (jurisdiction === 'scotland') {
    return 'Notice to Leave (PRT)';
  }

  switch (route) {
    case 'section_8':
      return 'Section 8 (Grounds-based)';
    case 'section_21':
      return 'Section 21 (No-fault)';
    case 'accelerated_possession':
    case 'accelerated_section21':
      return 'Section 21 Accelerated';
    default:
      return route;
  }
}
