# MISSING FEATURES ROADMAP

**Generated:** 2025-12-09
**Based on:** Comprehensive platform audit + premium spec comparison
**Scope:** All gaps identified across Supabase, Ask Heaven, legal validity, and UX audits

---

## EXECUTIVE SUMMARY

**Total Identified Gaps: 15 features**
- **P0 (Critical):** 3 features - Block "Premium" claims or false marketing
- **P1 (High):** 7 features - Affect pricing justification and value proposition
- **P2 (Nice-to-Have):** 5 features - Future enhancements

**Total Estimated Dev Time: 18-25 days** (with focused development)

**Launch Recommendation:**
- ✅ Can launch NOW with honest marketing (qualify which features are template vs AI)
- ⚠️ OR wait 2-3 weeks to implement P0 + critical P1 features
- ✅ OR remove unimplemented features from marketing immediately

---

## PRIORITY 0 (CRITICAL - BLOCKING LAUNCH CLAIMS)

These features are mentioned in specs/marketing but are not fully implemented. Must either implement OR remove from marketing to avoid false advertising.

---

### P0-1: Verify Money Claim AI Generation

**What Spec Says:**
From `docs/📄 premium-legal-workflows-spec.MD`:
- AI-drafted Letter Before Action with structured JSON
- AI-drafted Particulars of Claim with structured JSON

**Current Status:** ⚠️ **PARTIAL/UNKNOWN**
- ✅ File exists: `src/lib/documents/money-claim-askheaven.ts`
- ✅ Function exists: `generateMoneyClaimAskHeavenDrafts()`
- ❌ **NEED TO VERIFY:** Does it implement full JSON schema from spec?

**What's Missing:**
```typescript
// Expected JSON schema (from spec):
{
  "lba": {
    "intro": "",
    "tenancy_history": "",
    "arrears_summary": "",
    "breach_description": "",
    "amount_due": "",
    "response_deadline": "",
    "payment_instructions": "",
    "consequences": ""
  }
}
```

**Files to Create/Modify:**
- Read: `src/lib/documents/money-claim-askheaven.ts` (verify implementation)
- If missing: Implement full JSON generation
- Test: Generate sample money claim and verify AI quality

**Estimated Time:** 1 hour (verification) OR 2-3 days (full implementation)

**Dependencies:** OpenAI JSON mode, money-claim-pack-generator integration

**Testing Requirements:**
1. Generate LBA for test case
2. Verify JSON structure matches spec
3. Verify LBA is court-appropriate
4. Test with different claim scenarios (rent only, rent + damages, damages only)

**Priority:** **P0 - CRITICAL**
**Reason:** Money Claims is a £179.99 product. If AI isn't working, pricing isn't justified.

---

### P0-2: Remove or Implement Witness Statements

**What Spec Says:**
From `docs/📄 premium-legal-workflows-spec.MD`:
```json
{
  "witness_statement": {
    "introduction": "",
    "tenancy_history": "",
    "rent_arrears": "",
    "conduct_issues": "",
    "grounds_summary": "",
    "timeline": "",
    "evidence_references": ""
  }
}
```

**Current Status:** ❌ **NOT IMPLEMENTED**
- ✅ Type definition exists in `src/lib/case-intel/types.ts:210`
- ✅ Referenced in `src/lib/documents/section8-generator.ts:134` as `witness_statements_attached?: boolean`
- ❌ **NO GENERATOR FUNCTION** exists
- ❌ No AI generation implementation

**What's Missing:**
1. AI generation function
2. Handlebars template for witness statement
3. Integration into eviction-pack-generator.ts
4. PDF generation from template

**Files to Create:**
```
src/lib/ai/witness-statement-generator.ts
config/jurisdictions/uk/england-wales/templates/eviction/witness-statement.hbs
config/jurisdictions/uk/scotland/templates/eviction/witness-statement.hbs
```

**Implementation Spec:**
```typescript
// src/lib/ai/witness-statement-generator.ts
export interface WitnessStatementJSON {
  introduction: string;
  tenancy_history: string;
  rent_arrears: string;
  conduct_issues: string;
  grounds_summary: string;
  timeline: string;
  evidence_references: string;
}

export async function generateWitnessStatement(
  caseFacts: CaseFacts,
  jurisdiction: string,
  groundsUsed: string[]
): Promise<WitnessStatementJSON> {
  // 1. Build AI prompt with case facts
  // 2. Request JSON structured response
  // 3. Validate response matches schema
  // 4. Return JSON for template rendering
}
```

**Estimated Time:** 3-4 days
- Day 1: Implement AI generator (6 hours)
- Day 2: Create Handlebars template (4 hours)
- Day 3: Integration testing (6 hours)
- Day 4: Polish and edge cases (4 hours)

**Dependencies:**
- OpenAI JSON mode
- CaseFacts normalization
- Decision engine (for grounds context)
- Template rendering system

**Testing Requirements:**
1. Generate for Section 8 Ground 8 (rent arrears)
2. Generate for Section 8 Ground 14 (ASB)
3. Generate for multiple grounds
4. Verify language is appropriate for court
5. Verify statement of truth is included

**Priority:** **P0 - CRITICAL**
**Reason:** Mentioned in premium spec. Either implement or remove claim.

**DECISION REQUIRED:**
- ✅ OPTION A: Remove from all marketing immediately (0 days)
- ⚠️ OPTION B: Implement feature (3-4 days)

---

### P0-3: Remove or Implement Compliance Audits

**What Spec Says:**
From `docs/📄 premium-legal-workflows-spec.MD`:
```json
{
  "tenancy_audit": {
    "deposit_protection": "",
    "licensing": "",
    "gas_safety": "",
    "electrical_safety": "",
    "epc": "",
    "h2r": "",
    "retaliatory_eviction": "",
    "disrepair_risk": "",
    "s21_valid": true,
    "s8_grounds": ["8", "10", "11"]
  }
}
```

**Current Status:** ❌ **NOT IMPLEMENTED**
- ❌ No generator function
- ❌ No template
- ❌ Not included in any document packs

**What's Missing:**
1. AI compliance audit generator
2. Template for audit report
3. Integration into eviction-pack-generator.ts

**Files to Create:**
```
src/lib/ai/compliance-audit-generator.ts
config/jurisdictions/uk/england-wales/templates/eviction/compliance-audit.hbs
config/jurisdictions/uk/scotland/templates/eviction/compliance-audit.hbs
```

**Implementation Spec:**
```typescript
// src/lib/ai/compliance-audit-generator.ts
export interface ComplianceAuditJSON {
  deposit_protection: string;
  licensing: string;
  gas_safety: string;
  electrical_safety: string;
  epc: string;
  how_to_rent: string;
  retaliatory_eviction: string;
  disrepair_risk: string;
  s21_valid: boolean;
  s21_blocking_issues: string[];
  s8_grounds: string[];
  s8_recommendations: string[];
  overall_status: 'ready' | 'needs_work' | 'blocked';
}

export async function generateComplianceAudit(
  caseFacts: CaseFacts,
  jurisdiction: string,
  decisionEngineOutput: DecisionOutput
): Promise<ComplianceAuditJSON>
```

**Estimated Time:** 2-3 days
- Day 1: Implement AI generator with decision engine integration (6 hours)
- Day 2: Create template and integrate (4 hours)
- Day 3: Testing and polish (4 hours)

**Dependencies:**
- Decision engine (for compliance checks)
- CaseFacts (for deposit, gas cert, etc.)
- checkEPCForSection21 function (already exists!)

**Priority:** **P0 - CRITICAL**
**Reason:** Critical for S21 validity checking. Either implement or remove claim.

**DECISION REQUIRED:**
- ✅ OPTION A: Remove from marketing immediately (0 days)
- ⚠️ OPTION B: Implement feature (2-3 days)

---

## PRIORITY 1 (HIGH - AFFECT PRICING JUSTIFICATION)

These features improve value proposition and justify current pricing. Should implement for premium offering.

---

### P1-1: Risk Report PDF Generation

**Current Status:** ⚠️ **PARTIAL**
- ✅ Risk scoring logic exists (`src/app/api/wizard/analyze/route.ts`)
- ✅ Returns: red_flags, compliance_issues, success_probability
- ❌ No PDF generated
- ❌ Not included in document packs

**What's Missing:**
1. Handlebars template for risk report
2. PDF generation from template
3. Integration into eviction-pack-generator.ts

**Files to Create:**
```
config/jurisdictions/uk/england-wales/templates/eviction/risk-report.hbs
config/jurisdictions/uk/scotland/templates/eviction/risk-report.hbs
```

**Template Content:**
```handlebars
# Case Risk Assessment Report

## Overall Risk Score: {{success_probability}}%
Risk Level: {{risk_level}}

## Strengths
{{#each positives}}
- {{this}}
{{/each}}

## Red Flags ({{red_flags.length}})
{{#each red_flags}}
- {{this}}
{{/each}}

## Compliance Issues ({{compliance_issues.length}})
{{#each compliance_issues}}
- {{this}}
{{/each}}

## Recommendations
...
```

**Estimated Time:** 1-2 days
- Day 1: Create template (4 hours)
- Day 2: Integrate and test (4 hours)

**Dependencies:**
- Existing risk scoring logic (already works!)
- PDF generation system

**Priority:** **P1 - HIGH**
**Reason:** Adds tangible value to Complete Pack, easy to implement

---

### P1-2: Forms Manifest & Version Tracking

**Current Status:** ❌ **MISSING**

**What's Needed:**
```json
// public/official-forms/forms-manifest.json
{
  "last_verified": "2025-12-09",
  "next_review": "2026-03-09",
  "forms": {
    "n5-eng": {
      "version": "12/24",
      "source_url": "https://assets.publishing.service.gov.uk/media/...",
      "crown_copyright": true,
      "last_updated": "2024-12-01",
      "checksum": "sha256:...",
      "size_bytes": 123904
    },
    "n5b-eng": { /* ... */ },
    "n119-eng": { /* ... */ },
    "N1_1224": { /* ... */ },
    "form_6a": { /* ... */ }
  }
}
```

**Implementation:**
1. Download latest forms from HMCTS website
2. Verify versions are current
3. Calculate SHA-256 checksums
4. Document source URLs
5. Add quarterly review reminder

**Estimated Time:** 4 hours (one-time setup)

**Priority:** **P1 - HIGH**
**Reason:** Legal compliance, form version tracking is critical

---

### P1-3: PDF Field Mapping Tests

**Current Status:** ❌ **NO TESTS**

**What's Needed:**
```typescript
// tests/documents/pdf-fill.test.ts
describe('N5 Form Filling', () => {
  test('maps all required fields', async () => {
    const testCase: CaseData = { /* ... */ };
    const pdf = await fillN5Form(testCase);
    const fields = await extractPDFFields(pdf);

    expect(fields['claimant_name']).toBe('John Smith');
    expect(fields['defendant_name']).toBe('Jane Doe');
    expect(fields['property_address']).toBe('123 Main St');
    // ... test all 40 fields
  });

  test('handles special characters', async () => { /* ... */ });
  test('truncates long text appropriately', async () => { /* ... */ });
});
```

**Test Coverage Needed:**
- N5 form (40 fields)
- N119 form (25 fields)
- N1 form (50 fields)

**Estimated Time:** 2 days
- Day 1: Setup PDF field extraction utility (4 hours)
- Day 2: Write tests for all forms (6 hours)

**Priority:** **P1 - HIGH**
**Reason:** Critical for court-readiness confidence

---

### P1-4: End-to-End Document Generation Tests

**Current Status:** ❌ **MINIMAL TESTS**

**What's Needed:**
```typescript
// tests/documents/eviction-pack-e2e.test.ts
describe('Complete Pack E2E', () => {
  test('generates all 9 documents for Section 8', async () => {
    const pack = await generateCompleteEvictionPack(testCaseSection8);

    expect(pack.documents).toHaveLength(9);
    expect(pack.documents.find(d => d.title.includes('Section 8'))).toBeDefined();
    expect(pack.documents.find(d => d.title.includes('N5'))).toBeDefined();
    expect(pack.documents.find(d => d.title.includes('N119'))).toBeDefined();
    // ... verify all 9 documents
  });

  test('generates all 9 documents for Section 21', async () => { /* ... */ });
  test('generates Scotland Notice to Leave pack', async () => { /* ... */ });
});
```

**Estimated Time:** 2 days

**Priority:** **P1 - HIGH**
**Reason:** Confidence in document generation, catches regressions

---

### P1-5: Mobile Wizard Testing

**Current Status:** ⚠️ **UNKNOWN**

**What's Needed:**
1. Test wizard flow on iPhone Safari
2. Test wizard flow on Android Chrome
3. Test wizard flow on iPad
4. Verify touch targets are min 44x44px
5. Verify font sizes are readable (min 16px for inputs)
6. Verify forms don't zoom on focus

**Estimated Time:** 1 day (manual testing)

**Priority:** **P1 - HIGH**
**Reason:** Most users will fill wizard on mobile

---

### P1-6: Dashboard Pagination

**Current Status:** ⚠️ **UNKNOWN**

**What's Needed:**
```typescript
// src/app/dashboard/documents/page.tsx
const { data, hasMore, loadMore } = useDocuments({
  limit: 20,
  offset: page * 20,
  orderBy: { created_at: 'desc' }
});
```

**Implementation:**
1. Add pagination to documents list
2. Add pagination to cases list
3. Implement infinite scroll OR page numbers
4. Add loading states

**Estimated Time:** 1 day

**Priority:** **P1 - HIGH**
**Reason:** Performance with many cases/documents

---

### P1-7: Verify Product Page Claims

**Current Status:** ⚠️ **UNKNOWN**

**What's Needed:**
1. Read all 5 product pages
2. Verify feature lists match actual deliverables
3. Remove claims about unimplemented AI features
4. Add qualifiers ("template-based" vs "AI-generated")
5. Verify pricing matches config/pricing.ts

**Files to Audit:**
- `src/app/products/notice-only/page.tsx`
- `src/app/products/complete-pack/page.tsx`
- `src/app/products/money-claim/page.tsx`
- `src/app/products/ast/page.tsx`

**Estimated Time:** 4 hours

**Priority:** **P1 - CRITICAL FOR LAUNCH**
**Reason:** False advertising is illegal, must be accurate

---

## PRIORITY 2 (NICE-TO-HAVE - FUTURE ENHANCEMENTS)

These features improve UX and polish but aren't critical for launch.

---

### P2-1: Document Preview Watermarks

**What's Needed:**
- Add "PREVIEW - DO NOT FILE" watermark to unpaid documents
- Remove watermark after payment confirmed

**Estimated Time:** 1 day

**Priority:** **P2**

---

### P2-2: Dashboard Analytics

**What's Needed:**
```typescript
// Dashboard metrics
{
  cases_in_progress: number,
  cases_completed: number,
  average_completion_time: string,
  success_rate: number,
  most_common_grounds: string[]
}
```

**Estimated Time:** 2 days

**Priority:** **P2**

---

### P2-3: Case Search & Filtering

**What's Needed:**
- Search by tenant name, property address
- Filter by jurisdiction, case_type, status
- Sort by created_at, updated_at, wizard_progress

**Estimated Time:** 1-2 days

**Priority:** **P2**

---

### P2-4: Guided Tours

**What's Needed:**
- First-time user onboarding
- Wizard walkthrough
- Ask Heaven feature introduction

**Tool:** Use react-joyride or similar

**Estimated Time:** 2-3 days

**Priority:** **P2**

---

### P2-5: Accessibility Audit

**What's Needed:**
- Run Lighthouse audit on all key pages
- Fix color contrast issues
- Add ARIA labels
- Test with screen reader

**Estimated Time:** 2-3 days

**Priority:** **P2**

---

## IMPLEMENTATION ORDER RECOMMENDATION

### Week 1 (Critical Path)
**Days 1-2:**
- ✅ P0-1: Verify money claim AI (1 hour) OR implement if missing (2 days)
- ✅ P1-7: Verify product page claims (4 hours)

**Days 3-4:**
- ⚠️ **DECISION:** Implement witness statements (P0-2) OR remove from marketing

**Day 5:**
- ⚠️ **DECISION:** Implement compliance audits (P0-3) OR remove from marketing

**Result after Week 1:**
- ✅ All P0 issues resolved (implement OR remove)
- ✅ Marketing is honest and accurate
- ✅ Platform is launch-ready

---

### Week 2 (High-Value Additions)
**Days 1-2:**
- ✅ P1-1: Risk report PDF generation (1-2 days)
- ✅ P1-2: Forms manifest (4 hours)

**Days 3-4:**
- ✅ P1-3: PDF field mapping tests (2 days)

**Day 5:**
- ✅ P1-5: Mobile wizard testing (1 day)

**Result after Week 2:**
- ✅ Risk reports added to packs
- ✅ Form version tracking in place
- ✅ Tests ensure quality
- ✅ Mobile UX verified

---

### Week 3 (Polish)
**Days 1-2:**
- ✅ P1-4: E2E tests (2 days)

**Days 3-4:**
- ✅ P1-6: Dashboard pagination (1 day)
- ✅ P2-1: Preview watermarks (1 day)

**Day 5:**
- ✅ P2-3: Case search (1 day)

**Result after Week 3:**
- ✅ Comprehensive test coverage
- ✅ Dashboard improvements
- ✅ Better UX

---

### Week 4+ (Future)
- ✅ P2-2: Dashboard analytics
- ✅ P2-4: Guided tours
- ✅ P2-5: Accessibility audit

---

## TOTAL ESTIMATED DEV TIME

### Minimum (P0 Only - "Remove Claims" Path)
- P0-1: Verify money claim AI: 1 hour
- P0-2: Remove witness statement claims: 0 hours
- P0-3: Remove compliance audit claims: 0 hours
- P1-7: Fix product pages: 4 hours
**Total:** 5 hours (1 day)

---

### Recommended (P0 + Critical P1 - "Implement Features" Path)
- P0-1: Implement/verify money claim AI: 2-3 days
- P0-2: Implement witness statements: 3-4 days
- P0-3: Implement compliance audits: 2-3 days
- P1-1: Risk report PDFs: 1-2 days
- P1-2: Forms manifest: 4 hours
- P1-3: PDF tests: 2 days
- P1-5: Mobile testing: 1 day
- P1-7: Product page fixes: 4 hours
**Total:** 12-16 days (2.5-3 weeks)

---

### Complete (All P0 + P1 + P2)
**Total:** 18-25 days (4-5 weeks)

---

## LAUNCH DECISION MATRIX

### Option A: Launch NOW with Honest Marketing
**Timeline:** 1 day
**Actions:**
- Verify money claim AI works (P0-1)
- Remove witness statement claims (P0-2)
- Remove compliance audit claims (P0-3)
- Fix product page claims (P1-7)

**Pros:**
- ✅ Launch immediately
- ✅ No false advertising
- ✅ Core features work

**Cons:**
- ⚠️ Lower perceived value
- ⚠️ Pricing harder to justify at £149.99

**Recommendation:** Reduce Complete Pack to £129.99-£139.99

---

### Option B: Launch in 2-3 Weeks with Full Premium Features
**Timeline:** 12-16 days
**Actions:**
- Implement all P0 features
- Implement critical P1 features
- Comprehensive testing

**Pros:**
- ✅ Can claim "AI-drafted" documents honestly
- ✅ Pricing fully justified
- ✅ Competitive advantage

**Cons:**
- ⚠️ 2-3 week delay

**Recommendation:** Implement P0 + critical P1, launch with premium pricing

---

### Option C: Hybrid - Launch Core, Add Premium Later
**Timeline:** 5 days initial + 2 weeks for premium
**Actions:**
- Week 1: Launch with honest marketing (Option A)
- Weeks 2-3: Implement premium features
- Week 4: Re-launch premium tier

**Pros:**
- ✅ Launch quickly
- ✅ Get user feedback early
- ✅ Add premium tier later

**Cons:**
- ⚠️ Two-tier pricing complexity

---

## FINAL RECOMMENDATION

**Choose Option B: Launch in 2-3 Weeks with Full Premium Features**

**Why:**
1. Only 2-3 weeks delay is acceptable
2. Premium features justify £149.99-£179.99 pricing
3. Competitive advantage over template-only services
4. Can honestly claim "AI-drafted documents"
5. Professional, polished product

**Critical Path:**
1. Days 1-2: Verify/implement money claim AI
2. Days 3-6: Implement witness statements
3. Days 7-9: Implement compliance audits
4. Days 10-11: Risk report PDFs + forms manifest
5. Days 12-14: Testing (PDF tests + E2E tests + mobile)
6. Days 15-16: Polish and launch prep

**Launch Date:** ~December 23-27, 2025 (in time for New Year rush!)

---

**Auditor:** Claude Code Platform Audit
**Date:** 2025-12-09
**Next Steps:** Get stakeholder buy-in on implementation path, assign dev resources
