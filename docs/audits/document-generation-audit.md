# Document Generation Audit Report

**Date:** 2025-12-31
**Scope:** ALL products across ALL jurisdictions
**Files Examined:** 15+ source files, 98 template files

---

## 1. DOCUMENT GENERATION AUDIT BY PRODUCT

### 1.1 Notice Only Pack (£29.99)

**Generation Flow:**
1. API: `src/app/api/notice-only/preview/[caseId]/route.ts` (lines 45-1064)
2. Merger: `src/lib/documents/notice-only-preview-merger.ts`
3. Route determines which templates are loaded
4. Documents merged into single PDF with TOC

---

#### **England - Section 21:**

| # | Document Name | Template Path | Purpose | Pages |
|---|---------------|---------------|---------|-------|
| 1 | Section 21 Notice (Form 6A) | `uk/england/templates/notice_only/form_6a_section21/notice.hbs` | Official no-fault eviction notice | ~4 |
| 2 | Service Instructions | `uk/england/templates/eviction/service_instructions_section_21.hbs` | How to legally serve the notice | ~2 |
| 3 | Service and Validity Checklist | `uk/england/templates/eviction/checklist_section_21.hbs` | Pre-service compliance verification | ~2 |

**Total: 3 documents, ~8 pages**

---

#### **England - Section 8:**

| # | Document Name | Template Path | Purpose | Pages |
|---|---------------|---------------|---------|-------|
| 1 | Section 8 Notice (Form 3) | `uk/england/templates/notice_only/form_3_section8/notice.hbs` | Grounds-based possession notice | ~5 |
| 2 | Service Instructions | `uk/england/templates/eviction/service_instructions_section_8.hbs` | How to legally serve the notice | ~2 |
| 3 | Service and Validity Checklist | `uk/england/templates/eviction/checklist_section_8.hbs` | Pre-service compliance verification | ~2 |

**Total: 3 documents, ~9 pages**

---

#### **Wales - Section 173 (No-Fault):**

| # | Document Name | Template Path | Purpose | Pages |
|---|---------------|---------------|---------|-------|
| 1 | Section 173 Landlord's Notice | `uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs` OR `rhw17_notice_termination_2_months/notice.hbs` | No-fault notice (auto-selects RHW16/RHW17 based on period) | ~4 |
| 2 | Service Instructions (Wales) | `uk/wales/templates/eviction/service_instructions_section_173.hbs` | How to legally serve the notice | ~2 |
| 3 | Service and Validity Checklist (Wales) | `uk/wales/templates/eviction/checklist_section_173.hbs` | Pre-service compliance verification | ~2 |

**Total: 3 documents, ~8 pages**

---

#### **Wales - Fault-Based:**

| # | Document Name | Template Path | Purpose | Pages |
|---|---------------|---------------|---------|-------|
| 1 | Notice Before Making a Possession Claim (RHW23) | `uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs` | Fault-based notice (S157/159/161/162) | ~4 |
| 2 | Service Instructions (Wales) | `uk/wales/templates/eviction/service_instructions_fault_based.hbs` | How to legally serve the notice | ~2 |
| 3 | Service and Validity Checklist (Wales) | `uk/wales/templates/eviction/checklist_fault_based.hbs` | Pre-service compliance verification | ~2 |

**Total: 3 documents, ~8 pages**

---

#### **Scotland - Notice to Leave:**

| # | Document Name | Template Path | Purpose | Pages |
|---|---------------|---------------|---------|-------|
| 1 | Notice to Leave (PRT) | `uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs` | PRT eviction notice | ~4 |
| 2 | Service Instructions | `uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs` | How to legally serve the notice | ~2 |
| 3 | Service and Validity Checklist | `uk/scotland/templates/eviction/checklist_notice_to_leave.hbs` | Pre-service compliance verification | ~2 |

**Total: 3 documents, ~8 pages**

---

#### **Northern Ireland:**

**STATUS: NOT SUPPORTED**
- API returns `NI_NOTICE_PREVIEW_UNSUPPORTED` error (line 116-128 in route.ts)
- Message: "Eviction notices are not supported in Northern Ireland. Tenancy agreements remain available."

---

### 1.2 Complete Eviction Pack (£149.99)

**Generation Flow:**
1. `src/lib/documents/eviction-pack-generator.ts` → `generateCompleteEvictionPack()`
2. Contents configuration: `src/lib/documents/eviction-pack-contents.ts`
3. Fulfillment: `src/lib/payments/fulfillment.ts`

---

#### **England - Section 8:**

| # | Document Name | Template Path | Category | Pages |
|---|---------------|---------------|----------|-------|
| 1 | Section 8 Notice (Form 3) | `uk/england/templates/notice_only/form_3_section8/notice.hbs` | notice | ~5 |
| 2 | Form N5 - Claim for Possession | Official PDF (`n5-eng.pdf`) | court_form | ~8 |
| 3 | Form N119 - Particulars of Claim | Official PDF | court_form | ~4 |
| 4 | Schedule of Arrears* | `uk/england/templates/money_claims/schedule_of_arrears.hbs` | evidence_tool | ~2 |
| 5 | Step-by-Step Eviction Roadmap | `uk/england/templates/eviction/eviction_roadmap.hbs` | guidance | ~3 |
| 6 | Expert Eviction Guidance | `uk/england/templates/eviction/expert_guidance.hbs` | guidance | ~3 |
| 7 | Eviction Timeline & Expectations | `shared/templates/eviction_timeline.hbs` | guidance | ~2 |
| 8 | Evidence Collection Checklist | `shared/templates/evidence_collection_checklist.hbs` | evidence_tool | ~2 |
| 9 | Proof of Service Certificate | `shared/templates/proof_of_service.hbs` | evidence_tool | ~1 |
| 10 | AI-Drafted Witness Statement | `uk/england/templates/eviction/witness-statement.hbs` | court_form | ~3 |
| 11 | Compliance Audit Report | `uk/england/templates/eviction/compliance-audit.hbs` | guidance | ~2 |
| 12 | Case Risk Assessment Report | `uk/england/templates/eviction/risk-report.hbs` | guidance | ~2 |
| 13 | Eviction Case Summary | `shared/templates/eviction_case_summary.hbs` | guidance | ~2 |

**Total: 12-13 documents, ~39 pages** (*Schedule of Arrears only if arrears grounds selected)

---

#### **England - Section 21:**

| # | Document Name | Template Path | Category | Pages |
|---|---------------|---------------|----------|-------|
| 1 | Section 21 Notice (Form 6A) | `uk/england/templates/notice_only/form_6a_section21/notice.hbs` | notice | ~4 |
| 2 | Form N5B - Accelerated Possession | Official PDF (`n5b-eng.pdf`) | court_form | ~6 |
| 3 | Form N5 - Claim for Possession | Official PDF (`n5-eng.pdf`) | court_form | ~8 |
| 4 | Form N119 - Particulars of Claim | Official PDF | court_form | ~4 |
| 5 | Step-by-Step Eviction Roadmap | `uk/england/templates/eviction/eviction_roadmap.hbs` | guidance | ~3 |
| 6 | Expert Eviction Guidance | `uk/england/templates/eviction/expert_guidance.hbs` | guidance | ~3 |
| 7 | Eviction Timeline & Expectations | `shared/templates/eviction_timeline.hbs` | guidance | ~2 |
| 8 | Evidence Collection Checklist | `shared/templates/evidence_collection_checklist.hbs` | evidence_tool | ~2 |
| 9 | Proof of Service Certificate | `shared/templates/proof_of_service.hbs` | evidence_tool | ~1 |
| 10 | AI-Drafted Witness Statement | `uk/england/templates/eviction/witness-statement.hbs` | court_form | ~3 |
| 11 | Compliance Audit Report | `uk/england/templates/eviction/compliance-audit.hbs` | guidance | ~2 |
| 12 | Case Risk Assessment Report | `uk/england/templates/eviction/risk-report.hbs` | guidance | ~2 |
| 13 | Eviction Case Summary | `shared/templates/eviction_case_summary.hbs` | guidance | ~2 |

**Total: 13 documents, ~42 pages**

---

#### **Wales - Section 173:**

| # | Document Name | Template Path | Category | Pages |
|---|---------------|---------------|----------|-------|
| 1 | Section 173 Landlord's Notice | Via `wales-section173-generator.ts` | notice | ~4 |
| 2 | Form N5B (Wales) - Accelerated | Official PDF (`N5B_WALES_0323.pdf`) | court_form | ~6 |
| 3 | Form N5 (Wales) | Official PDF (`N5_WALES.pdf`) | court_form | ~8 |
| 4 | Form N119 (Wales) | Official PDF (`N119_WALES.pdf`) | court_form | ~4 |
| 5-13 | (Same guidance docs as England) | Various | guidance/evidence | ~20 |

**Note:** Wales uses jurisdiction-specific official PDFs

---

#### **Scotland:**

| # | Document Name | Template Path | Category | Pages |
|---|---------------|---------------|----------|-------|
| 1 | Notice to Leave | `uk/scotland/templates/eviction/notice_to_leave.hbs` | notice | ~4 |
| 2 | Form E - Tribunal Application | Official PDF via `scotland-forms-filler.ts` | court_form | ~6 |
| 3 | Step-by-Step Eviction Roadmap | `uk/scotland/templates/eviction/eviction_roadmap.hbs` | guidance | ~3 |
| 4 | Expert Eviction Guidance | `uk/scotland/templates/eviction/expert_guidance.hbs` | guidance | ~3 |
| 5 | Eviction Timeline & Expectations | `shared/templates/eviction_timeline.hbs` | guidance | ~2 |
| 6 | Evidence Collection Checklist | `shared/templates/evidence_collection_checklist.hbs` | evidence_tool | ~2 |
| 7 | Proof of Service Certificate | `shared/templates/proof_of_service.hbs` | evidence_tool | ~1 |
| 8 | AI-Drafted Witness Statement | `uk/scotland/templates/eviction/witness-statement.hbs` | court_form | ~3 |
| 9 | Compliance Audit Report | `uk/scotland/templates/eviction/compliance-audit.hbs` | guidance | ~2 |
| 10 | Case Risk Assessment Report | `uk/scotland/templates/eviction/risk-report.hbs` | guidance | ~2 |
| 11 | Eviction Case Summary | `shared/templates/eviction_case_summary.hbs` | guidance | ~2 |

**Total: 11 documents, ~30 pages**

---

### 1.3 Money Claim Pack (£179.99)

**Generation Flow:**
1. England/Wales: `src/lib/documents/money-claim-pack-generator.ts`
2. Scotland: `src/lib/documents/scotland-money-claim-pack-generator.ts`

---

#### **England/Wales:**

| # | Document Name | Template Path | Category | Pages |
|---|---------------|---------------|----------|-------|
| 1 | Money Claim Pack Summary | `uk/england/templates/money_claims/pack_cover.hbs` | guidance | ~2 |
| 2 | Particulars of Claim | `uk/england/templates/money_claims/particulars_of_claim.hbs` | particulars | ~3 |
| 3 | Schedule of Arrears | `uk/england/templates/money_claims/schedule_of_arrears.hbs` | schedule | ~2 |
| 4 | Interest Calculation | `uk/england/templates/money_claims/interest_workings.hbs` | guidance | ~2 |
| 5 | Evidence Index | `uk/england/templates/money_claims/evidence_index.hbs` | evidence | ~1 |
| 6 | Court Hearing Preparation Sheet | `uk/england/templates/money_claims/hearing_prep_sheet.hbs` | guidance | ~3 |
| 7 | Letter Before Claim (PAP-DEBT) | `uk/england/templates/money_claims/letter_before_claim.hbs` | guidance | ~2 |
| 8 | Information Sheet for Defendants | `uk/england/templates/money_claims/information_sheet_for_defendants.hbs` | guidance | ~2 |
| 9 | Reply Form | `uk/england/templates/money_claims/reply_form.hbs` | guidance | ~1 |
| 10 | Financial Statement Form | `uk/england/templates/money_claims/financial_statement_form.hbs` | guidance | ~2 |
| 11 | Enforcement Guide | `uk/england/templates/money_claims/enforcement_guide.hbs` | guidance | ~3 |
| 12 | Filing Guide | `uk/england/templates/money_claims/filing_guide.hbs` | guidance | ~2 |
| 13 | Form N1 (Official PDF) | Official PDF (`N1_1224.pdf`) | court_form | ~8 |

**Total: 13 documents, ~33 pages**

---

#### **Scotland:**

| # | Document Name | Template Path | Category | Pages |
|---|---------------|---------------|----------|-------|
| 1 | Simple Procedure Pack Summary | `uk/scotland/templates/money_claims/pack_cover.hbs` | guidance | ~2 |
| 2 | Statement of Claim (Particulars) | `uk/scotland/templates/money_claims/simple_procedure_particulars.hbs` | particulars | ~3 |
| 3 | Schedule of Rent Arrears | `uk/scotland/templates/money_claims/schedule_of_arrears.hbs` | schedule | ~2 |
| 4 | Interest Calculation | `uk/scotland/templates/money_claims/interest_calculation.hbs` | guidance | ~2 |
| 5 | Evidence Index | `uk/scotland/templates/money_claims/evidence_index.hbs` | evidence | ~1 |
| 6 | Court Hearing Preparation Sheet | `uk/scotland/templates/money_claims/hearing_prep_sheet.hbs` | guidance | ~3 |
| 7 | Pre-Action Letter | `uk/scotland/templates/money_claims/pre_action_letter.hbs` | guidance | ~2 |
| 8 | Enforcement Guide (Diligence) | `uk/scotland/templates/money_claims/enforcement_guide_scotland.hbs` | guidance | ~3 |
| 9 | Simple Procedure Filing Guide | `uk/scotland/templates/money_claims/filing_guide_scotland.hbs` | guidance | ~2 |
| 10 | Form 3A (Official PDF) | Official PDF (`scotland/form-3a.pdf`) | court_form | ~6 |

**Total: 10 documents, ~26 pages**

---

### 1.4 AST Standard (£9.99)

**Generation Flow:**
1. `src/lib/documents/ast-generator.ts` → `generateStandardAST()`
2. Templates merged via `compileAndMergeTemplates()`

| # | Document Name | Template Path | Purpose | Pages |
|---|---------------|---------------|---------|-------|
| 1 | Standard AST Agreement | `uk/england/templates/standard_ast_formatted.hbs` | Main tenancy agreement | ~12 |
| 2 | Terms and Conditions | `shared/templates/terms_and_conditions.hbs` | Additional terms | ~3 |
| 3 | Certificate of Curation | `shared/templates/certificate_of_curation.hbs` | Document authenticity | ~1 |
| 4 | Legal Validity Summary | `uk/england/templates/ast_legal_validity_summary.hbs` | Legal compliance summary | ~2 |
| 5 | Government Model Clauses | `uk/england/templates/government_model_clauses.hbs` | Official guidance | ~3 |
| 6 | Deposit Protection Certificate | `shared/templates/deposit_protection_certificate.hbs` | Deposit template | ~1 |
| 7 | Inventory Template | `shared/templates/inventory_template.hbs` | Property inventory | ~4 |

**Total: 7 templates merged into 1 PDF, ~26 pages**

---

### 1.5 AST Premium (£14.99)

All Standard documents PLUS:

| # | Premium-Only Document | Template Path | Purpose | Pages |
|---|----------------------|---------------|---------|-------|
| 1 | Premium AST Agreement | `uk/england/templates/premium_ast_formatted.hbs` | Enhanced agreement | ~15 |
| 2 | Key Schedule | `uk/england/templates/premium/key_schedule.hbs` | Keys inventory | ~1 |
| 3 | Tenant Welcome Pack | `uk/england/templates/premium/tenant_welcome_pack.hbs` | Move-in guide | ~3 |
| 4 | Property Maintenance Guide | `uk/england/templates/premium/property_maintenance_guide.hbs` | Care instructions | ~2 |
| 5 | Move-In Condition Report | `uk/england/templates/premium/move_in_condition_report.hbs` | Initial inspection | ~3 |
| 6 | Checkout Procedure | `uk/england/templates/premium/checkout_procedure.hbs` | Move-out checklist | ~2 |

**Total: 12 templates merged into 1 PDF, ~32 pages**

---

## 2. IDENTIFY DUPLICATIONS

### 2.1 Same Template Used Across Products

| Template | Used In Products | Duplication Issue? |
|----------|------------------|-------------------|
| `shared/templates/evidence_collection_checklist.hbs` | Complete Pack (all) | ✅ Correct (shared) |
| `shared/templates/proof_of_service.hbs` | Complete Pack (all) | ✅ Correct (shared) |
| `shared/templates/eviction_timeline.hbs` | Complete Pack (all) | ✅ Correct (shared) |
| `shared/templates/eviction_case_summary.hbs` | Complete Pack (all) | ✅ Correct (shared) |
| `shared/templates/eviction_roadmap.hbs` | Fallback only | ⚠️ Could be orphaned |
| `uk/england/templates/money_claims/schedule_of_arrears.hbs` | Money Claim, Complete Pack (arrears) | ✅ Correct (reused) |

### 2.2 Similar/Overlapping Documents

| Document A | Document B | Overlap Description | Recommendation |
|------------|------------|---------------------|----------------|
| Section 8 Notice | Section 21 Notice | Different notices for different routes | ✅ Keep both (legal requirement) |
| Service Instructions (S8) | Service Instructions (S21) | Route-specific service rules | ✅ Keep both (legal differences) |
| eviction_roadmap.hbs (shared) | eviction_roadmap.hbs (jurisdiction) | Shared fallback vs jurisdiction-specific | ⚠️ Shared may be orphaned |
| notice_to_leave.hbs (eviction/) | notice_to_leave.hbs (notice_only/) | Two versions exist | ⚠️ Potential confusion |
| service_instructions.hbs (generic) | service_instructions_{route}.hbs | Generic vs route-specific | ⚠️ Generic may be orphaned |

### 2.3 Documents in Wrong Product

| Document | Currently In | Should Be In | Issue |
|----------|--------------|--------------|-------|
| Schedule of Arrears | Complete Pack (conditionally) | ✅ Correct | Only included when arrears grounds selected |
| N5B Form | Complete Pack Section 21 | ✅ Correct | Only for accelerated possession |

**No documents found in wrong products.**

---

## 3. IDENTIFY GAPS

### 3.1 Missing Documents by Product

#### **Notice Only - Missing:**

| Document Needed | Purpose | Priority |
|-----------------|---------|----------|
| ❌ None identified | - | - |

**Note:** Notice Only is intentionally minimal (notice + service instructions + checklist).

---

#### **Complete Pack - Missing:**

| Document Needed | Purpose | Priority |
|-----------------|---------|----------|
| Court Filing Guide (England) | `uk/england/templates/eviction/court_filing_guide.hbs` exists but NOT generated | **HIGH** |
| Next Steps Guide | `uk/england/templates/eviction/next_steps_guide.hbs` exists but NOT generated | MEDIUM |
| Tribunal Lodging Guide (Scotland) | `uk/scotland/templates/eviction/tribunal_lodging_guide.hbs` exists but NOT generated | **HIGH** |
| Pre-Action Checklist (Scotland) | `uk/scotland/templates/eviction/pre_action_checklist.hbs` exists but NOT generated | MEDIUM |
| Eviction Roadmap (Wales) | `uk/wales/templates/eviction/eviction_roadmap.hbs` does NOT exist | **HIGH** |
| Expert Guidance (Wales) | `uk/wales/templates/eviction/expert_guidance.hbs` does NOT exist | **HIGH** |
| Witness Statement (Wales) | `uk/wales/templates/eviction/witness-statement.hbs` does NOT exist | **HIGH** |
| Compliance Audit (Wales) | `uk/wales/templates/eviction/compliance-audit.hbs` does NOT exist | **HIGH** |
| Risk Report (Wales) | `uk/wales/templates/eviction/risk-report.hbs` does NOT exist | **HIGH** |

---

#### **Money Claim - Missing:**

| Document Needed | Purpose | Priority |
|-----------------|---------|----------|
| Money Claim (Wales) | Wales-specific templates do NOT exist | **CRITICAL** |
| Witness Statement Draft | AI-drafted claim support | MEDIUM |

**Critical Gap:** Money Claim generator uses `uk/england/templates` for Wales jurisdiction but Wales-specific templates don't exist in `uk/wales/templates/money_claims/`.

---

#### **AST - Missing:**

| Document Needed | Purpose | Priority |
|-----------------|---------|----------|
| Wales Occupation Contract Standard | `uk/wales/templates/standard_occupation_contract.hbs` exists | ⚠️ Check if used |
| Wales Occupation Contract Premium | `uk/wales/templates/premium_occupation_contract.hbs` exists | ⚠️ Check if used |
| Scotland PRT Agreement Standard | `uk/scotland/templates/prt_agreement.hbs` exists | ⚠️ Check if used |
| Scotland PRT Agreement Premium | `uk/scotland/templates/prt_agreement_premium.hbs` exists | ⚠️ Check if used |

---

### 3.2 Missing Jurisdiction Coverage

| Document | England | Wales | Scotland | NI | Gap? |
|----------|---------|-------|----------|-----|------|
| eviction_roadmap.hbs | ✅ | ❌ | ✅ | ❌ | **Need Wales version** |
| expert_guidance.hbs | ✅ | ❌ | ✅ | ❌ | **Need Wales version** |
| witness-statement.hbs | ✅ | ❌ | ✅ | ❌ | **Need Wales version** |
| compliance-audit.hbs | ✅ | ❌ | ✅ | ❌ | **Need Wales version** |
| risk-report.hbs | ✅ | ❌ | ✅ | ❌ | **Need Wales version** |
| court_filing_guide.hbs | ✅ | ❌ | N/A | ❌ | **Need Wales version** |
| tribunal_lodging_guide.hbs | N/A | N/A | ✅ | N/A | ✅ OK |
| Money claim templates | ✅ | ❌ | ✅ | ❌ | **CRITICAL: Wales needs own templates** |

---

## 4. TEMPLATE FILE AUDIT

### 4.1 All Template Files (98 total)

```
config/jurisdictions/
├── _shared/print/components.hbs
├── certificate.hbs
├── shared/templates/
│   ├── case_summary.hbs
│   ├── certificate_of_curation.hbs
│   ├── deposit_protection_certificate.hbs
│   ├── eviction_case_summary.hbs
│   ├── eviction_roadmap.hbs
│   ├── eviction_timeline.hbs
│   ├── evidence_collection_checklist.hbs
│   ├── inventory_template.hbs
│   ├── proof_of_service.hbs
│   └── terms_and_conditions.hbs
├── uk/england/templates/
│   ├── ast_legal_validity_summary.hbs
│   ├── deposit_protection_certificate.hbs
│   ├── government_model_clauses.hbs
│   ├── inventory_template.hbs
│   ├── letter_before_action.hbs
│   ├── money_claim.hbs
│   ├── n5_claim.hbs
│   ├── premium_ast.hbs
│   ├── premium_ast_formatted.hbs
│   ├── standard_ast.hbs
│   ├── standard_ast_formatted.hbs
│   ├── tenancy_deposit_information.hbs
│   ├── eviction/
│   │   ├── checklist_section_21.hbs
│   │   ├── checklist_section_8.hbs
│   │   ├── compliance-audit.hbs
│   │   ├── compliance_checklist.hbs
│   │   ├── court_filing_guide.hbs
│   │   ├── eviction_roadmap.hbs
│   │   ├── expert_guidance.hbs
│   │   ├── n119_particulars.hbs
│   │   ├── n5_claim.hbs
│   │   ├── n5b_claim.hbs
│   │   ├── next_steps_guide.hbs
│   │   ├── notice-improved.hbs
│   │   ├── notice-section8-improved.hbs
│   │   ├── risk-report.hbs
│   │   ├── service_instructions.hbs
│   │   ├── service_instructions_section_21.hbs
│   │   ├── service_instructions_section_8.hbs
│   │   └── witness-statement.hbs
│   ├── money_claims/
│   │   ├── enforcement_guide.hbs
│   │   ├── evidence_index.hbs
│   │   ├── filing_guide.hbs
│   │   ├── financial_statement_form.hbs
│   │   ├── hearing_prep_sheet.hbs
│   │   ├── information_sheet_for_defendants.hbs
│   │   ├── interest_workings.hbs
│   │   ├── letter_before_claim.hbs
│   │   ├── n1_claim.hbs
│   │   ├── pack_cover.hbs
│   │   ├── particulars_of_claim.hbs
│   │   ├── reply_form.hbs
│   │   └── schedule_of_arrears.hbs
│   ├── notice_only/
│   │   ├── form_3_section8/notice.hbs
│   │   └── form_6a_section21/notice.hbs
│   └── premium/
│       ├── checkout_procedure.hbs
│       ├── key_schedule.hbs
│       ├── move_in_condition_report.hbs
│       ├── property_maintenance_guide.hbs
│       └── tenant_welcome_pack.hbs
├── uk/wales/templates/
│   ├── premium_occupation_contract.hbs
│   ├── standard_occupation_contract.hbs
│   ├── eviction/
│   │   ├── checklist_fault_based.hbs
│   │   ├── checklist_section_173.hbs
│   │   ├── fault_based_notice.hbs
│   │   ├── section173_landlords_notice.hbs
│   │   ├── service_instructions.hbs
│   │   ├── service_instructions_fault_based.hbs
│   │   └── service_instructions_section_173.hbs
│   └── notice_only/
│       ├── rhw16_notice_termination_6_months/notice.hbs
│       ├── rhw17_notice_termination_2_months/notice.hbs
│       └── rhw23_notice_before_possession_claim/notice.hbs
├── uk/scotland/templates/
│   ├── deposit_protection_certificate.hbs
│   ├── inventory_template.hbs
│   ├── pre_action_requirements_letter.hbs
│   ├── prt_agreement.hbs
│   ├── prt_agreement_premium.hbs
│   ├── tribunal_application.hbs
│   ├── eviction/
│   │   ├── checklist_notice_to_leave.hbs
│   │   ├── compliance-audit.hbs
│   │   ├── eviction_roadmap.hbs
│   │   ├── expert_guidance.hbs
│   │   ├── notice_to_leave.hbs
│   │   ├── notice_to_leave_official.hbs
│   │   ├── pre_action_checklist.hbs
│   │   ├── risk-report.hbs
│   │   ├── service_instructions.hbs
│   │   ├── service_instructions_notice_to_leave.hbs
│   │   ├── tribunal_guide.hbs
│   │   ├── tribunal_lodging_guide.hbs
│   │   └── witness-statement.hbs
│   ├── money_claims/
│   │   ├── enforcement_guide_scotland.hbs
│   │   ├── evidence_index.hbs
│   │   ├── filing_guide_scotland.hbs
│   │   ├── hearing_prep_sheet.hbs
│   │   ├── interest_calculation.hbs
│   │   ├── pack_cover.hbs
│   │   ├── pre_action_letter.hbs
│   │   ├── schedule_of_arrears.hbs
│   │   └── simple_procedure_particulars.hbs
│   └── notice_only/
│       └── notice_to_leave_prt_2017/notice.hbs
└── uk/northern-ireland/templates/
    ├── deposit_protection_certificate.hbs
    ├── inventory_template.hbs
    ├── private_tenancy_agreement.hbs
    └── private_tenancy_premium.hbs
```

---

### 4.2 Templates by Category

#### **Notices (12)**

| Template | Jurisdiction | Used By Product |
|----------|--------------|-----------------|
| form_3_section8/notice.hbs | England | Notice Only, Complete Pack |
| form_6a_section21/notice.hbs | England | Notice Only, Complete Pack |
| rhw16_notice_termination_6_months/notice.hbs | Wales | Notice Only (auto-selected) |
| rhw17_notice_termination_2_months/notice.hbs | Wales | Notice Only (auto-selected) |
| rhw23_notice_before_possession_claim/notice.hbs | Wales | Notice Only (fault-based) |
| section173_landlords_notice.hbs | Wales | ⚠️ Unused (duplicate?) |
| fault_based_notice.hbs | Wales | ⚠️ Unused (duplicate?) |
| notice_to_leave_prt_2017/notice.hbs | Scotland | Notice Only |
| notice_to_leave.hbs | Scotland | Complete Pack |
| notice_to_leave_official.hbs | Scotland | ⚠️ Check usage |
| notice-improved.hbs | England | ⚠️ Unused |
| notice-section8-improved.hbs | England | ⚠️ Unused |

#### **Court Forms (Handlebars - 6)**

| Template | Jurisdiction | Used By Product |
|----------|--------------|-----------------|
| n5_claim.hbs | England | ⚠️ Duplicate (also in eviction/) |
| n5b_claim.hbs | England | Complete Pack |
| n119_particulars.hbs | England | Complete Pack |
| n1_claim.hbs | England | Money Claim |
| tribunal_application.hbs | Scotland | ⚠️ Check usage |

#### **Checklists (7)**

| Template | Jurisdiction | Used By Product |
|----------|--------------|-----------------|
| checklist_section_8.hbs | England | Notice Only, Complete Pack |
| checklist_section_21.hbs | England | Notice Only, Complete Pack |
| checklist_section_173.hbs | Wales | Notice Only |
| checklist_fault_based.hbs | Wales | Notice Only |
| checklist_notice_to_leave.hbs | Scotland | Notice Only |
| pre_action_checklist.hbs | Scotland | ⚠️ Not generated |
| compliance_checklist.hbs | England | ⚠️ Check usage |

#### **Guidance (20+)**

| Template | Jurisdiction | Used By Product |
|----------|--------------|-----------------|
| eviction_roadmap.hbs | Shared, England, Scotland | Complete Pack |
| expert_guidance.hbs | England, Scotland | Complete Pack |
| eviction_timeline.hbs | Shared | Complete Pack |
| service_instructions_*.hbs | All | Notice Only, Complete Pack |
| court_filing_guide.hbs | England | ⚠️ Not generated |
| tribunal_lodging_guide.hbs | Scotland | ⚠️ Not generated |
| filing_guide.hbs | England, Scotland | Money Claim |
| enforcement_guide.hbs | England, Scotland | Money Claim |
| Various money claim docs | England, Scotland | Money Claim |

#### **AI-Generated (6)**

| Template | Jurisdiction | Used By Product |
|----------|--------------|-----------------|
| witness-statement.hbs | England, Scotland | Complete Pack |
| compliance-audit.hbs | England, Scotland | Complete Pack |
| risk-report.hbs | England, Scotland | Complete Pack |

#### **Agreements (10)**

| Template | Jurisdiction | Used By Product |
|----------|--------------|-----------------|
| standard_ast.hbs | England | ⚠️ Duplicate |
| standard_ast_formatted.hbs | England | AST Standard |
| premium_ast.hbs | England | ⚠️ Duplicate |
| premium_ast_formatted.hbs | England | AST Premium |
| standard_occupation_contract.hbs | Wales | ⚠️ Check usage |
| premium_occupation_contract.hbs | Wales | ⚠️ Check usage |
| prt_agreement.hbs | Scotland | Scotland PRT |
| prt_agreement_premium.hbs | Scotland | Scotland PRT Premium |
| private_tenancy_agreement.hbs | NI | NI Tenancy |
| private_tenancy_premium.hbs | NI | NI Tenancy Premium |

---

### 4.3 Orphaned Templates (Potentially Unused)

| Template | Path | Why Unused? | Action |
|----------|------|-------------|--------|
| notice-improved.hbs | uk/england/templates/eviction/ | Appears to be superseded | **Delete** |
| notice-section8-improved.hbs | uk/england/templates/eviction/ | Appears to be superseded | **Delete** |
| section173_landlords_notice.hbs | uk/wales/templates/eviction/ | Superseded by rhw16/rhw17 | **Delete** |
| fault_based_notice.hbs | uk/wales/templates/eviction/ | Superseded by rhw23 | **Delete** |
| standard_ast.hbs | uk/england/templates/ | Superseded by _formatted version | **Delete** |
| premium_ast.hbs | uk/england/templates/ | Superseded by _formatted version | **Delete** |
| notice_to_leave_official.hbs | uk/scotland/templates/eviction/ | Check if used | **Review** |
| service_instructions.hbs (generic) | Multiple | Route-specific versions used | **Review** |
| eviction_roadmap.hbs (shared) | shared/templates/ | Jurisdiction versions exist | **Keep as fallback** |
| n5_claim.hbs | uk/england/templates/ | Duplicate in eviction/ | **Delete root copy** |
| case_summary.hbs | shared/templates/ | Similar to eviction_case_summary | **Review** |

---

## 5. GENERATION CODE AUDIT

### 5.1 Notice Only Generation Flow

**File:** `src/app/api/notice-only/preview/[caseId]/route.ts`

```
1. GET request → validate caseId
2. assertPaidEntitlement() → verify payment
3. Load case from database
4. wizardFactsToCaseFacts() → normalize facts
5. Determine jurisdiction (england/wales/scotland)
6. validateNoticeOnlyJurisdiction() → check config exists
7. validateForPreview() → unified validation
8. evaluateNoticeCompliance() → compliance check
9. Switch by jurisdiction:
   - England: mapNoticeOnlyFacts() → generate S8/S21 notice + service instructions + checklist
   - Wales: mapNoticeOnlyFacts() → generate RHW16/17/23 + service instructions + checklist
   - Scotland: mapNoticeOnlyFacts() → generate Notice to Leave + service instructions + checklist
10. generateNoticeOnlyPreview() → merge documents with TOC
11. Return PDF response
```

**Key Templates (England S8 example):**
```typescript
// Line 508-526: Section 8 Notice
templatePath: 'uk/england/templates/notice_only/form_3_section8/notice.hbs'

// Line 573-591: Service Instructions
templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs'

// Line 594-611: Checklist
templatePath: 'uk/england/templates/eviction/checklist_section_8.hbs'
```

---

### 5.2 Complete Pack Generation Flow

**File:** `src/lib/documents/eviction-pack-generator.ts`

```
1. generateCompleteEvictionPack(wizardFacts)
2. Validate jurisdiction
3. Load eviction grounds
4. assertCompletePackValid() → validate required fields
5. Switch by jurisdiction:
   - England/Wales: wizardFactsToEnglandWalesEviction() → generateEnglandOrWalesEvictionPack()
   - Scotland: wizardFactsToScotlandEviction() → generateScotlandEvictionPack()
6. Generate guidance documents:
   - generateEvictionRoadmap()
   - generateExpertGuidance()
   - generateTimelineExpectations()
   - generateEvidenceChecklist()
   - generateProofOfService()
7. Generate AI documents:
   - generateWitnessStatement()
   - generateComplianceAudit()
   - computeRiskAssessment()
8. Generate case summary
9. Return CompleteEvictionPack with all documents
```

---

### 5.3 Money Claim Generation Flow

**File:** `src/lib/documents/money-claim-pack-generator.ts`

```
1. generateMoneyClaimPack(claim, caseFacts)
2. Validate jurisdiction (England/Wales only)
3. calculateTotals() → compute arrears, interest, fees
4. generateMoneyClaimAskHeavenDrafts() → AI content (optional)
5. Generate documents in order:
   - Pack cover
   - Particulars of claim
   - Schedule of arrears
   - Interest calculation
   - Evidence index
   - Hearing prep sheet
   - Letter Before Claim (PAP-DEBT)
   - Information sheet for defendants
   - Reply form
   - Financial statement form
   - Enforcement guide
   - Filing guide
6. fillN1Form() → official PDF
7. Return MoneyClaimPack
```

---

### 5.4 AST Generation Flow

**File:** `src/lib/documents/ast-generator.ts`

```
1. generateStandardAST(data) or generatePremiumAST(data)
2. validateASTData() → check required fields
3. Set jurisdiction defaults
4. Build templatePaths array:
   Standard: 7 templates
   Premium: 12 templates (Standard + 5 premium)
5. compileAndMergeTemplates(templatePaths, data)
6. htmlToPdf(mergedHtml)
7. Return GeneratedDocument with merged PDF
```

---

## 6. DOCUMENT COUNT VERIFICATION

### 6.1 Expected vs Actual Document Counts

| Product | Route | Expected Count | Actual Count | Match? |
|---------|-------|----------------|--------------|--------|
| Notice Only (England S21) | section_21 | 3 | 3 | ✅ |
| Notice Only (England S8) | section_8 | 3 | 3 | ✅ |
| Notice Only (Wales S173) | wales_section_173 | 3 | 3 | ✅ |
| Notice Only (Wales Fault) | wales_fault_based | 3 | 3 | ✅ |
| Notice Only (Scotland) | notice_to_leave | 3 | 3 | ✅ |
| Complete Pack (England S8) | section_8 | 12+ | 12-13 | ✅ |
| Complete Pack (England S21) | section_21 | 13+ | 13 | ✅ |
| Complete Pack (Scotland) | notice_to_leave | 11+ | 11 | ✅ |
| Money Claim (England/Wales) | - | 13 | 13 | ✅ |
| Money Claim (Scotland) | - | 10 | 10 | ✅ |
| AST Standard | - | 1 (7 merged) | 1 | ✅ |
| AST Premium | - | 1 (12 merged) | 1 | ✅ |

---

## 7. OVERLAP ANALYSIS: NOTICE ONLY vs COMPLETE PACK

### 7.1 Documents in BOTH Products

| Document | In Notice Only | In Complete Pack | Issue |
|----------|----------------|------------------|-------|
| Section 8/21/173 Notice | ✅ | ✅ | **DUPLICATE** |
| Service Instructions | ✅ | ❌ (implicit in roadmap) | ⚠️ Overlap |
| Validity Checklist | ✅ | ❌ (not explicitly generated) | ⚠️ Gap in Complete Pack |

### 7.2 Analysis

**Current State:**
- Notice Only generates: Notice + Service Instructions + Checklist
- Complete Pack generates: Notice + Court Forms + Guidance + AI docs

**Issue:** A customer who buys Notice Only (£29.99) then later buys Complete Pack (£149.99) gets a duplicate notice document.

### 7.3 Recommendation

**Option C: Offer upgrade pricing** (RECOMMENDED)

- Complete Pack should detect if Notice Only was already purchased
- Offer upgrade: Complete Pack - Notice Only = £120 (£149.99 - £29.99)
- Complete Pack includes the same notice, so duplication is acceptable
- Service Instructions and Checklist are NOT duplicated (different guidance in Complete Pack)

**Implementation Note:** The Complete Pack does NOT currently generate the checklist that Notice Only generates. Consider adding it or documenting this as intentional (Complete Pack has more comprehensive guidance documents).

---

## 8. SUMMARY OUTPUT

### 8.1 Complete Document Matrix

| Document | Notice Only | Complete Pack | Money Claim | AST Std | AST Prem |
|----------|-------------|---------------|-------------|---------|----------|
| **NOTICES** |
| Section 8 Notice (Form 3) | ✅ (S8 route) | ✅ (S8 route) | ❌ | ❌ | ❌ |
| Section 21 Notice (Form 6A) | ✅ (S21 route) | ✅ (S21 route) | ❌ | ❌ | ❌ |
| Wales S173 Notice | ✅ (Wales) | ✅ (Wales) | ❌ | ❌ | ❌ |
| Wales Fault Notice (RHW23) | ✅ (Wales) | ❌ | ❌ | ❌ | ❌ |
| Notice to Leave (Scotland) | ✅ (Scotland) | ✅ (Scotland) | ❌ | ❌ | ❌ |
| **COURT FORMS** |
| N5 Claim Form | ❌ | ✅ | ❌ | ❌ | ❌ |
| N119 Particulars | ❌ | ✅ | ❌ | ❌ | ❌ |
| N5B Accelerated | ❌ | ✅ (S21) | ❌ | ❌ | ❌ |
| N1 Money Claim | ❌ | ❌ | ✅ | ❌ | ❌ |
| Form E (Scotland) | ❌ | ✅ (Scotland) | ❌ | ❌ | ❌ |
| Form 3A (Scotland) | ❌ | ❌ | ✅ (Scotland) | ❌ | ❌ |
| **GUIDANCE** |
| Service Instructions | ✅ | ❌ | ❌ | ❌ | ❌ |
| Validity Checklist | ✅ | ❌ | ❌ | ❌ | ❌ |
| Eviction Roadmap | ❌ | ✅ | ❌ | ❌ | ❌ |
| Expert Guidance | ❌ | ✅ | ❌ | ❌ | ❌ |
| Timeline Expectations | ❌ | ✅ | ❌ | ❌ | ❌ |
| Case Summary | ❌ | ✅ | ❌ | ❌ | ❌ |
| Filing Guide | ❌ | ❌ | ✅ | ❌ | ❌ |
| Enforcement Guide | ❌ | ❌ | ✅ | ❌ | ❌ |
| **EVIDENCE TOOLS** |
| Evidence Checklist | ❌ | ✅ | ❌ | ❌ | ❌ |
| Proof of Service | ❌ | ✅ | ❌ | ❌ | ❌ |
| Schedule of Arrears | ❌ | ✅ (if arrears) | ✅ | ❌ | ❌ |
| Evidence Index | ❌ | ❌ | ✅ | ❌ | ❌ |
| **AI-GENERATED** |
| Witness Statement | ❌ | ✅ | ❌ | ❌ | ❌ |
| Compliance Audit | ❌ | ✅ | ❌ | ❌ | ❌ |
| Risk Assessment | ❌ | ✅ | ❌ | ❌ | ❌ |
| **AST DOCUMENTS** |
| Tenancy Agreement | ❌ | ❌ | ❌ | ✅ | ✅ |
| Terms & Conditions | ❌ | ❌ | ❌ | ✅ | ✅ |
| Certificate of Curation | ❌ | ❌ | ❌ | ✅ | ✅ |
| Government Model Clauses | ❌ | ❌ | ❌ | ✅ | ✅ |
| Deposit Protection Cert | ❌ | ❌ | ❌ | ✅ | ✅ |
| Inventory Template | ❌ | ❌ | ❌ | ✅ | ✅ |
| Legal Validity Summary | ❌ | ❌ | ❌ | ✅ | ✅ |
| Key Schedule | ❌ | ❌ | ❌ | ❌ | ✅ |
| Tenant Welcome Pack | ❌ | ❌ | ❌ | ❌ | ✅ |
| Maintenance Guide | ❌ | ❌ | ❌ | ❌ | ✅ |
| Move-In Condition Report | ❌ | ❌ | ❌ | ❌ | ✅ |
| Checkout Procedure | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 8.2 Duplication Issues Found

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| Notice duplicated in Notice Only + Complete Pack | LOW | ✅ Acceptable - offer upgrade pricing |
| 10+ orphaned template files | MEDIUM | **Delete unused templates** |
| Duplicate n5_claim.hbs locations | LOW | Delete root copy |
| Two notice_to_leave.hbs versions | LOW | Consolidate to one canonical |

---

### 8.3 Gaps Found

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| Wales missing money_claims/ templates | **CRITICAL** | Create Wales money claim templates |
| Wales missing eviction_roadmap.hbs | **HIGH** | Create Wales eviction roadmap |
| Wales missing expert_guidance.hbs | **HIGH** | Create Wales expert guidance |
| Wales missing witness-statement.hbs | **HIGH** | Create Wales witness statement |
| Wales missing compliance-audit.hbs | **HIGH** | Create Wales compliance audit |
| Wales missing risk-report.hbs | **HIGH** | Create Wales risk report |
| Complete Pack missing court_filing_guide | **HIGH** | Add to generation code |
| Complete Pack missing service checklist | MEDIUM | Add or document as intentional |
| Scotland Complete Pack missing tribunal_lodging_guide | **HIGH** | Add to generation code |
| NI eviction notices not supported | LOW | Document as known limitation |

---

### 8.4 Recommended Changes Before Unbundling

**Priority 1: CRITICAL (Must fix)**
1. Create Wales money claim templates (copy from England, adapt for Welsh law)
2. Fix money-claim-pack-generator.ts to use Wales templates when jurisdiction=wales

**Priority 2: HIGH (Should fix)**
3. Create Wales eviction templates:
   - eviction_roadmap.hbs
   - expert_guidance.hbs
   - witness-statement.hbs
   - compliance-audit.hbs
   - risk-report.hbs
4. Add court_filing_guide.hbs to Complete Pack generation
5. Add tribunal_lodging_guide.hbs to Scotland Complete Pack
6. Delete orphaned templates (10+ files)

**Priority 3: MEDIUM**
7. Implement upgrade pricing for Notice Only → Complete Pack
8. Add service checklist to Complete Pack (or document omission)
9. Consolidate duplicate templates
10. Review unused Scotland/Wales/NI tenancy templates

**Priority 4: LOW**
11. Document NI eviction notice limitation
12. Review and clean up legacy template versions

---

## 9. FILE REFERENCES

| File | Purpose |
|------|---------|
| `src/app/api/notice-only/preview/[caseId]/route.ts` | Notice Only API endpoint |
| `src/lib/documents/notice-only-preview-merger.ts` | Notice Only PDF merger |
| `src/lib/documents/eviction-pack-generator.ts` | Complete Pack generation |
| `src/lib/documents/eviction-pack-contents.ts` | Complete Pack contents config |
| `src/lib/documents/money-claim-pack-generator.ts` | Money Claim generation (England/Wales) |
| `src/lib/documents/scotland-money-claim-pack-generator.ts` | Money Claim generation (Scotland) |
| `src/lib/documents/ast-generator.ts` | AST generation (Standard/Premium) |
| `src/lib/documents/wales-section173-generator.ts` | Wales S173 notice generator |
| `src/lib/documents/section8-generator.ts` | Section 8 notice generator |
| `src/lib/documents/section21-generator.ts` | Section 21 notice generator |
| `src/lib/documents/generator.ts` | Core document generation |
| `src/lib/payments/fulfillment.ts` | Post-payment fulfillment |
| `config/jurisdictions/` | All 98 template files |

---

**END OF AUDIT**
