/**
 * Template Configuration
 *
 * Maps document IDs to their template paths for generating individual PDFs.
 * Used by fulfillment to generate separate documents for each product.
 */

export interface TemplateConfig {
  id: string;
  templatePath: string;
  title: string;
  type: string;
  description: string;
  category: 'notice' | 'court_form' | 'guidance' | 'evidence_tool' | 'checklist' | 'ai_generated';
}

// ============================================
// NOTICE ONLY TEMPLATES
// ============================================

export function getNoticeOnlyTemplates(jurisdiction: string, noticeRoute: string): TemplateConfig[] {
  const templates: TemplateConfig[] = [];

  // ENGLAND
  if (jurisdiction === 'england') {
    if (noticeRoute === 'section_21' || noticeRoute === 'section-21' || noticeRoute === 'accelerated_possession' || noticeRoute === 'accelerated_section21') {
      templates.push(
        {
          id: 'notice-section-21',
          templatePath: 'uk/england/templates/notice_only/form_6a_section21/notice.hbs',
          title: 'Section 21 Notice (Form 6A)',
          type: 'notice',
          description: 'Your legally compliant no-fault eviction notice',
          category: 'notice',
        },
        {
          id: 'service-instructions-s21',
          templatePath: 'uk/england/templates/eviction/service_instructions_section_21.hbs',
          title: 'Service Instructions',
          type: 'guidance',
          description: 'How to properly serve your Section 21 notice',
          category: 'guidance',
        },
        {
          id: 'validity-checklist-s21',
          templatePath: 'uk/england/templates/eviction/checklist_section_21.hbs',
          title: 'Service & Validity Checklist',
          type: 'checklist',
          description: 'Ensure your notice meets all legal requirements',
          category: 'checklist',
        }
      );
    } else if (noticeRoute === 'section_8' || noticeRoute === 'section-8') {
      templates.push(
        {
          id: 'notice-section-8',
          templatePath: 'uk/england/templates/notice_only/form_3_section8/notice.hbs',
          title: 'Section 8 Notice (Form 3)',
          type: 'notice',
          description: 'Your grounds-based possession notice',
          category: 'notice',
        },
        {
          id: 'service-instructions-s8',
          templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs',
          title: 'Service Instructions',
          type: 'guidance',
          description: 'How to properly serve your Section 8 notice',
          category: 'guidance',
        },
        {
          id: 'validity-checklist-s8',
          templatePath: 'uk/england/templates/eviction/checklist_section_8.hbs',
          title: 'Service & Validity Checklist',
          type: 'checklist',
          description: 'Ensure your notice meets all legal requirements',
          category: 'checklist',
        }
      );
    }
  }

  // WALES
  if (jurisdiction === 'wales') {
    if (noticeRoute === 'section_173' || noticeRoute === 'section-173' || noticeRoute === 'wales_section_173') {
      templates.push(
        {
          id: 'notice-section-173',
          templatePath: 'uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs',
          title: "Section 173 Landlord's Notice",
          type: 'notice',
          description: 'No-fault notice under Renting Homes (Wales) Act 2016',
          category: 'notice',
        },
        {
          id: 'service-instructions-s173',
          templatePath: 'uk/wales/templates/eviction/service_instructions_section_173.hbs',
          title: 'Service Instructions (Wales)',
          type: 'guidance',
          description: 'How to properly serve your Section 173 notice',
          category: 'guidance',
        },
        {
          id: 'validity-checklist-s173',
          templatePath: 'uk/wales/templates/eviction/checklist_section_173.hbs',
          title: 'Service & Validity Checklist (Wales)',
          type: 'checklist',
          description: 'Welsh law compliance checklist',
          category: 'checklist',
        }
      );
    } else if (noticeRoute === 'fault_based' || noticeRoute === 'fault-based' || noticeRoute === 'wales_fault_based') {
      templates.push(
        {
          id: 'notice-fault-based',
          templatePath: 'uk/wales/templates/notice_only/rhw23_notice_breach/notice.hbs',
          title: 'Fault-Based Notice (RHW23)',
          type: 'notice',
          description: 'Notice for breach of contract under Welsh law',
          category: 'notice',
        },
        {
          id: 'service-instructions-fault',
          templatePath: 'uk/wales/templates/eviction/service_instructions_fault_based.hbs',
          title: 'Service Instructions (Wales)',
          type: 'guidance',
          description: 'How to properly serve your fault-based notice',
          category: 'guidance',
        },
        {
          id: 'validity-checklist-fault',
          templatePath: 'uk/wales/templates/eviction/checklist_fault_based.hbs',
          title: 'Service & Validity Checklist (Wales)',
          type: 'checklist',
          description: 'Welsh law compliance checklist for fault-based notices',
          category: 'checklist',
        }
      );
    }
    // REMOVED: Wales Section 8 fallback
    // Section 8 (Housing Act 1988) does NOT apply to Wales.
    // Wales uses Renting Homes (Wales) Act 2016 with Section 173 (no-fault) or fault_based routes.
    // If section_8 route is passed for Wales, it's a bug - return empty templates.
    if (noticeRoute === 'section_8' || noticeRoute === 'section-8' || noticeRoute === 'section_21' || noticeRoute === 'section-21') {
      console.warn(
        `[template-configs] JURISDICTION ERROR: Route "${noticeRoute}" is not valid for Wales. ` +
        `Section 8/21 (Housing Act 1988) apply to England only. ` +
        `Use section_173 or fault_based routes for Wales.`
      );
      // Return empty - do not add any templates for invalid routes
    }
  }

  // SCOTLAND
  if (jurisdiction === 'scotland') {
    templates.push(
      {
        id: 'notice-to-leave',
        templatePath: 'uk/scotland/templates/eviction/notice_to_leave.hbs',
        title: 'Notice to Leave (PRT)',
        type: 'notice',
        description: 'Private Residential Tenancy eviction notice',
        category: 'notice',
      },
      {
        id: 'service-instructions-ntl',
        templatePath: 'uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs',
        title: 'Service Instructions (Scotland)',
        type: 'guidance',
        description: 'How to properly serve your Notice to Leave',
        category: 'guidance',
      },
      {
        id: 'validity-checklist-ntl',
        templatePath: 'uk/scotland/templates/eviction/checklist_notice_to_leave.hbs',
        title: 'Service & Validity Checklist (Scotland)',
        type: 'checklist',
        description: 'Scottish tenancy law compliance checklist',
        category: 'checklist',
      }
    );
  }

  return templates;
}

// ============================================
// COMPLETE PACK ADDITIONAL TEMPLATES
// ============================================

export function getCompletePackTemplates(jurisdiction: string, noticeRoute: string): TemplateConfig[] {
  const templates: TemplateConfig[] = [];

  // Start with Notice Only templates
  const noticeTemplates = getNoticeOnlyTemplates(jurisdiction, noticeRoute);
  templates.push(...noticeTemplates);

  // Add court forms (note: these are filled PDFs, not HBS templates)
  // The generator handles N5, N119, N5B via pdf-lib

  // Add guidance templates - Eviction Roadmap now consolidates timeline and expert tips
  if (jurisdiction === 'england' || jurisdiction === 'wales') {
    templates.push(
      {
        id: 'eviction-roadmap',
        templatePath: `uk/${jurisdiction}/templates/eviction/eviction_roadmap.hbs`,
        title: 'Eviction Roadmap & Timeline',
        type: 'guidance',
        description: 'Complete visual guide with stages, timelines, costs, and expert tips',
        category: 'guidance',
      },
      {
        id: 'court-filing-guide',
        templatePath: `uk/${jurisdiction}/templates/eviction/court_filing_guide.hbs`,
        title: 'Court Filing Guide',
        type: 'guidance',
        description: 'How to file your claim at County Court or online',
        category: 'guidance',
      }
    );
  }

  if (jurisdiction === 'scotland') {
    templates.push(
      {
        id: 'eviction-roadmap',
        templatePath: 'uk/scotland/templates/eviction/eviction_roadmap.hbs',
        title: 'Eviction Roadmap & Timeline',
        type: 'guidance',
        description: 'Complete visual guide with stages, timelines, costs, and expert tips',
        category: 'guidance',
      },
      {
        id: 'tribunal-lodging-guide',
        templatePath: 'uk/scotland/templates/eviction/tribunal_lodging_guide.hbs',
        title: 'Tribunal Lodging Guide',
        type: 'guidance',
        description: 'How to lodge with First-tier Tribunal',
        category: 'guidance',
      }
    );
  }

  // Evidence tools (shared templates)
  templates.push(
    {
      id: 'evidence-checklist',
      templatePath: 'shared/templates/evidence_collection_checklist.hbs',
      title: 'Evidence Collection Checklist',
      type: 'evidence_tool',
      description: 'What documents and evidence you need for court',
      category: 'evidence_tool',
    },
    {
      id: 'proof-of-service',
      templatePath: 'shared/templates/proof_of_service.hbs',
      title: 'Proof of Service Template',
      type: 'evidence_tool',
      description: 'Certificate of service / proof of posting template',
      category: 'evidence_tool',
    }
  );

  return templates;
}

// ============================================
// AST TEMPLATES
// ============================================

export function getASTTemplates(jurisdiction: string, tier: 'standard' | 'premium'): TemplateConfig[] {
  const templates: TemplateConfig[] = [];

  // Main agreement template
  if (jurisdiction === 'england') {
    templates.push({
      id: 'tenancy-agreement',
      templatePath: tier === 'premium' ? 'uk/england/templates/premium_ast.hbs' : 'uk/england/templates/standard_ast.hbs',
      title: tier === 'premium' ? 'Premium AST Agreement' : 'Standard AST Agreement',
      type: 'agreement',
      description: 'Assured Shorthold Tenancy Agreement',
      category: 'notice', // Using 'notice' for main docs
    });
  } else if (jurisdiction === 'wales') {
    templates.push({
      id: 'tenancy-agreement',
      templatePath: 'uk/wales/templates/standard_occupation_contract.hbs',
      title: 'Standard Occupation Contract',
      type: 'agreement',
      description: 'Renting Homes (Wales) Act 2016 compliant contract',
      category: 'notice',
    });
  } else if (jurisdiction === 'scotland') {
    templates.push({
      id: 'tenancy-agreement',
      templatePath: 'uk/scotland/templates/private_residential_tenancy.hbs',
      title: 'Private Residential Tenancy Agreement',
      type: 'agreement',
      description: 'PRT compliant with Scottish legislation',
      category: 'notice',
    });
  }

  // Standard tier documents
  templates.push(
    {
      id: 'government-model-clauses',
      templatePath: 'uk/england/templates/government_model_clauses.hbs',
      title: 'Government Model Clauses',
      type: 'schedule',
      description: 'Recommended clauses from official guidance',
      category: 'guidance',
    },
    {
      id: 'deposit-protection-cert',
      templatePath: 'uk/england/templates/deposit_protection_certificate.hbs',
      title: 'Deposit Protection Certificate',
      type: 'certificate',
      description: 'Template for recording deposit protection',
      category: 'checklist',
    },
    {
      id: 'legal-validity-summary',
      templatePath: 'uk/england/templates/ast_legal_validity_summary.hbs',
      title: 'Legal Validity Summary',
      type: 'summary',
      description: 'Summary of legal compliance',
      category: 'guidance',
    }
  );

  // Premium tier additional documents
  if (tier === 'premium') {
    templates.push(
      {
        id: 'key-schedule',
        templatePath: 'uk/england/templates/premium/key_schedule.hbs',
        title: 'Key Schedule',
        type: 'schedule',
        description: 'Record of all keys provided to tenant',
        category: 'checklist',
      },
      {
        id: 'welcome-pack',
        templatePath: 'uk/england/templates/premium/tenant_welcome_pack.hbs',
        title: 'Tenant Welcome Pack',
        type: 'guidance',
        description: 'Comprehensive move-in guide',
        category: 'guidance',
      },
      {
        id: 'maintenance-guide',
        templatePath: 'uk/england/templates/premium/property_maintenance_guide.hbs',
        title: 'Property Maintenance Guide',
        type: 'guidance',
        description: 'Tenant and landlord responsibilities',
        category: 'guidance',
      },
      {
        id: 'condition-report',
        templatePath: 'uk/england/templates/premium/move_in_condition_report.hbs',
        title: 'Move-In Condition Report',
        type: 'report',
        description: 'Room-by-room property assessment',
        category: 'checklist',
      },
      {
        id: 'checkout-procedure',
        templatePath: 'uk/england/templates/premium/checkout_procedure.hbs',
        title: 'Checkout Procedure',
        type: 'guidance',
        description: 'End of tenancy process guide',
        category: 'guidance',
      }
    );
  }

  return templates;
}

// ============================================
// MONEY CLAIM TEMPLATES
// ============================================

export function getMoneyClaimTemplates(jurisdiction: string): TemplateConfig[] {
  const templates: TemplateConfig[] = [];

  const jurisdictionPath = jurisdiction === 'scotland' ? 'scotland' : 'england';

  // Main court form (handled by generator via pdf-lib for N1)
  // Add guidance and support documents
  templates.push(
    {
      id: 'particulars-of-claim',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/particulars_of_claim.hbs`,
      title: 'Particulars of Claim',
      type: 'court_document',
      description: 'Detailed breakdown of your claim',
      category: 'court_form',
    },
    {
      id: 'schedule-of-arrears',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/schedule_of_arrears.hbs`,
      title: 'Schedule of Arrears',
      type: 'schedule',
      description: 'Line-by-line breakdown of rent owed',
      category: 'evidence_tool',
    },
    {
      id: 'interest-calculation',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/interest_workings.hbs`,
      title: 'Interest Calculation',
      type: 'schedule',
      description: 'Statutory interest calculation',
      category: 'evidence_tool',
    },
    {
      id: 'letter-before-claim',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/letter_before_claim.hbs`,
      title: 'Letter Before Claim',
      type: 'letter',
      description: 'PAP-DEBT compliant letter before action',
      category: 'notice',
    },
    {
      id: 'information-sheet',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/information_sheet_for_defendants.hbs`,
      title: 'Defendant Information Sheet',
      type: 'guidance',
      description: 'Required information sheet for defendant',
      category: 'guidance',
    },
    {
      id: 'reply-form',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/reply_form.hbs`,
      title: 'Reply Form',
      type: 'form',
      description: 'Form for defendant to respond',
      category: 'checklist',
    },
    {
      id: 'financial-statement',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/financial_statement_form.hbs`,
      title: 'Financial Statement Form',
      type: 'form',
      description: 'Income and expenditure form',
      category: 'checklist',
    },
    {
      id: 'filing-guide',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/filing_guide.hbs`,
      title: 'Court Filing Guide',
      type: 'guidance',
      description: 'How to file via MCOL or paper',
      category: 'guidance',
    },
    {
      id: 'hearing-prep',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/hearing_prep_sheet.hbs`,
      title: 'Court Hearing Prep Sheet',
      type: 'guidance',
      description: 'What to say and bring to court',
      category: 'guidance',
    },
    {
      id: 'enforcement-guide',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/enforcement_guide.hbs`,
      title: 'Enforcement Guide',
      type: 'guidance',
      description: 'Options for enforcing judgment',
      category: 'guidance',
    },
    {
      id: 'evidence-index',
      templatePath: `uk/${jurisdictionPath}/templates/money_claims/evidence_index.hbs`,
      title: 'Evidence Index',
      type: 'evidence_tool',
      description: 'Checklist of supporting evidence',
      category: 'evidence_tool',
    }
  );

  return templates;
}
