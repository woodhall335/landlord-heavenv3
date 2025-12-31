# Document Generation, Bundling, and Compliance Documentation Audit

**Date:** 2025-12-31
**Auditor:** Claude Code
**Scope:** Complete document generation structure, compliance documentation, and bundling

---

## Executive Summary

This audit examines how Landlord Heaven generates, bundles, and delivers documents across all products. Key findings include:

- **Notice Only Pack (£29.99)**: Generates 3 documents merged into a single PDF (notice + service instructions + checklist)
- **Complete Eviction Pack (£149.99)**: Generates 10-15 separate PDFs stored individually
- **Money Claim Pack (£179.99)**: Generates 13 separate PDFs including official N1 form
- **AST Standard/Premium**: Generates 1 merged PDF containing 7-12 templates
- **Compliance questions ARE collected** but **compliance summary document is NOT generated**

---

## 1. DOCUMENT GENERATION STRUCTURE

### 1.1 Notice Only Pack (£29.99)

**API Endpoint:** `GET /api/notice-only/preview/[caseId]`
**File:** `src/app/api/notice-only/preview/[caseId]/route.ts`

**Documents Generated (Merged into Single PDF):**

| Document | Description | Template Location |
|----------|-------------|-------------------|
| Section 8 Notice (Form 3) | OR Section 21 (Form 6A) | `uk/england/templates/notice_only/form_3_section8/notice.hbs` |
| Service Instructions | Route-specific serving guidance | `uk/england/templates/eviction/service_instructions_section_8.hbs` |
| Service & Validity Checklist | Route-specific checklist | `uk/england/templates/eviction/checklist_section_8.hbs` |

**By Jurisdiction:**

| Jurisdiction | Notice Type | Documents Merged |
|--------------|-------------|------------------|
| England (Section 8) | Form 3 | Notice + S8 Service Instructions + S8 Checklist |
| England (Section 21) | Form 6A | Notice + S21 Service Instructions + S21 Checklist |
| Wales (Section 173) | RHW16/RHW17 | Notice + S173 Service Instructions + S173 Checklist |
| Wales (Fault-Based) | RHW23 | Notice + Fault-Based Service Instructions + Fault-Based Checklist |
| Scotland | Notice to Leave | Notice + NTL Service Instructions + NTL Checklist |

**Output Format:** Single merged PDF returned directly (not stored in database)

**Generator File:** `src/lib/documents/notice-only-preview-merger.ts`

---

### 1.2 Complete Eviction Pack (£149.99)

**API Endpoint:** POST `/api/documents/generate` (via fulfillment)
**Generator File:** `src/lib/documents/eviction-pack-generator.ts`
**Contents Definition:** `src/lib/documents/eviction-pack-contents.ts`

**Documents Generated (All Separate PDFs):**

| Category | Document | Description | PDF |
|----------|----------|-------------|-----|
| **Notices** | Section 8 Notice | Grounds-based possession notice | ✅ |
| | Section 21 Notice | No-fault eviction notice (England only) | ✅ |
| **Court Forms** | N5 Claim Form | Standard possession claim | ✅ (Official PDF fill) |
| | N119 Particulars | Detailed particulars | ✅ (Official PDF fill) |
| | N5B Accelerated | Accelerated procedure (S21 only) | ✅ (Official PDF fill) |
| **AI-Generated** | Witness Statement | AI-drafted witness statement | ✅ |
| | Compliance Audit | AI-powered compliance check | ✅ |
| | Risk Assessment | Case strength analysis | ✅ |
| **Guidance** | Eviction Roadmap | Step-by-step guide | ✅ |
| | Expert Guidance | Professional tips | ✅ |
| | Timeline Expectations | Realistic timelines | ✅ |
| | Court Filing Guide | How to file at court | ✅ |
| | Case Summary | Overview of case facts | ✅ |
| **Evidence Tools** | Arrears Schedule | Rent arrears breakdown (if applicable) | ✅ |
| | Evidence Checklist | Documents needed for court | ✅ |
| | Proof of Service | Certificate of service template | ✅ |

**Total:** 10-15 documents depending on route and grounds

**Storage:** Each document stored as separate PDF in Supabase Storage at `{user_id}/{case_id}/{filename}.pdf`

**Database:** Each document has its own row in `documents` table with `is_preview: false`

---

### 1.3 Money Claim Pack (£179.99)

**API Endpoint:** `GET /api/money-claim/pack/[caseId]`
**Generator File:** `src/lib/documents/money-claim-pack-generator.ts`

**Documents Generated (All Separate PDFs):**

| Category | Document | Description |
|----------|----------|-------------|
| **Court Form** | Form N1 | Official claim form (PDF fill) |
| **Particulars** | Particulars of Claim | Detailed claim particulars |
| **Schedule** | Schedule of Arrears | Line-by-line arrears breakdown |
| **Guidance** | Pack Cover/Summary | Explains contents and totals |
| | Interest Calculation | Section 69 CCA workings |
| | Evidence Index | Checklist of attachments |
| | Court Hearing Prep Sheet | What to say/bring at hearing |
| | Filing Guide | MCOL or paper filing instructions |
| | Enforcement Guide | Post-judgment enforcement options |
| **Pre-Action Protocol** | Letter Before Claim | PAP-DEBT compliant LBA |
| | Information Sheet | Defendant rights/options |
| | Reply Form | Form for defendant response |
| | Financial Statement Form | Defendant income/expenditure disclosure |

**Total:** 13 documents

**Output:** Returned as ZIP file containing all PDFs

---

### 1.4 Tenancy Agreements

**Generator File:** `src/lib/documents/ast-generator.ts`

**AST Standard (£9.99):**

| Template | Merged Into Single PDF |
|----------|------------------------|
| `standard_ast_formatted.hbs` | Main agreement |
| `terms_and_conditions.hbs` | T&Cs schedule |
| `certificate_of_curation.hbs` | Verification certificate |
| `ast_legal_validity_summary.hbs` | Legal compliance summary |
| `government_model_clauses.hbs` | Model tenant clauses |
| `deposit_protection_certificate.hbs` | Deposit protection form |
| `inventory_template.hbs` | Inventory schedule |

**Total:** 7 templates → 1 merged PDF

**AST Premium (£59.99):**

All Standard templates PLUS:

| Premium-Exclusive Template | Description |
|---------------------------|-------------|
| `key_schedule.hbs` | Key handover schedule |
| `tenant_welcome_pack.hbs` | Move-in information |
| `property_maintenance_guide.hbs` | Maintenance responsibilities |
| `move_in_condition_report.hbs` | Property condition at start |
| `checkout_procedure.hbs` | End of tenancy process |

**Total:** 12 templates → 1 merged PDF

---

## 2. PREVIEW PAGE AUDIT

### 2.1 Preview Page Content

**File:** `src/app/wizard/preview/[caseId]/page.tsx`

**What's Displayed:**

| Element | Status | Notes |
|---------|--------|-------|
| Document preview iframe | ✅ | Shows 2-page limited preview |
| Pricing options | ✅ | Dynamic pricing by product |
| Feature list | ✅ | Product-specific features shown |
| Document pack contents | ⚠️ | Shows features, not document list |
| "What's Included" breakdown | ❌ | Missing detailed document list |
| Lock/unlock indicators | ❌ | No visual indication of locked content |

**Products Listed on Preview:**

For Eviction cases:
- Notice Only (£29.99) - Features listed
- Complete Pack (£149.99) - Features listed

For Tenancy Agreements:
- Standard AST (£9.99)
- Premium AST (£59.99)

### 2.2 Missing Elements on Preview

| Missing Element | Impact |
|-----------------|--------|
| Document list with icons | Users don't see exactly what they'll receive |
| Document count ("15 documents included") | Value proposition unclear |
| Preview of each document type | Can't see what court forms look like |
| Locked document indicators | No clear paywall visualization |
| Compliance summary preview | Users don't see their compliance status |

---

## 3. COMPLIANCE DOCUMENTATION AUDIT (CRITICAL)

### 3.1 Compliance Questions Captured

**England (Notice Only) - MQS Location:** `config/mqs/notice_only/england.yaml`

| Question ID | Question | Used in Template? | Summary Doc? |
|-------------|----------|-------------------|--------------|
| `deposit_protected_scheme` | Is the deposit protected? | ✅ Section 21 template | ❌ No |
| `deposit_scheme_name` | Which scheme? | ✅ Section 21 template | ❌ No |
| `prescribed_info_given` | Prescribed info within 30 days? | ❌ Not in template | ❌ No |
| `gas_safety_certificate` | Valid gas safety cert provided? | ❌ Not in template | ❌ No |
| `epc_provided` | EPC provided before tenancy? | ❌ Not in template | ❌ No |
| `how_to_rent_provided` | How to Rent guide given? | ❌ Not in template | ❌ No |

**Wales (Notice Only) - MQS Location:** `config/mqs/notice_only/wales.yaml`

| Question ID | Question | Used in Template? | Summary Doc? |
|-------------|----------|-------------------|--------------|
| `deposit_protected_wales` | Is deposit protected? | ✅ Section 173 template | ❌ No |
| `deposit_scheme_wales_s173` | Which scheme? | ❌ Not in template | ❌ No |
| `rent_smart_wales_registered` | Rent Smart Wales registered? | ❌ Not in template | ❌ No |

**England (Complete Pack) - MQS Location:** `config/mqs/complete_pack/england.yaml`

| Question ID | Question | Used in Template? | Summary Doc? |
|-------------|----------|-------------------|--------------|
| `deposit_protected` | Deposit protected? | ✅ Eviction case data | ❌ No |
| `prescribed_info_served` | Prescribed info served? | ❌ Not in template | ❌ No |
| `how_to_rent_served` | How to Rent served? | ❌ Not in template | ❌ No |
| `epc_served` | EPC served? | ❌ Not in template | ❌ No |
| `gas_safety_cert_served` | Gas safety cert served? | ❌ Not in template | ❌ No |

### 3.2 How Compliance Data Is Currently Used

| Data Point | Storage Location | Used In |
|------------|------------------|---------|
| `deposit_protected` | `case_facts.facts` | Section 21/173 notice generation, validation |
| `deposit_scheme` | `case_facts.facts` | Section 21 notice deposit details |
| `gas_safety_certificate` | `case_facts.facts` | Validation blocking (S21 eligibility) |
| `epc_provided` | `case_facts.facts` | Validation blocking (S21 eligibility) |
| `prescribed_info_given` | `case_facts.facts` | Validation blocking (S21 eligibility) |
| `how_to_rent_provided` | `case_facts.facts` | Validation blocking (S21 eligibility) |

**Validation Engine:** `src/lib/validation/previewValidation.ts`
- Blocks Section 21 if compliance requirements not met
- Returns 422 LEGAL_BLOCK with structured errors

### 3.3 Current Compliance Output

**For Notice Only Pack:**

| Element | Status | Notes |
|---------|--------|-------|
| Compliance Summary Document | ❌ NOT GENERATED | No standalone compliance doc |
| Pre-Action Checklist | ❌ NOT GENERATED | No checklist of confirmations |
| Compliance confirmations in notice | ⚠️ PARTIAL | Only deposit_protected/scheme in S21 |

**For Complete Eviction Pack:**

| Element | Status | Notes |
|---------|--------|-------|
| Compliance Audit Report | ✅ Generated | AI-powered compliance check |
| Pre-Action Requirements Doc | ❌ NOT GENERATED | No PAP evidence summary |
| Compliance Declaration | ❌ NOT GENERATED | No signed landlord declaration |

### 3.4 Missing Compliance Documentation

**For Section 21 (England):**

| Requirement | Confirmation Captured? | Documented in Output? | Priority |
|-------------|------------------------|----------------------|----------|
| EPC provided | ✅ `epc_provided` | ❌ No | HIGH |
| Gas Safety Certificate | ✅ `gas_safety_certificate` | ❌ No | HIGH |
| Deposit protected | ✅ `deposit_protected` | ⚠️ In notice only | MEDIUM |
| Prescribed info within 30 days | ✅ `prescribed_info_given` | ❌ No | HIGH |
| How to Rent guide | ✅ `how_to_rent_provided` | ❌ No | HIGH |
| Tenancy agreement provided | ❌ Not captured | ❌ No | MEDIUM |

**For Section 8 (England):**

| Requirement | Confirmation Captured? | Documented in Output? | Priority |
|-------------|------------------------|----------------------|----------|
| Deposit scheme (if taken) | ✅ `deposit_scheme` | ⚠️ In Section 8 if applicable | LOW |
| Previous warnings given | ⚠️ Partial | ❌ No | MEDIUM |

**For Wales Section 173:**

| Requirement | Confirmation Captured? | Documented in Output? | Priority |
|-------------|------------------------|----------------------|----------|
| Rent Smart Wales registered | ✅ `rent_smart_wales_registered` | ❌ No | HIGH |
| Deposit protected | ✅ `deposit_protected_wales` | ⚠️ In notice only | MEDIUM |
| Written statement provided | ❌ Not captured | ❌ No | HIGH |

**For Scotland Notice to Leave:**

| Requirement | Confirmation Captured? | Documented in Output? | Priority |
|-------------|------------------------|----------------------|----------|
| Landlord registered | ✅ `landlord_registered` | ❌ No | HIGH |
| Deposit protected (SafeDeposits) | ✅ `deposit_protected` | ⚠️ In notice only | MEDIUM |

---

## 4. TEMPLATE AUDIT

### 4.1 All HBS Templates

**Total Count:** 80+ templates across all jurisdictions

**By Category:**

| Category | Count | Location |
|----------|-------|----------|
| Eviction Notices | 8 | `uk/{jurisdiction}/templates/notice_only/` |
| Court Forms (Handlebars) | 6 | `uk/{jurisdiction}/templates/eviction/` |
| Guidance Documents | 15 | `uk/{jurisdiction}/templates/eviction/` + `shared/templates/` |
| Money Claim | 12 | `uk/{jurisdiction}/templates/money_claims/` |
| Tenancy Agreements | 12 | `uk/england/templates/` + `shared/templates/` |
| AI-Generated | 3 | `uk/{jurisdiction}/templates/eviction/` |

### 4.2 Missing Templates

**HIGH PRIORITY - Needed for Court Evidence:**

| Template Needed | Purpose | Affects Products |
|-----------------|---------|------------------|
| `compliance-checklist.hbs` | Summary of all compliance confirmations landlord made | Notice Only, Complete Pack |
| `pre-action-declaration.hbs` | Signed statement that all pre-action requirements were met | Notice Only, Complete Pack |
| `section21-compliance-statement.hbs` | Evidence of S21 eligibility (EPC, Gas, Deposit, PI, How to Rent) | Notice Only (S21), Complete Pack (S21) |

**MEDIUM PRIORITY - Nice to Have:**

| Template Needed | Purpose | Affects Products |
|-----------------|---------|------------------|
| `deposit-protection-statement.hbs` | Detailed deposit protection evidence | All products |
| `landlord-registration-statement.hbs` | Scotland landlord registration evidence | Scotland products |
| `rent-smart-wales-statement.hbs` | Wales landlord registration evidence | Wales products |

### 4.3 Template Data Flow

**How Data Flows to Templates:**

```
Wizard Facts (case_facts.facts)
        ↓
  Mapper Function (e.g., mapNoticeOnlyFacts)
        ↓
  Enriched Template Data (dates formatted, addresses concatenated)
        ↓
  Handlebars Template (notice.hbs)
        ↓
  HTML Output → PDF Generation
```

**Available in Templates:**
- All fields from `case_facts.facts` (flat key-value format)
- Computed fields (formatted dates, concatenated addresses)
- Nested objects created by mapper (landlord, tenant, property, deposit, compliance)

---

## 5. DOCUMENT DISPLAY IN DASHBOARD

### 5.1 Dashboard Documents View

**File:** `src/app/dashboard/documents/page.tsx`

**Current Display:**

| Element | Status |
|---------|--------|
| Document list | ✅ Shows all documents |
| Filter by type | ✅ eviction, money_claim, tenancy_agreement |
| Filter by preview status | ✅ Show preview only toggle |
| Sort options | ✅ Newest, oldest, title |
| Download button | ✅ Opens PDF URL |
| Delete button | ✅ Deletes document |
| Document count | ❌ Not shown per case/pack |
| Pack grouping | ❌ Documents shown individually |

### 5.2 Case Detail Page Documents

**File:** `src/app/dashboard/cases/[id]/page.tsx`

**Current Display:**

| Element | Status |
|---------|--------|
| Documents list for case | ✅ Fetches via `/api/documents?case_id=X` |
| Regenerate button | ✅ Triggers document regeneration |
| Download links | ✅ Links to document PDFs |
| Pack summary | ❌ No "15 documents" indicator |
| Document categories | ❌ Not grouped by category |

### 5.3 Database Structure

**Table:** `documents`

| Column | Purpose |
|--------|---------|
| `id` | UUID primary key |
| `user_id` | Owner |
| `case_id` | Associated case |
| `document_type` | Type (e.g., 'notice', 'court_form', 'guidance') |
| `document_title` | Display title |
| `is_preview` | true for pre-payment, false for final |
| `pdf_url` | Supabase storage URL |
| `metadata` | JSON with pack_type, order_id, description |
| `created_at` | Timestamp |

---

## 6. RECOMMENDATIONS

### 6.1 HIGH PRIORITY - Compliance Documentation

| Action | Effort | Impact |
|--------|--------|--------|
| Create `compliance-checklist.hbs` template | 4h | Provides court evidence of compliance |
| Add compliance checklist to Notice Only pack | 2h | Increases pack value |
| Add compliance checklist to Complete Pack | 2h | Complements AI audit |
| Capture "tenancy agreement provided" in MQS | 1h | Complete compliance picture |

**Proposed Compliance Checklist Content:**

```
LANDLORD COMPLIANCE DECLARATION

Property: [address]
Tenant: [name]
Tenancy Start: [date]

I confirm the following pre-action requirements were met:

Section 21 Requirements:
□ Energy Performance Certificate (EPC) provided: [YES/NO] Date: [date]
□ Gas Safety Certificate provided: [YES/NO] Date: [date]
□ Deposit protected in approved scheme: [YES/NO] Scheme: [name]
□ Prescribed information served within 30 days: [YES/NO] Date: [date]
□ How to Rent Guide provided: [YES/NO] Version: [date]

Signed: ________________  Date: ________________
```

### 6.2 MEDIUM PRIORITY - Preview Page Improvements

| Action | Effort | Impact |
|--------|--------|--------|
| Add "What's Included" section with document list | 3h | Clearer value proposition |
| Show document count ("15 documents included") | 1h | Improves conversion |
| Add document type icons | 2h | Better visual appeal |
| Show "locked" state for unpaid documents | 2h | Clearer paywall |

### 6.3 LOW PRIORITY - Dashboard Improvements

| Action | Effort | Impact |
|--------|--------|--------|
| Group documents by category in dashboard | 4h | Easier navigation |
| Show pack document count | 1h | Better organization |
| Add document preview thumbnails | 6h | Visual improvement |

### 6.4 Document Generation Fixes

| Issue | Current State | Recommended Fix |
|-------|---------------|-----------------|
| Notice Only generates only notice | Missing supporting docs | Add service instructions + checklist (ALREADY DONE in API) |
| Compliance checklist not generated | Users lack court evidence | Create and include template |
| No pack summary in Notice Only | Users get single PDF | Consider adding cover sheet |

---

## 7. SUMMARY TABLES

### Document Generation Matrix

| Product | Documents | Format | Status |
|---------|-----------|--------|--------|
| Notice Only (£29.99) | 3 (Notice + Service + Checklist) | Single merged PDF | ✅ Complete |
| Complete Pack (£149.99) | 10-15 (varies by route) | Separate PDFs | ✅ Complete |
| Money Claim (£179.99) | 13 documents | Separate PDFs (ZIP) | ✅ Complete |
| AST Standard (£9.99) | 7 templates | Single merged PDF | ✅ Complete |
| AST Premium (£59.99) | 12 templates | Single merged PDF | ✅ Complete |

### Compliance Questions Captured

| Question | MQS Location | Used in Template | Documented in Output |
|----------|--------------|------------------|----------------------|
| EPC provided | england.yaml | ❌ | ❌ |
| Gas Safety Certificate | england.yaml | ❌ | ❌ |
| Deposit protected | england.yaml | ✅ S21 notice | ⚠️ Partial |
| Prescribed info given | england.yaml | ❌ | ❌ |
| How to Rent given | england.yaml | ❌ | ❌ |
| Rent Smart Wales | wales.yaml | ❌ | ❌ |
| Landlord registered (Scotland) | scotland.yaml | ❌ | ❌ |

### Missing Templates

| Template | Purpose | Priority |
|----------|---------|----------|
| `compliance-checklist.hbs` | Court evidence of compliance | HIGH |
| `pre-action-declaration.hbs` | Signed landlord statement | HIGH |
| `section21-compliance-statement.hbs` | S21 eligibility evidence | HIGH |
| `deposit-protection-statement.hbs` | Deposit evidence | MEDIUM |

### Preview Page Status

| Element | Current | Needed |
|---------|---------|--------|
| Document list | ❌ | ✅ |
| Document count | ❌ | ✅ |
| Lock indicators | ❌ | ✅ |
| "What's included" | ❌ | ✅ |
| Features list | ✅ | ✅ |
| Pricing | ✅ | ✅ |

---

## 8. ACTION ITEMS (Priority Order)

1. **[HIGH]** Create `compliance-checklist.hbs` template with all compliance confirmations
2. **[HIGH]** Add compliance checklist to Notice Only and Complete Pack generation
3. **[HIGH]** Create `section21-compliance-statement.hbs` for Section 21 eligibility evidence
4. **[MEDIUM]** Add "What's Included" document list to preview page
5. **[MEDIUM]** Show document count on preview and dashboard pages
6. **[MEDIUM]** Add "tenancy_agreement_provided" question to MQS files
7. **[LOW]** Group documents by category in dashboard view
8. **[LOW]** Add document preview thumbnails

---

## 9. CODE FILE REFERENCES

| Component | File Path |
|-----------|-----------|
| Notice Only API | `src/app/api/notice-only/preview/[caseId]/route.ts` |
| Notice Only Merger | `src/lib/documents/notice-only-preview-merger.ts` |
| Eviction Pack Generator | `src/lib/documents/eviction-pack-generator.ts` |
| Pack Contents Definition | `src/lib/documents/eviction-pack-contents.ts` |
| Money Claim Generator | `src/lib/documents/money-claim-pack-generator.ts` |
| AST Generator | `src/lib/documents/ast-generator.ts` |
| Fulfillment | `src/lib/payments/fulfillment.ts` |
| Preview Page | `src/app/wizard/preview/[caseId]/page.tsx` |
| Dashboard Documents | `src/app/dashboard/documents/page.tsx` |
| Dashboard Case Detail | `src/app/dashboard/cases/[id]/page.tsx` |
| MQS England Notice Only | `config/mqs/notice_only/england.yaml` |
| MQS Wales Notice Only | `config/mqs/notice_only/wales.yaml` |
| MQS England Complete Pack | `config/mqs/complete_pack/england.yaml` |
| Validation Engine | `src/lib/validation/previewValidation.ts` |

---

## Conclusion

The document generation system is well-architected with clear separation between products. However, there is a significant gap in **compliance documentation output** - users confirm compliance items during the wizard, but these confirmations are not compiled into a court-ready compliance summary document.

The highest priority fix is creating a compliance checklist template that can serve as evidence in court that the landlord met all pre-action requirements. This should be included in both Notice Only and Complete Eviction packs.
