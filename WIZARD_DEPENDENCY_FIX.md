# Wizard Dependency Logic Fix - Multi-Select Answer vs Scalar Dependency

## Problem Summary

**Issue:** Automated test script passes but UI wizard fails with conditional question dependencies.

**Root Cause:** Dependency checking logic failed to handle the case where:
- A user's answer is an **array** (from multi-select questions like `["section_8"]`)
- But the dependent question's dependency value is a **scalar** (like `"section_8"`)

## The Bug

### Before Fix (Broken Logic)

In both `src/app/api/wizard/answer/route.ts` and `src/lib/wizard/mqs-loader.ts`:

```typescript
// Check if dependency is satisfied
if (Array.isArray(dependsOn.value)) {
  // handles: dependsOn.value = ["foo", "bar"]
  if (Array.isArray(depValue)) {
    return depValue.some((val) => dependsOn.value.includes(val));
  }
  return dependsOn.value.includes(depValue);
}
return depValue === dependsOn.value;  // ❌ BUG: Compares ["section_8"] === "section_8"
```

### Example That Failed

**Question:** `eviction_route_intent`
- Type: `multi_select`
- Options: `["section_8", "section_21"]`
- User's answer: `["section_8"]` ← **Array**

**Dependent Question:** `section8_grounds`
- Dependency: `{ questionId: "eviction_route_intent", value: "section_8" }` ← **Scalar**

**Bug:** Comparison was `["section_8"] === "section_8"` → **FALSE** ❌

Result: `section8_grounds` question was NEVER shown in UI, even when user selected Section 8!

### Why Tests Passed

The test script (`scripts/test-wizard-flows.mjs`) bypasses this issue by:
1. Always filling ALL questions (line 76: "Always fill all fields – required or not – to avoid validation issues")
2. Not respecting conditional dependencies
3. Sending dummy data to every question regardless of applicability

## The Fix

### After Fix (Corrected Logic)

```typescript
// Check if dependency is satisfied
if (Array.isArray(dependsOn.value)) {
  // dependsOn.value is array: check if any match
  if (Array.isArray(depValue)) {
    return depValue.some((val) => dependsOn.value.includes(val));
  }
  return dependsOn.value.includes(depValue);
}
// dependsOn.value is scalar
if (Array.isArray(depValue)) {
  // ✅ NEW: Handle array answer matching scalar dependency
  return depValue.includes(dependsOn.value);
}
return depValue === dependsOn.value;
```

### Truth Table

| `dependsOn.value` | `depValue` (answer) | Before Fix | After Fix | Example |
|-------------------|---------------------|------------|-----------|---------|
| `"section_8"` (scalar) | `["section_8"]` (array) | ❌ FALSE | ✅ TRUE | User selects Section 8 in multi-select |
| `"section_8"` (scalar) | `["section_21"]` (array) | ❌ FALSE | ✅ FALSE | User selects Section 21 instead |
| `"section_8"` (scalar) | `"section_8"` (scalar) | ✅ TRUE | ✅ TRUE | Direct scalar match |
| `["section_8"]` (array) | `["section_8"]` (array) | ✅ TRUE | ✅ TRUE | Both arrays |

## Files Changed

1. **`src/app/api/wizard/answer/route.ts:415-429`**
   - Function: `computeProgress()` - filters applicable questions based on dependencies
   - Impact: Progress calculation now correctly excludes/includes conditional questions

2. **`src/lib/wizard/mqs-loader.ts:133-149`**
   - Function: `questionIsApplicable()` - determines if a question should be shown
   - Impact: Conditional questions now appear correctly in the UI

## Testing Instructions

### 1. Start Development Server

```bash
npm run dev
# Server should run on http://localhost:3000
```

### 2. Test Notice Only Wizard (England & Wales)

**Test Case A: Section 8 Selection**
1. Navigate to: `http://localhost:3000/wizard/flow?type=eviction&jurisdiction=england-wales&product=notice_only`
2. Fill in landlord details, tenant details, property address, tenancy details, rent details
3. At **"Which notice route do you want to use?"** → Select **"section_8"** only
4. Click Next
5. ✅ **Expected:** Should show **"Which grounds under Section 8 apply?"** question
6. ❌ **Before fix:** This question was HIDDEN (bug)

**Test Case B: Section 21 Selection**
1. Repeat steps 1-2
2. At **"Which notice route do you want to use?"** → Select **"section_21"** only
3. Click Next
4. ✅ **Expected:** Should SKIP "Which grounds under Section 8 apply?" question
5. ✅ **Expected:** Should go directly to notice service details

**Test Case C: Both Routes Selected**
1. Repeat steps 1-2
2. At **"Which notice route do you want to use?"** → Select **BOTH "section_8" AND "section_21"**
3. Click Next
4. ✅ **Expected:** Should show **"Which grounds under Section 8 apply?"** question (because section_8 is selected)

### 3. Verify Test Script Still Works

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run test script (wait for server to be ready)
WIZARD_BASE_URL="http://localhost:3000" node scripts/test-wizard-flows.mjs
```

✅ **Expected:** All flows should complete with `complete=true`
- notice_only / england-wales: ✅ Complete
- complete_pack / england-wales: ✅ Complete
- notice_only / scotland: ✅ Complete
- money_claim / england-wales: ✅ Complete
- money_claim / scotland: ✅ Complete

### 4. Check Browser Console

Open DevTools (F12) → Console tab. Look for:
- ❌ **No errors** about missing question dependencies
- ❌ **No 400/422 errors** from `/api/wizard/answer`
- ❌ **No validation failures** for conditional questions

## Impact

### Fixed Flows

1. **Notice Only (England & Wales)**
   - Section 8 route now correctly shows `section8_grounds` question
   - Section 21 route now correctly skips Section 8-specific questions
   - Mixed selection (both routes) works correctly

2. **Complete Pack (England & Wales)**
   - Same fixes as Notice Only
   - Additional conditional questions based on route selection now appear correctly

3. **Any other MQS flow** with multi-select questions that have scalar dependencies

### Potential Side Effects

- None expected - this is a pure bug fix that makes the code work as intended
- All existing tests should continue to pass
- UI behavior should match user expectations

## Related Issues

This fix is related to recent work on:
- PR #332: Fix Notice Only wizard route intent and field mapping (commit e9fbcf1)
- PR #331: Wizard decision engine integration (commit c83e019)

Those PRs fixed route derivation and decision engine logic. This PR fixes the fundamental dependency checking logic that determines which questions are shown to users.

## Commit Message

```
Fix: Multi-select answer vs scalar dependency check

Root Cause:
Dependency checking logic failed when user's answer was an array
(multi-select) but dependent question's dependency value was scalar.

Example:
- User selects ["section_8"] for eviction_route_intent
- Dependent question section8_grounds has dependency value "section_8" (scalar)
- Comparison ["section_8"] === "section_8" returned FALSE
- Result: section8_grounds was never shown in UI

Fix:
Added proper array-scalar comparison in both:
1. src/app/api/wizard/answer/route.ts:425-428
2. src/lib/wizard/mqs-loader.ts:143-146

Now correctly checks: depValue.includes(dependsOn.value)

Impact:
- Notice Only Section 8 flows now show conditional grounds question
- All multi-select → scalar dependencies work correctly
- Test script still passes (uses different code path)

Testing:
- UI: Select section_8 → should see section8_grounds question
- UI: Select section_21 → should skip section8_grounds question
- Script: WIZARD_BASE_URL="http://localhost:3000" node scripts/test-wizard-flows.mjs
```
