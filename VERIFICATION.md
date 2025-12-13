# Verification Guide: Wizard Conditional Questions Fix

This guide walks through verifying all three fixes applied to resolve the wizard conditional questions bug.

## Prerequisites

```bash
# Install dependencies (if not already done)
npm install

# Start the Next.js development server
npm run dev
# Server will start on http://localhost:5000
```

## Task A: Frontend Conditional Rendering (StructuredWizard.tsx)

### What was fixed
Field-level dependencies in group questions now correctly handle array-vs-scalar comparisons.

**File:** `src/components/wizard/StructuredWizard.tsx` (lines 841-849)

### Manual Verification

1. **Start a Notice Only wizard:**
   - Go to http://localhost:5000
   - Create a new case: Notice Only / England & Wales

2. **Test the section8_grounds question:**
   - Answer initial questions until you reach "Which notice route do you want to use?"
   - **Select "section_8"** (this stores `["section_8"]` in the database)
   - Click Continue

3. **Expected Result:**
   - The next question should be **"Which grounds under Section 8 apply?"** (question ID: `section8_grounds`)
   - This proves the conditional logic correctly matches: `["section_8"]` includes `"section_8"`

4. **Verify in DevTools:**
   - Open Browser DevTools → Network tab
   - After selecting section_8, watch for POST to `/api/wizard/next-question`
   - Response should contain:
     ```json
     {
       "next_question": {
         "id": "section8_grounds",
         "question": "Which grounds under Section 8 apply?",
         ...
       }
     }
     ```

5. **Check server logs:**
   - In the terminal where `npm run dev` is running, look for debug output:
     ```
     [DEBUG] section8_grounds dependency check: {
       questionId: 'section8_grounds',
       dependsOn: { questionId: 'eviction_route_intent', value: 'section_8' },
       depValue: ['section_8'],
       depValueType: 'array',
       dependsOnValueType: 'string'
     }
     [DEBUG] section8_grounds: MATCH! (array includes scalar)
     ```

### What would happen WITHOUT the fix
- The UI would skip `section8_grounds` entirely
- User would complete the wizard without answering grounds
- Document generation would fail with 422 missing required field "grounds"

---

## Task B: Section 21 Template Path (documents/generate/route.ts)

### What was fixed
Section 21 document generation now uses the correct template path.

**File:** `src/app/api/documents/generate/route.ts` (line 230)

**Before:** `${jurisdiction}/eviction/section21_form6a.hbs`
**After:** `uk/${jurisdiction}/templates/eviction/section21_form6a.hbs`

### Manual Verification

1. **Complete a Section 21 wizard flow:**
   - Start a Notice Only wizard
   - Select "section_21" as the route
   - Answer all required questions
   - Complete the wizard

2. **Generate Section 21 document:**
   ```bash
   # Using curl (replace <CASE_ID> with your actual case ID)
   curl -X POST http://localhost:5000/api/documents/generate \
     -H "Content-Type: application/json" \
     -d '{
       "case_id": "<CASE_ID>",
       "document_type": "section21_notice",
       "is_preview": true
     }'
   ```

   **Or using PowerShell:**
   ```powershell
   Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/documents/generate" `
     -ContentType "application/json" `
     -Body '{"case_id":"<CASE_ID>","document_type":"section21_notice","is_preview":true}'
   ```

3. **Expected Result:**
   - Should return HTTP 200 with `html` and `pdf` content
   - Should NOT show error like:
     ```
     Failed to load template england-wales/eviction/section21_form6a.hbs:
     ENOENT: no such file or directory
     ```

4. **Verify template exists:**
   ```bash
   ls -l config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs
   # Should show: -rw-r--r-- ... section21_form6a.hbs
   ```

### What would happen WITHOUT the fix
- Template loader would look in `config/jurisdictions/england-wales/eviction/section21_form6a.hbs`
- File doesn't exist at that path (it's in `uk/england-wales/templates/eviction/`)
- Would fail with ENOENT (file not found error)

---

## Task C: Regression Test (dependency-matching.test.ts)

### What was added
Comprehensive unit tests for array-vs-scalar dependency matching.

**File:** `tests/lib/wizard/dependency-matching.test.ts` (271 lines)

### Running the Tests

```bash
# Run all tests in the dependency matching test suite
npm test tests/lib/wizard/dependency-matching.test.ts

# Or run all tests
npm test
```

### Test Coverage

The test file includes 7 test cases:

1. ✅ **Core case:** `["section_8"]` satisfies dependency `"section_8"`
2. ✅ **Reverse:** `"section_8"` satisfies dependency `["section_8"]`
3. ✅ **Multiple values:** `["section_8", "section_21"]` satisfies `"section_8"`
4. ✅ **No match:** `["section_21"]` does NOT satisfy `"section_8"`
5. ✅ **Real MQS:** section8_grounds shows when eviction_route_intent = `["section_8"]`
6. ✅ **Both routes:** section8_grounds shows when both routes selected
7. ✅ **Section 21 only:** section8_grounds does NOT show for `["section_21"]`

### Expected Test Output

```
✓ tests/lib/wizard/dependency-matching.test.ts (7)
  ✓ Dependency Matching: Array vs Scalar (7)
    ✓ should match when stored answer is array ["section_8"] and dependency is scalar "section_8"
    ✓ should match when stored answer is scalar "section_8" and dependency is array ["section_8"]
    ✓ should match when array answer contains one of multiple dependency values
    ✓ should NOT match when array answer does not contain scalar dependency
    ✓ should work with real Notice Only MQS for section8_grounds
    ✓ should show section8_grounds when both section_8 and section_21 are selected
    ✓ should NOT show section8_grounds when only section_21 is selected

Test Files  1 passed (1)
     Tests  7 passed (7)
```

### What these tests prove

- **Before the fix:** Test 1 would fail because array includes check was missing
- **After the fix:** All tests pass, proving the logic handles all edge cases
- **Regression protection:** If someone accidentally breaks this logic, tests will catch it

---

## End-to-End Verification

### Complete Section 8 Flow

1. Start wizard: Notice Only / England & Wales
2. Select `eviction_route_intent = ["section_8"]`
3. Verify `section8_grounds` appears
4. Select grounds (e.g., "Ground 8 - serious rent arrears")
5. Complete wizard
6. Generate document:
   ```bash
   curl -X POST http://localhost:5000/api/documents/generate \
     -H "Content-Type: application/json" \
     -d '{
       "case_id": "<CASE_ID>",
       "document_type": "section8_notice",
       "is_preview": true
     }'
   ```
7. **Expected:** HTTP 200, PDF generated successfully

### Complete Section 21 Flow

1. Start wizard: Notice Only / England & Wales
2. Select `eviction_route_intent = ["section_21"]`
3. Complete wizard (no grounds needed for Section 21)
4. Generate document:
   ```bash
   curl -X POST http://localhost:5000/api/documents/generate \
     -H "Content-Type: application/json" \
     -d '{
       "case_id": "<CASE_ID>",
       "document_type": "section21_notice",
       "is_preview": true
     }'
   ```
5. **Expected:** HTTP 200, PDF generated successfully (no ENOENT error)

---

## Test Script Verification

The automated test script should also pass:

```bash
# Make sure dev server is running on port 5000
npm run dev

# In another terminal, run the test script
WIZARD_BASE_URL=http://localhost:5000 node scripts/test-wizard-flows.mjs
```

**Expected output:**
```
✅ Started case: <case-id>
   First question: jurisdiction

📝 Answering question #1
   ID:       jurisdiction
   ...

✅ Wizard completed after 10 questions. progress=100
```

---

## Acceptance Checklist

- [ ] UI shows `section8_grounds` immediately after selecting Section 8
- [ ] Server logs show `[DEBUG] section8_grounds: MATCH! (array includes scalar)`
- [ ] POST `/api/documents/generate` for section8_notice returns 200 (not 422 missing grounds)
- [ ] POST `/api/documents/generate` for section21_notice returns 200 (not ENOENT)
- [ ] `npm test tests/lib/wizard/dependency-matching.test.ts` passes all 7 tests
- [ ] `WIZARD_BASE_URL=http://localhost:5000 node scripts/test-wizard-flows.mjs` completes successfully

---

## Troubleshooting

### "section8_grounds not showing in UI"

1. Check browser console for JavaScript errors
2. Check Network tab → POST `/api/wizard/next-question` response
3. Check server terminal for debug logs
4. Verify `eviction_route_intent` is stored as `["section_8"]` not `"section_8"`

### "Template not found for Section 21"

1. Verify template exists:
   ```bash
   ls config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs
   ```
2. Check the exact error message - path should include `uk/england-wales/templates/`
3. If path is wrong, verify you have the latest code from this branch

### "Tests failing"

1. Ensure dependencies are installed: `npm install`
2. Check vitest version matches package.json
3. Look for TypeScript compilation errors
4. Run with verbose output: `npm test -- --reporter=verbose tests/lib/wizard/dependency-matching.test.ts`

---

## Files Modified

1. **src/components/wizard/StructuredWizard.tsx** - Field dependency fix
2. **src/app/api/documents/generate/route.ts** - Template path fix
3. **src/lib/wizard/mqs-loader.ts** - Debug logging (can be removed after verification)
4. **tests/lib/wizard/dependency-matching.test.ts** - NEW regression tests

**Total:** 3 files modified, 1 file added
