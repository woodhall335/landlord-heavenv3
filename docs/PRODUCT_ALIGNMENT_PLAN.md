# Product Alignment Plan: Extending Notice Only Discipline to All Products

**Status**: Active - Notice Only Gold Standard Complete
**Last Updated**: 2025-12-16
**Owner**: Engineering Team

## Recent Updates (2025-12-16)

**Notice Only Improvements:**
- ✅ Product page UI updated to separate England and Wales (no more combined "England & Wales")
- ✅ Ask Heaven updated with Wales-specific guidance (Section 173, contract holder terminology)
- ✅ E2E proof script enhanced with Supabase env validation and localhost:5000 support
- ✅ All jurisdictions verified: england (Section 8/21), wales (Section 173/fault-based), scotland (Notice to Leave)

**Next Priority:** Complete Pack alignment (Phase 1)

## Executive Summary

This document outlines a plan to extend the **Notice Only discipline** (Support Matrix + Field Map + E2E Proof Script + Audit Scripts) to all other Landlord Heaven products:

- **complete_pack** (Eviction Complete Pack)
- **money_claim** (Money Claim Pack)
- **tenancy_agreement** (Tenancy Agreement Generator)

The goal is to achieve the same level of **runtime validation**, **end-to-end proof**, and **documentation** across all products, ensuring they work reliably across all supported jurisdictions.

---

## Background: What We Learned from Notice Only

### The Notice Only Model

Notice Only set the standard for product completeness:

1. **Support Matrix** (`docs/NOTICE_ONLY_SUPPORT_MATRIX.md`)
   - Clear table of jurisdiction → routes → templates
   - Documents what's supported and what's not
   - No surprises for users or developers

2. **Field Map** (`docs/NOTICE_ONLY_FIELD_MAP.md`)
   - MSQ question IDs → mapper logic → template variables
   - Traceable data flow from wizard to PDF
   - Easy to debug when something breaks

3. **E2E Proof Script** (`scripts/prove-notice-only-e2e.ts`)
   - Generates real PDFs for all supported routes
   - Validates file size, PDF format, text content
   - Catches template errors, mapping bugs, missing data

4. **Audit Scripts** (`scripts/smoke-jurisdiction-matrix.ts`, `scripts/audit-legal-completeness.ts`)
   - Runtime validation (not just "folder exists")
   - Ensures canonical jurisdictions are used (no `england-wales`)
   - Checks legal guards (Section 21 England-only, NI tenancy-only)

### Why It Matters

Before this discipline:
- ❌ Scripts used `england-wales`, wizard used `england` → 400 errors
- ❌ PDFs generated but had `undefined` or missing data
- ❌ Wales flows dead-ended with "Unsupported jurisdiction"
- ❌ No way to verify "does it work?" without manual testing

After this discipline:
- ✅ All routes provably work end-to-end
- ✅ Canonical jurisdictions everywhere
- ✅ Template errors caught before deployment
- ✅ Clear documentation for developers and QA

---

## Product Alignment Roadmap

### Phase 1: Complete Pack (Priority: HIGH)

**Why First**: Complete Pack shares infrastructure with Notice Only (same eviction routes, templates, mappers). Low-hanging fruit.

#### 1.1 Support Matrix

**Task**: Create `docs/COMPLETE_PACK_SUPPORT_MATRIX.md`

**Content**:
- **Supported Jurisdictions**: England, Wales, Scotland
- **Routes**:
  - England: `section_8`, `section_21`
  - Wales: `wales_fault_based` (Section 173 no-fault not typically used for complete pack)
  - Scotland: `notice_to_leave`
- **Templates** (per route):
  - Notice template (same as Notice Only)
  - Eviction Roadmap
  - Expert Guidance
  - Witness Statement
  - Compliance Audit
  - Evidence Collection Checklist
  - Proof of Service
- **Blockers**: None (all templates exist)

#### 1.2 Field Map

**Task**: Create `docs/COMPLETE_PACK_FIELD_MAP.md`

**Content**:
- MSQ questions → `wizardFactsToCaseFacts` → `generateCompleteEvictionPack` → templates
- Critical fields:
  - Landlord/tenant details
  - Property address
  - Tenancy dates
  - Eviction route
  - Ground details (for Section 8/Wales fault)
  - Evidence uploads
- Map each template's required variables back to MSQ questions

#### 1.3 E2E Proof Script

**Task**: Create `scripts/prove-complete-pack-e2e.ts`

**Model After**: `scripts/prove-notice-only-e2e.ts`

**Test Cases**:
- England Section 8 → Complete Pack with all supporting docs
- England Section 21 → Complete Pack with all supporting docs
- Wales Fault-Based → Complete Pack
- Scotland Notice to Leave → Complete Pack

**Validation**:
- All documents generated (7+ PDFs per case)
- File sizes reasonable (witness statement should be >100KB)
- No `undefined` or template errors
- Jurisdiction-specific content in each doc

#### 1.4 Audit Integration

**Task**: Update `scripts/audit-legal-completeness.ts`

**Changes**:
- Add Complete Pack template paths to `findProductTemplates()`
- Verify all Complete Pack templates exist for supported jurisdictions
- Check MSQ → mapper → template variable coverage

**Task**: Update `scripts/smoke-jurisdiction-matrix.ts`

**Changes**:
- Add Complete Pack to test matrix
- Validate MQS loads for England, Wales, Scotland
- Ensure no `england-wales` references

---

### Phase 2: Money Claim (Priority: MEDIUM)

**Why Next**: Money Claim has jurisdiction-specific logic (England/Wales vs Scotland Simple Procedure) that needs validation.

#### 2.1 Support Matrix

**Task**: Create `docs/MONEY_CLAIM_SUPPORT_MATRIX.md`

**Content**:
- **Supported Jurisdictions**: England, Wales, Scotland
- **Routes**:
  - England/Wales: Standard Money Claim (County Court)
  - Scotland: Simple Procedure
- **Templates** (per jurisdiction):
  - Pack Cover
  - Particulars of Claim / Simple Procedure Form
  - Schedule of Arrears
  - Interest Calculation (England/Wales)
  - Claim Summary
- **Known Gaps**:
  - Northern Ireland money claims (not supported in V1)

#### 2.2 Field Map

**Task**: Create `docs/MONEY_CLAIM_FIELD_MAP.md`

**Content**:
- MSQ questions → `wizardFactsToCaseFacts` → `mapCaseFactsToMoneyClaimCase` → `generateMoneyClaimPack` → templates
- Critical fields:
  - Claimant (landlord) details
  - Defendant (tenant) details
  - Claim type (rent arrears, damages, other)
  - Arrears schedule
  - Interest calculation
  - LBA (Letter Before Action) details
- **Known Issues**:
  - Data pipeline has lost values in the past (e.g., `landlord_full_name` → undefined)
  - Use `scripts/debug-money-claim-preview.mjs` as reference

#### 2.3 E2E Proof Script

**Task**: Create `scripts/prove-money-claim-e2e.ts`

**Model After**: `scripts/prove-notice-only-e2e.ts`

**Test Cases**:
- England: Rent arrears money claim
- Wales: Rent arrears money claim
- Scotland: Simple Procedure rent arrears
- England: Damages + arrears money claim

**Validation**:
- All documents generated
- Arrears schedule table populated
- Interest calculation correct (England/Wales)
- Claimant/defendant names present
- No `undefined` in critical fields

#### 2.4 Audit Integration

**Task**: Update audit scripts

**Changes**:
- Add Money Claim templates to `findProductTemplates()`
- Check Scotland-specific templates (Simple Procedure)
- Validate MSQ → mapper coverage for money claim fields

---

### Phase 3: Tenancy Agreement (Priority: LOW)

**Why Last**: Tenancy Agreement is the simplest product (one template per jurisdiction, no complex routing).

#### 3.1 Support Matrix

**Task**: Create `docs/TENANCY_AGREEMENT_SUPPORT_MATRIX.md`

**Content**:
- **Supported Jurisdictions**: England, Wales, Scotland, Northern Ireland
- **Routes**: N/A (single template per jurisdiction)
- **Templates**:
  - England/Wales: AST (Assured Shorthold Tenancy)
  - England/Wales: AST Premium (with additional clauses)
  - Scotland: PRT (Private Residential Tenancy)
  - Scotland: PRT Premium
  - Northern Ireland: Private Tenancy Agreement
  - Northern Ireland: Private Tenancy Premium

#### 3.2 Field Map

**Task**: Create `docs/TENANCY_AGREEMENT_FIELD_MAP.md`

**Content**:
- MSQ questions → `generateTenancyAgreement` → template
- Critical fields:
  - Landlord details
  - Tenant details
  - Property address
  - Tenancy dates
  - Rent amount, frequency, due date
  - Deposit details
  - Special clauses (pets, smoking, etc.)

#### 3.3 E2E Proof Script

**Task**: Create `scripts/prove-tenancy-agreement-e2e.ts`

**Test Cases**:
- England AST
- Wales AST
- Scotland PRT
- Northern Ireland Private Tenancy

**Validation**:
- Template populated correctly
- No `undefined` in critical fields
- Jurisdiction-specific legal text correct

#### 3.4 Audit Integration

**Task**: Update audit scripts

**Changes**:
- Add Tenancy Agreement templates
- Validate Northern Ireland support (tenancy_agreement only product for NI in V1)

---

## Prioritized Breakpoint List

Based on historical issues and risk areas, here are the most likely failure points to check first:

### 1. Jurisdiction Routing Bugs (CRITICAL)

**Symptoms**:
- Wizard uses `england`, API expects `england-wales` → 400 error
- Wales flows throw "Unsupported jurisdiction"
- Scotland/NI flows not even attempted

**Check**:
- ✅ MQS files exist for all jurisdictions (`config/mqs/<product>/<jurisdiction>.yaml`)
- ✅ MQS loader doesn't default to `england-wales`
- ✅ API endpoints accept canonical jurisdictions
- ✅ Wizard start payload uses canonical jurisdiction

**Fix Priority**: Phase 1 (All Products)

---

### 2. Template Variable Mismatches (HIGH)

**Symptoms**:
- PDF generated but shows `undefined` or blank fields
- Template expects `landlord_name`, mapper provides `landlord_full_name`
- Nested fields not flattened correctly

**Check**:
- ✅ Run `scripts/audit-legal-completeness.ts` to find unmapped variables
- ✅ Create Field Map doc to trace MSQ → mapper → template
- ✅ Validate template `.hbs` files match mapper output

**Fix Priority**: Phase 1 (Complete Pack), Phase 2 (Money Claim)

---

### 3. Mapper Field Mapping Gaps (HIGH)

**Symptoms**:
- Wizard collects data, but mapper doesn't pass it to template
- `wizardFactsToCaseFacts` loses nested fields (e.g., `claimant_address.city`)
- Conditional fields not mapped (e.g., `section8_grounds` only if Section 8)

**Check**:
- ✅ Use `scripts/debug-money-claim-preview.mjs` pattern to trace data flow
- ✅ Log `caseFacts` and `templateData` in generators
- ✅ Test with minimal wizard answers (E2E script pattern)

**Fix Priority**: Phase 2 (Money Claim - known issue)

---

### 4. Missing Templates (MEDIUM)

**Symptoms**:
- Route/jurisdiction combo not supported
- Template file doesn't exist
- Placeholder PDF returned instead of real notice

**Check**:
- ✅ Create Support Matrix to document expected templates
- ✅ Add template existence checks to audit scripts
- ✅ E2E proof script fails if template missing

**Fix Priority**: Phase 1 (Complete Pack - witness statement, compliance audit)

---

### 5. MQS Dependency Evaluation Bugs (MEDIUM)

**Symptoms**:
- Conditional questions don't show up (e.g., `section8_grounds` hidden)
- `allOf`, `anyOf`, `valueContains` not evaluated correctly
- Wales gating rules block valid flows

**Check**:
- ✅ Review `lib/wizard/mqs-loader.ts` dependency matching
- ✅ Test Wales Section 173 gating (standard contract only)
- ✅ Test Section 8 grounds conditional (should show when route=section_8)

**Fix Priority**: Phase 1 (Already fixed for Notice Only, verify for Complete Pack)

---

### 6. Test/Script Legacy Values (LOW but ANNOYING)

**Symptoms**:
- Scripts use `england-wales`, wizard uses `england`
- Tests use deprecated MQS paths
- Old YAML files still referenced

**Check**:
- ✅ Grep all scripts/tests for `england-wales`
- ✅ Create migration test for legacy values
- ✅ Update all scripts to canonical jurisdictions

**Fix Priority**: ✅ DONE (this PR)

---

## Success Metrics

For each product, success is defined as:

1. ✅ **Support Matrix exists** and is up-to-date
2. ✅ **Field Map exists** documenting MSQ → mapper → template
3. ✅ **E2E Proof Script runs successfully** on a clean machine
   - All supported routes generate PDFs
   - All PDFs pass validation (size, format, content)
   - No `undefined` or template errors
4. ✅ **Audit scripts pass**
   - MQS loads for all jurisdictions
   - Templates exist for all routes
   - No deprecated patterns in use
5. ✅ **Manual testing confirms** PDFs look correct
6. ✅ **CI/CD integration** (future): E2E proof scripts run on every deployment

---

## Next Steps (Immediate Actions)

### Week 1: Complete Pack Foundation
1. Create `docs/COMPLETE_PACK_SUPPORT_MATRIX.md`
2. Create `docs/COMPLETE_PACK_FIELD_MAP.md`
3. Identify any missing templates (witness statement, compliance audit)
4. Fix any template variable mismatches

### Week 2: Complete Pack E2E
1. Create `scripts/prove-complete-pack-e2e.ts`
2. Run script, fix any breakages
3. Update audit scripts to include Complete Pack

### Week 3: Money Claim Foundation
1. Create `docs/MONEY_CLAIM_SUPPORT_MATRIX.md`
2. Create `docs/MONEY_CLAIM_FIELD_MAP.md`
3. Debug existing mapper issues (use `debug-money-claim-preview.mjs`)

### Week 4: Money Claim E2E
1. Create `scripts/prove-money-claim-e2e.ts`
2. Run script, fix any breakages
3. Update audit scripts

### Week 5: Tenancy Agreement (Quick Win)
1. Create all docs
2. Create E2E script
3. Update audit scripts

### Week 6: CI/CD Integration
1. Add E2E scripts to GitHub Actions
2. Run on every PR targeting `main`
3. Block merge if E2E scripts fail

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Missing templates for some jurisdictions | High | Medium | Create Support Matrix first to identify gaps |
| Mapper data loss (fields undefined) | High | Medium | Use Field Map + debug scripts to trace data flow |
| E2E scripts fail due to environment issues | Medium | High | Document prerequisites clearly, use fallback validation |
| Too much work, scope creep | Medium | Medium | Phase approach, complete one product before starting next |
| Tests pass but real users still hit bugs | High | Low | Combine automated E2E with manual QA testing |

---

## Conclusion

By applying the Notice Only discipline to all products, we'll achieve:

- **Confidence**: Every product works end-to-end before deployment
- **Debuggability**: Clear data flow from MSQ → mapper → template
- **Documentation**: Support matrices show exactly what's supported
- **No Surprises**: Canonical jurisdictions everywhere, no legacy values

**Owner**: Engineering Team
**Timeline**: 6 weeks (phased approach)
**Status**: Ready to start Phase 1 (Complete Pack)
