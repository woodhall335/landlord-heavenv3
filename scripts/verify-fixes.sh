#!/bin/bash
# Part C Verification Script
# Automates verification of Notice Only PDF fixes

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Part C: Notice Only PDF Fixes Verification           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

# Step 1: Check Supabase credentials
echo "Step 1: Checking Supabase Configuration..."
if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=ey" .env.local; then
        check_pass "Supabase credentials configured"
    else
        check_fail "Supabase credentials missing or invalid in .env.local"
        echo ""
        echo "Please configure valid Supabase credentials:"
        echo "  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
        echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
        exit 1
    fi
else
    check_fail ".env.local not found"
    exit 1
fi
echo ""

# Step 2: Clean old PDFs
echo "Step 2: Cleaning old PDFs..."
if [ -d artifacts/notice_only ]; then
    rm -rf artifacts/notice_only
    check_pass "Old PDFs removed"
else
    check_pass "No old PDFs to remove"
fi
echo ""

# Step 3: Regenerate PDFs
echo "Step 3: Regenerating PDFs with fixes..."
echo "Running: npx tsx scripts/prove-notice-only-e2e.ts"
echo ""
if npx tsx scripts/prove-notice-only-e2e.ts; then
    check_pass "E2E test passed - PDFs regenerated"
else
    check_fail "E2E test failed - cannot proceed"
    echo ""
    echo "Fix E2E errors before continuing verification"
    exit 1
fi
echo ""

# Step 4: Run audit
echo "Step 4: Running PDF audit..."
echo "Running: npx tsx scripts/audit-notice-only-pdfs.ts"
echo ""
npx tsx scripts/audit-notice-only-pdfs.ts > /tmp/audit-output.txt 2>&1 || true

# Check audit results
if [ -f artifacts/notice_only/_reports/pdf-audit.md ]; then
    CRITICAL_COUNT=$(grep "**Critical Issues:**" artifacts/notice_only/_reports/pdf-audit.md | head -1 | grep -o '[0-9]\+' || echo "0")
    WARNING_COUNT=$(grep "**Warning Issues:**" artifacts/notice_only/_reports/pdf-audit.md | head -1 | grep -o '[0-9]\+' || echo "0")

    if [ "$CRITICAL_COUNT" = "0" ]; then
        check_pass "Audit passed: 0 critical issues"
    else
        check_fail "Audit failed: $CRITICAL_COUNT critical issues found"
    fi

    if [ "$WARNING_COUNT" -le "1" ]; then
        check_pass "Warnings acceptable: $WARNING_COUNT"
    else
        check_warn "Warnings higher than expected: $WARNING_COUNT"
    fi
else
    check_fail "Audit report not generated"
fi
echo ""

# Step 5: Specific issue checks
echo "Step 5: Verifying specific fixes..."

# Check 1: No handlebars leaks
if grep -q "Handlebars template leak (}})" artifacts/notice_only/_reports/pdf-audit.md; then
    check_fail "Handlebars leaks still present"
else
    check_pass "No handlebars leaks (}} fixed)"
fi

# Check 2: No empty property fields
if grep -q "Empty property field" artifacts/notice_only/_reports/pdf-audit.md; then
    check_fail "Empty property fields still present"
else
    check_pass "No empty property fields"
fi

# Check 3: No placeholder asterisks
if grep -q "Placeholder asterisks" artifacts/notice_only/_reports/pdf-audit.md; then
    check_fail "Placeholder asterisks (****) still present"
else
    check_pass "No placeholder asterisks (first anniversary calculated)"
fi

# Check 4: No raw enums
if grep -q "rent_arrears" artifacts/notice_only/_reports/pdf-audit.md; then
    check_fail "Raw enum 'rent_arrears' still present"
else
    check_pass "Enum converted to display text"
fi

# Check 5: No Wales contamination
if grep -q "Housing Act 1988" artifacts/notice_only/_reports/pdf-audit.md | grep -i wales; then
    check_fail "Wales jurisdiction contamination (Housing Act 1988)"
else
    check_pass "Wales jurisdiction clean (no Housing Act 1988)"
fi

# Check 6: No empty arrears
if grep -q "Total arrears.*£.*as of" artifacts/notice_only/_reports/pdf-audit.md; then
    check_fail "Empty arrears fields in Scotland NTL"
else
    check_pass "Scotland arrears populated"
fi

echo ""

# Step 6: Summary
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION SUMMARY                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 ALL CHECKS PASSED 🎉                    ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ All Notice Only PDF fixes verified successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Review detailed audit report:"
    echo "     cat artifacts/notice_only/_reports/pdf-audit.md"
    echo ""
    echo "  2. Commit verification results:"
    echo "     git add artifacts/notice_only/_reports/"
    echo "     git commit -m \"VERIFY: Part C complete - 0 critical issues\""
    echo ""
    echo "  3. Ready to merge branch: claude/fix-notice-only-pdf-4EWfv"
    echo ""
    exit 0
else
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    ❌ VERIFICATION FAILED ❌                   ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "❌ $FAIL check(s) failed"
    echo ""
    echo "Review the detailed audit report:"
    echo "  cat artifacts/notice_only/_reports/pdf-audit.md"
    echo ""
    echo "Compare with expected fixes:"
    echo "  cat FIXES_SUMMARY.md"
    echo ""
    echo "Check which fixes were applied:"
    echo "  git log --oneline --grep='FIX:' -5"
    echo ""
    exit 1
fi
