# Northern Ireland Money Claim Blocking - December 3, 2025

**Status:** ✅ Complete
**Scope:** Wizard start API error messaging for NI evictions and money claims
**Reference:** V1_COMPLETION_CHECKLIST.md Section 8.1 + 8.2

---

## Summary

Updated `/api/wizard/start` route to explicitly block Northern Ireland money claim workflows alongside evictions, with clear error messaging.

---

## Changes Made

### 1. Error Message Update

**File:** `src/app/api/wizard/start/route.ts` (lines 139-159)

**Before:**
```typescript
error: 'Northern Ireland eviction workflows are not yet supported.',
message:
  'We currently support tenancy agreements for Northern Ireland, plus evictions for England & Wales and Scotland. ' +
  'For NI eviction assistance, please consult a local NI solicitor. Expected availability: Q2 2026.',
```

**After:**
```typescript
error: 'Northern Ireland eviction and money claim workflows are not yet supported.',
message:
  'We currently support tenancy agreements for Northern Ireland. ' +
  'For England & Wales and Scotland, we support evictions (notices and court packs) and money claims. ' +
  'Northern Ireland eviction and money claim support is planned for Q2 2026. ' +
  'For immediate NI legal assistance, please consult a local solicitor.',
```

**Key Improvements:**
- ✅ Error explicitly mentions **both evictions AND money claims**
- ✅ Message clarifies E&W and Scotland support both evictions and money claims
- ✅ Clearer roadmap timeline (Q2 2026)
- ✅ Better user guidance for immediate needs

---

### 2. Support Matrix Update

**Before:**
```typescript
supported: {
  ni: ['tenancy_agreement'],
  'england-wales': ['notice_only', 'complete_pack', 'money_claim'],
  scotland: ['notice_only', 'complete_pack', 'money_claim'],
}
```

**After:**
```typescript
supported: {
  'northern-ireland': ['tenancy_agreement'],
  'england-wales': ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
}
```

**Key Improvements:**
- ✅ Consistent key naming: `'northern-ireland'` (not `ni`)
- ✅ **Complete product lists:** E&W and Scotland now show all 4 supported products including `tenancy_agreement`
- ✅ Crystal clear that NI only supports tenancy agreements

---

### 3. Code Comment Update

**Before:**
```typescript
// Northern Ireland gating: only tenancy agreements are supported
// See docs/NI_EVICTION_STATUS.md for full details
```

**After:**
```typescript
// Northern Ireland gating: only tenancy agreements are supported
// Evictions and money claims are blocked until legal review complete
// See docs/NI_EVICTION_STATUS.md for full details
```

**Improvement:**
- ✅ Clarifies that both evictions AND money claims are blocked
- ✅ Explains reason: pending legal review

---

## Blocking Logic

The blocking check at line 142:
```typescript
if (effectiveJurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement') {
  // Return error with updated message
}
```

**How it works:**
1. ✅ If jurisdiction is `northern-ireland` AND case type is `eviction` → **Blocked**
2. ✅ If jurisdiction is `northern-ireland` AND case type is `money_claim` → **Blocked**
3. ✅ If jurisdiction is `northern-ireland` AND case type is `tenancy_agreement` → **Allowed**

---

## Testing Scenarios

### ✅ Scenario 1: NI Tenancy Agreement (Should Allow)
```json
POST /api/wizard/start
{
  "product": "tenancy_agreement",
  "jurisdiction": "northern-ireland"
}
```
**Expected:** ✅ Success - case created, first MQS question returned

### ❌ Scenario 2: NI Eviction (Should Block)
```json
POST /api/wizard/start
{
  "product": "notice_only",
  "jurisdiction": "northern-ireland"
}
```
**Expected:** ❌ 400 Error with message:
```json
{
  "error": "Northern Ireland eviction and money claim workflows are not yet supported.",
  "message": "We currently support tenancy agreements for Northern Ireland. For England & Wales and Scotland, we support evictions (notices and court packs) and money claims. Northern Ireland eviction and money claim support is planned for Q2 2026. For immediate NI legal assistance, please consult a local solicitor.",
  "supported": {
    "northern-ireland": ["tenancy_agreement"],
    "england-wales": ["notice_only", "complete_pack", "money_claim", "tenancy_agreement"],
    "scotland": ["notice_only", "complete_pack", "money_claim", "tenancy_agreement"]
  }
}
```

### ❌ Scenario 3: NI Money Claim (Should Block)
```json
POST /api/wizard/start
{
  "product": "money_claim",
  "jurisdiction": "northern-ireland"
}
```
**Expected:** ❌ 400 Error with same message as Scenario 2

### ✅ Scenario 4: E&W Money Claim (Should Allow)
```json
POST /api/wizard/start
{
  "product": "money_claim",
  "jurisdiction": "england-wales"
}
```
**Expected:** ✅ Success - case created, first MQS question returned

### ✅ Scenario 5: Scotland Money Claim (Should Allow)
```json
POST /api/wizard/start
{
  "product": "money_claim",
  "jurisdiction": "scotland"
}
```
**Expected:** ✅ Success - case created, first MQS question returned

---

## Manual Testing Commands

**Test NI blocking:**
```bash
# Should FAIL with new error message
curl -X POST http://localhost:5000/api/wizard/start \
  -H "Content-Type: application/json" \
  -d '{"product":"money_claim","jurisdiction":"northern-ireland"}'

# Should FAIL with new error message
curl -X POST http://localhost:5000/api/wizard/start \
  -H "Content-Type: application/json" \
  -d '{"product":"notice_only","jurisdiction":"northern-ireland"}'

# Should SUCCEED
curl -X POST http://localhost:5000/api/wizard/start \
  -H "Content-Type: application/json" \
  -d '{"product":"tenancy_agreement","jurisdiction":"northern-ireland"}'
```

**Test E&W money claims still work:**
```bash
# Should SUCCEED
curl -X POST http://localhost:5000/api/wizard/start \
  -H "Content-Type: application/json" \
  -d '{"product":"money_claim","jurisdiction":"england-wales"}'
```

---

## V1_COMPLETION_CHECKLIST.md Updates

**Section 8.1 - NI Evictions:**
- [x] NI evictions blocked in `/api/wizard/start`
- [x] Update wording to make roadmap explicit

**Section 8.2 - NI Money Claims:**
- [x] Clarify that NI money claim workflows are also blocked
- [x] Update error text to explicitly mention both evictions and money claims
- [x] Ensure supported matrix shows NI only has `['tenancy_agreement']`

**Status:** ✅ COMPLETE

---

## User Experience Impact

**Before:**
- User tries NI money claim → Gets confusing error about "evictions not supported"
- Support matrix incomplete (didn't show tenancy_agreement for E&W/Scotland)

**After:**
- User tries NI money claim → Gets clear error: "eviction and money claim workflows are not yet supported"
- Support matrix complete: Shows exactly what each jurisdiction supports
- Clear roadmap: Q2 2026
- Clear guidance: Consult local solicitor for immediate needs

---

## Future Work

When NI money claims are implemented (Q2 2026):
1. Remove or update the blocking check on line 142
2. Add NI money claim MQS file
3. Update supported matrix to include `'money_claim'` for NI
4. Update error message or remove entirely if both products supported

---

**Implementation Date:** December 3, 2025
**Implemented By:** Claude Code
**Related Issues:** V1_COMPLETION_CHECKLIST.md Section 8.1 + 8.2
**Testing Required:** Manual API testing (commands provided above)
