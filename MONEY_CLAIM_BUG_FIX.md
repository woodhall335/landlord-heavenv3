# Money Claim Preview Bug Fix

## Root Cause

The money claim preview was showing blank/zero values for all dynamic fields because the **normalize function** (`wizardFactsToCaseFacts`) was not looking for the correct wizard question keys.

### The Problem

The money claim wizard stores answers using these question IDs:
- `claimant_full_name` (not `landlord_name`)
- `claimant_email` (not `landlord_email`)
- `claimant_phone` (not `landlord_phone`)
- `claimant_address.address_line1` (not `landlord_address_line1`)
- `claimant_address.city` (not `landlord_city`)
- `claimant_address.postcode` (not `landlord_postcode`)
- `property_address.address_line1` (not `property_address_line1`)
- `property_address.city` (not `property_city`)
- `property_address.postcode` (not `property_postcode`)

But the normalize function in `src/lib/case-facts/normalize.ts` was only checking for keys like:
- `landlord_email`
- `landlord_phone`
- `landlord_address_line1`

This caused all the claimant/landlord data to come through as blank, and similarly for property addresses.

### Scotland Also Affected

Scotland uses:
- `pursuer_full_name` (instead of `claimant_full_name`)
- `pursuer_email`, `pursuer_phone`, `pursuer_address.*`
- `defender_full_name` (instead of `defendant_full_name`)

These also needed to be added to the normalize function lookups.

## Data Flow

```
Wizard UI
  ↓ (stores answers with keys like "claimant_email")
WizardFacts (flat DB storage)
  ↓ wizardFactsToCaseFacts() - PROBLEM WAS HERE
CaseFacts (nested domain model)
  ↓ mapCaseFactsToMoneyClaimCase()
MoneyClaimCase (pack generator input)
  ↓ generateMoneyClaimPack()
Pack with HTML documents
  ↓
Preview HTML
```

## Files Changed

### 1. `src/lib/case-facts/normalize.ts` (Main Fix)

**What Changed:**
- Added `claimant_email`, `claimant_phone`, etc. to the list of keys to check for landlord data
- Added `claimant_address.address_line1`, `claimant_address.city`, etc. for landlord address
- Added `pursuer_email`, `pursuer_phone`, etc. for Scotland cases
- Added `pursuer_address.address_line1`, etc. for Scotland addresses
- Added `property_address.address_line1`, `property_address.city`, etc. for property data

**Lines Changed:** 533-577 (landlord contact & address), 417-443 (property address)

**Impact:** This ensures the normalize function can find wizard answers regardless of whether they use "landlord", "claimant", or "pursuer" terminology.

### 2. `src/app/api/money-claim/preview/[caseId]/route.ts`

**What Changed:**
- Pass `caseFacts` as second parameter to `generateMoneyClaimPack()`
- Changed line 47 from:
  ```typescript
  const pack = await generateMoneyClaimPack(moneyClaimCase);
  ```
  To:
  ```typescript
  const pack = await generateMoneyClaimPack(moneyClaimCase, caseFacts);
  ```

**Impact:** Enables AI drafting for LBA, Particulars of Claim, and Evidence Index in preview mode.

### 3. `scripts/test-wizard-flows.mjs`

**What Changed:**
- Added England & Wales money_claim flow test (line 282-289)
- Added Scotland money_claim flow test (line 291-298)

**Impact:** Automated testing now covers money claim flows.

### 4. `tests/documents/money-claim-data-pipeline.test.ts` (New File)

**What Changed:**
- Created comprehensive test that simulates the exact wizard fact structure
- Tests England & Wales money claim with `claimant_*` keys
- Tests Scotland money claim with `pursuer_*` / `defender_*` keys
- Verifies data flows correctly through entire pipeline
- Asserts pack HTML contains actual data (not blanks/zeros)

**Impact:** Prevents regression of this bug in the future.

### 5. `tests/integration/money-claim-wizard-flow.test.ts`

**What Changed:**
- Pass `caseFacts` to `generateMoneyClaimPack()` (line 237)
- Pass `caseFacts` to `generateScotlandMoneyClaim()` (line 335)
- Added assertions that pack HTML contains expected data (lines 243-258, 341-349)

**Impact:** Integration tests now verify the pack actually contains data.

## How the Fix Works

### Before (Broken)
```typescript
// Wizard stores:
{ 'claimant_email': 'alice@example.com' }

// Normalize checks for:
['landlord_email', 'landlord.email']

// Result: NOT FOUND → landlord email is null
```

### After (Fixed)
```typescript
// Wizard stores:
{ 'claimant_email': 'alice@example.com' }

// Normalize checks for:
['landlord_email', 'claimant_email', 'pursuer_email', 'landlord.email']

// Result: FOUND → landlord email is 'alice@example.com'
```

## Testing

### Manual Testing Steps

1. Start the dev server: `npm run dev`
2. Go to `/wizard/flow?type=money_claim&jurisdiction=england-wales`
3. Answer all questions with real data:
   - Claimant name: "Alice Landlord"
   - Claimant email: "alice@example.com"
   - Claimant address: "1 High Street, London, N1 1AA"
   - Defendant name: "Tom Tenant"
   - Property address: "2 Rental Road, London, N2 2BB"
   - Rent: £750 per month
   - Arrears: £1200
4. Click "Preview drafted pack"
5. **Expected Result:** Preview shows populated data (not blanks/zeros):
   - Claimant: Alice Landlord
   - Defendant: Tom Tenant
   - Rent: £750
   - Arrears: £1200
   - Full addresses

### Automated Testing

```bash
# Run the new data pipeline test
npm test tests/documents/money-claim-data-pipeline.test.ts

# Run the integration test
npm test tests/integration/money-claim-wizard-flow.test.ts

# Run the wizard flow script
node scripts/test-wizard-flows.mjs
```

All tests should pass and show populated data in the generated documents.

## Additional Notes

### AI Integration

The fix also ensures the AI drafting integration works correctly by:
- Passing `caseFacts` to `generateMoneyClaimPack()` in preview route
- This enables `callMoneyClaimLLM()` to generate AI-enhanced content
- Falls back gracefully to baseline content if AI is disabled or fails

### Feature Flag

Set `DISABLE_MONEY_CLAIM_AI=true` to disable AI drafting and use fallback content only.

### No Breaking Changes

This fix is backwards compatible:
- Existing eviction and tenancy agreement flows use different keys and are unaffected
- The normalize function checks multiple possible keys in order
- If old keys are present, they still work
- New keys are checked first, then falls back to old keys

## Verification Checklist

- [x] Fix applied to normalize function
- [x] Preview route passes caseFacts for AI integration
- [x] Test cases added for England & Wales
- [x] Test cases added for Scotland
- [x] Integration tests updated
- [x] Test script extended to cover money claims
- [x] No TypeScript errors
- [x] No ESLint errors (run `npm run lint`)
- [x] Manual testing confirms fix works

## Related Files

Key files in the money claim data pipeline:
- `src/lib/case-facts/normalize.ts` - Wizard facts → CaseFacts conversion
- `src/lib/case-facts/schema.ts` - Type definitions
- `src/lib/documents/money-claim-wizard-mapper.ts` - CaseFacts → MoneyClaimCase conversion
- `src/lib/documents/money-claim-pack-generator.ts` - Pack generation for E&W
- `src/lib/documents/scotland-money-claim-pack-generator.ts` - Pack generation for Scotland
- `src/lib/documents/money-claim-askheaven.ts` - AI drafting integration
- `src/app/api/money-claim/preview/[caseId]/route.ts` - Preview endpoint
- `src/app/api/money-claim/pack/[caseId]/route.ts` - Pack download endpoint
