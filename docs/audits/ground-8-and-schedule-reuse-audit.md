# Ground 8 & Schedule of Arrears Audit Report

**Date:** 2025-12-25
**Branch:** claude/audit-ground-8-enforcement-MfLkW
**Type:** Factual code-based audit (NO code changes)

## Executive Summary

1. **Ground 8 threshold validation is NOT enforced for complete pack generation.** The threshold check exists in `gating.ts:230-290` but is only called via `evaluateWizardGate()` in notice-only flows. The Stripe webhook directly calls `generateCompleteEvictionPack()` without any Ground 8 validation.

2. **Pre-generation check only verifies arrears data EXISTS, not the threshold.** `runPreGenerationCheck()` at `pre-generation-check.ts:196-212` blocks if arrears grounds are selected but `arrears_total` is missing—it does NOT verify the 2-month threshold.

3. **schedule_of_arrears.hbs cannot be directly reused for eviction** without data collection changes. Eviction flows currently collect only `arrears_total` (flat total), not period-by-period `arrears_schedule` data required by the template.

4. **Safe reuse path exists** via a shared data mapper with conditional period fallback to free-text.

---

## TASK A: Ground 8 Blocker Audit

### A1/A2: All Ground 8 Validation Points

| File:Line | Function | Scope | Enforcement | Ground 8 Threshold Validated? | Inputs Used |
|-----------|----------|-------|-------------|-------------------------------|-------------|
| `src/lib/wizard/gating.ts:230-290` | `evaluateEvictionGating()` | wizard inline | BLOCK | **YES** | `rent_amount`, `rent_frequency`, `arrears_amount/arrears_total` |
| `src/lib/validation/pre-generation-check.ts:196-212` | `runRuleBasedChecks()` | complete_pack pre-gen | BLOCK (if no data) | **NO** (only checks data exists) | `has_rent_arrears`, `total_arrears`, `groundsStr` |
| `src/lib/notices/evaluate-notice-compliance.ts:263-330` | `evaluateNoticeCompliance()` | notice-only preview/generate | BLOCK (grounds/period) | **NO** (no threshold calc) | `section8_grounds`, `service_date` |
| `src/lib/documents/noticeOnly.ts:61-72` | `assertNoticeOnlyValid()` | notice-only generate | BLOCK | **YES** (via gating.ts) | indirectly via `evaluateWizardGate` |
| `src/lib/documents/eviction-pack-generator.ts:775-982` | `generateCompleteEvictionPack()` | complete pack gen | **NONE** | **NO** | No validation called |
| `src/app/api/webhooks/stripe/route.ts:103-114` | webhook handler | stripe fulfillment | **NONE** | **NO** | Directly calls generator |
| `config/jurisdictions/uk/england/grounds/ground_8.json` | config only | documentation | N/A | N/A | Defines legal requirements |

### A3: Complete Pack Generation Path Trace

```
Stripe webhook (checkout.session.completed)
  ↓
src/app/api/webhooks/stripe/route.ts:103-114
  if (productType === 'complete_pack')
    ↓
    generateCompleteEvictionPack(wizardFacts)  // Line 113
      ↓
      src/lib/documents/eviction-pack-generator.ts:775
        ↓
        generateEnglandOrWalesEvictionPack()  // Line 811
          ↓
          Directly generates notices + court forms
          ❌ NO call to evaluateWizardGate()
          ❌ NO call to evaluateNoticeCompliance()
          ❌ NO call to runPreGenerationCheck()
```

**Evidence:**
- `eviction-pack-generator.ts` does NOT import `evaluateWizardGate` or `evaluateNoticeCompliance`
- `stripe/route.ts:111-113` directly calls `generateCompleteEvictionPack(wizardFacts)` with no validation guard
- `generateNoticeOnlyPack()` DOES call `assertNoticeOnlyValid()` at line 1015-1023, but `generateCompleteEvictionPack()` has no equivalent

### A4: Ground 8 Validation Summary Table

| Route | Ground 8 Threshold Blocked? | Evidence |
|-------|----------------------------|----------|
| **Notice-only wizard** | YES | `gating.ts:274-281` via `evaluateWizardGate()` |
| **Notice-only preview** | YES | `noticeOnly.ts:61-72` calls `evaluateWizardGate()` |
| **Notice-only generate** | YES | `noticeOnly.ts:61-72` via `assertNoticeOnlyValid()` |
| **Complete pack wizard** | YES | `gating.ts` applied during wizard |
| **Complete pack pre-gen API** | **NO** | `pre-generation-check.ts` only checks data exists |
| **Complete pack Stripe webhook** | **NO** | No validation called |

### Final Answer - Task A:

**Is Ground 8 threshold hard-blocked for complete packs today?**

## **NO**

**Evidence:**
1. `src/app/api/webhooks/stripe/route.ts:113` calls `generateCompleteEvictionPack(wizardFacts)` directly
2. `generateCompleteEvictionPack()` at `eviction-pack-generator.ts:775-982` contains zero validation calls
3. `runPreGenerationCheck()` at `pre-generation-check.ts:196-212` only checks `if (!hasArrears && !totalArrears)` (data existence), NOT `if (arrearsInMonths < 2)` (threshold)
4. The threshold calculation exists ONLY in `gating.ts:272-281` which is never called in the complete pack generation path

---

## TASK B: Schedule of Arrears Reuse Audit

### B1: Inventory

**schedule_of_arrears.hbs locations:**

| Path | Jurisdiction |
|------|--------------|
| `config/jurisdictions/uk/england/templates/money_claims/schedule_of_arrears.hbs` | England |
| `config/jurisdictions/uk/scotland/templates/money_claims/schedule_of_arrears.hbs` | Scotland |

**Template context keys expected (from template source):**

```handlebars
{{claimant_reference}}
{{#each arrears_schedule}}
  {{period}}
  {{due_date}}
  {{currency amount_due}}
  {{currency amount_paid}}
  {{currency arrears}}
{{/each}}
{{currency arrears_total}}
```

**Money claim data flow** (`money-claim-pack-generator.ts:379-394`):

```typescript
arrears_schedule: claim.arrears_schedule || []  // ArrearsEntry[]
```

`ArrearsEntry` type (`money-claim-pack-generator.ts:21-27`):

```typescript
interface ArrearsEntry {
  period: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  arrears: number;
}
```

**Eviction data shape** (`case-facts/schema.ts:93-100`):

```typescript
interface ArrearsItem {
  period_start: string;
  period_end: string;
  rent_due: number;
  rent_paid: number;
  amount_owed?: number;
}
```

**Key difference:** Field names don't match. `ArrearsItem` ≠ `ArrearsEntry`.

### B2: Matrix/Capabilities Analysis

**templateRegistry.ts registration:**

| Product | England | Wales | Scotland |
|---------|---------|-------|----------|
| money_claim | `schedule_of_arrears.hbs` (line 71) | Uses England (line 83) | `schedule_of_arrears.hbs` (line 99) |
| eviction_pack | **NOT included** (lines 41-49) | **NOT included** | **NOT included** |
| notice_only | **NOT included** | **NOT included** | **NOT included** |

**Insertion point for adding schedule to eviction:**

Option A - **Template registry** (`templateRegistry.ts:41-49`):

```typescript
const evictionPackTemplates: Record<Jurisdiction, string[]> = {
  england: [
    // ... existing ...
    "uk/england/templates/money_claims/schedule_of_arrears.hbs", // ADD
  ],
```

Option B - **Generator function** (`eviction-pack-generator.ts:532-711`):
Add schedule generation alongside existing documents in `generateEnglandOrWalesEvictionPack()`.

### B3: Data Availability Audit

| Jurisdiction | Route | `arrears_schedule` (period-by-period) | `arrears_total` (flat) |
|--------------|-------|--------------------------------------|------------------------|
| England | notice_only | **NO** - MQS only collects total | YES (`arrears_total`) |
| England | complete_pack | **NO** - MQS only collects total | YES (`total_arrears`) |
| Wales | notice_only | **NO** | YES |
| Scotland | notice_only | **NO** | YES |
| England | money_claim | **YES** (`arrears_schedule` field) | YES (computed) |
| Scotland | money_claim | **YES** | YES |

**What's missing for eviction schedule generation:**

| Field Required | MQS Key Needed | Location |
|----------------|----------------|----------|
| `period` | `arrears_items[].period_start` + `period_end` | `config/mqs/notice_only/england.yaml` or `complete_pack/england.yaml` |
| `due_date` | `arrears_items[].due_date` | New MQS question |
| `amount_due` | `arrears_items[].rent_due` | New MQS question |
| `amount_paid` | `arrears_items[].rent_paid` | New MQS question |
| `arrears` | Computed or `amount_owed` | Computed |

**Current eviction MQS collection** (`notice_only/england.yaml:446-461`):

```yaml
- id: arrears_total
- id: arrears_from_date  # Optional, only start date
```

### B4: Lowest-Risk Reuse Options

#### Option 1: Shared Data Mapper with Graceful Degradation

**Pros:**
- No MQS changes required initially
- Template reuse with fallback to totals-only
- Zero regression risk to money claims

**Cons:**
- Period schedule only available if data exists (requires MQS expansion for full use)

**Insertion points:**
- Create `src/lib/documents/arrears-schedule-mapper.ts`
- Integrate in `eviction-pack-generator.ts:532` (England/Wales) and Scotland equivalent
- Template conditionally renders schedule if `arrears_schedule.length > 0`, else shows total-only summary

**Template context keys:** Same as money claim (`arrears_schedule`, `arrears_total`, `claimant_reference`)

**Jurisdiction branching:** Not required - same template works for both

#### Option 2: Eviction-Specific Wrapper Template

**Pros:**
- Complete control over eviction-specific messaging
- Can add legal citations specific to S8 arrears grounds

**Cons:**
- Duplicates template maintenance
- Divergence risk from money claim version

**Insertion points:**
- Create `config/jurisdictions/uk/england/templates/eviction/arrears_schedule.hbs`
- Add to `evictionPackTemplates` in `templateRegistry.ts:41-49`

#### Option 3: Adapt CaseFacts.issues.rent_arrears.arrears_items

**Pros:**
- Uses existing schema structure
- Already typed in `schema.ts:93-100`

**Cons:**
- Requires mapper from `ArrearsItem` → `ArrearsEntry` (field name translation)
- MQS expansion still needed to collect the data

**Mapper needed:**

```typescript
// Field mapping: ArrearsItem → ArrearsEntry
{
  period: `${item.period_start} to ${item.period_end}`,
  due_date: item.period_end,  // or derive from rent_due_day
  amount_due: item.rent_due,
  amount_paid: item.rent_paid,
  arrears: item.rent_due - item.rent_paid
}
```

### B5: Current vs Required Table

| Jurisdiction | Route | Schedule Data Available? | Schedule Doc Generated? |
|--------------|-------|-------------------------|------------------------|
| England | money_claim | **YES** | **YES** |
| Wales | money_claim | **YES** (uses England) | **YES** |
| Scotland | money_claim | **YES** | **YES** |
| England | notice_only | **NO** (only total) | **NO** |
| England | complete_pack | **NO** (only total) | **NO** |
| Wales | notice_only | **NO** | **NO** |
| Scotland | notice_only | **NO** | **NO** |

### Final Answer - Task B:

**Can we reuse schedule_of_arrears.hbs for S8 without breaking money claims?**

## **YES, with conditions**

**Evidence:**
1. Template is pure Handlebars with no product-specific logic (`schedule_of_arrears.hbs:1-33`)
2. Money claim generator passes `arrears_schedule` via `baseTemplateData` (`money-claim-pack-generator.ts:333`)
3. Eviction can use same template if it supplies matching context shape
4. Template registry is additive—adding to `evictionPackTemplates` doesn't modify `moneyClaimTemplates`

**Safest approach:**
**Option 1 (Shared Data Mapper)** with conditional rendering. Create a thin adapter that:
1. Takes eviction `arrears_items` (if present) or falls back to `arrears_total`
2. Transforms to `ArrearsEntry[]` format expected by template
3. Passes to shared template
4. Template renders schedule if array populated, else shows totals-only

**MSQ impact:** None for notice-only V1 if using graceful fallback. Full schedule requires MQS expansion to collect period-by-period data.

---

## Recommended Safest Path (Audit-Only)

### For Ground 8 enforcement in complete packs:

The lowest-risk fix is to add a validation guard at the **start of** `generateCompleteEvictionPack()` that calls `evaluateWizardGate()` or a subset Ground 8 threshold check, throwing before any document generation occurs.

**Suggested location:** `eviction-pack-generator.ts:775-790` (before any document generation)

### For schedule_of_arrears reuse:

The safest path is creating `src/lib/documents/arrears-schedule-mapper.ts` that:
1. Accepts either `ArrearsItem[]` (eviction) or `ArrearsEntry[]` (money claim)
2. Normalizes to template-expected shape
3. Returns empty array if no period data (template falls back to totals)

This approach has **zero regression risk** to money claims and enables incremental MQS expansion for eviction period data.

---

## Files Analyzed

| Category | Files |
|----------|-------|
| Ground 8 validation | `gating.ts`, `pre-generation-check.ts`, `evaluate-notice-compliance.ts`, `noticeOnly.ts` |
| Complete pack generation | `eviction-pack-generator.ts`, `stripe/route.ts` |
| Schedule templates | `england/.../schedule_of_arrears.hbs`, `scotland/.../schedule_of_arrears.hbs` |
| Data schemas | `schema.ts`, `money-claim-pack-generator.ts` |
| Matrix/registry | `templateRegistry.ts` |
| MQS configs | `notice_only/england.yaml`, `complete_pack/england.yaml` |
| Ground config | `grounds/ground_8.json` |
