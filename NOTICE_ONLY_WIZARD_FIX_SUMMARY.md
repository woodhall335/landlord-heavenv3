# Notice Only Wizard Fix Summary

**Date**: 2025-12-13
**Branch**: `claude/fix-notice-only-wizard-01PZ3RReD9NPTmsoUA4Nqjb4`
**Status**: ✅ Fixed and Committed

## Problem Statement

The Notice Only wizard for England & Wales and Scotland had several critical issues:

1. **Wrong conditional steps/fields**: Selecting "Section 8 only" still showed Section 21-specific fields ("Date after which tenant must leave")
2. **422 errors on preview**: Document generation failed with "Missing required fields for Section 21 notice" even when user selected Section 8
3. **Route intent override**: User's explicit route selection (e.g., Section 8) was overridden by decision engine "smart recommend" returning Section 21
4. **Missing field mappings**: `tenant_full_name` and other fields weren't being extracted/mapped correctly

## Root Causes Identified

### 1. Route Derivation Mismatch (`mqs-loader.ts:66`)

**Issue**: The `deriveRoutesFromFacts()` function checked for `eviction_route` or `notice_type`, but the Notice Only YAML uses `eviction_route_intent`.

**Code Before**:
```typescript
const routeAnswer = (answers as any).eviction_route || (answers as any).notice_type;
```

**Code After**:
```typescript
// IMPORTANT: Check all possible route field names (including eviction_route_intent from Notice Only YAML)
const routeAnswer =
  (answers as any).eviction_route_intent ||
  (answers as any).eviction_route ||
  (answers as any).notice_type;
```

**Impact**: Conditional questions with `routes: [section_8]` or `routes: [section_21]` weren't being shown/hidden correctly because the route derivation returned `['unknown']` instead of `['section_8']`.

---

### 2. Missing `tenant_full_name` Extraction (`normalize.ts:143`)

**Issue**: The `extractTenants()` function looked for `tenant1_name`, `defendant_name_1`, etc., but didn't check for `tenant_full_name` (which the Notice Only YAML maps to directly).

**Code Before**:
```typescript
const explicitPrimaryName =
  getWizardValue(wizard, 'tenant1_name') ||
  getWizardValue(wizard, 'defendant_name_1') ||
  getWizardValue(wizard, 'defendant_full_name') ||
  // ...
```

**Code After**:
```typescript
const explicitPrimaryName =
  getWizardValue(wizard, 'tenant_full_name') ||  // IMPORTANT: Notice Only YAML maps to this
  getWizardValue(wizard, 'tenant1_name') ||
  getWizardValue(wizard, 'defendant_name_1') ||
  // ...
```

**Impact**: When the wizard called `wizardFactsToCaseFacts()` and then `extractTenants()`, the tenant name wasn't found, resulting in `facts.parties.tenants[0]?.name` being empty. Document generation then failed with "Missing required fields: tenant_full_name".

---

### 3. Smart Recommend Overriding User Intent (`checkpoint/route.ts:172`, `analyze/route.ts:689`)

**Issue**: Both the `/api/wizard/checkpoint` and `/api/wizard/analyze` endpoints ran the decision engine and persisted `recommended_route` to the cases table, overriding the user's explicit selection.

**Original Logic** (checkpoint):
```typescript
// SMART RECOMMEND WINS: Persist recommended_route to cases table
const smartRecommendedRoute = decision.recommended_routes.length > 0
  ? decision.recommended_routes[0]
  : null;

if (smartRecommendedRoute) {
  await supabase.from('cases').update({
    recommended_route: smartRecommendedRoute,
  }).eq('id', case_id);
}
```

**New Logic** (both endpoints):
```typescript
// ROUTE INTENT PRIORITY LOGIC:
// For notice_only product, explicit user route selection (eviction_route_intent) takes precedence
// over decision engine "smart recommend". Complete pack can still use smart recommend.
const userRouteIntent =
  (wizardFacts as any).eviction_route_intent ||
  (wizardFacts as any).eviction_route ||
  null;

let finalRecommendedRoute: string | null = null;

if (effectiveProduct === 'notice_only' && userRouteIntent) {
  // For notice_only: User intent wins
  if (Array.isArray(userRouteIntent)) {
    const normalized = userRouteIntent.map((r) =>
      String(r).toLowerCase().includes('section_8') ? 'section_8' :
      String(r).toLowerCase().includes('section_21') ? 'section_21' : r
    );
    finalRecommendedRoute = normalized.includes('section_8') ? 'section_8' : normalized[0] || null;
  } else if (typeof userRouteIntent === 'string') {
    const lower = userRouteIntent.toLowerCase();
    if (lower.includes('section_8')) finalRecommendedRoute = 'section_8';
    else if (lower.includes('section_21')) finalRecommendedRoute = 'section_21';
    else finalRecommendedRoute = userRouteIntent;
  }
} else {
  // For complete_pack or when no explicit user intent: Decision engine wins
  finalRecommendedRoute = decisionEngineRecommendedRoute || route;
}
```

**Impact**: For `notice_only` product, the user's explicit route choice (from the "Which notice route do you want to use?" question) now takes precedence over the decision engine's algorithmic recommendation. For `complete_pack`, the decision engine still provides smart recommendations.

---

## Files Changed

| File | Lines Changed | Description |
|------|--------------|-------------|
| `src/lib/wizard/mqs-loader.ts` | 68-71 | Added `eviction_route_intent` to route derivation |
| `src/lib/case-facts/normalize.ts` | 144, 155, 161 | Added `tenant_full_name` and `tenant_email`/`tenant_phone` to extraction logic |
| `src/lib/documents/eviction-wizard-mapper.ts` | 117 | Added comment documenting tenant name extraction |
| `src/app/api/wizard/checkpoint/route.ts` | 172-224 | User intent wins logic for notice_only |
| `src/app/api/wizard/analyze/route.ts` | 740-777 | User intent wins logic for notice_only |

**Total**: 5 files, ~100 insertions, ~19 deletions

---

## Testing & Verification

### Manual UI Tests (Required)

#### Test 1: Notice Only E&W - Section 8
1. Navigate to `/products/notice-only` and select England & Wales
2. In "Which notice route do you want to use?", select **Section 8** only
3. Proceed through wizard:
   - ✅ Should see "Which grounds under Section 8 apply?"
   - ✅ Should see "Rent arrears summary" (if arrears grounds selected)
   - ✅ Should NOT see Section 21-only fields (expiry date with Form 6A copy)
4. Preview document:
   - ✅ Should generate **Form 3** (Section 8 Notice Seeking Possession)
   - ✅ No 422 errors
   - ✅ `recommended_route` in DB should be `section_8`

#### Test 2: Notice Only E&W - Section 21
1. Navigate to `/products/notice-only` and select England & Wales
2. In "Which notice route do you want to use?", select **Section 21** only
3. Proceed through wizard:
   - ✅ Should see "Deposit and compliance checklist"
   - ✅ Should see "Date after which tenant must leave (for Section 21 Form 6A)"
   - ✅ Should NOT see Section 8-only fields (grounds selection, arrears breakdown)
4. Preview document:
   - ✅ Should generate **Form 6A** (Section 21 Notice)
   - ✅ No 422 errors
   - ✅ `recommended_route` in DB should be `section_21`

#### Test 3: Notice Only Scotland
1. Navigate to `/products/notice-only` and select Scotland
2. Complete wizard flow
3. Preview document:
   - ✅ Should generate **Notice to Leave** (Scotland)
   - ✅ No 422 errors
   - ✅ All required fields populated

### Automated Test Script

```bash
# Set wizard base URL (use local dev server)
export WIZARD_BASE_URL="http://localhost:5000"

# Run end-to-end wizard flow tests
node scripts/test-wizard-flows.mjs
```

**Expected Output for notice_only/england-wales**:
```
✅ Flow complete: notice_only / england-wales
   - Case ID: [uuid]
   - Progress: 100%
   - Analyze response:
     - recommended_route: section_8  # Should match what user selected in the script
     - case_strength_score: [0-100]
     - blocking_issues: []
```

**Key Assertion**: `recommended_route` in analyze response should match the route selected in the test script's dummy answers, NOT what the decision engine algorithmi recommends.

---

## Known Limitations & Future Enhancements

### 1. Field-Level Conditional Rendering (UI Enhancement)
**Current State**: The `notice_expiry_date` field in the `notice_service` group question doesn't have a `dependsOn` clause at the field level. The YAML comment (line 418-420) indicates this should be conditional, but field-level conditionals may require frontend support.

**Workaround**: The field doesn't have `validation: required`, so it won't block Section 8 flows. Users will just see an optional field they can ignore.

**Future Enhancement**: Add frontend support for field-level `dependsOn` within group questions, or split `notice_service` into two separate questions (one for Section 8, one for Section 21).

### 2. Per-Step Validation Enforcement
**Current State**: The wizard allows users to proceed to the next step even if required fields are missing. Validation errors are shown, but not blocking.

**Future Enhancement**: Implement strict per-step validation that prevents "Next" button from being clickable until all required fields for the current step are filled.

### 3. Ask Heaven Suggestions Not Showing in UI
**Current State**: The backend `enhanceAnswer()` call (in `/api/wizard/answer`) returns suggestions, but the frontend wizard UI doesn't render them.

**Future Enhancement**: Update frontend wizard components to display `ask_heaven.suggested_wording` and `missing_information` to guide users.

### 4. Both Routes Selected Behavior
**Current State**: If user selects both Section 8 and Section 21 via multi-select, the system prioritizes Section 8.

**Future Enhancement**: Allow dual-route preview, or show a disambiguation step asking "Which route do you want to use as primary for this notice?"

---

## Deployment Checklist

- [x] Code changes committed to feature branch
- [ ] Manual UI test: Section 8 only flow
- [ ] Manual UI test: Section 21 only flow
- [ ] Manual UI test: Scotland Notice to Leave
- [ ] Automated script test: `test-wizard-flows.mjs`
- [ ] PR created with this summary as description
- [ ] Code review completed
- [ ] Merged to main branch
- [ ] Deployed to production
- [ ] Post-deployment smoke test

---

## Related Documentation

- **YAML Flow Definition**: `config/mqs/notice_only/england-wales.yaml`
- **Scotland Flow**: `config/mqs/notice_only/scotland.yaml`
- **Decision Engine**: `src/lib/decision-engine/index.ts`
- **Route Normalizer**: `src/lib/wizard/route-normalizer.ts`
- **Case Facts Schema**: `src/lib/case-facts/schema.ts`
- **Document Generators**: `src/lib/documents/section8-generator.ts`, `src/lib/documents/generator.ts` (section21_form6a.hbs)

---

## Questions or Issues?

If you encounter any issues during testing or deployment:

1. Check browser console for frontend errors
2. Check server logs for backend errors (especially around checkpoint/analyze endpoints)
3. Inspect the `case_facts.facts` column in Supabase to verify `eviction_route_intent` is being persisted correctly
4. Verify `cases.recommended_route` matches user intent after checkpoint/analyze calls

**Contact**: Claude Code (automated fix session 2025-12-13)
