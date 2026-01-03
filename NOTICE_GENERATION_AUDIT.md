# Notice-Only Generation Audit Report

**Date:** 2024-12-22
**Scope:** Puppeteer timeout, DEPOSIT_FIELD_REQUIRED validation, deposit scheme mapping, end-to-end validation flow

---

## Executive Summary

This audit identified **three root causes** affecting Notice-Only generation:

| Issue | Root Cause | Severity | Fix Complexity |
|-------|------------|----------|----------------|
| Puppeteer Timeout | Browser lifecycle is correct; timeout at `networkidle0` | Medium | LOW |
| DEPOSIT_FIELD_REQUIRED (4x) | MQS question ID/maps_to mismatch + duplicate checks | High | MEDIUM |
| Deposit Scheme Null | No MQS question collects scheme name | High | LOW |

The validation flow is functioning correctly - the "legacy validation suppressed" messages are intentional to prevent drift between unified and legacy validators.

---

## Issue 1: Puppeteer Timeout on Form 6A

### Current Implementation

**File:** `src/lib/documents/generator.ts`

```typescript
// Lines 702-706: Browser creation
browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// Line 954: Content wait strategy
await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

// Lines 985-988: Cleanup in finally block
finally {
  if (browser) {
    await browser.close();
  }
}
```

### Analysis

**Browser Lifecycle:** ✅ CORRECT
- Browser is created per request (line 703)
- Browser is closed in `finally` block (line 987)
- No singleton or pool that could leak

**Potential Timeout Causes:**

1. **`networkidle0` wait strategy** - Waits for 0 network connections for 500ms. If template has resources that never fully load, this times out.

2. **Form 6A Complexity** - Section 21 template is the most complex with:
   - Multiple conditional sections
   - Full print CSS injection
   - Complex @page rules

3. **Memory Pressure** - If previous requests didn't fully release memory, subsequent requests may be slower.

### Recommended Fix

```typescript
// Replace networkidle0 with networkidle2 (waits for ≤2 connections)
await page.setContent(finalHtml, {
  waitUntil: 'networkidle2',  // More lenient wait
  timeout: 45000,             // Increase from default 30s
});
```

**Risk:** LOW - This is a defensive change that makes PDF generation more resilient.

---

## Issue 2: DEPOSIT_FIELD_REQUIRED Validation Warning (4x)

### Current Behavior

```
[NOTICE-PREVIEW-API] Legacy validation warnings: {
  warnings: [
    'DEPOSIT_FIELD_REQUIRED',
    'DEPOSIT_FIELD_REQUIRED',
    'DEPOSIT_FIELD_REQUIRED',
    'DEPOSIT_FIELD_REQUIRED'
  ]
}
```

### Root Cause Analysis

**Source 1:** `src/lib/jurisdictions/validators.ts:284-291`
```typescript
// Schema field collector iterates over ALL deposit-related fields in facts_schema
for (const field of relevantFields) {
  // Checks each schema field separately
  if (isMissing(resolvedValue)) {
    const issue: LegalValidationIssue = {
      code: 'DEPOSIT_FIELD_REQUIRED',  // Emitted per field
      ...
    };
  }
}
```

**Source 2:** `src/lib/jurisdictions/validators.ts:322-337`
```typescript
// Explicit check for deposit_protected_scheme fact
const depositScheme = resolveFactValue(facts, 'deposit_protected_scheme');
if (depositProtected === true && isMissing(depositScheme)) {
  const issue: LegalValidationIssue = {
    code: 'DEPOSIT_FIELD_REQUIRED',
    user_message: 'Deposit protection scheme details are required...',
    ...
  };
}
```

**Source 3:** `src/lib/wizard/gating.ts:331-340`
```typescript
// Duplicate check in gating module
const depositScheme = resolveFactValue(facts, 'deposit_protected_scheme');
if (depositScheme === undefined || ...) {
  blocking.push({
    code: 'DEPOSIT_FIELD_REQUIRED',
    ...
  });
}
```

### Critical Mapping Mismatch

**MQS Question (england.yaml:256-273):**
```yaml
- id: deposit_protected_scheme                    # Question ID
  question: "Is the deposit protected in an approved scheme?"
  inputType: yes_no                               # YES/NO question
  maps_to:
    - deposit_protected                           # Maps to deposit_protected, NOT deposit_protected_scheme!
```

**What validation expects:**
```typescript
// validators.ts expects a SCHEME NAME stored at deposit_protected_scheme
const depositScheme = resolveFactValue(facts, 'deposit_protected_scheme');
// But MQS maps the YES/NO answer to deposit_protected!
```

### Field Name Mapping Table

| Validation Expects | MQS Question ID | maps_to | Collected Facts Key |
|--------------------|-----------------|---------|---------------------|
| `deposit_protected_scheme` | `deposit_protected_scheme` | `deposit_protected` | **MISMATCH** - stores at `deposit_protected` |
| `deposit_protected` | (derived) | - | `deposit_protected` (correct) |
| `deposit_scheme` | MISSING | - | `null` (no question collects this) |

### Why 4 Occurrences?

1. **Schema fields iteration** in `validateDepositCompliance()` - iterates over multiple deposit fields in facts_schema
2. **Explicit deposit_protected_scheme check** in `validateDepositCompliance()` - line 322
3. **Gating module check** in `evaluateEvictionGating()` - line 331
4. **Possible duplicate from legacy/unified validation merge**

---

## Issue 3: Deposit Scheme is Null

### Current Behavior

```
[mapNoticeOnlyFacts] Deposit - amount: 1000 protected: true scheme: null
```

### Root Cause

**No MQS question collects the specific deposit scheme name.**

The question `deposit_protected_scheme` asks a YES/NO question:
> "Is the deposit protected in an approved scheme?"

This captures whether it's protected (`deposit_protected = true`), but NOT which scheme (DPS, TDS, MyDeposits).

### Evidence

**mapNoticeOnlyFacts (normalize.ts:2461-2468):**
```typescript
templateData.deposit_scheme = extractString(
  getFirstValue(wizard, [
    'deposit_scheme',               // Never set by MQS
    'deposit_scheme_name',          // Never set by MQS
    'deposit_scheme_wales_s173',    // Wales-specific
    'deposit_scheme_fault',         // Wales fault-based
  ])
);
```

**None of these keys are populated** because there's no MQS question that maps to them.

### Required Fix

**Option A (Recommended):** Add new question for scheme name

```yaml
- id: deposit_scheme_name
  section: Deposit & Compliance
  question: "Which deposit protection scheme was used?"
  inputType: select
  dependsOn:
    questionId: deposit_protected_scheme
    value: true
  validation:
    required: true
  options:
    - value: "dps"
      label: "Deposit Protection Service (DPS)"
    - value: "mydeposits"
      label: "MyDeposits"
    - value: "tds"
      label: "Tenancy Deposit Scheme (TDS)"
  maps_to:
    - deposit_scheme
```

**Option B:** Change the yes/no question to a scheme selector

Not recommended as it loses the explicit "is it protected" confirmation.

---

## Issue 4: End-to-End Validation Flow Analysis

### Complete Validation Pipeline

```
User answers last question
         ↓
┌─────────────────────────────────────┐
│  1. evaluateWizardGate()            │  src/lib/wizard/gating.ts
│     - Ground 8 threshold            │
│     - Deposit consistency           │
│     - Section 21 blockers           │
│     - Ground particulars            │
└─────────────────────────────────────┘
         ↓
User clicks "Preview"
         ↓
┌─────────────────────────────────────┐
│  2. validateForPreview()            │  src/lib/validation/previewValidation.ts
│     → validateFlow()                │  src/lib/validation/validateFlow.ts
│       - Capability matrix check     │
│       - Facts schema validation     │
│       - Requirements validation     │
│       - Decision engine (eviction)  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  3. validateNoticeOnlyBeforeRender()│  Legacy - SUPPRESSED
│     (Kept for logging only)         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  4. evaluateNoticeCompliance()      │  src/lib/notices/evaluate-notice-compliance.ts
│     - Route-specific checks         │
│     - S21 deposit compliance        │
│     - S21 deposit cap               │
│     - Gas/EPC/H2R/Licensing         │
│     - Date calculations             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  5. PDF Generation                  │  src/lib/documents/generator.ts
│     - Template compilation          │
│     - Puppeteer PDF                 │
└─────────────────────────────────────┘
```

### Validation Matrix

| Validation Check | Wizard Stage | Preview Stage | Generate Stage | Blocking or Warning? |
|------------------|--------------|---------------|----------------|---------------------|
| Deposit protected | Warning | Blocking (S21) | Blocking (S21) | S21: Block, S8: Warn |
| Prescribed info given | Warning | Blocking (S21) | Blocking (S21) | S21: Block, S8: Warn |
| Gas cert provided | Warning | Blocking (S21) | Blocking (S21) | S21: Block |
| EPC provided | Warning | Blocking (S21) | Blocking (S21) | S21: Block |
| How to Rent provided | Warning | Blocking (S21) | Blocking (S21) | S21: Block |
| Licensing compliant | Warning | Blocking (S21) | Blocking (S21) | S21: Block |
| 4-month bar | Warning | Blocking | Blocking | Always Block |
| Grounds selected (S8) | Warning | Blocking | Blocking | Always Block |
| Ground particulars (S8) | Warning | Blocking | Blocking | Always Block |

### "9 Issues Filtered to 0" Analysis

**Source:** `src/lib/validation/wizardIssueFilter.ts`

The filtering is **intentional and correct**. The wizard issue filter:

1. **Hides "future step" issues** - e.g., "tenant_full_name missing" when user hasn't reached that step yet
2. **Shows "problematic answer" issues** - e.g., "deposit not protected" when user answered `false`

```typescript
// wizardIssueFilter.ts:216-220
if (issue.code === 'REQUIRED_FACT_MISSING') {
  if (!answered && !problematic) {
    // This is a future step - skip it
    continue;
  }
}
```

The 9 filtered issues are likely:
- Missing required facts for questions not yet answered
- Route-specific checks for a route not yet selected

### Legacy vs Unified Validation

| Aspect | Legacy Validation | Unified Validation |
|--------|------------------|-------------------|
| Location | `validateNoticeOnlyBeforeRender()` | `validateFlow()` |
| Status | **SUPPRESSED** - logging only | **Active** - blocks |
| Purpose | Backward compatibility monitoring | Single source of truth |

The log message:
```
[NOTICE-PREVIEW-API] Legacy validation would have blocked (suppressed):
```

Is intentional - legacy validation is kept for drift monitoring but does NOT block generation.

---

## Implementation Plan

### Fix 1: Puppeteer Timeout (Risk: LOW)

**File:** `src/lib/documents/generator.ts`

```typescript
// Line ~954: Change waitUntil and add timeout
await page.setContent(finalHtml, {
  waitUntil: 'networkidle2',  // Changed from networkidle0
  timeout: 45000,             // Explicit 45s timeout
});
```

### Fix 2: Deposit Scheme Question (Risk: LOW)

**File:** `config/mqs/notice_only/england.yaml`

Add new question after `deposit_protected_scheme`:

```yaml
- id: deposit_scheme_name
  section: Deposit & Compliance
  question: "Which deposit protection scheme was used?"
  inputType: select
  dependsOn:
    questionId: deposit_protected_scheme
    value: true
  validation:
    required: true
  helperText: "Select the approved scheme protecting the deposit."
  options:
    - value: "dps"
      label: "Deposit Protection Service (DPS)"
    - value: "mydeposits"
      label: "MyDeposits"
    - value: "tds"
      label: "Tenancy Deposit Scheme (TDS)"
  maps_to:
    - deposit_scheme
```

### Fix 3: Remove Duplicate DEPOSIT_FIELD_REQUIRED Checks (Risk: MEDIUM)

**File 1:** `src/lib/jurisdictions/validators.ts`

The check at line 322-337 is valid but duplicates the schema field check. Options:
1. Keep only the explicit check (remove schema iteration for deposit fields)
2. Dedupe issues before returning

Recommended: Add deduplication at the end of `validateDepositCompliance()`:

```typescript
// At end of validateDepositCompliance, before return
const seenCodes = new Set<string>();
const dedupedBlocking = blocking.filter(issue => {
  const key = `${issue.code}:${issue.fields.join(',')}`;
  if (seenCodes.has(key)) return false;
  seenCodes.add(key);
  return true;
});
```

**File 2:** `src/lib/wizard/gating.ts`

The check at line 331-340 should be removed since it duplicates the validators.ts check:

```typescript
// REMOVE lines 331-340 (the deposit_protected_scheme check)
// The unified validation already handles this
```

### Fix 4: Update mapNoticeOnlyFacts (Risk: LOW)

**File:** `src/lib/case-facts/normalize.ts`

Add `deposit_protected_scheme` as fallback (but primary fix is adding the MQS question):

```typescript
// Line ~2462
templateData.deposit_scheme = extractString(
  getFirstValue(wizard, [
    'deposit_scheme',
    'deposit_scheme_name',
    'deposit_protected_scheme',  // ADD this fallback for backwards compat
    'deposit_scheme_wales_s173',
    'deposit_scheme_fault',
  ])
);
```

---

## Testing Requirements

### 1. Puppeteer Test
```bash
# Generate preview 3 times in succession
curl -X GET /api/notice-only/preview/[caseId] # Success ~15s
curl -X GET /api/notice-only/preview/[caseId] # Success ~15s
curl -X GET /api/notice-only/preview/[caseId] # Success ~15s
```

### 2. Deposit Validation Test
After fixes, logs should NOT show:
- `DEPOSIT_FIELD_REQUIRED` warnings (4x)
- "legacy validation would have blocked"

### 3. Deposit Scheme Test
```typescript
// Complete wizard with deposit_protected=true
// Verify deposit_scheme is in collected_facts
expect(collected_facts.deposit_scheme).toEqual('dps'); // or mydeposits/tds
```

### 4. Regression Tests
```bash
npm test -- tests/regression/deposit-bug.test.ts
npm test -- tests/lib/deposit-validation.test.ts
npm test -- tests/notice-only-section8-grounds.test.ts
```

---

## Summary of Changes

| File | Change | Risk |
|------|--------|------|
| `src/lib/documents/generator.ts` | Change `networkidle0` → `networkidle2`, add 45s timeout | LOW |
| `config/mqs/notice_only/england.yaml` | Add `deposit_scheme_name` question | LOW |
| `src/lib/jurisdictions/validators.ts` | Add issue deduplication | MEDIUM |
| `src/lib/wizard/gating.ts` | Remove duplicate deposit_protected_scheme check | MEDIUM |
| `src/lib/case-facts/normalize.ts` | Add fallback for deposit_protected_scheme | LOW |

**Total Estimated Impact:** Backward compatible, no breaking changes.
