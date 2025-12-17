# Part C: Verification Workflow

This guide walks you through verifying all Notice Only PDF fixes are working correctly.

## Prerequisites

Ensure you have valid Supabase credentials configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Step 1: Clean Slate

Remove old PDFs generated before fixes:

```bash
rm -rf artifacts/notice_only
```

**Expected**: Directory deleted

---

## Step 2: Regenerate PDFs

Run the E2E test to generate fresh PDFs with all fixes applied:

```bash
npx tsx scripts/prove-notice-only-e2e.ts
```

**Expected Output**:
```
✅ PASS | england    | section_8            | Case: <uuid>
✅ PASS | england    | section_21           | Case: <uuid>
✅ PASS | wales      | wales_section_173    | Case: <uuid>
✅ PASS | wales      | wales_fault_based    | Case: <uuid>
✅ PASS | scotland   | notice_to_leave      | Case: <uuid>

📊 Results: 5/5 routes passed
```

**If this fails**: Check Supabase credentials and network connectivity

---

## Step 3: Run Audit

Verify all critical issues are resolved:

```bash
npx tsx scripts/audit-notice-only-pdfs.ts
```

**Expected Output**:
```
╔═══════════════════════════════════════════════════════════════╗
║                    SUMMARY                                    ║
╚═══════════════════════════════════════════════════════════════╝

Total PDFs:        5
Total Issues:      0-2  ← Should be 0 or very low
  Critical:        0    ← MUST BE 0
  Warnings:        0-1  ← Ground 8 warning acceptable in test mode

✅ ALL CHECKS PASSED
```

**View detailed report**:
```bash
cat artifacts/notice_only/_reports/pdf-audit.md
```

---

## Step 4: Verify Each Fix

### ✅ England Section 21 (Was 7 critical → Should be 0)

**Check 1: First Anniversary Date**
```bash
grep -A 2 "first anniversary is:" artifacts/notice_only/_reports/pdf-audit.md
```
**Expected**: Should show actual date like "01/06/2021" (NOT `****`)

**Check 2: Property Fields**
```bash
grep "Property: ," artifacts/notice_only/_reports/pdf-audit.md
```
**Expected**: No matches (empty property fields should be gone)

**Check 3: Service Instructions**
```bash
grep "Section 8 or Section 21" artifacts/notice_only/_reports/pdf-audit.md
```
**Expected**: No matches (should show "Section 21" only)

---

### ✅ England Section 8 (Was 5 critical → Should be 0)

**Check 1: Handlebars Leak**
```bash
grep "PREVIEW ONLY }}" artifacts/notice_only/_reports/pdf-audit.md
```
**Expected**: No matches (}} leak should be gone)

**Check 2: Property Fields**
```bash
grep "Property: ," artifacts/notice_only/_reports/pdf-audit.md | grep section_8
```
**Expected**: No matches

---

### ✅ Scotland Notice to Leave (Was 5 critical → Should be 0)

**Check 1: Handlebars Leak**
```bash
grep "}}" artifacts/notice_only/_reports/pdf-audit.md | grep scotland
```
**Expected**: No matches

**Check 2: Arrears Fields**
```bash
grep "Total arrears: £ as of" artifacts/notice_only/_reports/pdf-audit.md
```
**Expected**: No matches (should show "£3000 as of 16/12/2025")

---

### ✅ Wales Fault-Based (Was 7 critical → Should be 0)

**Check 1: Raw Enum Display**
```bash
grep "rent_arrears Particulars" artifacts/notice_only/_reports/pdf-audit.md
```
**Expected**: No matches (should show "Rent Arrears")

**Check 2: Jurisdiction Contamination**
```bash
grep "Housing Act 1988" artifacts/notice_only/_reports/pdf-audit.md | grep wales
```
**Expected**: No matches (should show "Renting Homes (Wales) Act 2016")

**Check 3: Section 21 Contamination**
```bash
grep "Section 21" artifacts/notice_only/_reports/pdf-audit.md | grep wales
```
**Expected**: No matches

---

### ✅ Wales Section 173 (Was 5 critical → Should be 0)

**Check 1: Handlebars Leak**
```bash
grep "}}" artifacts/notice_only/_reports/pdf-audit.md | grep section_173
```
**Expected**: No matches

**Check 2: Jurisdiction Contamination**
```bash
grep "Housing Act 1988\|Section 21" artifacts/notice_only/_reports/pdf-audit.md | grep section_173
```
**Expected**: No matches

---

## Step 5: Compare Before/After

View the improvement:

```bash
# Before (old audit with 29 critical issues)
git show 9260137:artifacts/notice_only/_reports/pdf-audit.md | grep "Critical Issues:"

# After (new audit should show 0 critical)
grep "Critical Issues:" artifacts/notice_only/_reports/pdf-audit.md
```

**Expected**:
- Before: `**Critical Issues:** 29`
- After: `**Critical Issues:** 0`

---

## Step 6: Manual Spot Check (Optional)

Open PDFs and verify visually:

```bash
# England Section 21
open artifacts/notice_only/england/section_21.pdf

# Check for:
# ✅ "The first anniversary is: 01/06/2021" (not ****)
# ✅ "Property: 123 Test Street, London, SW1A 1AA" (not empty)
# ✅ "Service Requirements: Housing Act 1988, Section 21" (not "Section 8 or Section 21")
```

---

## Success Criteria

### Must Pass ✅
- [ ] E2E test: 5/5 routes passed
- [ ] Audit: Critical Issues = 0
- [ ] No `}}` handlebars leaks in any PDF
- [ ] No empty property fields (`Property: , ,`)
- [ ] No placeholder dates (`****` or `£ as of`)
- [ ] No raw enums (`rent_arrears` should be "Rent Arrears")
- [ ] Wales PDFs show ONLY Wales legislation (no Housing Act 1988, no Section 21)
- [ ] England Section 21 shows ONLY Section 21 (no Section 8 mentions)

### Acceptable ℹ️
- [ ] 1 warning about "Ground 8 with £0 arrears" (test data artifact, OK in preview mode)
- [ ] Minor formatting differences from original (as long as legally valid)

---

## If Issues Found

### Issue: Still seeing critical errors after regeneration

**Diagnosis**:
```bash
# Check which fixes were applied
git log --oneline --grep="FIX:" -5

# Verify you're on the correct branch
git branch --show-current  # Should show: claude/fix-notice-only-pdf-4EWfv
```

**Solution**:
1. Ensure you pulled latest changes: `git pull origin claude/fix-notice-only-pdf-4EWfv`
2. Check which specific issue remains in the audit report
3. Review `FIXES_SUMMARY.md` for the corresponding fix
4. Verify the fix was applied to the correct template/mapper file

---

### Issue: E2E test fails to create cases

**Diagnosis**:
```bash
# Check Supabase connection
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Solution**:
1. Verify credentials are correct
2. Check Supabase project is running
3. Verify `cases` table exists with correct schema

---

### Issue: PDFs generated but audit still shows old issues

**Diagnosis**:
```bash
# Verify PDFs are new (timestamp should be recent)
ls -lh artifacts/notice_only/england/
stat artifacts/notice_only/england/section_21.pdf
```

**Solution**:
1. If timestamps are old, PDFs weren't regenerated - check E2E output
2. If timestamps are new but issues persist, check git to ensure fixes are committed
3. Review specific template that's failing in `config/jurisdictions/`

---

## Final Checklist

After successful verification:

- [ ] E2E test: ✅ 5/5 passed
- [ ] Audit: ✅ 0 critical issues
- [ ] Spot check: ✅ PDFs look correct
- [ ] Committed: ✅ All fixes in git
- [ ] Documented: ✅ `FIXES_SUMMARY.md` accurate
- [ ] Branch pushed: ✅ `claude/fix-notice-only-pdf-4EWfv`

**Ready to merge!** 🎉

---

## Troubleshooting Contact

If you encounter unexpected issues:

1. Check `FIXES_SUMMARY.md` for detailed fix explanations
2. Review audit report: `artifacts/notice_only/_reports/pdf-audit.md`
3. Check recent commits: `git log --oneline -10`
4. Verify branch: `git diff main...claude/fix-notice-only-pdf-4EWfv`

---

## Quick Reference: Expected Metrics

| Metric | Before Fixes | After Fixes | Status |
|--------|--------------|-------------|--------|
| PDF Extraction Success | 0/5 (broken) | 5/5 | ✅ Fixed (Part A) |
| Critical Issues | 29 | 0 | ⏳ Verify (Part C) |
| Warnings | 1 | 0-1 | ℹ️ Acceptable |
| Template Leaks (`}}`) | 5 PDFs | 0 PDFs | ⏳ Verify |
| Empty Fields | 14 instances | 0 instances | ⏳ Verify |
| Contamination | 5 instances | 0 instances | ⏳ Verify |
| Missing Dates | 5 instances | 0 instances | ⏳ Verify |

---

**Time Estimate**: 5-10 minutes (assuming Supabase is configured)
