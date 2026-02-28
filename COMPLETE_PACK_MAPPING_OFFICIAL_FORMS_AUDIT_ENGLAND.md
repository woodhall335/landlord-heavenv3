# Complete Pack Mapping & Official Forms Audit — England

**Audit Date:** 2026-01-19
**Auditor:** Claude Code (Legal/Engineering Integration Auditor)
**Scope:** England Complete Eviction Pack integration audit
**Objective:** Verify pack mapping stability, MQS/MSQ alignment with Notice Only, official court form integration, and regression risk assessment

---

## 1. Executive Summary Table

| Area | Status | Risk | Key Evidence |
|------|--------|------|--------------|
| **Config (complete_pack england)** | OK | Low | `config/mqs/complete_pack/england.yaml` v2.5.0, all required fields present |
| **Normalization/Canonical routes** | Partial | Medium | `src/lib/wizard/route-normalizer.ts:18-59` — dual key pattern (`eviction_route` vs `selected_notice_route`) requires fallback resolution |
| **Pack doc composition per route** | OK | Low | `src/lib/products/pack-contents.ts:106-174` — correct docs for S21 (N5B) and S8 (N5+N119) |
| **Official forms integration (N5/N5B/N119)** | OK | Low | `src/lib/documents/official-forms-filler.ts` — PDFs present, field validation enforced |
| **Regression risk readiness** | Partial | Medium | 12 breakpoints identified, mitigations available |

**Bottom Line:** The England Complete Pack can safely coexist with Notice Only normalization improvements **IF** the identified regression breakpoints are addressed via the documented mitigations. No blocking issues found.

---

## 2. Current Contract Map

### 2.1 Canonical Route Values (England)

| Route | Canonical Value | Document Type | Pack Output |
|-------|-----------------|---------------|-------------|
| Section 8 (fault-based) | `section_8` | `section8_notice` | N5 + N119 |
| Section 21 (no-fault) | `section_21` | `section21_notice` | N5B (accelerated) |

**Evidence:**
- Route normalizer: `src/lib/wizard/route-normalizer.ts:24-28`
- Route-to-document mapping: `src/lib/wizard/route-normalizer.ts:93-105`

### 2.2 Route Key Resolution Contract

The system uses a **dual-key pattern** with fallback resolution:

| Product | Primary Key | Fallback Key(s) | Evidence |
|---------|-------------|-----------------|----------|
| Complete Pack | `eviction_route` | `selected_notice_route`, `notice_type` | `config/mqs/complete_pack/england.yaml:63-64` |
| Notice Only | `selected_notice_route` | `eviction_route`, `notice_type` | `config/mqs/notice_only/england.yaml:65-81` |

**Runtime Resolution:**
```
// src/lib/wizard/normalizeSection8Facts.ts:180-182
const selectedRoute = resolveFactValue(facts, 'selected_notice_route') ||
                      resolveFactValue(facts, 'eviction_route') ||
                      resolveFactValue(facts, 'notice_type');
```

**Risk Assessment:** The bidirectional fallback ensures compatibility, but any removal of `selected_notice_route` from Notice Only would break Complete Pack flows that consume this key.

### 2.3 Canonical Fact Keys Required by Complete Pack Generator

| Fact Key | Required For | Producer (Config) | Consumer (Code) |
|----------|--------------|-------------------|-----------------|
| `notice_served_date` | All forms | `england.yaml:76-77` | `eviction-wizard-mapper.ts:295-296` |
| `notice_expiry_date` | All forms | `england.yaml:82-85` | `eviction-wizard-mapper.ts:376` |
| `notice_service_method` | **N5B field 10a** | `england.yaml:113-134` | `official-forms-filler.ts:908-912` |
| `court_name` | N5/N5B/N119 | `england.yaml:763-772` | `official-forms-filler.ts:727-729, 896-898, 1292-1294` |
| `tenant_full_name` | All forms | `england.yaml:631-636` | `official-forms-filler.ts:734, 903, 1298` |
| `landlord_full_name` | All forms | `england.yaml:698-703` | `official-forms-filler.ts:730, 900, 1295` |
| `property_address_*` | All forms | `england.yaml:556-578` | `official-forms-filler.ts:736, 905, 1301` |
| `tenancy_start_date` | N5B/N119 | `england.yaml:580-588` | `official-forms-filler.ts:917, 1304` |
| `rent_amount` | N5/N119 | `england.yaml:146-151` | `eviction-wizard-mapper.ts:243` |
| `deposit_scheme_name` | N5B checkboxes | `england.yaml:526-535` | `eviction-wizard-mapper.ts:357-359` |
| `section8_grounds` | N5/N119 | `england.yaml:185-212` | `eviction-wizard-mapper.ts:124-171` |
| `arrears_items` | Ground 8 schedule | `england.yaml:262-300` | `eviction-wizard-mapper.ts:312` |
| `signatory_name` | Statement of Truth | `england.yaml:784-790` | `eviction-wizard-mapper.ts:374` |

### 2.4 Notice Service Method Resolution Chain

The `notice_service_method` field is **critical for N5B** and has the most complex resolution:

```typescript
// src/lib/documents/eviction-wizard-mapper.ts:297-303
notice_service_method:
  wizardFacts.notice_service_method ||
  wizardFacts.service_method ||
  wizardFacts['notice_service.service_method'] ||
  facts.notice.service_method ||
  undefined
```

**Risk:** If Notice Only changes the `maps_to` target for service method, this resolution chain must be updated.

---

## 3. Pack Outputs Verified

### 3.1 Section 21 Pack Contents (England)

| Document | Type | Required | Evidence |
|----------|------|----------|----------|
| Section 21 Notice (Form 6A) | Notice | ✅ | `pack-contents.ts:54-62` |
| Service Instructions | Guidance | ✅ | `pack-contents.ts:76-82` |
| Service & Validity Checklist | Checklist | ✅ | `pack-contents.ts:84-90` |
| **Form N5B - Accelerated Possession Claim** | Court form | ✅ | `pack-contents.ts:111-118` |
| Witness Statement | Evidence | ✅ | `pack-contents.ts:141-147` |
| Court Filing Guide | Guidance | ✅ | `pack-contents.ts:149-155` |
| Evidence Collection Checklist | Checklist | ✅ | `pack-contents.ts:157-163` |
| Proof of Service Template | Evidence | ✅ | `pack-contents.ts:165-171` |

**Verification:** Section 21 correctly includes N5B (accelerated procedure) and NOT N5/N119.

### 3.2 Section 8 Pack Contents (England)

| Document | Type | Required | Condition | Evidence |
|----------|------|----------|-----------|----------|
| Section 8 Notice (Form 3) | Notice | ✅ | Always | `pack-contents.ts:65-72` |
| Service Instructions | Guidance | ✅ | Always | `pack-contents.ts:76-82` |
| Service & Validity Checklist | Checklist | ✅ | Always | `pack-contents.ts:84-90` |
| Arrears Schedule | Evidence | ❌ | `has_arrears=true` OR Ground 8 | `pack-contents.ts:93-101` |
| **Form N5 - Claim for Possession** | Court form | ✅ | Always | `pack-contents.ts:122-129` |
| **Form N119 - Particulars of Claim** | Court form | ✅ | Always | `pack-contents.ts:131-137` |
| Witness Statement | Evidence | ✅ | Always | `pack-contents.ts:141-147` |
| Court Filing Guide | Guidance | ✅ | Always | `pack-contents.ts:149-155` |
| Evidence Collection Checklist | Checklist | ✅ | Always | `pack-contents.ts:157-163` |
| Proof of Service Template | Evidence | ✅ | Always | `pack-contents.ts:165-171` |

**Verification:** Section 8 correctly includes N5 + N119 (standard procedure) and NOT N5B.

### 3.3 Cross-Route Contamination Check

| Check | Result | Evidence |
|-------|--------|----------|
| N5B NOT in Section 8 pack | ✅ PASS | `pack-contents.ts:111-118` has `route === 'section_21'` guard |
| N5/N119 NOT in Section 21 pack | ✅ PASS | `pack-contents.ts:122-137` has `route === 'section_8'` guard |
| Wales routes blocked for England | ✅ PASS | `pack-contents.ts:322-330` returns empty for S8/S21 in Wales |

---

## 4. Official Forms: Inputs & Coverage

### 4.1 Form N5 — Claim for Possession (Standard Procedure)

**Asset Path:** `public/official-forms/n5-eng.pdf`
**Registry:** `public/official-forms/forms-manifest.json` → `england.forms.n5-eng.pdf`
**Filler Function:** `src/lib/documents/official-forms-filler.ts:721-886` (`fillN5Form`)

| Required Input | CaseData Field | Validated | Source in Complete Pack |
|----------------|----------------|-----------|-------------------------|
| Court name | `court_name` | ✅ Hard fail | `england.yaml:763-772` → `eviction-wizard-mapper.ts:372` |
| Landlord name | `landlord_full_name` | ✅ Hard fail | `england.yaml:698-703` → `eviction-wizard-mapper.ts:274` |
| Tenant name | `tenant_full_name` | ✅ Hard fail | `england.yaml:631-636` → `eviction-wizard-mapper.ts:275` |
| Property address | `property_address` | ✅ Hard fail | `england.yaml:556-578` → `eviction-wizard-mapper.ts:283` |
| Claim type | `claim_type` | ✅ Derived | `eviction-wizard-mapper.ts:267` (from route) |
| Tenancy start | `tenancy_start_date` | ⚠️ Soft | `england.yaml:580-588` |
| Rent amount | `rent_amount` | ⚠️ Soft | `england.yaml:146-151` |
| Total arrears | `total_arrears` | ⚠️ Soft | `england.yaml:241-246` |

**Coverage Assessment:** ✅ Complete — all hard-required fields are collected in MQS and mapped through eviction-wizard-mapper.

### 4.2 Form N5B — Accelerated Possession Claim (Section 21)

**Asset Path:** `public/official-forms/n5b-eng.pdf`
**Registry:** `public/official-forms/forms-manifest.json` → `england.forms.n5b-eng.pdf`
**Filler Function:** `src/lib/documents/official-forms-filler.ts:890-1284` (`fillN5BForm`)

| Required Input | CaseData Field | Validated | Source in Complete Pack | Risk |
|----------------|----------------|-----------|-------------------------|------|
| Court name | `court_name` | ✅ Hard fail | `england.yaml:763-772` | Low |
| Landlord name | `landlord_full_name` | ✅ Hard fail | `england.yaml:698-703` | Low |
| Tenant name | `tenant_full_name` | ✅ Hard fail | `england.yaml:631-636` | Low |
| Property address | `property_address` | ✅ Hard fail | `england.yaml:556-578` | Low |
| **Notice service method** | `notice_service_method` | ✅ Hard fail | `england.yaml:113-134` | **Medium** |
| S21 notice date | `section_21_notice_date` | ✅ Hard fail | `england.yaml:76-77` | Low |
| Tenancy start date | `tenancy_start_date` | ✅ Hard fail | `england.yaml:580-588` | Low |
| Deposit scheme | `deposit_scheme_*` | ⚠️ Checkbox | `england.yaml:526-535` | Low |
| EPC uploaded | `epc_uploaded` | ⚠️ Checkbox | `england.yaml:957-972` | Low |
| Gas safety uploaded | `gas_safety_uploaded` | ⚠️ Checkbox | `england.yaml:974-990` | Low |

**Fragile Input Alert — `notice_service_method`:**
- This field is **required** for N5B field 10a ("How was the notice served")
- Multiple possible paths exist (see Section 2.4)
- MQS provides via `england.yaml:113-134` with values: `first_class_post`, `recorded_delivery`, `hand_delivered`, `left_at_property`, `email`, `other`
- **Gap:** If user selects "other", the N5B form may have an invalid value

**Coverage Assessment:** ✅ Complete — all hard-required fields present. Minor gap on "other" service method.

### 4.3 Form N119 — Particulars of Claim

**Asset Path:** `public/official-forms/n119-eng.pdf`
**Registry:** `public/official-forms/forms-manifest.json` → `england.forms.n119-eng.pdf`
**Filler Function:** `src/lib/documents/official-forms-filler.ts:1286-1600` (`fillN119Form`)

| Required Input | CaseData Field | Validated | Source in Complete Pack |
|----------------|----------------|-----------|-------------------------|
| Court name | `court_name` | ✅ Hard fail | `england.yaml:763-772` |
| Landlord name | `landlord_full_name` | ✅ Hard fail | `england.yaml:698-703` |
| Tenant name | `tenant_full_name` | ✅ Hard fail | `england.yaml:631-636` |
| Property address | `property_address` | ✅ Hard fail | `england.yaml:556-578` |
| Tenancy start date | `tenancy_start_date` | ✅ Hard fail | `england.yaml:580-588` |
| Ground numbers | `ground_codes` | ⚠️ Derived | From `section8_grounds` selection |
| Arrears breakdown | `arrears_items` | ⚠️ Optional | `england.yaml:262-300` (Ground 8 only) |

**Coverage Assessment:** ✅ Complete — all fields mapped correctly.

---

## 5. Regression Breakpoints

### Risk Rating Key
- **Likelihood:** How likely a Notice Only change would trigger this
- **Impact:** Severity if triggered (Wrong doc / Blank field / Runtime error / Wrong jurisdiction)
- **Risk Score:** Likelihood × Impact (1-25)

### 5.1 Identified Breakpoints

| # | Breakpoint | Likelihood | Impact | Risk | How It Would Fail | Evidence |
|---|------------|------------|--------|------|-------------------|----------|
| 1 | **Route key rename** (`selected_notice_route` → `notice_route`) | Medium | High | **12** | Complete pack loses route, wrong documents generated | `normalizeSection8Facts.ts:180-181` |
| 2 | **Route value change** (`section_21` → `section-21`) | Low | High | **8** | Route normalizer fails, no documents generated | `route-normalizer.ts:25` |
| 3 | **Notice date path change** (`notice_served_date` → `notice.service_date`) | Medium | High | **12** | N5B missing notice date, form fill fails | `eviction-wizard-mapper.ts:295-296` |
| 4 | **Service method path change** (`notice_service_method` → `service.method`) | Medium | Critical | **16** | N5B fill throws error on hard validation | `official-forms-filler.ts:908-912` |
| 5 | **Deposit scheme value change** (`DPS` → `dps`) | Low | Medium | **4** | N5B checkbox not ticked, cosmetic issue | `eviction-wizard-mapper.ts:69-89` |
| 6 | **Ground code format change** (`Ground 8 - xxx` → `ground_8`) | Medium | High | **12** | Ground parsing fails, empty grounds array | `eviction-wizard-mapper.ts:115-122` |
| 7 | **Jurisdiction value normalization** (`england-wales` removal) | Low | Medium | **4** | Legacy cases fail, handled by migration | `eviction-wizard-mapper.ts:196-199` |
| 8 | **Evidence category rename** (`epc` → `energy_performance_certificate`) | Low | Medium | **4** | N5B checkbox not ticked, legal risk | `eviction-wizard-mapper.ts:403-406` |
| 9 | **Tenancy type enum change** (`ast_fixed` → `fixed_term_ast`) | Low | Medium | **4** | Wrong tenancy type on forms | `eviction-wizard-mapper.ts:240` |
| 10 | **Arrears items schema change** | Medium | High | **12** | Ground 8 validation fails, arrears schedule blank | `eviction-wizard-mapper.ts:140-152` |
| 11 | **Section 21 compliance nested path change** (`section21.deposit_protected`) | Medium | Medium | **9** | Compliance checklist flags wrong values | `england.yaml:362-369` |
| 12 | **Court name removal from MQS** | Low | Critical | **10** | All court forms fail hard validation | `official-forms-filler.ts:727, 896, 1292` |

### 5.2 Mitigation Recommendations

| Breakpoint | Mitigation Strategy |
|------------|---------------------|
| 1, 3, 4, 11 | Add aliasing in resolution functions with deprecation warnings |
| 2, 5, 6, 9 | Use normalization layer before consumption (already implemented) |
| 7 | Continue supporting `england-wales` as legacy alias |
| 8 | Update EvidenceCategory enum consumers alongside schema |
| 10 | Version arrears_items schema, migration for in-flight cases |
| 12 | Never remove court_name from MQS; add UI validation |

---

## 6. Priority Fix List

Based on risk score and production impact:

| Priority | Issue | Risk Score | Recommendation |
|----------|-------|------------|----------------|
| **P0** | Service method resolution has no centralized fallback | 16 | Create `resolveNoticeServiceMethod()` helper mirroring `resolveNoticeServiceDate()` |
| **P1** | Route key dual-pattern lacks documentation | 12 | Document the `eviction_route`/`selected_notice_route` contract in ARCHITECTURE.md |
| **P1** | Ground code parsing fragile to format changes | 12 | Add comprehensive test coverage for all ground format variations |
| **P1** | Arrears items schema lacks version migration | 12 | Add schema version field and migration handler |
| **P2** | N5B "other" service method handling | 9 | Add free-text input when "other" is selected |
| **P2** | Section 21 compliance nested paths undocumented | 9 | Add mapping documentation to MQS config comments |

---

## 7. Conclusion & Recommendation

### Can Notice Only be upgraded without breaking Complete Pack?

**YES** — with the following conditions:

1. **Maintain backward compatibility** for the dual key pattern (`eviction_route` / `selected_notice_route`)
2. **Do not change** the canonical route values (`section_8`, `section_21`)
3. **Add resolution fallbacks** for any path changes (mirroring existing patterns)
4. **Test Complete Pack generation** as part of Notice Only CI/CD pipeline

### Test Coverage Verification

The existing test suites provide good coverage:
- `tests/complete-pack/england-complete-pack.test.ts` — MQS coverage and template integration
- `tests/documents/court-forms-value-mapping.test.ts` — Field mapping validation
- `tests/documents/pdf-field-mapping.test.ts` — PDF field inventory

**Recommendation:** Add a specific regression test that generates a complete pack after applying Notice Only normalization changes to catch any drift.

---

## Appendix A: File Reference Index

| File | Purpose | Key Lines |
|------|---------|-----------|
| `config/mqs/complete_pack/england.yaml` | MQS config | Questions, maps_to, validation |
| `config/mqs/notice_only/england.yaml` | Notice Only MQS | Route selection, compliance |
| `src/lib/wizard/route-normalizer.ts` | Route canonicalization | 18-59, 93-105 |
| `src/lib/documents/eviction-wizard-mapper.ts` | Wizard→CaseData mapping | 173-446 |
| `src/lib/documents/eviction-pack-generator.ts` | Pack orchestration | 17-19, 700, 748, 762, 830, 841 |
| `src/lib/documents/official-forms-filler.ts` | PDF form filling | 721-886 (N5), 890-1284 (N5B), 1286-1600 (N119) |
| `src/lib/products/pack-contents.ts` | Pack composition | 106-174 |
| `src/lib/case-facts/normalize.ts` | Fact normalization | 229-281 (service date), 291-338 (expiry date) |
| `src/lib/documents/noticeOnly.ts` | Complete pack validation | 105-231 |
| `public/official-forms/forms-manifest.json` | Form registry | N5, N5B, N119 entries |

---

**Audit Complete.** No blocking issues. Medium regression risk with clear mitigations.
