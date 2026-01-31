# Legal Validity QA Report

**Date:** January 2026
**Scope:** All UK jurisdiction tenancy agreement templates (Standard + Premium)
**Templates Reviewed:** 8 total (2 per jurisdiction)

---

## Executive Summary

This QA pass reviewed all tenancy agreement templates across England, Wales, Scotland, and Northern Ireland for legal accuracy, jurisdiction-correct terminology, and compliance with tenant protection legislation.

**Key Finding:** Northern Ireland templates contained hardcoded "1 April 2025" dates that would become outdated. These have been fixed.

**Overall Status:** ✅ PASS (after fixes applied)

---

## Jurisdiction-by-Jurisdiction Analysis

### 1. ENGLAND

**Templates:**
- `config/jurisdictions/uk/england/templates/standard_ast_formatted.hbs`
- `config/jurisdictions/uk/england/templates/premium_ast_formatted.hbs`

**Legal Framework:** Assured Shorthold Tenancy under Housing Act 1988

| Check | Status | Notes |
|-------|--------|-------|
| AST terminology correct | ✅ PASS | References "Assured Shorthold Tenancy" appropriately |
| Housing Act 1988 reference | ✅ PASS | Correctly cited |
| Section 21/Section 8 notice provisions | ✅ PASS | Properly documented with current requirements |
| Deposit protection (30 days) | ✅ PASS | Correct deadline stated |
| Tenant Fees Act 2019 compliance | ✅ PASS | No prohibited fees, no mandatory professional cleaning |
| Guarantor sections conditional | ✅ PASS | Wrapped in `{{#if guarantor_name}}` |
| No forfeit deposit language | ✅ PASS | ADR-compliant dispute resolution |
| No hardcoded years | ✅ PASS | Only references statutory Act years (1988, 2015, 2019) |

**Severity:** No issues found.

---

### 2. WALES

**Templates:**
- `config/jurisdictions/uk/wales/templates/standard_occupation_contract.hbs`
- `config/jurisdictions/uk/wales/templates/premium_occupation_contract.hbs`

**Legal Framework:** Occupation Contract under Renting Homes (Wales) Act 2016

| Check | Status | Notes |
|-------|--------|-------|
| "Contract-Holder" terminology | ✅ PASS | Correctly uses Wales-specific term (not "Tenant") |
| "Dwelling" terminology | ✅ PASS | Correctly uses Wales-specific term |
| Renting Homes Act 2016 reference | ✅ PASS | Properly cited |
| Deposit protection (30 days) | ✅ PASS | Correct deadline stated |
| No Section 21/Section 8 references | ✅ PASS | England-only provisions excluded |
| Guarantor sections conditional | ✅ PASS | Properly conditional on `{{#if guarantor_name}}` |
| No forfeit deposit language | ✅ PASS | ADR-compliant |
| No hardcoded years | ✅ PASS | Only references Act year (2016) |

**Severity:** No issues found.

---

### 3. SCOTLAND

**Templates:**
- `config/jurisdictions/uk/scotland/templates/prt_agreement.hbs`
- `config/jurisdictions/uk/scotland/templates/prt_agreement_premium.hbs`

**Legal Framework:** Private Residential Tenancy under Private Housing (Tenancies) (Scotland) Act 2016

| Check | Status | Notes |
|-------|--------|-------|
| PRT terminology correct | ✅ PASS | "Private Residential Tenancy" used throughout |
| First-tier Tribunal reference | ✅ PASS | Scottish tribunal system correctly referenced |
| Deposit protection (30 Working Days) | ✅ PASS | Correctly uses "Working Days" (Scotland-specific) |
| No Section 21/Section 8 references | ✅ PASS | England-only provisions excluded |
| Guarantor sections conditional | ✅ PASS | Premium includes `{{#if guarantor_name}}` blocks |
| No forfeit deposit language | ✅ PASS | ADR-compliant |
| No hardcoded years | ✅ PASS | Only references Act year (2016) |

**Severity:** No issues found.

---

### 4. NORTHERN IRELAND

**Templates:**
- `config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs`
- `config/jurisdictions/uk/northern-ireland/templates/private_tenancy_premium.hbs`

**Legal Framework:** Private Tenancy under Private Tenancies (Northern Ireland) Order 2006 / Private Tenancies Act (Northern Ireland) 2022

| Check | Status | Notes |
|-------|--------|-------|
| Private Tenancy terminology | ✅ PASS | Correct NI terminology |
| County Court reference | ✅ PASS | NI court system correctly referenced |
| Deposit protection (14 days) | ✅ PASS | Correct NI-specific deadline |
| No Section 21/Section 8 references | ✅ PASS | England-only provisions excluded |
| Guarantor sections conditional | ✅ PASS | Premium has `{{#if guarantor_name}}` |
| No forfeit deposit language | ✅ PASS | ADR-compliant |
| **Hardcoded years** | ⚠️ FIXED | See below |

#### Issues Found and Fixed (CRITICAL)

**Issue 1: Hardcoded "1 April 2025" dates**
- **Severity:** CRITICAL (Legal Drift Risk)
- **Affected Files:** Both NI templates
- **Problem:** Multiple references to "1 April 2025" for EICR requirements would become outdated and misleading
- **Fix Applied:** Replaced with "as required by current legislation" language

**Issue 2: "2025 Legal Updates" heading**
- **Severity:** HIGH (Legal Drift Risk)
- **Affected Files:** Premium NI template
- **Problem:** Year-specific section heading that would become outdated
- **Fix Applied:** Changed to "Legal Requirements - Northern Ireland"

**Issue 3: "(Updated 2025)" footer text**
- **Severity:** MEDIUM (Cosmetic but misleading)
- **Affected Files:** Premium NI template
- **Problem:** Year in footer would suggest document is outdated
- **Fix Applied:** Changed to "(as amended)"

---

## Files Modified

### Northern Ireland Standard Template
**File:** `config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs`

| Line | Before | After |
|------|--------|-------|
| ~454 | "From 1 April 2025, the Landlord may increase..." | "The Landlord may increase the Rent subject to the following restrictions under current Northern Ireland law:" |
| ~649 | "For tenancies beginning on or after 1 April 2025, provide an Electrical Safety Report..." | "Provide an Electrical Safety Report (EICR) from a qualified professional where required by current legislation..." |
| ~666 | "Electrical Safety Report (for tenancies from 1 April 2025)" | "Electrical Safety Report (as required by current legislation)" |
| ~989 | "Electrical Safety Report (for tenancies from 1 April 2025)" | "Electrical Safety Report (as required by current legislation)" |

### Northern Ireland Premium Template
**File:** `config/jurisdictions/uk/northern-ireland/templates/private_tenancy_premium.hbs`

| Line | Before | After |
|------|--------|-------|
| ~6 | "updated for 2025 legal requirements" | "and Private Tenancies Act (Northern Ireland) 2022" |
| ~296 | "(Updated 2025)" | "(as amended)" |
| ~302 | "2025 Legal Updates - Northern Ireland" | "Legal Requirements - Northern Ireland" |
| ~303 | "effective from 1 April 2025" | "current Northern Ireland tenancy regulations" |
| ~640 | "Rent Increase Rules (2025 Update)" | "Rent Increase Rules" |
| ~641 | "effective from 1 April 2025" | "current Northern Ireland regulations" |
| ~777 | "From 1 April 2025, maintain a valid EICR..." | "Maintain a valid EICR where required by current legislation..." |
| ~1215 | "Required from 1 April 2025" | "Required as per current legislation" |
| ~1308 | "(Updated 2025)" | "(as amended)" |

---

## Regression Tests Added

**File:** `src/lib/documents/__tests__/tenancy-agreement-compliance.test.ts`

### New Test Suites Added:

1. **Legal Drift Prevention - Hardcoded Years**
   - Scans all templates for problematic year references (current year ±1)
   - Excludes legitimate Act references (e.g., "Housing Act 1988")
   - Excludes comments and generation timestamps
   - **91 tests total, all passing**

2. **Jurisdiction Cross-Contamination Prevention**
   - Ensures Section 21/Section 8 only appears in England templates
   - Verifies Wales uses "Contract-Holder" terminology
   - Verifies Scotland references First-tier Tribunal
   - Verifies England uses AST terminology

3. **Deposit Protection Deadlines by Jurisdiction**
   - England: 30 days
   - Wales: 30 days
   - Scotland: 30 Working Days
   - Northern Ireland: 14 days

4. **Premium Content Isolation**
   - Ensures standard template guarantor content is always conditional
   - Strips comments before analysis to avoid false positives

5. **Tenant Fees Act 2019 Compliance**
   - Checks for prohibited fee patterns
   - Ensures no "tenant must pay" context for admin/checkout/inventory/reference fees

---

## Compliance Checklist Summary

| Requirement | England | Wales | Scotland | NI |
|-------------|---------|-------|----------|-----|
| Correct legal framework referenced | ✅ | ✅ | ✅ | ✅ |
| Jurisdiction-specific terminology | ✅ | ✅ | ✅ | ✅ |
| Correct deposit protection deadline | ✅ | ✅ | ✅ | ✅ |
| No England-only terms in other jurisdictions | N/A | ✅ | ✅ | ✅ |
| Guarantor sections conditional | ✅ | ✅ | ✅ | ✅ |
| No forfeit deposit language | ✅ | ✅ | ✅ | ✅ |
| No prohibited fees | ✅ | ✅ | ✅ | ✅ |
| No hardcoded years (post-fix) | ✅ | ✅ | ✅ | ✅ |
| ADR/dispute resolution mentioned | ✅ | ✅ | ✅ | ✅ |

---

## Recommendations

1. **Regular QA Passes:** Run the compliance test suite before each release
2. **Legal Review:** Have a solicitor review templates annually for legislative changes
3. **Dynamic Dates:** Consider implementing a `{{current_legal_requirements}}` partial for legislation that changes frequently
4. **CI Integration:** Add compliance tests to CI pipeline to catch regressions

---

## Test Execution

```bash
npm run test -- src/lib/documents/__tests__/tenancy-agreement-compliance.test.ts
```

**Results:** 91 tests passed, 0 failed

---

*Report generated by Legal Validity QA Pass - January 2026*
