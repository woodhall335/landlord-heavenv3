# PHASE 7: TESTING PLAN & SCENARIOS
## Notice Only Smart Guidance - Comprehensive Testing Guide

**Phase:** 7 of 8
**Branch:** `claude/notice-only-smart-guidance-7pxVX`
**Status:** Testing Documentation Complete

---

## 📋 OVERVIEW

This document provides comprehensive testing guidance for the Notice Only Smart Guidance system (Phases 1-6). Since the testing environment doesn't have dependencies installed, this phase focuses on documenting test plans, scenarios, and checklists for execution by the development team.

---

## 🎯 TESTING OBJECTIVES

### Primary Goals:
1. ✅ Verify all smart guidance features work correctly (route recommendation, ground recommendation, date calculation)
2. ✅ Ensure preview generation works for both England & Wales and Scotland
3. ✅ Confirm backward compatibility (no impact on other products)
4. ✅ Validate complete user journey from wizard start to purchase
5. ✅ Test error handling and edge cases

### Success Criteria:
- All critical user paths complete successfully
- Smart guidance recommendations are accurate
- Preview shows all 4 documents correctly merged
- No regressions in existing functionality
- Mobile responsive on all devices

---

## 🧪 TEST CATEGORIES

### 1. Unit Testing (Backend)
### 2. Integration Testing (Full Flow)
### 3. Manual Testing (User Scenarios)
### 4. Performance Testing
### 5. Mobile & Browser Testing

---

## 1️⃣ UNIT TESTING (BACKEND)

### Test Suite 1: Route Recommendation Logic

**File:** `/src/app/api/wizard/answer/route.ts` (Lines 661-722)

#### Test Case 1.1: Section 21 Recommended (Clean Compliance)
```typescript
describe('Route Recommendation - Section 21', () => {
  it('should recommend Section 21 when compliance is perfect', async () => {
    const testFacts = {
      deposit_protected: 'yes',
      deposit_scheme: 'DPS',
      deposit_protection_date: '2024-01-15',
      prescribed_info_given: 'yes',
      gas_safety_cert_provided: 'yes',
      epc_provided: 'yes',
      how_to_rent_given: 'yes',
      // No arrears, no mandatory grounds
    };

    const response = await POST('/api/wizard/answer', {
      case_id: 'test-case-id',
      question_id: 'deposit_and_compliance',
      answers: testFacts,
    });

    expect(response.route_recommendation).toBeDefined();
    expect(response.route_recommendation.recommended_route).toBe('section_21');
    expect(response.route_recommendation.blocked_routes).not.toContain('section_21');
    expect(response.route_recommendation.warnings).toHaveLength(0);
  });
});
```

**Expected Result:**
- ✅ `recommended_route: 'section_21'`
- ✅ `blocked_routes: []`
- ✅ `blocking_issues: []`
- ✅ `warnings: []`
- ✅ `allowed_routes: ['section_21', 'section_8']`

---

#### Test Case 1.2: Section 21 Blocked (Missing Deposit Protection)
```typescript
it('should block Section 21 when deposit not protected', async () => {
  const testFacts = {
    deposit_amount: 1500,
    deposit_protected: 'no',  // ← BLOCKER
    gas_safety_cert_provided: 'yes',
    epc_provided: 'yes',
    how_to_rent_given: 'yes',
  };

  const response = await POST('/api/wizard/answer', {
    case_id: 'test-case-id',
    question_id: 'deposit_and_compliance',
    answers: testFacts,
  });

  expect(response.route_recommendation.recommended_route).toBe('section_8');
  expect(response.route_recommendation.blocked_routes).toContain('section_21');
  expect(response.route_recommendation.blocking_issues).toContainEqual(
    expect.objectContaining({
      issue: 'deposit_not_protected',
      severity: 'blocks_section21',
    })
  );
});
```

**Expected Result:**
- ✅ `recommended_route: 'section_8'` (fallback)
- ✅ `blocked_routes: ['section_21']`
- ✅ `blocking_issues: [{ issue: 'deposit_not_protected', severity: 'blocks_section21' }]`
- ✅ Reasoning explains why Section 21 is blocked

---

#### Test Case 1.3: Section 8 Recommended (Mandatory Ground Present)
```typescript
it('should recommend Section 8 when mandatory ground present', async () => {
  const testFacts = {
    deposit_protected: 'yes',
    total_arrears: 3000,  // ← 2+ months rent (Ground 8)
    monthly_rent: 1200,
  };

  const response = await POST('/api/wizard/answer', {
    case_id: 'test-case-id',
    question_id: 'deposit_and_compliance',
    answers: testFacts,
  });

  expect(response.route_recommendation.recommended_route).toBe('section_8');
  expect(response.route_recommendation.reasoning).toContain('mandatory ground');
});
```

**Expected Result:**
- ✅ `recommended_route: 'section_8'`
- ✅ Reasoning mentions mandatory Ground 8

---

### Test Suite 2: Ground Recommendations Logic

**File:** `/src/app/api/wizard/answer/route.ts` (Lines 724-782)

#### Test Case 2.1: Ground 8 Recommended (Serious Arrears)
```typescript
describe('Ground Recommendations', () => {
  it('should recommend Ground 8 for 2+ months arrears', async () => {
    const testFacts = {
      total_arrears: 2400,
      monthly_rent: 1000,
      arrears_at_notice_date: 2400,
      arrears_duration_months: 3,
      last_payment_date: '2024-10-01',
    };

    const response = await POST('/api/wizard/answer', {
      case_id: 'test-case-id',
      question_id: 'arrears_summary',
      answers: testFacts,
    });

    expect(response.ground_recommendations).toContainEqual(
      expect.objectContaining({
        code: 8,
        title: expect.stringContaining('Serious rent arrears'),
        type: 'mandatory',
        notice_period_days: 14,
        success_probability: 'high',
      })
    );
  });
});
```

**Expected Result:**
- ✅ Ground 8 recommended
- ✅ `type: 'mandatory'`
- ✅ `notice_period_days: 14`
- ✅ `success_probability: 'high'` or 'very_high'
- ✅ `required_evidence` includes rent ledger, bank statements

---

#### Test Case 2.2: Ground 10 Recommended (Some Arrears)
```typescript
it('should recommend Ground 10 for less than 2 months arrears', async () => {
  const testFacts = {
    total_arrears: 1500,
    monthly_rent: 1000,
    arrears_at_notice_date: 1500,
    arrears_duration_months: 2,
  };

  const response = await POST('/api/wizard/answer', {
    case_id: 'test-case-id',
    question_id: 'arrears_summary',
    answers: testFacts,
  });

  expect(response.ground_recommendations).toContainEqual(
    expect.objectContaining({
      code: 10,
      type: 'discretionary',
      notice_period_days: 14,
    })
  );
});
```

**Expected Result:**
- ✅ Ground 10 recommended
- ✅ `type: 'discretionary'`
- ✅ Lower success probability than Ground 8

---

#### Test Case 2.3: Pre-populated Section8 Grounds
```typescript
it('should pre-populate section8_grounds with recommended codes', async () => {
  const testFacts = {
    total_arrears: 3000,
    monthly_rent: 1000,
  };

  const response = await POST('/api/wizard/answer', {
    case_id: 'test-case-id',
    question_id: 'arrears_summary',
    answers: testFacts,
  });

  // Check that wizard facts were updated
  const caseData = await getCaseById('test-case-id');
  expect(caseData.wizard_facts.section8_grounds).toContain(8);
});
```

**Expected Result:**
- ✅ `section8_grounds: [8]` pre-populated in wizard facts
- ✅ User can still override the selection

---

### Test Suite 3: Date Auto-Calculation Logic

**File:** `/src/app/api/wizard/answer/route.ts` (Lines 784-866)

#### Test Case 3.1: Section 8 Ground 8 Date Calculation (14 Days)
```typescript
describe('Date Auto-Calculation', () => {
  it('should calculate 14-day notice period for Ground 8', async () => {
    const testFacts = {
      notice_service_date: '2025-01-15',
      selected_notice_route: 'section_8',
      section8_grounds: [8],
    };

    const response = await POST('/api/wizard/answer', {
      case_id: 'test-case-id',
      question_id: 'notice_service',
      answers: testFacts,
    });

    expect(response.calculated_date).toMatchObject({
      date: '2025-01-29',  // 14 days from service
      notice_period_days: 14,
      legal_basis: 'Housing Act 1988',
    });
  });
});
```

**Expected Result:**
- ✅ `date: '2025-01-29'` (14 days from 2025-01-15)
- ✅ `notice_period_days: 14`
- ✅ `explanation` describes Ground 8 requirement

---

#### Test Case 3.2: Section 8 Ground 10 Date Calculation (2 Months)
```typescript
it('should calculate 2-month notice period for Ground 10', async () => {
  const testFacts = {
    notice_service_date: '2025-01-15',
    selected_notice_route: 'section_8',
    section8_grounds: [10],
  };

  const response = await POST('/api/wizard/answer', {
    case_id: 'test-case-id',
    question_id: 'notice_service',
    answers: testFacts,
  });

  expect(response.calculated_date.notice_period_days).toBe(56);  // 2 months
});
```

**Expected Result:**
- ✅ `notice_period_days: 56` (or calculated 2 months from service date)
- ✅ Date respects 2-month minimum

---

#### Test Case 3.3: Section 21 Date Calculation (2 Months + End of Tenancy Period)
```typescript
it('should calculate Section 21 expiry on end of tenancy period', async () => {
  const testFacts = {
    notice_service_date: '2025-01-15',
    selected_notice_route: 'section_21',
    tenancy_start_date: '2024-01-01',  // Started on 1st of month
    rent_payment_frequency: 'monthly',
  };

  const response = await POST('/api/wizard/answer', {
    case_id: 'test-case-id',
    question_id: 'notice_service',
    answers: testFacts,
  });

  // Should be end of month, at least 2 months away
  expect(response.calculated_date.date).toMatch(/2025-03-31/);
});
```

**Expected Result:**
- ✅ Date is at least 2 months from service
- ✅ Date is end of tenancy period (last day of month)
- ✅ Warnings if less than 2 months

---

## 2️⃣ INTEGRATION TESTING (FULL FLOW)

### Test Suite 4: Complete England & Wales Notice Only Wizard

#### Test Case 4.1: Clean Section 21 Flow (No Compliance Issues)
```
Test Steps:
1. Start wizard: /wizard/flow?type=eviction&jurisdiction=england-wales&product=notice_only
2. Enter property details (address, landlord, tenant)
3. Enter tenancy details (AST, started 2024-01-01, monthly rent £1200)
4. Enter deposit & compliance:
   - Deposit: £1500, protected in DPS on 2024-01-15
   - Prescribed info: Yes
   - Gas cert: Yes
   - EPC: Yes
   - How to Rent: Yes
5. Submit deposit_and_compliance question
6. Verify smart guidance panel appears:
   - Blue panel with route recommendation
   - "We recommend: Section 21 (No-Fault)"
   - Reasoning mentions clean compliance
7. Continue wizard to notice_service
8. Enter service date: 2025-01-15
9. Verify date calculation panel appears:
   - Purple panel with calculated expiry date
   - Date: 2025-03-31 (end of month, 2+ months away)
10. Complete wizard
11. Verify redirect to /wizard/preview/[caseId]
12. Verify preview page shows:
    - "Complete Pack Preview" purple notice
    - Merged PDF with all 4 documents
    - Pricing: "Notice Only Pack - £29.99"
    - Features list all 4 documents
13. Click "Buy Notice Only Pack"
14. Verify Stripe checkout opens

Expected Results:
✅ Route recommendation: Section 21
✅ No blocking issues
✅ Date calculated correctly (end of month, 2+ months)
✅ Preview shows merged PDF
✅ All 4 documents visible in preview
✅ Purchase flow works
```

---

#### Test Case 4.2: Section 8 Flow with Arrears (Ground 8)
```
Test Steps:
1. Start wizard (same as 4.1)
2. Enter deposit & compliance:
   - Deposit: £1500, protected in DPS
   - BUT: No gas safety cert ← blocks Section 21
3. Verify route recommendation:
   - "We recommend: Section 8 (Fault-Based)"
   - Blocking issues: "Missing gas safety certificate"
4. Select Section 8 grounds: Ground 8 (serious arrears)
5. Enter arrears_summary:
   - Total arrears: £3000
   - Monthly rent: £1200
   - Duration: 3 months
6. Verify ground recommendations panel:
   - Green panel appears
   - Ground 8 recommended
   - Success probability: High
   - Required evidence listed
7. Verify section8_grounds pre-populated with [8]
8. Continue to notice_service
9. Verify date calculation:
   - 14-day notice period (Ground 8 mandatory)
   - Expiry date = service + 14 days
10. Complete wizard → preview
11. Verify preview shows Section 8 notice + 3 guides

Expected Results:
✅ Section 21 blocked (gas cert missing)
✅ Section 8 recommended
✅ Ground 8 recommended in green panel
✅ Grounds pre-populated
✅ 14-day notice period calculated
✅ Preview shows Section 8 pack
```

---

### Test Suite 5: Complete Scotland Notice Only Wizard

#### Test Case 5.1: Scotland Ground 1 Flow (Rent Arrears with PAR)
```
Test Steps:
1. Start wizard: /wizard/flow?type=eviction&jurisdiction=scotland&product=notice_only
2. Enter property details (Scotland address)
3. Enter tenancy details (PRT, started 2024-01-01)
4. Enter rent arrears:
   - Has arrears: Yes
   - Total arrears: £3600 (3+ months)
5. Verify help text mentions Ground 1 and PAR
6. Enter pre-action contact: Yes (completed PAR)
7. Select Ground 1 in eviction_grounds
8. Verify smart guidance:
   - Notice period: 28 days (Ground 1)
   - Evidence requirements
   - PAR compliance check
9. Enter notice_service date
10. Verify date calculation:
    - 28-day notice period
    - Expiry = service + 28 days
11. Complete wizard → preview
12. Verify preview shows:
    - Purple "Complete Pack Preview" notice
    - Merged PDF with 4 documents:
      1. Notice to Leave
      2. Service Instructions
      3. Pre-Action Checklist
      4. Tribunal Guide
13. Verify pricing features mention:
    - "Pre-Action Checklist - Mandatory PAR for Ground 1"
    - "FREE tribunal vs England £355"

Expected Results:
✅ Ground 1 detected
✅ 28-day notice period calculated
✅ PAR requirements shown
✅ Preview includes Pre-Action Checklist
✅ Tribunal Guide mentions FREE tribunal
```

---

### Test Suite 6: Preview Generation & Display

#### Test Case 6.1: England & Wales Preview Contains All 4 Documents
```
Test Steps:
1. Complete Notice Only wizard (E&W, Section 8)
2. Navigate to preview page
3. Download preview PDF
4. Open PDF and verify contents:

Expected Document Order:
1. Table of Contents page (listing all 4 documents)
2. Section 8 Notice (Form 3) - watermarked
3. Service Instructions - watermarked
4. Compliance Checklist - watermarked
5. Next Steps Guide - watermarked

Verify Watermarks:
- Diagonal watermark on every page: "PREVIEW - Complete Purchase to Download"
- Footer watermark: "PREVIEW ONLY"
- Page numbers: "Page X of Y"

Verify Content:
- Section 8 Notice: Lists grounds, tenant details, expiry date
- Service Instructions: Hand delivery, first class, recorded delivery methods
- Compliance Checklist: Deposit, gas, EPC, How to Rent sections with status
- Next Steps Guide: Court process timeline, N5/N5B forms, bailiff info
```

**Expected Results:**
- ✅ All 4 documents present
- ✅ Correct order with TOC
- ✅ All pages watermarked
- ✅ Content accurate and specific to case

---

#### Test Case 6.2: Scotland Preview Contains All 4 Documents
```
Test Steps:
1. Complete Notice Only wizard (Scotland, Ground 1)
2. Navigate to preview page
3. Download preview PDF
4. Verify contents:

Expected Document Order:
1. Table of Contents
2. Notice to Leave (PRT) - watermarked
3. Service Instructions - watermarked
4. Pre-Action Checklist - watermarked
5. Tribunal Guide - watermarked

Verify Scotland-Specific Content:
- Service Instructions: Mentions "no first class post in Scotland"
- Pre-Action Checklist: Covers mandatory PAR for Ground 1
- Tribunal Guide: Mentions "FREE tribunal" vs England £355
```

**Expected Results:**
- ✅ All 4 documents present
- ✅ Scotland-specific content correct
- ✅ PAR requirements detailed
- ✅ Tribunal vs court distinction clear

---

## 3️⃣ MANUAL TESTING SCENARIOS

### Scenario 1: Mobile Responsive - iPhone 13 (375x812)
```
Device: iPhone 13 / iOS Safari
Viewport: 375x812px

Test:
1. Complete wizard on mobile
2. View smart guidance panels:
   - Route recommendation panel
   - Ground recommendations panel
   - Date calculation panel
3. Navigate to preview page
4. View preview PDF in iframe
5. View pricing options
6. Click purchase button

Check:
✅ Panels stack vertically (not side-by-side)
✅ Text readable without zooming
✅ PDF viewer works in mobile Safari
✅ Pricing cards stack nicely
✅ Purchase button accessible
✅ No horizontal scrolling
```

---

### Scenario 2: Tablet Responsive - iPad Pro (1024x1366)
```
Device: iPad Pro / Safari
Viewport: 1024x1366px

Test:
1. Complete wizard
2. View preview page (should show 2-column layout)

Check:
✅ Preview PDF on left, pricing on right
✅ Both columns visible simultaneously
✅ No awkward empty space
✅ Touch targets large enough for finger tap
```

---

### Scenario 3: Desktop - Chrome (1920x1080)
```
Device: Desktop / Chrome
Viewport: 1920x1080px

Test:
1. Complete full wizard flow
2. View all smart guidance panels
3. View preview page

Check:
✅ 2-column layout works perfectly
✅ PDF preview large and readable
✅ Pricing options clearly visible
✅ All content fits without scrolling (vertical scroll ok)
```

---

### Scenario 4: Backward Compatibility - Complete Pack Wizard
```
Product: Complete Eviction Pack (NOT Notice Only)

Test:
1. Start wizard with product=complete_pack
2. Complete wizard normally
3. Navigate to preview page

Verify:
✅ NO "Complete Pack Preview" purple notice (Notice Only only)
✅ Uses existing preview flow (NOT merged PDF)
✅ Pricing shows Complete Pack (£149.99)
✅ Features list different from Notice Only
✅ No regressions in existing flow
```

---

### Scenario 5: Error Handling - Missing Fields
```
Test:
1. Start Notice Only wizard
2. Skip required questions (if possible)
3. Try to navigate to preview page directly

Expected:
✅ Error message: "Missing required information"
✅ User redirected back to wizard
✅ Clear indication of which fields are missing
✅ No crashes or blank screens
```

---

### Scenario 6: Edge Case - Zero Deposit
```
Test:
1. Start Notice Only wizard
2. Enter deposit_amount: £0
3. Answer deposit_protected: Not applicable

Expected:
✅ No deposit-related blocking issues
✅ Section 21 still possible (if other compliance met)
✅ Compliance Checklist shows "No deposit taken"
✅ Preview generates correctly
```

---

### Scenario 7: Edge Case - Very Long Arrears
```
Test:
1. Enter total_arrears: £50,000
2. Enter monthly_rent: £1,000
3. Enter arrears_duration_months: 50

Expected:
✅ Ground 8 recommended (mandatory)
✅ Success probability: Very High
✅ No errors or crashes
✅ Preview generates correctly
```

---

## 4️⃣ PERFORMANCE TESTING

### Test Case 7.1: Preview Generation Time
```
Test:
1. Complete Notice Only wizard
2. Click to view preview
3. Measure time from click to PDF displayed

Acceptance Criteria:
✅ Preview generates in < 10 seconds
✅ Loading indicator shown during generation
✅ No timeout errors

Measure:
- API call time: /api/notice-only/preview/[caseId]
- PDF merge time (4 documents → 1 PDF)
- Blob URL creation time
- Total user-perceived time
```

**Target Performance:**
- API response: < 5 seconds
- Total preview load: < 10 seconds
- PDF file size: < 5MB

---

### Test Case 7.2: Concurrent Users
```
Test:
Simulate 10 concurrent users completing Notice Only wizard

Check:
✅ All 10 previews generate successfully
✅ No database deadlocks
✅ No memory leaks
✅ Response times stay < 10 seconds for all users
```

---

### Test Case 7.3: Large PDF Handling
```
Test:
Generate preview with:
- Long arrears history (50 months)
- Many grounds selected (5+)
- Extensive narrative text

Check:
✅ PDF generates successfully
✅ File size reasonable (< 10MB)
✅ All pages rendered correctly
✅ Watermarks on all pages (even 50+ page PDF)
```

---

## 5️⃣ BROWSER & DEVICE TESTING

### Browser Matrix:

| Browser | Version | OS | Priority |
|---------|---------|----|----|
| Chrome | Latest | Windows | High |
| Safari | Latest | macOS | High |
| Safari | Latest | iOS 16+ | High |
| Firefox | Latest | Windows | Medium |
| Edge | Latest | Windows | Medium |
| Chrome | Latest | Android | Medium |

### Device Matrix:

| Device | Viewport | Test Focus |
|--------|----------|------------|
| iPhone 13 | 375x812 | Mobile wizard, preview PDF |
| iPhone SE | 375x667 | Smallest mobile |
| iPad Pro | 1024x1366 | Tablet layout |
| Desktop | 1920x1080 | Full desktop |
| Desktop | 1366x768 | Small desktop |

---

## 📊 TEST TRACKING

### Critical Path Tests (Must Pass):

| Test ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| CP-1 | E&W Section 21 clean flow | Critical | ⏳ Pending |
| CP-2 | E&W Section 8 with arrears | Critical | ⏳ Pending |
| CP-3 | Scotland Ground 1 with PAR | Critical | ⏳ Pending |
| CP-4 | Preview shows all 4 documents | Critical | ⏳ Pending |
| CP-5 | Purchase flow completes | Critical | ⏳ Pending |
| CP-6 | Complete Pack unaffected | Critical | ⏳ Pending |

### Smart Guidance Tests:

| Test ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| SG-1 | Route recommendation appears | High | ⏳ Pending |
| SG-2 | Ground recommendations appear | High | ⏳ Pending |
| SG-3 | Date calculation appears | High | ⏳ Pending |
| SG-4 | Grounds pre-populated | Medium | ⏳ Pending |
| SG-5 | Blocking issues shown | High | ⏳ Pending |

### Preview Tests:

| Test ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| PV-1 | Merged PDF generates | Critical | ⏳ Pending |
| PV-2 | All 4 docs in correct order | Critical | ⏳ Pending |
| PV-3 | Watermarks on all pages | High | ⏳ Pending |
| PV-4 | TOC generated correctly | Medium | ⏳ Pending |
| PV-5 | PDF < 5MB file size | Medium | ⏳ Pending |

---

## 🐛 BUG REPORTING TEMPLATE

```markdown
## Bug Report: [Short Description]

**Test Case:** [e.g., CP-1: E&W Section 21 clean flow]
**Severity:** [Critical / High / Medium / Low]
**Priority:** [P0 / P1 / P2 / P3]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Screenshots/Videos:**
[Attach evidence]

**Environment:**
- Browser:
- OS:
- Viewport:
- Branch: claude/notice-only-smart-guidance-7pxVX

**Additional Context:**

```

---

## ✅ TESTING SIGN-OFF CRITERIA

Before proceeding to Phase 8 (Deploy), ALL of the following must be verified:

### Functional Requirements:
- [ ] All Critical Path tests pass (CP-1 through CP-6)
- [ ] All Smart Guidance tests pass (SG-1 through SG-5)
- [ ] All Preview tests pass (PV-1 through PV-5)
- [ ] Mobile responsive verified on 3+ devices
- [ ] Desktop responsive verified on 2+ browsers

### Performance Requirements:
- [ ] Preview generation < 10 seconds
- [ ] PDF file size < 5MB
- [ ] No memory leaks detected
- [ ] Concurrent users handled successfully

### Compatibility Requirements:
- [ ] Chrome, Safari, Firefox tested
- [ ] iOS and Android tested
- [ ] Backward compatibility verified (Complete Pack, Money Claim)
- [ ] No regressions in existing features

### User Experience:
- [ ] Smart guidance panels clear and helpful
- [ ] Preview value proposition compelling
- [ ] Purchase flow smooth and intuitive
- [ ] Error messages clear and actionable

---

## 📝 TEST EXECUTION LOG

### Test Session Template:

```markdown
## Test Session: [Date] - [Tester Name]

**Environment:**
- Branch: claude/notice-only-smart-guidance-7pxVX
- Deployment: [Staging / Local]
- Browser: [Chrome 120 / Safari 17 / etc.]

**Tests Executed:**
1. ✅ CP-1: E&W Section 21 clean flow - PASS
2. ✅ CP-2: E&W Section 8 with arrears - PASS
3. ❌ CP-3: Scotland Ground 1 - FAIL (Bug #123: PAR checklist not showing)
4. ⏳ CP-4: Preview generation - BLOCKED (waiting for bug fix)

**Bugs Found:**
- Bug #123: PAR checklist not showing for Ground 1

**Notes:**
- Performance excellent (<5s preview generation)
- Mobile responsive works great on iPhone 13
- Need to retest CP-3 after bug fix

**Next Steps:**
- Wait for bug fix
- Retest CP-3
- Continue with SG tests
```

---

## 🎯 SUCCESS METRICS

### Quantitative Metrics (Post-Deploy):

| Metric | Baseline (Before) | Target (After) | Measurement Method |
|--------|-------------------|----------------|-------------------|
| Wizard Completion Rate | 70% | 85% | Analytics: wizard_completed / wizard_started |
| Preview View Rate | N/A | 95% | Analytics: preview_viewed / wizard_completed |
| Purchase Conversion | 40% | 57.5% | Analytics: purchased / preview_viewed |
| Support Tickets (Pre-purchase) | 33/100 | 20/100 | Support ticket count |
| Preview Load Time | N/A | <10s | Performance monitoring |

### Qualitative Metrics:

- User feedback on smart guidance helpfulness
- User feedback on preview clarity
- Support team feedback on ticket reduction
- Sales team feedback on conversion improvement

---

## 📚 TESTING RESOURCES

### Documentation:
- [Phases 1-6 Completion Reports] - Implementation details
- [MQS Files] - Question flow and help text
- [API Documentation] - Endpoint specifications
- [Smart Guidance Logic] - Decision engine rules

### Tools:
- Browser DevTools - Performance, network, console
- Lighthouse - Performance, accessibility, best practices
- BrowserStack - Cross-browser testing
- Postman - API testing
- Jest - Unit testing (if implemented)

### Test Data:
- Test tenancy scenarios (various compliance states)
- Test arrears scenarios (Ground 8, 10, 11)
- Test Scotland PRT scenarios (Ground 1, 3, 12)
- Edge cases (zero deposit, huge arrears, etc.)

---

**End of Phase 7 Testing Plan**

*This document should be used by the development/QA team to systematically test all Notice Only Smart Guidance features before production deployment.*

*Generated: December 14, 2025*
*Branch: claude/notice-only-smart-guidance-7pxVX*
