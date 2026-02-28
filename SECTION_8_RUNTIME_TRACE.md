# Section 8 Runtime Route Resolution Trace

**Date**: 2024-12-23
**Purpose**: Document exact runtime paths for Notice Only → England → Section 8 flow

---

## Executive Summary

The Section 8 notice period calculation has **TWO** implementations:

| Location | Function | Used By | Authority |
|----------|----------|---------|-----------|
| `src/lib/documents/notice-date-calculator.ts` | `calculateSection8NoticePeriod()` | Compliance validation, PDF generation | **PRIMARY** |
| `src/lib/case-facts/normalize.ts` | `calculateRequiredNoticePeriod()` | Template data creation | Secondary (overwritten) |

**Both implementations are now aligned** with correct 60-day periods for Grounds 10 & 11.

---

## 1. Wizard Flow Entrypoints

### MQS Configuration Loading
- **Entrypoint**: `POST /api/wizard/mqs`
- **File**: `src/app/api/wizard/mqs/route.ts`
- **Config path**: `config/mqs/notice_only/england.yaml` (line 28)
- **Ground selection question**: `section8_grounds_selection` (lines 469-480)

### Ground JSON Files
- **Path**: `config/jurisdictions/uk/england/grounds/`
- **Files**: `ground_1.json` through `ground_17.json`, `ground_14a.json`
- **Notice period metadata**: Each file contains `notice_period.section_8_notice`

---

## 2. Validation Path

### Unified Validation
- **Entrypoint**: `POST /api/wizard/validate`
- **File**: `src/app/api/wizard/validate/route.ts`
- **Primary function**: `validateFlow()` at `src/lib/validation/validateFlow.ts:154`

### Validation Chain
```
validateFlow()
  ├── assertFlowSupported() - Capability matrix check
  ├── validateFactsSchema() - Schema validation (config/jurisdictions/uk/england/facts_schema.json)
  ├── getRequirements() - Requirements engine
  ├── validateRequirements() - Requirements validation
  └── runDecisionEngine() - Decision engine compliance (notice_only/eviction_pack only)
```

### Compliance Validation
- **File**: `src/lib/notices/evaluate-notice-compliance.ts`
- **Section 8 block**: Lines 265-331
- **Date calculation**: Calls `calculateSection8ExpiryDate()` at line 298
- **Validation codes**: `S8-GROUNDS-REQUIRED`, `S8-NOTICE-PERIOD`

---

## 3. Preview Generation Path

### API Route
- **Entrypoint**: `GET /api/notice-only/preview/[caseId]`
- **File**: `src/app/api/notice-only/preview/[caseId]/route.ts`

### Execution Flow
```
1. Load case from Supabase
2. wizardFactsToCaseFacts() - Basic conversion
3. deriveCanonicalJurisdiction() - Jurisdiction detection
4. validateForPreview() - Unified validation (line 206)
5. validateNoticeOnlyBeforeRender() - Legacy validation (line 231, suppressed)
6. evaluateNoticeCompliance() - Compliance check (line 265)
7. mapNoticeOnlyFacts() - Template data (line 332) ← FIRST date calc
8. calculateSection8ExpiryDate() - Date override (line 401) ← SECOND date calc (WINS)
9. generateDocument() - Template rendering (line 515)
10. generateNoticeOnlyPreview() - PDF merging (line 1021)
```

### Template Path
- **Section 8 template**: `config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs`

---

## 4. Date Calculation Path

### TWO Competing Implementations

#### Implementation A: normalize.ts (Template Data)
- **File**: `src/lib/case-facts/normalize.ts`
- **Lookup table**: `GROUND_NOTICE_PERIODS` (lines 1878-1900)
- **Function**: `calculateRequiredNoticePeriod()` (lines 1909-1941)
- **Called from**: `mapNoticeOnlyFacts()` (around line 2818)
- **Sets**: `templateData.earliest_possession_date`, `templateData.notice_period_days`

#### Implementation B: notice-date-calculator.ts (Authoritative)
- **File**: `src/lib/documents/notice-date-calculator.ts`
- **Lookup table**: `SECTION8_GROUND_NOTICE_PERIODS` (lines 101-123)
- **Function**: `calculateSection8NoticePeriod()` (lines 138-269)
- **Wrapper**: `calculateSection8ExpiryDate()` (lines 274-313)
- **Called from**:
  - `evaluateNoticeCompliance()` (line 298) - Compliance validation
  - Preview route (line 401) - PDF generation

### Which One Is Actually Used?

**For PDF generation**: `notice-date-calculator.ts` is authoritative.

The preview route:
1. Line 332: Calls `mapNoticeOnlyFacts()` → sets `templateData.earliest_possession_date`
2. Lines 391-419: Calls `calculateSection8ExpiryDate()` → **OVERWRITES** those values

```typescript
// Lines 409-414 in preview route
if (calculatedDate) {
  templateData.earliest_possession_date = calculatedDate.earliest_valid_date;  // OVERWRITES
  templateData.notice_period_days = calculatedDate.notice_period_days;          // OVERWRITES
  ...
}
```

---

## 5. Ground Notice Period Lookup Tables

Both tables are now **ALIGNED** with correct values:

| Ground | Period (Days) | Type |
|--------|---------------|------|
| 1, 2, 5, 6, 7, 9, 10, 11, 16 | 60 | 2 months (MINIMUM) |
| 3, 4, 7A, 7B, 8, 12, 13, 14, 14ZA, 15, 17 | 14 | 2 weeks |
| 14 (serious ASB), 14A | 0 | Immediate |

---

## 6. Policy Verification: Grounds 10/11

### Legal Requirement
**60 days (2 months) is the LEGAL MINIMUM**, not recommended.

From `config/jurisdictions/uk/england/grounds/ground_10.json`:
```json
"notice_period": {
  "section_8_notice": "2 months minimum (NOT 2 weeks)",
  "court_proceedings": "Can be started after 2 months"
}
```

From `config/jurisdictions/uk/england/grounds/ground_11.json`:
```json
"notice_period": {
  "section_8_notice": "2 months minimum",
  "court_proceedings": "Can be started after 2 months"
}
```

### Legal Basis
Housing Act 1988, Schedule 2, Part IV sets out notice period requirements:
- Grounds 1, 2, 5, 6, 7, 9, **10**, **11**, 16: 2 months minimum
- Other grounds: 2 weeks minimum

---

## 7. Recommendations

### A. No Duplicate Code Removal Required (Current State)
Both implementations are now aligned. However, there is technical debt:
- Two lookup tables (`GROUND_NOTICE_PERIODS` in normalize.ts, `SECTION8_GROUND_NOTICE_PERIODS` in notice-date-calculator.ts)
- Two calculation functions that produce the same result

### B. Future Consolidation (Optional)
To reduce duplication:
1. Export `SECTION8_GROUND_NOTICE_PERIODS` from notice-date-calculator.ts
2. Import it into normalize.ts to replace `GROUND_NOTICE_PERIODS`
3. Reuse `calculateSection8NoticePeriod()` or create shared utility

### C. Regression Prevention
Added test suite in `tests/notice-only-section8-grounds.test.ts`:
- Tests for Ground 8 (14 days)
- Tests for Ground 10 (60 days)
- Tests for Ground 11 (60 days)
- Tests for mixed grounds (uses maximum)

---

## 8. File Reference Summary

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/app/api/wizard/mqs/route.ts` | MQS loading | 28 |
| `src/app/api/wizard/validate/route.ts` | Validation API | 105 |
| `src/app/api/notice-only/preview/[caseId]/route.ts` | Preview generation | 332, 401 |
| `src/lib/validation/validateFlow.ts` | Unified validation | 154 |
| `src/lib/notices/evaluate-notice-compliance.ts` | Compliance check | 298 |
| `src/lib/case-facts/normalize.ts` | Template data | 1878, 1909, 2818 |
| `src/lib/documents/notice-date-calculator.ts` | Date calculation | 101, 138, 274 |
| `config/mqs/notice_only/england.yaml` | MQS config | 469-480 |
| `config/jurisdictions/uk/england/grounds/*.json` | Ground definitions | - |

---

*Trace completed 2024-12-23. Both implementations are aligned. No legacy/duplicate paths are producing incorrect results.*
